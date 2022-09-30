import { body, ValidationChain, validationResult } from "express-validator";

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
        body("email")
            .notEmpty()
            .withMessage("email is required"),
        body("name")
            .notEmpty()
            .withMessage("Clinic name is required"),
    ];
};

export const clinicTimingsValidation = () => {
    return [
        body("clinic_id")
            .notEmpty()
            .withMessage("Clinic is required"),
        body("day")
            .notEmpty()
            .withMessage("Day is required"),
    ];
};