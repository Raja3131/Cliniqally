import express from 'express';
import { createConsultationFee, createCustomFollowUp } from "../../../../bl/serviceProvider/v1/consultationfee";
import { customFollowUpValidation, feeValidation, validate } from '../../../../bl/serviceProvider/validations/serviceProviderValidation';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";

const router = express.Router();

router.post("/create-consultation-fee", serviceProviderAuthMiddleWare, validate(feeValidation()), async (req: any, res: any, next) => {
    createConsultationFee(req, res);
});

router.post("/create-custom-follow-up", serviceProviderAuthMiddleWare, validate(customFollowUpValidation()), async (req: any, res: any, next) => {
    createCustomFollowUp(req, res);
});

export const feeRouter = router;