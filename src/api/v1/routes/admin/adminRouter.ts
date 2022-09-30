/**
 * This file is used to create the end point or routs for admins related operation.
 */
import express from 'express';
import {
    loginAdminUserPass, loginMobileOtp, signUpAdmin
} from "../../../../bl/admin/v1/admin";
import { adminAuthMiddleWare, adminMiddleWare } from "../../middleware/admin";

const router = express.Router();


/** ***********************************************************
 * End points for the Admin signup ,Login with mobile and email/Password
 * ***********************************************************
 */

router.post('/sign-up', async (req, res) => {
    signUpAdmin(req, res);
});

router.post("/login", adminMiddleWare.email_checker, adminMiddleWare.pass_checker, async (req, res, next) => {
    loginAdminUserPass(req, res);
});

router.post("/login-mobile", async (req, res, next) => {
    loginMobileOtp(req, res)
});

router.post("/logout", adminAuthMiddleWare, async (req: any, res, next) => {
    req.adminData = {};
    res.status(200).json({
        status: true,
        message: "You are successfully logged out.",
    });
});

//todo: otp generation with send sms pending

export const adminRouter = router;


