import express from 'express';
import {
    addPatientMobile, listPatientsMobileApp
} from "../../../../bl/serviceProvider/v1/patient";
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";

const router = express.Router();

router.post("/create-patient", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    addPatientMobile(req, res);
});

router.get("/get-clinic-patient/:searchByName", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    listPatientsMobileApp(req, res);
});
export const serviceConsumerPatientRouter = router;