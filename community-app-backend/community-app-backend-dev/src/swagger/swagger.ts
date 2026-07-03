import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { SWAGGER_HOST } from "../server";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Community API",
      version: "1.0.0",
      description: "API documentation for the Community App",
    },
    servers: [{ url: `${SWAGGER_HOST}` }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      parameters: {
        AcceptLanguage: {
          in: "header",
          name: "Accept-Language",
          schema: {
            type: "string",
            example: "gu_IN",
          },
          required: false,
          description: "Optional language parameter to localize API responses.",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts", "./src/swagger/*.swagger.ts"], // Load all route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use("/community-api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Swagger docs available at ${SWAGGER_HOST}/community-api`);
};
