import express from 'express';
import {
    createPatient, deletePatient, getPatient, getPatientById, updatePatient
} from "../../../../bl/admin/v1/patient";
import { createPatientValidation, validate } from '../../../../bl/admin/validations/patientValidation';
import {
    adminAuthMiddleWare
} from "../../middleware/admin";

const router = express.Router();



router.post("/create-patient", adminAuthMiddleWare, validate(createPatientValidation()), async (req: any, res: any, next) => {
    createPatient(req, res);
});

router.get("/list-patient", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getPatient(req, res);
});

router.get("/get-patient/:consumer_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getPatientById(req, res);
});

router.patch("/update-patient/:consumer_id", adminAuthMiddleWare, validate(createPatientValidation()), async (req: any, res: any, next) => {
    updatePatient(req, res);
});

router.post("/delete-patient/:consumer_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deletePatient(req, res);
});

export const patientRouter = router;