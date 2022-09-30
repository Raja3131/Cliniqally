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

export const queryTypeValidation = () => {
    return [
        body("query_type")
            .notEmpty()
            .withMessage("query type is required")
    ];
};

export const queryReasonValidation = () => {
    return [
        body("query_reason")
            .notEmpty()
            .withMessage("query reason is required")
    ];
};