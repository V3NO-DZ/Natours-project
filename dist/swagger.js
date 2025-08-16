// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Natours API',
            version: '1.0.0',
            description: 'API documentation for the Natours project',
        },
        servers: [
            {
                url: 'http://localhost:3000/api/v1', // Adjust as needed
            },
        ],
    },
    apis: ['./routes/*.ts', './controllers/*.ts'], // Path to the API docs
};
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
