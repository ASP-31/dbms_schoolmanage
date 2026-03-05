// simple mysql2 connection pool wrapper
// adjust connection options for your environment

const mysql = require('mysql2');

// validate required database credentials at startup
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_NAME || 'school';

if (!user) {
  console.error('FATAL: environment variable DB_USER is not set');
  process.exit(1);
}
if (password === undefined) {
  // allow empty string but require variable presence for clarity
  console.error('FATAL: environment variable DB_PASSWORD is not set');
  process.exit(1);
}

const pool = mysql.createPool({
  host,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

module.exports = pool;
