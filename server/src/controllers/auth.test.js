const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const app = require('../index'); // Correctly load the app

// Set a default JWT_SECRET for testing if not already set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jest';

// Mock the sendEmail utility
jest.mock('../utils/sendEmail', () => jest.fn(() => Promise.resolve()));

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  jest.clearAllMocks();
});

describe('Auth Controller - /register', () => {
  const registerUrl = '/api/v1/auth/register';

  it('should register a new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post(registerUrl)
      .send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('name', userData.name);
    expect(res.body.data.user).toHaveProperty('email', userData.email);
    expect(res.body.data.user).not.toHaveProperty('password');
    expect(res.body.data.user).toHaveProperty('emailVerified', false);

    const dbUser = await User.findOne({ email: userData.email });
    expect(dbUser).toBeTruthy();
    expect(dbUser.name).toBe(userData.name);
    expect(dbUser.emailVerified).toBe(false);

    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: userData.email,
      subject: 'Verify Your Email Address',
    }));
  });

  it('should return 400 if user with this email already exists', async () => {
    const userData = {
      name: 'Test User Existing',
      email: 'existing@example.com',
      password: 'password123',
    };
    await User.create(userData); // Create the user first

    const res = await request(app)
      .post(registerUrl)
      .send(userData); // Attempt to register again with the same email

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User with this email already exists.');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should return 400 if required fields are missing (e.g., name)', async () => {
    const userData = {
      email: 'testmissingfields@example.com',
      password: 'password123',
    };

    const res = await request(app)
      .post(registerUrl)
      .send(userData);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Please provide name, email, and password.');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should return 400 if email is invalid', async () => {
    const userData = {
      name: 'Test User Invalid Email',
      email: 'invalid-email',
      password: 'password123',
    };

    const res = await request(app)
      .post(registerUrl)
      .send(userData);

    expect(res.statusCode).toEqual(400);
    // Corrected regex:
    expect(res.body.message).toMatch(/Please fill a valid email address/i);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should return 400 if password is too short', async () => {
    const userData = {
      name: 'Test User Short Pass',
      email: 'shortpass@example.com',
      password: '123', // Too short
    };

    const res = await request(app)
      .post(registerUrl)
      .send(userData);

    expect(res.statusCode).toEqual(400);
    // Corrected regex:
    expect(res.body.message).toMatch(/Password must be at least 6 characters long/i);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});

describe('Auth Controller - /login', () => {
  const loginUrl = '/api/v1/auth/login';
  let testUserCredentials;

  beforeEach(async () => {
    // Ensure a clean state for user creation in this block
    await User.deleteMany({ email: 'logintest@example.com' });
    // Create a user to test login against
    const password = 'passwordLogin123';
    const user = await User.create({
      name: 'Login Test User',
      email: 'logintest@example.com',
      password: password, // Mongoose pre-save hook will hash this
      emailVerified: true // Assume user is verified for login tests
    });
    testUserCredentials = { email: user.email, plainPassword: password, _id: user._id };
  });

  it('should login an existing user successfully with correct credentials', async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        email: testUserCredentials.email,
        password: testUserCredentials.plainPassword,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(res.body).toHaveProperty('token');
    expect(res.body.data.user).toHaveProperty('email', testUserCredentials.email);
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('should return 401 for login with incorrect password', async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        email: testUserCredentials.email,
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Incorrect email or password.');
  });

  it('should return 401 for login with non-existent email', async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Incorrect email or password.');
  });

  it('should return 400 if email is missing for login', async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        password: 'password123',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Please provide email and password.');
  });

  it('should return 400 if password is missing for login', async () => {
    const res = await request(app)
      .post(loginUrl)
      .send({
        email: testUserCredentials.email,
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Please provide email and password.');
  });
});
