import express from 'express';
import { createPatientProfile, loginMobileOtp, signUpPatientUser, signUpPatientUserFinal, searchDoctor } from "../../../../bl/patients/v1";
import { listAllDetails } from '../../../../bl/patients/v1/listDetails';
import { addAllergy, addSurgery, createhabit, createMedications } from '../../../../bl/patients/v1/patientDetails';
import { otpValidation, patientAccountValidation, patientUserSignUpValidation, validate } from '../../../../bl/patients/validations/patientUserValidation';
import { patientUserAuthMiddleWare } from "../../middleware/patientUser";
const router = express.Router();

router.post('/first-sign-up', validate(patientUserSignUpValidation()), async (req, res) => {
    signUpPatientUser(req, res);
});

router.post('/final-sign-up', validate(otpValidation()), async (req, res) => {
    signUpPatientUserFinal(req, res);
});

router.post("/patient-create-account", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    createPatientProfile(req, res);
});

router.post("/login-mobile", async (req, res, next) => {
    loginMobileOtp(req, res);
});

router.post("/patient-medication", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    createMedications(req, res);
});

router.post("/patient-allergy", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    addAllergy(req, res);
});

router.post("/patient-surgery", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    addSurgery(req, res);
});

router.post("/patient-habit", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    createhabit(req, res);
});

router.get("/patient-list-details", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    listAllDetails(req, res);
});
router.post("/doctor-search", patientUserAuthMiddleWare, async (req: any, res: any, next) => {
    searchDoctor(req, res);
});
export const patientUserRouter = router;