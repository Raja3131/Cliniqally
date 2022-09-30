import express from 'express';
import {
    createPatient, deletePatient, getHabitById, getMedicationById, getPatient, getPatientAllergyById, getPatientById, getPatientSurgeryById, updatePatient
} from "../../../../bl/serviceProvider/v1/patient";
import { createPatientValidation, validate } from '../../../../bl/serviceProvider/validations/patientValidation';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";

const router = express.Router();



router.post("/create-patient", serviceProviderAuthMiddleWare, validate(createPatientValidation()), async (req: any, res: any, next) => {
    createPatient(req, res);
});

router.get("/list-patient", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getPatient(req, res);
});

router.get("/get-patient/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getPatientById(req, res);
});

router.patch("/update-patient/:consumer_id", serviceProviderAuthMiddleWare, validate(createPatientValidation()), async (req: any, res: any, next) => {
    updatePatient(req, res);
});

router.post("/delete-patient/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    deletePatient(req, res);
});

router.get("/get-allergy/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getPatientAllergyById(req, res);
});

router.get("/get-surgery/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getPatientSurgeryById(req, res);
});

router.get("/get-medication/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getMedicationById(req, res);
});

router.get("/get-habit/:consumer_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getHabitById(req, res);
});

export const consumerRouter = router;