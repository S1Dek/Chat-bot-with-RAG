const request = require('supertest');

const API_URL = 'http://localhost:8080';

describe('Auth API', () => {

  it('loguje użytkownika poprawnymi danymi', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@test.pl',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('odrzuca błędne dane logowania', async () => {
    const res = await request(API_URL)
      .post('/api/auth/login')
      .send({
        email: 'test@test.pl',
        password: 'zlehaslo'
      });

    expect(res.statusCode).toBe(401);
  });

});
