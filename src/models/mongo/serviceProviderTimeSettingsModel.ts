import mongoose from 'mongoose';

const { Schema } = mongoose;

export const appointmentTimeSettings = new Schema(
    {
        time_id: {
            type: String
        },
        provider_id: {
            type: String
        },
        center_id: {
            type: String
        },
        consumer_type: {
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
export const appointmentTimeSetting = mongoose.model('appointmentTimeSetting', appointmentTimeSettings);




