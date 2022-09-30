import express from 'express';
import { addPrescriptions, getPrescriptionsByPrescriptionId, getPrescriptionsByAppoimentId } from "../../../../bl/serviceProvider/v1/prescriptions";
import { prescriptionValidation, validate } from '../../../../bl/serviceProvider/validations/serviceProviderValidation';
import { serviceProviderAuthMiddleWare } from '../../middleware/serviceProvider';
const router = express.Router();
router.post("/add-prescriptions", serviceProviderAuthMiddleWare, validate(prescriptionValidation()), async (req: any, res: any, next) => {
    addPrescriptions(req, res);
});

router.get("/list-prescriptions/:appointment_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getPrescriptionsByAppoimentId(req, res);
});

router.get("/get-prescriptions/:record_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getPrescriptionsByPrescriptionId(req, res);
});

export const prescriptionRouter = router;