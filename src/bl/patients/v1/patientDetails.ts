import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';
import { v4 as uuidv4 } from 'uuid';


export async function createMedications(req: any, res: any) {
    try {
        const description = req?.body?.description == undefined ? null : req?.body?.description;
        const consumer_id = req[`patientUserData`][`consumer_id`];
        if (description) {
            const query = `SELECT * FROM medications WHERE consumer_id = '${consumer_id}'`;
            const medication = await vaasPgQuery(query, [], cachingType.NoCache);
            if (medication?.queryResponse.length === 0) {
                const medication_id = uuidv4();
                const insertQuery = `INSERT INTO medications (consumer_id,medication_id,description,status) VALUES ('${consumer_id}','${medication_id}','${description}','true')`;
                const execute = await vaasPgQuery(insertQuery, [], cachingType.NoCache);
                if (execute) {
                    return res.status(200).json({
                        status: true,
                        message: "Created Successfully",
                        data: [],
                    });
                }
            } else {
                const updateQuery = `UPDATE medications
                SET  description = '${description}', updated_by = '${consumer_id}'
                WHERE consumer_id = '${consumer_id}'`;
                const Update = await vaasPgQuery(updateQuery, [], cachingType.NoCache);
                if (Update) {
                    return res.status(200).json({
                        status: true,
                        message: "Updated Successfully",
                        data: [],
                    });
                }
            }
        } else {
            res.status(200).json({
                status: false,
                message: "description required!",
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

export async function addAllergy(req: any, res: any) {
    try {
        const allergy =
            req?.body?.allergy == undefined ? null : req?.body?.allergy;
        const consumer_id = req[`patientUserData`][`consumer_id`];
        if (req?.body?.allergy) {
            const deleteData = `DELETE FROM consumer_allergies WHERE consumer_id IN ('${consumer_id}')`;
            const data = await vaasPgQuery(deleteData, [], cachingType.NoCache);
            for (let i = 0; i < allergy.length; i++) {
                if (req?.body?.allergy[i]) {
                    const updatePivot = `INSERT INTO consumer_allergies (allergic_id,consumer_id) VALUES ('${req?.body?.allergy[i]}','${consumer_id}')`;
                    const update = await vaasPgQuery(
                        updatePivot,
                        [],
                        cachingType.NoCache
                    );
                }
                else {
                    return res.status(200).json({
                        status: false,
                        message: "something went wrong!",
                        data: [],
                    });
                }
            }
            return res.status(200).json({
                status: true,
                message: "Updated Successfully",
                data: [],
            });
        } else {
            return res.status(200).json({
                status: false,
                message: "Allergy required!",
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

export async function addSurgery(req: any, res: any) {
    try {
        const surgery =
            req?.body?.surgery == undefined ? null : req?.body?.surgery;
        const consumer_id = req[`patientUserData`][`consumer_id`];
        if (req?.body?.surgery) {
            const deleteData = `DELETE FROM consumer_surgeries WHERE consumer_id IN ('${consumer_id}')`;
            const data = await vaasPgQuery(deleteData, [], cachingType.NoCache);
            for (let i = 0; i < surgery.length; i++) {
                if (req?.body?.surgery[i]) {
                    const updatePivot = `INSERT INTO consumer_surgeries (surgery_id,consumer_id) VALUES ('${req?.body?.surgery[i]}','${consumer_id}')`;
                    const update = await vaasPgQuery(
                        updatePivot,
                        [],
                        cachingType.NoCache
                    );
                }
                else {
                    return res.status(200).json({
                        status: false,
                        message: "something went wrong!",
                        data: [],
                    });
                }
            }
            res.status(200).json(
                {
                    status: true,
                    message: 'Updated successfully',
                    data: [],
                },
            );
        } else {
            return res.status(200).json({
                status: false,
                message: "Surgery required!",
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

export async function createhabit(req: any, res: any) {
    try {
        const exercise = req?.body?.exercise == undefined ? null : req?.body?.exercise;
        const food = req?.body?.food == undefined ? null : req?.body?.food;
        const smoking = req?.body?.smoking == undefined ? null : req?.body?.smoking;
        const alcohol = req?.body?.alcohol == undefined ? null : req?.body?.alcohol;
        const consumer_id = req[`patientUserData`][`consumer_id`];
        if (exercise && food && smoking && alcohol) {
            const query = `SELECT * FROM habits WHERE consumer_id = '${consumer_id}'`;
            const habit = await vaasPgQuery(query, [], cachingType.NoCache);
            if (habit?.queryResponse.length === 0) {
                const habit_id = uuidv4();
                const insertQuery = `INSERT INTO habits (consumer_id,habit_id,exercise,food,smoking,alcohal,status) VALUES ('${consumer_id}','${habit_id}','${exercise}','${food}','${smoking}','${alcohol}','true')`;
                const execute = await vaasPgQuery(insertQuery, [], cachingType.NoCache);
                if (execute) {
                    return res.status(200).json({
                        status: true,
                        message: "Created Successfully",
                        data: [],
                    });
                }
            } else {
                const updateQuery = `UPDATE habits
                SET  exercise = '${exercise}',food = '${food}',smoking = '${smoking}',alcohal = '${alcohol}', updated_by = '${consumer_id}'
                WHERE consumer_id = '${consumer_id}'`;
                const Update = await vaasPgQuery(updateQuery, [], cachingType.NoCache);
                if (Update) {
                    return res.status(200).json({
                        status: true,
                        message: "Updated Successfully",
                        data: [],
                    });
                }
            }
        } else {
            res.status(200).json({
                status: false,
                message: "description required!",
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
