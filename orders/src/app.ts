import express from "express";
import { json } from 'body-parser';
import { NotFoundError, errorHandler, currentUser } from "@senya-micros-tickets/common";
import 'express-async-errors';
import cookieSession from 'cookie-session';
import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes";
import { createOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set('trust proxy', true); // letting express know that it's behind a proxy of ingress-nginx
app.use(json());
app.use(cookieSession({
  signed: false, // no need for encryption
  // secure: process.env.NODE_ENV !== 'test' // only allow cookies over HTTPS
  secure: false // TODO enable https on live server
}));
app.use(currentUser);
app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);

app.all('*', () => {
  throw new NotFoundError();
})

app.use(errorHandler);

export { app };