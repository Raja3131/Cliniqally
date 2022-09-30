
import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';
// country 
export async function createCountry(req: any, res: any) {
    try {
        if (req?.body?.name) {
            const nameResult = await vaasPgQuery(`SELECT * FROM countries WHERE name = '${req?.body?.name}'`, [], cachingType.StandardCache)
            if (nameResult?.queryResponse.length === 0) {
                const country_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const name = req?.body?.name == undefined ? null : req?.body?.name;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO countries (country_id,name,status, created_by, updated_by) VALUES ('${country_id}','${name}','${status}','${adminID}' ,'${adminID}')`;
                const executeCountry = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeCountry) {
                    return res.status(200).json({
                        status: true,
                        message: "Country Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Country Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Name  field is mandatory',
                    data: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function getCountries(req: any, res: any) {
    try {
        const pageQuery = parseInt(String(req?.query?.pageNo), 0);
        const page = (pageQuery && pageQuery !== null && pageQuery > 0) ? pageQuery : 1;
        let pageSize = parseInt(String(req?.query?.pageSize));
        if (pageSize && pageSize !== null) {
            if (pageSize > 100) {
                pageSize = 100;
            } else if (pageSize < 5) {
                pageSize = 5;
            }
        } else {
            pageSize = 5;
        }
        const offset = (page - 1) * pageSize
        const data = `SELECT country_id, name, status, count(*) OVER() as total_rows FROM countries 
        WHERE deleted_at is NULL 
        ORDER BY id LIMIT ${pageSize} OFFSET ${offset} `
        const dbResponse = await (await vaasPgQuery(data, [], cachingType.StandardCache)).queryResponse;
        const queryResponse = dbResponse?.map((response: any) => {
            return {
                'country_id': response.country_id,
                'name': response.name,
                'status': response.status,
            }
        });
        const total_rows = dbResponse[0]?.total_rows;
        if (queryResponse) {
            return res.status(200).json({
                status: true,
                message: "listed Successfully",
                data: { "queryResponse": queryResponse, "totalRows": total_rows },
            });

        } else {
            return res.status(200).json({
                status: false,
                message: "error!",
                data: [],
            });
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function updateCountry(req: any, res: any) {
    try {
        if (req?.params?.country_id) {
            const adminID = req[`adminData`][`admin_id`];
            const name = req?.body?.name == undefined ? null : req?.body?.name;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE countries
        SET  name = '${name}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE country_id = '${req?.params?.country_id}'`;
            const countryUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (countryUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Country Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Country not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function getCountryById(req: any, res: any) {
    try {
        if (req?.params?.country_id) {
            const getQuery = `SELECT country_id, name, status, created_by, updated_by FROM countries WHERE country_id ='${req?.params?.country_id}'`;
            const countryData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (countryData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Country Data Listed Successfully",
                    data: countryData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Country not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function deleteCountry(req: any, res: any) {
    try {
        if (req?.params?.country_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE countries
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE country_id = '${req?.params?.country_id}'`;
            const countryDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (countryDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Country Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Country not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

// state 
export async function createState(req: any, res: any) {
    try {
        if (req?.body?.name) {
            const nameResult = await vaasPgQuery(`SELECT * FROM states WHERE name = '${req?.body?.name}'`, [], cachingType.StandardCache)
            if (nameResult?.queryResponse.length === 0) {
                const state_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const name = req?.body?.name == undefined ? null : req?.body?.name;
                const country = req?.body?.country == undefined ? null : req?.body?.country;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO states (state_id,name,country,status, created_by, updated_by) VALUES ('${state_id}','${name}','${country}','${status}','${adminID}' ,'${adminID}')`;
                const executeState = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeState) {
                    return res.status(200).json({
                        status: true,
                        message: "State Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'State Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Name  field is mandatory',
                    data: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function getStates(req: any, res: any) {
    try {
        const pageQuery = parseInt(String(req?.query?.pageNo), 0);
        const page = (pageQuery && pageQuery !== null && pageQuery > 0) ? pageQuery : 1;
        let pageSize = parseInt(String(req?.query?.pageSize));
        if (pageSize && pageSize !== null) {
            if (pageSize > 100) {
                pageSize = 100;
            } else if (pageSize < 5) {
                pageSize = 5;
            }
        } else {
            pageSize = 5;
        }
        const offset = (page - 1) * pageSize
        const data = `SELECT state_id, name, status, count(*) OVER() as total_rows FROM states 
        WHERE deleted_at is NULL 
        ORDER BY id LIMIT ${pageSize} OFFSET ${offset} `
        const dbResponse = await (await vaasPgQuery(data, [], cachingType.StandardCache)).queryResponse;
        const queryResponse = dbResponse?.map((response: any) => {
            return {
                'country_id': response.state_id,
                'name': response.name,
                'status': response.status,
            }
        });
        const total_rows = dbResponse[0]?.total_rows;
        if (queryResponse) {
            return res.status(200).json({
                status: true,
                message: "listed Successfully",
                data: { "queryResponse": queryResponse, "totalRows": total_rows },
            });

        } else {
            return res.status(200).json({
                status: false,
                message: "error!",
                data: [],
            });
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function updateState(req: any, res: any) {
    try {
        if (req?.params?.state_id) {
            const state_id = uuidv4();
            const adminID = req[`adminData`][`admin_id`];
            const name = req?.body?.name == undefined ? null : req?.body?.name;
            const country = req?.body?.country == undefined ? null : req?.body?.country;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE states
        SET state_id = '${state_id}', name = '${name}',country = '${country}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE state_id = '${req?.params?.state_id}'`;
            const stateUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (stateUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "State Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'State not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function getStateById(req: any, res: any) {
    try {
        if (req?.params?.state_id) {
            const getQuery = `SELECT state_id, name,country, status, created_by, updated_by FROM states WHERE state_id ='${req?.params?.state_id}'`;
            const statesData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (statesData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "State Data Listed Successfully",
                    data: statesData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'State not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function deleteState(req: any, res: any) {
    try {
        if (req?.params?.state_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE states
            SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE state_id = '${req?.params?.state_id}'`;
            const stateDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (stateDelete) {
                return res.status(200).json({
                    status: true,
                    message: "State Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'State not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

// city 
export async function createCity(req: any, res: any) {
    try {
        if (req?.body?.name) {
            const nameResult = await vaasPgQuery(`SELECT * FROM cities WHERE name = '${req?.body?.name}'`, [], cachingType.StandardCache)
            if (nameResult?.queryResponse.length === 0) {
                const city_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const name = req?.body?.name == undefined ? null : req?.body?.name;
                const country = req?.body?.country == undefined ? null : req?.body?.country;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO cities (city_id,name,country,status, created_by, updated_by) VALUES ('${city_id}','${name}','${country}','${status}','${adminID}' ,'${adminID}')`;
                const executeCity = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeCity) {
                    return res.status(200).json({
                        status: true,
                        message: "City Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'City Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Name  field is mandatory',
                    data: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function getCities(req: any, res: any) {
    try {
        const getQuery = `SELECT city_id, name,country, status, created_by, updated_by FROM cities WHERE deleted_at is NULL`;
        const cityData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (cityData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "City Data Listed Successfully",
                data: cityData.queryResponse,
            });
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function updateCity(req: any, res: any) {
    try {
        if (req?.params?.city_id) {
            const city_id = uuidv4();
            const adminID = req[`adminData`][`admin_id`];
            const name = req?.body?.name == undefined ? null : req?.body?.name;
            const country = req?.body?.country == undefined ? null : req?.body?.country;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE cities
        SET city_id = '${city_id}', name = '${name}',country = '${country}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE city_id = '${req?.params?.city_id}'`;
            const cityUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (cityUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "City Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'City not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function getCityById(req: any, res: any) {
    try {
        if (req?.params?.city_id) {
            const getQuery = `SELECT city_id, name,country, status, created_by, updated_by FROM cities WHERE city_id ='${req?.params?.city_id}'`;
            const cityData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (cityData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "City Data Listed Successfully",
                    data: cityData.queryResponse[0],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'City not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}

export async function deleteCity(req: any, res: any) {
    try {
        if (req?.params?.city_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE cities
            SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE city_id = '${req?.params?.city_id}'`;
            const cityDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (cityDelete) {
                return res.status(200).json({
                    status: true,
                    message: "City Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'City not exist',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}