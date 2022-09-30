import swaggerJsDocs from 'swagger-jsdoc';
import component from './components.json';
import specification from './openapi.json';

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Cliniqally',
            version: '1.0.3',
            description: 'Test APIs for the servers',
        },
        servers: [
            {
                name: 'dev-server',
                url: 'http://localhost:4000/v1',
                description: 'local server',
                // variables: {
                //     protocol: {
                //         enum: ['http', 'https']
                //     },
                //     default: 'http'
                // }
            },
            {
                name: 'Beta server',
                url: 'https://betacliniqallyapi.vaas.tech/v1',
                description: 'beta server',
            },
            {
                name: 'Qa server',
                url: 'https://qacliniqallyapi.vaas.tech/v1',
                description: 'Qa server',
            },
        ],

        paths: specification.paths,
        components: component.components,
    },
    apis: ['routes/*.js'],
};

const swaggersDocsV1 = swaggerJsDocs(swaggerOptions);
export default swaggersDocsV1;
