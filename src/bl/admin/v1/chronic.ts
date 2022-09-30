import { v4 as uuidv4 } from "uuid";
import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";


export async function createChronic(req: any, res: any) {
  try {
    if (req?.body?.name) {
      const query = `SELECT * FROM chronic_illness WHERE name = '${req?.body?.name}'`;
      const chronic = await vaasPgQuery(query, [], cachingType.NoCache);
      if (chronic?.queryResponse.length === 0) {
        const chronic_id = uuidv4();
        const adminID = req[`adminData`][`admin_id`];
        const name = req?.body?.name == undefined ? null : req?.body?.name;
        const description = req?.body?.description == undefined ? null : req?.body?.description;
        const insertQuery = `INSERT INTO chronic_illness (chronic_id,name,status,created_by,description) VALUES ('${chronic_id}','${name}','true','${adminID}','${description}')`;
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

export async function updateChronic(req: any, res: any) {
  try {
    if (req?.params?.chronic_id) {
      const adminID = req[`adminData`][`admin_id`];
      const name = req?.body?.name == undefined ? null : req?.body?.name;
      const description = req?.body?.description == undefined ? null : req?.body?.description;
      const status = req?.body?.status == undefined ? null : req?.body?.status;
      const updateQuery = `UPDATE chronic_illness
          SET  name = '${name}',description = '${description}', status = '${status}', updated_by = '${adminID}'
          WHERE chronic_id = '${req?.params?.chronic_id}'`;
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

export async function getChronicById(req: any, res: any) {
  try {
    if (req?.params?.chronic_id) {
      const getQuery = `SELECT chronic_id,name,description,status, created_by, updated_by FROM chronic_illness WHERE chronic_id ='${req?.params?.chronic_id}'`;
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

export async function deleteChronic(req: any, res: any) {
  try {
    if (req?.params?.chronic_id) {
      const adminID = req[`adminData`][`admin_id`];
      const deleted_at = new Date().toISOString();
      const updateQuery = `UPDATE chronic_illness
          SET deleted_by = '${adminID}',deleted_at = '${deleted_at}',status = false
          WHERE chronic_id = '${req?.params?.chronic_id}'`;
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

export async function getChronic(req: any, res: any) {
  try {
    const data = `SELECT * FROM chronic_illness WHERE status = 'true'`;
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
