import dotenv, { DotenvConfigOptions } from 'dotenv';
import { resolve } from 'path';

let envFile = '';
const environment = process.env.NODE_ENV;
console.log("🚀 ~ file: aenv.ts ~ line 7 ~ environment", environment);

envFile = environment ? resolve(__dirname, `./environments/.${environment}.env`) : resolve(__dirname, `./environments/.env`);

console.log({ envFile })

const dotenvConfig: DotenvConfigOptions = { path: envFile, debug: true };
const env = dotenv.config(dotenvConfig);

export { env };

