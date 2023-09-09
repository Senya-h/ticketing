import { BadRequestError, NotAuthorizedError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@senya-micros-tickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments',
requireAuth,
[
  body('token').not().isEmpty(),
  body('orderId').not().isEmpty()
],
validateRequest,
async (req: Request, res: Response) => {
  const { token, orderId } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    console.log('order not found');
    throw new NotFoundError();
  }

  if (order.userId !== req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  if (order.status === OrderStatus.Cancelled) {
    throw new BadRequestError('Order is cancelled, cannot pay');
  }

  const charge = await stripe.charges.create({
    amount: order.price * 100,
    currency: 'usd',
    source: token // we also have a special token tok_visa with which the request would always succeed
  });

  const payment = Payment.build({
    orderId,
    stripeId: charge.id
  });

  await payment.save();

  new PaymentCreatedPublisher(natsWrapper.client).publish({
    id: payment.id,
    orderId: payment.orderId, // best practice to take from this object in case there was some data massassing
    stripeId: payment.stripeId
  })

  res.status(201).send({ id: payment.id });
})

export { router as createChargeRouter };