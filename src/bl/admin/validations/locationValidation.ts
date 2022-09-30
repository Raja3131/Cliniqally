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

// country validation
export const createCountryValidation = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("name is required"),
        body("status")
            .notEmpty()
            .withMessage("status is required"),
    ];
};

// state validation
export const createStateValidation = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("name is required"),
        body("country")
            .notEmpty()
            .withMessage("country is required"),
        body("status")
            .notEmpty()
            .withMessage("status is required"),
    ];
};

// city validation
export const createCityValidation = () => {
    return [
        body("name")
            .notEmpty()
            .withMessage("name is required"),
        body("country")
            .notEmpty()
            .withMessage("country is required"),
        body("status")
            .notEmpty()
            .withMessage("status is required"),
    ];
};
