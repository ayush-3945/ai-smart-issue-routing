const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());
app.use('/api/auth', require('../routes/authRoutes'));

describe('Auth Controller Tests', () => {

  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'register@test.com',
        password: '123456'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.user.email).toBe('register@test.com');
    expect(res.body.user.role).toBe('user');
  });

  test('should not register duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User 1', email: 'dup@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User 2', email: 'dup@test.com', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  test('should login successfully', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: 'login@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  test('should fail login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email: 'wrongpass@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrongpass@test.com', password: 'wrongpassword' });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  test('should fail login with non-existing email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@test.com', password: '123456' });

    expect(res.statusCode).toBe(401);
  });

  test('should refresh access token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Refresh User', email: 'refresh@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: registerRes.body.refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

});