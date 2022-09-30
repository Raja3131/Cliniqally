import express from "express";
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";
import {
  addClinicStaff,
  getAllClinicStaffs,
  updateClinicStaff,
  deleteClinicStaff,
  getClinicStaffById,
} from "../../../../bl/serviceProvider/v1/clinicStaff";

const router = express.Router();
router.post("/create-clinic-staff",serviceProviderAuthMiddleWare,async (req: any, res: any, next) => {
    addClinicStaff(req, res); 
});

router.get("/get-all-clinic-staffs",serviceProviderAuthMiddleWare,async (req: any, res: any, next) =>{
    getAllClinicStaffs(req, res);
});

router.post( "/update-clinic-staff/:provider_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    updateClinicStaff(req, res);
});

router.post("/delete-clinic-staff/:provider_id",serviceProviderAuthMiddleWare,async (req: any, res: any, next) => {
    deleteClinicStaff(req, res);
});

router.get("/get-clinic-staff/:provider_id",serviceProviderAuthMiddleWare,async (req: any, res: any, next) => {
    getClinicStaffById(req, res);
});

export const clinicStaffRouter = router;
