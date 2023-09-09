import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@senya-micros-tickets/common';

const router = express.Router();
router.post('/api/users/signin',
[
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().notEmpty().withMessage('You must supply a password')
],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new BadRequestError('Invalid credentials');
  }

  const passwordsMatch = await Password.compare(existingUser.password, password);
  if (!passwordsMatch) {
    throw new BadRequestError('Invalid credentials');
  }

  console.log('order: ', BadRequestError)

  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  }, process.env.JWT_KEY!);

  // cookie session library will take this object, serialize it (encode to base64) and send it back to the browser
  req.session = { jwt: userJwt };


  res.status(200).send(existingUser);

});

export { router as signInRouter };