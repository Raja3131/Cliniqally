import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from 'mongoose';
import { v4 as uuidv4 } from "uuid";
import { appointmentTimeSettings, appointmentUnavailable, serviceProviderSchema } from '../../../models/mongo';
import { serviceProviderTokenExpiryDays } from "../../../services/standard";

import {
  cachingType,
  getVaasPgClient,
  vaasPgQuery
} from "../../../services/vaasdbengine";
import { listBloodGroup, listCities, listClinicSpecialities, listCountries, listDegree, listLanguages, listRegistrationCouncil, listSpecialization, listStates, listSubSpecialization, listTimeZones } from "./listapis";

export async function signUpServiceProvider(req: any, res: any) {
  try {
    if (req?.body?.email && req?.body?.password) {
      const query = `SELECT * FROM service_providers WHERE email = '${req?.body?.email}'`;
      const emailResult = await vaasPgQuery(
        query,
        [],
        cachingType.StandardCache
      );
      if (emailResult?.queryResponse.length === 0) {
        const providerId = uuidv4();
        bcrypt.hash(req.body.password, 10, async (error, hash) => {
          if (!error) {
            req.body.password = hash;
            const providerQuery = `INSERT INTO service_providers (provider_id,email,password,country_code,mobile,status) VALUES ('${providerId}','${req?.body?.email}','${req?.body?.password}','${req?.body?.country_code}','${req?.body?.mobile}','enabled')`;
            const createServiceProvider = await vaasPgQuery(
              providerQuery,
              [],
              cachingType.NoCache
            );
            const serviceProviderLog = {
              'provider_id': providerId,
              'updated_by': providerId,
              'updated_user_from': 'service_providers'
            };
            serviceProviderSchema.create(serviceProviderLog);
            if (createServiceProvider) {
              res.status(200).json({
                status: true,
                message: "Sign up successful",
                data: [],
              });
            } else {
              res.status(200).json({
                status: false,
                message: "Sign up failed",
                data: [],
              });
            }
          } else {
            res.status(500).json({
              status: false,
              message: "Internal Server Error",
              data: [],
            });
          }
        });
      } else {
        res.status(200).json({
          status: false,
          message: "Account Exist",
          data: [],
        });
      }
    } else {
      res.status(200).json({
        status: false,
        message: "Email and Password fields are mandatory",
        data: [],
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

export async function loginUserPass(req: any, res: any) {
  const query = `SELECT password, email, provider_id, first_name, last_name, mobile, country_code, default_clinic FROM service_providers WHERE email = '${req?.body?.email}'`;

  const emailResult = await vaasPgQuery(query, [], cachingType.StandardCache);
  if (emailResult) {
    if (emailResult.queryResponse.length == 0) {
      res.status(401).json({
        status: false,
        message: "Incorrect Credentials",
      });
    } else {
      let userType = '';
      if (emailResult.queryResponse[0]?.default_clinic !== null) {
        const defaultClinic = emailResult.queryResponse[0]?.default_clinic;
        const centerId = defaultClinic.replace(/-/g, "_");
        const queryUserType = `SELECT user_type FROM sc_${centerId}_providers WHERE provider_id = '${emailResult.queryResponse[0]?.provider_id}' AND is_active = true`;
        const queryResult = await vaasPgQuery(queryUserType, [], cachingType.StandardCache);
        userType = queryResult.queryResponse[0]?.user_type;
      }
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
                userDetails: {
                  firstName: emailResult?.queryResponse[0]?.first_name,
                  lastName: emailResult?.queryResponse[0]?.first_name,
                  countryCode: emailResult?.queryResponse[0]?.country_code,
                  mobileNumber: emailResult?.queryResponse[0]?.mobile
                },
                email: emailResult?.queryResponse[0]?.email,
                provider_id: emailResult?.queryResponse[0]?.provider_id,
                user_type: userType,
              },
              String(process.env.JWT_KEY),
              {
                expiresIn: serviceProviderTokenExpiryDays,
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

async function generateOtp(providerId: any) {
  const otp = Math.floor(1000 + Math.random() * 9000);
  const minutesToAdd = 10;
  const currentDate = new Date();
  const futureDate = new Date(
    currentDate.getTime() + minutesToAdd * 60000
  ).toISOString();
  const Query = `UPDATE service_providers SET otp = ${otp}, expiration_time = '${futureDate}', otp_verified = false WHERE provider_id = '${providerId}'`;
  await vaasPgQuery(Query, [], cachingType.NoCache);
  return otp;
}

export async function loginMobileOtp(req: any, res: any) {
  if (req?.body?.mobile !== null && req?.body?.otp === undefined) {
    const mobileQuery = `SELECT mobile, otp, expiration_time, provider_id, email, first_name, last_name, country_code FROM service_providers WHERE mobile = '${req?.body?.mobile}'`;
    const mobileResult = await vaasPgQuery(
      mobileQuery,
      [],
      cachingType.StandardCache
    );
    if (mobileResult?.queryResponse?.length !== 0) {
      const otp = await generateOtp(
        mobileResult?.queryResponse[0]?.provider_id
      );
      res.status(200).json({
        status: true,
        message: "OTP Generated",
        data: [{ otp: otp }],
      });
    } else {
      res.status(200).json({
        status: false,
        message: "This mobile number is not registered",
        data: [],
      });
    }
  } else if (req?.body?.mobile && req?.body?.otp) {
    const query = `SELECT mobile, otp, expiration_time, service_providers.provider_id, email, default_clinic, first_name, last_name, country_code FROM service_providers WHERE mobile = '${req?.body?.mobile}' AND otp = '${req?.body?.otp}'`;
    const mobileResult = await vaasPgQuery(
      query,
      [],
      cachingType.StandardCache
    );
    if (mobileResult) {
      if (mobileResult?.queryResponse?.length == 0) {
        res.status(401).json({
          status: false,
          message: "Invalid OTP",
          data: [],
        });
      } else {
        if (mobileResult?.queryResponse[0]?.otp_verified == true) {
          return res.status(401).json({
            status: false,
            message: "OTP already used",
            data: [],
          });
        } else {
          const expirationTime = new Date(mobileResult.queryResponse[0].expiration_time);
          const currentTime = new Date();
          if (expirationTime < currentTime) {
            return res.status(401).json({
              status: false,
              message: "OTP expired, try again",
              data: [],
            });
          } else {
            let userType = '';
            if (mobileResult.queryResponse[0]?.default_clinic !== null) {
              const defaultClinic = mobileResult.queryResponse[0]?.default_clinic;
              const centerId = defaultClinic.replace(/-/g, "_");
              const queryUserType = `SELECT user_type FROM sc_${centerId}_providers WHERE provider_id = '${mobileResult.queryResponse[0]?.provider_id}' AND is_active = true`;
              const queryResult = await vaasPgQuery(queryUserType, [], cachingType.StandardCache);
              userType = queryResult.queryResponse[0]?.user_type;
            }

            //todo: if verified === true, then do following
            const verifiedUser = true;
            let JWTSign: any = {
              userDetails: {
                firstName: mobileResult?.queryResponse[0]?.first_name,
                lastName: mobileResult?.queryResponse[0]?.last_name,
                countryCode: mobileResult?.queryResponse[0]?.country_code,
                mobileNumber: mobileResult?.queryResponse[0]?.mobile,
              },
              provider_id: mobileResult?.queryResponse[0]?.provider_id,
              user_type: userType
            }

            if (verifiedUser) {
              JWTSign = {
                ...JWTSign,
                default_clinic: mobileResult?.queryResponse[0]?.default_clinic,
              };
            }
            const token = jwt.sign(
              JWTSign,
              String(process.env.JWT_KEY),
              {
                expiresIn: serviceProviderTokenExpiryDays,
              }
            );
            const updateQuery = `UPDATE service_providers SET otp_verified = true WHERE provider_id = '${mobileResult?.queryResponse[0]?.provider_id}'`;
            await vaasPgQuery(updateQuery, [], cachingType.NoCache);
            res.status(200).json({
              status: true,
              message: "You have logged in successfully.",
              data: [{
                token,
              }],
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

export async function serviceProviderAddProfile(req: any, response: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    const degree = req?.body?.degree == undefined ? null : req?.body?.degree;
    const reg_number =
      req?.body?.reg_number == undefined ? null : req?.body?.reg_number;
    const reg_name =
      req?.body?.reg_name == undefined ? null : req?.body?.reg_name;
    const specialization =
      req?.body?.specialization == undefined ? null : req?.body?.specialization;
    let specializationQuery = "";
    let degreeQuery = "";
    const doctorExist = await vaasPgQuery(
      `SELECT provider_id FROM doctors WHERE provider_id = '${providerId}'`,
      [],
      cachingType.NoCache
    );
    if (doctorExist.queryResponse.length === 0) {
      return response.status(200).json({
        status: true,
        message: "Profile does not exist!",
        data: [],
      });
    } else {
      if (specialization?.length > 0) {
        specializationQuery = `INSERT INTO provider_specialization (provider_id, specialization_id) VALUES `;
        for (let i = 0; i < specialization.length; i++) {
          if (req?.body?.specialization[i]) {
            const last = specialization.length - 1;
            if (i == last) {
              specializationQuery += ` ('${providerId}', '${req?.body?.specialization[i]}');`;
            } else {
              specializationQuery += ` ('${providerId}', '${req?.body?.specialization[i]}'), `;
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
      if (degree?.length > 0) {
        degreeQuery = `INSERT INTO provider_degree (provider_id, degree_id) VALUES `;
        for (let i = 0; i < degree.length; i++) {
          if (req?.body?.degree[i]) {
            const lastDegree = degree.length - 1;
            if (i == lastDegree) {
              degreeQuery += ` ('${providerId}', '${req?.body?.degree[i]}');`;
            } else {
              degreeQuery += ` ('${providerId}', '${req?.body?.degree[i]}'), `;
            }
          } else {
            return response.status(200).json({
              status: false,
              message: `Invalid data found while inserting degrees`,
              data: [],
            });
          }
        }
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
            const updateQuery = `UPDATE doctors
             SET medical_council_reg_no = '${reg_number}', medical_council_reg_name = '${reg_name}'
             WHERE provider_id = '${providerId}'`;
            client.query(updateQuery, [], (err: any, res: any) => {
              if (shouldAbort(err)) return;
              const specializationDelete = `DELETE FROM provider_specialization WHERE provider_id IN ('${providerId}')`;
              client.query(specializationDelete, [], (err: any, res: any) => {
                if (shouldAbort(err)) return;
                /* Specialization Insertion */
                const specializationInsert = specializationQuery;
                client.query(specializationInsert, [], (err: any, res: any) => {
                  if (shouldAbort(err)) return;
                  /* Degree Deletion */
                  const degreeDelete = `DELETE FROM provider_degree WHERE provider_id IN ('${providerId}')`;
                  client.query(degreeDelete, [], (err: any, res: any) => {
                    if (shouldAbort(err)) return;
                    /* Degree Insertion */
                    const degreeInsert = degreeQuery;
                    client.query(degreeInsert, [], (err: any, res: any) => {
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
                        const serviceProviderLog = {
                          'provider_id': providerId,
                          'updated_by': providerId,
                          'updated_user_from': 'service_providers'
                        };
                        serviceProviderSchema.create(serviceProviderLog);
                        response.status(200).json({
                          status: true,
                          message: "provider profile created successfully",
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
    }
  } catch (err) {
    response.status(200).json({
      status: false,
      message: "Error",
      error: err,
    });
  }
}

export async function signUpProviderUser(req: any, res: any) {
  try {
    if (req?.body?.firstName && req?.body?.lastName && req?.body?.countryCode && req?.body?.mobileNumber) {
      const query = `SELECT provider_id FROM service_providers WHERE mobile = '${req?.body?.mobileNumber}'`;
      const mobileResult = await vaasPgQuery(query, [], cachingType.NoCache);
      if (mobileResult?.queryResponse.length === 0) {
        const providerId = uuidv4();
        const otp = Math.floor(1000 + Math.random() * 9000);
        const minutesToAdd = 10;
        const currentDate = new Date();
        const futureDate = new Date(
          currentDate.getTime() + minutesToAdd * 60000
        ).toISOString();
        const expirationTime = futureDate;
        const insertQuery = `INSERT INTO temp_service_providers (first_name, last_name, country_code, mobile, otp,temp_provider_id,expiration_time) VALUES ('${req?.body?.firstName}','${req?.body?.lastName}','${req?.body?.countryCode}','${req?.body?.mobileNumber}','${otp}','${providerId}','${expirationTime}')`;
        const insertTemp = await vaasPgQuery(
          insertQuery,
          [],
          cachingType.NoCache
        );
        if (insertTemp) {
          return res.status(200).json({
            status: true,
            message: "OTP Send to your mobile number. Verify and Continue",
            data: [{ otp: otp }],
          });
        }
      } else {
        res.status(200).json({
          status: false,
          message: "Account Exist",
          data: [],
        });
      }
    } else {
      res.status(200).json({
        status: false,
        message: "Name and Mobile fields are mandatory",
        data: [],
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

export async function signUpServiceProviderFinal(req: any, response: any) {
  try {
    if (
      req?.body?.firstName &&
      req?.body?.lastName &&
      req?.body?.mobileNumber &&
      req?.body?.countryCode &&
      req?.body?.otp
    ) {
      const query = `SELECT * FROM temp_service_providers WHERE mobile = '${req?.body?.mobileNumber}'`;
      const mobileResult = await vaasPgQuery(query, [], cachingType.NoCache);
      if (mobileResult?.queryResponse.length !== 0) {
        const getQuery = `SELECT first_name, last_name, mobile, otp, country_code, temp_provider_id, otp_verified FROM temp_service_providers WHERE mobile = '${req?.body?.mobileNumber}' AND otp = '${req?.body?.otp}'`;
        const otpResult = await vaasPgQuery(getQuery, [], cachingType.NoCache);
        const firstName = otpResult?.queryResponse[0]?.first_name;
        const lastName = otpResult?.queryResponse[0]?.last_name;
        const providerId = otpResult?.queryResponse[0]?.temp_provider_id;
        const countryCode = otpResult?.queryResponse[0]?.country_code;
        const mobileNumber = otpResult?.queryResponse[0]?.mobile;
        if (otpResult) {
          if (otpResult?.queryResponse?.length == 0) {
            response.status(401).json({
              status: false,
              message: "Invalid OTP",
              data: [],
            });
          } else {
            if (otpResult?.queryResponse[0]?.otp_verified == true) {
              return response.status(401).json({
                status: false,
                message: "OTP already used",
                data: [],
              });
            } else {
              const expirationTime = new Date(
                otpResult.queryResponse[0].expiration_time
              );
              const currentTime = new Date();
              if (expirationTime > currentTime) {
                return response.status(401).json({
                  status: false,
                  message: "OTP expired, try again",
                  data: [],
                });
              } else {
                const token = jwt.sign(
                  {
                    userDetails: {
                      firstName: firstName,
                      lastName: lastName,
                      countryCode: countryCode,
                      mobileNumber: mobileNumber,
                    },
                    provider_id: providerId,
                  },
                  String(process.env.JWT_KEY),
                  {
                    expiresIn: serviceProviderTokenExpiryDays,
                  }
                );

                getVaasPgClient(
                  (err: any, client: any, done: any, res: any) => {
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
                          // release the client back to the pool
                          done();
                        });
                      }
                      return !!err;
                    };
                    client.query("BEGIN", (err: any, res: any) => {
                      if (shouldAbort(err)) return;
                      /* Insert Data to temp_service_providers table */
                      const updateQuery = `UPDATE temp_service_providers SET otp_verified = true WHERE otp = '${req?.body?.otp}'`;
                      client.query(updateQuery, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return;
                        /* If temp_service_providers created successfully, save provider relation with temp_service_providers to  service_provider pivot table*/
                        const insertQuery = `INSERT INTO service_providers (provider_id, country_code, mobile, status, first_name, last_name) VALUES ('${providerId}','${countryCode}','${mobileNumber}','enable','${firstName}','${lastName}')`;
                        client.query(insertQuery, [], (err: any, res: any) => {
                          if (shouldAbort(err)) return;
                          /* If service_providers created successfully, save provider relation with service_providers to  doctors pivot table*/
                          const doctorquery = `INSERT INTO doctors (provider_id) VALUES ('${providerId}')`;
                          client.query(
                            doctorquery,
                            [],
                            (err: any, res: any) => {
                              client.query(
                                "COMMIT",
                                (err: any, req: any, res: any) => {
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
                                  const serviceProviderLog = {
                                    'provider_id': providerId,
                                    'updated_by': providerId,
                                    'updated_user_from': 'service_providers'
                                  };
                                  serviceProviderSchema.create(serviceProviderLog);
                                  response.status(200).json({
                                    status: true,
                                    message: "provider Created Successfully",
                                    data: [{ token }],
                                  });
                                }
                              );
                            }
                          );
                        });
                      });
                    });
                  }
                );
              }
            }
          }
        }
      } else {
        response.status(200).json({
          status: false,
          message: "Invalid Mobile No",
          data: [],
        });
      }
    } else {
      response.status(200).json({
        status: false,
        message: "Required fields are missing!",
        data: [],
      });
    }
  } catch (err) {
    response.status(200).json({
      status: false,
      message: "Error",
      error: err,
    });
  }
}

export async function createServiceProviderProfile(req: any, response: any) {
  try {
    const providerDetails = req[`serviceProviderData`];
    const mobileNumber = providerDetails?.userDetails?.mobileNumber;
    const firstName = providerDetails?.userDetails?.firstName;
    const lastName = providerDetails?.userDetails?.lastName;
    const countryCode = providerDetails?.userDetails?.countryCode;
    const userType = req?.body?.userType == undefined ? null : req?.body?.userType;
    const providerId = providerDetails?.provider_id;
    const dob = req?.body?.dob == undefined ? null : req?.body?.dob;
    const gender = req?.body?.gender == undefined ? null : req?.body?.gender;
    const profilePicture = req?.body?.profile_picture == undefined ? null : req?.body?.profile_picture;
    const degree = req?.body?.degree == undefined ? null : req?.body?.degree;
    const registerNumber = req?.body?.reg_number == undefined ? null : req?.body?.reg_number;
    const registerName = req?.body?.reg_name == undefined ? null : req?.body?.reg_name;
    const specialization = req?.body?.specialization == undefined ? null : req?.body?.specialization;
    const address = req?.body?.address == undefined ? null : req?.body?.address;
    const pincode = req?.body?.pincode == undefined ? null : req?.body?.pincode;
    const about = req?.body?.about == undefined ? null : req?.body?.about;
    const language = req?.body?.language == undefined ? null : req?.body?.language;
    const awards = req?.body?.awards == undefined ? null : req?.body?.awards;
    const membership = req?.body?.membership == undefined ? null : req?.body?.membership;
    const country = req?.body?.country == undefined ? null : req?.body?.country;
    const state = req?.body?.state == undefined ? null : req?.body?.state;
    const city = req?.body?.city == undefined ? null : req?.body?.city;
    const email = req?.body?.email == undefined ? null : req?.body?.email;
    const referred = req?.body?.referred == undefined ? null : req?.body?.referred;
    const timezone = req?.body?.timezone == undefined ? null : req?.body?.timezone;
    const providerAgreement = req?.body?.providerAgreement == undefined ? null : req?.body?.providerAgreement;
    const whatsappNotifications = req?.body?.whatsappNotifications == undefined ? null : req?.body?.whatsappNotifications;
    const providerAgreementId = uuidv4();
    let langInsert = "";
    let specializationQuery = "";
    let degreeQuery = "";
    if (userType !== 'admin') {
      const doctorExist = await vaasPgQuery(
        `SELECT provider_id FROM doctors WHERE provider_id = '${providerId}'`,
        [],
        cachingType.NoCache
      );
      if (doctorExist.queryResponse.length === 0) {
        return response.status(200).json({
          status: true,
          message: "Profile does not exist!",
          data: [],
        });
      } else {
        const mobileNumberCheck = `select sp.mobile from service_providers sp where sp.provider_id not in ('${providerId}')
and sp.mobile = '${mobileNumber}'`
        const mobileCheck = await vaasPgQuery(mobileNumberCheck, [], cachingType.NoCache);
        if (mobileCheck.queryResponse.length == 0) {
          const emailCheck = `select sp.email from service_providers sp where sp.provider_id not in ('${providerId}')
        and sp.email = '${email}'`
          const Check = await vaasPgQuery(emailCheck, [], cachingType.NoCache);
          if (Check.queryResponse.length == 0) {
            if (language?.length > 0) {
              langInsert = `INSERT INTO provider_languages (lang_id,provider_id) VALUES `;
              for (let i = 0; i < language.length; i++) {
                if (req?.body?.language[i]) {
                  const loopLast = language.length - 1;
                  if (i == loopLast) {
                    langInsert += ` ('${req?.body?.language[i]}','${providerId}');`;
                  } else {
                    langInsert += ` ('${req?.body?.language[i]}','${providerId}'), `;
                  }
                } else {
                  return response.status(200).json({
                    status: false,
                    message: `Invalid data found while inserting languages`,
                    data: [],
                  });
                }
              }
            }
            if (specialization?.length > 0) {
              specializationQuery = `INSERT INTO provider_sub_specializations (provider_id, specialization_id, sub_specialization_id, experience) VALUES `;
              for (let i = 0; i < specialization.length; i++) {
                if (specialization[i]) {
                  const { specialization_id, sub_specializations } = specialization[i];
                  for (let j = 0; j < sub_specializations?.length; j++) {
                    const { sub_specialization_id, experience } = sub_specializations[j];
                    specializationQuery += ` ('${providerId}','${specialization_id}','${sub_specialization_id}', '${experience}' ), `;
                  }
                } else {
                  return response.status(200).json({
                    status: false,
                    message: `Invalid data found while inserting specialization`,
                    data: [],
                  });
                }
              }
              specializationQuery = specializationQuery.replace(/,\s*$/, "");
            }
            if (degree?.length > 0) {
              degreeQuery = `INSERT INTO provider_degree (provider_id, degree_id) VALUES `;
              for (let i = 0; i < degree.length; i++) {
                if (req?.body?.degree[i]) {
                  const lastDegree = degree.length - 1;
                  if (i == lastDegree) {
                    degreeQuery += ` ('${providerId}', '${req?.body?.degree[i]}');`;
                  } else {
                    degreeQuery += ` ('${providerId}', '${req?.body?.degree[i]}'), `;
                  }
                } else {
                  return response.status(200).json({
                    status: false,
                    message: `Invalid data found while inserting degrees`,
                    data: [],
                  });
                }
              }
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
                client.query('BEGIN', (err: any, res: any) => {
                  if (shouldAbort(err)) return
                  const insertQueryFirst = `INSERT INTO service_providers_agreement (agreement_id, agreement_status) VALUES ('${providerAgreementId}','${providerAgreement}')`;
                  client.query("BEGIN", (err: any, res: any) => {
                    if (shouldAbort(err)) return;
                    /* Update service provider data */
                    const providerQuery = `UPDATE service_providers
                 SET email = '${email}', dob = '${dob}', gender = '${gender}', address = '${address}', country = '${country}', state = '${state}',city = '${city}', pincode = '${pincode}', referred_by = '${referred}', profile_picture = '${profilePicture}', timezone = '${timezone}', whatsapp_notifications = '${whatsappNotifications}', terms_and_conditions = '${providerAgreement}', user_type = '${userType}' WHERE provider_id = '${providerId}'`;
                    client.query(providerQuery, [], (err: any, res: any) => {
                      if (shouldAbort(err)) return;
                      /* Update service provider data */
                      const updateQuery = `UPDATE doctors
                 SET  medical_council_reg_no = '${registerNumber}', medical_council_reg_name = '${registerName}', about = '${about}', awards = '${awards}', membership = '${membership}'
                 WHERE provider_id = '${providerId}'`;
                      client.query(updateQuery, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return;
                        /* Language Deletion */
                        const deleteData = `DELETE FROM provider_languages WHERE provider_id IN ('${providerId}')`;
                        client.query(deleteData, [], (err: any, res: any) => {
                          if (shouldAbort(err)) return;
                          /* Language Insertion */
                          const languageQuery = langInsert;
                          client.query(languageQuery, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return;
                            /* Specialization Deletion */
                            const specializationDelete = `DELETE FROM provider_specialization WHERE provider_id IN ('${providerId}')`;
                            client.query(specializationDelete, [], (err: any, res: any) => {
                              if (shouldAbort(err)) return;
                              /* Specialization Insertion */
                              const specializationInsert = specializationQuery;
                              client.query(specializationInsert, [], (err: any, res: any) => {
                                if (shouldAbort(err)) return;
                                /* Degree Deletion */
                                const degreeDelete = `DELETE FROM provider_degree WHERE provider_id IN ('${providerId}')`;
                                client.query(degreeDelete, [], (err: any, res: any) => {
                                  if (shouldAbort(err)) return;
                                  /* Degree Insertion */
                                  const degreeInsert = degreeQuery;
                                  client.query(degreeInsert, [], (err: any, res: any) => {
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
                                      const serviceProviderLog = {
                                        'provider_id': providerId,
                                        'updated_by': providerId,
                                        'updated_user_from': 'service_providers'
                                      };
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
                                        },
                                        String(process.env.JWT_KEY),
                                        {
                                          expiresIn: "365d",
                                        }
                                      );
                                      serviceProviderSchema.create(serviceProviderLog);
                                      response.status(200).json({
                                        status: true,
                                        message: "provider Profile Updated Successfully",
                                        data: [{ token }],
                                      });
                                    });
                                  });
                                });
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
            response.status(200).json({
              status: false,
              message: "email already exist",
              data: [],
            });
          }
        } else {
          response.status(200).json({
            status: false,
            message: "Mobile number already exist",
            data: [],
          });
        }
      }
    } else {
      const adminExist = await vaasPgQuery(
        `SELECT provider_id FROM service_providers WHERE provider_id = '${providerId}'`,
        [],
        cachingType.NoCache
      );
      if (adminExist.queryResponse.length === 0) {
        return response.status(200).json({
          status: true,
          message: "Profile does not exist!",
          data: [],
        });
      } else {
        const mobileNumberCheck = `select sp.mobile from service_providers sp where sp.provider_id not in ('${providerId}')
and sp.mobile = '${mobileNumber}'`
        const mobileCheck = await vaasPgQuery(mobileNumberCheck, [], cachingType.NoCache);
        if (mobileCheck.queryResponse.length == 0) {
          const emailCheck = `select sp.email from service_providers sp where sp.provider_id not in ('${providerId}')
          and sp.email = '${email}'`
          const Check = await vaasPgQuery(emailCheck, [], cachingType.NoCache);
          if (Check.queryResponse.length == 0) {
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
                const insertQuery = `INSERT INTO service_providers_agreement (agreement_id, agreement_status) VALUES ('${providerAgreementId}','${providerAgreement}')`;
                client.query(insertQuery, [], (err: any, res: any) => {
                  if (shouldAbort(err)) return
                  const providerQuery = `UPDATE service_providers
                 SET email = '${email}', dob = '${dob}', gender = '${gender}', address = '${address}', country = '${country}', state = '${state}',city = '${city}', pincode = '${pincode}', referred_by = '${referred}', profile_picture = '${profilePicture}', timezone = '${timezone}', whatsapp_notifications = '${whatsappNotifications}', terms_and_conditions = '${providerAgreement}' WHERE provider_id = '${providerId}'`;
                  client.query(providerQuery, [], (err: any, res: any) => {
                    if (shouldAbort(err)) return
                    client.query('COMMIT', (err: any, req: any, res: any) => {
                      if (err) {
                        const duration = Date.now() - start
                        console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                      }
                      done();
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
                        },
                        String(process.env.JWT_KEY),
                        {
                          expiresIn: "365d",
                        }
                      );
                      response.status(200).json({
                        status: true,
                        message: "provider Profile Updated Successfully",
                        data: [{ token }],
                      });
                    })
                  })
                })
              })
            })
          } else {
            response.status(200).json({
              status: false,
              message: "email already exist",
              data: [],
            });
          }

        } else {
          response.status(200).json({
            status: false,
            message: "Mobile number already exist",
            data: [],
          });
        }

      }
    }
  } catch (err) {
    response.status(200).json({
      status: false,
      message: "Error",
      error: err,
    });
  }
}

export async function serviceProviderAppointmentSetting(req: any, res: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    const query = `SELECT default_clinic FROM service_providers WHERE provider_id = '${providerId}'`;
    const providerResult = await vaasPgQuery(query, [], cachingType.StandardCache);
    if (providerResult?.queryResponse[0]?.default_clinic == null) {
      return res.status(200).json({
        status: false,
        message: "Please Register under a Clinic",
        data: [],
      });
    } else {
      const providerTimings = req?.body?.providerTimings;
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const sessionType = req?.body?.session_type == undefined ? null : req?.body?.session_type;
      const duration = req?.body?.duration == undefined ? null : req?.body?.duration;
      const deleteExistingTimesQuery = `DELETE from sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = '${sessionType}' AND consumer_type = 'Patient'`;
      const deleteExistingTimes = await vaasPgQuery(deleteExistingTimesQuery, [], cachingType.NoCache);
      //Insert Time settings
      let timeExist = false;
      for (const timing of providerTimings) {
        const timeId = uuidv4();
        const { startTime, endTime, startDate, endDate } = timing;
        if (startTime && endTime) {
          const splitStartDate = startDate.split("-");
          const splitStartTime = startTime.split(":");
          const splitEndDate = endDate.split("-");
          const splitEndTime = endTime.split(":");
          const dateStartTime = new Date(Date.UTC(Number(splitStartDate[0]), Number(splitStartDate[1] - 1), Number(splitStartDate[2]), splitStartTime[0], splitStartTime[1], 0, 0));
          const dateEndTime = new Date(Date.UTC(Number(splitEndDate[0]), Number(splitEndDate[1] - 1), Number(splitEndDate[2]), splitEndTime[0], splitEndTime[1], 0, 0));
          const currentDate = new Date();
          if (dateStartTime < dateEndTime) {
            if (dateStartTime >= currentDate) {
              const validateTimesQuery = `SELECT time_id FROM sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND consumer_type = 'MR'  AND start_date ='${startDate}' AND end_date = '${endDate}'  AND start_time ='${startTime}' AND end_time = '${endTime}'`;
              const validateTimes = await vaasPgQuery(validateTimesQuery, [], cachingType.NoCache);
              const validateTimesData = validateTimes.queryResponse;
              if (validateTimesData.length > 0) {
                timeExist = true;
                return res.status(200).json({
                  status: false,
                  message: `Already MR Appointment slot exist for session ${startTime} - ${endTime}`,
                  data: [],
                });
              } else {
                timeExist = false;
              }
              if (timeExist == false) {
                // insert timings to PG
                const timingInsertQuery = `INSERT INTO sc_${tableCenterId}_pr_time_settings (time_id, provider_id, center_id, start_date, end_date, appointment_duration, start_time, end_time, session_type, consumer_type)
        VALUES ('${timeId}','${providerId}','${centerId}','${startDate}','${endDate}','${duration}','${startTime}', '${endTime}', '${sessionType}', 'Patient' )`;
                const timingInsert = await vaasPgQuery(timingInsertQuery, [], cachingType.NoCache);
                // Mongo log
                const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_pr_time_settings", appointmentTimeSettings);
                const appointmentTimeSettingModel = new model({
                  'time_id': timeId,
                  'provider_id': providerId,
                  'consumer_type': 'Patient',
                  'center_id': req[`serviceProviderData`][`default_clinic`],
                  'created_by': providerId,
                  'created_user_from': 'service_providers'
                })
                appointmentTimeSettingModel.save();
              } else {
                return res.status(200).json({
                  status: false,
                  message: `Already MR Appointment slot exist for session ${startTime} - ${endTime}`,
                  data: [],
                });
              }
            } else {
              return res.status(200).json({
                status: true,
                message: "You can't enter new time sheet for earlier days.",
                data: [],
              });
            }
          } else {
            return res.status(200).json({
              status: true,
              message: "End Date is earlier than Start Date",
              data: [],
            });
          }
        }
      }
      return res.status(200).json({
        status: true,
        message: "Appointment Time sheet added.",
        data: [],
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

export async function listMyClinics(req: any, res: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    if (providerId !== null) {
      const getQuery = `SELECT pcl.provider_id, pcl.center_id, cl.name FROM provider_clinics as pcl
      LEFT JOIN service_centers as cl ON pcl.center_id = cl.center_id WHERE provider_id = '${providerId}'`;
      const clinicData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
      if (clinicData.queryResponse.length !== 0) {
        return res.status(200).json({
          status: true,
          message: "Clinic Data Listed Successfully",
          data: clinicData.queryResponse,
        });
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "ProviderId not found",
        data: [],
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

export async function switchDefaultClinic(req: any, res: any) {
  try {
    const centerId = req?.body?.centerId == undefined ? null : req?.body?.centerId;
    const providerId = req[`serviceProviderData`][`provider_id`];
    if (centerId) {
      const tableCenterId = centerId.replace(/-/g, "_");
      const serviceProviderQuery = `SELECT pr.country_code, pr.mobile, sp.user_type FROM service_providers as pr LEFT JOIN sc_${tableCenterId}_providers as sp ON sp.provider_id =  pr.provider_id WHERE sp.is_active = true`;
      const provider = await vaasPgQuery(serviceProviderQuery, [], cachingType.NoCache);
      const updateQuery = `UPDATE service_providers SET default_clinic = '${centerId}' WHERE provider_id = '${providerId}'`;
      await vaasPgQuery(updateQuery, [], cachingType.NoCache);
      const token = jwt.sign(
        {
          provider_id: providerId,
          user_type: provider.queryResponse[0].user_type,
          country_code: provider.queryResponse[0].country_code,
          mobile: provider.queryResponse[0].mobile,
          default_clinic: centerId
        },
        String(process.env.JWT_KEY),
        {
          expiresIn: serviceProviderTokenExpiryDays,
        }
      );
      return res.status(200).json({
        status: true,
        message: "Clinic Switched",
        data: token,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Something went wrong, Can't fetch clinic",
        data: [],
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

export async function appointmentUnavailability(req: any, res: any) {
  const unAvailable = req?.body?.un_available == undefined ? false : req?.body?.un_available;
  const tempUnavailable = req?.body?.temp_unavailable == undefined ? false : req?.body?.temp_unavailable;
  const providerId = req[`serviceProviderData`][`provider_id`];
  const centerId = req[`serviceProviderData`][`default_clinic`];
  const tableCenterId = centerId.replace(/-/g, "_");
  const sessionType = req?.body?.session_type == undefined ? false : req?.body?.session_type;
  if (unAvailable === true) {
    if (sessionType !== null) {
      const updateQuery = `UPDATE sc_${tableCenterId}_pr_time_settings  SET un_available = true, temporarily_unavailable = false WHERE provider_id = '${providerId}' AND center_id = '${centerId}' AND session_type = '${sessionType}'`;
      await vaasPgQuery(updateQuery, [], cachingType.NoCache);
      //Delete Existing temporarily unavailable Time settings
      const deleteExistingQuery = `DELETE from sc_${tableCenterId}_pr_unavailabilities WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = '${sessionType}'`;
      await vaasPgQuery(deleteExistingQuery, [], cachingType.NoCache);
      return res.status(200).json({
        status: true,
        message: "Unavailability updated",
        data: [],
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Please select type of session",
        data: [],
      });
    }
  } else if (tempUnavailable === true) {
    const updateQuery1 = `UPDATE sc_${tableCenterId}_pr_time_settings  SET un_available = false, temporarily_unavailable = true WHERE provider_id = '${providerId}' AND center_id = '${centerId}' AND session_type = '${sessionType}'`;
    await vaasPgQuery(updateQuery1, [], cachingType.NoCache);
    //Delete Existing unavailable Time settings
    const deleteExistingQuery = `DELETE from sc_${tableCenterId}_pr_unavailabilities WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = '${sessionType}'`;
    await vaasPgQuery(deleteExistingQuery, [], cachingType.NoCache);
    // Insert new unavailability settings
    const unavailableTimings = req?.body?.unavailableTimings;
    const duration = req?.body?.duration == undefined ? null : req?.body?.duration;
    for (const timing of unavailableTimings) {
      const timeId = uuidv4();
      const { startTime, endTime, startDate, endDate } = timing;
      if (startTime && endTime) {
        const unavailId = uuidv4();
        const unavailableQuery = `INSERT INTO sc_${tableCenterId}_pr_unavailabilities (unavail_id, session_type, center_id, provider_id, start_date, end_date, appointment_duration, start_time,end_time) VALUES('${unavailId}','${sessionType}', '${centerId}','${providerId}','${startDate}','${endDate}','${duration}','${startTime}','${endTime}') `;
        await vaasPgQuery(unavailableQuery, [], cachingType.NoCache);
        // Mongo log
        const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_pr_unavailabilities", appointmentUnavailable);
        const appointmentTimeSettingModel = new model({
          'time_id': timeId,
          'provider_id': providerId,
          'center_id': req[`serviceProviderData`][`default_clinic`],
          'created_by': providerId,
          'created_user_from': 'service_providers'
        })
        appointmentTimeSettingModel.save();
      }
    }
    return res.status(200).json({
      status: true,
      message: "Temporarily Unavailability updated",
      data: [],
    });
  } else {
    return res.status(200).json({
      status: false,
      message: "No updates found",
      data: [],
    });
  }
}

export async function mrSettings(req: any, res: any) {
  try {
    const providerTimings = req?.body?.providerTimings;
    const providerId = req[`serviceProviderData`][`provider_id`];
    const centerId = req[`serviceProviderData`][`default_clinic`];
    const tableCenterId = centerId.replace(/-/g, "_");
    const day = req?.body?.day;
    const sessionType = 'In_clinic';
    const duration = req?.body?.duration == undefined ? null : req?.body?.duration;
    let timeExist = false;
    for (const timing of providerTimings) {
      const { startTime, endTime, startDate, endDate } = timing;
      const validateTimesQuery = `SELECT time_id FROM sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND consumer_type = 'Patient'  AND start_date ='${startDate}' AND end_date = '${endDate}'  AND start_time ='${startTime}' AND end_time = '${endTime}'`;
      const validateTimes = await vaasPgQuery(validateTimesQuery, [], cachingType.NoCache);
      const validateTimesData = validateTimes.queryResponse;
      if (validateTimesData.length > 0) {
        timeExist = true;
        return res.status(200).json({
          status: false,
          message: `Already patient Appointment slot exist for session ${startTime} - ${endTime}`,
          data: [],
        });
      } else {
        timeExist = false;
      }
    }
    if (timeExist == false) {
      const deleteExistingTimesQuery = `DELETE from sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = '${sessionType}' AND consumer_type = 'MR'`;
      await vaasPgQuery(deleteExistingTimesQuery, [], cachingType.NoCache);
      for (const timing of providerTimings) {
        const { startTime, endTime, startDate, endDate } = timing;
        const timeId = uuidv4();
        if (startTime && endTime) {
          const timingInsertQuery = `INSERT INTO sc_${tableCenterId}_pr_time_settings (time_id, provider_id, center_id, appointment_duration, start_time, end_time, start_date, end_date, session_type, consumer_type)
          VALUES ('${timeId}','${providerId}','${centerId}','${duration}','${startTime}', '${endTime}', '${startDate}', '${endDate}', '${sessionType}','MR' )`;
          await vaasPgQuery(timingInsertQuery, [], cachingType.NoCache);
        }
        // Mongo log
        const model = mongoose.model("sc_" + req[`serviceProviderData`][`default_clinic`] + "_pr_time_settings", appointmentTimeSettings);
        const appointmentTimeSettingModel = new model({
          'time_id': timeId,
          'consumer_type': 'MR',
          'provider_id': providerId,
          'center_id': req[`serviceProviderData`][`default_clinic`],
          'created_by': providerId,
          'created_user_from': 'service_providers'
        })
        appointmentTimeSettingModel.save();
      }
      return res.status(200).json({
        status: true,
        message: "MR Appointment Time sheet updated.",
        data: [],
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "No updates found",
        data: [],
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

export async function createMedicalCertificate(req: any, res: any) {
  try {
    const centerId = req?.body?.centerId == undefined ? null : req?.body?.centerId;
    const consumerId = req?.body?.consumerId == undefined ? null : req?.body?.consumerId;
    const certificateId = uuidv4();
    const providerId = req[`serviceProviderData`][`provider_id`];
    const issuedAt = req?.body?.issuedAt == undefined ? null : req?.body?.issuedAt;
    const durationFrom = req?.body?.from == undefined ? null : req?.body?.from;
    const diagnosis = req?.body?.diagnosis == undefined ? null : req?.body?.diagnosis;
    const durationTo = req?.body?.to == undefined ? null : req?.body?.to;
    const resumption = req?.body?.resumption == undefined ? null : req?.body?.resumption;
    if (durationFrom <= durationTo) {
      if (centerId && consumerId && certificateId && providerId && issuedAt && durationFrom && durationTo && resumption && diagnosis) {
        const query = `INSERT INTO medical_certificate (certificate_id,provider_id,consumer_id,center_id,issued_at,duration_from,duration_to,diagnosis,date_of_resumption) VALUES ('${certificateId}','${providerId}','${consumerId}','${centerId}','${issuedAt}','${durationFrom}','${durationTo}','${diagnosis}','${resumption}')`;
        await vaasPgQuery(query, [], cachingType.NoCache)
        return res.status(200).json({
          status: true,
          message: "success",
          data: [],
        });
      } else {
        return res.status(200).json({
          status: false,
          message: "required fields are missing",
          data: [],
        });
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "End date is earlier than the starter one!",
        data: [],
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

export async function updateMedicalCertificate(req: any, res: any) {
  try {
    if (req?.params?.certificate_id) {
      const providerId = req[`serviceProviderData`][`provider_id`];
      const query = `SELECT provider_id FROM medical_certificate WHERE certificate_id = '${req?.params?.certificate_id}'`;
      const find = await vaasPgQuery(query, [], cachingType.NoCache);
      if (find?.queryResponse[0].provider_id === providerId) {
        const consumerId = req?.body?.consumerId == undefined ? null : req?.body?.consumerId;
        const centerId = req?.body?.centerId == undefined ? null : req?.body?.centerId;
        const issuedAt = req?.body?.issuedAt == undefined ? null : req?.body?.issuedAt;
        const durationFrom = req?.body?.from == undefined ? null : req?.body?.from;
        const diagnosis = req?.body?.diagnosis == undefined ? null : req?.body?.diagnosis;
        const durationTo = req?.body?.to == undefined ? null : req?.body?.to;
        const resumption = req?.body?.resumption == undefined ? null : req?.body?.resumption;
        if (durationFrom <= durationTo) {
          const updateQuery = `UPDATE medical_certificate
        SET  provider_id = '${providerId}', issued_at = '${issuedAt}', duration_from = '${durationFrom}', duration_to = '${durationTo}',date_of_resumption = '${resumption}', diagnosis = '${diagnosis}', center_id = '${centerId}', consumer_id = '${consumerId}'
        WHERE certificate_id = '${req?.params?.certificate_id}'`;
          const Update = await vaasPgQuery(updateQuery, [], cachingType.NoCache);
          if (Update) {
            return res.status(200).json({
              status: true,
              message: "Updated Successfully",
              data: [],
            });
          }
        } else {
          return res.status(200).json({
            status: false,
            message: "End date is earlier than the starter one!",
            data: [],
          });
        }
      } else {
        res.status(200).json({
          status: false,
          message: "Selected Medical Certificate not belongs to you",
          error: [],
        });
      }
    } else {
      res.status(200).json({
        status: false,
        message: "Medical certificate not found",
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

export async function getServiceProviderAppointmentTimings(req: any, res: any) {
  try {
    const pageQuery = parseInt(String(req?.query?.pageNo), 0);
    const page = (pageQuery && pageQuery !== null && pageQuery > 0) ? pageQuery : 1;
    let pageSize = parseInt(String(req?.query?.pageSize));
    if (pageSize && pageSize !== null) {
      if (pageSize > 100) {
        pageSize = 100;
      } else if (pageSize < 5) {
        pageSize = 5;
      }
    } else {
      pageSize = 5;
    }
    const offset = (page - 1) * pageSize
    const serviceProvider = req[`serviceProviderData`];
    const providerId = serviceProvider?.provider_id;
    const query = `SELECT default_clinic FROM service_providers WHERE provider_id = '${providerId}'`;
    const providerResult = await vaasPgQuery(query, [], cachingType.NoCache);
    if (providerResult?.queryResponse[0]?.default_clinic == null) {
      return res.status(200).json({
        status: false,
        message: "Please Register under a Clinic",
        data: [],
      });
    } else {
      const centerId = serviceProvider?.default_clinic;
      const tableCenterId = centerId.replace(/-/g, "_");
      const sessionType = req?.params?.session_type == undefined ? null : req?.params?.session_type;
      const currentDate = new Date();
      const month = Number(currentDate.getMonth()) + 1
      const day = currentDate.getDate()
      const year = currentDate.getFullYear()
      const dateString = `${year}-${month}-${day}`;
      const selectExistingTimesQuery = `SELECT time_id, session_type, start_date, end_date, appointment_duration, start_time, end_time,consumer_type, count(time_id) OVER() as total_rows from sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = '${sessionType}' AND consumer_type = 'Patient' AND end_date >= '${dateString}'::date ORDER BY id LIMIT ${pageSize} OFFSET ${offset}`;
      const selectExistingTimes = await vaasPgQuery(selectExistingTimesQuery, [], cachingType.StandardCache);
      return res.status(200).json({
        status: true,
        message: "Appointment Time sheet resulted.",
        data: selectExistingTimes.queryResponse,
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

export async function getServiceProviderUnavailabilitySettings(req: any, res: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    const query = `SELECT default_clinic FROM service_providers WHERE provider_id = '${providerId}'`;
    const providerResult = await vaasPgQuery(query, [], cachingType.StandardCache);
    if (providerResult?.queryResponse[0]?.default_clinic == null) {
      return res.status(200).json({
        status: false,
        message: "Please Register under a Clinic",
        data: [],
      });
    } else {
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const sessionType = req?.params?.session_type == undefined ? null : req?.params?.session_type;
      const selectExistingTimesQuery = `SELECT un_available,temporarily_unavailable,session_type,time_id from sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = '${sessionType}' AND consumer_type = 'Patient'`;
      const selectExistingTimes = await vaasPgQuery(selectExistingTimesQuery, [], cachingType.StandardCache);
      let unavailableResult = {};
      if (selectExistingTimes.queryResponse.length > 0) {
        if (selectExistingTimes.queryResponse[0].temporarily_unavailable == true) {
          const unavailableQuery = `SELECT * FROM sc_${tableCenterId}_pr_unavailabilities WHERE session_type = '${sessionType}' AND center_id = '${centerId}' AND provider_id = '${providerId}'`;
          const unavailableQueryResult = await vaasPgQuery(unavailableQuery, [], cachingType.StandardCache);
          unavailableResult = { "time_settings": selectExistingTimes.queryResponse[0], "unavailable_slots": unavailableQueryResult.queryResponse };
        } else {
          unavailableResult = { "time_settings": selectExistingTimes.queryResponse };
        }
      }

      return res.status(200).json({
        status: true,
        message: "Appointment Time sheet resulted.",
        data: unavailableResult,
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

export async function getServiceProviderMrSettings(req: any, res: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    const query = `SELECT default_clinic FROM service_providers WHERE provider_id = '${providerId}'`;
    const providerResult = await vaasPgQuery(query, [], cachingType.StandardCache);
    if (providerResult?.queryResponse[0]?.default_clinic == null) {
      return res.status(200).json({
        status: false,
        message: "Please Register under a Clinic",
        data: [],
      });
    } else {
      const centerId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = centerId.replace(/-/g, "_");
      const selectExistingTimesQuery = `SELECT * from sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND session_type = 'In_clinic' AND consumer_type = 'MR'`;
      const selectExistingTimes = await vaasPgQuery(selectExistingTimesQuery, [], cachingType.StandardCache);
      return res.status(200).json({
        status: true,
        message: "MR Time sheet resulted.",
        data: selectExistingTimes.queryResponse,
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

function createError(res: any, error: any, message: string) {
  res.status(404).json(
    {
      status: false,
      message,
      error
    }
  )
}

export async function listAllDetails(req: any, res: any) {
  const specializationList = listSpecialization();
  const subSpecializationList = listSubSpecialization();
  const registrationCouncilList = listRegistrationCouncil();
  const degreeList = listDegree();
  const languageList = listLanguages();
  const countryList = listCountries();
  const stateList = listStates();
  const cityList = listCities();
  const timeZoneList = listTimeZones();
  const clinicSpecialityList = listClinicSpecialities();
  const bloodGroupList = listBloodGroup();
  Promise.all([
    specializationList.catch(err => {
      createError(req, err, 'Specializations not found')
    }),
    subSpecializationList.catch(err => {
      createError(req, err, 'Sub-Specializations not found')
    }),
    registrationCouncilList.catch(err => {
      createError(req, err, 'Registration Council not found')
    }),
    degreeList.catch(err => {
      createError(req, err, 'Degree not found')
    }),
    languageList.catch(err => {
      createError(req, err, 'Languages not found')
    }),
    countryList.catch(err => {
      createError(req, err, 'Country not found')
    }),
    stateList.catch(err => {
      createError(req, err, 'State not found')
    }),
    cityList.catch(err => {
      createError(req, err, 'City not found')
    }),
    timeZoneList.catch(err => {
      createError(req, err, 'TimeZone not found')
    }),
    clinicSpecialityList.catch(err => {
      createError(req, err, 'Clinic Speciality not found')
    }),
    bloodGroupList.catch(err => {
      createError(req, err, 'blood group not found')
    }),
  ]).then(values => {
    const data = {
      "specialization_list": values[0],
      "sub-specialization_list": values[1],
      "registration_council_list": values[2],
      "degree_list": values[3],
      "language_list": values[4],
      "country_list": values[5],
      "state_list": values[6],
      "city_list": values[7],
      "timeZone_list": values[8],
      "clinic_speciality_list": values[9],
      "blood_groups": values[10]
    }
    return res.status(200).json({
      status: true,
      message: "All Details Listed Successfully.",
      data: data,
    });
  })
}


export async function getServiceProviderProfile(req: any, res: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    if (providerId) {
      const providerQuery = `SELECT sp.provider_id, sp.first_name, sp.last_name, sp.profile_picture, sp.email, sp.country_code, sp.mobile, sp.verified, sp.timezone,
      d.dob,d.gender, d.age, d.medical_council_reg_no, d.medical_council_reg_name, d.registration_number, d.address, d.pincode,
      d.referred_by, d.awards, d.about, d.membership, d.country, d.state, d.city,
      (SELECT json_agg(json_build_object(
         'sub_specialization', spe.sub_specialization_id,
         'specialization', spe.specialization_id,
         'experience', spe.experience
         )) AS specializations 
              FROM provider_sub_specializations AS spe
              WHERE sp.provider_id = spe.provider_id
             ) AS specializations, 
              (SELECT json_agg(dg.degree_id) 
              FROM provider_degree AS dg
              WHERE sp.provider_id = dg.provider_id
             ) AS degree
      FROM  service_providers as sp
      LEFT JOIN doctors as d ON d.provider_id = sp.provider_id
      WHERE sp.provider_id ='${providerId}'`;
      const providerProfile = await vaasPgQuery(providerQuery, [], cachingType.StandardCache);
      if (providerProfile.queryResponse.length !== 0) {
        return res.status(200).json({
          status: true,
          message: "Service Provider Data Returned Successfully",
          data: providerProfile.queryResponse[0]
        });
      }
    } else {
      res.status(200).json(
        {
          status: false,
          message: 'Provider not exist',
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
