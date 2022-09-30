import { v4 as uuidv4 } from "uuid";
import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";

export async function createAllergy(req: any, res: any) {
    try {
        if (req?.body?.name) {
            const query = `SELECT * FROM allergies WHERE name = '${req?.body?.name}'`;
            const allergy = await vaasPgQuery(query, [], cachingType.NoCache);
            if (allergy?.queryResponse.length === 0) {
                const allergic_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const name = req?.body?.name == undefined ? null : req?.body?.name;
                const description = req?.body?.description == undefined ? null : req?.body?.description;
                const insertQuery = `INSERT INTO allergies (allergic_id,name,status,created_by,description) VALUES ('${allergic_id}','${name}','true','${adminID}','${description}')`;
                const execute = await vaasPgQuery(insertQuery, [], cachingType.NoCache);
                if (execute) {
                    return res.status(200).json({
                        status: true,
                        message: "Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json({
                    status: false,
                    message: "Already Exist",
                    data: [],
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "Name field is mandatory",
                data: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}

export async function updateAllergy(req: any, res: any) {
    try {
        if (req?.params?.allergic_id) {
            const adminID = req[`adminData`][`admin_id`];
            const name = req?.body?.name == undefined ? null : req?.body?.name;
            const description = req?.body?.description == undefined ? null : req?.body?.description;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE allergies
          SET  name = '${name}',description = '${description}', status = '${status}', updated_by = '${adminID}'
          WHERE allergic_id = '${req?.params?.allergic_id}'`;
            const Update = await vaasPgQuery(updateQuery, [], cachingType.NoCache);
            if (Update) {
                return res.status(200).json({
                    status: true,
                    message: "Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "Not found",
                error: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}

export async function getAllergyById(req: any, res: any) {
    try {
        if (req?.params?.allergic_id) {
            const getQuery = `SELECT allergic_id,name,description,status, created_by, updated_by FROM allergies WHERE allergic_id ='${req?.params?.allergic_id}'`;
            const Data = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            if (Data.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Data Listed Successfully",
                    data: Data.queryResponse,
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "not exist!",
                error: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}

export async function deleteAllergy(req: any, res: any) {
    try {
        if (req?.params?.allergic_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE allergies
          SET deleted_by = '${adminID}',deleted_at = '${deleted_at}',status = false
          WHERE allergic_id = '${req?.params?.allergic_id}'`;
            const Delete = await vaasPgQuery(updateQuery, [], cachingType.NoCache);
            if (Delete) {
                return res.status(200).json({
                    status: true,
                    message: "deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "allergic_id required",
                error: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}

export async function getAllergies(req: any, res: any) {
    try {
        const data = `SELECT * FROM allergies WHERE status = 'true'`;
        const result = await vaasPgQuery(data, [], cachingType.NoCache);
        if (result) {
            return res.status(200).json({
                status: true,
                message: "listed Successfully",
                data: [result],
            });
        } else {
            return res.status(200).json({
                status: false,
                message: "error!",
                data: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}
