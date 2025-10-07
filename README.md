# Gokaasa API

A robust NestJS-based REST API with authentication, authorization, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user CRUD operations with role and permission assignment
- **Role Management**: Dynamic role creation and permission assignment
- **Permission System**: Granular permission-based access control
- **Product Management**: Product CRUD operations
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Swagger/OpenAPI documentation
- **Production Ready**: PM2 ecosystem configuration for deployment

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd api.gokaasa.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=kartlog_db
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=24h
   
   # App
   PORT=3000
   NODE_ENV=development
   ```

4. **Generate JWT Keys** (if not already generated)
   ```bash
   # Generate private key
   openssl genrsa -out keys/private.key 2048
   
   # Generate public key from private key
   openssl rsa -in keys/private.key -pubout -out keys/public.key
   ```

5. **Database Setup**
   ```bash
   # Create database
   createdb kartlog_db
   
   # Run migrations (if using TypeORM migrations)
   npm run migration:run
   ```

6. **Build the application**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Using PM2
```bash
# Start with PM2
pm2 start ecosystem.config.js

# Start in production mode
pm2 start ecosystem.config.js --env production

# Monitor processes
pm2 monit

# View logs
pm2 logs kartlog-api
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token",
  "password": "newpassword123"
}
```

### User Management

#### Get All Users
```http
GET /users
Authorization: Bearer <jwt_token>
```

#### Get User by ID
```http
GET /users/:id
Authorization: Bearer <jwt_token>
```

#### Create User
```http
POST /users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Update User
```http
PUT /users/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "Updated Name",
  "lastName": "Updated Last"
}
```

#### Assign Role to User
```http
POST /users/:id/assign-role
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "roleId": "role-uuid"
}
```

#### Assign Permission to User
```http
POST /users/:id/assign-permission
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "permissionId": "permission-uuid"
}
```

### Role Management

#### Get All Roles
```http
GET /roles
Authorization: Bearer <jwt_token>
```

#### Create Role
```http
POST /roles
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "admin",
  "description": "Administrator role"
}
```

#### Assign Permission to Role
```http
POST /roles/:id/assign-permission
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "permissionId": "permission-uuid"
}
```

### Permission Management

#### Get All Permissions
```http
GET /permissions
Authorization: Bearer <jwt_token>
```

#### Create Permission
```http
POST /permissions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "create:users",
  "description": "Create users permission"
}
```

### Product Management

#### Get All Products
```http
GET /products
Authorization: Bearer <jwt_token>
```

#### Create Product
```http
POST /products
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99
}
```

## 🔐 Authentication & Authorization

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control

The system supports:
- **Roles**: Groups of permissions (e.g., admin, user, moderator)
- **Permissions**: Granular access controls (e.g., create:users, read:products)
- **User-Role Assignment**: Users can have multiple roles
- **User-Permission Assignment**: Direct permission assignment to users

## 🗄️ Database Schema

### Core Entities

- **Users**: User accounts with authentication
- **Roles**: Role definitions
- **Permissions**: Permission definitions
- **UserRoles**: Many-to-many relationship between users and roles
- **RolePermissions**: Many-to-many relationship between roles and permissions
- **UserPermissions**: Direct user-permission assignments
- **Products**: Product management

## 🚀 Deployment

### Using PM2

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Monitor the application**
   ```bash
   pm2 monit
   ```

### Environment Variables

Make sure to set the following environment variables in production:

```env
NODE_ENV=production
DB_HOST=your_db_host
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=24h
PORT=3000
```

## 📝 Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run tests
npm run test:e2e          # Run end-to-end tests
npm run test:cov          # Run tests with coverage

# Database
npm run migration:generate # Generate migration
npm run migration:run     # Run migrations
npm run migration:revert  # Revert last migration

# Linting
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint issues
```

## Unified Seeder Script

The project now uses a single unified seeder script: `src/seeder.ts`.

### What it does
- Seeds permissions, roles (with permissions), and users (with roles and permissions) in a single run.
- If a record exists (by unique field: name for permissions/roles, email for users), it updates the record instead of skipping or throwing.
- Assigns permissions to roles, and roles/permissions to users as specified.
- Assigns all permissions to all `super_admin` users.
- Logs a summary at the end.

### How to run

```
npx ts-node src/seeder.ts
```

> **Note:** The old `user-seeder.ts` and `permission-seeder.ts` files are now obsolete and have been removed. Use only `seeder.ts` for all seeding operations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@gokaasa.com or create an issue in the repository.

## 🔗 Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 