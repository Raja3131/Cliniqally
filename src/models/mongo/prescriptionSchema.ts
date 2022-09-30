
import mongoose from 'mongoose';

const { Schema } = mongoose;

export const prescription = {
    "Schema": new Schema(
        {
            record_id: {
                type: String
            },
            consumer_id: {
                type: String
            },
            provider_id: {
                type: String
            },
            center_id: {
                type: String
            }
            ,
            appointment_id: {
                type: String
            }
            ,
            medicine_id: {
                type: String
            },
            medicine: {
                type: String
            },
            description: {
                type: String
            }

        }), "key": "prescriptions"
}

