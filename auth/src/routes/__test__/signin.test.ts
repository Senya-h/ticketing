import request from "supertest";
import { app } from "../../app";

it('fails when an email does not exist is supplied', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@aaa.com',
      password: 'password'
    })
    .expect(400);
});

it('fails when an incorrect password is supplied', async () => {
  await signin();

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password2'
    })
    .expect(400);
});

it('responds with a cookie when given valid credentials', async () => {
  await signin();

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
