import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken';
import { BadRequestError, validateRequest } from '@senya-micros-tickets/common';

const router = express.Router();

router.post('/api/users/signup', [
  body('email').isEmail().withMessage('Email must be valid'),
  body('password').trim().isLength({ min: 4, max: 20 }).withMessage('Password must be between 4 and 20 chars'),
], 
validateRequest, 
async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // return res.status(202).send();
    throw new BadRequestError('Email in use');
  }

  const newUser = User.build({ email, password });
  await newUser.save();

  const userJwt = jwt.sign({
    id: newUser.id,
    email: newUser.email
  }, process.env.JWT_KEY!);

  // cookie session library will take this object, serialize it (encode to base64) and send it back to the browser
  req.session = { jwt: userJwt };
 
  res.status(201).send();
});

export { router as signUpRouter };