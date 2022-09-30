import express from 'express';
import {
    createQuery, getQueryById, listQuery
} from "../../../../bl/serviceProvider/v1/providersupportquery";
import { queryValidation, validate } from '../../../../bl/serviceProvider/validations/queryValidation';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";

const router = express.Router();

router.post("/create-query", serviceProviderAuthMiddleWare, validate(queryValidation()), async (req: any, res: any, next) => {
    createQuery(req, res);
});

router.get("/list-query/:status", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    listQuery(req, res);
});

router.get("/get-query/:query_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next: any) => {
    getQueryById(req, res);
});


export const providerSupportQueryRouter = router;