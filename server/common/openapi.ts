import * as path from 'path';
import express, { Application } from 'express';
import errorHandler from '../api/middlewares/error.handler';
import * as OpenApiValidator from 'express-openapi-validator';

export default function (
  app: Application,
  routes: (app: Application) => void
): void {
  const apiSpec = path.join(__dirname, 'api.yml');
  const validateResponses = !!(
    process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION &&
    process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
  );
  const middleware = OpenApiValidator.middleware({
    apiSpec,
    validateResponses,
  });
  app.use(middleware);
  app.use(process.env.OPENAPI_SPEC || '/spec', express.static(apiSpec));
  routes(app);
  app.use(errorHandler);
}
