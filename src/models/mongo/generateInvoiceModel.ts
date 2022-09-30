import mongoose from 'mongoose';

const { Schema } = mongoose;

export const GenerateInvoiceSchema = {
    "Schema": new Schema(
        {
            invoice_id: {
                type: String
            },
            provider_id: {
                type: String
            },
            consumer_id: {
                type: String
            },
            appointment_id: {
                type: String
            },
            center_id: {
                type: String
            }
            ,
            invoice_type: {
                type: String
            }
            ,
            payment_plan: {
                type: String
            },
            charges: {
                type: Number
            },
            dicount: {
                type: Number
            },
            total: {
                type: Number
            }
        },
        { timestamps: true }), "key": "invoices"
};



