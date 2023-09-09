import express from "express";
import { json } from 'body-parser';
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { NotFoundError, errorHandler } from "@senya-micros-tickets/common";
import 'express-async-errors';
import cookieSession from 'cookie-session';

const app = express();
app.set('trust proxy', true); // letting express know that it's behind a proxy of ingress-nginx
app.use(json());
app.use(cookieSession({
  signed: false, // no need for encryption
  secure: process.env.NODE_ENV !== 'test' // only allow cookies over HTTPS
}));

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', () => {
  throw new NotFoundError();
})

// for async functions in express we have to use next() to throw errors; if we dont want that, use 
// app.all('*', async (req, res, next) => {
//   next(new NotFoundError());
// })

app.use(errorHandler);

export { app };