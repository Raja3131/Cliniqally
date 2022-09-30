// import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import basicAuth from 'express-basic-auth';
import passport from 'passport';
import swaggerUi from 'swagger-ui-express';
import { env } from './aenv';
import { adminClinicRouter, adminRouter, adminServiceProviderRouter, adminSupportQueryRouter, allergicRouter, bloodGroupRouter, chronicRouter, clinicSpecialityRouter, currencyRouter, languageRouter, locationRouter, occupationRouter, patientRouter, qualificationRouter, surgeryRouter, timeZoneRouter } from './api/v1/routes/admin';
import { patientUserRouter } from './api/v1/routes/patients';
// import swaggersDocsV1 from './api/v1/swagger/swaggersDocs';
import { appointmentRouter, clinicRouter, clinicStaffRouter, consumerRouter, doctorRouter, feeRouter, generateInvoiceRouter, medicalRecordRouter, patientVitalSignsRouter, prescriptionRouter, privateNotesRouter, providerSupportQueryRouter, serviceConsumerPatientRouter, serviceProviderRouter } from './api/v1/routes/serviceProvider';
import { consultationRouter } from './api/v1/routes/serviceProvider/consultationRouter';
import swaggersDocsV1 from './api/v1/swagger/swaggersDocs';
import { basicAuthOption, defaultText } from './services/standard';
import { cachingType, upMigrations, vaasPgQuery } from './services/vaasdbengine';
// import swaggersDocsV1 from './api/v1/swagger/swaggersDocs';


console.log(env); // needed for loading envs on time before router.
// const mongoUrl = process.env.MongoUrl;
// const connectionParameters = {
//     user: process.env.PGUSER,
//     host: process.env.PGHOST,
//     database: process.env.PGDATABASE,
//     password: process.env.PGPASSWORD,
//     port: Number(process.env.PGPORT),
//     max: 20,
//     idleTimeoutMillis: 30000,
//     connectionTimeoutMillis: 2000,
// };
// const pool = new Pool(connectionParameters);
// console.log("🚀 ~ file: cliniqally-backend.ts ~ line 25 ~ pool", pool);

// pool.on('error', (err, client) => {
//     console.error(err);
// });




// console.log("🚀 ~ file: cliniqally-backend.ts ~ line 21 ~ pool", pool);
const app = express();
// if (process.env.sentryEnabled === 'true') {
//     Sentry.init({
//         dsn: 'https://8fbd9f6ecb564dd2b4142eb67bd3cf68@o1096075.ingest.sentry.io/6116231',
//         environment: process.env.APP_ENV,
//         integrations: [
//             // enable HTTP calls tracing
//             new Sentry.Integrations.Http({ tracing: true }),
//             // enable Express.js middleware tracing
//             new Tracing.Integrations.Express({ app }),
//         ],
//         tracesSampleRate: Number(process.env.Sentry_tracesSampleRate),
//     });
//     // RequestHandler creates a separate execution context using domains, so that every
//     // transaction/span/breadcrumb is attached to its own Hub instance
//     app.use(Sentry.Handlers.requestHandler());
//     // TracingHandler creates a trace for every incoming request
//     app.use(Sentry.Handlers.tracingHandler());
//     // The error handler must be before any other error middleware and after all controllers
//     app.use(Sentry.Handlers.errorHandler());
//     console.log('Sentry Online');
// }
const port = 4000;

// const connect = mongoose.connect(mongoUrl, {
//     useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true,
// });


//todo: uncomment to up migrations
//upMigrations();

//todo: uncomment to down migrations
//downMigrations();


//todo: comment if to run the migrations
vaasPgQuery('SELECT NOW()', [], cachingType.StandardCache).then(
    (response) => {
        console.log("🚀 ~ file: cliniqally-backend.ts ~ line 74 ~ response", response);
        console.log(`Connected correctly to server`);
        initApp();
    },
    (err: any) => {
        console.log("🚀 ~ file: cliniqally-backend.ts ~ line 79 ~ err", err);
    },
);

function initApp() {
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(passport.initialize()); // passport initialization
    app.use('/v1/admin', adminRouter);
    app.use('/v1/admin/patient', patientRouter);
    app.use('/v1/admin/language', languageRouter);
    app.use('/v1/admin/qualification', qualificationRouter);
    app.use('/v1/admin/speciality', clinicSpecialityRouter);
    app.use('/v1/admin/surgery', surgeryRouter);
    app.use('/v1/admin/chronic', chronicRouter);
    app.use('/v1/admin/allergy', allergicRouter);
    app.use('/v1/admin/location', locationRouter);
    app.use('/v1/admin/occupation', occupationRouter);
    app.use('/v1/admin/time-zone', timeZoneRouter);
    app.use('/v1/admin/blood-group', bloodGroupRouter);
    app.use('/v1/admin/currency', currencyRouter);
    app.use('/v1/admin/query', adminSupportQueryRouter);
    app.use('/v1/admin/service-provider', adminServiceProviderRouter);
    app.use('/v1/service-provider', serviceProviderRouter);
    app.use('/v1/service-provider', appointmentRouter);
    app.use('/v1/service-provider', feeRouter);
    app.use('/v1/service-provider', doctorRouter);
    app.use('/v1/service-provider', medicalRecordRouter);
    app.use('/v1/service-provider/invoice', generateInvoiceRouter)
    app.use('/v1/service-provider/consumer', consumerRouter);
    app.use('/v1/service-provider/query', providerSupportQueryRouter);
    app.use('/v1/service-provider/clinic', clinicRouter);
    app.use('/v1/service-provider/patient', serviceConsumerPatientRouter);
    app.use('/v1/service-provider/prescription', prescriptionRouter);
    app.use('/v1/admin/clinic', adminClinicRouter);
    app.use('/v1/service-consumer', patientUserRouter);
    app.use('/v1/service-provider/consultation', consultationRouter);
    app.use('/v1/service-provider/clinic-staffs', clinicStaffRouter);
    app.use('/v1/service-provider/private-notes', privateNotesRouter);
    app.use('/v1/service-provider/vitals', patientVitalSignsRouter)
    app.use('/v1/api-docs', basicAuth(basicAuthOption), swaggerUi.serveFiles(swaggersDocsV1), swaggerUi.setup(swaggersDocsV1));
    // default route
    app.get('/', (req, res) => {
        res.send(defaultText);
    });
    app.use("/static", express.static(__dirname + '/static'));
    // catch 404 and forward to error handler
    app.use((req, res, next) => {
        res.status(404).json({
            status: false,
            message: 'Invalid Resource',
            data: {},
        });
    });

    // start the Express server
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}`);
    });
}


