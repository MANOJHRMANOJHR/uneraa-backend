import IORedis from 'ioredis';

//for development, use a local Redis instance 
// or a cloud Redis service like Upstash

const redis = new IORedis(process.env.UPSTASH_REDIS_URL || 'redis://localhost:6379');


// for production, use environment variables to configure Redis connection
// const redis = new IORedis({
//   host: process.env.REDIS_HOST,
//   port: parseInt(process.env.REDIS_PORT || '6379', 10),
//   username: process.env.REDIS_USERNAME,
//   password: process.env.REDIS_PASSWORD,
// });

// Connection success
redis.on('connect', () => {
  console.log('Redis connected successfully');
});

// Connection error
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
  process.exit(1);
});

export default redis;