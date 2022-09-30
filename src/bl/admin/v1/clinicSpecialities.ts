import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export async function addClinicSpeciality(req: any, res: any) {
    try {
        if (req?.body?.clinic_speciality) {
            const Result = await vaasPgQuery(`SELECT * FROM clinic_specialities WHERE clinic_speciality = '${req?.body?.clinic_speciality}'`, [], cachingType.StandardCache)
            if (Result?.queryResponse.length === 0) {
                const adminData = req[`adminData`]
                const clinicSpecialityId = uuidv4();
                const adminID = adminData?.admin_id;
                const clinicSpeciality = req?.body?.clinic_speciality == undefined ? null : req?.body?.clinic_speciality;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO clinic_specialities (clinic_speciality_id, clinic_speciality, status, created_by, updated_by) VALUES ('${clinicSpecialityId}','${clinicSpeciality}', '${status}', '${adminID}' ,'${adminID}')`;
                const executeClinicSpeciality = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeClinicSpeciality) {
                    return res.status(200).json({
                        status: true,
                        message: "Clinic Speciality Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Clinic Speciality Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Clinic Speciality  field is mandatory',
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

export async function listClinicSpeciality(req: any, res: any) {
    try {
        const getQuery = `SELECT * FROM clinic_specialities WHERE deleted_at is NULL`;
        const Data = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (Data.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Specialization Data Listed Successfully",
                data: Data.queryResponse,
            });
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'clinic speciality not found',
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

export async function updateClinicSpeciality(req: any, res: any) {
    try {
        if (req?.params?.clinic_speciality_id) {
            const adminData = req[`adminData`]
            const adminID = adminData?.admin_id;
            const clinicSpeciality = req?.body?.clinic_speciality == undefined ? null : req?.body?.clinic_speciality;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE clinic_specialities
        SET  clinic_speciality = '${clinicSpeciality}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE clinic_speciality_id = '${req?.params?.clinic_speciality_id}'`;
            const Update = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (Update) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Speciality Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Clinic Speciality not exist',
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

export async function getClinicSpecialityById(req: any, res: any) {
    try {
        if (req?.params?.clinic_speciality_id) {
            const getQuery = `SELECT * FROM clinic_specialities WHERE clinic_speciality_id ='${req?.params?.clinic_speciality_id}'`;
            const clinicSpecialityData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (clinicSpecialityData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Speciality Data Listed Successfully",
                    data: clinicSpecialityData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Clinic Speciality not exist',
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

export async function deleteClinicSpeciality(req: any, res: any) {
    try {
        if (req?.params?.clinic_speciality_id) {
            const adminData = req[`adminData`]
            const adminID = adminData?.admin_id;
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE clinic_specialities
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE clinic_speciality_id = '${req?.params?.clinic_speciality_id}'`;
            const specialityDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (specialityDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Clinic Speciality Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Clinic Speciality not exist',
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