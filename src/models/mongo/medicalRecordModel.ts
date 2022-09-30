import mongoose from 'mongoose';

const { Schema } = mongoose;

export const medicalRecords =
{
    "Schema": new Schema(
        {
            record_id: {
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
            }
            ,
            record_type: {
                type: String
            }
            ,
            file_path: {
                type: String
            },
            appointment_id: {
                type: String
            }
        }), "key": "medical_records"
};
