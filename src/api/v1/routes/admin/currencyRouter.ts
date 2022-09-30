import express from 'express';
import {
    createCurrency, deleteCurrency, getCurrencies, getCurrencyById, updateCurrency
} from "../../../../bl/admin/v1/currency";
import { currencyValidation, validate } from '../../../../bl/admin/validations/currencyValidation';
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/create-currency", adminAuthMiddleWare, validate(currencyValidation()), async (req: any, res: any, next) => {
    createCurrency(req, res);
});

router.get("/list-currency", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getCurrencies(req, res);
});

router.patch("/update-currency/:currency_id", adminAuthMiddleWare, validate(currencyValidation()), async (req: any, res: any, next) => {
    updateCurrency(req, res);
});

router.get("/get-currency/:currency_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getCurrencyById(req, res);
});

router.post("/delete-currency/:currency_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteCurrency(req, res);
});


export const currencyRouter = router;