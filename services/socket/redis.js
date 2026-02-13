const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL);
const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);

sub.subscribe("socket:broadcast", (err, count) => {
  if (err) {
    console.error("Failed to subscribe: %s", err.message);
  }
});

/**
 * Helper to add user to pool
 * @param {string} gender - 'boys' or 'girls'
 * @param {string} socketId - Socket ID
 * @param {object} userData - User data object
 */
async function addToPool(gender, socketId, userData) {
  const pipeline = redis.pipeline();
  pipeline.sadd(`pool:${gender}`, socketId);
  pipeline.set(`user:${socketId}`, JSON.stringify(userData));
  // Expire user data after 1 hour to prevent stale data leak
  pipeline.expire(`user:${socketId}`, 3600);
  await pipeline.exec();
}

/**
 * Remove user from pool and cleanup
 * @param {string} socketId - Socket ID
 */
async function removeFromPool(socketId) {
  const userData = await redis.get(`user:${socketId}`);
  if (!userData) return;

  const user = JSON.parse(userData);
  const gender = user.gender === 0 ? "boys" : "girls";

  const pipeline = redis.pipeline();
  pipeline.srem(`pool:${gender}`, socketId);
  pipeline.del(`user:${socketId}`);
  await pipeline.exec();
  
  return user;
}

/**
 * Get all users in a pool with their data
 * @param {string} gender - 'boys' or 'girls'
 */
async function getPoolUsers(gender) {
  const socketIds = await redis.smembers(`pool:${gender}`);
  if (socketIds.length === 0) return [];

  const pipeline = redis.pipeline();
  socketIds.forEach((id) => pipeline.get(`user:${id}`));
  const results = await pipeline.exec();

  return results
    .map(([err, data], index) => {
      if (err || !data) return null;
      const user = JSON.parse(data);
      return { socketId: socketIds[index], user };
    })
    .filter((u) => u !== null);
}

/**
 * Atomic lock for matchmaking
 * @param {string} lockKey 
 * @param {number} ttlMs 
 * @returns {boolean} true if lock acquired
 */
async function acquireLock(lockKey, ttlMs) {
  // SET resource_name my_random_value NX PX 30000
  const res = await redis.set(lockKey, "LOCKED", "NX", "PX", ttlMs);
  return res === "OK";
}

module.exports = {
  redis,
  pub,
  sub,
  addToPool,
  removeFromPool,
  getPoolUsers,
  acquireLock,
};
