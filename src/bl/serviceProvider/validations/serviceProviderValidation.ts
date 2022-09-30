import { body, ValidationChain, validationResult } from "express-validator";
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export const validate = (validations: ValidationChain[]) => {
    return async (req: Express.Request, res: any, next: any) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        let messages = '';
        errors.array().forEach(element => {
            messages += (element.msg + '\n');
        });
        res.status(200).json({ status: false, data: errors.array(), message: messages });
    };
};
export const serviceProviderProfileValidation = () => {
    return [
        body("first_name")
            .notEmpty()
            .withMessage("First name is required"),
        body("dob")
            .notEmpty()
            .withMessage("Date of Birth is required"),
        body("country")
            .notEmpty()
            .withMessage("Country is required")
    ];
};

export const serviceProviderSignUpEmailValidation = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid Email")
            .custom(async (email) => {
                const query = `SELECT * FROM service_providers WHERE email = '${email}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.NoCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Email already in use')
                }
            })
    ];
};

export const serviceProviderSignUpMobileValidation = () => {
    return [
        body("mobile")
            .notEmpty()
            .withMessage("Mobile is required")
            .isNumeric()
            .withMessage("Mobile Number only accept numbers")
            .custom(async (mobile) => {
                const query = `SELECT * FROM service_providers WHERE mobile = '${mobile}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.StandardCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Mobile Number already in use')
                }
            })
    ];
};

export const createClinicValidation = () => {
    return [
        body("email")
            .notEmpty()
            .withMessage("email is required"),
        body("clinic_name")
            .notEmpty()
            .withMessage("Clinic name is required"),
    ];
};

export const serviceProviderProfileCreationValidation = () => {
    return [
        body("dob")
            .notEmpty()
            .withMessage("Date of Birth is required"),
        body("gender")
            .notEmpty()
            .withMessage("gender is required"),
        body("degree")
            .notEmpty()
            .withMessage("degree is required"),
        body("reg_number")
            .notEmpty()
            .withMessage("reg_number is required"),
        body("reg_name")
            .notEmpty()
            .withMessage("reg_name is required"),
        body("specialization")
            .notEmpty()
            .withMessage("specialization is required"),
        body("licenseNumber")
            .notEmpty()
            .withMessage("licenseNumber is required"),
        body("address")
            .notEmpty()
            .withMessage("address is required"),
        body("country")
            .notEmpty()
            .withMessage("country is required"),
        body("state")
            .notEmpty()
            .withMessage("state is required"),
        body("city")
            .notEmpty()
            .withMessage("city is required")
    ];
};

export const serviceProviderFirstSignupValidation = () => {
    return [
        body("firstName")
            .notEmpty()
            .withMessage("Name is required"),
        body("lastName")
            .notEmpty()
            .withMessage("Name is required"),
        body("countryCode")
            .notEmpty()
            .withMessage("country_code is required"),
        body("mobileNumber")
            .notEmpty()
            .withMessage("Mobile is required")
            .isNumeric()
            .withMessage("Mobile Number only accept numbers")
            .custom(async (mobile) => {
                const query = `SELECT mobile FROM service_providers WHERE mobile = '${mobile}'`;
                const existingUser = await vaasPgQuery(query, [], cachingType.StandardCache)
                if (existingUser?.queryResponse?.length !== 0) {
                    throw new Error('Mobile Number already in use')
                }
            })
    ];
};

export const serviceProviderFinalSignupValidation = () => {
    return [
        body("firstName")
            .notEmpty()
            .withMessage("Name is required"),
        body("lastName")
            .notEmpty()
            .withMessage("Name is required"),
        body("mobileNumber")
            .notEmpty()
            .withMessage("Mobile is required")
            .isNumeric()
            .withMessage("Mobile Number only accept numbers"),
        body("countryCode")
            .notEmpty()
            .withMessage("country_code is required"),
        body("otp")
            .notEmpty()
            .withMessage("otp is required"),
    ];
};

export const serviceProviderProfileUpdateValidation = () => {
    return [
        body("first_name")
            .notEmpty()
            .withMessage("first_name is required"),
        body("last_name")
            .notEmpty()
            .withMessage("last_name is required"),
        body("dob")
            .notEmpty()
            .withMessage("Date of Birth is required"),
        body("age")
            .notEmpty()
            .withMessage(" age is required"),
        body("pincode")
            .notEmpty()
            .withMessage("pincode is required"),
        body("about")
            .notEmpty()
            .withMessage("about is required"),
        body("language")
            .notEmpty()
            .withMessage("language is required"),
        body("gender")
            .notEmpty()
            .withMessage("gender is required"),
        body("degree")
            .notEmpty()
            .withMessage("degree is required"),
        body("reg_number")
            .notEmpty()
            .withMessage("reg_number is required"),
        body("reg_name")
            .notEmpty()
            .withMessage("reg_name is required"),
        body("specialization")
            .notEmpty()
            .withMessage("specialization is required"),
        body("licenseNumber")
            .notEmpty()
            .withMessage("licenseNumber is required"),
        body("address")
            .notEmpty()
            .withMessage("address is required"),
        body("country")
            .notEmpty()
            .withMessage("country is required"),
        body("state")
            .notEmpty()
            .withMessage("state is required"),
        body("city")
            .notEmpty()
            .withMessage("city is required")
    ];
};

export const feeValidation = () => {
    return [
        body("e_clinic_fee")
            .notEmpty()
            .withMessage("e clinic fee is required"),
        body("clinic_fee")
            .notEmpty()
            .withMessage("clinic fee is required"),
        body("follow_up_fee")
            .notEmpty()
            .withMessage("follow up fee is required"),
        body("companion_mode_fee")
            .notEmpty()
            .withMessage("companion mode fee is required"),
    ];
};

export const customFollowUpValidation = () => {
    return [
        body("consultation_duration")
            .notEmpty()
            .withMessage("consultation duration call fee is required"),
        body("free_days_follow_up")
            .notEmpty()
            .withMessage("free days follow up is required"),
        body("set_appointments")
            .notEmpty()
            .withMessage("set appointments is required"),
        body("fee_after_free_days")
            .notEmpty()
            .withMessage("fee after free days is required"),
    ];
};

export const appointmentValidation = () => {
    return [
        body("consumer_id")
            .notEmpty()
            .withMessage("consumer id is required"),
        body("appointment_mode")
            .notEmpty()
            .withMessage("appointment mode is required"),
        body("appointment_date")
            .notEmpty()
            .withMessage("appointment date is required"),
    ];
};


export const appointmentSettingsValidation = () => {
    return [
        body("session_type")
            .notEmpty()
            .withMessage("Session Type is required")
            .isIn(['Video', 'Chat', 'In_clinic'])
            .withMessage("Invalid Session Type"),
        body("duration")
            .notEmpty()
            .withMessage("Duration is required"),
        body("providerTimings")
            .notEmpty()
            .withMessage("Timings required"),
    ];
}

export const mrSettingsValidation = () => {
    return [
        body("session_type")
            .notEmpty()
            .withMessage("Session Type is required")
            .isIn(['In_clinic'])
            .withMessage("Invalid Session Type"),
        body("duration")
            .notEmpty()
            .withMessage("Duration is required"),
        body("providerTimings")
            .notEmpty()
            .withMessage("Timings required"),
    ];
}
export const serviceProviderMedicalCertificateCreationValidation = () => {
    return [
        body("centerId")
            .notEmpty()
            .withMessage("centerId is required"),
        body("consumerId")
            .notEmpty()
            .withMessage("consumerId is required"),
        body("issuedAt")
            .notEmpty()
            .withMessage("date of issue is required"),
        body("from")
            .notEmpty()
            .withMessage("duration from is required"),
        body("to")
            .notEmpty()
            .withMessage("duration to is required"),
        body("diagnosis")
            .notEmpty()
            .withMessage("diagnosis is required"),
        body("resumption")
            .notEmpty()
            .withMessage("date of resumption is required"),
    ];
};
export const medicalRecordValidation = () => {
    return [
        body("record_type")
            .notEmpty()
            .withMessage("Record type is required"),
        body("file_path")
            .notEmpty()
            .withMessage("File path is required")
    ];
};
export const prescriptionValidation = () => {
    return [
        body("medicine")
            .notEmpty()
            .withMessage("Record type is required"),
        body("description")
            .notEmpty()
            .withMessage("File path is required")
    ];
};
export const createProfileValidation = () => {
    return [
        body("degree")
            .notEmpty()
            .withMessage("degree is required"),
        body("reg_number")
            .notEmpty()
            .withMessage("reg number is required"),
        body("reg_name")
            .notEmpty()
            .withMessage("reg name is required"),
        body("specialization")
            .notEmpty()
            .withMessage("specialization is required"),
    ];
};
