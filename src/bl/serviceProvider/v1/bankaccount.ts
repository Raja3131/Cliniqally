import { cachingType, getVaasPgClient, vaasPgQuery } from '../../../services/vaasdbengine';
import { v4 as uuidv4 } from 'uuid';

export async function addBankaccount(req: any, response: any) {

    try {
        const providerData = req['serviceProviderData'];
        const providerId = providerData?.provider_id;
        const centerId = providerData?.center_id;
        const bankAccountId = uuidv4();
        const bankAccountName = req?.body?.bank_account_name == undefined ? null : req?.body?.bank_account_name;
        const accountNumber = req?.body?.account_number == undefined ? null : req?.body?.account_number;
        const bankBranch = req?.body?.bank_branch == undefined ? null : req?.body?.bank_branch;
        const ifscCode = req?.body?.ifsc_code == undefined ? null : req?.body?.ifsc_code;
        const tableCenterId = centerId.replace(/-/g, "_");
        if ((providerId && centerId && bankAccountName && accountNumber && bankBranch && ifscCode) != null) {
            getVaasPgClient((err: any, client: any, done: any, res: any) => {
                const start = Date.now();
                const shouldAbort = (err: any) => {
                    if (err) {
                        const duration = Date.now() - start
                        console.error(`Time is : ${duration}, Error in transaction`, err.stack);
                        client.query('ROLLBACK', (err: any) => {
                            if (err) {
                                const duration = Date.now() - start
                                console.error(`Time is : ${duration}, Error rolling back client`, err.stack);
                            }
                            done()
                        })
                    }
                    return !!err
                }
                client.query('BEGIN', (err: any, res: any) => {
                    if (shouldAbort(err)) return
                    const insertQueryFirst = `INSERT INTO service_provider_bank_accounts (bankaccount_id,provider_id,account_number,account_holder_name,center_id,bank_branch,ifsc_code) VALUES ('${bankAccountId}','${providerId}','${accountNumber}','${bankAccountName}','${centerId}','${bankBranch}','${ifscCode}')`;
                    client.query(insertQueryFirst, [], (err: any, res: any) => {
                        if (shouldAbort(err)) return
                        const insertQuerySecond = `INSERT INTO sc_${tableCenterId}_provider_bank (bankaccount_id,provider_id) VALUES ('${bankAccountId}','${providerId}') ON CONFLICT (provider_Id) DO UPDATE SET bankaccount_id=EXCLUDED.bankaccount_id`;
                        client.query(insertQuerySecond, [], (err: any, res: any) => {
                            if (shouldAbort(err)) return
                            client.query('COMMIT', (err: any, req: any, res: any) => {
                                if (err) {
                                    const duration = Date.now() - start
                                    console.error(`Time is : ${duration}, Error committing transaction`, err.stack);
                                }
                                done();
                                response.status(200).json({
                                    status: true,
                                    message: "Bank account stored Successfully",
                                    data: [],
                                });
                            })
                        })
                    })
                })
            })
        } else {
            response.status(500).json({
                status: false,
                message: "Invalid input",
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

export async function getBankaccount(req: any, res: any) {

    try {
        const providerData = req['serviceProviderData'];
        const providerId = providerData?.provider_id;
        const centerId = providerData?.center_id;
        const tableCenterId = centerId.replace(/-/g, "_");

        const getBankAccountQuery = ` SELECT  pr.bankaccount_id,pr.account_number,
                                   pr.account_holder_name,pr.center_id,pr.bank_branch,pr.ifsc_code ,
                                  ( Case WHEN ba.bankaccount_id = pr.bankaccount_id THEN ba.bankaccount_id ELSE NULL END) as default_account From
                                    sc_${tableCenterId}_provider_bank as ba
                                   RIGHT JOIN service_provider_bank_accounts as pr   
                                 on pr.provider_id = ba.provider_id Where pr.provider_id ='${providerId}'
 
         `;
        const getServiceProvidersResult = await vaasPgQuery(
            getBankAccountQuery,
            [],
            cachingType.StandardCache
        );
        if (getServiceProvidersResult?.queryResponse.length > 0) {
            res.status(200).json({
                status: true,
                message: "bank account listed successfully",
                data: getServiceProvidersResult.queryResponse,
            });
        } else {
            res.status(200).json({
                status: true,
                message: "Data not exist",
                data: [],
            });
        }

    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}

export async function updateBankaccount(req: any, res: any) {

    try {
        const bankAccountName = req?.body?.bank_account_name == undefined ? null : req?.body?.bank_account_name;
        const accountNumber = req?.body?.account_number == undefined ? null : req?.body?.account_number;
        const bankBranch = req?.body?.bank_branch == undefined ? null : req?.body?.bank_branch;
        const ifscCode = req?.body?.ifsc_code == undefined ? null : req?.body?.ifsc_code;
        const bankAccountId = req?.params?.bankaccount_id == undefined ? null : req?.params?.bankaccount_id;

        if ((bankAccountName && accountNumber && bankBranch && ifscCode) != null) {

            const insertQueryFirst = `update  service_provider_bank_accounts SET account_number='${accountNumber}',account_holder_name='${bankAccountName}',bank_branch='${bankBranch}',ifsc_code='${ifscCode}' WHERE bankaccount_id = '${bankAccountId}'`;
            const patientData = await vaasPgQuery(insertQueryFirst, [], cachingType.StandardCache);
            if (patientData) {
                return res.status(200).json({
                    status: true,
                    message: "Bank Data Updated Successfully",
                    data: [],
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: "Error ",
                    data: [],
                });
            }
        } else {
            res.status(500).json({
                status: false,
                message: "Invalid input",
                data: [],
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}
export async function switchBankaccount(req: any, res: any) {

    try {
        const providerData = req['serviceProviderData'];
        const providerId = providerData?.provider_id;
        const centerId = providerData?.center_id;
        const bankAccountId = req?.body?.bankaccount_id == undefined ? null : req?.body?.bankaccount_id;
        const tableCenterId = centerId.replace(/-/g, "_");
        if ((providerId && centerId) != null) {

            const insertQueryFirst = `update  sc_${tableCenterId}_provider_bank SET bankaccount_id='${bankAccountId}' WHERE provider_id = '${providerId}'`;
            const patientData = await vaasPgQuery(insertQueryFirst, [], cachingType.StandardCache);
            if (patientData) {
                return res.status(200).json({
                    status: true,
                    message: "Bank default Updated Successfully",
                    data: patientData.queryResponse,
                });
            } else {
                return res.status(200).json({
                    status: true,
                    message: "Error Occured",
                    data: [],
                });
            }
        } else {
            res.status(500).json({
                status: false,
                message: "Invalid input",
                data: [],
            });
        }
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            data: err,
        });
    }
}

