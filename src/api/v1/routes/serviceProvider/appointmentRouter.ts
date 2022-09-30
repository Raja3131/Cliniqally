import express from 'express';
import { addAppointment, addAppointmentReminder, appointmentList, blockAppointment, getAppointmentById, getCalendar, getCalendarMobile, listAppointmentStatus, searchPatient } from "../../../../bl/serviceProvider/v1/appointment";
import { appointmentValidation, validate } from '../../../../bl/serviceProvider/validations/serviceProviderValidation';
import { serviceProviderAuthMiddleWare } from "../../middleware/serviceProvider";
const router = express.Router();

router.get("/search-patient/:searchKey", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    searchPatient(req, res);
});

router.post("/add-appointment", serviceProviderAuthMiddleWare, validate(appointmentValidation()), async (req: any, res: any, next) => {
    addAppointment(req, res);
});

router.post("/add-appointment-reminder", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    addAppointmentReminder(req, res);
});

router.post("/block-appointment", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    blockAppointment(req, res);
});

router.get("/get-appointment-list", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    appointmentList(req, res);
});

router.get("/get-appointment/:appointment_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getAppointmentById(req, res);
});

router.get("/list-appointments-status/:provider_id", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    listAppointmentStatus(req, res);
});

router.get("/get-calendar/:start_date/:end_date/:status", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getCalendar(req, res);
});
router.get("/get-calendar-mobile/:start_date/:end_date/:status", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
    getCalendarMobile(req, res);
});

// router.get("/get-appointment-slots", serviceProviderAuthMiddleWare, async (req: any, res: any, next) => {
//     getAppointmentSlots(req, res);
// });

export const appointmentRouter = router;
