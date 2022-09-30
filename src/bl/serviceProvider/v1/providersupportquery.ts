import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export async function createQuery(req: any, res: any) {
    try {
        if (req?.body?.query) {
            const queryResult = await vaasPgQuery(`SELECT * FROM queries WHERE query = '${req?.body?.query}'`, [], cachingType.StandardCache)
            if (queryResult?.queryResponse.length === 0) {
                const providerID = req[`serviceProviderData`][`provider_id`];
                const query_id = uuidv4();
                const type_id = req?.body?.type_id == undefined ? null : req?.body?.type_id;
                const reason_id = req?.body?.reason_id == undefined ? null : req?.body?.reason_id;
                const query = req?.body?.query == undefined ? null : req?.body?.query;
                const query_description = req?.body?.query_description == undefined ? null : req?.body?.query_description;
                const query_attachment = req?.body?.query_attachment == undefined ? null : req?.body?.query_attachment;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO queries  ( query_id,
                                                            type_id,
                                                            reason_id, 
                                                            query, 
                                                            query_description, 
                                                            query_attachment, 
                                                            status, 
                                                            created_by ) 
                                                    VALUES ('${query_id}',
                                                            '${type_id}',
                                                            '${reason_id}',
                                                            '${query}',
                                                            '${query_description}',
                                                            '${query_attachment}',
                                                            '${status}',
                                                            '${providerID}')`;
                const executeQuery = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeQuery) {
                    return res.status(200).json({
                        status: true,
                        message: "Query  Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Query  Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Query  field is mandatory',
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

export async function listQuery(req: any, res: any) {
    try {
        const queryStatus = (req?.params?.status)
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




