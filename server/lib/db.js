const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
  const localEnv = path.join(__dirname, '..', '.env.local');
  const prodEnv  = path.join(__dirname, '..', '.env');
  const envFile  = fs.existsSync(localEnv) ? localEnv : prodEnv;
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([\w_]+)\s*=\s*"([^"]*)"\s*$/);
      if (m) process.env[m[1]] = m[2];
    }
  }
}

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0,
});

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getConnection() {
  return pool.getConnection();
}

function getAnalyticsPool() {
  const p = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 1,
    queueLimit: 0,
  });
  return p;
}

module.exports = { pool, query, getConnection, getAnalyticsPool };