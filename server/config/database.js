import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'language_learning_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  multipleStatements: true,
  timezone: 'local',
  charset: 'utf8mb4',

  // 🔑 This part is required for secure cloud DBs
  ssl: {
    rejectUnauthorized: true,
    // If your provider (e.g. TiDB, PlanetScale) gave a CA cert:
    // ca: fs.readFileSync('./certs/ca.pem')
  }
});
