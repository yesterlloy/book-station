const mongoose = require('mongoose');
const config = require('./index');

const buildMongoUri = () => {
  const { host, port, username, password, database } = config.mongo;
  if (username && password) {
    return `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
  }
  return `mongodb://${host}:${port}/${database}`;
};

const connectDatabase = async () => {
  try {
    const uri = buildMongoUri();
    await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${config.mongo.database}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// 连接错误处理
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('📤 MongoDB connection closed');
  process.exit(0);
});

module.exports = connectDatabase;
