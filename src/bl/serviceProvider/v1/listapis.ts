import { cachingType, vaasPgQuery } from "../../../services/vaasdbengine";


export async function listSpecialization() {
    const getQuery = `SELECT * FROM specializations WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listSubSpecialization() {
    const getQuery = `SELECT * FROM sub_specializations WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listRegistrationCouncil() {
    const getQuery = `SELECT * FROM registration_councils WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listDegree() {
    const getQuery = `SELECT * FROM degree WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listLanguages() {
    const getQuery = `SELECT * FROM languages WHERE status = 'true'`;
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

export async function listClinicSpecialities() {
    const getQuery = `SELECT * FROM clinic_specialities WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}

export async function listBloodGroup() {
    const getQuery = `SELECT * FROM blood_groups WHERE deleted_at is NULL`;
    return await (await vaasPgQuery(getQuery, [], cachingType.StandardCache)).queryResponse
}