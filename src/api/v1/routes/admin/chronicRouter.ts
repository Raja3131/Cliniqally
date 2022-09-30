import express from 'express';
import { createChronic, deleteChronic, getChronic, getChronicById, updateChronic } from '../../../../bl/admin/v1/chronic';
import { adminAuthMiddleWare } from '../../middleware/admin';

const router = express.Router();

router.post("/create-chronic", adminAuthMiddleWare, async (req: any, res: any, next) => {
    createChronic(req, res);
});

router.post("/update-chronic/:chronic_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateChronic(req, res);
});

router.get("/get-chronic/:chronic_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getChronicById(req, res);
});

router.post("/delete-chronic/:chronic_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteChronic(req, res);
});

router.get("/get-chronic", async (req: any, res: any, next) => {
    getChronic(req, res);
});

export const chronicRouter = router;
