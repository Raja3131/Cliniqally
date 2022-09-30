
import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';
// Specialization 
export async function addSpecialization(req: any, res: any) {
    try {
        if (req?.body?.specialization) {
            const specializationResult = await vaasPgQuery(`SELECT specialization_id FROM specializations WHERE specialization = '${req?.body?.specialization}'`, [], cachingType.StandardCache)
            if (specializationResult?.queryResponse.length === 0) {
                const specialization_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const specialization = req?.body?.specialization == undefined ? null : req?.body?.specialization;
                const insertQuery = `INSERT INTO specializations (specialization_id, specialization, created_by, updated_by) VALUES ('${specialization_id}','${specialization}','${adminID}' ,'${adminID}')`;
                const executeSpecialization = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeSpecialization) {
                    return res.status(200).json({
                        status: true,
                        message: "Specialization Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Specialization Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Specialization  field is mandatory',
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

export async function listSpecialization(req: any, res: any) {
    try {
        const getQuery = `SELECT specialization_id, specialization  FROM specializations WHERE deleted_at is NULL`;
        const specializationData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (specializationData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Specialization Data Listed Successfully",
                data: specializationData.queryResponse,
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

export async function updateSpecialization(req: any, res: any) {
    try {
        if (req?.params?.specialization_id) {
            const adminID = req[`adminData`][`admin_id`];
            const specialization = req?.body?.specialization == undefined ? null : req?.body?.specialization;
            const updateQuery = `UPDATE specializations
        SET  specialization = '${specialization}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE specialization_id = '${req?.params?.specialization_id}'`;
            const specializationUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (specializationUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Specialization Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Specialization not exist',
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

export async function getSpecializationById(req: any, res: any) {
    try {
        if (req?.params?.specialization_id) {
            const getQuery = `SELECT specialization_id, specialization FROM specializations WHERE specialization_id ='${req?.params?.specialization_id}'`;
            const specializationData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (specializationData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Specialization Data Listed Successfully",
                    data: specializationData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Specialization not exist',
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

export async function deleteSpecialization(req: any, res: any) {
    try {
        if (req?.params?.specialization_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE specializations
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE specialization_id = '${req?.params?.specialization_id}'`;
            const specializationDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (specializationDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Specialization Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Specialization not exist',
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

// Registration Council 
export async function addRegistrationCouncil(req: any, res: any) {
    try {
        if (req?.body?.registration_council_name) {
            const registrationCouncilResult = await vaasPgQuery(`SELECT * FROM registration_councils WHERE registration_council_name = '${req?.body?.registration_council_name}'`, [], cachingType.StandardCache)
            if (registrationCouncilResult?.queryResponse.length === 0) {
                const registration_council_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const registration_council_name = req?.body?.registration_council_name == undefined ? null : req?.body?.registration_council_name;
                const insertQuery = `INSERT INTO registration_councils (registration_council_id, registration_council_name, created_by, updated_by) VALUES ('${registration_council_id}','${registration_council_name}','${adminID}' ,'${adminID}')`;
                const executeRegistration = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeRegistration) {
                    return res.status(200).json({
                        status: true,
                        message: "Registration Council Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Registration Council Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Registration Council Name field is mandatory',
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

export async function listRegistrationCouncil(req: any, res: any) {
    try {
        const getQuery = `SELECT * FROM registration_councils WHERE deleted_at is NULL`;
        const councilData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (councilData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Registration Council Data Listed Successfully",
                data: councilData.queryResponse,
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

export async function updateRegistrationCouncil(req: any, res: any) {
    try {
        if (req?.params?.registration_council_id) {
            const adminID = req[`adminData`][`admin_id`];
            const registration_council_name = req?.body?.registration_council_name == undefined ? null : req?.body?.registration_council_name;
            const updateQuery = `UPDATE registration_councils
        SET  registration_council_name = '${registration_council_name}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE registration_council_id = '${req?.params?.registration_council_id}'`;
            const councilUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (councilUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Registration Council  Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Registration Council  not exist',
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

export async function getRegistrationCouncilById(req: any, res: any) {
    try {
        if (req?.params?.registration_council_id) {
            const getQuery = `SELECT * FROM registration_councils WHERE registration_council_id ='${req?.params?.registration_council_id}'`;
            const councilData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (councilData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Registration Council  Data Listed Successfully",
                    data: councilData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Registration Council  not exist',
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

export async function deleteRegistrationCouncil(req: any, res: any) {
    try {
        if (req?.params?.registration_council_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE registration_councils
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE registration_council_id = '${req?.params?.registration_council_id}'`;
            const councilDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (councilDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Registration Council Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Registration Council not exist',
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

// degree 
export async function addDegree(req: any, res: any) {
    try {
        if (req?.body?.degree) {
            const degreeResult = await vaasPgQuery(`SELECT * FROM degree WHERE degree = '${req?.body?.degree}'`, [], cachingType.StandardCache)
            if (degreeResult?.queryResponse.length === 0) {
                const degree_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const degree = req?.body?.degree == undefined ? null : req?.body?.degree;
                const insertQuery = `INSERT INTO degree (degree_id, degree, created_by, updated_by) VALUES ('${degree_id}','${degree}','${adminID}' ,'${adminID}')`;
                const executeDegree = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeDegree) {
                    return res.status(200).json({
                        status: true,
                        message: "Degree Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Degree Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Degree  field is mandatory',
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

export async function listDegree(req: any, res: any) {
    try {
        const getQuery = `SELECT * FROM degree WHERE deleted_at is NULL`;
        const degreeData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (degreeData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Degree Data Listed Successfully",
                data: degreeData.queryResponse,
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

export async function updateDegree(req: any, res: any) {
    try {
        if (req?.params?.degree_id) {
            const adminID = req[`adminData`][`admin_id`];
            const degree = req?.body?.degree == undefined ? null : req?.body?.degree;
            const updateQuery = `UPDATE degree
        SET  degree = '${degree}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE degree_id = '${req?.params?.degree_id}'`;
            const degreeUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (degreeUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Degree Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Degree not exist',
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

export async function getDegreeById(req: any, res: any) {
    try {
        if (req?.params?.degree_id) {
            const getQuery = `SELECT * FROM DEGREE WHERE degree_id ='${req?.params?.degree_id}'`;
            const degreeData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (degreeData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "degree Data Listed Successfully",
                    data: degreeData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'degree not exist',
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

export async function deleteDegree(req: any, res: any) {
    try {
        if (req?.params?.degree_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE degree
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE degree_id = '${req?.params?.degree_id}'`;
            const degreeDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (degreeDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Degree Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Degree not exist',
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
// Sub Specializations
export async function addSubSpecialization(req: any, res: any) {
    try {
        if (req?.body?.sub_specialization) {
            const subSpecializationGetQuery = `SELECT sub_specialization_id FROM sub_specializations WHERE sub_specialization = '${req?.body?.sub_specialization}' AND deleted_at = null`;
            const subSpecializationResult = await vaasPgQuery(subSpecializationGetQuery, [], cachingType.StandardCache)
            if (subSpecializationResult?.queryResponse.length === 0) {
                const sub_specialization_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const specialization = req?.body?.specialization == undefined ? null : req?.body?.specialization; // Here gets specialization uuid from specialization tables.
                const sub_specialization = req?.body?.sub_specialization == undefined ? null : req?.body?.sub_specialization;
                const insertQuery = `INSERT INTO sub_specializations (sub_specialization_id, sub_specialization, specialization_id,  created_by, updated_by) VALUES ('${sub_specialization_id}','${sub_specialization}','${specialization}','${adminID}' ,'${adminID}')`;
                const executeSubSpecialization = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeSubSpecialization) {
                    return res.status(200).json({
                        status: true,
                        message: "Sub Specialization Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Sub Specialization Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Sub Specialization  field is mandatory',
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

export async function listSubSpecialization(req: any, res: any) {
    try {
        const getQuery = `SELECT sub_specialization_id, sub_specialization, specialization_id FROM sub_specializations WHERE deleted_at is NULL`;
        const subSpecializationData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (subSpecializationData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Sub Specialization Data Listed Successfully",
                data: subSpecializationData.queryResponse,
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

export async function updateSubSpecialization(req: any, res: any) {
    try {
        if (req?.params?.sub_specialization_id) {
            const adminID = req[`adminData`][`admin_id`];
            const sub_specialization = req?.body?.sub_specialization == undefined ? null : req?.body?.sub_specialization;
            const specialization = req?.body?.specialization == undefined ? null : req?.body?.specialization;
            const updateQuery = `UPDATE sub_specializations
        SET  sub_specialization = '${sub_specialization}', specialization_id = '${specialization}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE sub_specialization_id = '${req?.params?.sub_specialization_id}'`;
            const subSpecializationUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (subSpecializationUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Sub Specialization Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Sub Specialization not exist',
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

export async function getSubSpecializationById(req: any, res: any) {
    try {
        if (req?.params?.sub_specialization_id) {
            const getQuery = `SELECT sub_specialization_id, sub_specialization, specialization_id FROM sub_specializations WHERE sub_specialization_id ='${req?.params?.sub_specialization_id}'`;
            const subSpecializationData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (subSpecializationData.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Sub Specialization Data Listed Successfully",
                    data: subSpecializationData.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Specialization not exist',
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

export async function deleteSubSpecialization(req: any, res: any) {
    try {
        if (req?.params?.sub_specialization_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE sub_specializations
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE sub_specialization_id = '${req?.params?.sub_specialization_id}'`;
            const subSpecializationDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (subSpecializationDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Sub Specialization Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Sub Specialization not exist',
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