import { v4 as uuidv4 } from 'uuid';
import { prescription } from '../../../models/mongo/prescriptionSchema';
import { getMongooseModel } from '../../../services/vaasdbengine';

export async function addPrescriptions(req: any, res: any) {
    try {
        getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`])
            .then((result: any) => {
                const executePrescriptionModel = new result({
                    provider_id: req[`serviceProviderData`][`provider_id`],
                    center_id: req[`serviceProviderData`][`default_clinic`],
                    appointment_id: req?.body?.appointment_id == undefined ? null : req?.body?.appointment_id,
                    consumer_id: req?.body?.consumer_id == undefined ? null : req?.body?.consumer_id,
                    medicine_id: req?.body?.medicine_id == undefined ? null : req?.body?.medicine_id,
                    medicine: req?.body?.medicine == undefined ? null : req?.body?.medicine,
                    description: req?.body?.description == undefined ? null : req?.body?.description,
                    record_id: uuidv4()
                }).save();
                if (executePrescriptionModel) {
                    res.status(200).json(
                        {
                            status: true,
                            message: 'executePrescripions created successfully',
                            data: executePrescriptionModel,
                        },
                    );
                } else {
                    res.status(200).json(
                        {
                            status: false,
                            message: 'Prescription creation failed',
                            data: [],
                        },
                    );
                }
            })
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}
export async function getPrescriptionsByAppoimentId(req: any, res: any) {
    try {
        if (req?.params?.appointment_id) {
            getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`]).then((modelResult: any) => {
                modelResult.find({ appointment_id: req?.params?.appointment_id })
                    .then((result: any) => {
                        if (result.length != 0) {
                            return res.status(200).json({
                                status: true,
                                message: "Prescriptions Listed Successfully",
                                data: result,
                            });
                        } else {
                            res.status(200).json(
                                {
                                    status: false,
                                    message: 'Prescriptions not exist',
                                    error: [],
                                },
                            );
                        }
                    })
            })
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please enter valid appointment ID',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}
export async function getPrescriptionsByPrescriptionId(req: any, res: any) {
    try {
        if (req?.params?.record_id) {
            getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`]).then((modelResult: any) => {
                modelResult.find({ record_id: req?.params?.record_id })
                    .then((result: any) => {
                        if (result.length != 0) {
                            return res.status(200).json({
                                status: true,
                                message: "Prescriptions Listed Successfully",
                                data: result,
                            });
                        } else {
                            res.status(200).json(
                                {
                                    status: false,
                                    message: 'Prescriptions not exist',
                                    error: [],
                                },
                            );
                        }
                    })
            })
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please enter valid prescription Id',
                    error: [],
                },
            );
        }
    } catch (err) {
        res.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}