import {
    cachingType, vaasPgQuery
} from "../../../services/vaasdbengine";

export const appointmentDelay = async (req: any, res: any) => {
    try {
        const availableServiceCentersQuery = `SELECT center_id FROM service_centers WHERE deleted = false`;
        const availableServiceCentersExe = await vaasPgQuery(availableServiceCentersQuery, [], cachingType.NoCache);
        const availableServiceCenters = availableServiceCentersExe.queryResponse;
        for (const center of availableServiceCenters) {
            const centerId = center?.center_id
            const tableCenterId = centerId.replace(/-/g, "_");
            const todayAppointmentsQuery = `SELECT appointment_id, appointment_time, appointment_date FROM sc_${tableCenterId}_appointments WHERE appointment_date=date(NOW())`;
            const appointmentResult = await vaasPgQuery(todayAppointmentsQuery, [], cachingType.NoCache);
            const appointmentsToday = appointmentResult.queryResponse;
            const currentDate = new Date();
            const currentHour = currentDate.getHours();
            const currentMinute = currentDate.getMinutes();
            if (appointmentsToday?.length > 0) {
                for (const appointmentSlot of appointmentsToday) {
                    const appointmentTime = appointmentSlot?.appointment_time.split(":");
                    const appointmentSlotHour = appointmentTime[0];
                    const appointmentSlotMinute = appointmentTime[1];
                    let delay = false;
                    if (appointmentSlotHour > currentHour) {
                        delay = true
                    } else {
                        if (appointmentSlotMinute > currentMinute) {
                            delay = true;
                        }
                    }
                    const updateDelay = `UPDATE sc_${tableCenterId}_appointments SET delay = ${delay} WHERE appointment_id = '${appointmentSlot?.appointment_id}'`;
                    await vaasPgQuery(updateDelay, [], cachingType.NoCache);
                }
            }
        }
        res.status(200).json(
            {
                status: true,
                message: 'Delay added',
                data: []
            },
        );
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

//todo: to change the jwt sign to a single point and use an interface like this @midhun @anju
export interface ProviderJwtToken {
    userDetails: {
        firstName: string,
        lastName: string,
        countryCode: string,
        mobileNumber: string,
    },
    provider_id: string,
    default_clinic?: string,
}
