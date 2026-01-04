# Two-Tier Website Deployment on AWS using EC2, RDS and ALB

### Overview of Project ☁️
This project involves deploying a To-Do List web application using a two-tier architecture on AWS. The architecture is designed for scalability, security, and cost-effectiveness by leveraging EC2 instances for the application layer and Amazon RDS for the database layer, with an Application Load Balancer (ALB) to distribute traffic.

* Application Layer: Two EC2 instances host the Node.js application, ensuring high availability.
* Database Layer: Amazon RDS is used to manage a MySQL database, storing application data securely.
* Load Balancing & Routing: An Application Load Balancer (ALB) distributes incoming requests across both EC2 instances for fault tolerance.
* Security & Networking: Security Groups, IAM roles, and VPC configurations are implemented for secure communication between components.

### Services Used 🛠
* Amazon EC2: Hosts the web application on two instances for redundancy and performance. [Compute]
* Amazon RDS: Provides a managed relational database (MySQL) for application data. [Database]
* Application Load Balancer (ALB): Distributes traffic across EC2 instances for scalability and reliability. [Networking]
* Amazon VPC: Ensures secure networking with separate subnets for EC2 and RDS. [Networking]
* IAM Roles and Policies: Grants necessary permissions for secure interactions between services. [Security]
* Security Groups: Controls traffic flow between ALB, EC2, and RDS to enforce security. [Security]

### Architectural Diagram ✍️
<img width="1381" height="741" alt="image" src="https://github.com/user-attachments/assets/ab761bba-1257-4f74-89dd-652b1a75c8e1" />

### Estimated Time & Cost ⚙️
* This project is estimated to take about 2-3 hours
* Cost: Free Tier Eligible (ALB costs according to the usage time)

### Steps to be performed:
In the next few lessons, we'll be going through the following steps.

* Pre-requisites
* Setup VPC and Networking
* Database Layer - Setup RDS 
* Application Layer - Setup EC2 and Load balancer
