require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS (Allows frontend to communicate with backend)
app.use(cors());

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Database connection setup with production-ready configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 30000,
  timeout: 30000,
};

console.log('Database configuration:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

const db = mysql.createPool(dbConfig);

// Database connection state
let dbConnected = false;

// Test database connection on startup
async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    const [rows] = await db.execute('SELECT 1 as test');
    console.log('✅ Database connection successful');
    dbConnected = true;
    
    // Ensure database and table exist
    await ensureDatabaseSetup();
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    dbConnected = false;
    
    // Continue running server even if DB is not connected
    // This allows health checks and debugging
    console.log('⚠️  Server will continue running without database connection');
  }
}

// Ensure database and table exist
async function ensureDatabaseSetup() {
  try {
    // Check if Tasks table exists
    const [tables] = await db.execute("SHOW TABLES LIKE 'Tasks'");
    if (tables.length === 0) {
      console.log('Creating Tasks table...');
      const createTableQuery = `
        CREATE TABLE Tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          task_name VARCHAR(255) NOT NULL,
          task_description TEXT,
          due_date DATE,
          completed BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      await db.execute(createTableQuery);
      console.log('✅ Tasks table created successfully');
    } else {
      console.log('✅ Tasks table exists');
    }
  } catch (error) {
    console.error('❌ Failed to setup database:', error.message);
  }
}

// Middleware to check database connection
function requireDB(req, res, next) {
  if (!dbConnected) {
    return res.status(503).json({ 
      error: 'Database not available', 
      message: 'Please check database connection and try again' 
    });
  }
  next();
}

// Expose API URL to frontend
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${port}`;
app.get('/config', (req, res) => {
  res.json({ API_BASE_URL });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'disconnected',
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT: port,
      API_BASE_URL: API_BASE_URL
    }
  };

  try {
    await db.execute('SELECT 1');
    health.database = 'connected';
    dbConnected = true;
  } catch (error) {
    health.database = 'disconnected';
    health.database_error = error.message;
    dbConnected = false;
  }

  const statusCode = health.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Create a new task
app.post('/tasks', requireDB, async (req, res) => {
  const { taskName, taskDescription, dueDate } = req.body;

  console.log('Received task creation request:', { taskName, taskDescription, dueDate });

  if (!taskName || taskName.trim() === '') {
    return res.status(400).json({ error: 'Task name is required' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO Tasks (task_name, task_description, due_date) VALUES (?, ?, ?)',
      [taskName.trim(), taskDescription || null, dueDate || null]
    );

    console.log('✅ Task created successfully with ID:', result.insertId);
    res.status(201).json({ 
      message: 'Task created successfully', 
      taskId: result.insertId,
      task: {
        id: result.insertId,
        task_name: taskName.trim(),
        task_description: taskDescription || null,
        due_date: dueDate || null,
        completed: false
      }
    });
  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ 
      error: 'Could not create task', 
      details: error.message,
      code: error.code 
    });
  }
});

// Get all tasks
app.get('/tasks', requireDB, async (req, res) => {
  try {
    console.log('Fetching all tasks...');
    const [tasks] = await db.query('SELECT * FROM Tasks ORDER BY created_at DESC');
    console.log(`✅ Retrieved ${tasks.length} tasks`);
    res.status(200).json(tasks);
  } catch (error) {
    console.error('❌ Error getting tasks:', error);
    res.status(500).json({ 
      error: 'Could not fetch tasks', 
      details: error.message 
    });
  }
});

// Get a task by ID
app.get('/tasks/:id', requireDB, async (req, res) => {
  const { id } = req.params;

  try {
    const [task] = await db.query('SELECT * FROM Tasks WHERE id = ?', [id]);
    if (task.length > 0) {
      res.status(200).json(task[0]);
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('❌ Error getting task:', error);
    res.status(500).json({ 
      error: 'Could not fetch task', 
      details: error.message 
    });
  }
});

// Update a task
app.put('/tasks/:id', requireDB, async (req, res) => {
  const { id } = req.params;
  const { taskName, taskDescription, dueDate, completed } = req.body;

  try {
    const query = `
      UPDATE Tasks 
      SET task_name = COALESCE(?, task_name), 
          task_description = COALESCE(?, task_description), 
          due_date = COALESCE(?, due_date), 
          completed = COALESCE(?, completed)
      WHERE id = ?
    `;

    const [result] = await db.execute(query, [
      taskName || null, 
      taskDescription || null, 
      dueDate || null, 
      completed !== undefined ? (completed ? 1 : 0) : null, 
      id
    ]);

    if (result.affectedRows > 0) {
      console.log(`✅ Task ${id} updated successfully`);
      res.status(200).json({ message: 'Task updated successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('❌ Error updating task:', error);
    res.status(500).json({ 
      error: 'Could not update task', 
      details: error.message 
    });
  }
});

// Delete a task
app.delete('/tasks/:id', requireDB, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.execute('DELETE FROM Tasks WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      console.log(`✅ Task ${id} deleted successfully`);
      res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    res.status(500).json({ 
      error: 'Could not delete task', 
      details: error.message 
    });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully');
  await db.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully');
  await db.end();
  process.exit(0);
});

// Test database connection when server starts
testDatabaseConnection();

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📡 API Base URL: ${API_BASE_URL}`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});
