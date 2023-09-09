import request from 'supertest';
import { app } from '../../app';
import mongoose, { Types } from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket doesnt exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId }).expect(404);
})

it('returns an error if the ticket is arleady reserved', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'awer',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(400);
})

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);
})

it('emits an event', async () => {
  const ticket = Ticket.build({
    id: new Types.ObjectId().toString(),
    title: 'concert',
    price: 20
  });
  await ticket.save();

  await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

