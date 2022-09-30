
import { v4 as uuidv4 } from 'uuid';
import { centerSchema } from '../../../models/mongo';
import { cachingType, getVaasPgClient, vaasPgQuery } from '../../../services/vaasdbengine';

export async function createClinic(req: any, response: any) {
    try {
        const providerId = req?.body?.provider_id;
        const userType = req?.body?.user_type;
        const centerId = uuidv4();
        const tableCenterId = centerId.replace(/-/g, "_");
        const userId = req[`adminData`][`admin_id`];
        const countryCode = req?.body?.country_code == undefined ? null : req?.body?.country_code;
        const phone_number = req?.body?.phone_number == undefined ? null : req?.body?.phone_number;
        const location = req?.body?.location == undefined ? null : req?.body?.location;
        const about_clinic = req?.body?.about_clinic == undefined ? null : req?.body?.about_clinic;
        getVaasPgClient((err: any, client: any, done: any, res: any) => {
            const start = Date.now();
            const shouldAbort = (err: any) => {
                if (err) {
                    const errorFound = err;
                    client.query('ROLLBACK', (err: any) => {
                        if (err) {
                            console.log('error', err);
                        }
                        done();
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
                const insertCenterQuery = `INSERT INTO service_centers (name, email, center_id, country_code, phone_number, type, location, about_clinic) VALUES ('${req?.body?.name}','${req?.body?.email}','${centerId}', '${countryCode}','${phone_number}', '${req?.body?.type}','${location}','${about_clinic}')`;
                client.query(insertCenterQuery, [], (err: any, res: any) => {
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
                        const clinicPivotQuery = `INSERT INTO sc_${tableCenterId}_providers (center_id, provider_id, user_type, is_active) VALUES ('${centerId}', '${providerId}', '${userType}', true)`;

                        client.query(clinicPivotQuery, [], (err: any, res: any) => {
                            const rolesQuery = `CREATE TABLE sc_${tableCenterId}_roles (
                            id serial PRIMARY KEY,
                            role_id UUID UNIQUE NOT NULL,
                            role_slug VARCHAR(255) UNIQUE NOT NULL,
                            center_id UUID NOT NULL,
                            provider_id UUID NOT NULL,
                            FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                            FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id)
                        )`;
                            //sc_centerId_roles
                            client.query(rolesQuery, [], (err: any, res: any) => {
                                const rolesPivotQuery = `CREATE TABLE sc_${tableCenterId}_pr_roles (
                                center_id UUID NOT NULL,
                                provider_id UUID NOT NULL,
                                role_id UUID NOT NULL,
                                FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                FOREIGN KEY (role_id) REFERENCES sc_${tableCenterId}_roles (role_id)
                            )`;
                                client.query(rolesPivotQuery, [], (err: any, res: any) => {
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
                                    //sc_centerId_provider_appointment_settings
                                    client.query(appointmentSettingsQuery, [], (err: any, res: any) => {
                                        const appointmentUnavailabilityQuery = `CREATE TABLE sc_${tableCenterId}_pr_unavailabilities (
                                        id serial PRIMARY KEY,
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
                                        //sc_centerId_provider_appointment_unavailability
                                        client.query(appointmentUnavailabilityQuery, [], (err: any, res: any) => {
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
                                            created_at TIMESTAMP DEFAULT NOW()
                                        )`;
                                            //sc_centerId_appointments
                                            client.query(appointmentAppointmentsQuery, [], (err: any, res: any) => {
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
                                                //sc_centerId_appointment_timings
                                                client.query(appointmentTimingQuery, [], (err: any, res: any) => {
                                                    const appointmentBlockQuery = `CREATE TABLE sc_${tableCenterId}_block_timings (
                                                    id serial PRIMARY KEY,
                                                    appointment_mode session_types,
                                                    center_id UUID NOT NULL,
                                                    provider_id UUID NOT NULL,
                                                    FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                                    FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                                    appointment_date TIMESTAMP NOT NULL,
                                                    appointment_start_time VARCHAR(64) NOT NULL,
                                                    appointment_end_time VARCHAR(64) NOT NULL,
                                                    notes TEXT,
                                                    created_at TIMESTAMP NOT NULL
                                                )`;
                                                    //sc_centerId_block_timings
                                                    client.query(appointmentBlockQuery, [], (err: any, res: any) => {
                                                        const prFollowUpQuery = `CREATE TABLE sc_${tableCenterId}_pr_consult_fees (
                                                        id serial PRIMARY KEY,
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
                                                            const consumersQuery = `CREATE TABLE sc_${tableCenterId}_consumers (
                                                                center_id UUID NOT NULL,
                                                                provider_id UUID NOT NULL,
                                                                consumer_id UUID NOT NULL,
                                                                FOREIGN KEY (center_id) REFERENCES service_centers (center_id),
                                                                FOREIGN KEY (provider_id) REFERENCES service_providers (provider_id),
                                                                FOREIGN KEY (consumer_id) REFERENCES service_consumers (consumer_id)
                                                            )`;
                                                            client.query(consumersQuery, [], (err: any, res: any) => {
                                                                client.query('COMMIT', async (err: any, req: any, res: any) => {
                                                                    if (err) {
                                                                        const duration = Date.now() - start
                                                                        console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                                                    }
                                                                    done();
                                                                    const clinicLog = {
                                                                        'center_id': centerId,
                                                                        'updated_by': userId,
                                                                        'updated_user_from': 'admins'
                                                                    };
                                                                    centerSchema.create(clinicLog);
                                                                    const duration = Date.now() - start
                                                                    console.error(`Time is : ${duration}, All queries done`);
                                                                    response.status(200).json({
                                                                        status: true,
                                                                        message: "Clinic Created Successfully",
                                                                        data: [],
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
        if (req?.params?.clinic_id) {
            const getQuery = `SELECT  name, email, center_id, country_code, phone_number, type, location, about_clinic FROM service_centers 
            WHERE center_id ='${req?.params?.clinic_id}'`;
            const clinicData = await vaasPgQuery(getQuery, [], cachingType.NoCache)
            if (clinicData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Data Resulted Successfully",
                    data: clinicData.queryResponse[0],
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

export async function getClinic(req: any, res: any) {
    try {
        const getQuery = `SELECT  name, email, center_id, country_code, phone_number, type, location, about_clinic FROM service_centers 
         WHERE deleted = false`;
        const clinicData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (clinicData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Clinic Data Listed Successfully",
                data: clinicData.queryResponse,
            });

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

export async function updateClinic(req: any, res: any) {
    try {
        if (req?.params?.clinic_id) {
            const providerId = req?.body?.provider_id;
            const countryCode = req?.body?.country_code == undefined ? null : req?.body?.country_code;
            const phoneNumber = req?.body?.phone_number == undefined ? null : req?.body?.phone_number;
            const location = req?.body?.location == undefined ? null : req?.body?.location;
            const aboutClinic = req?.body?.about_clinic == undefined ? null : req?.body?.about_clinic;
            const centerId = req?.params?.clinic_id
            const updateQuery = `UPDATE service_centers
            SET name = '${req?.body?.name}', email = '${req?.body?.email}', country_code = '${countryCode}', phone_number = '${phoneNumber}', location = '${location}', about_clinic = '${aboutClinic}' 
            WHERE center_id = '${centerId}'`;
            const updateCenter = await vaasPgQuery(updateQuery, [], cachingType.NoCache);
            const userId = req[`adminData`][`admin_id`];
            const clinicLog = {
                'center_id': centerId,
                'updated_by': userId,
                'updated_user_from': 'admins'
            };
            //centerSchema.create(clinicLog);
            return res.status(200).json({
                status: true,
                message: "Clinic Details Updated Successfully",
                data: [],
            });
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

export async function deleteClinic(req: any, res: any) {
    try {
        if (req?.params?.center_id) {
            const updateServiceCenterQuery = `UPDATE service_centers
        SET deleted = true,
        WHERE center_id = '${req?.params?.center_id}'`;
            const updateClinic = await vaasPgQuery(updateServiceCenterQuery, [], cachingType.NoCache)
            if (updateClinic) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Deleted Successfully",
                    data: [],
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
