import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { cachingType, getVaasPgClient, vaasPgQuery } from '../../../services/vaasdbengine';


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
                                const insertQueryFirst = `INSERT INTO service_consumers (consumer_id, user_type,name, email, password, country_code, status, mobile) VALUES ('${consumerId}','${user_type}','${name}', '${email}','${password}','${country_code}','${status}','${mobile}')`;
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
            console.log(req?.params?.consumer_id)
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
                        SET  patient_id = '${patient_id}', gender = '${gender}',dob = '${dob}', address = '${address}', country = '${country}', state = '${state}', city = '${city}', emergency_contact = '${emergency_contact}', blood_group = '${blood_group}', height = '${height}', weight = '${weight}' 
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

