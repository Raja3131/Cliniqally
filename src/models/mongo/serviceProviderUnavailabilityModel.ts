import mongoose from 'mongoose';

const { Schema } = mongoose;

export const appointmentUnavailable = new Schema(
    {
        unavail_id: {
            type: String
        },
        provider_id: {
            type: String
        },
        center_id: {
            type: String
        },
        deleted_by: {
            type: String
        },
        deleted_user_from: {
            type: String
        },
        deleted_at: {
            type: Date
        },
        created_by: {
            type: String
        },
        created_user_from: {
            type: String
        },
        updated_at: {
            type: Date
        }
    }, {
    timestamps: true,
});




