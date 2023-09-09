import request from "supertest";
import { app } from "../../app";

it('cleras the cookie after signing out', async () => {
  await signin();

  const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  console.log(response.get('Set-Cookie'));
  expect(response.get('Set-Cookie')[0]).toEqual('');
});