import express from 'express';
import { createLanguage, deleteLanguage, getLanguageById, getLanguages, updateLanguage } from "../../../../bl/admin/v1/language";
import {
    adminAuthMiddleWare
} from "../../middleware/admin";

const router = express.Router();

router.post("/create-language", adminAuthMiddleWare, async (req: any, res: any, next) => {
    createLanguage(req, res);
});

router.post("/update-language/:lang_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateLanguage(req, res);
});

router.get("/get-language/:lang_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getLanguageById(req, res);
});
router.post("/delete-language/:lang_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteLanguage(req, res);
});

router.get("/get-language", async (req: any, res: any, next) => {
    getLanguages(req, res);
});

export const languageRouter = router;
