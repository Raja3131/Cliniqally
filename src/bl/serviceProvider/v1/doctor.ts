import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { cachingType, getVaasPgClient, vaasPgQuery, } from "../../../services/vaasdbengine";
export async function createdoctor(req: any, response: any) {
    try {
        if (req?.body?.email) {
            const emailResult = await vaasPgQuery(`SELECT * FROM service_providers WHERE email = '${req?.body?.email}'`, [], cachingType.StandardCache)
            if (emailResult?.queryResponse.length === 0) {
                const provider_id = uuidv4()
                const center_id = req[`serviceProviderData`][`default_clinic`];
                const first_name =
                    req?.body?.first_name == undefined ? null : req.body.first_name;
                const last_name =
                    req?.body?.last_name == undefined ? null : req.body.last_name;
                const dob = req?.body?.dob == undefined ? null : req.body.dob;
                const specialization =
                    req?.body?.specialization == undefined
                        ? null
                        : req.body.specialization;
                const medical_council_reg_no =
                    req?.body?.medical_council_reg_no == undefined
                        ? null
                        : req.body.medical_council_reg_no;
                const medical_council_reg_name =
                    req?.body?.medical_council_reg_name == undefined
                        ? null
                        : req.body.medical_council_reg_name;
                const degree = req?.body?.degree == undefined ? null : req.body.degree;
                const referred_by =
                    req?.body?.referred_by == undefined ? null : req.body.referred_by;
                const awards = req?.body?.awards == undefined ? null : req.body.awards;
                const about = req?.body?.about == undefined ? null : req.body.about;
                const membership =
                    req?.body?.membership == undefined ? null : req.body.membership;
                const gender =
                    req?.body?.gender == undefined ? null : req?.body?.gender;
                const address =
                    req?.body?.address == undefined ? null : req?.body?.address;
                const country =
                    req?.body?.country == undefined ? null : req?.body?.country;
                const state = req?.body?.state == undefined ? null : req?.body?.state;
                const city = req?.body?.city == undefined ? null : req?.body?.city;
                const pincode =
                    req?.body?.pincode == undefined ? null : req?.body?.pincode;
                const email = req?.body?.email == undefined ? null : req.body.email;
                const profile_picture = req?.body?.profile_picture == undefined ? null : req.body.profile_picture;
                const mobileNumber = req?.body?.mobile_number == undefined ? null : req.body.mobile_number;
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
                        const insertQueryFirst = `INSERT INTO service_providers (provider_id,email,first_name,last_name,default_clinic) VALUES ('${provider_id}','${email}','${first_name}','${last_name}','${center_id}')`;
                        client.query(insertQueryFirst, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return
                            const insertQuerySecond = `INSERT INTO doctors (provider_id,first_name,last_name,dob,gender,specialization,medical_council_reg_no,medical_council_reg_name,degree,address,pincode,referred_by,awards,about,membership,country,state,city,profile_picture,mobile_number) VALUES ('${provider_id}','${first_name}','${last_name}','${dob}','${gender}','${specialization}','${medical_council_reg_no}','${medical_council_reg_name}','${degree}','${address}','${pincode}','${referred_by}','${awards}','${about}','${membership}', '${country}','${state}','${city}','${profile_picture}','${mobileNumber}')`;
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
                                        message: "Doctor Created Successfully",
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
                        message: 'Account Exist',
                        data: [],
                    },
                );
            }
        } else {
            response.status(200).json(
                {
                    status: false,
                    message: 'Email fields are mandatory',
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
export async function getDoctor(req: any, response: any) {
    try {
        const center_id = req[`serviceProviderData`][`default_clinic`];

        const getServiceProvidersQuery = `SELECT * FROM service_providers Where default_clinic ='${center_id}'`;
        const getServiceProvidersResult = await vaasPgQuery(
            getServiceProvidersQuery,
            [],
            cachingType.StandardCache
        );
        if (getServiceProvidersResult?.queryResponse.length > 0) {
            response.status(200).json({
                status: true,
                message: "Doctor list Fetched Successfully",
                data: getServiceProvidersResult.queryResponse,
            });
        }
    } catch (err) {
        response.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}
export async function getDoctorById(req: any, response: any) {
    try {
        const id = req?.params?.provider_id;
        if (id) {
            const getServiceProviderByIdQuery = `SELECT sp.email,doc.first_name,doc.last_name,doc.dob,doc.gender,doc.specialization,doc.medical_council_reg_no,doc.medical_council_reg_name,doc.license_number,doc.degree,doc.address,doc.pincode,doc.referred_by,doc.awards,doc.about,doc.membership,doc.country,doc.state,doc.city,doc.profile_picture FROM service_providers as sp LEFT JOIN doctors as doc ON doc.provider_id = sp.provider_id WHERE sp.provider_id = '${id}'`;
            const getServiceProviderByIdResult = await vaasPgQuery(
                getServiceProviderByIdQuery,
                [],
                cachingType.StandardCache
            );
            if (getServiceProviderByIdResult?.queryResponse.length > 0) {
                response.status(200).json({
                    status: true,
                    message: "Doctor  Fetched Successfully",
                    data: getServiceProviderByIdResult.queryResponse,
                });
            }
        } else {
            response.status(200).json({
                status: false,
                message: "Doctor Id is mandatory",
                data: [],
            });
        }
    } catch (err) {
        response.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}
export async function updateDoctor(req: any, response: any) {
    try {
        const provider_id = req?.params?.provider_id;
        if (provider_id) {
            const center_id = req[`serviceProviderData`][`default_clinic`];
            const first_name = req?.body?.first_name == undefined ? null : req.body.first_name;
            const last_name = req?.body?.last_name == undefined ? null : req.body.last_name;
            const dob = req?.body?.dob == undefined ? null : req.body.dob;
            const specialization = req?.body?.specialization == undefined ? null : req.body.specialization;
            const medical_council_reg_no = req?.body?.medical_council_reg_no == undefined ? null : req.body.medical_council_reg_no;
            const medical_council_reg_name = req?.body?.medical_council_reg_name == undefined ? null : req.body.medical_council_reg_name;
            const degree = req?.body?.degree == undefined ? null : req.body.degree;
            const referred_by = req?.body?.referred_by == undefined ? null : req.body.referred_by;
            const awards = req?.body?.awards == undefined ? null : req.body.awards;
            const about = req?.body?.about == undefined ? null : req.body.about;
            const membership = req?.body?.membership == undefined ? null : req.body.membership;
            const gender = req?.body?.gender == undefined ? null : req?.body?.gender;
            const address = req?.body?.address == undefined ? null : req?.body?.address;
            const country = req?.body?.country == undefined ? null : req?.body?.country;
            const state = req?.body?.state == undefined ? null : req?.body?.state;
            const city = req?.body?.city == undefined ? null : req?.body?.city;
            const pincode = req?.body?.pincode == undefined ? null : req?.body?.pincode;
            const profile_picture = req?.body?.profile_picture == undefined ? null : req.body.profile_picture;
            const mobileNumber = req?.body?.mobile_number == undefined ? null : req.body.mobile_number;
            getVaasPgClient((err: any, client: any, done: any, res: any) => {
                const start = Date.now();
                const shouldAbort = (err: any) => {
                    if (err) {
                        const duration = Date.now() - start;
                        console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                        client.query("ROLLBACK", (err: any) => {
                            if (err) {
                                const duration = Date.now() - start;
                                console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                            }
                            done();
                        });
                    }
                    return !!err;
                };
                client.query("BEGIN", (err: any, res: any) => {
                    if (shouldAbort(err)) return;
                    const updateQuery = `UPDATE service_providers SET first_name='${first_name}',last_name='${last_name}',default_clinic='${center_id}' WHERE provider_id = '${provider_id}'`;
                    client.query(updateQuery, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return;
                        const updateDoctorQuery = `UPDATE doctors SET first_name = '${first_name}', last_name= '${last_name}', dob ='${dob}', gender='${gender}',specialization='${specialization}',medical_council_reg_no='${medical_council_reg_no}',medical_council_reg_name='${medical_council_reg_name}',degree='${degree}',pincode='${pincode}',referred_by='${referred_by}',awards='${awards}',about='${about}',membership='${membership}' ,country = '${country}',state='${state}',city='${city}',address='${address}',profile_picture='${profile_picture}',mobile_number='${mobileNumber}' WHERE provider_id = '${provider_id}'`;
                        client.query(updateDoctorQuery, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return;
                            client.query("COMMIT", (err: any, req: any, res: any) => {
                                if (err) {
                                    const duration = Date.now() - start;
                                    console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                }
                                done();
                                response.status(200).json({
                                    status: true,
                                    message: "Doctor Updated Successfully",
                                    data: [
                                        {
                                            provider_id: provider_id,
                                        },
                                    ],
                                });
                            });
                        });
                    });
                });
            });
        } else {
            response.status(200).json({
                status: false,
                message: "Service Provider Id is mandatory",
                data: [],
            });
        }
    } catch (err) {
        response.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}

export async function deleteDoctor(req: any, response: any) {
    try {
        const provider_id = req?.params?.provider_id;
        if (provider_id) {
            const updateQuery = `UPDATE doctors SET deleted = true WHERE provider_id = '${provider_id}'`;
            const deleteDoctorResult = await vaasPgQuery(
                updateQuery,
                [],
                cachingType.StandardCache
            );
            if (deleteDoctorResult) {
                response.status(200).json({
                    status: true,
                    message: "Doctor Deleted Successfully",
                    data: deleteDoctorResult.queryResponse,
                });
            }
        } else {
            response.status(200).json({
                status: false,
                message: "Doctor Id is mandatory",
                data: [],
            });
        }
    } catch (err) {
        response.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}