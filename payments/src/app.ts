import express from "express";
import { json } from 'body-parser';
import { NotFoundError, errorHandler, currentUser } from "@senya-micros-tickets/common";
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { createChargeRouter } from "./routes/new";

const app = express();
app.set('trust proxy', true); // letting express know that it's behind a proxy of ingress-nginx
app.use(json());
app.use(cookieSession({
  signed: false, // no need for encryption
  secure: process.env.NODE_ENV !== 'test' // only allow cookies over HTTPS
}));
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', () => {
  throw new NotFoundError();
})

app.use(errorHandler);

export { app };