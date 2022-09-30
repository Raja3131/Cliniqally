import bcript from 'bcrypt';


const email_check = (req: any, res: any, next: any) => {
    const pattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/;
    if (req?.body?.email.length > 0) {
        if (req?.body?.email.match(pattern)) {
            req.body.email = req?.body?.email.toLowerCase();
            next();
        } else {
            return res.status(400).json({
                status: false,
                message: 'Invalid Email',
                data: {},
            });
        }
    } else {
        return res.status(400).json({
            status: false,
            message: 'Email is required',
            data: {},
        });
    }
};

//It will check the password
const pass_check = (req: any, res: any, next: any) => {
    // const pass_pattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/;
    if (req?.body?.password.length > 4) {
        next();
    } else {
        return res.status(400).json({
            status: false,
            message: 'Password is too short',
            data: {},
        });
    }
};

// It will hash the password.
const pass_hash = (req: any, res: any, next: any) => {
    bcript.hash(req?.body?.password, 10, (error, hash) => {
        if (error) {
            return res.status(500).json({
                status: false,
                message: 'Internal server error',
                data: {},
            });
        }
        req.body.password = hash;
        next();
    });
};


// This will generate the random password.
const pass_generator = (req: any, res: any, next: any) => {
    const variable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$abcdefghijklmnopqrstuvwxyz';
    const pass_length = Math.floor(Math.random() * 3 + 5);
    let text = '';
    for (let i = 0; i < pass_length; i++) {
        text += variable.charAt(Math.floor(Math.random() * variable.length));
    }
    req.rand_pass = text;
    req.flag = 1; // This type means it will generate the password email
    next();
};

export const adminMiddleWare = {
    password_generator: pass_generator,
    email_checker: email_check,
    pass_checker: pass_check,
    pass_hashing: pass_hash,
};