import request from 'supertest';
import { app } from '../../app';
import { Types } from 'mongoose';
import { Order } from '../../models/order';
import { OrderStatus } from '@senya-micros-tickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// an old method
// jest.mock('../../stripe');

it('returns 404 when purchasing an order that doesnt exist', async () => {
  await request(app).post('/api/payments').set('Cookie', global.signin()).send({ token: 'asdfa', orderId: new Types.ObjectId() }).expect(404);
})

it('retruns 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = Order.build({
    id: new Types.ObjectId().toString(),
    price: 123,
    status: OrderStatus.Created,
    userId: new Types.ObjectId().toString(),
    version: 0
  });

  await order.save();

  await request(app).post('/api/payments').set('Cookie', global.signin()).send({ token: 'asdfa', orderId: order.id }).expect(401);
})

it('retruns 400 when purchasing a cancelled order', async () => {
  const userId = new Types.ObjectId().toString();
  const user = global.signin(userId);

  const order = Order.build({
    id: new Types.ObjectId().toString(),
    price: 123,
    status: OrderStatus.Cancelled,
    userId: userId,
    version: 0
  });

  await order.save();

  await request(app).post('/api/payments').set('Cookie', user).send({ token: 'asdfa', orderId: order.id }).expect(400);
})

it('returns a 201 with valid inputs', async () => {
  const userId = new Types.ObjectId().toString();
  const price = Math.floor((Math.random() * 100000));

  const user = global.signin(userId);

  const order = Order.build({
    id: new Types.ObjectId().toString(),
    price,
    status: OrderStatus.Created,
    userId: userId,
    version: 0
  });

  await order.save();

  await request(app).post('/api/payments').set('Cookie', user).send({ token: 'tok_visa', orderId: order.id }).expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find(charge => charge.amount === price * 100);

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });

  expect(payment).not.toBeNull();

  // old
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.source).toEqual('tok_visa');
  // expect(chargeOptions.amount).toEqual(order.price * 100);
  // expect(chargeOptions.currency).toEqual('usd');
})
