import mongoose from 'mongoose';

const { Schema } = mongoose;

export const serviceProvider = new Schema(
    {
        provider_id: {
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
        updated_by: {
            type: String
        },
        updated_user_from: {
            type: String
        },
        updated_at: {
            type: Date
        }
    }, {
    timestamps: true,
});
export const serviceProviderSchema = mongoose.model('serviceProvider', serviceProvider);




