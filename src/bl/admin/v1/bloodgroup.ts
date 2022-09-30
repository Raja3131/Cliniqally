import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export async function addBloodGroup(req: any, res: any) {
    try {
        if (req?.body?.blood_group) {
            const bloodGroupResult = await vaasPgQuery(`SELECT * FROM blood_groups WHERE blood_group = '${req?.body?.blood_group}'`, [], cachingType.StandardCache)
            if (bloodGroupResult?.queryResponse.length === 0) {
                const group_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const blood_group = req?.body?.blood_group == undefined ? null : req?.body?.blood_group;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO blood_groups (group_id, blood_group, status, created_by, updated_by) VALUES ('${group_id}','${blood_group}','${status}','${adminID}' ,'${adminID}')`;
                const executeBloodGroup = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeBloodGroup) {
                    return res.status(200).json({
                        status: true,
                        message: "Blood Group Added Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Blood Group Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Blood Group  field is mandatory',
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

export async function getBloodGroup(req: any, res: any) {
    try {
        const getQuery = `SELECT group_id, blood_group, status, created_by, updated_by, deleted_at FROM blood_groups WHERE deleted_at is NULL `;
        const bloodGroupData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (bloodGroupData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Blood Group Data Listed Successfully",
                data: bloodGroupData.queryResponse,
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

export async function updateBloodGroup(req: any, res: any) {
    try {
        if (req?.params?.group_id) {
            const adminID = req[`adminData`][`admin_id`];
            const blood_group = req?.body?.blood_group == undefined ? null : req?.body?.blood_group;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE blood_groups
        SET  blood_group = '${blood_group}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE group_id = '${req?.params?.group_id}'`;
            const bloodGroupUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (bloodGroupUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Blood Group Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Blood Group not exist',
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

export async function getBloodGroupById(req: any, res: any) {
    try {
        if (req?.params?.group_id) {
            const getQuery = `SELECT group_id, blood_group, status, created_by, updated_by FROM blood_groups WHERE group_id ='${req?.params?.group_id}'`;
            const dataBloodGroup = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (dataBloodGroup.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Blood Group Data Listed Successfully",
                    data: dataBloodGroup.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Blood Group not exist',
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

export async function deleteBloodGroup(req: any, res: any) {
    try {
        if (req?.params?.group_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE blood_groups
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE group_id = '${req?.params?.group_id}'`;
            const bloodGroupDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (bloodGroupDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Blood Group Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Blood Group not exist',
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