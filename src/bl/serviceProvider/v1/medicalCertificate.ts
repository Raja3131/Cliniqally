import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { medical_Certificate } from '../../../models/mongo/medicalCertificateModel';

export async function addMedicalCertificate(req: any, res: any) {
    try {
        const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_medical_certificate", medical_Certificate);
        const medicalCertificateModel = new model({
            certificate_id: uuidv4(),
            provider_id: req[`serviceProviderData`][`provider_id`],
            consumer_id: req?.body?.consumer_id == undefined ? null : req?.body?.consumer_id,
            center_id: req[`serviceProviderData`][`default_clinic`],
            date_of_issue: req?.body?.date_of_issue == undefined ? null : req?.body?.date_of_issue,
            duration_from: req?.body?.duration_from == undefined ? null : req?.body?.duration_from,
            duration_to: req?.body?.duration_to == undefined ? null : req?.body?.duration_to,
            diagonosis: req?.body?.diagonosis == undefined ? null : req?.body?.diagonosis,
            date_of_resumption: req?.body?.date_of_resumption == undefined ? null : req?.body?.date_of_resumption,
        })
        if (medicalCertificateModel.duration_to > medicalCertificateModel.duration_from) {
            medicalCertificateModel.save();
            if (medicalCertificateModel) {
                res.status(200).json(
                    {
                        status: true,
                        message: 'Medical certificate created successfully',
                        data: medicalCertificateModel,
                    },
                );
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Medical certifiicate creation failed',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'end date earlier than the starter one!',
                    data: [],
                }
            )
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

export async function updateMedicalCertificatee(req: any, res: any) {
    try {
        if (req?.params?.certificate_id) {
            mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_medical_certificate", medical_Certificate)
                .find({ certificate_id: req?.params?.certificate_id })
                .then((result) => {
                    if (result.length != 0) {
                        const updateObject = {
                            consumer_id: req?.body?.consumer_id == undefined ? null : req?.body?.consumer_id,
                            date_of_issue: req?.body?.date_of_issue == undefined ? null : req?.body?.date_of_issue,
                            duration_from: req?.body?.duration_from == undefined ? null : req?.body?.duration_from,
                            duration_to: req?.body?.duration_to == undefined ? null : req?.body?.duration_to,
                            diagonosis: req?.body?.diagonosis == undefined ? null : req?.body?.diagonosis,
                            date_of_resumption: req?.body?.date_of_resumption == undefined ? null : req?.body?.date_of_resumption
                        }
                        if (updateObject.duration_to > updateObject.duration_from) {
                            mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_medical_certificate", medical_Certificate).updateOne({ certificate_id: req?.params?.certificate_id }, { $set: updateObject })
                                .then((value) => {
                                    res.status(200).json(
                                        {
                                            status: true,
                                            message: 'success',
                                            data: {},
                                        },
                                    );
                                })
                        } else {
                            res.status(200).json(
                                {
                                    status: false,
                                    message: 'end date earlier than the starter one!',
                                    data: [],
                                }
                            )
                        }
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Not exist!',
                                error: [],
                            },
                        );
                    }
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


