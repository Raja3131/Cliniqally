
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';
import { adminTokenExpiryDays } from '../../../services/standard';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';
export async function signUpAdmin(req: Request, res: Response) {
    try {
        if (req?.body?.email && req?.body?.password && req?.body?.name) {
            const emailQuery = `SELECT * FROM admins WHERE email = '${req?.body?.email}'`;
            const emailResult = await vaasPgQuery(emailQuery, [], cachingType.StandardCache)
            if (emailResult?.queryResponse.length === 0) {
                const adminId = uuidv4()
                bcrypt.hash(req.body.password, 10, async (error, hash) => {
                    if (!error) {
                        req.body.password = hash;
                        const adminUserQuery = `INSERT INTO admins (admin_id,name,email,password,user_type,country_code,mobile,status,created_by,updated_by) VALUES ('${adminId}','${req?.body?.name}', '${req?.body?.email}','${req.body.password}','admin','${req?.body?.country_code}','${req?.body?.mobile}','enabled','${adminId}','${adminId}')`;
                        const createAdminUser = await vaasPgQuery(adminUserQuery, [], cachingType.NoCache)
                        if (createAdminUser) {
                            res.status(200).json(
                                {
                                    status: true,
                                    message: 'Sign up successful',
                                    data: createAdminUser,
                                },
                            );
                        } else {
                            res.status(200).json(
                                {
                                    status: false,
                                    message: 'Sign up failed',
                                    data: [],
                                },
                            );
                        }

                    } else {
                        res.status(500).json(
                            {
                                status: false,
                                message: 'Internal Server Error',
                                data: [],
                            },
                        );
                    }
                });
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
                    message: 'Email and Password fields are mandatory',
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

export async function loginAdminUserPass(req: any, res: any) {
    const query = `SELECT password, email, admin_id, user_type, mobile, country_code FROM admins WHERE email = '${req?.body?.email}'`;
    const emailResult = await vaasPgQuery(query, [], 10 * 60)
    if (emailResult) {
        if (emailResult.queryResponse.length == 0) {
            res.status(401).json({
                status: false,
                message: "Incorrect Credentials",
            });
        } else {
            bcrypt.compare(
                req?.body?.password,
                emailResult?.queryResponse[0]?.password,
                (error, result) => {
                    if (error) {
                        res.status(401).json({
                            status: false,
                            message: "Incorrect Credentials",
                            data: { error },
                        });
                    } else if (result) {
                        const token = jwt.sign(
                            {
                                email: emailResult?.queryResponse[0]?.email,
                                admin_id: emailResult?.queryResponse[0]?.admin_id,
                                user_type: "admin",
                                country_code: emailResult?.queryResponse[0]?.country_code,
                                mobile: emailResult?.queryResponse[0]?.mobile
                            },
                            String(process.env.JWT_KEY),
                            {
                                expiresIn: adminTokenExpiryDays,
                            }
                        );
                        res.status(200).json({
                            status: true,
                            message: "You have logged in successfully.",
                            data: {
                                token,
                            },
                        });
                    } else {
                        res.status(401).json({
                            status: false,
                            message: "Incorrect Credentials",
                            data: { error: error },
                        });
                    }
                }
            );
        }
    }
}

async function generateOtp(adminId: any) {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const minutesToAdd = 10;
    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000).toISOString();
    const Query = `UPDATE admins SET otp = ${otp}, expiration_time = '${futureDate}', otp_verified = false WHERE admin_id = '${adminId}'`;
    await vaasPgQuery(Query, [], cachingType.StandardCache)
    return otp;
}

export async function loginMobileOtp(req: any, res: any) {
    if (req?.body?.mobile !== null && req?.body?.otp === undefined) {
        const mobileQuery = `SELECT mobile, otp, expiration_time, admin_id, email, user_type FROM admins WHERE mobile = '${req?.body?.mobile}'`;
        const mobileResult = await vaasPgQuery(mobileQuery, [], cachingType.StandardCache)
        if (mobileResult.queryResponse.length !== 0) {
            console.log(mobileResult.queryResponse[0].admin_id);
            const otp = await generateOtp(mobileResult.queryResponse[0].admin_id);
            res.status(200).json({
                status: true,
                message: "OTP Generated",
                data: { 'otp': otp },
            });
        } else {
            res.status(200).json({
                status: false,
                message: "This mobile number is not registered",
                data: [],
            });
        }
    } else if (req?.body?.mobile && req?.body?.otp) {
        const query = `SELECT mobile, otp, expiration_time, admin_id, email, user_type FROM admins WHERE mobile = '${req?.body?.mobile}' AND otp = '${req?.body?.otp}'`;
        const mobileResult = await vaasPgQuery(query, [], cachingType.StandardCache)
        if (mobileResult) {
            if (mobileResult?.queryResponse?.length == 0) {
                res.status(401).json({
                    status: false,
                    message: "Invalid OTP",
                });
            } else {
                if (mobileResult.queryResponse[0].otp_verified == true) {
                    return res.status(401).json({
                        status: false,
                        message: "OTP already used",
                    });
                } else {
                    const expirationTime = new Date(mobileResult.queryResponse[0].expiration_time);
                    const currentTime = new Date();
                    if (expirationTime > currentTime) {
                        return res.status(401).json({
                            status: false,
                            message: "OTP expired, try again",
                        });
                    } else {
                        const token = jwt.sign(
                            {
                                email: mobileResult?.queryResponse[0]?.email,
                                admin_id: mobileResult?.queryResponse[0]?.admin_id,
                                user_type: "admin",
                                country_code: mobileResult?.queryResponse[0]?.country_code,
                                mobile: mobileResult?.queryResponse[0]?.mobile
                            },
                            String(process.env.JWT_KEY),
                            {
                                expiresIn: adminTokenExpiryDays,
                            }
                        );
                        const updateQuery = `UPDATE admins SET otp_verified = true WHERE admin_id = '${mobileResult?.queryResponse[0]?.admin_id}'`;
                        await vaasPgQuery(updateQuery, [], cachingType.NoCache)
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

