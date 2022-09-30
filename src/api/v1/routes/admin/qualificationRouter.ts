import express from 'express';
import {
    addDegree, addRegistrationCouncil, addSpecialization, addSubSpecialization, deleteDegree, deleteRegistrationCouncil, deleteSpecialization, deleteSubSpecialization, getDegreeById, getRegistrationCouncilById, getSpecializationById, getSubSpecializationById, listDegree, listRegistrationCouncil, listSpecialization, listSubSpecialization, updateDegree, updateRegistrationCouncil, updateSpecialization, updateSubSpecialization
} from "../../../../bl/admin/v1/qualifications";
import {
    adminAuthMiddleWare
} from "../../middleware/admin";

const router = express.Router();

// Specialization Routes
router.post("/add-specialization", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addSpecialization(req, res);
});

router.patch("/update-specialization/:specialization_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateSpecialization(req, res);
});

router.get("/get-specialization/:specialization_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getSpecializationById(req, res);
});

router.post("/delete-specialization/:specialization_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteSpecialization(req, res);
});

router.get("/list-specialization", adminAuthMiddleWare, async (req: any, res: any, next) => {
    listSpecialization(req, res);
});

// Registration Council Routes
router.post("/add-registration-council", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addRegistrationCouncil(req, res);
});

router.patch("/update-registration-council/:registration_council_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateRegistrationCouncil(req, res);
});

router.get("/get-registration-council/:registration_council_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getRegistrationCouncilById(req, res);
});

router.post("/delete-registration-council/:registration_council_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteRegistrationCouncil(req, res);
});

router.get("/list-registration-council", adminAuthMiddleWare, async (req: any, res: any, next) => {
    listRegistrationCouncil(req, res);
});

// Degree Routes
router.post("/add-degree", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addDegree(req, res);
});

router.patch("/update-degree/:degree_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateDegree(req, res);
});

router.get("/get-degree/:degree_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getDegreeById(req, res);
});

router.post("/delete-degree/:degree_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteDegree(req, res);
});

router.get("/list-degree", adminAuthMiddleWare, async (req: any, res: any, next) => {
    listDegree(req, res);
});

// Sub specializations

router.post("/create-sub-specialization", adminAuthMiddleWare, async (req: any, res: any, next) => {
    addSubSpecialization(req, res);
});

router.patch("/update-sub-specialization/:sub_specialization_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    updateSubSpecialization(req, res);
});

router.get("/get-sub-specialization/:sub_specialization_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    getSubSpecializationById(req, res);
});

router.post("/delete-sub-specialization/:sub_specialization_id", adminAuthMiddleWare, async (req: any, res: any, next) => {
    deleteSubSpecialization(req, res);
});

router.get("/list-sub-specialization", adminAuthMiddleWare, async (req: any, res: any, next) => {
    listSubSpecialization(req, res);
});

export const qualificationRouter = router;
