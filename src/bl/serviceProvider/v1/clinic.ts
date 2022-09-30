import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { centerSchema } from '../../../models/mongo';
import { DayNumber, serviceProviderTokenExpiryDays } from '../../../services/standard';
import { cachingType, getVaasPgClient, vaasPgQuery } from '../../../services/vaasdbengine';

export async function createClinic(req: any, response: any) {
    try {
        const providerDetails = req[`serviceProviderData`]
        const providerId = providerDetails?.provider_id
        let userType = providerDetails?.user_type
        const mobileNumber = providerDetails?.userDetails?.mobileNumber
        const firstName = providerDetails?.userDetails?.firstName
        const lastName = providerDetails?.userDetails?.lastName
        const countryCode = providerDetails?.userDetails?.countryCode
        const centerId = uuidv4();
        const tableCenterId = centerId.replace(/-/g, "_");
        const country = req?.body?.country == undefined ? null : req?.body?.country;
        const timezone = req?.body?.timezone == undefined ? null : req?.body?.timezone;
        const phone_number = req?.body?.phone_number == undefined ? null : req?.body?.phone_number;
        const location = req?.body?.location == undefined ? null : req?.body?.location;
        const profilePicture = req?.body?.profile_picture == undefined ? null : req?.body?.profile_picture;
        const clinicSpecialities = req?.body?.clinic_specialities == undefined ? null : req?.body?.clinic_specialities;
        const about_clinic = req?.body?.about_clinic == undefined ? null : req?.body?.about_clinic;
        const speciality = req?.body?.speciality == undefined ? null : req?.body?.speciality;
        const assistance = req?.body?.assistance == undefined ? null : req?.body?.assistance;
        const representative_code = req?.body?.representative_code == undefined ? null : req?.body?.representative_code;
        let specialityQuery = '';
        let timingQuery = '';
        const clinicTimings = req?.body?.clinicTimings;
        if (speciality?.length > 0) {
            specialityQuery = `INSERT INTO sc_${tableCenterId}_specialization (center_id, speciality) VALUES `;
            for (let i = 0; i < speciality.length; i++) {
                if (req?.body?.speciality[i]) {
                    const last = speciality.length - 1;
                    if (i == last) {
                        specialityQuery += ` ('${centerId}', '${req?.body?.speciality[i]}');`;
                    } else {
                        specialityQuery += ` ('${centerId}', '${req?.body?.speciality[i]}'), `;
                    }
                } else {
                    return response.status(200).json({
                        status: false,
                        message: `Invalid data found while inserting specialization`,
                        data: [],
                    });
                }
            }
        }
        //Insert Time settings
        if (clinicTimings?.length > 0) {
            timingQuery = `INSERT INTO sc_${tableCenterId}_timings (time_id, center_id, day, start_time, end_time, start_timestamp, end_timestamp) VALUES `;
            for (let i = 0; i < clinicTimings?.length; i++) {
                if (clinicTimings[i]) {
                    const last = clinicTimings?.length - 1;
                    const { day, timing } = clinicTimings[i];
                    for (let j = 0; j < timing?.length; j++) {
                        const timeId = uuidv4();
                        const { startTime, endTime, start_timestamp, end_timestamp } = timing[j];
                        timingQuery += ` ('${timeId}','${centerId}','${DayNumber[day]}','${startTime}', '${endTime}', '${start_timestamp}', '${end_timestamp}' ), `;
                    }
                } else {
                    return response.status(200).json({
                        status: false,
                        message: `Invalid data found while inserting clinic time`,
                        data: [],
                    });
                }
            }
            timingQuery = timingQuery.replace(/,\s*$/, "");
        }
        //DB Transaction Starts...
        getVaasPgClient((err: any, client: any, done: any, res: any) => {
            const start = Date.now();
            const shouldAbort = (err: any) => {
                if (err) {
                    const errorFound = err;
                    client.query('ROLLBACK', (err: any) => {
                        if (err) {
                            console.log('error', err);
                        }
                        done()
                        response.status(200).json({
                            status: false,
                            message: "Something went wrong, Try Again",
                            data: errorFound,
                        });
                    })
                }
                return !!err
            }
            client.query('BEGIN', (err: any, res: any) => {
                if (shouldAbort(err)) return
                /* Insert Data to Service centers table */
                const insertCenterQuery = `INSERT INTO service_centers (name, email, center_id, country_code, phone_number, type, location, about_clinic, got_assistance, representative_code, country, timezone) VALUES ('${req?.body?.name}','${req?.body?.email}','${centerId}', '${countryCode}','${phone_number}', '${req?.body?.type}','${location}','${about_clinic}','${assistance}','${representative_code}', '${country}', '${timezone}')`;
                client.query(insertCenterQuery, [], (err: any, res: any) => {
                    if (shouldAbort(err)) return
                    const insertProviderClinicsQuery = `INSERT INTO provider_clinics (provider_id, center_id, created_by, updated_by ) VALUES ('${providerId}', '${centerId}', '${providerId}', '${providerId}')`;
                    client.query(insertProviderClinicsQuery, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return
                        const createClinicTable = `CREATE TABLE sc_${tableCenterId}_providers (
            center_id UUID NOT NULL,
            provider_id UUID NOT NULL,
            FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
            FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
            user_type VARCHAR(64) NOT NULL,
            is_active BOOLEAN NOT NULL
            )`;
                        client.query(createClinicTable, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return
                            const clinicImagesTable = `CREATE TABLE sc_${tableCenterId}_images (
                                id serial PRIMARY KEY,
                                img_id UUID UNIQUE NOT NULL,
                    center_id UUID NOT NULL,
                    FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                    image_path VARCHAR(255)
                    )`;
                            client.query(clinicImagesTable, [], (err: any, res: any) => {
                                if (shouldAbort(err)) return
                                const clinicPivotQuery = `INSERT INTO sc_${tableCenterId}_providers (center_id, provider_id, user_type, is_active) VALUES ('${centerId}', '${providerId}', 'admin', true)`;
                                client.query(clinicPivotQuery, [], (err: any, res: any) => {
                                    if (shouldAbort(err)) return
                                    const clinicSpecializationQuery = `CREATE TABLE sc_${tableCenterId}_specialization (
                        id serial PRIMARY KEY,
                        center_id UUID NOT NULL,
                        FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                        speciality UUID NOT NULL,
                        FOREIGN KEY (speciality) REFERENCES clinic_specialities (clinic_speciality_id)
                    )`;
                                    client.query(clinicSpecializationQuery, [], (err: any, res: any) => {
                                        if (shouldAbort(err)) return
                                        const clinicSpecializationInsert = specialityQuery
                                        client.query(clinicSpecializationInsert, [], (err: any, res: any) => {
                                            if (shouldAbort(err)) return
                                            const clinicTimingsQuery = `CREATE TABLE sc_${tableCenterId}_timings (
                                id serial PRIMARY KEY,
                                time_id UUID UNIQUE NOT NULL,
                                day VARCHAR(64) NOT NULL,
                                center_id UUID NOT NULL,
                                FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                start_time VARCHAR(64) NOT NULL,
                                end_time VARCHAR(64) NOT NULL,
                                start_timestamp TIMESTAMP NOT NULL,
                                end_timestamp TIMESTAMP NOT NULL,
                                created_at TIMESTAMP DEFAULT NOW()
                            )`;
                                            client.query(clinicTimingsQuery, [], (err: any, res: any) => {
                                                if (shouldAbort(err)) return
                                                const clinicTimingsInsert = timingQuery;
                                                client.query(clinicTimingsInsert, [], (err: any, res: any) => {
                                                    if (shouldAbort(err)) return
                                                    //sc_centerId_roles
                                                    const rolesQuery = `CREATE TABLE sc_${tableCenterId}_roles (
                    id serial PRIMARY KEY,
                    role_id UUID UNIQUE NOT NULL,
                    role_slug VARCHAR(255) UNIQUE NOT NULL,
                    center_id UUID NOT NULL,
                    provider_id UUID NOT NULL,
                    FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                    FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id)
                )`;
                                                    client.query(rolesQuery, [], (err: any, res: any) => {
                                                        if (shouldAbort(err)) return
                                                        const rolesPivotQuery = `CREATE TABLE sc_${tableCenterId}_pr_roles (
                        center_id UUID NOT NULL,
                        provider_id UUID NOT NULL,
                        role_id UUID NOT NULL,
                        FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                        FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                        FOREIGN KEY (role_id) REFERENCES sc_${tableCenterId}_roles (role_id)
                    )`;
                                                        client.query(rolesPivotQuery, [], (err: any, res: any) => {
                                                            if (shouldAbort(err)) return
                                                            //sc_centerId_provider_appointment_settings
                                                            const appointmentSettingsQuery = `CREATE TABLE sc_${tableCenterId}_pr_time_settings (
                            id serial PRIMARY KEY,
                            time_id UUID UNIQUE NOT NULL,
                            session_type session_types,
                            center_id UUID NOT NULL,
                            provider_id UUID NOT NULL,
                            FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                            FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                            start_date TIMESTAMP NOT NULL,
                            end_date TIMESTAMP NOT NULL,
                            appointment_duration INTEGER NOT NULL,
                            start_time VARCHAR(64) NOT NULL,
                            end_time VARCHAR(64) NOT NULL,
                            un_available BOOLEAN DEFAULT false,
                            temporarily_unavailable BOOLEAN DEFAULT false,
                            consumer_type consumer_types,
                            created_at TIMESTAMP DEFAULT NOW()
                        )`;
                                                            client.query(appointmentSettingsQuery, [], (err: any, res: any) => {
                                                                if (shouldAbort(err)) return
                                                                //sc_centerId_provider_appointment_unavailability
                                                                const appointmentUnavailabilityQuery = `CREATE TABLE sc_${tableCenterId}_pr_unavailabilities (
                                id serial PRIMARY KEY,
                                unavail_id UUID NOT NULL,
                                session_type session_types,
                                center_id UUID NOT NULL,
                                provider_id UUID NOT NULL,
                                FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                start_date TIMESTAMP NOT NULL,
                                end_date TIMESTAMP NOT NULL,
                                appointment_duration INTEGER NOT NULL,
                                start_time VARCHAR(64) NOT NULL,
                                end_time VARCHAR(64) NOT NULL
                            )`;
                                                                client.query(appointmentUnavailabilityQuery, [], (err: any, res: any) => {
                                                                    if (shouldAbort(err)) return
                                                                    //sc_centerId_appointments
                                                                    const appointmentAppointmentsQuery = `CREATE TABLE sc_${tableCenterId}_appointments (
                                    id serial PRIMARY KEY,
                                    appointment_id UUID UNIQUE NOT NULL,
                                    appointment_mode session_types,
                                    center_id UUID NOT NULL,
                                    provider_id UUID NOT NULL,
                                    consumer_id UUID NOT NULL,
                                    FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                    FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                    FOREIGN KEY (consumer_id) REFERENCES service_consumers (consumer_id),
                                    notify_via_whatsapp BOOLEAN DEFAULT false,
                                    notify_via_sms BOOLEAN DEFAULT false,
                                    planned_procedures TEXT,
                                    notes TEXT,
                                    appointment_time VARCHAR(64) NOT NULL,
                                    appointment_duration INTEGER NOT NULL,
                                    appointment_date TIMESTAMP NOT NULL,
                                    created_at TIMESTAMP DEFAULT NOW(),
                                    created_by UUID NOT NULL,
                                    status VARCHAR(64),
                                    delay SMALLINT DEFAULT 0
                                )`;
                                                                    client.query(appointmentAppointmentsQuery, [], (err: any, res: any) => {
                                                                        if (shouldAbort(err)) return
                                                                        //sc_centerId_appointment_timings
                                                                        const appointmentTimingQuery = `CREATE TABLE sc_${tableCenterId}_appointment_timings (
                                        id serial PRIMARY KEY,
                                        appointment_mode session_types,
                                        center_id UUID NOT NULL,
                                        provider_id UUID NOT NULL,
                                        appointment_id UUID NOT NULL,
                                        FOREIGN KEY (appointment_id) REFERENCES sc_${tableCenterId}_appointments (appointment_id),
                                        FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                        FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                        appointment_date TIMESTAMP NOT NULL,
                                        appointment_start_time VARCHAR(64) NOT NULL,
                                        appointment_end_time VARCHAR(64) NOT NULL,
                                        notes TEXT,
                                        created_at TIMESTAMP NOT NULL
                                    )`;
                                                                        client.query(appointmentTimingQuery, [], (err: any, res: any) => {
                                                                            if (shouldAbort(err)) return
                                                                            //sc_centerId_block_timings
                                                                            const appointmentBlockQuery = `CREATE TABLE sc_${tableCenterId}_block_timings (
                                            id serial PRIMARY KEY,
                                            block_id UUID NOT NULL,
                                            appointment_mode session_types,
                                            center_id UUID NOT NULL,
                                            provider_id UUID NOT NULL,
                                            FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                            FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                            appointment_date TIMESTAMP NOT NULL,
                                            appointment_start_time VARCHAR(64),
                                            appointment_end_time VARCHAR(64),
                                            notes TEXT,
                                            created_by UUID NOT NULL,
                                            created_at TIMESTAMP DEFAULT NOW()
                                        )`;
                                                                            client.query(appointmentBlockQuery, [], (err: any, res: any) => {
                                                                                if (shouldAbort(err)) return
                                                                                const prFollowUpQuery = `CREATE TABLE sc_${tableCenterId}_pr_consult_fees (
                                                id serial PRIMARY KEY,
                                                block_id UUID NOT NULL,
                                                doctor UUID,
                                                consultation_duration INTEGER NOT NULL,
                                                center_id UUID NOT NULL,
                                                provider_id UUID NOT NULL,
                                                FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                                FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                                free_days_follow_up INTEGER,
                                                set_appointments BOOLEAN DEFAULT false,
                                                fee_after_free_days DECIMAL(10,2),
                                                fee_after_free_days_currency UUID,
                                                FOREIGN KEY (fee_after_free_days_currency) REFERENCES currencies (currency_id),
                                                created_at TIMESTAMP NOT NULL
                                            )`;
                                                                                client.query(prFollowUpQuery, [], (err: any, res: any) => {
                                                                                    if (shouldAbort(err)) return
                                                                                    const consumersQuery = `CREATE TABLE sc_${tableCenterId}_consumers (
                                                        center_id UUID NOT NULL,
                                                        provider_id UUID NOT NULL,
                                                        consumer_id UUID NOT NULL,
                                                        FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                                        FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                                        FOREIGN KEY (consumer_id) REFERENCES service_consumers (consumer_id)
                                                    )`;
                                                                                    client.query(consumersQuery, [], (err: any, res: any) => {
                                                                                        if (shouldAbort(err)) return
                                                                                        // consultation - sc_center_id_consultations
                                                                                        const consultationQuery = `CREATE TABLE sc_${tableCenterId}_consultations (
                                                            id serial PRIMARY KEY,
                                                            consultation_id UUID UNIQUE NOT NULL,
                                                            center_id UUID NOT NULL,
                                                            appointment_id UUID NOT NULL,
                                                            provider_id UUID NOT NULL,
                                                            consumer_id UUID NOT NULL,
                                                            FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                                            FOREIGN KEY (appointment_id) REFERENCES sc_${tableCenterId}_appointments (appointment_id),
                                                            FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                                            FOREIGN KEY (consumer_id) REFERENCES service_consumers (consumer_id),
                                                            chief_complaint TEXT,
                                                            diagnosis TEXT,
                                                            procedures TEXT,
                                                            investigation TEXT,
                                                            advice TEXT,
                                                            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                                            consultation_status VARCHAR(64), 
                                                            deleted BOOLEAN DEFAULT false
                                                        )`; //Consultation status:  Started, InProgress, Completed, Pending
                                                                                        client.query(consultationQuery, [], (err: any, res: any) => {
                                                                                            if (shouldAbort(err)) return
                                                                                            // Consultation Examinations - sc_center_id_consult_examination
                                                                                            const examinationQuery = `CREATE TABLE sc_${tableCenterId}_consult_examinations (
                                                                id serial PRIMARY KEY,
                                                                consultation_id UUID UNIQUE NOT NULL,
                                                                FOREIGN KEY (consultation_id) REFERENCES sc_${tableCenterId}_consultations (consultation_id),
                                                                bp VARCHAR(64),
                                                                weight VARCHAR(64),
                                                                temp VARCHAR(64),
                                                                height VARCHAR(64),
                                                                respiratory_rate VARCHAR(64),
                                                                pulse VARCHAR(64),
                                                                examination_notes TEXT
                                                            )`;
                                                                                            client.query(examinationQuery, [], (err: any, res: any) => {
                                                                                                if (shouldAbort(err)) return
                                                                                                // Consultation Medications - sc_center_id_consult_medications
                                                                                                const medicationsQuery = `CREATE TABLE sc_${tableCenterId}_consult_medications (
                                                                id serial PRIMARY KEY,
                                                                consultation_id UUID NOT NULL,
                                                                FOREIGN KEY (consultation_id) REFERENCES sc_${tableCenterId}_consultations (consultation_id),
                                                                medication_id UUID NOT NULL,
                                                                FOREIGN KEY (medication_id) REFERENCES medications (medication_id),
                                                                instruction VARCHAR(255
                                                            )`;
                                                                                                client.query(medicationsQuery, [], (err: any, res: any) => {
                                                                                                    client.query('COMMIT', async (err: any, req: any, res: any) => {
                                                                                                        if (err) {
                                                                                                            const duration = Date.now() - start
                                                                                                            console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                                                                                        }
                                                                                                        done();
                                                                                                        const duration = Date.now() - start
                                                                                                        console.error(`Time is : ${duration}, All queries done`);
                                                                                                        const setDefaultClinicQuery = `UPDATE service_providers SET default_clinic = '${centerId}' WHERE provider_id = '${providerId}'`;
                                                                                                        const setDefaultClinic = await vaasPgQuery(setDefaultClinicQuery, [], cachingType.NoCache);
                                                                                                        userType = 'admin';
                                                                                                        const clinicLog = {
                                                                                                            'center_id': centerId,
                                                                                                            'updated_by': providerId,
                                                                                                            'updated_user_from': 'service_providers'
                                                                                                        };
                                                                                                        centerSchema.create(clinicLog);
                                                                                                        const token = jwt.sign(
                                                                                                            {
                                                                                                                userDetails: {
                                                                                                                    firstName: firstName,
                                                                                                                    lastName: lastName,
                                                                                                                    countryCode: countryCode,
                                                                                                                    mobileNumber: mobileNumber,
                                                                                                                },
                                                                                                                provider_id: providerId,
                                                                                                                user_type: userType,
                                                                                                                default_clinic: centerId
                                                                                                            },
                                                                                                            String(process.env.JWT_KEY),
                                                                                                            {
                                                                                                                expiresIn: serviceProviderTokenExpiryDays,
                                                                                                            }
                                                                                                            done();
                                                                                                        const duration = Date.now() - start
                                                                                                        console.error(`Time is : ${duration}, All queries done`);
                                                                                                        const setDefaultClinicQuery = `UPDATE service_providers SET default_clinic = '${centerId}' WHERE provider_id = '${providerId}'`;
                                                                                                        const setDefaultClinic = await vaasPgQuery(setDefaultClinicQuery, [], cachingType.NoCache);
                                                                                                        userType = 'admin';
                                                                                                        const clinicLog = {
                                                                                                            'center_id': centerId,
                                                                                                            'updated_by': providerId,
                                                                                                            'updated_user_from': 'service_providers'
                                                                                                        };
                                                                                                        centerSchema.create(clinicLog);
                                                                                                        const token = jwt.sign(
                                                                                                            {
                                                                                                                userDetails: {
                                                                                                                    firstName: firstName,
                                                                                                                    lastName: lastName,
                                                                                                                    countryCode: countryCode,
                                                                                                                    mobileNumber: mobileNumber,
                                                                                                                },
                                                                                                                provider_id: providerId,
                                                                                                                user_type: userType,
                                                                                                                default_clinic: centerId
                                                                                                            },
                                                                                                            String(process.env.JWT_KEY),
                                                                                                            {
                                                                                                                expiresIn: "365d",
                                                                                                            }
                                                                                                        );
                                                                                                        response.status(200).json({
                                                                                                            status: true,
                                                                                                            message: "Clinic Created Successfully",
                                                                                                            data: {
                                                                                                                token,
                                                                                                            },
                                                                                                        });
                                                                                                    })
                                                                                                })
                                                                                            })
                                                                                        })
                                                                                    })
                                                                                })
                                                                            })
                                                                        })
                                                                    })
                                                                })
                                                            })
                                                        })
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
} catch (err) {
    response.status(200).json(
        {
            status: false,
            message: 'Error',
            error: err,
        },
    );
}
}

export async function getClinicById(req: any, res: any) {
    try {
        const centerId = req[`serviceProviderData`][`default_clinic`];
        if (centerId) {
            const tableCenterId = centerId.replace(/-/g, "_");
            const getQuery = `SELECT name, email, sc.center_id, country_code, phone_number, type, location, about_clinic,
            got_assistance, representative_code, timezone, country, (SELECT json_agg(sp.speciality) 
                    FROM sc_${tableCenterId}_specialization AS sp
                    WHERE sc.center_id = sp.center_id
                   ) AS speciality, (SELECT json_agg(img.image_path) 
                   FROM sc_${tableCenterId}_images AS img
                   WHERE sc.center_id = img.center_id
                  ) AS clinic_images, 
                  (SELECT json_agg(json_build_object(
                   'time_id', time_id, 
                   'day', day,
                      'start_time',start_time,
                      'end_time',end_time
               )) AS clinic_timings  
                   FROM sc_${tableCenterId}_timings AS ct
                   WHERE sc.center_id = ct.center_id 
                  ) AS clinic_timings
            FROM  service_centers as sc WHERE sc.center_id ='${centerId}'`;
            const clinicData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            const timing = clinicData.queryResponse[0].clinic_timings;
            const clinicTimings = Object.values(timing.reduce((r: any, { day: day, ...o }: any) => {
                day = DayNumber[day];
                (r[day] ??= { day, timing: [] }).timing.push(o);
                return r;
            }, {}));
            const clinicDetails = clinicData?.queryResponse[0];
            delete clinicDetails.clinic_timings;
            const doctorsQuery = `SELECT sp.provider_id, sp.first_name, sp.last_name, sp.profile_picture, (SELECT json_agg(spe.specialization_id) 
            FROM provider_specialization AS spe
            WHERE sp.provider_id = spe.provider_id
           ) AS specializations, 
            (SELECT json_agg(dg.degree_id) 
            FROM provider_degree AS dg
            WHERE sp.provider_id = dg.provider_id
           ) AS degree
    FROM  service_centers as sc
    LEFT JOIN sc_${tableCenterId}_providers as scp ON scp.center_id = sc.center_id
    LEFT JOIN service_providers as sp ON sp.provider_id = scp.provider_id WHERE sc.center_id ='${centerId}'`;
            const doctors = await vaasPgQuery(doctorsQuery, [], cachingType.StandardCache);
            const staffs = [{
                'provider_id': '',
                'staff_name': 'Parvathy',
                'designation': 'Receptionist',
                'profile_picture': 'img.png'
            }, {
                'provider_id': '',
                'staff_name': 'Sindhu S',
                'designation': 'Pharmacist',
                'profile_picture': 'img.png'
            }];

            if (clinicData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Data Listed Successfully",
                    data: { 'clinicInfo': clinicDetails, 'clinicTimings': clinicTimings, 'doctors': doctors.queryResponse, 'staffs': staffs }
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Clinic not exist',
                    error: [],
                },
            );
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

export async function updateClinic(req: any, response: any) {
    try {
        const providerId = req[`serviceProviderData`][`provider_id`];
        const centerId = req[`serviceProviderData`][`default_clinic`];
        if (centerId) {
            const tableCenterId = centerId.replace(/-/g, "_");
            const countryCode = req?.body?.country_code == undefined ? null : req?.body?.country_code;
            const phoneNumber = req?.body?.phone_number == undefined ? null : req?.body?.phone_number;
            const location = req?.body?.location == undefined ? null : req?.body?.location;
            const aboutClinic = req?.body?.about_clinic == undefined ? null : req?.body?.about_clinic;
            const speciality = req?.body?.speciality == undefined ? null : req?.body?.speciality;
            const assistance = req?.body?.assistance == undefined ? null : req?.body?.assistance;
            const representative_code = req?.body?.representative_code == undefined ? null : req?.body?.representative_code;
            let specialityQuery = '';
            let timingQuery = '';
            const clinicTimings = req?.body?.clinicTimings;
            if (speciality?.length > 0) {
                specialityQuery = `INSERT INTO sc_${tableCenterId}_specialization (center_id, speciality) VALUES `;
                for (let i = 0; i < speciality.length; i++) {
                    if (req?.body?.speciality[i]) {
                        const last = speciality.length - 1;
                        if (i == last) {
                            specialityQuery += ` ('${centerId}', '${req?.body?.speciality[i]}');`;
                        } else {
                            specialityQuery += ` ('${centerId}', '${req?.body?.speciality[i]}'), `;
                        }
                    } else {
                        return response.status(200).json({
                            status: false,
                            message: `Invalid data found while inserting specialization`,
                            data: [],
                        });
                    }
                }
            }
            //Insert Time settings
            if (clinicTimings?.length > 0) {
                timingQuery = `INSERT INTO sc_${tableCenterId}_timings (time_id, center_id, day, start_time, end_time, start_timestamp, end_timestamp) VALUES `;
                for (let i = 0; i < clinicTimings?.length; i++) {
                    if (clinicTimings[i]) {
                        const last = clinicTimings?.length - 1;
                        const { day, timing } = clinicTimings[i];
                        for (let j = 0; j < timing?.length; j++) {
                            const timeId = uuidv4();
                            const { startTime, endTime, start_timestamp, end_timestamp } = timing[j];
                            timingQuery += ` ('${timeId}','${centerId}','${DayNumber[day]}','${startTime}', '${endTime}', '${start_timestamp}', '${end_timestamp}' ), `;
                        }
                    } else {
                        return response.status(200).json({
                            status: false,
                            message: `Invalid data found while inserting clinic time`,
                            data: [],
                        });
                    }
                }
                timingQuery = timingQuery.replace(/,\s*$/, "");
            }

            getVaasPgClient(
                (err: any, client: any, done: any) => {
                    const start = Date.now();
                    const shouldAbort = (err: any) => {
                        if (err) {
                            const duration = Date.now() - start;
                            console.error(
                                `Time is : ${duration}, Error in transaction`,
                                err.stack
                            );
                            client.query("ROLLBACK", (err: any) => {
                                if (err) {
                                    const duration = Date.now() - start;
                                    console.error(
                                        `Time is : ${duration}, Error rolling back client`,
                                        err.stack
                                    );
                                }
                                done();
                            });
                        }
                        return !!err;
                    };
                    client.query("BEGIN", (err: any, res: any) => {
                        if (shouldAbort(err)) return;
                        /* Update service provider data */
                        const updateQuery = `UPDATE service_centers
        SET name = '${req?.body?.name}', email = '${req?.body?.email}', country_code = '${countryCode}', phone_number = '${phoneNumber}', location = '${location}', about_clinic = '${aboutClinic}', got_assistance = '${assistance}', representative_code = '${representative_code}' 
        WHERE center_id = '${centerId}'`;
                        client.query(updateQuery, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return;
                            /* Specialization Deletion */
                            const specializationDelete = `DELETE FROM sc_${tableCenterId}_specialization`;
                            client.query(specializationDelete, [], (err: any, res: any) => {
                                if (shouldAbort(err)) return;
                                /* Specialization Insertion */
                                const specializationInsert = specialityQuery;
                                client.query(specializationInsert, [], (err: any, res: any) => {
                                    if (shouldAbort(err)) return;
                                    /* timing Deletion */
                                    const timingDelete = `DELETE FROM sc_${tableCenterId}_timings`;
                                    client.query(timingDelete, [], (err: any, res: any) => {
                                        if (shouldAbort(err)) return;
                                        /* Degree Insertion */
                                        const timingInsert = timingQuery;
                                        client.query(timingQuery, [], (err: any, res: any) => {
                                            client.query("COMMIT", (err: any, req: any, res: any) => {
                                                if (err) {
                                                    const duration = Date.now() - start;
                                                    console.error(
                                                        `Time is : ${duration}, Error committing transaction`,
                                                        err.stack
                                                    );
                                                }
                                                done();
                                                const duration = Date.now() - start;
                                                console.error(
                                                    `Time is : ${duration}, All queries done`
                                                );
                                                const clinicLog = {
                                                    'center_id': centerId,
                                                    'updated_by': providerId,
                                                    'updated_user_from': 'service_providers'
                                                };
                                                centerSchema.create(clinicLog);
                                                response.status(200).json({
                                                    status: true,
                                                    message: "Clinic Updated Successfully",
                                                    data: [],
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
        } else {
            response.status(200).json(
                {
                    status: false,
                    message: 'Please register under a clinic',
                    data: [],
                },
            );
        }
    } catch (err) {
        response.status(200).json(
            {
                status: false,
                message: 'Error',
                error: err,
            },
        );
    }
}
export async function getServiceProviderListByCenter(req: any, res: any) {
    try {
        const serviceProviderData = req[`serviceProviderData`];
        if (serviceProviderData) {
            const centerId = serviceProviderData?.default_clinic;
            if (centerId) {
                const providerQuery = `SELECT sp.provider_id, CONCAT  (sp.first_name, ' ', sp.last_name) AS name, sp.profile_picture, sp.timezone,
                d.about, sp.country, sp.state, sp.city, sp.cliniqally_id, 
                (SELECT json_agg(json_build_object(
                     'specialization', spc.specialization,
                   'sub_specialization', sub.sub_specialization,
                   'experience', spe.experience
                   )) AS specializations 
                        FROM provider_sub_specializations AS spe
                         LEFT JOIN specializations AS spc ON spc.specialization_id = spe.specialization_id
                        LEFT JOIN sub_specializations AS sub ON sub.sub_specialization_id = spe.sub_specialization_id 
                        WHERE sp.provider_id = spe.provider_id
                       ) AS specializations, 
                        (SELECT json_agg(deg.degree) AS degrees 
                        FROM provider_degree AS dg
						 LEFT JOIN degree as deg ON deg.degree_id = dg.degree_id
                        WHERE sp.provider_id = dg.provider_id
                       ) AS degree
                FROM  service_providers as sp
                LEFT JOIN doctors as d ON d.provider_id = sp.provider_id
                LEFT JOIN provider_clinics as pc ON pc.provider_id = sp.provider_id 
                WHERE pc.center_id = '${centerId}'`;
                const providerList = await vaasPgQuery(providerQuery, [], cachingType.StandardCache);
                const clinicProviderData = providerList.queryResponse;
                clinicProviderData.forEach((v: any) => {
                    v.timing = [{
                        "date": "2022-05-12", "12-6": "10", "6-13": "5", "13-18": "4", "18-24": "5"
                    },
                    {
                        "date": "2022-08-12",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-13",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-14",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-15",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-16",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-17",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-17",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    },
                    {
                        "date": "2022-08-17",
                        "12-6": "10",
                        "6-13": "5",
                        "13-18": "4",
                        "18-24": "5"
                    }],
                        v.verified = true
                });
                if (providerList.queryResponse.length !== 0) {
                    return res.status(200).json({
                        status: true,
                        message: "Service Provider Data Returned Successfully",
                        data: clinicProviderData
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Clinic data not found',
                        error: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Something went wrong. Please try again later',
                    error: [],
                },
            );
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

export async function getClinicInfoById(req: any, res: any) {
    try {
        const centerId = req[`serviceProviderData`][`default_clinic`];
        if (centerId) {
            const tableCenterId = centerId.replace(/-/g, "_");
            const getQuery = `SELECT name, email, sc.center_id, country_code, phone_number, location, about_clinic, 
            timezone, country, (SELECT json_agg(img.image_path) 
                   FROM sc_${tableCenterId}_images AS img
                   WHERE sc.center_id = img.center_id
                  ) AS clinic_images, 
                  (SELECT json_agg(json_build_object(
                   'time_id', time_id, 
                   'day', day,
                      'start_time',start_time,
                      'end_time',end_time
               )) AS clinic_timings  
                   FROM sc_${tableCenterId}_timings AS ct
                   WHERE sc.center_id = ct.center_id 
                  ) AS clinic_timings
            FROM  service_centers as sc WHERE sc.center_id ='${centerId}'`;
            const clinicData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            const timing = clinicData.queryResponse[0].clinic_timings;
            const clinicTimings = Object.values(timing.reduce((r: any, { day: day, ...o }: any) => {
                day = DayNumber[day];
                (r[day] ??= { day, timing: [] }).timing.push(o);
                return r;
            }, {}));
            const clinicDetails = clinicData?.queryResponse[0];
            delete clinicDetails.clinic_timings;
            clinicDetails.clinic_timings = clinicTimings;
            clinicDetails.clinic_images = ["https://cdn.pixabay.com/photo/2017/02/01/13/52/analysis-2030261_1280.jpg",
                "https://cdn.pixabay.com/photo/2019/04/03/03/05/medical-equipment-4099428_1280.jpg",
                "https://cdn.pixabay.com/photo/2018/07/08/19/59/blood-pressure-3524615_1280.jpg",
                "https://cdn.pixabay.com/photo/2013/11/20/23/00/test-214185_1280.jpg"];
            if (clinicData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Data Listed Successfully",
                    data: { 'clinicInfo': clinicDetails }
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Clinic not exist',
                    error: [],
                },
            );
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