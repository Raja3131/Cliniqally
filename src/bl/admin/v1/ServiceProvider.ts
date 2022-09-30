import { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import {
  cachingType,
  getVaasPgClient,
  vaasPgQuery,
} from "../../../services/vaasdbengine";

export async function createServiceProvider(req: any, response: any) {
  try {
    if (req?.body?.email || req?.body?.password || req?.body?.first_name) {
      const emailResult = await vaasPgQuery(
        `SELECT * FROM service_consumers WHERE email = '${req?.body?.email}'`,
        [],
        cachingType.StandardCache
      );
      if (emailResult?.queryResponse.length === 0) {
        const provider_id = uuid();
        const user_type =
          req?.body?.user_type == undefined ? null : req.body.user_type;
        const first_name =
          req?.body?.first_name == undefined ? null : req.body.first_name;
        const last_name =
          req?.body?.last_name == undefined ? null : req.body.last_name;
        const dob = req?.body?.dob == undefined ? null : req.body.dob;
        const age = req?.body?.age == undefined ? null : req.body.age;
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
        const license_number =
          req?.body?.license_number == undefined
            ? null
            : req.body.license_number;
        const degree = req?.body?.degree == undefined ? null : req.body.degree;
        const referred_by =
          req?.body?.referred_by == undefined ? null : req.body.referred_by;
        const awards = req?.body?.awards == undefined ? null : req.body.awards;
        const about = req?.body?.about == undefined ? null : req.body.about;
        const membership =
          req?.body?.membership == undefined ? null : req.body.membership;
        const mobile = req?.body?.mobile == undefined ? null : req.body.mobile;
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

        getVaasPgClient((err: any, client: any, done: any, res: any) => {
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
            if (user_type === "doctor") {
              if (shouldAbort(err)) return;
              const insertQueryFirst = `INSERT INTO service_providers (provider_id,email,user_type) VALUES ('${provider_id}','${email}','${user_type}')`;
              client.query(insertQueryFirst, [], (err: any, res: any) => {
                if (shouldAbort(err)) return;
                const insertQuerySecond = `INSERT INTO doctors (provider_id,first_name,last_name,dob,age,gender,specialization,medical_council_reg_no,medical_council_reg_name,license_number,degree,address,pincode,referred_by,awards,about,membership,country,state,city) VALUES ('${provider_id}','${first_name}','${last_name}','${dob}','${age}','${gender}','${specialization}','${medical_council_reg_no}','${medical_council_reg_name}','${license_number}','${degree}','${address}','${pincode}','${referred_by}','${awards}','${about}','${membership}','${country}','${state}','${city}')`;
                client.query(insertQuerySecond, [], (err: any, res: any) => {
                  if (shouldAbort(err)) return;
                  client.query("COMMIT", (err: any, req: any, res: any) => {
                    if (err) {
                      const duration = Date.now() - start;
                      console.error(
                        `Time is : ${duration}, Error committing transaction`,
                        err.stack
                      );
                    }
                    done();
                    response.status(200).json({
                      status: true,
                      message:
                        "Service Provider and Doctor Created Successfully",
                      data: [],
                    });
                  });
                });
              });
            } else {
              if (shouldAbort(err)) return;
              const insertQuerySecond = `INSERT INTO service_providers (provider_id,email,user_type) VALUES ('${provider_id}','${email}','${user_type}')`;
              client.query(insertQuerySecond, [], (err: any, res: any) => {
                if (shouldAbort(err)) return;
                client.query("COMMIT", (err: any, req: any, res: any) => {
                  if (err) {
                    const duration = Date.now() - start;
                    console.error(
                      `Time is : ${duration}, Error committing transaction`,
                      err.stack
                    );
                  }
                  done();
                  response.status(200).json({
                    status: true,
                    message: "Service Provider Created Successfully",
                    data: [],
                  });
                });
              });
            }
          });
        });
      } else {
        response.status(200).json({
          status: false,
          message: "Account Exist",
          data: [],
        });
      }
    } else {
      response.status(200).json({
        status: false,
        message: "Email and Password fields are mandatory",
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

export async function getServiceProvider(req: any, response: any) {
  try {
    const getServiceProvidersQuery = `SELECT * FROM service_providers LEFT JOIN doctors ON service_providers.provider_id = doctors.provider_id WHERE service_providers.deleted = 'false'`;
    const getServiceProvidersResult = await vaasPgQuery(
      getServiceProvidersQuery,
      [],
      cachingType.StandardCache
    );
    if (getServiceProvidersResult?.queryResponse.length > 0) {
      response.status(200).json({
        status: true,
        message: "Service Providers Fetched Successfully",
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

export async function getServiceProviderById(req: any, response: any) {
  try {
    const id = req?.params?.provider_id;
    if (id) {
      const getServiceProviderByIdQuery = `SELECT sp.email,sp.user_type,doc.first_name,doc.last_name,doc.dob,doc.age,doc.gender,doc.specialization,doc.medical_council_reg_no,doc.medical_council_reg_name,doc.license_number,doc.degree,doc.address,doc.pincode,doc.referred_by FROM service_providers as sp LEFT JOIN doctors as doc ON doc.provider_id = sp.provider_id WHERE sp.provider_id = '${id}'`;
      const getServiceProviderByIdResult = await vaasPgQuery(
        getServiceProviderByIdQuery,
        [],
        cachingType.StandardCache
      );
      if (getServiceProviderByIdResult?.queryResponse.length > 0) {
        response.status(200).json({
          status: true,
          message: "Service Provider Fetched Successfully",
          data: getServiceProviderByIdResult.queryResponse,
        });
      }
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

export async function updateServiceProvider(req: any, response: any) {
  try {
    const provider_id = req?.params?.provider_id;
    if (provider_id) {
      const {
        first_name,
        last_name,
        email,
        dob,
        age,
        gender,
        specialization,
        medical_council_reg_name,
        medical_council_reg_no,
        degree,
        referred_by,
        phone_number,
        address,
        country,
        state,
        city,
        pincode,
        awards,
        about,
        membership,
        license_number,
      } = req.body;
      getVaasPgClient((err: any, client: any, done: any, res: any) => {
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
          const updateQuery = `UPDATE service_providers SET email = '${email}' WHERE provider_id = '${provider_id}'`;
          client.query(updateQuery, [], (err: any, res: any) => {
            if (shouldAbort(err)) return;
            const updateDoctorQuery = `UPDATE doctors SET first_name = '${first_name}', last_name= '${last_name}', dob ='${dob}', age='${age}', gender='${gender}',specialization='${specialization}',medical_council_reg_no='${medical_council_reg_no}',medical_council_reg_name='${medical_council_reg_name}',license_number='${license_number}',degree='${degree}',address='${address}',pincode='${pincode}',referred_by='${referred_by}',awards='${awards}',about='${about}',membership='${membership}' ,country ='${country}',state='${state}',city='${city}' WHERE provider_id = '${provider_id}'`;
            client.query(updateDoctorQuery, [], (err: any, res: any) => {
              if (shouldAbort(err)) return;

              client.query("COMMIT", (err: any, req: any, res: any) => {
                if (err) {
                  const duration = Date.now() - start;
                  console.error(
                    `Time is : ${duration}, Error committing transaction`,
                    err.stack
                  );
                }
                done();
                response.status(200).json({
                  status: true,
                  message: "Service Provider Updated Successfully",
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

export async function deleteServiceProvider(req: any, response: any) {
  const start = Date.now();
  const provider_id = req?.params?.provider_id;
  if (provider_id) {
    getVaasPgClient((err: any, client: any, done: any, res: any) => {
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
        const deleteQuery = `UPDATE service_providers SET deleted = true WHERE provider_id = '${provider_id}'`;
        client.query(deleteQuery, [], (err: any, res: any) => {
          if (shouldAbort(err)) return;
          const deleteDoctorQuery = `UPDATE doctors SET deleted = true WHERE provider_id = '${provider_id}'`;
          client.query(deleteDoctorQuery, [], (err: any, res: any) => {
            if (shouldAbort(err)) return;
            client.query("COMMIT", (err: any, req: any, res: any) => {
              if (err) {
                const duration = Date.now() - start;
                console.error(
                  `Time is : ${duration}, Error committing transaction`,
                  err.stack
                );
              }
              done();
              response.status(200).json({
                status: true,
                message: "Service Provider Deleted Successfully",
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
}

export async function getServiceProviderByUserType(req: any, response: any) {
  try {
    const user_type = req?.params?.user_type;
    if (user_type) {
      const getServiceProviderByUserTypeQuery = `SELECT * FROM service_providers WHERE user_type = '${user_type}'`;
      const getServiceProviderByUserTypeResult = await vaasPgQuery(
        getServiceProviderByUserTypeQuery,
        [],
        cachingType.StandardCache
      );
      if (getServiceProviderByUserTypeResult?.queryResponse.length > 0) {
        response.status(200).json({
          status: true,
          message: "Service Provider Fetched Successfully",
          data: getServiceProviderByUserTypeResult.queryResponse,
        });
      }
    } else {
      response.status(200).json({
        status: false,
        message: "User Type is mandatory",
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
