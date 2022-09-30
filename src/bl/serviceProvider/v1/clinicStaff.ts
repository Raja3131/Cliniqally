import { v4 as uuidv4 } from "uuid";
import {
  cachingType,
  getVaasPgClient,
  vaasPgQuery,
} from "../../../services/vaasdbengine";

export async function addClinicStaff(req: any, response: any) {
  try {
    const providerId = req[`serviceProviderData`][`provider_id`];
    const clinicId = req[`serviceProviderData`][`default_clinic`];
    const tableCenterId = clinicId.replace(/-/g, "_");
    const name =
      req?.body?.name == undefined ? null : req?.body?.name;
    const staffId = uuidv4();
    const designation = req?.body?.designation == undefined ? null : req?.body?.designation;
    const countryCode = req?.body?.countryCode == undefined ? null : req?.body?.countryCode;
    const mobileNumber = req?.body?.mobileNumber == undefined ? null : req?.body?.mobileNumber;
    const email = req?.body?.email == undefined ? null : req?.body?.email;
    const access = req?.body?.access == undefined ? null : req?.body?.access;
    const query = `SELECT * FROM service_providers WHERE mobile = '${req?.body?.mobileNumber}'`;
    const mobile = await vaasPgQuery(query, [], cachingType.NoCache);
    if (mobile?.queryResponse.length === 0) {
      const query = `SELECT * FROM service_providers WHERE email = '${req?.body?.email}'`;
      const exist = await vaasPgQuery(query, [], cachingType.NoCache);
      if (exist?.queryResponse.length === 0) {
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
          client.query("BEGIN", (err: any) => {
            if (shouldAbort(err)) return;
            const insertQueryFirst = `INSERT INTO service_providers (provider_id,first_name,country_code,mobile,email,default_clinic,status)VALUES('${staffId}','${name}','${countryCode}','${mobileNumber}','${email}','${clinicId}','enable')`;
            client.query(insertQueryFirst, [], (err: any) => {
              if (shouldAbort(err)) return;
              const insertQuerySecond = `INSERT INTO sc_${tableCenterId}_providers (center_id,provider_id,user_type,is_active) VALUES ('${clinicId}','${staffId}','${access}','true')`;
              client.query(insertQuerySecond, (err: any) => {
                if (shouldAbort(err)) return;
                const insertQueryThrid = `INSERT INTO sc_${tableCenterId}_pr_roles (center_id,provider_id,role_id) VALUES ('${clinicId}','${staffId}','${designation}')`;
                client.query(insertQueryThrid, (err: any) => {
                  if (shouldAbort(err)) return;
                  client.query("COMMIT", (err: any) => {
                    if (err) {
                      const duration = Date.now() - start;
                      console.error(
                        `Time is : ${duration}, Error committing transaction`,
                        err.stack
                      );
                    }
                    done();
                  });
                });
              });
            });
          });
        });
        response.status(200).json({
          status: "success",
          message: "Clinic Staff Added Successfully",
        });
      } else {
        response.status(200).json({
          status: false,
          message: "email Already Exist",
          data: [],
        });
      }
    } else {
      response.status(200).json({
        status: false,
        message: "mobile number Already Exist",
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

export async function getClinicStaffById(req: any, res: any) {
  try {
    const centerId = req[`serviceProviderData`][`default_clinic`];
    //  we need to submit staff's providerId from service providers table
    const staffId = req?.params?.provider_id == undefined ? null : req?.params?.provider_id;
    if (centerId) {
      const tableCenterId = centerId.replace(/-/g, "_");
      const serviceProviderQuery = `select sp.first_name,sp.country_code,sp.mobile,sp.email,spr.role_slug
          from service_providers sp 
           LEFT JOIN sc_${tableCenterId}_pr_roles pr ON sp.provider_id = pr.provider_id 
            LEFT JOIN sc_${tableCenterId}_roles spr ON pr.role_id = spr.role_id
            LEFT JOIN sc_${tableCenterId}_providers pdr ON sp.provider_id = pdr.provider_id 
          where sp.provider_id = '${staffId}' and sp.status = 'enable'; `;
      const provider = await vaasPgQuery(serviceProviderQuery, [], cachingType.NoCache);
      if (provider) {
        return res.status(200).json({
          status: true,
          message: "data listed successfully",
          data: provider,
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

export async function getAllClinicStaffs(req: any, res: any) {
  try {
    const centerId = req[`serviceProviderData`][`default_clinic`];
    const tableCenterId = centerId.replace(/-/g, "_");
    if (centerId) {
      const serviceProviderQuery = `select sp.first_name,sp.country_code,sp.mobile,sp.email,spr.role_slug
          from service_providers sp 
           LEFT JOIN sc_${tableCenterId}_pr_roles pr ON sp.provider_id = pr.provider_id 
            LEFT JOIN sc_${tableCenterId}_roles spr ON pr.role_id = spr.role_id
              LEFT JOIN sc_${tableCenterId}_providers pdr ON sp.provider_id = pdr.provider_id 
            where pdr.is_active = 'true'`;
      const provider = await vaasPgQuery(serviceProviderQuery, [], cachingType.NoCache);
      if (provider) {
        return res.status(200).json({
          status: true,
          message: "data listed successfully",
          data: provider,
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
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      data: err,
    });
  }
}

export async function updateClinicStaff(req: any, response: any) {
  try {
    const providerId = req?.params?.provider_id == undefined ? null : req?.params?.provider_id;
    if (providerId) {
      const clinicId = req[`serviceProviderData`][`default_clinic`];
      const tableCenterId = clinicId.replace(/-/g, "_");
      const name =
        req?.body?.name == undefined ? null : req?.body?.name;
      const designation = req?.body?.designation == undefined ? null : req?.body?.designation;
      const countryCode = req?.body?.countryCode == undefined ? null : req?.body?.countryCode;
      const mobileNumber = req?.body?.mobileNumber == undefined ? null : req?.body?.mobileNumber;
      const email = req?.body?.email == undefined ? null : req?.body?.email;
      const access = req?.body?.access == undefined ? null : req?.body?.access;
      const mobileNumberCheck = `select sp.mobile from service_providers sp where sp.provider_id  not in ('${providerId}')
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
              const updateQuery = `update service_providers sp set country_code = '${countryCode}', email = '${email}', mobile = '${mobileNumber}',first_name = '${name}'
          where sp.provider_id = '${providerId}'`;
              client.query(updateQuery, [], (err: any, res: any) => {
                if (shouldAbort(err)) return;
                const updateDoctorQuery = `update sc_${tableCenterId}_pr_roles set role_id = '${designation}'
            where provider_id = '${providerId}'`;
                client.query(updateDoctorQuery, [], (err: any, res: any) => {
                  if (shouldAbort(err)) return;
                  const updateDoctorrQuery = `update sc_${tableCenterId}_providers set user_type = '${access}'
              where provider_id = '${providerId}'`;
                  client.query(updateDoctorrQuery, [], (err: any, res: any) => {
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
                          "Service Provider and Clinic Staff Updated Successfully",
                        data: [
                          {},
                        ],
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
          message: "Number already exist",
          data: [],
        });
      }
    } else {
      response.status(200).json({
        status: false,
        message: "ProviderId required!",
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

export async function deleteClinicStaff(req: any, response: any) {
  const provider_id = req?.params?.provider_id;
  const clinicId = req[`serviceProviderData`][`default_clinic`];
  const tableCenterId = clinicId.replace(/-/g, "_");
  const start = Date.now();
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
        const deleteQuery = `update service_providers set deleted = true WHERE provider_id = '${provider_id}'`;
        client.query(deleteQuery, [], (err: any, res: any) => {
          if (shouldAbort(err)) return;
          const deleteDoctorQuery = `update sc_${tableCenterId}_providers set is_active = 'false'
           WHERE provider_id = '${provider_id}'`;
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
