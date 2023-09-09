import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

it('returns 404 if ticket not found', async () => {
  await request(app).get(`/api/tickets/${new mongoose.Types.ObjectId().toString()}`).send({}).expect(404);
});

it('returns ticket if found', async () => {
  const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'aaa', price: 123 });

  const ticketResponse = await request(app).get(`/api/tickets/${response.body.id}`).send({}).expect(200);

  expect(ticketResponse.body.title).toEqual('aaa');
  expect(ticketResponse.body.price).toEqual(123);
});

