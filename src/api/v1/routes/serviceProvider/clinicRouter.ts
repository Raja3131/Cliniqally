/**
 * This file is used to create the end point or routs for users related operation.
 */

import express from 'express';
import { createClinic, getClinicById, getClinicInfoById, getServiceProviderListByCenter, updateClinic } from "../../../../bl/serviceProvider/v1/clinic";
import { createClinicValidation, validate } from '../../../../bl/serviceProvider/validations/clinicValidation';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";

const router = express.Router();


/** ***********************************************************
 * End points for the Admin signup ,Login with mobile and email/Password
 * ***********************************************************
 */

router.post("/create-clinic", serviceProviderAuthMiddleWare, validate(createClinicValidation()), async (req: any, res: any, next) => {
    createClinic(req, res);
});

router.get("/get-clinic", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getClinicById(req, res);
});

router.patch("/update-clinic", serviceProviderAuthMiddleWare, validate(createClinicValidation()), async (req: any, res: any, next) => {
    updateClinic(req, res);
});


router.get("/get-service-provider-list-by-clinic", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getServiceProviderListByCenter(req, res);
});

router.get("/get-clinic-info", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getClinicInfoById(req, res);
});
//todo: otp generation with send sms pending

export const clinicRouter = router;


