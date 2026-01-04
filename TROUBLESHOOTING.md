# Troubleshooting Guide for Task Addition Issue

## Steps to Fix the Task Addition Problem

### 1. Update Environment Variables
Edit the `.env` file with your actual database credentials:

```env
# Database Configuration
DB_HOST=todo-instance.cq2lvy7ktbcg.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=YOUR_ACTUAL_PASSWORD
DB_NAME=todo_db

# API Configuration  
API_BASE_URL=http://3.236.38.110:3000
```

**Important:** Replace `YOUR_ACTUAL_PASSWORD` with your RDS database password.

### 2. Set Up Database Schema
Run the database setup script to ensure your database and table exist:

```bash
node setup-database.js
```

This will:
- Create the database if it doesn't exist
- Create the Tasks table with proper schema
- Insert a test task to verify connectivity

### 3. Test Database Connection
Start your application and check the console output:

```bash
npm start
```

Look for:
- ✅ Database connection successful
- Or ❌ Database connection failed with error details

### 4. Common Issues and Solutions

#### Issue: Connection Timeout
**Symptoms:** Database connection fails with timeout error
**Solutions:**
- Check RDS security group allows inbound connections on port 3306 from your EC2 instance
- Verify RDS instance is in the same VPC as EC2 or properly configured for external access
- Ensure RDS instance is publicly accessible if connecting from outside VPC

#### Issue: Authentication Failed
**Symptoms:** Access denied error
**Solutions:**
- Verify username and password in `.env` file
- Check if the database user has proper permissions
- Ensure the database name exists

#### Issue: Table Doesn't Exist
**Symptoms:** "Table 'Tasks' doesn't exist" error
**Solutions:**
- Run `node setup-database.js` to create the table
- Manually create the table using MySQL client

#### Issue: CORS Errors
**Symptoms:** Frontend can't connect to backend API
**Solutions:**
- Ensure CORS is enabled (already done in code)
- Check if API_BASE_URL in frontend matches your EC2 public IP
- Verify EC2 security group allows inbound traffic on port 3000

### 5. Manual Database Setup (if needed)

If the setup script fails, manually create the database and table:

```sql
CREATE DATABASE IF NOT EXISTS todo_db;
USE todo_db;

CREATE TABLE IF NOT EXISTS Tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 6. Testing Steps

1. **Test Database Connection:**
   ```bash
   node setup-database.js
   ```

2. **Start Application:**
   ```bash
   npm start
   ```

3. **Test API Endpoints:**
   ```bash
   # Test GET tasks
   curl http://3.236.38.110:3000/tasks
   
   # Test POST task
   curl -X POST http://3.236.38.110:3000/tasks \
     -H "Content-Type: application/json" \
     -d '{"taskName":"Test Task","dueDate":"2024-12-31"}'
   ```

4. **Check Browser Console:**
   - Open browser developer tools
   - Check Console tab for JavaScript errors
   - Check Network tab for failed API requests

### 7. Security Group Configuration

Ensure your AWS security groups are configured correctly:

**EC2 Security Group:**
- Inbound: Port 3000 from 0.0.0.0/0 (or your specific IP range)
- Inbound: Port 22 for SSH access
- Outbound: All traffic

**RDS Security Group:**
- Inbound: Port 3306 from EC2 security group (or EC2 private IP)
- Outbound: Not required for RDS

### 8. Environment Variables on EC2

When deploying to EC2, ensure the `.env` file is present and has correct values:

```bash
# On EC2 instance
cat .env
# Should show your database configuration
```

If environment variables aren't loading, you can also set them directly:

```bash
export DB_HOST=todo-instance.cq2lvy7ktbcg.us-east-1.rds.amazonaws.com
export DB_USER=admin
export DB_PASSWORD=your_password
export DB_NAME=todo_db
export API_BASE_URL=http://3.236.38.110:3000
```