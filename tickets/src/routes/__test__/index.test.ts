import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';

const createTicket = () => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'aaa', price: 123 })
}

it('returns all tickets', async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get(`/api/tickets`).send({}).expect(200);

  expect(response.body.length).toEqual(3);
});

