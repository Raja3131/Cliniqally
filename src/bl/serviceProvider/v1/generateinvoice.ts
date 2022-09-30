import { v4 as uuidv4 } from 'uuid';
import { GenerateInvoiceSchema } from "../../../models/mongo/generateInvoiceModel";
import mongoose from 'mongoose';
export async function createInvoice(req: any, res: any) {
    try {
        const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_invoice", GenerateInvoiceSchema.Schema);
        const generateInvoiceModel = new model({
            invoice_id: uuidv4(),
            provider_id: req[`serviceProviderData`][`provider_id`],
            appointment_id: req?.body?.appointment_id == undefined ? null : req?.body?.appointment_id,
            consumer_id: req?.body?.consumer_id == undefined ? null : req?.body?.consumer_id,
            center_id: req[`serviceProviderData`][`default_clinic`],
            invoice_type: req?.body?.invoice_type == undefined ? null : req?.body?.invoice_type,
            payment_plan: req?.body?.payment_plan == undefined ? null : req?.body?.payment_plan,
            charges: req?.body?.charges == undefined ? null : req?.body?.charges,
            dicount: req?.body?.dicount == undefined ? null : req?.body?.dicount,
            total: req?.body?.total == undefined ? null : req?.body?.total
        })
        generateInvoiceModel.save();
        if (generateInvoiceModel) {
            res.status(200).json(
                {
                    status: true,
                    message: 'Invoice created successfully',
                    data: generateInvoiceModel,
                },
            );
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Invoice creation failed',
                    data: [],
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
export async function updatecreateInvoice(req: any, res: any) {
    try {
        const generateInvoiceModel = {
            invoice_type: req?.body?.invoice_type == undefined ? null : req?.body?.invoice_type,
            payment_plan: req?.body?.payment_plan == undefined ? null : req?.body?.payment_plan,
            charges: req?.body?.charges == undefined ? null : req?.body?.charges,
            dicount: req?.body?.dicount == undefined ? null : req?.body?.dicount,
            total: req?.body?.total == undefined ? null : req?.body?.total
        }
        mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_invoice", GenerateInvoiceSchema.Schema)
            .updateOne({ "invoice_id": req.params.invoice_id }, { $set: generateInvoiceModel }).then((result) => {
                if (result) {
                    res.status(200).json(
                        {
                            status: true,
                            message: 'Invoice updated successfully',
                            data: result,
                        },
                    );
                } else {
                    res.status(200).json(
                        {
                            status: false,
                            message: 'Invoice updated failed',
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
export async function getAllInvoice(req: any, res: any) {
    try {
        if (req?.params?.appointment_id) {
            mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_invoice", GenerateInvoiceSchema.Schema)
                .find({ appointment_id: req?.params?.appointment_id })
                .then((result) => {
                    if (result.length != 0) {
                        return res.status(200).json({
                            status: true,
                            message: "Invoice Listed Successfully",
                            data: result,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Invoice not exist',
                                error: [],
                            },
                        );
                    }
                })
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Enter valid appointment Id not exist',
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
export async function getInvoice(req: any, res: any) {
    try {
        if (req?.params?.invoice_id) {
            mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_invoice", GenerateInvoiceSchema.Schema)
                .find({ invoice_id: req?.params?.invoice_id })
                .then((result) => {
                    if (result.length != 0) {
                        return res.status(200).json({
                            status: true,
                            message: "Invoice  Successfully",
                            data: result,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Invoice not exist',
                                error: [],
                            },
                        );
                    }
                })
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Enter valid Invoice Id not exist',
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
export async function listAllInvoiceByDate(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_invoice", GenerateInvoiceSchema.Schema)
                .find({ consumer_id: req?.params?.consumer_id }).sort({ createdAt: -1 })
                .then((result) => {
                    if (result.length != 0) {
                        return res.status(200).json({
                            status: true,
                            message: "Invoice Listed Successfully",
                            data: result,
                        });
                    } else {
                        res.status(200).json(
                            {
                                status: false,
                                message: 'Invoice not exist',
                                error: [],
                            },
                        );
                    }
                })
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Enter valid appointment Id not exist',
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