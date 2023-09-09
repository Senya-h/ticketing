import request from 'supertest';
import { app } from '../../app';
import mongoose, { Types } from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';

it('fetches the order', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app).post(`/api/orders`).set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

  const { body: fetchedOrder} = await request(app).get(`/api/orders/${order.id}`).set('Cookie', user).send().expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
})

it('returns an error if 1 user tries to fetch another users order', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const user = global.signin();
  const { body: order } = await request(app).post(`/api/orders`).set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

  await request(app).get(`/api/orders/${order.id}`).set('Cookie', global.signin()).send().expect(401);
})
