let express = require('express');
import { Application } from 'express';
import path from 'path';
//import bodyParser from 'body-parser';
import http from 'http';
import os from 'os';
import cookieParser from 'cookie-parser';
import l from './logger';
import cors from 'cors';

import installValidator from './openapi';

const app = express();
const exit = process.exit;

export default class ExpressServer {
  private routes: (app: Application) => void;

  constructor() {
    const root = path.normalize(__dirname + '/../..');
    app.set('appPath', root + 'client');
    app.use(express.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(express.text({ extended: true, limit: process.env.REQUEST_LIMIT || '100kb' }));
    // https://stackoverflow.com/questions/66525078/bodyparser-is-deprecated
    /*app.use(bodyParser.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(
      bodyParser.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || '100kb',
      })
    );
    app.use(bodyParser.text({ limit: process.env.REQUEST_LIMIT || '100kb' }));*/
    app.use(cookieParser(process.env.SESSION_SECRET));
    app.use(express.static(`${root}/public`));

    // Enable CORS for ongoing front-end development.
    const whitelist = ["http://localhost:3000","http://localhost:3001"];
    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error("Not allowed by CORS"))
        }
      },
      credentials: true,
    }
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));  // enable pre-flight
  }

  router(routes: (app: Application) => void): ExpressServer {
    this.routes = routes;
    return this;
  }

  listen(port: number): Application {
    const welcome = (p: number) => (): void =>
      l.info(
        `up and running in ${
          process.env.NODE_ENV || 'development'
        } @: ${os.hostname()} on port: ${p}}`
      );

    try {
      installValidator(app, this.routes);
      http.createServer(app).listen(port, welcome(port));
    } catch (e) {
      l.error(e);
      exit(1);
    }
    return app;
  }
}
