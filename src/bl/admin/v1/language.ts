import { v4 as uuidv4 } from "uuid";
import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";

export async function createLanguage(req: any, res: any) {
  try {
    if (req?.body?.name) {
      const query = `SELECT * FROM languages WHERE lang_name = '${req?.body?.name}'`;
      const lang = await vaasPgQuery(query, [], cachingType.NoCache);
      if (lang?.queryResponse.length === 0) {
        const lang_id = uuidv4();
        const adminID = req[`adminData`][`admin_id`];
        const name = req?.body?.name == undefined ? null : req?.body?.name;
        const insertQuery = `INSERT INTO languages (lang_id,lang_name,status,created_by) VALUES ('${lang_id}','${name}','true','${adminID}')`;
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
          message: "language Already Exist",
          data: [],
        });
      }
    } else {
      res.status(200).json({
        status: false,
        message: "Name  field is mandatory",
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

export async function updateLanguage(req: any, res: any) {
  try {
    if (req?.params?.lang_id) {
      const adminID = req[`adminData`][`admin_id`];
      const name = req?.body?.name == undefined ? null : req?.body?.name;
      const status = req?.body?.status == undefined ? null : req?.body?.status;
      const query = `SELECT * FROM languages WHERE lang_name = '${req?.body?.name}' AND status = 'true'`;
      const lang = await vaasPgQuery(query, [], cachingType.NoCache);
      if (lang?.queryResponse.length === 0) {
        const updateQuery = `UPDATE languages
        SET  lang_name = '${name}', status = '${status}', updated_by = '${adminID}'
        WHERE lang_id = '${req?.params?.lang_id}'`;
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
          message: "Language already exist",
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

export async function deleteLanguage(req: any, res: any) {
  try {
    if (req?.params?.lang_id) {
      const adminID = req[`adminData`][`admin_id`];
      const deleted_at = new Date().toISOString();
      const updateQuery = `UPDATE languages
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}',status = false
        WHERE lang_id = '${req?.params?.lang_id}'`;
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
        message: "lang id required",
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

export async function getLanguages(req: any, res: any) {
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
    const data = `SELECT lang_id, lang_name, status, count(*) OVER() as total_rows FROM languages ORDER BY id LIMIT ${pageSize} OFFSET ${offset}`
    const dbResponse = await (await vaasPgQuery(data, [], cachingType.StandardCache)).queryResponse;
    const queryResponse = dbResponse?.map((response: any) => {
      return {
        'lang_id': response.lang_id,
        'lang_name': response.lang_name,
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
    res.status(200).json({
      status: false,
      message: "Error",
      error: err,
    });
  }
}
export async function getLanguageById(req: any, res: any) {
  try {
    if (req?.params?.lang_id) {
      const getQuery = `SELECT lang_id, lang_name, status, created_by, updated_by FROM languages WHERE lang_id ='${req?.params?.lang_id}'`;
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
