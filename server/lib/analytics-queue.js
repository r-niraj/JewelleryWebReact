const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

let analyticsPool = null;
let queue = [];
let flushTimer = null;
const MAX_QUEUE_SIZE = 1000;
const FLUSH_INTERVAL = 5000;

function getAnalyticsPool() {
  if (analyticsPool) return analyticsPool;
  if (!process.env.DATABASE_URL) {
    const localEnv = path.join(__dirname, '..', '.env.local');
    const prodEnv = path.join(__dirname, '..', '.env');
    const envFile = fs.existsSync(localEnv) ? localEnv : prodEnv;
    if (fs.existsSync(envFile)) {
      const lines = fs.readFileSync(envFile, 'utf8').split('\n');
      for (const line of lines) {
        const m = line.match(/^\s*([\w_]+)\s*=\s*"([^"]*)"\s*$/);
        if (m) process.env[m[1]] = m[2];
      }
    }
  }
  analyticsPool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
  return analyticsPool;
}

function enqueue(table, data) {
  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.shift();
  }
  queue.push({ table, data, timestamp: Date.now() });
  if (!flushTimer) {
    flushTimer = setTimeout(flush, FLUSH_INTERVAL);
  }
}

async function flush() {
  flushTimer = null;
  if (queue.length === 0) return;
  const batch = queue.splice(0, Math.min(queue.length, 100));
  const pool = getAnalyticsPool();
  let connection;
  try {
    connection = await pool.getConnection();
    for (const item of batch) {
      try {
        const keys = Object.keys(item.data);
        const vals = keys.map((k) => item.data[k]);
        const placeholders = keys.map(() => '?').join(', ');
        const cols = keys.map((k) => '`' + k + '`').join(', ');
        await connection.execute(
          `INSERT INTO \`${item.table}\` (${cols}) VALUES (${placeholders})`,
          vals
        );
      } catch (err) {
        console.error('Analytics queue insert error:', err.message);
      }
    }
  } catch (err) {
    console.error('Analytics queue flush error:', err.message);
  } finally {
    if (connection) connection.release();
  }
}

function shutdown() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  if (queue.length > 0) {
    flush();
  }
  if (analyticsPool) {
    analyticsPool.end().catch(() => {});
  }
}

module.exports = { enqueue, shutdown };
