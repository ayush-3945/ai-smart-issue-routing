const User = require('../models/User');

describe('User Model Tests', () => {

  test('should create a user successfully', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: '123456'
    });
    const saved = await user.save();
    expect(saved._id).toBeDefined();
    expect(saved.email).toBe('test@test.com');
    expect(saved.role).toBe('user');
  });

  test('should hash password before saving', async () => {
    const user = new User({
      name: 'Test User',
      email: 'hash@test.com',
      password: '123456'
    });
    await user.save();
    expect(user.password).not.toBe('123456');
  });

  test('should not save user without email', async () => {
    const user = new User({
      name: 'No Email',
      password: '123456'
    });
    await expect(user.save()).rejects.toThrow();
  });

  test('comparePassword should return true for correct password', async () => {
    const user = new User({
      name: 'Compare User',
      email: 'compare@test.com',
      password: '123456'
    });
    await user.save();
    const isMatch = await user.comparePassword('123456');
    expect(isMatch).toBe(true);
  });

  test('comparePassword should return false for wrong password', async () => {
    const user = new User({
      name: 'Compare User',
      email: 'wrong@test.com',
      password: '123456'
    });
    await user.save();
    const isMatch = await user.comparePassword('wrongpass');
    expect(isMatch).toBe(false);
  });

});