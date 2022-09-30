const basicAuthOption = {
    users: { 'vaasits': 'vaasits@123' },
    challenge: true,
    unauthorizedResponse: getUnauthorizedResponse
};


function getUnauthorizedResponse(req: any) {
    return req.auth
        ? (`${`Credentials ${req.auth.user}:${req.auth.password} rejected`}`)
        : `Your not authorized to login. Please contact vaasits.com`;
}

const defaultText = `
<img src="https://vaasits.com/assets/img/logo.png" width="930" height="239" alt="VAAS ITS Logo">
<h1>Build by VAAS ITS</h1>
<br>
<h3>official@vaasits.com</h3>
<br>https://vaasits.com`;

enum DayNumber {
    "Sunday" = 1,
    "Monday" = 2,
    "Tuesday" = 3,
    "Wednesday" = 4,
    "Thursday" = 5,
    "Friday" = 6,
    "Saturday" = 7
}

export { basicAuthOption, getUnauthorizedResponse, defaultText, DayNumber };

export const distance = 5;

export const adminTokenExpiryDays = "365d";
export const serviceProviderTokenExpiryDays = "365d";
export const serviceConsumerTokenExpiryDays = "365d";