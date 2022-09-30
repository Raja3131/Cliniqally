import mongoose from 'mongoose';

const { Schema } = mongoose;

export const medical_Certificate = new Schema(
    {
        certificate_id: {
            type: String
        },
        provider_id: {
            type: String
        },
        consumer_id: {
            type: String
        },
        center_id: {
            type: String
        },
        date_of_issue: {
            type: String
        },
        duration_from: {
            type: String
        },
        duration_to: {
            type: String
        },
        diagonosis: {
            type: String
        },
        date_of_resumption: {
            type: String
        },
    },
    {
        timestamps: true,
    });


