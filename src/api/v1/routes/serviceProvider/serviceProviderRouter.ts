/**
 * This file is used to create the end point or routs for users related operation.
 */

import express from 'express';
import { appointmentDelay } from "../../../../bl/serviceProvider/helper/provider";
import { appointmentUnavailability, createMedicalCertificate, createServiceProviderProfile, getServiceProviderAppointmentTimings, getServiceProviderMrSettings, getServiceProviderProfile, getServiceProviderUnavailabilitySettings, listAllDetails, listMyClinics, loginMobileOtp, loginUserPass, mrSettings, serviceProviderAddProfile, serviceProviderAppointmentSetting, signUpProviderUser, signUpServiceProvider, signUpServiceProviderFinal, switchDefaultClinic, updateMedicalCertificate } from "../../../../bl/serviceProvider/v1";
import { serviceProviderHomeScreenMobile } from '../../../../bl/serviceProvider/v1/appointment';
import { appointmentSettingsValidation, createProfileValidation, mrSettingsValidation, serviceProviderFinalSignupValidation, serviceProviderFirstSignupValidation, serviceProviderMedicalCertificateCreationValidation, serviceProviderSignUpEmailValidation, serviceProviderSignUpMobileValidation, validate } from '../../../../bl/serviceProvider/validations/serviceProviderValidation';
import { serviceProviderAuthMiddleWare, serviceProviderMiddleWare } from "../../middleware/serviceProvider";
import { addBankaccount, getBankaccount, updateBankaccount, switchBankaccount } from '../../../../bl/serviceProvider/v1/bankaccount';


const router = express.Router();


/** ***********************************************************
 * End points for the Admin signup ,Login with mobile and email/Password
 * ***********************************************************
 */

router.post('/sign-up', validate(serviceProviderSignUpEmailValidation()), validate(serviceProviderSignUpMobileValidation()), async (req, res) => {
    signUpServiceProvider(req, res);
});

router.post("/login", serviceProviderMiddleWare.email_checker, serviceProviderMiddleWare.pass_checker, async (req, res, next) => {
    loginUserPass(req, res);
});

router.post("/login-mobile", async (req, res, next) => {
    loginMobileOtp(req, res);
});

router.post("/service-provider-profile", serviceProviderAuthMiddleWare, validate(createProfileValidation()), async (req: any, res: any, next) => {
    serviceProviderAddProfile(req, res);
});

router.get("/list-details", serviceProviderAuthMiddleWare, async (req, res) => {
    listAllDetails(req, res);
});

router.post('/service-provider-create-profile', serviceProviderAuthMiddleWare, async (req, res) => {
    createServiceProviderProfile(req, res);
});

router.post("/first-sign-up", validate(serviceProviderFirstSignupValidation()), async (req, res) => {
    signUpProviderUser(req, res);
});

router.post("/final-sign-up", validate(serviceProviderFinalSignupValidation()), async (req, res) => {
    signUpServiceProviderFinal(req, res);
});

router.post("/appointment-settings", serviceProviderAuthMiddleWare, validate(appointmentSettingsValidation()), async (req, res) => {
    serviceProviderAppointmentSetting(req, res);
});

router.get("/list-clinics", serviceProviderAuthMiddleWare, async (req, res) => {
    listMyClinics(req, res);
});

router.post("/switch-clinic", serviceProviderAuthMiddleWare, async (req, res) => {
    switchDefaultClinic(req, res);
});

router.post("/appointment-unavailability", serviceProviderAuthMiddleWare, async (req, res) => {
    appointmentUnavailability(req, res);
});

router.post("/mr-settings", serviceProviderAuthMiddleWare, validate(mrSettingsValidation()), async (req, res) => {
    mrSettings(req, res);
});

//todo: otp generation with send sms pending

router.post("/medical-certificate", serviceProviderAuthMiddleWare, validate(serviceProviderMedicalCertificateCreationValidation()), async (req, res) => {
    createMedicalCertificate(req, res);
});

router.post("/medical-certificate/:certificate_id", serviceProviderAuthMiddleWare, validate(serviceProviderMedicalCertificateCreationValidation()), async (req, res) => {
    updateMedicalCertificate(req, res);
});

router.get("/get-appointment-timings/:session_type", serviceProviderAuthMiddleWare, async (req, res) => {
    getServiceProviderAppointmentTimings(req, res);
});

router.get("/get-unavailability-settings/:session_type", serviceProviderAuthMiddleWare, async (req, res) => {
    getServiceProviderUnavailabilitySettings(req, res);
});

router.get("/get-mr-settings", serviceProviderAuthMiddleWare, async (req, res) => {
    getServiceProviderMrSettings(req, res);
});

router.post("/appointment-delay", async (req, res) => {
    appointmentDelay(req, res);
});

router.get("/provider-home-screen/:startDate", serviceProviderAuthMiddleWare, async (req, res) => {
    serviceProviderHomeScreenMobile(req, res);
});

router.get('/get-profile', serviceProviderAuthMiddleWare, async (req, res) => {
    getServiceProviderProfile(req, res);
});

router.post("/add-bank-account", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    addBankaccount(req, res);
});

router.get("/get-bank-account", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getBankaccount(req, res);
});

router.post("/update-bank-account/:bankaccount_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    updateBankaccount(req, res);
});

router.post("/update-primarybank-account", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    switchBankaccount(req, res);
});
export const serviceProviderRouter = router;


