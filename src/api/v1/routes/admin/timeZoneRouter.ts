import express from 'express';
import { addTimeZone, getTimeZone } from '../../../../bl/admin/v1/timeZone';
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/add-time-zone", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addTimeZone(req, res);
});

router.get("/list-time-zone", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getTimeZone(req, res);
});

export const timeZoneRouter = router;