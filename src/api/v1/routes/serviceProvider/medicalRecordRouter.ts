import express from 'express';
import { addMedicalCertificate, updateMedicalCertificatee } from '../../../../bl/serviceProvider/v1/medicalCertificate';
import { addMedicalRecord, getMedicalRecordByConsumerId, getMedicalRecordByRecordId, getMedicalRecordByAppointmentId, getAllListByConsumerId } from "../../../../bl/serviceProvider/v1/medicalrecords";
import { medicalRecordValidation, validate } from '../../../../bl/serviceProvider/validations/serviceProviderValidation';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";
const router = express.Router();
router.post("/create-medical-records", serviceProviderAuthMiddleWare, validate(medicalRecordValidation()), async (req: any, res: any, next) => {
    addMedicalRecord(req, res);
});

router.get("/list-medical-records/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getMedicalRecordByConsumerId(req, res);
});

router.get("/get-medical-record/:record_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getMedicalRecordByRecordId(req, res);

});

router.post("/create-medical-certificate", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    addMedicalCertificate(req, res);
});

router.post("/medical-certificate-update/:certificate_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    updateMedicalCertificatee(req, res);
});
router.get("/list-attachments/:appointment_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getMedicalRecordByAppointmentId(req, res);
});

router.get("/list-count-patients/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getAllListByConsumerId(req, res)
});
export const medicalRecordRouter = router;