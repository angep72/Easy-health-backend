import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EasyHealth API',
      version: '1.0.0',
      description: 'EasyHealth backend API documentation'
    },
    servers: [
      { url: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}` }
    ]
  },
  apis: ['./routes/*.js', './server.js'] // add JSDoc comments to these files
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;