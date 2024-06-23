import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info:{
            title: "API de Angel Barrios",
            version: "1.0.0",
            description: "Documentación de la API de mi Proyecto Backend",
        },
        servers: [
            {
                url: "http://localhost:3000",
            },
        ],
    },
    apis: ["./src/routes/*.js"],
};

const specs = swaggerJsdoc(options);

export default (app) => {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  };