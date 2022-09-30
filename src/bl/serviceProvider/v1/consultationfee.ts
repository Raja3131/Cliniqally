import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';


export async function createConsultationFee(req: any, res: any) {
    try {
        const provider_id = req[`serviceProviderData`][`provider_id`];
        const center_id = req?.body?.center_id == undefined ? null : req?.body?.center_id;
        const e_clinic_fee = req?.body?.e_clinic_fee == undefined ? null : req?.body?.e_clinic_fee;
        const e_clinic_fee_currency = req?.body?.e_clinic_fee_currency == undefined ? null : req?.body?.e_clinic_fee_currency;
        const clinic_fee = req?.body?.clinic_fee == undefined ? null : req?.body?.clinic_fee;
        const clinic_fee_currency = req?.body?.clinic_fee_currency == undefined ? null : req?.body?.clinic_fee_currency;
        const follow_up_fee = req?.body?.follow_up_fee == undefined ? null : req?.body?.follow_up_fee;
        const follow_up_fee_currency = req?.body?.follow_up_fee_currency == undefined ? null : req?.body?.follow_up_fee_currency;
        const companion_mode_fee = req?.body?.companion_mode_fee == undefined ? null : req?.body?.companion_mode_fee;
        const companion_mode_fee_currency = req?.body?.companion_mode_fee_currency == undefined ? null : req?.body?.companion_mode_fee_currency;
        const feeExist = await vaasPgQuery(`SELECT center_id FROM consultation_fee WHERE center_id = '${center_id}' AND provider_id = '${provider_id}' `, [], cachingType.NoCache);
        if (feeExist.queryResponse.length === 0) {
            const insertQuery = `INSERT INTO consultation_fee (provider_id, center_id, e_clinic_fee, e_clinic_fee_currency, clinic_fee, clinic_fee_currency, follow_up_fee, follow_up_fee_currency, companion_mode_fee, companion_mode_fee_currency, created_by , updated_by ) 
            VALUES ('${provider_id}','${center_id}', '${e_clinic_fee}','${e_clinic_fee_currency}','${clinic_fee}','${clinic_fee_currency}','${follow_up_fee}','${follow_up_fee_currency}','${companion_mode_fee}','${companion_mode_fee_currency}','${provider_id}','${provider_id}')`;
            const executeConsultation = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
            if (executeConsultation) {
                res.status(200).json(
                    {
                        status: true,
                        message: 'Consultation fee created successfully',
                        data: executeConsultation,
                    },
                );
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Consultation fee creation failed',
                        data: [],
                    },
                );
            }
        } else {
            const updatePtsQuery = `UPDATE consultation_fee
            SET   provider_id = '${provider_id}',center_id = '${center_id}',e_clinic_fee = '${e_clinic_fee}',e_clinic_fee_currency = '${e_clinic_fee_currency}', clinic_fee = '${clinic_fee}',
             clinic_fee_currency = '${clinic_fee_currency}', follow_up_fee = '${follow_up_fee}', follow_up_fee_currency = '${follow_up_fee_currency}', companion_mode_fee = '${companion_mode_fee}', companion_mode_fee_currency = '${companion_mode_fee_currency}', created_by = '${provider_id}', updated_by = '${provider_id}'
            WHERE center_id = '${center_id}' AND provider_id = '${provider_id}'`;
            const consultationUpdate = await vaasPgQuery(updatePtsQuery, [], cachingType.NoCache)
            if (consultationUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Consultation Updated Successfully",
                    data: [],
                });
            }
            else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Consultation fee Update failed',
                        error: [],
                    },
                );
            }
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

export async function createCustomFollowUp(req: any, res: any) {
    try {
        const provider_id = req[`serviceProviderData`][`provider_id`];
        const center_id = req?.body?.center_id == undefined ? null : req?.body?.center_id;
        const consultation_duration = req?.body?.consultation_duration == undefined ? null : req?.body?.consultation_duration;
        const free_days_follow_up = req?.body?.free_days_follow_up == undefined ? null : req?.body?.free_days_follow_up;
        const set_appointments = req?.body?.set_appointments == undefined ? null : req?.body?.set_appointments;
        const fee_after_free_days = req?.body?.fee_after_free_days == undefined ? null : req?.body?.fee_after_free_days;
        const fee_after_free_days_currency = req?.body?.fee_after_free_days_currency == undefined ? null : req?.body?.fee_after_free_days_currency;
        const existFollowUp = await vaasPgQuery(`SELECT center_id FROM custom_follow_up WHERE center_id = '${center_id}' AND provider_id = '${provider_id}' `, [], cachingType.NoCache);
        if (existFollowUp.queryResponse.length === 0) {
            const insertQuery = `INSERT INTO custom_follow_up (provider_id, center_id, consultation_duration, free_days_follow_up, set_appointments, fee_after_free_days, fee_after_free_days_currency, created_by , updated_by ) 
            VALUES ('${provider_id}','${center_id}', '${consultation_duration}','${free_days_follow_up}','${set_appointments}','${fee_after_free_days}','${fee_after_free_days_currency}','${provider_id}','${provider_id}')`;
            const executeCustomFollowUp = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
            if (executeCustomFollowUp) {
                res.status(200).json(
                    {
                        status: true,
                        message: 'Custom follow up created successfully',
                        data: executeCustomFollowUp,
                    },
                );
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Custom follow up creation failed',
                        data: [],
                    },
                );
            }
        } else {
            const updateQuery = `UPDATE custom_follow_up
            SET   provider_id = '${provider_id}',center_id = '${center_id}',consultation_duration = '${consultation_duration}',free_days_follow_up = '${free_days_follow_up}', set_appointments = '${set_appointments}',
            fee_after_free_days = '${fee_after_free_days}', fee_after_free_days_currency = '${fee_after_free_days_currency}', created_by = '${provider_id}', updated_by = '${provider_id}'
            WHERE center_id = '${center_id}' AND provider_id = '${provider_id}'`;
            const customFollowUpUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (customFollowUpUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Custom follow up Updated Successfully",
                    data: [],
                });
            }
            else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Custom follow up fee Update failed',
                        error: [],
                    },
                );
            }
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