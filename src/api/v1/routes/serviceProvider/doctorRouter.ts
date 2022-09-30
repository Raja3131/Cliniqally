import express from 'express';
import { createdoctor, getDoctor, getDoctorById, updateDoctor, deleteDoctor } from '../../../../bl/serviceProvider/v1/doctor';
import { serviceProviderAuthMiddleWare } from '../../middleware/serviceProvider';
const router = express.Router();
router.post("/add-doctor", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    createdoctor(req, res);
});
router.get("/get-doctor-list", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getDoctor(req, res);
});
router.get("/get-doctor/:provider_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getDoctorById(req, res);
});
router.patch("/update-doctor/:provider_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    updateDoctor(req, res);
});
router.post("/delete-doctor/:provider_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    deleteDoctor(req, res);
});
export const doctorRouter = router;