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

export const currencyValidation = () => {
    return [
        body("currency")
            .notEmpty()
            .withMessage("currency is required"),
        body("symbol")
            .notEmpty()
            .withMessage("symbol is required"),
        body("symbol_at")
            .notEmpty()
            .withMessage("symbol_at is required"),
        body("status")
            .notEmpty()
            .withMessage("status is required"),
    ];
};