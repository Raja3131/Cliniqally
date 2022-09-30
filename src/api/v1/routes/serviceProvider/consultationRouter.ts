/**
 * This file is used to create the end point or routs for users related operation.
 */

import express from 'express';
import { consultation, getAllConsultations, getConsultation, updateConsultationStatus } from "../../../../bl/serviceProvider/v1/consultation";
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";



const router = express.Router();


/** ***********************************************************
 * End points for the Admin signup ,Login with mobile and email/Password
 * ***********************************************************
 */

router.post('/upsert-consultation', serviceProviderAuthMiddleWare, async (req, res) => {
    consultation(req, res);
});

router.get('/get-consultations', serviceProviderAuthMiddleWare, async (req, res) => {
    getAllConsultations(req, res);
});

router.get('/get-consultation/:consultationId', serviceProviderAuthMiddleWare, async (req, res) => {
    getConsultation(req, res);
});

router.patch('/update-status/:consultationId/:status', serviceProviderAuthMiddleWare, async (req, res) => {
    updateConsultationStatus(req, res);
});

export const consultationRouter = router;


