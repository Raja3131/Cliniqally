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


export const createClinicValidation = () => {
    return [
        body("provider_id")
            .notEmpty()
            .withMessage("Provider is required"),
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid Email")
            .custom(async (email) => {
                const query = `SELECT * FROM service_centers WHERE email = '${email}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.NoCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Email already in use')
                }
            }),
        body("name")
            .notEmpty()
            .withMessage("Clinic name is required"),
    ];
};

export const updateClinicValidation = () => {
    return [
        body("provider_id")
            .notEmpty()
            .withMessage("Provider is required"),
        body("email")
            .notEmpty()
            .withMessage("email is required"),
        body("name")
            .notEmpty()
            .withMessage("Clinic name is required"),
    ];
};

