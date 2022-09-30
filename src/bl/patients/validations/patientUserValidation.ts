import { body, ValidationChain, validationResult } from "express-validator";
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export const validate = (validations: ValidationChain[]) => {
    return async (req: Express.Request, res: any, next: any) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        let messages = '';
        errors.array().forEach(element => {
            messages += (element.msg + '\n');
        });
        res.status(200).json({ status: false, data: errors.array(), message: messages });
    };
};

export const patientUserSignUpValidation = () => {
    return [
        body("firstName")
            .notEmpty()
            .withMessage("first name is required"),
        body("lastName")
            .notEmpty()
            .withMessage("first name is required"),
        body("countryCode")
            .notEmpty()
            .withMessage("Country Code is required"),
        body("mobileNumber")
            .notEmpty()
            .withMessage("Mobile is required")
            .isNumeric()
            .withMessage("Mobile Number only accept numbers")
            .custom(async (mobile) => {
                const query = `SELECT * FROM service_consumers WHERE mobile = '${mobile}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.StandardCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Mobile Number already in use')
                }
            })
    ];
};

export const otpValidation = () => {
    return [
        body("otp")
            .notEmpty()
            .withMessage("OTP is required")
            .isNumeric()
            .withMessage("OTP Number only accept numbers"),
        body("firstName")
            .notEmpty()
            .withMessage("first name is required"),
        body("lastName")
            .notEmpty()
            .withMessage("first name is required"),
        body("countryCode")
            .notEmpty()
            .withMessage("Country Code is required"),
        body("mobileNumber")
            .notEmpty()
            .withMessage("Mobile is required")
            .isNumeric()
            .withMessage("Mobile Number only accept numbers")
            .custom(async (mobile) => {
                const query = `SELECT * FROM service_consumers WHERE mobile = '${mobile}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.StandardCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Mobile Number already in use')
                }
            })
    ];
};
export const patientUserSignUpMobileValidation = () => {
    return [
        body("mobile")
            .notEmpty()
            .withMessage("Mobile is required")
            .isNumeric()
            .withMessage("Mobile Number only accept numbers")
            .custom(async (mobile) => {
                const query = `SELECT * FROM service_consumers WHERE mobile = '${mobile}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.StandardCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Mobile Number already in use')
                }
            })
    ];
};

export const patientAccountValidation = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage(" name is required"),
        body("dob")
            .notEmpty()
            .withMessage("Date of Birth is required"),
        body("gender")
            .notEmpty()
            .withMessage("Gender is required"),
        body("patient_id")
            .notEmpty()
            .withMessage("Patient Id is required")
    ];
};
