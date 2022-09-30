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
}

export const createServiceProviderValidation = () => {
    return [
        body("first_name")
            .notEmpty()
            .withMessage("first name is required"),
        body("last_name")
            .notEmpty()
            .withMessage("last name is required"),
        body("email")
            .notEmpty()
            .withMessage("email is required"),
        body("mobile")
            .notEmpty()
            .withMessage("mobile is required"),
            
    ]
    
}