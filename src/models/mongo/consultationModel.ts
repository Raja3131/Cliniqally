import mongoose from 'mongoose';

const { Schema } = mongoose;

const examination = {
    bp: {
        type: String
    },
    weight: {
        type: String
    },
    temp: {
        type: String
    },
    height: {
        type: String
    },
    respiratory_rate: {
        type: String
    },
    pulse: {
        type: String
    },
    examination_notes: {
        type: String
    }
}

const medication = {
    medicine_id: {
        type: String
    },
    instruction: {
        type: String
    }
}

export const consultationInfo = new Schema(
    {
        consultation_id: {
            type: String
        },
        center_id: {
            type: String
        },
        appointment_id: {
            type: String
        },
        provider_id: {
            type: String
        },
        consumer_id: {
            type: String
        },
        chief_complaint: {
            type: String
        },
        examination: examination,
        medication: [medication],
        diagnosis: {
            type: String
        },
        procedures: {
            type: String
        },
        investigation: {
            type: String
        },
        advice: {
            type: String
        },
        consultation_status: {
            type: String
        },
        created_by: {
            type: String
        },
        created_user_from: {
            type: String
        },
        updated_by: {
            type: Date
        },
        updated_user_from: {
            type: String
        },
        deleted_at: {
            type: Date
        },
        deleted_by: {
            type: String
        },
        deleted_user_from: {
            type: String
        }
    }, {
    timestamps: true,
});