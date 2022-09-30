import mongoose from 'mongoose';
import { v4 as uuidv4 } from "uuid";

import { consultationInfo } from '../../../models/mongo';
import {
  cachingType, vaasPgQuery
} from "../../../services/vaasdbengine";


export async function consultation(req: any, res: any) {
  try {
    if (req[`serviceProviderData`][`default_clinic`] !== undefined && req[`serviceProviderData`][`default_clinic`] !== null) {
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const providerId = req[`serviceProviderData`][`provider_id`];
      const consultationId = uuidv4();
      const appointmentId = req?.body?.appointment_id == undefined ? null : req?.body?.appointment_id;
      const chiefComplaint = req?.body?.chief_complaint == undefined ? null : req?.body?.chief_complaint;
      //Check if consultation exist
      const selectConsultationQuery = `SELECT consultation_id FROM sc_${tableCenterId}_consultations WHERE appointment_id = '${appointmentId}'`;
      const selectConsultation = await vaasPgQuery(selectConsultationQuery, [], cachingType.NoCache);
      // Select consumer
      const selectConsumerQuery = `SELECT consumer_id FROM sc_${tableCenterId}_appointments WHERE appointment_id = '${appointmentId}'`;
      const selectConsumer = await vaasPgQuery(selectConsumerQuery, [], cachingType.NoCache);
      // If consultation not exist
      if (selectConsultation.queryResponse.length == 0) {
        const consumerId = selectConsumer.queryResponse[0].consumer_id;
        const insertChiefComplaintQuery = `INSERT INTO sc_${tableCenterId}_consultations (consultation_id,center_id,appointment_id,provider_id,consumer_id,chief_complaint,consultation_status) VALUES ('${consultationId}','${centerId}', '${appointmentId}', '${providerId}', '${consumerId}', '${chiefComplaint}','Scheduled')`;
        await vaasPgQuery(insertChiefComplaintQuery, [], cachingType.NoCache);
        // Save consultation to mongoDB
        const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_consultations", consultationInfo);
        const consultationModel = new model({
          'consultation_id': consultationId,
          'provider_id': providerId,
          'appointment_id': appointmentId,
          'consumer_id': consumerId,
          'chief_complaint': chiefComplaint,
          'center_id': req[`serviceProviderData`][`default_clinic`],
          'created_by': providerId,
          'created_user_from': 'service_providers'
        })
        consultationModel.save();
      } else {
        // If consultation already exist
        const consultId = selectConsultation.queryResponse[0].consultation_id;
        const examination = req?.body?.examination == undefined ? null : req?.body?.examination;
        if (examination == true) {
          const bp = req?.body?.bp == undefined ? null : req?.body?.bp;
          const weight = req?.body?.weight == undefined ? null : req?.body?.weight;
          const temperature = req?.body?.temperature == undefined ? null : req?.body?.temperature;
          const height = req?.body?.height == undefined ? null : req?.body?.height;
          const respiratory_rate = req?.body?.respiratory_rate == undefined ? null : req?.body?.respiratory_rate;
          const pulse = req?.body?.pulse == undefined ? null : req?.body?.pulse;
          const examination_notes = req?.body?.examination_notes == undefined ? null : req?.body?.examination_notes;
          if (bp !== null && weight !== null && temperature !== null && height !== null && respiratory_rate !== null && pulse !== null) {
            // Check examination values already exist..
            const consultExistQuery = `SELECT consultation_id FROM sc_${tableCenterId}_consult_examinations WHERE consultation_id = '${consultId}'`;
            const examinationConsultation = await vaasPgQuery(consultExistQuery, [], cachingType.NoCache);
            if (examinationConsultation.queryResponse.length == 0) {
              //If not exist, insert fresh examination values
              const insertExamination = `INSERT INTO sc_${tableCenterId}_consult_examinations (consultation_id,bp,weight,temp,height,respiratory_rate,pulse,examination_notes) VALUES ('${consultId}','${bp}', '${weight}', '${temperature}', '${height}', '${respiratory_rate}','${pulse}', '${examination_notes}')`;
              await vaasPgQuery(insertExamination, [], cachingType.NoCache);

            } else {
              //If already examination values exists, update examination values
              const updateExamination = `UPDATE sc_${tableCenterId}_consult_examinations
            SET bp = '${bp}', weight = '${weight}', temp = '${temperature}', height = '${height}', respiratory_rate = '${respiratory_rate}',pulse = '${pulse}',examination_notes = '${examination_notes}' WHERE consultation_id = '${consultId}'`;
              await vaasPgQuery(updateExamination, [], cachingType.NoCache);
            }
            const examination = {
              examination: true,
              bp: bp,
              weight: weight,
              temperature: temperature,
              height: height,
              respiratory_rate: respiratory_rate,
              pulse: pulse,
              examination_notes: examination_notes
            };
            const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_consultations", consultationInfo);
            model.findOneAndUpdate(
              { consultation_id: consultId },
              { $set: { chief_complaint: chiefComplaint, examination: examination } }
            )
          } else {
            res.status(200).json({
              status: false,
              message: "Please complete all fields",
              error: [],
            });
          }
        }
        const medications = req?.body?.medication == undefined ? null : req?.body?.medication;
        if (medications.length > 0) {
          const deleteMedicationQuery = `DELETE FROM sc_${tableCenterId}_consult_medications WHERE consultation_id = '${consultId}'`;
          await vaasPgQuery(deleteMedicationQuery, [], cachingType.NoCache);
          for (const medication of medications) {
            const { medicine_id, instruction } = medication;
            if (medicine_id && instruction) {
              const medicineInsertQuery = `INSERT INTO sc_${tableCenterId}_consult_medications (consultation_id, medication_id, instruction)
          VALUES ('${consultId}','${medicine_id}','${instruction}')`;
              await vaasPgQuery(medicineInsertQuery, [], cachingType.NoCache);
            }
          }
        }
        const diagnosis = req?.body?.diagnosis == undefined ? null : req?.body?.diagnosis;
        const procedure = req?.body?.procedure == undefined ? null : req?.body?.procedure;
        const advice = req?.body?.advice == undefined ? null : req?.body?.advice;
        const investigation = req?.body?.investigation == undefined ? null : req?.body?.investigation;
        const updateConsultation = `UPDATE sc_${tableCenterId}_consultations
        SET chief_complaint = '${chiefComplaint}', diagnosis = '${diagnosis}', procedures = '${procedure}', advice = '${advice}', investigation = '${investigation}'
        WHERE consultation_id = '${consultId}'`;
        await vaasPgQuery(updateConsultation, [], cachingType.NoCache);
      }
      res.status(200).json({
        status: true,
        message: "Consultation Updated Successfully",
        data: [],
      });
    } else {
      res.status(200).json({
        status: false,
        message: "Something went wrong!",
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

export async function getConsultation(req: any, res: any) {
  try {
    if (req[`serviceProviderData`][`default_clinic`] !== undefined && req[`serviceProviderData`][`default_clinic`] !== null) {
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const providerId = req[`serviceProviderData`][`provider_id`];
      const consultationId = req?.params?.consultationId == undefined ? null : req?.params?.consultationId;
      const consultationQuery = `SELECT cs.consultation_id, cs.center_id, cs.appointment_id, cs.provider_id, cs.chief_complaint, cs.diagnosis,cs.procedures,
      cs.investigation, cs.advice, cs.consultation_status, 
      ex.bp, ex.weight, ex.temp, ex.height, ex.respiratory_rate, ex.pulse, 
      ex.examination_notes, co.consumer_id,
      co.name, co.profile_picture, co.email, co.mobile, co.country_code, pt.patient_id, pt.gender, pt.dob, pt.age
      FROM sc_${tableCenterId}_consultations as cs
      LEFT JOIN sc_${tableCenterId}_consult_examinations as ex ON cs.consultation_id = ex.consultation_id
      LEFT JOIN service_consumers as co ON co.consumer_id = cs.consumer_id
      LEFT JOIN patients as pt ON pt.consumer_id = co.consumer_id
      WHERE cs.consultation_id = '${consultationId}'`;
      const consultationData = await vaasPgQuery(consultationQuery, [], cachingType.NoCache);
      const medications = `SELECT medication_id, instruction FROM sc_${tableCenterId}_consult_medications WHERE consultation_id = '${consultationId}'`;
      const medicationData = await vaasPgQuery(medications, [], cachingType.NoCache);
      res.status(200).json({
        status: true,
        message: "Consultation Information",
        data: { 'consultation': consultationData.queryResponse[0], 'medication': medicationData.queryResponse }
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

export async function getAllConsultations(req: any, res: any) {
  try {
    if (req[`serviceProviderData`][`default_clinic`] !== undefined && req[`serviceProviderData`][`default_clinic`] !== null) {
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const providerId = req[`serviceProviderData`][`provider_id`];
      const userType = req[`serviceProviderData`][`user_type`];
      let consultations = '';
      if (userType != 'admin') {
        consultations = `SELECT cs.consultation_id, cs.appointment_id, sp.provider_id, sp.first_name, sp.last_name, cs.chief_complaint, cs.diagnosis,cs.procedures,
        cs.investigation, cs.advice, cs.consultation_status, sp.first_name, sp.last_name FROM sc_${tableCenterId}_consultations cs LEFT JOIN doctors as sp ON cs.provider_id = sp.provider_id`;
      } else {
        consultations = `SELECT cs.consultation_id, cs.appointment_id, sp.provider_id, sp.first_name, sp.last_name, cs.chief_complaint, cs.diagnosis,cs.procedures,
        cs.investigation, cs.advice, cs.consultation_status, sp.first_name, sp.last_name  FROM sc_${tableCenterId}_consultations cs LEFT JOIN service_providers as sp ON cs.provider_id = sp.provider_id WHERE cs.provider_id = '${providerId}'`;
      }
      const consultationData = await vaasPgQuery(consultations, [], cachingType.StandardCache);
      res.status(200).json({
        status: true,
        message: "Data returned successfully",
        data: consultationData,
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

export async function updateConsultationStatus(req: any, res: any) {
  try {
    if (req[`serviceProviderData`][`default_clinic`] !== undefined && req[`serviceProviderData`][`default_clinic`] !== null) {
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const consultationId = req?.params?.consultationId;
      const consultationStatus = req?.params?.status;
      const statusUpdateQuery = `UPDATE sc_${tableCenterId}_consultations SET consultation_status='${consultationStatus}' WHERE consultation_id = '${consultationId}'`;
      await vaasPgQuery(statusUpdateQuery, [], cachingType.NoCache);
      res.status(200).json({
        status: true,
        message: "Consultation status updated successfully",
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






