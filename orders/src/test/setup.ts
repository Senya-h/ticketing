import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

let mongo: any;

declare global {
  var signin: () => string[];
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

// could also declare in a separate file as an exported function and then import where needed
global.signin = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toString(),
    email: 'test@test.com'
  };

  const session = { jwt: jwt.sign(payload, process.env.JWT_KEY!) };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
}