import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";


export async function listBloodGroup() {
    const getQuery = `SELECT * FROM blood_groups WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listOccupations() {
    const getQuery = `SELECT * FROM occupations WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listCountries() {
    const getQuery = `SELECT * FROM countries WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listStates() {
    const getQuery = `SELECT * FROM states WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listCities() {
    const getQuery = `SELECT * FROM cities WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listTimeZones() {
    const getQuery = `SELECT * FROM time_zones WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
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
    const bloodGroupList = listBloodGroup();
    const occupationList = listOccupations();
    const countryList = listCountries();
    const stateList = listStates();
    const cityList = listCities();
    const timeZoneList = listTimeZones();
    Promise.all([
        bloodGroupList.catch(err => {
            createError(req, err, 'blood group not found')
        }),
        occupationList.catch(err => {
            createError(req, err, 'occupation not found')
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
    ]).then(values => {
        const data = {
            "blood_groups": values[0],
            "occupations": values[1],
            "country_list": values[2],
            "state_list": values[3],
            "city_list": values[4],
            "timeZone_list": values[5]
        }
        return res.status(200).json({
            status: true,
            message: "All Details Listed Successfully.",
            data: data,
        });
    })
}

