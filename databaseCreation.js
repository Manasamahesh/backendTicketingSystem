const { Pool } = require("pg");

// PostgreSQL connection configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "Welcome1",
  port: 5432,
});

// Function to check if a database exists
async function doesDatabaseExist(databaseName) {
  const result = await pool.query(
    `SELECT EXISTS (SELECT 1
      FROM pg_database
      WHERE datname = '${databaseName}'
   )AS database_exists;`
  );
  return result;
}

// Function to check if a table exists
async function doesTableExist(tableName) {
  const result = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_name = $1",
    [tableName]
  );
  return result.rows.length > 0;
}

// Function to create the database
async function createDatabase(databaseName) {
  await pool.query(`CREATE DATABASE ${databaseName}`);
  console.log(`Database '${databaseName}' created`);
}

// Function to create the table
async function createTable(tableName) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS ${tableName} (
      ticketnumber VARCHAR(20) PRIMARY KEY,
      status VARCHAR(50),
      passengerDetails JSONB
  );
  `;
  await pool.query(createTableQuery);
  console.log("Table created");
}

// Run the setup
async function setup() {
  const databaseName = "ticketBookingDetails";
  const tableName = "ticketinfo";

  if (await doesDatabaseExist(databaseName)) {
    console.log("database already exists");
  } else {
    await createDatabase(databaseName);
  }

  // Switch to the newly created or existing database
  pool.options.database = databaseName;

  if (await doesTableExist(tableName)) {
    console.log("Table already exists");
  } else {
    await createTable(tableName);
    // await insertSampleData();
  }

  // Close the connection pool
  await pool.end();
}

// Execute the setup
setup().catch((err) => console.error(err));
