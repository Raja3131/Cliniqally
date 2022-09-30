import express from 'express';
import { addBloodGroup, deleteBloodGroup, getBloodGroup, getBloodGroupById, updateBloodGroup } from "../../../../bl/admin/v1/bloodgroup";
import { adminAuthMiddleWare } from "../../middleware/admin";

const router = express.Router();

router.post("/add-blood-group", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addBloodGroup(req, res);
});

router.get("/list-blood-group", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getBloodGroup(req, res);
});

router.patch("/update-blood-group/:group_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateBloodGroup(req, res);
});

router.get("/get-blood-group/:group_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    getBloodGroupById(req, res);
});

router.post("/delete-blood-group/:group_id", adminAuthMiddleWare, async (req: any, res: any, next: any) => {
    deleteBloodGroup(req, res);
});

export const bloodGroupRouter = router;