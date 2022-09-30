import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export async function addOccupation(req: any, res: any) {
    try {
        if (req?.body?.occupation) {
            const occupationResult = await vaasPgQuery(`SELECT * FROM occupations WHERE occupation = '${req?.body?.occupation}'`, [], cachingType.StandardCache)
            if (occupationResult?.queryResponse.length === 0) {
                const occupation_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const occupation = req?.body?.occupation == undefined ? null : req?.body?.occupation;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO occupations (occupation_id, occupation, status, created_by, updated_by) VALUES ('${occupation_id}','${occupation}','${status}','${adminID}' ,'${adminID}')`;
                const executeOccupation = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeOccupation) {
                    return res.status(200).json({
                        status: true,
                        message: "Occupation Added Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Occupation Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Occupation  field is mandatory',
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

export async function getOccupation(req: any, res: any) {
    try {
        const getQuery = `SELECT occupation_id, occupation, status, created_by, updated_by, deleted_at FROM occupations WHERE deleted_at is NULL `;
        const occupationData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (occupationData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Occupation Data Listed Successfully",
                data: occupationData.queryResponse,
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

export async function updateOccupation(req: any, res: any) {
    try {
        if (req?.params?.occupation_id) {
            const adminID = req[`adminData`][`admin_id`];
            const occupation = req?.body?.occupation == undefined ? null : req?.body?.occupation;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE occupations
        SET  occupation = '${occupation}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE occupation_id = '${req?.params?.occupation_id}'`;
            const occupationUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (occupationUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Occupation Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Occupation not exist',
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

export async function getOccupationById(req: any, res: any) {
    try {
        if (req?.params?.occupation_id) {
            const getQuery = `SELECT occupation_id, occupation, status, created_by, updated_by FROM occupations WHERE occupation_id ='${req?.params?.occupation_id}'`;
            const dataOccupation = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (dataOccupation.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Occupation Data Listed Successfully",
                    data: dataOccupation.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Occupation not exist',
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

export async function deleteOccupation(req: any, res: any) {
    try {
        if (req?.params?.occupation_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE occupations
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE occupation_id = '${req?.params?.occupation_id}'`;
            const occupationDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (occupationDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Occupation Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Occupation not exist',
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