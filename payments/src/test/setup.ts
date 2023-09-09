import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

let mongo: any;

declare global {
  var signin: (id?: string) => string[];
}

// runs before all of our tests start exectuing
beforeAll(async() => {
  process.env.JWT_KEY = 'asdfasd';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks(); // for each test, number of invocations of a mock increases, so clearing them

  const collections = await mongoose.connection.db.collections();

  for(const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

// takes from __mocks__ by default; all tests will use this mock when we provide it here
jest.mock('../nats-wrapper');

// secret key from stripe
process.env.STRIPE_KEY = 'sk_test_51NFFANA1tUaTsAqvAzY7MEv80ctt5RWdYFouC2vnguriEnCKb47zjdyy6pRjzUqFNb1maudHXT7xB9xFV4JSFbbB009GbKMXMs'

// could also declare in a separate file as an exported function and then import where needed
// could also extract id from payload but easier to just prove id
global.signin = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toString(),
    email: 'test@test.com'
  };

  const session = { jwt: jwt.sign(payload, process.env.JWT_KEY!) };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
}