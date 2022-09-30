import { v4 as uuidv4 } from 'uuid';
import { cachingType, vaasPgQuery } from '../../../services/vaasdbengine';

export async function createCurrency(req: any, res: any) {
    try {
        if (req?.body?.currency) {
            const currencyResult = await vaasPgQuery(`SELECT * FROM currencies WHERE currency = '${req?.body?.currency}'`, [], cachingType.StandardCache)
            if (currencyResult?.queryResponse.length === 0) {
                const currency_id = uuidv4();
                const adminID = req[`adminData`][`admin_id`];
                const currency = req?.body?.currency == undefined ? null : req?.body?.currency;
                const symbol = req?.body?.symbol == undefined ? null : req?.body?.symbol;
                const symbol_at = req?.body?.symbol_at == undefined ? null : req?.body?.symbol_at;
                const status = req?.body?.status == undefined ? null : req?.body?.status;
                const insertQuery = `INSERT INTO currencies (currency_id,currency,symbol,symbol_at,status, created_by, updated_by) VALUES ('${currency_id}','${currency}','${symbol}','${symbol_at}','${status}','${adminID}' ,'${adminID}')`;
                const executeCurrency = await vaasPgQuery(insertQuery, [], cachingType.NoCache)
                if (executeCurrency) {
                    return res.status(200).json({
                        status: true,
                        message: "Currency Created Successfully",
                        data: [],
                    });
                }
            } else {
                res.status(200).json(
                    {
                        status: false,
                        message: 'Currency Already Exist',
                        data: [],
                    },
                );
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Currency  field is mandatory',
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

export async function getCurrencies(req: any, res: any) {
    try {
        const getQuery = `SELECT currency_id, currency, symbol, symbol_at, status, created_by, updated_by, deleted_at FROM currencies WHERE deleted_at is NULL`;
        const currencyData = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
        if (currencyData.queryResponse.length !== 0) {
            return res.status(200).json({
                status: true,
                message: "Currency Data Listed Successfully",
                data: currencyData.queryResponse,
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

export async function updateCurrency(req: any, res: any) {
    try {
        if (req?.params?.currency_id) {
            const adminID = req[`adminData`][`admin_id`];
            const currency = req?.body?.currency == undefined ? null : req?.body?.currency;
            const symbol = req?.body?.symbol == undefined ? null : req?.body?.symbol;
            const symbol_at = req?.body?.symbol_at == undefined ? null : req?.body?.symbol_at;
            const status = req?.body?.status == undefined ? null : req?.body?.status;
            const updateQuery = `UPDATE currencies
        SET  currency = '${currency}',symbol = '${symbol}',symbol_at = '${symbol_at}', status = '${status}', created_by = '${adminID}', updated_by = '${adminID}'
        WHERE currency_id = '${req?.params?.currency_id}'`;
            const currencyUpdate = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (currencyUpdate) {
                return res.status(200).json({
                    status: true,
                    message: "Currency Updated Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Currency not exist',
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

export async function getCurrencyById(req: any, res: any) {
    try {
        if (req?.params?.currency_id) {
            const getQuery = `SELECT currency_id, currency,symbol,symbol_at, status, created_by, updated_by FROM currencies WHERE currency_id ='${req?.params?.currency_id}'`;
            const dataCurrency = await vaasPgQuery(getQuery, [], cachingType.StandardCache)
            if (dataCurrency.queryResponse.length !== 0) {
                return res.status(200).json({
                    status: true,
                    message: "Currency Data Listed Successfully",
                    data: dataCurrency.queryResponse,
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Currency not exist',
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

export async function deleteCurrency(req: any, res: any) {
    try {
        if (req?.params?.currency_id) {
            const adminID = req[`adminData`][`admin_id`];
            const deleted_at = new Date().toISOString();
            const updateQuery = `UPDATE currencies
        SET deleted_by = '${adminID}',deleted_at = '${deleted_at}'
        WHERE currency_id = '${req?.params?.currency_id}'`;
            const currencyDelete = await vaasPgQuery(updateQuery, [], cachingType.NoCache)
            if (currencyDelete) {
                return res.status(200).json({
                    status: true,
                    message: "Currency Deleted Successfully",
                    data: [],
                });
            }
        } else {
            res.status(200).json(
                {
                    status: false,
                    message: 'Currency not exist',
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
