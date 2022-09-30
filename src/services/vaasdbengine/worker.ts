import Redis from "ioredis";
import mongoose from 'mongoose';
import migrationRunner, { RunnerOption } from 'node-pg-migrate';
import path from 'path';
import { Pool, PoolClient, PoolConfig } from 'pg';
import { hasher, VaasPgQueryResponseInterface } from "./helpers";

const connectionParameters: PoolConfig = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};
const pool = new Pool(connectionParameters);
const redis = new Redis({
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: Number(process.env.REDIS_DB),
});
const mongoUrl = String(process.env.MongoUrl);
let cache: boolean = Boolean(process.env.REDIS_CACHE_ENABLED) || true;

//postgres sql connection
pool.on('error', (err, client: PoolClient) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1);
});

// redis connection
redis.on("connect", (stream) => {
    console.log('Ah, Redis server connected!');
});

redis.on('error', (err) => {
    console.log('Redis Client Error', err);
    cache = false;
});

// mongo connection
// useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true,
const mongoConnectObject = mongoose.connect(mongoUrl);
mongoConnectObject.then(
    () => {
        console.log(`Connected to mongo db server`);
        // initApp();
    },
    (err) => {
        console.log(err);
    },
);

async function getQueryCache(key: string) {
    return new Promise((resolve, reject) => {
        redis.get('postgres:' + key, function (err, result) {
            console.log(err, result);

            if (err || !result) {
                reject(err);
            } else {
                console.log("🚀 ~ file: worker.ts ~ line 67 ~ result", result);
                resolve(JSON.parse(result));
            }
        });
    });
}

async function setQueryCache(key: string, seconds: number, data: string) {
    console.log("🚀 ~ file: worker.ts ~ line 74 ~ setQueryCache ~ data", data);
    console.log("🚀 ~ file: worker.ts ~ line 74 ~ setQueryCache ~ key", key);

    return new Promise((resolve, reject) => {
        redis.setex('postgres:' + key, seconds, data, function (err, result) {
            err || !result ? reject(err) : resolve(result);
        });
    });
}

export async function getVaasPgClient(callback: any) {
    pool.connect((err, client, done) => {
        console.log('pool.totalCount', pool.totalCount);
        console.log('pool.idleCount', pool.idleCount);
        console.log('pool.waitingCount', pool.waitingCount);
        callback(err, client, done);
    })
}

export const upMigrations = async () => {
    const databaseUrl = String(process?.env?.DATABASE_URL);
    const options: RunnerOption = {
        databaseUrl,
        dir: path.resolve(__dirname, "../../migrations"),
        migrationsTable: 'pgmigrations',
        direction: 'up',
        count: Infinity,
    };
    console.log("🚀 ~ file: worker.ts ~ line 96 ~ upMigrations ~ options", options);
    try {
        console.log("Running migrations");
        const migrations = await migrationRunner(options);
        console.log("🚀 ~ file: worker.ts ~ line 106 ~ upMigrations ~ migrations", migrations);
    } catch (e) {
        process.exit(1);
    }
}

// todo: Not working as of now. Need to retest
export const downMigrations = async () => {
    const databaseUrl = String(process?.env?.DATABASE_URL);
    const options: RunnerOption = {
        databaseUrl,
        dir: path.resolve(__dirname, "../../migrations"),
        migrationsTable: 'pgmigrations',
        direction: 'down',
        count: Infinity,
    };
    console.log("🚀 ~ file: worker.ts ~ line 116 ~ downMigrations ~ options", options);

    try {
        console.log("Running migrations");
        const migrations = await migrationRunner(options);
        console.log("🚀 ~ file: worker.ts ~ line 127 ~ downMigrations ~ migrations", migrations);
    } catch (e) {
        console.log("🚀 ~ file: worker.ts ~ line 129 ~ downMigrations ~ e", e);
        process.exit(1);
    }
}

/**
 * Execute a postgres query
 * @param {String}		queryString  	Querystring
 * @param {Array}		queryParameters 	Array of parameters for the query (empty array for none)
 * @param {Number}   	seconds    	Expiration of cache in seconds
 */
export function vaasPgQuery(queryString: string, queryParameters: any[] = [], seconds = 0): Promise<VaasPgQueryResponseInterface> {
    console.log("🚀 ~ file: worker.ts ~ line 141 ~ vaasPgQuery ~ queryString", queryString);
    const start = Date.now();
    return new Promise((resolve, reject) => {
        // If no time to live (seconds)  caching disabled
        if (typeof seconds !== 'number' || seconds < 1) {
            cache = false;
        }
        if (cache) {
            getQueryCache(hasher(queryString, queryParameters)).then((response) => {
                console.log("🚀 ~ file: worker.ts ~ line 149 ~ getQueryCache ~ response", response);
                const duration = Date.now() - start;
                resolve({ queryResponse: response, duration, cache });
            }, (err: any) => {
                console.log("🚀 ~ file: worker.ts ~ line 153 ~ getQueryCache ~ err", err);

                const pgQueryPromise = pgQuery(queryString, queryParameters, seconds);
                pgQueryPromise.then(
                    (response) => {
                        console.log("🚀 ~ file: worker.ts ~ line 159 ~ getQueryCache ~ response", response);
                        resolve(response);
                    },
                    (err: any) => {
                        console.log("🚀 ~ file: worker.ts ~ line 164 ~ getQueryCache ~ err", err);
                        reject(err);
                    },
                );
            });
        }
        else {
            const pgQueryPromise = pgQuery(queryString, queryParameters, seconds);
            pgQueryPromise.then(
                (response) => {
                    console.log("🚀 ~ file: worker.ts ~ line 172 ~ returnnewPromise ~ response", response);
                    resolve(response);
                },
                (err: any) => {
                    console.log("🚀 ~ file: worker.ts ~ line 177 ~ returnnewPromise ~ err", err);
                    reject(err);
                },
            );
        }
    });
}

async function pgQuery(queryString: string, queryParameters: any[], seconds: number): Promise<VaasPgQueryResponseInterface> {
    const start = Date.now();
    console.log('pool.totalCount', pool.totalCount);
    console.log('pool.idleCount', pool.idleCount);
    console.log('pool.waitingCount', pool.waitingCount);
    const hash = hasher(queryString, queryParameters);
    // promise - checkout a client
    return new Promise((resolve, reject) => {
        // callback - checkout a client
        pool.connect((err, client, done) => {
            if (err) {
                console.log("🚀 ~ file: worker.ts ~ line 254 ~ pool.connect ~ err", err);
                const duration = Date.now() - start
                reject({ err, duration });
            } else {
                client.query(queryString, queryParameters, async (queryError, queryResponse) => {
                    // console.log("🚀 ~ file: worker.ts ~ line 259 ~ client.query ~ queryResponse", queryResponse);
                    done();
                    const duration = Date.now() - start
                    if (queryError) {
                        console.log("🚀 ~ file: worker.ts ~ line 263 ~ client.query ~ queryError", queryError);
                        reject({ err, duration });
                    } else {
                        console.log("🚀 ~ file: index.ts ~ line 266 ~ client.query ~ cache", cache);
                        const QueryResponseString = JSON.stringify(queryResponse?.rows);
                        console.log("🚀 ~ file: index.ts ~ line 267 ~ client.query ~ QueryResponseString", QueryResponseString);
                        if (cache) {
                            await setQueryCache(hash, seconds, QueryResponseString).then((response) => {
                                console.log("🚀 ~ file: index.ts ~ line 270 ~ awaitsetQueryCache ~ response", response);
                                resolve({ queryResponse: queryResponse?.rows, duration, cache: false });
                            }, (err: any) => {
                                console.log("🚀 ~ file: index.ts ~ line 273 ~ awaitsetQueryCache ~ err", err);
                                resolve({ queryResponse: queryResponse?.rows, duration, cache: false });
                            });
                        } else {
                            resolve({ queryResponse: queryResponse?.rows, duration, cache: false });
                        }
                    }
                });
            }
        });
    });
}

export const getMongooseModel = (mongoosemodel: {
    Schema: any;
    key: string;
}, dynamicKey: string) => {
    return new Promise((resolve, reject) => {
        const hashedMongoModelKey = hasher(mongoosemodel.key, dynamicKey);
        getCachedMongoModel(hashedMongoModelKey).then((response) => {
            console.log("🚀 ~ file: worker.ts ~ line 290 ~ getQueryCache ~ response", response);
            resolve(response);
        }, (err: any) => {
            console.log("🚀 ~ file: worker.ts ~ line 295 ~ getQueryCache ~ err", err);
            resolve(createMongooseModel(mongoosemodel, dynamicKey));
        });
    })
};

const createMongooseModel = (mongoosemodel: {
    Schema: any;
    key: string;
}, dynamicKey: string) => {
    return mongoose.model(`sc_${dynamicKey}_${mongoosemodel.key}`, mongoosemodel.Schema);
}

async function getCachedMongoModel(key: string) {
    return new Promise((resolve, reject) => {
        redis.get('mongoModel:' + key, function (err, result) {
            if (err || !result) {
                reject(err);
            } else {
                console.log("🚀 ~ file: worker.ts ~ line 306 ~ result", result);
                resolve(JSON.parse(result));
            }
        });
    });
}


async function setCachedMongoModel(key: string, seconds: number, data: string) {
    console.log("🚀 ~ file: worker.ts ~ line 328 ~ setQueryCache ~ data", data);
    console.log("🚀 ~ file: worker.ts ~ line 328 ~ setQueryCache ~ key", key);

    return new Promise((resolve, reject) => {
        redis.setex('mongoModel:' + key, seconds, data, function (err, result) {
            err || !result ? reject(err) : resolve(result);
        });
    });
}
