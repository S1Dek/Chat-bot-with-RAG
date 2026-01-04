const { verifyToken } = require('../src/middleware/auth');

describe('verifyToken middleware', () => {

  it('zwraca 401 gdy brak nagłówka Authorization', () => {
    const req = { headers: {} };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token' });
    expect(next).not.toHaveBeenCalled();
  });

});
