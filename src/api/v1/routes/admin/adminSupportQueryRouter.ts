import express from 'express';
import { createQueryReason, createQueryType, deleteQueryReason, deleteQueryType, getQueryById, getQueryReason, getQueryReasonById, getQueryType, getQueryTypeById, listQuery } from "../../../../bl/admin/v1/supportquery";
import { queryReasonValidation, queryTypeValidation, validate } from '../../../../bl/admin/validations/queryValidation';
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/create-query-type", adminAuthMiddleWare, validate(queryTypeValidation()), async (req: any, res: any, next) => {
    createQueryType(req, res);
});

router.get("/list-query-type", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getQueryType(req, res);
});

router.get("/get-query-type/:type_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getQueryTypeById(req, res);
});

router.post("/delete-query-type/:type_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteQueryType(req, res);
});

router.post("/create-query-reason", adminAuthMiddleWare, validate(queryReasonValidation()), async (req: any, res: any, next) => {
    createQueryReason(req, res);
});

router.get("/list-query-reason", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getQueryReason(req, res);
});

router.get("/get-query-reason/:reason_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getQueryReasonById(req, res);
});

router.post("/delete-query-reason/:reason_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteQueryReason(req, res);
});

router.get("/list-query/:status", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    listQuery(req, res);
});

router.get("/get-query/:query_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getQueryById(req, res);
});



export const adminSupportQueryRouter = router;
