import express from 'express';
import { createPrivateNotes,getPrivateNotes,getPrivateNotesById,updatePrivateNotes,deletePrivateNotes } from '../../../../bl/serviceProvider/v1/privateNotes'; 
import { serviceProviderAuthMiddleWare } from '../../middleware/serviceProvider';

const router = express.Router();

router.post("/add-private-notes", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    createPrivateNotes(req, res);
}
)
router.get("/list-private-notes", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getPrivateNotes(req, res);
}
)
router.get("/get-private-notes-by-id/:_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getPrivateNotesById(req, res);
}
)
router.put("/update-private-notes/:_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    updatePrivateNotes(req, res);
}
)
router.post("/delete-private-notes/:_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    deletePrivateNotes(req, res);
}
)

export const privateNotesRouter = router;

