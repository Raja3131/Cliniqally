
import { v4 as uuidv4 } from 'uuid';
import { GenerateInvoiceSchema } from '../../../models/mongo/generateInvoiceModel';
import { medicalRecords } from "../../../models/mongo/medicalRecordModel";
import { prescription } from '../../../models/mongo/prescriptionSchema';
import { cachingType, getMongooseModel, vaasPgQuery } from '../../../services/vaasdbengine';

export async function addMedicalRecord(req: any, res: any) {
    try {
        getMongooseModel(medicalRecords, req[`serviceProviderData`][`default_clinic`])
            .then((result: any) => {
                const executeMedicalRecordModel = new result({
                    record_id: uuidv4(),
                    provider_id: req[`serviceProviderData`][`provider_id`],
                    consumer_id: req?.body?.consumer_id == undefined ? null : req?.body?.consumer_id,
                    center_id: req[`serviceProviderData`][`default_clinic`],
                    recordType: req?.body?.record_type == undefined ? null : req?.body?.record_type,
                    file_path: req?.body?.file_path == undefined ? null : req?.body?.file_path,
                    appointment_id: req?.body?.appointment_id == undefined ? null : req?.body?.appointment_id
                }).save()
                if (executeMedicalRecordModel) {
                    res.status(200).json(
                        {
                            status: true,
                            message: 'executeMedicalRecords created successfully',
                            data: executeMedicalRecordModel,
                        },
                    );
                } else {
                    res.status(200).json(
                        {
                            status: false,
                            message: 'Medical records creation failed',
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

export async function getMedicalRecordByConsumerId(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const arrayFullOfPromises: any = [];
            arrayFullOfPromises.push(getMongooseModel(medicalRecords, req[`serviceProviderData`][`default_clinic`]));
            arrayFullOfPromises.push(getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`]));
            Promise.all(arrayFullOfPromises).then((values: any[]) => {
                const records = values[0].find({ consumer_id: req?.params?.consumer_id }).exec();
                const prescriptionSchema = values[1].find({ consumer_id: req?.params?.consumer_id }).exec();
                Promise.all([records, prescriptionSchema]).then((datas: any) => {
                    const resultData = datas[0].concat(datas[1]);
                    if ((resultData.length) !== 0) {
                        return res.status(200).json({
                            status: true,
                            message: "Medical records Listed Successfully",
                            data: resultData,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Medical records not exist',
                                error: [],
                            },
                        );
                    }
                });
            });
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: ' Enter the consumer Id',
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
export async function getMedicalRecordByRecordId(req: any, res: any) {
    try {
        if (req?.params?.record_id) {
            const arrayFullOfPromises: any = [];
            arrayFullOfPromises.push(getMongooseModel(medicalRecords, req[`serviceProviderData`][`default_clinic`]));
            arrayFullOfPromises.push(getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`]));
            Promise.all(arrayFullOfPromises).then((values: any[]) => {
                const records = values[0].find({ record_id: req?.params?.record_id }).exec();
                const prescriptionSchema = values[1].find({ record_id: req?.params?.record_id }).exec();
                Promise.all([records, prescriptionSchema]).then((datas: any) => {
                    const resultData = datas[0].concat(datas[1]);
                    if ((resultData.length) !== 0) {
                        return res.status(200).json({
                            status: true,
                            message: "Medical records Listed Successfully",
                            data: resultData,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Medical records not exist',
                                error: [],
                            },
                        );
                    }
                });
            });

        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Medical record not exist',
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
export async function getMedicalRecordByAppointmentId(req: any, res: any) {
    try {
        if (req?.params?.appointment_id) {
            const arrayFullOfPromises: any = [];
            arrayFullOfPromises.push(getMongooseModel(medicalRecords, req[`serviceProviderData`][`default_clinic`]));
            arrayFullOfPromises.push(getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`]));
            Promise.all(arrayFullOfPromises).then((values: any[]) => {
                const records = values[0].find({ appointment_id: req?.params?.appointment_id }).exec();
                const prescriptionSchema = values[1].find({ appointment_id: req?.params?.appointment_id }).exec();
                Promise.all([records, prescriptionSchema]).then((datas: any) => {
                    const resultData = datas[0].concat(datas[1]);
                    if ((resultData.length) !== 0) {
                        return res.status(200).json({
                            status: true,
                            message: "Medical records Listed Successfully",
                            data: resultData,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Medical records not exist',
                                error: [],
                            },
                        );
                    }
                });
            });
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Attachments not exist',
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

export async function getAllListByConsumerId(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const arrayFullOfPromises: any = [];
            const tableCenterId = req[`serviceProviderData`][`default_clinic`].replace(/-/g, "_");
            const ConsumerID = req?.params?.consumer_id == undefined ? null : req?.params?.consumer_id;
            const getQuery = `SELECT * FROM sc_${tableCenterId}_appointments WHERE consumer_id = '${ConsumerID}'`;
            arrayFullOfPromises.push(getMongooseModel(medicalRecords, req[`serviceProviderData`][`default_clinic`]));
            arrayFullOfPromises.push(getMongooseModel(prescription, req[`serviceProviderData`][`default_clinic`]));
            arrayFullOfPromises.push(getMongooseModel(GenerateInvoiceSchema, req[`serviceProviderData`][`default_clinic`]));
            Promise.all(arrayFullOfPromises).then((values: any[]) => {
                const records = values[0].count({ consumer_id: ConsumerID }).exec();
                const prescriptionSchema = values[1].count({ consumer_id: ConsumerID }).exec();
                const invoice = values[2].count({ consumer_id: ConsumerID }).exec();
                const appointments = vaasPgQuery(getQuery, [], cachingType.StandardCache);
                Promise.all([records, prescriptionSchema, invoice, appointments]).then((datas: any) => {
                    const data = {
                        "All Visits": datas[3].queryResponse.length,
                        "Medications": datas[1],
                        "Attachements": datas[0] + datas[1],
                        "All Invoices": datas[2],
                        "Payment Plans": 0,
                    }
                    if (data) {
                        return res.status(200).json({
                            status: true,
                            message: "Medical records Listed Successfully",
                            data: data,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Medical records not exist',
                                error: [],
                            },
                        );
                    }
                });
            });
        } else {

            res.status(200).json(
                {
                    status: false,
                    message: 'Attachments not exist',
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
