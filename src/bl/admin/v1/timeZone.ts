import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';


export async function addTimeZone(req: any, res: any) {
    try {
        if (req?.body?.time_zone) {
            const Result = await vaasPgQuery(`SELECT * FROM time_zones WHERE time_zone = '${req?.body?.time_zone}'`, [], cachingType.StandardCache)
            if (Result?.queryResponse.length === 0) {
                const time_zone_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const time_zone = req?.body?.time_zone == undefined ? null : req?.body?.time_zone;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO time_zones (time_zone_id, time_zone, status, created_by, updated_by) VALUES ('${time_zone_id}','${time_zone}','${status}','${adminID}' ,'${adminID}')`;
                const execute = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (execute) {
                    return res.status(200).json({
                        status: true,
                        message: "Time Zone Added Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Time Zone Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Time Zone  field is mandatory',
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

export async function getTimeZone(req: any, res: any) {
    try {
        const getQuery = `SELECT * FROM time_zones WHERE deleted_at is NULL `;
        const data = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (data.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Time Zone Data Listed Successfully",
                data: data.queryResponse,
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