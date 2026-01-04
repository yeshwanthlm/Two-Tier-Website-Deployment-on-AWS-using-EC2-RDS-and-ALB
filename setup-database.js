require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  try {
    // Create connection to MySQL server (without specifying database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME}`);

    // Create Tasks table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS Tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        task_description TEXT,
        due_date DATE,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log('Tasks table created or already exists');

    // Test the connection by inserting a sample task
    const [result] = await connection.execute(
      'INSERT INTO Tasks (task_name, task_description, due_date) VALUES (?, ?, ?)',
      ['Test Task', 'This is a test task to verify database connection', '2024-12-31']
    );

    console.log('Sample task inserted successfully with ID:', result.insertId);

    // Fetch and display all tasks
    const [tasks] = await connection.execute('SELECT * FROM Tasks');
    console.log('Current tasks in database:', tasks);

    await connection.end();
    console.log('Database setup completed successfully!');

  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();