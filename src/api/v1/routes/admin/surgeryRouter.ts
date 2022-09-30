import express from 'express';
import { createSurgery, deleteSurgery, getSurgeries, getSurgeryById, updateSurgery } from '../../../../bl/admin/v1/surgery';
import {
    adminAuthMiddleWare
} from "../../middleware/admin";

const router = express.Router();

router.post("/create-surgery", adminAuthMiddleWare, async (req: any, res: any, next) => {
    createSurgery(req, res);
});

router.post("/update-surgery/:surgery_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateSurgery(req, res);
});

router.get("/get-surgery/:surgery_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getSurgeryById(req, res);
});

router.post("/delete-surgery/:surgery_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteSurgery(req, res);
});

router.get("/get-surgeries", async (req: any, res: any, next) => {
    getSurgeries(req, res);
});



export const surgeryRouter = router;
