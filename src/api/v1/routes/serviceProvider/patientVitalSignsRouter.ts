import express from 'express';
import { serviceProviderAuthMiddleWare } from '../../middleware/serviceProvider';
import { createVitalSigns,updateVitalSigns,deleteVitalSigns,getVitalSignsByPatientId } from '../../../../bl/serviceProvider/v1/patientVitalSigns';

const router = express.Router();
router.post('/create-vital-Signs', serviceProviderAuthMiddleWare, async (req, res) => {createVitalSigns(req, res)});
router.get('/get-vital-signs-by-patient-id/:patient_id', serviceProviderAuthMiddleWare, async (req, res) => {getVitalSignsByPatientId(req, res)});
router.put('/update-vital-signs/:patient_id', serviceProviderAuthMiddleWare, async (req, res) => {updateVitalSigns(req, res)});
router.delete('/delete-vital-signs/:patient_id', serviceProviderAuthMiddleWare, async (req, res) => {deleteVitalSigns(req, res)});

export const patientVitalSignsRouter = router;