import bcrypt from 'bcrypt';
import e from 'express';
import { v4 as uuidv4 } from 'uuid';
import { cachingType, getVaasPgClient, vaasPgQuery } from '../../../services/vaasdbengine';
import { addAppointmentDbTransaction } from './appointment';


export async function createPatient(req: any, response: any) {
    try {
        if (req?.body?.email && req?.body?.password && req?.body?.name) {
            const emailResult = await vaasPgQuery(`SELECT * FROM service_consumers WHERE email = '${req?.body?.email}'`, [], cachingType.StandardCache)
            if (emailResult?.queryResponse.length === 0) {
                const consumerId = uuidv4()
                bcrypt.hash(req.body.password, 10, async (error, hash) => {
                    if (!error) {
                        req.body.password = hash;
                        const patient_id = req?.body?.patient_id == undefined ? null : req.body.patient_id;
                        const user_type = req?.body?.user_type == undefined ? null : req.body.user_type;
                        const name = req?.body?.name == undefined ? null : req.body.name;
                        const email = req?.body?.email == undefined ? null : req.body.email;
                        const password = req?.body?.password == undefined ? null : req.body.password;
                        const country_code = req?.body?.country_code == undefined ? null : req.body.country_code;
                        const status = req?.body?.status == undefined ? null : req.body.status;
                        const mobile = req?.body?.mobile == undefined ? null : req.body.mobile;
                        const gender = req?.body?.gender == undefined ? null : req?.body?.gender;
                        const dob = req?.body?.dob == undefined ? null : req?.body?.dob;
                        const address = req?.body?.address == undefined ? null : req?.body?.address;
                        const country = req?.body?.country == undefined ? null : req?.body?.country;
                        const state = req?.body?.state == undefined ? null : req?.body?.state;
                        const city = req?.body?.city == undefined ? null : req?.body?.city;
                        const emergency_contact = req?.body?.emergency_contact == undefined ? null : req?.body?.emergency_contact;
                        const blood_group = req?.body?.blood_group == undefined ? null : req?.body?.blood_group;
                        const height = req?.body?.height == undefined ? null : req?.body?.height;
                        const weight = req?.body?.weight == undefined ? null : req?.body?.weight;
                        getVaasPgClient((err: any, client: any, done: any, res: any) => {
                            const start = Date.now();
                            const shouldAbort = (err: any) => {
                                if (err) {
                                    const duration = Date.now() - start
                                    console.error(`Time is : ${duration}, Error in transaction`, err.stack);
                                    client.query('ROLLBACK', (err: any) => {
                                        if (err) {
                                            const duration = Date.now() - start
                                            console.error(`Time is : ${duration}, Error rolling back client`, err.stack);
                                        }
                                        done()
                                    })
                                }
                                return !!err
                            }
                            client.query('BEGIN', (err: any, res: any) => {
                                if (shouldAbort(err)) return
                                const insertQueryFirst = `INSERT INTO service_consumers (consumer_id, user_type, name, email, password, country_code, status, mobile) VALUES ('${consumerId}','${user_type}','${name}', '${email}','${password}','${country_code}','${status}','${mobile}')`;
                                client.query(insertQueryFirst, [], (err: any, res: any) => {
                                    if (shouldAbort(err)) return
                                    const insertQuerySecond = `INSERT INTO patients (consumer_id, patient_id, gender, dob, address, country, state, city, emergency_contact, blood_group, height, weight ) VALUES ('${consumerId}','${patient_id}','${gender}', '${dob}','${address}','${country}','${state}','${city}','${emergency_contact}','${blood_group}','${height}','${weight}')`;
                                    client.query(insertQuerySecond, [], (err: any, res: any) => {
                                        if (shouldAbort(err)) return
                                        client.query('COMMIT', (err: any, req: any, res: any) => {
                                            if (err) {
                                                const duration = Date.now() - start
                                                console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                            }
                                            done();
                                            response.status(200).json({
                                                status: true,
                                                message: "Patient Created Successfully",
                                                data: [],
                                            });
                                        })
                                    })
                                })
                            })
                        })
                    } else {
                        response.status(500).json(
                            {
                                status: false,
                                message: 'Internal Server Error',
                                data: [],
                            },
                        );
                    }
                });
            } else {
                response.status(200).json(
                    {
                        status: false,
                        message: 'Account Exist',
                        data: [],
                    },
                );
            }
        } else {
            response.status(200).json(
                {
                    status: false,
                    message: 'Email and Password fields are mandatory',
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

export async function getPatient(req: any, res: any) {
    try {
        const getQuery = `SELECT scs.consumer_id, scs.user_type, scs.country_code, scs.name, scs.mobile, scs.email, scs.status, pts.patient_id, pts.gender, pts.dob, pts.address, pts.country, pts.state, pts.city, pts.emergency_contact, pts.blood_group, pts.height, pts.weight,pts.deleted FROM service_consumers as scs
        LEFT JOIN patients as pts ON pts.consumer_id = scs.consumer_id `;
        const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
        if (patientData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Patient Data Listed Successfully",
                data: patientData.queryResponse,
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

export async function getPatientById(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const getQuery = `SELECT scs.consumer_id, scs.user_type, scs.country_code, scs.name, scs.mobile, scs.email, scs.status, pts.patient_id, pts.gender, pts.dob, pts.address, pts.country, pts.state, pts.city, pts.emergency_contact, pts.blood_group, pts.height, pts.weight FROM service_consumers as scs
            LEFT JOIN patients as pts ON pts.consumer_id = scs.consumer_id
            WHERE pts.consumer_id ='${req?.params?.consumer_id}'`;
            const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (patientData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Data Listed Successfully",
                    data: patientData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Patient not exist',
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

export async function updatePatient(req: any, response: any) {
    try {
        if (req?.params?.consumer_id) {
            const patient_id = req?.body?.patient_id == undefined ? null : req.body.patient_id;
            const user_type = req?.body?.user_type == undefined ? null : req.body.user_type;
            const name = req?.body?.name == undefined ? null : req.body.name;
            const gender = req?.body?.gender == undefined ? null : req.body.gender;
            const dob = req?.body?.dob == undefined ? null : req.body.dob;
            const address = req?.body?.address == undefined ? null : req.body.address;
            const country = req?.body?.country == undefined ? null : req.body.country;
            const state = req?.body?.state == undefined ? null : req.body.state;
            const city = req?.body?.city == undefined ? null : req.body.city;
            const country_code = req?.body?.country_code == undefined ? null : req?.body?.country_code;
            const mobile = req?.body?.mobile == undefined ? null : req?.body?.mobile;
            const email = req?.body?.email == undefined ? null : req?.body?.email;
            const password = req?.body?.password == undefined ? null : req?.body?.password;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const emergency_contact = req?.body?.emergency_contact == undefined ? null : req?.body?.emergency_contact;
            const blood_group = req?.body?.blood_group == undefined ? null : req?.body?.blood_group;
            const height = req?.body?.height == undefined ? null : req?.body?.height;
            const weight = req?.body?.weight == undefined ? null : req?.body?.weight;
            getVaasPgClient((err: any, client: any, done: any, res: any) => {
                const start = Date.now();
                const shouldAbort = (err: any) => {
                    if (err) {
                        const duration = Date.now() - start
                        console.error(`Time is : ${duration}, Error in transaction`, err.stack);
                        client.query('ROLLBACK', (err: any) => {
                            if (err) {
                                const duration = Date.now() - start
                                console.error(`Time is : ${duration}, Error rolling back client`, err.stack);
                            }
                            done()
                        })
                    }
                    return !!err
                }
                client.query('BEGIN', (err: any, res: any) => {
                    if (shouldAbort(err)) return
                    const updateScsQuery = `UPDATE service_consumers
                        SET  user_type = '${user_type}', name = '${name}', email = '${email}', country_code = '${country_code}', mobile = '${mobile}',password = '${password}', status = '${status}' 
                        WHERE consumer_id = '${req?.params?.consumer_id}'`;
                    client.query(updateScsQuery, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return
                        const updatePtsQuery = `UPDATE patients
                        SET  patient_id = '${patient_id}', gender = '${gender}', dob = '${dob}', address = '${address}', country = '${country}', state = '${state}', city = '${city}', emergency_contact = '${emergency_contact}', blood_group = '${blood_group}', height = '${height}', weight = '${weight}' 
                        WHERE consumer_id = '${req?.params?.consumer_id}'`;
                        client.query(updatePtsQuery, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return
                            client.query('COMMIT', (err: any, req: any, res: any) => {
                                if (err) {
                                    const duration = Date.now() - start
                                    console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                }
                                done();
                                response.status(200).json({
                                    status: true,
                                    message: "Patient Updated Successfully",
                                    data: [],
                                });
                            })
                        })
                    })
                })
            })
        } else {
            response.status(200).json(
                {
                    status: false,
                    message: 'Service consumer update failed',
                    error: [],
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

export async function deletePatient(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const updateQuery = `UPDATE patients
        SET deleted = true
        WHERE consumer_id = '${req?.params?.consumer_id}'`;
            const patientDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (patientDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Patient not exist',
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

export async function getPatientAllergyById(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const getQuery = `SELECT ca.consumer_id, ca.allergic_id, agy.allergic_id, agy.name, agy.description FROM allergies as agy
            LEFT JOIN consumer_allergies as ca ON ca.allergic_id = agy.allergic_id
            WHERE ca.consumer_id ='${req?.params?.consumer_id}'`;
            const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (patientData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Data Listed Successfully",
                    data: patientData.queryResponse,
                });
            } else {
                res.status(200).json(
                    {
                        status: true,
                        message: 'Data not found!',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Patient not exist',
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

export async function getPatientSurgeryById(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const getQuery = `SELECT cs.consumer_id, cs.surgery_id, sgy.surgery_id, sgy.surgery_name FROM surgeries as sgy
            LEFT JOIN consumer_surgeries as cs ON cs.surgery_id = sgy.surgery_id
            WHERE cs.consumer_id ='${req?.params?.consumer_id}'`;
            const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (patientData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Data Listed Successfully",
                    data: patientData.queryResponse,
                });
            } else {
                res.status(200).json(
                    {
                        status: true,
                        message: 'Data not found',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Patient not exist',
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

export async function getMedicationById(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const getQuery = `SELECT medication_id, description FROM medications WHERE consumer_id ='${req?.params?.consumer_id}'`;
            const Data = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            if (Data.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Data Listed Successfully",
                    data: Data.queryResponse,
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: "data not found",
                    data: [],
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "not exist!",
                error: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}

export async function getHabitById(req: any, res: any) {
    try {
        if (req?.params?.consumer_id) {
            const getQuery = `SELECT habit_id,exercise,food,smoking,alcohal FROM habits WHERE consumer_id ='${req?.params?.consumer_id}'`;
            const Data = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            if (Data.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Data Listed Successfully",
                    data: Data.queryResponse,
                });
            } else {
                res.status(200).json({
                    status: true,
                    message: "data not found",
                    data: [],
                });
            }
        } else {
            res.status(200).json({
                status: false,
                message: "not exist!",
                error: [],
            });
        }
    } catch (err) {
        res.status(200).json({
            status: false,
            message: "Error",
            error: err,
        });
    }
}

// add patient clinically mobile app

export async function addPatientMobile(req: any, response: any) {
    try {
        const providerData = req[`serviceProviderData`]
        let providerId = providerData?.provider_id;
        const centerId = providerData?.default_clinic;
        const email = req?.body?.email == undefined ? null : req.body.email;
        const patient_id = req?.body?.patient_id == undefined ? null : req.body.patient_id;
        const user_type = req?.body?.user_type == undefined ? null : req.body.user_type;
        const name = req?.body?.name == undefined ? null : req.body.name;
        const country_code = req?.body?.country_code == undefined ? null : req.body.country_code;
        const status = req?.body?.status == undefined ? null : req.body.status;
        const mobile = req?.body?.mobile == undefined ? null : req.body.mobile;
        const gender = req?.body?.gender == undefined ? null : req?.body?.gender;
        const dob = req?.body?.dob == undefined ? null : req?.body?.dob;
        const address = req?.body?.address == undefined ? null : req?.body?.address;
        const country = req?.body?.country == undefined ? null : req?.body?.country;
        const state = req?.body?.state == undefined ? null : req?.body?.state;
        const city = req?.body?.city == undefined ? null : req?.body?.city;
        const emergency_contact = req?.body?.emergency_contact == undefined ? null : req?.body?.emergency_contact;
        const blood_group = req?.body?.blood_group == undefined ? null : req?.body?.blood_group;
        const height = req?.body?.height == undefined ? null : req?.body?.height;
        const weight = req?.body?.weight == undefined ? null : req?.body?.weight;
        //todo: to validate below
        const userType = req[`serviceProviderData`][`user_type`];
        const createdBy = req[`serviceProviderData`][`provider_id`];
        const appointmentId = uuidv4();
        const tableCenterId = centerId.replace(/-/g, "_");
        const appointmentMode = req?.body?.appointment_mode == undefined ? null : req?.body?.appointment_mode;
        const appointmentDate = req?.body?.appointment_date == undefined ? null : req?.body?.appointment_date;
        const appointmentTime = req?.body?.appointment_time == undefined ? null : req?.body?.appointment_time;
        const appointmentDuration = req?.body?.appointment_duration == undefined ? null : req?.body?.appointment_duration;
        const whatsappNotification = req?.body?.notify_via_whatsapp == undefined ? null : req?.body?.notify_via_whatsapp;
        const smsNotification = req?.body?.notify_via_sms == undefined ? null : req?.body?.notify_via_sms;
        const plannedProcedures = req?.body?.planned_procedures == undefined ? null : req?.body?.planned_procedures;
        const notes = req?.body?.notes == undefined ? null : req?.body?.notes;
        const addPatientDbTransactionConst: any = await addPatientDbTransaction(email, user_type, name, country_code, status, mobile, patient_id, gender, dob, address, country, state, city, emergency_contact, blood_group, height, weight);
        if (addPatientDbTransactionConst?.status == true) {
            addPatientDbTransactionConst?.data?.consumerId
            const consumerId = addPatientDbTransactionConst?.data?.consumerId
            await addServiceProviderToCenter(centerId, providerId, addPatientDbTransactionConst?.data?.consumerId).then((result: any) => {
                if (userType == 'admin') {
                    providerId = req?.body?.provider_id == undefined ? null : req?.body?.provider_id;
                }
                addAppointmentDbTransaction(centerId, tableCenterId, providerId, appointmentId, consumerId, appointmentMode, appointmentDate, appointmentTime, appointmentDuration, whatsappNotification, smsNotification, plannedProcedures, notes, createdBy, status).then(
                    (resultData: any) => {
                        response.status(200).json(
                            {
                                status: true,
                                message: 'Appointment Created Successfully',
                                data: { "appointmentData": resultData?.data }
                            }

                        );
                    }
                )
            })
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
async function addPatientDbTransaction(email: any, user_type: any, name: any, country_code: any, status: any, mobile: any, patient_id: any, gender: any, dob: any, address: any, country: any, state: any, city: any, emergency_contact: any, blood_group: any, height: any, weight: any) {
    return new Promise((resolve, reject) => {
        if (email) {
            vaasPgQuery(`SELECT * FROM service_consumers WHERE email = '${email}'`, [], cachingType.StandardCache)
                .then((result: any) => {
                    if (result?.queryResponse?.length === 0) {
                        const consumerId = uuidv4();
                        getVaasPgClient((err: any, client: any, done: any, res: any) => {
                            const start = Date.now();
                            const shouldAbort = (err: any) => {
                                if (err) {
                                    const duration = Date.now() - start;
                                    console.error(`Time is : ${duration}, Error in transaction`, err.stack);
                                    client.query('ROLLBACK', (err: any) => {
                                        if (err) {
                                            const duration = Date.now() - start;
                                            console.error(`Time is : ${duration}, Error rolling back client`, err.stack);
                                        }
                                        done();
                                    });
                                }
                                return !!err;
                            };
                            client.query('BEGIN', (err: any, res: any) => {
                                if (shouldAbort(err))
                                    return;
                                const insertQueryFirst = `INSERT INTO service_consumers (consumer_id, user_type, name, email, country_code, status, mobile) VALUES ('${consumerId}','${user_type}','${name}', '${email}','${country_code}','${status}','${mobile}')`;
                                client.query(insertQueryFirst, [], (err: any, res: any) => {
                                    if (shouldAbort(err))
                                        return;
                                    const insertQuerySecond = `INSERT INTO patients (consumer_id, patient_id, gender, dob, address, country, state, city, emergency_contact, blood_group, height, weight ) VALUES ('${consumerId}','${patient_id}','${gender}', '${dob}','${address}','${country}','${state}','${city}','${emergency_contact}','${blood_group}','${height}','${weight}')`;
                                    client.query(insertQuerySecond, [], (err: any, res: any) => {
                                        if (shouldAbort(err))
                                            return;
                                        client.query('COMMIT', (err: any, req: any, res: any) => {
                                            if (err) {
                                                const duration = Date.now() - start;
                                                console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                            }
                                            done();
                                            resolve({ status: true, "message": "Account created", data: { "consumerId": consumerId } });
                                        });
                                    });
                                });
                            });
                        });
                    } else {
                        resolve({ status: true, "message": 'Account already exist', data: { "consumerId": result?.queryResponse[0]?.consumer_id } });
                    }
                })
        }
    });
}

async function addServiceProviderToCenter(centerId: string, providerId: string, consumerID: string) {
    const tableCenterId = centerId.replace(/-/g, "_");
    const insertQuery = `INSERT INTO sc_${tableCenterId}_consumers (provider_id, center_id, consumer_id)
                    VALUES ('${providerId}','${centerId}', '${consumerID}')`;
    console.log('addServiceProviderToCenter', insertQuery)
    return await (await vaasPgQuery(insertQuery, [], cachingType.StandardCache)).queryResponse
}


export async function listPatientsMobileApp(req: any, res: any) {
    try {
        const providerData = req[`serviceProviderData`]
        const providerId = providerData?.provider_id;
        const centerId = providerData?.default_clinic;
        const tableCenterId = centerId.replace(/-/g, "_");
        const userType = providerData?.user_type;
        const searchByName = req?.query?.searchByName?.trim();
        if (userType !== 'admin') {
            let getQuery = `SELECT scs.consumer_id, scs.user_type, scs.country_code, scs.name, scs.mobile, scs.email, scs.status, pts.patient_id, pts.gender, pts.dob, pts.address, pts.country, pts.state, pts.city, pts.emergency_contact, pts.blood_group, pts.height, pts.weight,pts.deleted FROM service_consumers as scs
            INNER JOIN sc_${tableCenterId}_consumers as sc_table_s ON sc_table_s.consumer_id = scs.consumer_id 
            LEFT JOIN patients as pts ON pts.consumer_id = sc_table_s.consumer_id`;
            if (searchByName !== undefined) {
                getQuery += ` WHERE 
                name like '${searchByName}%' 
                or 
                mobile like '${searchByName}%' 
                or patient_id like '${searchByName}%'`
            }
            const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            if (patientData.queryResponse.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Data Listed Successfully",
                    data: patientData.queryResponse,
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: "No Patients found",
                    data: [],
                });
            }
        } else {
            let getQuery = `SELECT scs.consumer_id,sc_table_s.provider_id, scs.user_type, scs.country_code, scs.name, scs.mobile, scs.email, scs.status, pts.patient_id, pts.gender, pts.dob, pts.address, pts.country, pts.state, pts.city, pts.emergency_contact, pts.blood_group, pts.height, pts.weight,pts.deleted FROM service_consumers as scs
            INNER JOIN sc_${tableCenterId}_consumers as sc_table_s ON sc_table_s.consumer_id = scs.consumer_id 
            LEFT JOIN patients as pts ON pts.consumer_id = sc_table_s.consumer_id 
            WHERE sc_table_s.provider_id = '${providerId}'`;
            if (searchByName !== undefined) {
                getQuery += ` AND 
                name like '${searchByName}%' 
                or 
                mobile like '${searchByName}%' 
                or patient_id like '${searchByName}%'`
            }
            const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            if (patientData.queryResponse.length > 0) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Data Listed Successfully",
                    data: patientData.queryResponse,
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: "No Patients found",
                    data: [],
                });
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
