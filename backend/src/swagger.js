const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Umbrella Corporation API',
      version: '1.0.0',
      description: 'Documentação da API da Umbrella Corporation',
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor local',
      },
    ],
    // Definir o esquema de segurança Bearer para permitir o botão "Authorize" no Swagger UI
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    }, //
    // Aplicar segurança globalmente (faz o Authorize valer para todas as rotas)
    security: [
      {
        bearerAuth: [],
      },
    ], //
  },
apis: [path.join(__dirname, '/routes/**/*.js')],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger disponível em http://localhost:3001/api-docs');
}

module.exports = setupSwagger;
