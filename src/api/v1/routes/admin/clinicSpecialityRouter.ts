import express from 'express';
import { addClinicSpeciality, deleteClinicSpeciality, getClinicSpecialityById, listClinicSpeciality, updateClinicSpeciality } from '../../../../bl/admin/v1/clinicSpecialities';
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/add-clinic-speciality", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addClinicSpeciality(req, res);
});

router.patch("/update-clinic-speciality/:clinic_speciality_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateClinicSpeciality(req, res);
});

router.get("/get-clinic-speciality/:clinic_speciality_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getClinicSpecialityById(req, res);
});

router.post("/delete-clinic-speciality/:clinic_speciality_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteClinicSpeciality(req, res);
});

router.get("/list-clinic-speciality", adminAuthMiddleWare, async (req: any, res: any, next) => {
    listClinicSpeciality(req, res);
});


export const clinicSpecialityRouter = router;
