import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';
export async function addAppointment(req: any, res: any) {
    try {
        const serviceProvider = req[`serviceProviderData`];
        const userType = serviceProvider?.user_type;
        let providerId = serviceProvider?.provider_id;
        const centerId = serviceProvider?.default_clinic;
        const createdBy = providerId;
        if (centerId !== undefined || centerId !== null) {
            if (userType == 'admin') {
                providerId = req?.body?.provider_id == undefined ? null : req?.body?.provider_id;
            }
            const appointmentId = uuidv4();
            const tableCenterId = centerId.replace(/-/g, "_");
            const consumerId = req?.body?.consumer_id == undefined ? null : req?.body?.consumer_id;
            const appointmentMode = req?.body?.appointment_mode == undefined ? null : req?.body?.appointment_mode;
            const appointmentDate = req?.body?.appointment_date == undefined ? null : req?.body?.appointment_date;
            const appointmentTime = req?.body?.appointment_time == undefined ? null : req?.body?.appointment_time;
            const appointmentDuration = req?.body?.appointment_duration == undefined ? null : req?.body?.appointment_duration;
            const whatsappNotification = req?.body?.notify_via_whatsapp == undefined ? null : req?.body?.notify_via_whatsapp;
            const smsNotification = req?.body?.notify_via_sms == undefined ? null : req?.body?.notify_via_sms;
            const plannedProcedures = req?.body?.planned_procedures == undefined ? null : req?.body?.planned_procedures;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const notes = req?.body?.notes == undefined ? null : req?.body?.notes;
            const appDate = new Date(appointmentDate);
            const currentDate = new Date();
            if (currentDate <= appDate) {
                const getAppointmentSettingsQuery = `SELECT * FROM sc_${tableCenterId}_pr_time_settings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND end_date >= '${appointmentDate}'::date AND start_date <= '${appointmentDate}'::date AND un_available = false AND temporarily_unavailable = false `;
                const getAppointmentSettings = await vaasPgQuery(getAppointmentSettingsQuery, [], cachingType.StandardCache);
                if (getAppointmentSettings) {
                    const appointmentSettings = getAppointmentSettings.queryResponse;
                    for (const setting of appointmentSettings) {
                        const startTime = setting.start_time;
                        const endTime = setting.end_time;
                        const startDate = setting.start_date;
                        const duration = setting.appointment_duration;
                        const splitTimes = SplitTime(startTime, endTime, duration, startDate);
                        if (splitTimes.indexOf(appointmentTime) !== -1) {
                            const isAlreadyBookedQuery = `SELECT appointment_id FROM sc_${tableCenterId}_appointments WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND appointment_date = '${appointmentDate}'::date AND appointment_time = '${appointmentTime}' `;
                            const isAlreadyBooked = await vaasPgQuery(isAlreadyBookedQuery, [], cachingType.StandardCache);
                            if (isAlreadyBooked?.queryResponse?.length > 0) {
                                res.status(200).json(
                                    {
                                        status: false,
                                        message: 'Appointment slots already booked.',
                                        data: [],
                                    },
                                );
                            } else {
                                const isBlockedQuery = `SELECT block_id FROM sc_${tableCenterId}_block_timings WHERE center_id = '${centerId}' AND provider_id = '${providerId}' AND appointment_date = '${appointmentDate}'::date AND appointment_start_time = '${appointmentTime}' AND appointment_mode = '${appointmentMode}' `;
                                const isBlocked = await vaasPgQuery(isBlockedQuery, [], cachingType.StandardCache);
                                if (isBlocked?.queryResponse?.length > 0) {
                                    res.status(200).json(
                                        {
                                            status: false,
                                            message: 'Appointment slots already blocked.',
                                            data: [],
                                        },
                                    );
                                } else {
                                    const insertQuery = `INSERT INTO sc_${tableCenterId}_appointments ( 
                                provider_id,
                                center_id, 
                                appointment_id, 
                                consumer_id,
                                appointment_mode,  
                                appointment_date,
                                appointment_time,
                                appointment_duration,
                                notify_via_whatsapp,
                                notify_via_sms,
                                planned_procedures,
                                notes,
                                created_by,
                                status ) 
                    VALUES ( '${providerId}',
                             '${centerId}',
                             '${appointmentId}',
                             '${consumerId}',
                             '${appointmentMode}',
                             '${appointmentDate}',
                             '${appointmentTime}',
                             '${appointmentDuration}',
                             '${whatsappNotification}',
                             '${smsNotification}',
                             '${plannedProcedures}',
                             '${notes}',
                             '${createdBy}',
                             '${status}' )`;
                                    vaasPgQuery(insertQuery, [], cachingType.NoCache)
                                    res.status(200).json(
                                        {
                                            status: true,
                                            message: 'Your appointment booked successfully',
                                            data: [],
                                        },
                                    );
                                }
                            }
                        } else {
                            res.status(200).json(
                                {
                                    status: false,
                                    message: 'The appointment slot you requested is not open.',
                                    data: [],
                                },
                            );
                        }
                    }
                } else {
                    res.status(200).json(
                        {
                            status: false,
                            message: 'Appointment slots are not available for this date',
                            data: [],
                        },
                    );
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'The appointments can be booked only for future dates or today.',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please Register under a Clinic',
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

function SplitTime(StartTime: any, EndTime: any, Duration: any, StartDate: any) {
    let startTime = StartTime;
    const endTime = EndTime;
    const timeSlots = [startTime];
    while (startTime <= endTime) {
        startTime = addMinutes(startTime, Duration, StartDate);
        timeSlots.push(startTime);
    }
    return timeSlots;
}

function addMinutes(time: any, minutes: any, StartDate: any) {
    const date = new Date(new Date(`'2022-12-01'` + time).getTime() + minutes * 60000); // Here we use just a sample date for constructing date.
    const tempTime = ((date.getHours().toString().length == 1) ? '0' + date.getHours() : date.getHours()) + ':' +
        ((date.getMinutes().toString().length == 1) ? '0' + date.getMinutes() : date.getMinutes());
    return tempTime;
}

export async function addAppointmentDbTransaction(centerId: any, tableCenterId: any, providerId: any, appointmentId: string, consumerId: any, appointmentMode: any, appointmentDate: any, appointmentTime: any, appointmentDuration: any, whatsappNotification: any, smsNotification: any, plannedProcedures: any, notes: any, createdBy: any, status: any) {
    try {
        return new Promise((resolve, reject) => {
            if (centerId != null) {
                const insertQuery = `INSERT INTO sc_${tableCenterId}_appointments ( 
                                                        provider_id,
                                                        center_id, 
                                                        appointment_id, 
                                                        consumer_id,
                                                        appointment_mode,  
                                                        appointment_date,
                                                        appointment_time,
                                                        appointment_duration,
                                                        notify_via_whatsapp,
                                                        notify_via_sms,
                                                        planned_procedures,
                                                        notes,
                                                        created_by,
                                                        status ) 
                                            VALUES ( '${providerId}',
                                                     '${centerId}',
                                                     '${appointmentId}',
                                                     '${consumerId}',
                                                     '${appointmentMode}',
                                                     '${appointmentDate}',
                                                     '${appointmentTime}',
                                                     '${appointmentDuration}',
                                                     '${whatsappNotification}',
                                                     '${smsNotification}',
                                                     '${plannedProcedures}',
                                                     '${notes}',
                                                     '${createdBy}',
                                                     '${status}' )`;
                vaasPgQuery(insertQuery, [], cachingType.NoCache).then((result: any) => {
                    if (result) {
                        resolve({ status: true, "message": "Appointment Created successfully", data: { "appointmentData": result } });
                    } else {
                        reject({ status: false, "message": "Appointment Creation failed", data: {} });
                    }
                })
            } else {
                reject({ status: false, "message": "Your clinic is not registered", data: {} });
            }

        });
    } catch (err) {
        return err;

    }
}

export async function searchPatient(req: any, res: any) {
    try {
        if (req?.params?.searchKey) {
            const getQuery = `SELECT  scs.name, scs.mobile, scs.email, scs.consumer_id, pts.consumer_id, patient_id, pts.gender, pts.dob 
                 FROM service_consumers as scs
                 LEFT JOIN patients as pts ON pts.consumer_id = scs.consumer_id 
                 WHERE scs.mobile ='${req?.params?.searchKey}' OR scs.name ='${req?.params?.searchKey}' OR pts.patient_id ='${req?.params?.searchKey}'`;
            const patientData = await vaasPgQuery(getQuery, [], cachingType.StandardCache);
            if (patientData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Patient Data Listed Successfully",
                    data: patientData.queryResponse,
                });
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'patient is not registered',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please enter Name or Mobile or Patient id',
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

export async function addAppointmentReminder(req: any, res: any) {
    try {
        const reminderId = uuidv4();
        const providerId = req[`serviceProviderData`][`provider_id`];
        const centerId = req[`serviceProviderData`][`default_clinic`];
        const reminderTitle = req?.body?.reminder_title == undefined ? null : req?.body?.reminder_title;
        const doctor = req?.body?.doctor == undefined ? null : req?.body?.doctor;
        const durationType = req?.body?.duration_type == undefined ? null : req?.body?.duration_type;
        const scheduledDate = req?.body?.scheduled_date == undefined ? null : req?.body?.scheduled_date;
        const scheduledTime = req?.body?.scheduled_time == undefined ? null : req?.body?.scheduled_time;
        if (durationType == 'allday') {
            const insertQuery = `INSERT INTO appointment_reminders (reminder_id, provider_id, center_id, reminder_title, doctor, duration_type, scheduled_date ) 
                    VALUES ('${reminderId}','${providerId}','${centerId}','${reminderTitle}' ,'${doctor}' ,'${durationType}','${scheduledDate}')`;
            const allDayReminder = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
            if (allDayReminder) {
                return res.status(200).json({
                    status: true,
                    message: "Reminder Created Successfully",
                    data: [],
                });
            }
        } else if (durationType == 'custom') {
            const insertQuery = `INSERT INTO appointment_reminders (reminder_id, provider_id, center_id, reminder_title, doctor, duration_type, scheduled_date, scheduled_time )
                     VALUES ('${reminderId}','${providerId}','${centerId}','${reminderTitle}' ,'${doctor}' ,'${durationType}','${scheduledDate}', '${scheduledTime}' )`;
            const customReminder = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
            if (customReminder) {
                return res.status(200).json({
                    status: true,
                    message: "Reminder Created Successfully",
                    data: [],
                });
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Please select duration type',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'duration type does not exist',
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

export async function blockAppointment(req: any, res: any) {
    try {
        const userType = req[`serviceProviderData`][`user_type`];
        let providerId = req[`serviceProviderData`][`provider_id`];
        const createdBy = req[`serviceProviderData`][`provider_id`];
        if (userType == 'admin') {
            providerId = req?.body?.provider_id == undefined ? null : req?.body?.provider_id;
        }
        const blockId = uuidv4();
        const centerId = req[`serviceProviderData`][`default_clinic`];
        const tableCenterId = centerId.replace(/-/g, "_");
        const appointmentMode = req?.body?.appointment_mode == undefined ? null : req?.body?.appointment_mode;
        const reminderTitle = req?.body?.notes == undefined ? null : req?.body?.notes;
        const durationType = req?.body?.duration_type == undefined ? null : req?.body?.duration_type;
        const appointmentDate = req?.body?.appointment_date == undefined ? null : req?.body?.appointment_date;
        const appointmentStartTime = req?.body?.appointment_start_time == undefined ? null : req?.body?.appointment_start_time;
        const appointmentEndTime = req?.body?.appointment_end_time == undefined ? null : req?.body?.appointment_end_time;
        if (durationType == 'allday') {
            const insertQuery = `INSERT INTO sc_${tableCenterId}_block_timings ( block_id, provider_id, center_id, created_by, notes, appointment_date, appointment_mode ) 
                    VALUES ('${blockId}','${providerId}','${centerId}', '${createdBy}','${reminderTitle}' ,'${appointmentDate}','${appointmentMode}')`;
            const allDayReminder = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
            if (allDayReminder) {
                return res.status(200).json({
                    status: true,
                    message: "Appointment blocked Successfully for selected date",
                    data: [],
                });
            }
        } else if (durationType == 'custom') {
            const insertQuery = `INSERT INTO sc_${tableCenterId}_block_timings ( block_id, provider_id, center_id, created_by, notes, appointment_date, appointment_mode, appointment_start_time, appointment_end_time ) 
            VALUES ('${blockId}','${providerId}','${centerId}', '${createdBy}','${reminderTitle}' ,'${appointmentDate}','${appointmentMode}' ,'${appointmentStartTime}' ,'${appointmentEndTime}')`;
            const customReminder = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
            if (customReminder) {
                return res.status(200).json({
                    status: true,
                    message: "Appointment blocked Successfully for selected date and time",
                    data: [],
                });
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Please select duration type',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'duration type does not exist',
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

export async function appointmentList(req: any, res: any) {
    try {
        const centerId = req[`serviceProviderData`][`default_clinic`];
        if (centerId !== undefined) {
            const tableCenterId = centerId.replace(/-/g, "_");
            const getQuery = `SELECT * FROM sc_${tableCenterId}_appointments WHERE center_id = '${centerId}'`;
            const appointmentData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (appointmentData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Appointment Data Listed Successfully",
                    data: appointmentData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'does not have any default clinic, please register under a clinic',
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

export async function getAppointmentById(req: any, res: any) {
    try {
        if (req?.params?.appointment_id) {
            const centerId = req[`serviceProviderData`][`default_clinic`];
            const tableCenterId = centerId.replace(/-/g, "_");
            const getQuery = `SELECT * FROM sc_${tableCenterId}_appointments WHERE appointment_id = '${req?.params?.appointment_id}'`;
            const appointmentData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (appointmentData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Appointment Data Listed Successfully",
                    data: appointmentData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please enter valid appointment Id',
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

export async function listAppointmentStatus(req: any, res: any) {
    try {
        if (req?.params?.provider_id) {
            const centerId = req[`serviceProviderData`][`default_clinic`];
            const tableCenterId = centerId.replace(/-/g, "_");
            const allData = `select count(*) as all_appointments,
            count(case when status = 'scheduled' then status else null end) as scheduled_appointments,
            count(case when status = 'cancelled' then status else null end) as cancelled_appointments,
            count(case when status = 'active' then status else null end) as active_appointments,
            count(case when status = 'completed' then status else null end) as completed_appointments,
            count(case when status = 'waiting' then status else null end) as waiting_appointments
            from sc_${tableCenterId}_appointments
            where provider_id = '${req?.params?.provider_id}'`;
            const appointmentData = await vaasPgQuery(allData, [], cachingType.StandardCache)
            if (appointmentData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Appointment Data Listed Successfully",
                    data: appointmentData.queryResponse,
                });
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'no appointments to list',
                        error: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Please enter provider id',
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

async function listDoctorCounts(userType: string, tableCenterId: string, centerId: string, startDate: Date, endDate: Date) {
    if (userType == 'admin') {
        const allCount = `select count(*) as all_doctors
            from sc_${tableCenterId}_providers
            where center_id = '${centerId}'`;
        return await (await vaasPgQuery(allCount, [], cachingType.StandardCache)).queryResponse
    }
}
async function doctorAppointmentCountOnToday(userType: string, providerId: string, tableCenterId: string, startDate: string, endDate: string, status: string) {
    if (userType == 'doctor') {
        const appointmentData = `SELECT count(case when provider_id = '${providerId}' then status else null end) as appointments
            from sc_${tableCenterId}_appointments
            where provider_id = '${providerId}' AND appointment_date  
            BETWEEN '${startDate}' AND '${endDate}' ;`;
        return await (await vaasPgQuery(appointmentData, [], cachingType.StandardCache)).queryResponse
    } else if (userType == 'admin') {
        let appointmentCount;
        if (status == "All") {
            appointmentCount = `select aps.provider_id,aps.appointment_time,sc.name,sc.consumer_id,pts.age,pts.gender,count(*) FROM  sc_${tableCenterId}_appointments
        as aps inner join doctors as drs on aps.provider_id = drs.provider_id 
        LEFT JOIN service_consumers as sc on aps.consumer_id = sc.consumer_id
        left join patients as pts on aps.consumer_id = pts.consumer_id
        where appointment_date  
        BETWEEN '${startDate}' AND '${endDate}'  group by aps.provider_id,sc.name,sc.consumer_id,aps.appointment_time,pts.age,pts.gender
       `;
        } else {
            appointmentCount = `select aps.provider_id,aps.appointment_time,sc.name,sc.consumer_id,pts.age,pts.gender,count(*) FROM  sc_${tableCenterId}_appointments
        as aps inner join doctors as drs on aps.provider_id = drs.provider_id 
        LEFT JOIN service_consumers as sc on aps.consumer_id = sc.consumer_id
        left join patients as pts on aps.consumer_id = pts.consumer_id
        where appointment_date  
        BETWEEN '${startDate}' AND '${endDate}' AND aps.status ='${status}' group by aps.provider_id,sc.name,sc.consumer_id,aps.appointment_time,pts.age,pts.gender
       `;
        }
        return await (await vaasPgQuery(appointmentCount, [], cachingType.StandardCache)).queryResponse
    }
}

export async function getCalendar(req: any, res: any) {
    try {
        const serviceProviderData = req[`serviceProviderData`];
        const centerId = serviceProviderData?.default_clinic;
        const tableCenterId = centerId?.replace(/-/g, "_");
        const userType = serviceProviderData?.user_type;
        const providerId = serviceProviderData?.provider_id;
        const startDate = req?.params?.start_date;
        const endDate = req?.params?.end_date;
        const status = req?.params?.status;
        if (serviceProviderData && centerId && tableCenterId && userType && providerId) {
            if (moment(startDate, "YYYY-MM-DD", true).isValid() && moment(endDate, "YYYY-MM-DD", true).isValid()) {
                const appointmentDetails = doctorAppointmentCountOnToday(userType, providerId, tableCenterId, startDate, endDate, status);
                Promise.all([appointmentDetails]).then(values => {
                    const data = values[0];

                    if (data.appointment_details.length != 0) {
                        return res.status(200).json({
                            status: true,
                            message: "All Details Listed Successfully.",
                            data: data,
                        });
                    } else {
                        return res.status(200).json({
                            status: true,
                            message: "No data available.",
                            data: [],
                        });

                    }
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: "Enter date in correct format.",
                    data: [],
                });
            }
        } else {
            res.status(404).json(
                {
                    status: false,
                    message: 'Something went wrong, please verify that you have a default clinic',
                    data: {}
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
async function doctorAppointmentMobileCountOnToday(userType: string, providerId: string, tableCenterId: string, startDate: string, endDate: string, status: string) {
    try {
        if (userType == 'doctor') {
            const appointmentData = `SELECT count(case when provider_id = '${providerId}' then status else null end) as appointments
            from sc_${tableCenterId}_appointments
            where provider_id = '${providerId}' AND appointment_date  
            BETWEEN '${startDate}' AND '${endDate}' ;`;
            return await (await vaasPgQuery(appointmentData, [], cachingType.StandardCache)).queryResponse
        } else if (userType == 'admin') {
            let appointmentCount;
            if (status == "All") {
                appointmentCount = `SELECT aps.status,aps.appointment_id,aps.appointment_mode,aps.center_id,aps.notify_via_whatsapp,aps.notify_via_sms,aps.appointment_date,aps.appointment_time,aps.appointment_duration,cs.profile_picture,cs.name,cs.mobile,pts.gender,pts.dob from sc_${tableCenterId}_appointments as aps Left join 
                 service_consumers as cs on aps.consumer_id = cs.consumer_id left join patients as pts on aps.consumer_id = pts.consumer_id where aps.appointment_date between '${startDate}' AND '${endDate}'`;
            } else {
                appointmentCount = `SELECT
                 aps.status,aps.appointment_id,aps.appointment_mode,aps.center_id,aps.notify_via_whatsapp,aps.notify_via_sms,aps.appointment_date,aps.appointment_time,aps.appointment_duration,cs.profile_picture,cs.name,cs.mobile,pts.gender,pts.dob
                 from sc_${tableCenterId}_appointments as aps Left join 
                 service_consumers as cs on aps.consumer_id = cs.consumer_id left join patients as pts on aps.consumer_id = pts.consumer_id where aps.appointment_date between '${startDate}' AND '${endDate}' AND aps.status ='${status}'`;
            }
            return await (await vaasPgQuery(appointmentCount, [], cachingType.StandardCache)).queryResponse
        }
    } catch (err) {
        return err;
    }
}
export async function getCalendarMobile(req: any, res: any) {
    try {
        const serviceProviderData = req[`serviceProviderData`];
        const centerId = serviceProviderData?.default_clinic;
        const tableCenterId = centerId?.replace(/-/g, "_");
        const userType = serviceProviderData?.user_type;
        const providerId = serviceProviderData?.provider_id;
        const startDate = req?.params?.start_date;
        const endDate = req?.params?.end_date;
        const status = req?.params?.status;
        if (serviceProviderData && centerId && tableCenterId && userType && providerId && status) {
            if (moment(startDate, "YYYY-MM-DD", true).isValid() && moment(endDate, "YYYY-MM-DD", true).isValid()) {
                const appointmentDetails = doctorAppointmentMobileCountOnToday(userType, providerId, tableCenterId, startDate, endDate, status);
                Promise.all([appointmentDetails]).then(values => {
                    const data = values[0].map((value: any) => { return { ...value, token: 135, Amount: "paid" } });
                    if (data.length != 0) {
                        return res.status(200).json({
                            status: true,
                            message: "All Details Listed Successfully.",
                            data: data,
                        });
                    } else {
                        return res.status(200).json({
                            status: true,
                            message: "Not data available.",
                            data: [],
                        })
                    }
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: "Enter correct format.",
                    data: [],
                })
            }
        }
        else {
            res.status(404).json(
                {
                    status: false,
                    message: 'Something went wrong, please verify that you have a default clinic',
                    data: {}
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


async function listAppointmentCounts(centerId: string, providerId: string, userType: string) {

    const tableCenterId = centerId.replace(/-/g, "_");
    if (userType == 'admin') {
        const allAppointmentData = `select aps.provider_id,aps.appointment_time,aps.appointment_date, drs.specialization,
        count(case when aps.status = 'scheduled' then aps.status else null end)as scheduled_appointments,
        count(case when aps.status = 'waiting' then aps.status else null end)as pending_appointments,
        count(case when aps.status = 'completed' then aps.status else null end)as completed_appointments
        FROM  sc_${tableCenterId}_appointments
    as aps inner join doctors as drs on aps.provider_id = drs.provider_id 
    group by aps.provider_id, drs.specialization, aps.appointment_time, aps.appointment_date`;
        const dbResponse = await (await vaasPgQuery(allAppointmentData, [], cachingType.StandardCache)).queryResponse;
        return dbResponse?.map((response: any) => {
            let name = "Dr. ";
            if (response.first_name && response.first_name != null && response.first_name.length > 0) {
                name += response.first_name + " ";
            }
            if (response.last_name && response.last_name != null && response.last_name.length > 0) {
                name += response.last_name;
            }
            //todo: when we change degree and specialization follow null check. @midhun
            return { ...response, name, 'degree': 'MBBS, MD', 'specialization': "General Physicians, Gynecologist" }
        });
    } else {
        const allAppointmentData = `select aps.provider_id,aps.appointment_time,aps.appointment_date,
            count(case when aps.status = 'scheduled' then aps.status else null end)as scheduled_appointments,
            count(case when aps.status = 'waiting' then aps.status else null end)as pending_appointments,
            count(case when aps.status = 'completed' then aps.status else null end)as completed_appointments
            FROM  sc_${tableCenterId}_appointments
        as aps inner join doctors as drs on aps.provider_id = drs.provider_id 
         where aps.provider_id = '${providerId}'
        group by aps.provider_id, aps.appointment_time, aps.appointment_date`;
        const dbResponse = await (await vaasPgQuery(allAppointmentData, [], cachingType.StandardCache)).queryResponse;
        return dbResponse?.map((response: any) => {
            let name = "Dr. ";
            if (response.first_name && response.first_name != null && response.first_name.length > 0) {
                name += response.first_name + " ";
            }
            if (response.last_name && response.last_name != null && response.last_name.length > 0) {
                name += response.last_name;
            }
            //todo: when we change degree and specialization follow null check. @midhun
            return { ...response, name, 'degree': 'MBBS, MD', 'specialization': "General Physicians, Gynecologist" }
        });
    }
}

async function listPatientDataMobile(centerId: string, providerId: string, userType: string) {
    const tableCenterId = centerId.replace(/-/g, "_");
    if (userType == 'admin') {
        const allPatientData = `SELECT scs.consumer_id,sc_table_s.provider_id, CONCAT  (scs.first_name, ' ', scs.last_name) AS name, scs.mobile, pts.dob FROM service_consumers as scs
        INNER JOIN sc_${tableCenterId}_consumers as sc_table_s ON sc_table_s.consumer_id = scs.consumer_id 
        LEFT JOIN patients as pts ON pts.consumer_id = sc_table_s.consumer_id`;
        return await (await vaasPgQuery(allPatientData, [], cachingType.StandardCache)).queryResponse
    } else {
        const allPatientData = `SELECT scs.consumer_id,sc_table_s.provider_id, CONCAT  (scs.first_name, ' ', scs.last_name) AS name, scs.mobile, pts.dob FROM service_consumers as scs
        INNER JOIN sc_${tableCenterId}_consumers as sc_table_s ON sc_table_s.consumer_id = scs.consumer_id 
        LEFT JOIN patients as pts ON pts.consumer_id = sc_table_s.consumer_id
        WHERE sc_table_s.provider_id = '${providerId}'`;
        return await (await vaasPgQuery(allPatientData, [], cachingType.StandardCache)).queryResponse
    }
}

export async function serviceProviderHomeScreenMobile(req: any, res: any) {
    const providerData = req[`serviceProviderData`];
    const startDate = req?.params?.startDate;
    if (startDate) {
        if (providerData) {
            const providerId = providerData?.provider_id;
            const centerId = providerData?.default_clinic;
            const userType = providerData?.user_type;
            if (providerId && userType) {
                if (centerId) {
                    const appointmentDetails = listAppointmentCounts(centerId, providerId, userType);
                    const patientDetails = listPatientDataMobile(centerId, providerId, userType);
                    Promise.all([appointmentDetails, patientDetails]).then(values => {
                        const data = {
                            "appointment_details": values[0],
                            "patient_details": values[1],
                            "my_appointments": [{ "date": "2022-05-12", "12-6": "10", "6-13": "5", "13-18": "4", "18-24": "5", "totalAppointments": "24" },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            },
                            {
                                "date": "2022-05-12",
                                "12-6": "10",
                                "6-13": "5",
                                "13-18": "4",
                                "18-24": "5",
                                "totalAppointments": "24"
                            }]
                        }
                        return res.status(200).json({
                            status: true,
                            message: "All Details Listed Successfully.",
                            data: data,
                        });
                    })
                } else {
                    return res.status(200).json({
                        status: false,
                        message: "Cannot find a default clinic for you. Please add a new clinic or join a clinic",
                        data: [],
                    });
                }
            } else {
                return res.status(200).json({
                    status: false,
                    message: "Invalid Provider data received",
                    data: [],
                });
            }
        } else {
            return res.status(200).json({
                status: false,
                message: "Invalid Provider data received",
                data: [],
            });
        }
    } else {
        return res.status(200).json({
            status: false,
            message: "Please give a valid date",
            data: [],
        });
    }
}