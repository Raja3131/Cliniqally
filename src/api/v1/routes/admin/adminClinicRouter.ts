import express from 'express';
import { createClinic, deleteClinic, getClinic, getClinicById, updateClinic } from "../../../../bl/admin/v1/clinic";
import {
    createClinicValidation, updateClinicValidation, validate
} from "../../../../bl/admin/validations/clinicValidation";
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/create-clinic", adminAuthMiddleWare, validate(createClinicValidation()), async (req: any, res: any, next) => {
    createClinic(req, res);
});

router.patch("/update-clinic/:clinicId", adminAuthMiddleWare, validate(updateClinicValidation()), async (req: any, res: any, next) => {
    updateClinic(req, res);
});

router.post("/delete-clinic/:clinicId", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteClinic(req, res);
});

router.get("/get-clinic/:clinicId", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getClinicById(req, res);
});

router.get("/list-clinic", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getClinic(req, res);
});


export const adminClinicRouter = router;