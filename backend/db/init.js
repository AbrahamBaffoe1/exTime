const { exec } = require('child_process');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const {
  DB_USER = 'postgres',
  DB_PASSWORD = 'admin',
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'timeclock_db'
} = process.env;

async function initializeDatabase() {
  try {
    // First try to connect to PostgreSQL
    const pool = new Pool({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      database: 'postgres' // Connect to default database first
    });

    console.log('Checking PostgreSQL connection...');
    await pool.query('SELECT NOW()');
    console.log('Successfully connected to PostgreSQL');

    // Check if database exists
    const dbCheckResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DB_NAME]
    );

    if (dbCheckResult.rows.length === 0) {
      console.log(`Creating database ${DB_NAME}...`);
      await pool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }

    // Close connection to postgres database
    await pool.end();

    // Read and execute the schema file
    console.log('Applying database schema...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Connect to the new database
    const dbPool = new Pool({
      user: DB_USER,
      password: DB_PASSWORD,
      host: DB_HOST,
      port: DB_PORT,
      database: DB_NAME
    });

    // Execute schema
    await dbPool.query(schema);
    console.log('Schema applied successfully');

    // Close connection
    await dbPool.end();

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
