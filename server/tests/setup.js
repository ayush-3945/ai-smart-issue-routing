require('dotenv').config();
const mongoose = require('mongoose');

beforeAll(async () => {
  const testUri = process.env.MONGODB_URI.replace(/\/[^/?]+(\?|$)/, '/test_db$1');
  await mongoose.connect(testUri);
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
}, 30000);