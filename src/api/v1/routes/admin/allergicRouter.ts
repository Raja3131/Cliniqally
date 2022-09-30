import express from 'express';
import { createAllergy, deleteAllergy, getAllergies, getAllergyById, updateAllergy } from '../../../../bl/admin/v1/allergy';
import { adminAuthMiddleWare } from '../../middleware/admin';

const router = express.Router();

router.post("/create-allergy", adminAuthMiddleWare, async (req: any, res: any, next) => {
    createAllergy(req, res);
});

router.post("/update-allergy/:allergic_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateAllergy(req, res);
});

router.get("/get-allergy/:allergic_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getAllergyById(req, res);
});

router.post("/delete-allergy/:allergic_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteAllergy(req, res);
});

router.get("/get-allergies", async (req: any, res: any, next) => {
    getAllergies(req, res);
});

export const allergicRouter = router;
