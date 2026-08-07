const Complaint = require('../models/Complaint');
const User = require('../models/User');


describe('Complaint Model Tests', () => {

  let testUser;

  beforeEach(async () => {
    testUser = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: '123456'
    });
    await testUser.save();
  });

  test('should create complaint successfully', async () => {
    const complaint = new Complaint({
      title: 'AC not working',
      description: 'AC in room B2 is not working since 2 days',
      category: 'IT',
      priority: 'High',
      user: testUser._id
    });
    const saved = await complaint.save();
    expect(saved._id).toBeDefined();
    expect(saved.status).toBe('Pending');
    expect(saved.aiConfidence).toBe(0);
  });

  test('should not save complaint without title', async () => {
    const complaint = new Complaint({
      description: 'Some description here',
      user: testUser._id
    });
    await expect(complaint.save()).rejects.toThrow();
  });

  test('should not save complaint without user', async () => {
    const complaint = new Complaint({
      title: 'Test title',
      description: 'Some description here'
    });
    await expect(complaint.save()).rejects.toThrow();
  });

  test('should only accept valid status values', async () => {
    const complaint = new Complaint({
      title: 'Test',
      description: 'Test description here',
      user: testUser._id,
      status: 'InvalidStatus'
    });
    await expect(complaint.save()).rejects.toThrow();
  });

  test('should set default category to General', async () => {
    const complaint = new Complaint({
      title: 'Test',
      description: 'Test description here',
      user: testUser._id
    });
    const saved = await complaint.save();
    expect(saved.category).toBe('General');
  });

});