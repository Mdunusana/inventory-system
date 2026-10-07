# Inventory Management System

A Spring Boot-based Inventory Management System designed to help businesses manage products, categories, and stock levels efficiently.

## Project Overview

This application provides a backend REST API for inventory management. It allows users to create, update, view, and manage products and categories while monitoring stock status.

The project was developed as part of a real-world software engineering initiative focused on solving business inventory management challenges.

## Features

### Category Management
- Create categories
- View categories
- Update categories
- Delete categories

### Product Management
- Create products
- View products
- Update product details
- Delete products
- Track product stock levels
- Assign products to categories

### Inventory Tracking
- Monitor stock quantities
- Determine stock status
- Manage inventory records efficiently

### Error Handling
- Global exception handling
- Resource not found handling
- Conflict validation handling

## Technologies Used

- Java 17+
- Spring Boot
- Spring Data JPA
- Maven
- MySQL
- REST API
- JUnit Testing

## Project Structure

```text
src
├── controller
├── service
├── repository
├── entity
├── dto
├── exception
└── test
```

### Layers

#### Controllers
Handle HTTP requests and API endpoints.

#### Services
Contain business logic and validation.

#### Repositories
Provide database access using Spring Data JPA.

#### Entities
Represent database tables.

#### DTOs
Transfer data between client and server.

## Database Setup

### Create Database

```sql
CREATE DATABASE inventory_db;
```

### Configure Application

Update the `application.properties` file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/inventory_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## Running the Application

### Clone the Repository

```bash
git clone https://github.com/Mdunusana/inventory-system.git
```

### Navigate to the Project

```bash
cd inventory-system
```

### Build the Project

```bash
mvn clean install
```

### Run the Application

```bash
mvn spring-boot:run
```

The application will start on:

```text
http://localhost:8080
```

## API Endpoints

### Categories

| Method | Endpoint |
|----------|----------|
| GET | /api/categories |
| GET | /api/categories/{id} |
| POST | /api/categories |
| PUT | /api/categories/{id} |
| DELETE | /api/categories/{id} |

### Products

| Method | Endpoint |
|----------|----------|
| GET | /api/products |
| GET | /api/products/{id} |
| POST | /api/products |
| PUT | /api/products/{id} |
| DELETE | /api/products/{id} |

## Testing

Run tests using:

```bash
mvn test
```

## Future Improvements

- User authentication and authorization
- Supplier management
- Inventory alerts
- Dashboard and reporting
- Barcode scanning
- Sales management
- Product image uploads

## Author

**Poshia Mdunusana**

Software Development Student

Focused on building software solutions that solve real-world business problems.

## License

This project is for educational and portfolio purposes.
