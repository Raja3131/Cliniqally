import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { distance, serviceConsumerTokenExpiryDays } from '../../../services/standard';
import { cachingType, getVaasPgClient, vaasPgQuery } from '../../../services/vaasdbengine';

async function generateOtp(mobile: number) {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
}

export async function signUpPatientUser(req: any, res: any) {
    try {
        if (req?.body?.firstName && req?.body?.lastName && req?.body?.countryCode && req?.body?.mobileNumber) {
            const query = `SELECT * FROM service_consumers WHERE mobile = '${req?.body?.mobileNumber}'`;
            const mobileResult = await vaasPgQuery(query, [], cachingType.NoCache)
            if (mobileResult?.queryResponse.length === 0) {
                const patientId = uuidv4();
                const otp = await generateOtp(mobileResult?.queryResponse[0]?.mobileNumber);
                const insertQuery = `INSERT INTO temp_patients (first_name, last_name, country_code, mobile, otp, temp_patientid) VALUES ('${req?.body?.firstName}','${req?.body?.lastName}','${req?.body?.countryCode}','${req?.body?.mobileNumber}','${otp}','${patientId}')`;
                const insertTemp = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (insertTemp) {
                    return res.status(200).json({
                        status: true,
                        message: "Patient Sign-up OTP Generated and Data Saved Temporarily",
                        data: [{ "otp": otp }],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Account Exist',
                        data: [],
                    },
                );
            }

        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Name and Mobile fields are mandatory',
                    data: [],
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

export async function signUpPatientUserFinal(req: any, response: any) {
    try {
        if (req?.body?.firstName && req?.body?.lastName && req?.body?.countryCode && req?.body?.mobileNumber) {
            const query = `SELECT * FROM temp_patients WHERE mobile = '${req?.body?.mobileNumber}'`;
            const mobileResult = await vaasPgQuery(query, [], cachingType.NoCache)
            if (mobileResult?.queryResponse.length !== 0) {
                const getQuery = `SELECT first_name, last_name, mobile, otp, country_code, temp_patientid, otp_verified FROM temp_patients WHERE mobile = '${req?.body?.mobileNumber}' AND otp = '${req?.body?.otp}'`;
                const otpResult = await vaasPgQuery(getQuery, [], cachingType.NoCache)
                const consumerId = otpResult?.queryResponse[0]?.temp_patientid;
                const firstName = otpResult?.queryResponse[0]?.first_name;
                const lastName = otpResult?.queryResponse[0]?.last_name;
                const CountryCode = otpResult?.queryResponse[0]?.country_code;
                const mobileNumber = otpResult?.queryResponse[0]?.mobile;
                const consumerOtp = otpResult?.queryResponse[0]?.otp;
                const consumerOtpVerified = otpResult?.queryResponse[0]?.otp_verified;
                const userType = 'patient'
                if (otpResult) {
                    if (otpResult?.queryResponse?.length == 0) {
                        response.status(401).json({
                            status: false,
                            message: "Invalid OTP",
                        });
                    } else {
                        if (otpResult?.queryResponse[0]?.otp_verified == true) {
                            return response.status(401).json({
                                status: false,
                                message: "OTP already used",
                            });
                        } else {
                            const expirationTime = new Date(otpResult.queryResponse[0].expiration_time);
                            const currentTime = new Date();
                            if (expirationTime > currentTime) {
                                return response.status(401).json({
                                    status: false,
                                    message: "OTP expired, try again",
                                });
                            } else {
                                const token = jwt.sign(
                                    {
                                        userDetails: {
                                            firstName: firstName,
                                            lastName: lastName,
                                            CountryCode: CountryCode,
                                            mobileNumber: mobileNumber
                                        },
                                        consumer_id: otpResult?.queryResponse[0]?.temp_patientid,
                                        user_type: userType
                                    },

                                    String(process.env.JWT_KEY),
                                    {
                                        expiresIn: serviceConsumerTokenExpiryDays,
                                    }
                                );
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
                                        const updateQuery = `UPDATE temp_patients SET otp_verified = true WHERE otp = '${req?.body?.otp}'`;
                                        client.query(updateQuery, [], (err: any, res: any) => {
                                            if (shouldAbort(err)) return
                                            const insertQuery = `INSERT INTO service_consumers (consumer_id, first_name, last_name, country_code, mobile, otp, otp_verified, user_type) VALUES ('${consumerId}','${firstName}','${lastName}','${CountryCode}','${mobileNumber}' ,'${consumerOtp}','${consumerOtpVerified}','${userType}')`;
                                            client.query(insertQuery, [], (err: any, res: any) => {
                                                if (shouldAbort(err)) return
                                                const insertQuerySecond = `INSERT INTO patients (consumer_id) VALUES ('${consumerId}')`;
                                                client.query(insertQuerySecond, [], (err: any, res: any) => {
                                                    client.query('COMMIT', (err: any, req: any, res: any) => {
                                                        if (err) {
                                                            const duration = Date.now() - start
                                                            console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                                        }
                                                        done();
                                                        const duration = Date.now() - start
                                                        console.error(`Time is : ${duration}, All queries done`);
                                                        response.status(200).json({
                                                            status: true,
                                                            message: "You have logged in successfully.",
                                                            data: [{
                                                                token,
                                                            }],
                                                        });
                                                    })
                                                })
                                            })
                                        })
                                    })
                                })
                            }
                        }
                    }
                }

            } else {
                response.status(200).json(
                    {
                        status: false,
                        message: 'Invalid Mobile No',
                        data: [],
                    },
                );
            }
        } else {
            response.status(200).json(
                {
                    status: false,
                    message: 'Name and Mobile fields are mandatory',
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

export async function createPatientProfile(req: any, response: any) {
    try {
        const consumerId = req[`patientUserData`][`consumer_id`];
        const patientId = req?.body?.patient_id == undefined ? null : req?.body?.patient_id;
        const fullName = req?.body?.name == undefined ? null : req?.body?.name;
        const mobileNumber = req?.body?.mobile == undefined ? null : req?.body?.mobile;
        const email = req?.body?.email == undefined ? null : req?.body?.email;
        const dob = req?.body?.dob == undefined ? null : req?.body?.dob;
        const gender = req?.body?.gender == undefined ? null : req?.body?.gender;
        const emergencyContact = req?.body?.emergency_contact == undefined ? null : req?.body?.emergency_contact;
        const bloodGroup = req?.body?.blood_group == undefined ? null : req?.body?.blood_group;
        const occupation = req?.body?.occupation == undefined ? null : req?.body?.occupation;
        const address = req?.body?.address == undefined ? null : req?.body?.address;
        const country = req?.body?.country == undefined ? null : req?.body?.country;
        const state = req?.body?.state == undefined ? null : req?.body?.state;
        const city = req?.body?.city == undefined ? null : req?.body?.city;
        const location = req?.body?.location == undefined ? null : req?.body?.location;
        const timezone = req?.body?.timezone == undefined ? null : req?.body?.timezone;
        const patientExist = await vaasPgQuery(`SELECT consumer_id FROM service_consumers WHERE consumer_id = '${consumerId}'`, [], cachingType.NoCache);
        if (patientExist.queryResponse.length !== 0) {
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
                    const updateQuery = `UPDATE service_consumers
                        SET name = '${fullName}',mobile = '${mobileNumber}',email = '${email}', timezone = '${timezone}' 
                        WHERE consumer_id = '${consumerId}'`;
                    client.query(updateQuery, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return
                        const updateQuerySecond = `UPDATE patients
                        SET  patient_id = '${patientId}', dob = '${dob}',gender = '${gender}',blood_group = '${bloodGroup}', occupation = '${occupation}', address = '${address}', country = '${country}', state = '${state}', city = '${city}', location = '${location}', emergency_contact = '${emergencyContact}' 
                        WHERE consumer_id = '${consumerId}'`;
                        client.query(updateQuerySecond, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return
                            client.query('COMMIT', (err: any, req: any, res: any) => {
                                if (err) {
                                    const duration = Date.now() - start
                                    console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                    response.status(200).json({
                                        status: false,
                                        message: "Cannot process your request",
                                        data: [{ "error": err }],
                                    });
                                }
                                done();
                                response.status(200).json({
                                    status: true,
                                    message: "Patient Profile Updated Successfully",
                                    data: [],
                                });
                            })
                        })
                    })
                })
            })
        } else {
            response.status(200).json({
                status: false,
                message: "Patient Not Found",
                data: [],
            });
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

async function generateOtpMobile(consumerId: any) {
    const otp = Math.floor(1000 + Math.random() * 9000);
    const minutesToAdd = 10;
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000).toISOString();
    const Query = `UPDATE service_consumers SET otp = ${otp}, expiration_time = '${futureDate}', otp_verified = false WHERE consumer_id = '${consumerId}'`;
    await vaasPgQuery(Query, [], cachingType.NoCache);
    return otp;
}

export async function loginMobileOtp(req: any, res: any) {
    if (req?.body?.mobile !== null && req?.body?.otp === undefined) {
        const mobileQuery = `SELECT mobile, otp, expiration_time, consumer_id, email, user_type FROM service_consumers WHERE mobile = '${req?.body?.mobile}'`;
        const mobileResult = await vaasPgQuery(mobileQuery, [], cachingType.StandardCache);
        if (mobileResult?.queryResponse?.length !== 0) {
            const otp = await generateOtpMobile(
                mobileResult?.queryResponse[0]?.consumer_id
            );
            res.status(200).json({
                status: true,
                message: "OTP Generated",
                data: { otp: otp },
            });
        } else {
            res.status(200).json({
                status: false,
                message: "This mobile number is not registered",
                data: [],
            });
        }
    } else if (req?.body?.mobile && req?.body?.otp) {
        const query = `SELECT mobile, otp, expiration_time, service_consumers.consumer_id, email, user_type, first_name, last_name FROM service_consumers WHERE mobile = '${req?.body?.mobile}' AND otp = '${req?.body?.otp}'`;
        const mobileResult = await vaasPgQuery(query, [], cachingType.StandardCache);
        if (mobileResult) {
            if (mobileResult?.queryResponse?.length == 0) {
                res.status(401).json({
                    status: false,
                    message: "Invalid OTP",
                });
            } else {
                if (mobileResult?.queryResponse[0]?.otp_verified == true) {
                    return res.status(401).json({
                        status: false,
                        message: "OTP already used",
                    });
                } else {
                    const expirationTime = new Date(mobileResult.queryResponse[0].expiration_time);
                    const currentTime = new Date();
                    if (expirationTime < currentTime) {
                        return res.status(401).json({
                            status: false,
                            message: "OTP expired, try again",
                        });
                    } else {
                        const token = jwt.sign(
                            {
                                userDetails: {
                                    firstName: mobileResult?.queryResponse[0]?.first_name,
                                    lastName: mobileResult?.queryResponse[0]?.first_name,
                                    countryCode: mobileResult?.queryResponse[0]?.country_code,
                                    mobileNumber: mobileResult?.queryResponse[0]?.mobile
                                },
                                email: mobileResult?.queryResponse[0]?.email,
                                consumer_id: mobileResult?.queryResponse[0]?.consumer_id,
                                user_type: mobileResult?.queryResponse[0]?.user_type,
                            },
                            String(process.env.JWT_KEY),
                            {
                                expiresIn: serviceConsumerTokenExpiryDays,
                            }
                        );
                        const updateQuery = `UPDATE service_consumers SET otp_verified = true WHERE consumer_id = '${mobileResult?.queryResponse[0]?.consumer_id}'`;
                        await vaasPgQuery(updateQuery, [], cachingType.NoCache);
                        res.status(200).json({
                            status: true,
                            message: "You have logged in successfully.",
                            data: {
                                token,
                            },
                        });
                    }
                }
            }
        }
    } else {
        res.status(200).json({
            status: false,
            message: "Data error",
            data: [],
        });
    }
}
function createError(res: any, error: any, message: string) {
    res.status(404).json(
        {
            status: false,
            message,
            error
        }
    )
}
async function searchDoctorByName(name: any, latitude: any, longitude: any) {
    try {
        const query = `select dist.name,dist.type,dist.profile_picture,dist.distance,dist.phone_number,dist.center_id,pc.provider_id,dts.first_name,dts.last_name,dts.age,dts.gender,dts.profile_picture,dts.specialization
     from(select name,type,profile_picture,phone_number,center_id,( 6371 * acos(  cos( radians('${latitude}') )
    * cos( radians( geolocation[1] ) )
    * cos( radians( geolocation[0] ) - radians('${longitude}') )
    + sin( radians('${latitude}') ) * sin( radians( geolocation[1] ) )
   ) 
) as distance FROM service_centers WHERE geolocation is not null ) as dist 
left join provider_clinics as pc on dist.center_id = pc.center_id left join doctors as dts on pc.provider_id = dts.provider_id
where dist.distance<'${distance}' AND  dts.first_name iLike '${name}%' `;
        return await (await vaasPgQuery(query, [], cachingType.StandardCache)).queryResponse;
    } catch (err) {
        return err;
    }

}
async function searchDoctorBySpecialization(name: any, latitude: any, longitude: any) {
    try {
        const query = `select dist.name,dist.type,dist.profile_picture,dist.distance,dist.phone_number,dist.center_id,pc.provider_id,dts.first_name,dts.last_name,dts.age,dts.gender,dts.profile_picture,dts.specialization
     from(select name,type,profile_picture,phone_number,center_id,( 6371 * acos(  cos( radians('${latitude}') )
    * cos( radians( geolocation[1] ) )
    * cos( radians( geolocation[0] ) - radians('${longitude}') )
    + sin( radians('${latitude}') ) * sin( radians( geolocation[1] ) )
   ) 
) as distance FROM service_centers WHERE geolocation is not null ) as dist 
left join provider_clinics as pc on dist.center_id = pc.center_id left join doctors as dts on pc.provider_id = dts.provider_id
where dist.distance<'${distance}' AND  dts.specialization iLike '${name}%' `;
        return await (await vaasPgQuery(query, [], cachingType.StandardCache)).queryResponse;
    } catch (err) {
        return err;
    }
}
async function searchDoctorFunction(latitude: any, longitude: any) {
    try {
        const query = `select dist.name,dist.type,dist.profile_picture,dist.distance,dist.phone_number,dist.center_id,pc.provider_id,dts.first_name,dts.last_name,dts.age,dts.gender,dts.profile_picture,dts.specialization
     from(select name,type,profile_picture,phone_number,center_id,( 6371 * acos(  cos( radians('${latitude}') )
    * cos( radians( geolocation[1] ) )
    * cos( radians( geolocation[0] ) - radians('${longitude}') )
    + sin( radians('${latitude}') ) * sin( radians( geolocation[1] ) )
   ) 
) as distance FROM service_centers WHERE geolocation is not null ) as dist 
left join provider_clinics as pc on dist.center_id = pc.center_id left join doctors as dts on pc.provider_id = dts.provider_id
where dist.distance<'${distance}' `;
        return await (await vaasPgQuery(query, [], cachingType.StandardCache)).queryResponse;
    } catch (err) {
        return err;
    }
}
export async function searchDoctor(req: any, res: any) {
    try {
        const latitude = req?.body?.latitude == undefined ? null : req.body.latitude;
        const longitude = req?.body?.longitude == undefined ? null : req.body.longitude;
        const search_name = req?.body?.search_name == undefined ? null : req.body.search_name;
        if (search_name.length == 0 && latitude != null && longitude != null) {
            Promise.all([searchDoctorFunction(latitude, longitude)]).then(result => {
                if (result[0].length != 0) {
                    res.status(200).json(
                        {
                            status: true,
                            message: 'success',
                            data: result[0]
                        },
                    );

                } else {
                    res.status(200).json(
                        {
                            status: false,
                            message: 'Data not available',
                            data: [],
                        }
                    )
                }
            })
        } else if (search_name != null && latitude != null && longitude != null) {
            const searchByName = searchDoctorByName;
            const searchBySpecialization = searchDoctorBySpecialization;
            Promise.all([searchByName(search_name, latitude, longitude), searchBySpecialization(search_name, latitude, longitude)]).then(result => {
                if (result[0] != 0 || result[1] != 0) {
                    res.status(200).json(
                        {
                            status: true,
                            message: 'success',
                            data: {
                                "Name": result[0],
                                "Specialization": result[1]
                            }
                        },
                    );

                } else {
                    res.status(200).json(
                        {
                            status: false,
                            message: 'Data not exist',
                            data: [],
                        }
                    )
                }
            })
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please select the location or enter the name',
                    data: [],
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