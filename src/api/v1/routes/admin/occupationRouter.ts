import express from 'express';
import {
    addOccupation, deleteOccupation, getOccupation, getOccupationById, updateOccupation
} from "../../../../bl/admin/v1/occupation";
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/add-occupation", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addOccupation(req, res);
});

router.get("/list-occupations", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getOccupation(req, res);
});

router.patch("/update-occupation/:occupation_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateOccupation(req, res);
});

router.get("/get-occupation/:occupation_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getOccupationById(req, res);
});

router.post("/delete-occupation/:occupation_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteOccupation(req, res);
});

export const occupationRouter = router;