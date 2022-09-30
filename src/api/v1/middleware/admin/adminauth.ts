import jwt from 'jsonwebtoken';

export const adminAuthMiddleWare = (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decode: any = jwt.verify(token, String(process.env.JWT_KEY));
        req.adminData = decode;
        const isValid: string = decode?.user_type;
        if (isValid !== 'admin') {
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
    next();
};
