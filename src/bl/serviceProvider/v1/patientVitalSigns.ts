import { Request, Response } from "express";
import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";
import { v4 as uuidv4 } from "uuid";

export async function createVitalSigns(req: Request, res: Response) {
  const patient_id = req.body.patient_id;
  const bp = req?.body?.bp == undefined ? null : req?.body?.bp;
  const weight = req?.body?.weight == undefined ? null : req?.body?.weight;
  const height = req?.body?.height == undefined ? null : req?.body?.height;
  const temperature =
    req?.body?.temperature == undefined ? null : req?.body?.temperature;
  const pulse = req?.body?.pulse == undefined ? null : req?.body?.pulse;
  const respiratory_rate =
    req?.body?.respiratory_rate == undefined
      ? null
      : req?.body?.respiratory_rate;
  try {
    const insertQuery = `INSERT INTO patient_vital_signs(patient_id,bp,weight,height,temperature,pulse,respiratory_rate) VALUES('${patient_id}','${bp}','${weight}','${height}','${temperature}','${pulse}','${respiratory_rate}')`;
    if (insertQuery?.length > 0) {
      const result = await vaasPgQuery(
        insertQuery,
        [],
        cachingType.StandardCache
      );
      res.status(200).json({
        status: "success",
        message: "Vital signs created successfully",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server",
      data: error,
    });
  }
}
export async function getVitalSignsByPatientId(req: Request, res: Response) {
  const patient_id =
    req?.params?.patient_id == undefined ? null : req?.params?.patient_id;
  try {
    const selectQuery = `SELECT * FROM patient_vital_signs WHERE patient_id='${patient_id}'`;
    if (selectQuery?.length > 0) {
      const result = await vaasPgQuery(
        selectQuery,
        [],
        cachingType.StandardCache
      );
      res.status(200).json({
        status: "success",
        message: "Vital signs fetched successfully",
        data: result,
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "Vital signs not found",
        data: [],
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server",
      data: error,
    });
  }
}

export async function updateVitalSigns(req: Request, res: Response) {
  const patient_id =
    req?.params?.patient_id == undefined ? null : req?.params?.patient_id;
  const bp = req?.body?.bp == undefined ? null : req?.body?.bp;
  const weight = req?.body?.weight == undefined ? null : req?.body?.weight;
  const height = req?.body?.height == undefined ? null : req?.body?.height;
  const temperature =
    req?.body?.temperature == undefined ? null : req?.body?.temperature;
  const pulse = req?.body?.pulse == undefined ? null : req?.body?.pulse;
  const respiratory_rate =
    req?.body?.respiratory_rate == undefined
      ? null
      : req?.body?.respiratory_rate;
  try {
    const updateQuery = `UPDATE patient_vital_signs SET bp='${bp}',weight='${weight}',height='${height}',temperature='${temperature}',pulse='${pulse}',respiratory_rate='${respiratory_rate}' WHERE patient_id='${patient_id}'`;
    if (updateQuery?.length > 0) {
      const result = await vaasPgQuery(
        updateQuery,
        [],
        cachingType.StandardCache
      );
      res.status(200).json({
        status: "success",
        message: "Vital signs updated successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Vital signs not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server",
      data: error,
    });
  }
}

export async function deleteVitalSigns(req: Request, res: Response) {
  const patient_id =
    req?.params?.patient_id == undefined ? null : req?.params?.patient_id;
  try {
    const deleteQuery = `DELETE FROM patient_vital_signs WHERE patient_id='${patient_id}'`;
    if (deleteQuery?.length != 0) {
      const result = await vaasPgQuery(
        deleteQuery,
        [],
        cachingType.StandardCache
      );
      res.status(200).json({
        status: "success",
        message: "Vital signs deleted successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Vital signs not found",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Internal Server",
      data: error,
    });
  }
}
