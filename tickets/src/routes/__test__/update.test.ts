import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose, { Types } from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if provided id doesnt exist', async () => {
  const id = new mongoose.Types.ObjectId().toString();
  await request(app).put(`/api/tickets/${id}`).set('Cookie', global.signin()).send({ title: 'aaab', price: 123 }).expect(404);
});

it('returns 401 if user not auth', async () => {
  const id = new mongoose.Types.ObjectId().toString();
  await request(app).put(`/api/tickets/${id}`).send({ title: 'aaab', price: 123 }).expect(401);
});

it('returns 401 if user doesnt own ticket', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'aaa', price: 123 });

  await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', global.signin()).send({ title: 'asdfa', price: 123 }).expect(401);
});

it('returns 400 if user provides an invalid title or price', async () => {
  const cookie = global.signin();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'aaa', price: 123 });

  await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: '', price: 123 }).expect(400);
  await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: '3423423' }).expect(400);
});

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'aaa', price: 123 });

  const updatedTicketRes = await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: 'asdfas', price: 123 }).expect(200);

  const tickets = await request(app).get(`/api/tickets/${response.body.id}`).send();

  expect(tickets.body.title).toEqual('asdfas');
  expect(tickets.body.price).toEqual(123);
});

it('rejects edit if orderId is set', async () => {
  const cookie = global.signin();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'aaa', price: 123 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new Types.ObjectId().toString()});
  await ticket!.save();

  await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: 'asdfas', price: 123 }).expect(400);
});

it('publishes an event', async () => {
  const cookie = global.signin();
  const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'aaa', price: 123 });

  const updatedTicketRes = await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: 'asdfas', price: 123 }).expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});