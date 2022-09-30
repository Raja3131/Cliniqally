import jwt from 'jsonwebtoken';
import {
    cachingType, vaasPgQuery
} from "../../../../services/vaasdbengine";
export const serviceProviderAuthMiddleWare = async (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode: any = jwt.verify(token, String(process.env.JWT_KEY));
        req.serviceProviderData = decode;
        const provider: string = decode?.provider_id;
        const queryProvider = `SELECT provider_id FROM service_providers WHERE provider_id = '${provider}' AND status = 'enabled' AND deleted = false`;
        const queryResult = await vaasPgQuery(queryProvider, [], cachingType.StandardCache);
        let isValid = false;
        if (queryResult?.queryResponse[0]?.provider_id !== null) {
            isValid = true;
        }
        if (isValid == true) {
            next();
        } else {
            return res.status(401).json({
                reply: true,
                message: 'Auth Failed',
                reauth: true,
                data: [],
            });
        }
    } catch (error) {
        res.status(401).json({
            reply: true,
            message: 'Auth Failed',
            reauth: true,
            data: [],
        });
    }
};
