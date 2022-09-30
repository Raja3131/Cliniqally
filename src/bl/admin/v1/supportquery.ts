import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export async function createQueryType(req: any, res: any) {
    try {
        if (req?.body?.query_type) {
            const queryResult = await vaasPgQuery(`SELECT * FROM type_queries WHERE query_type = '${req?.body?.query_type}'`, [], cachingType.StandardCache)
            if (queryResult?.queryResponse.length === 0) {
                const type_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const query_type = req?.body?.query_type == undefined ? null : req?.body?.query_type;
                const insertQuery = `INSERT INTO type_queries (type_id,query_type, created_by, updated_by) VALUES ('${type_id}','${query_type}','${adminID}' ,'${adminID}')`;
                const executeQuery = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeQuery) {
                    return res.status(200).json({
                        status: true,
                        message: "Query Type Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Query Type Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query type  field is mandatory',
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

export async function getQueryType(req: any, res: any) {
    try {
        const getQuery = `SELECT type_id, query_type, created_by, updated_by, deleted_at FROM type_queries WHERE deleted_at is NULL `;
        const queryData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (queryData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Query Type Listed Successfully",
                data: queryData.queryResponse,
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

export async function getQueryTypeById(req: any, res: any) {
    try {
        if (req?.params?.type_id) {
            const getQuery = `SELECT type_id, query_type, created_by, updated_by FROM type_queries WHERE type_id ='${req?.params?.type_id}'`;
            const dataQueryType = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (dataQueryType.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Query Type Listed Successfully",
                    data: dataQueryType.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query Type not exist',
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

export async function deleteQueryType(req: any, res: any) {
    try {
        if (req?.params?.type_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE type_queries
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE type_id = '${req?.params?.type_id}'`;
            const queryTypeDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (queryTypeDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Query Type Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query Type not exist',
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


export async function createQueryReason(req: any, res: any) {
    try {
        if (req?.body?.query_reason) {
            const queryResult = await vaasPgQuery(`SELECT * FROM reason_queries WHERE query_reason = '${req?.body?.query_reason}'`, [], cachingType.StandardCache)
            if (queryResult?.queryResponse.length === 0) {
                const reason_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const query_reason = req?.body?.query_reason == undefined ? null : req?.body?.query_reason;
                const type_id = req?.body?.type_id == undefined ? null : req?.body?.type_id;
                const insertQuery = `INSERT INTO reason_queries (reason_id, query_reason, type_id, created_by, updated_by) VALUES ('${reason_id}','${query_reason}','${type_id}','${adminID}' ,'${adminID}')`;
                const executeQuery = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeQuery) {
                    return res.status(200).json({
                        status: true,
                        message: "Query Reason Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Query Reason Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query Reason  field is mandatory',
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

export async function getQueryReason(req: any, res: any) {
    try {
        const getQuery = `SELECT reason_id, query_reason, type_id, created_by, updated_by, deleted_at FROM reason_queries WHERE deleted_at is NULL `;
        const queryData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (queryData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Query Reason Listed Successfully",
                data: queryData.queryResponse,
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

export async function getQueryReasonById(req: any, res: any) {
    try {
        if (req?.params?.reason_id) {
            const getQuery = `SELECT reason_id, query_reason, type_id, created_by, updated_by FROM reason_queries WHERE reason_id ='${req?.params?.reason_id}'`;
            const dataQueryReason = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (dataQueryReason.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Query Reason Listed Successfully",
                    data: dataQueryReason.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query Reason not exist',
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

export async function deleteQueryReason(req: any, res: any) {
    try {
        if (req?.params?.reason_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE reason_queries
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE reason_id = '${req?.params?.reason_id}'`;
            const queryTypeDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (queryTypeDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Query Reason Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query Reason not exist',
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

export async function listQuery(req: any, res: any) {
    try {
        const queryStatus = req.params.status
        if (queryStatus == 'active') {
            const data = `SELECT * FROM queries WHERE status = 'active'`;
            const result = await vaasPgQuery(data, [], cachingType.NoCache);
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "listed Successfully",
                    data: [result],
                });
            }
        } else if (queryStatus == 'closed') {
            const data = `SELECT * FROM queries WHERE status = 'closed'`;
            const result = await vaasPgQuery(data, [], cachingType.NoCache);
            if (result) {
                return res.status(200).json({
                    status: true,
                    message: "listed Successfully",
                    data: [result],
                });
            }
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

export async function getQueryById(req: any, res: any) {
    try {
        if (req?.params?.query_id) {
            const data = `SELECT * FROM queries WHERE query_id ='${req?.params?.query_id}'`;
            const queryData = await vaasPgQuery(data, [], cachingType.StandardCache)
            if (queryData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Query Data Listed Successfully",
                    data: queryData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query not exist',
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