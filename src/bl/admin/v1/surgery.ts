import { v4 as uuidv4 } from "uuid";
import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";



export async function createSurgery(req: any, res: any) {
    try {
        if (req?.body?.name) {
            const query = `SELECT * FROM surgeries WHERE surgery_name = '${req?.body?.name}'`;
            const surgery = await vaasPgQuery(query, [], cachingType.NoCache);
            if (surgery?.queryResponse.length === 0) {
                const surgery_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const name = req?.body?.name == undefined ? null : req?.body?.name;
                const insertQuery = `INSERT INTO surgeries (surgery_id,surgery_name,status,created_by) VALUES ('${surgery_id}','${name}','true','${adminID}')`;
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

export async function updateSurgery(req: any, res: any) {
    try {
        if (req?.params?.surgery_id) {
            const adminID = req[`adminData`][`admin_id`];
            const name = req?.body?.name == undefined ? null : req?.body?.name;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const query = `SELECT * FROM surgeries WHERE surgery_name = '${req?.body?.name}' AND status = 'true'`;            
            const lang = await vaasPgQuery(query, [], cachingType.NoCache);
            if (lang?.queryResponse.length === 0) {
                const updateQuery = `UPDATE surgeries
          SET  surgery_name = '${name}', status = '${status}', updated_by = '${adminID}'
          WHERE surgery_id = '${req?.params?.surgery_id}'`;
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
                    message: "surgery already exist",
                    error: [],
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "Language not found",
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

export async function getSurgeryById(req: any, res: any) {
    try {
      if (req?.params?.surgery_id) {
        const getQuery = `SELECT surgery_id, surgery_name, status, created_by, updated_by FROM surgeries WHERE surgery_id ='${req?.params?.surgery_id}'`;
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
  
  export async function deleteSurgery(req: any, res: any) {
    try {
      if (req?.params?.surgery_id) {
        const adminID = req[`adminData`][`admin_id`];
        const deleted_at = new Date().toISOString();
        const updateQuery = `UPDATE surgeries
          SET deleted_by = '${adminID}',deleted_at = '${deleted_at}',status = false
          WHERE surgery_id = '${req?.params?.surgery_id}'`;
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
          message: "surgery id required",
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
  
  export async function getSurgeries(req: any, res: any) {
    try {
      const data = `SELECT * FROM surgeries WHERE status = 'true'`;
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
  