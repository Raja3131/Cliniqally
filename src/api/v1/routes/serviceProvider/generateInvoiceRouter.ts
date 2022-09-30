import express from 'express';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";
import { createInvoice, updatecreateInvoice, getAllInvoice, getInvoice, listAllInvoiceByDate } from "../../../../bl/serviceProvider/v1/generateinvoice";
const router = express.Router();
router.post("/create-invoice", serviceProviderAuthMiddleWare, async (req, res) => {
    createInvoice(req, res);
});
router.get("/list_invoice/:appointment_id", serviceProviderAuthMiddleWare, async (req, res) => {
    getAllInvoice(req, res);
});
router.get("/getinvoice/:invoice_id", serviceProviderAuthMiddleWare, async (req, res) => {
    getInvoice(req, res);
});
router.post("/update_invoice/:invoice_id", serviceProviderAuthMiddleWare, async (req, res) => {
    updatecreateInvoice(req, res);
});
router.get("/list_all_invoice/:consumer_id", serviceProviderAuthMiddleWare, async (req, res) => {
    listAllInvoiceByDate(req, res);
});
export const generateInvoiceRouter = router;