const { adminOnly } = require('../middleware/adminMiddleware');
const validateComplaint = require('../middleware/validateComplaint');

describe('Admin Middleware Tests', () => {

  test('should call next() for admin user', () => {
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = jest.fn();

    adminOnly(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should return 403 for non-admin user', () => {
    const req = { user: { role: 'user' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    adminOnly(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

});

describe('Validate Complaint Middleware Tests', () => {

  test('should pass valid complaint data', () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'This is a valid description with enough text',
        category: 'IT',
        priority: 'High'
      }
    };
    const res = {};
    const next = jest.fn();

    validateComplaint(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('should fail if title is missing', () => {
    const req = {
      body: {
        description: 'Valid description here'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    validateComplaint(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('should fail if description is too short', () => {
    const req = {
      body: {
        title: 'Valid Title',
        description: 'Short'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    validateComplaint(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

});