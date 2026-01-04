# Two-Tier Todo Application

A production-ready two-tier web application built with Node.js, Express, and MySQL, designed for deployment on AWS EC2 with RDS database and Application Load Balancer.

## Architecture

- **Frontend**: HTML, CSS, JavaScript (served as static files)
- **Backend**: Node.js with Express.js REST API
- **Database**: MySQL (AWS RDS)
- **Load Balancer**: AWS Application Load Balancer
- **Hosting**: AWS EC2 instances

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Task completion tracking
- ✅ Due date management
- ✅ Production-ready error handling
- ✅ Health check endpoint for load balancer
- ✅ Automatic database table creation
- ✅ Graceful shutdown handling
- ✅ Connection pooling and retry logic

## Production Deployment

### Prerequisites

1. AWS EC2 instance with Node.js installed
2. AWS RDS MySQL instance
3. Application Load Balancer configured
4. Security groups properly configured

### Environment Configuration

Create a `.env` file with your database credentials:

```env
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=TodoAppDB
DB_PORT=3306
API_BASE_URL=http://your-alb-dns-name.region.elb.amazonaws.com
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Two-Tier-Website-Deployment-on-AWS-using-EC2-RDS-and-ALB

# Install dependencies
npm install

# Start the application
npm start
```

### Health Check

The application provides a health check endpoint at `/health` for load balancer monitoring.

### API Endpoints

- `GET /health` - Health check
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/:id` - Get task by ID
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Security Considerations

- Environment variables are used for sensitive configuration
- CORS is enabled for cross-origin requests
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- Graceful error handling without exposing internal details

## Monitoring

- Application logs include detailed error information
- Health check endpoint for load balancer monitoring
- Database connection status tracking
- Automatic reconnection handling

## AWS Architecture

### Services Used 🛠
* Amazon EC2: Hosts the web application on two instances for redundancy and performance
* Amazon RDS: Provides a managed relational database (MySQL) for application data
* Application Load Balancer (ALB): Distributes traffic across EC2 instances for scalability and reliability
* Amazon VPC: Ensures secure networking with separate subnets for EC2 and RDS
* IAM Roles and Policies: Grants necessary permissions for secure interactions between services
* Security Groups: Controls traffic flow between ALB, EC2, and RDS to enforce security