# PearlOfLife - Complete Project Documentation

## Overview

PearlOfLife is a full-stack application with Angular frontend and NestJS backend, migrated from Sequelize/MSSQL to TypeORM/MySQL with comprehensive features including PayPal integration, role-based access control, and content management.

## Project Structure

```
PearlOfLife/
├── angular/          # Angular frontend application
├── backend/          # NestJS backend application
└── README.md         # This file
```

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Angular CLI (for frontend)

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Database Configuration

Create a MySQL database:

```sql
CREATE DATABASE pearloflife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=pearloflife

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRY_IN_MINS=30

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # or 'live' for production

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
EMAIL_FROM=noreply@pearlsoflife.com
ADMIN_EMAIL=admin@pearlsoflife.com

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Run Migrations

```bash
# Using TypeORM CLI (if configured)
npm run typeorm migration:run

# Or manually run the migration file
# The migration is located at: backend/src/migrations/1700000000000-InitialMigration.ts
```

### 5. Seed Database (Optional)

```bash
# Run the seeder to create initial data
npm run seed
# Or manually import the seed file: backend/src/seeders/seed.ts
```

### 6. Start Backend Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The backend will be available at `http://localhost:3000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd angular
npm install
```

### 2. Environment Configuration

Update `angular/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### 3. Start Frontend Server

```bash
# Development mode
npm start

# Production build
npm run build
```

The frontend will be available at `http://localhost:4200`

## Default Admin Credentials

After running the seeder:

- **Email:** admin@pearlsoflife.com
- **Password:** admin123

## Default Test User

- **Email:** user@example.com
- **Password:** user123

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/keyholder` - KeyHolder login

### Users
- `GET /users/me` - Get current user
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/me` - Terminate account
- `GET /users/plan` - Get user's subscription plan

### Payments
- `GET /payments/subscription-plans` - Get all subscription plans
- `GET /payments/my-subscription` - Get current subscription
- `POST /payments/create-order` - Create PayPal order
- `POST /payments/capture-order` - Capture PayPal payment
- `POST /payments/cancel-subscription` - Cancel subscription
- `POST /payments/webhook` - PayPal webhook endpoint

### Legacy/Uploads
- `POST /legacy/video/upload` - Upload video file
- `POST /legacy/video` - Create video link (YouTube/Vimeo)
- `POST /legacy/image/upload` - Upload image
- `POST /legacy/note` - Create note
- `GET /legacy/content` - Get all content

### KeyHolders
- `POST /key-holders` - Create KeyHolder
- `GET /key-holders` - Get all KeyHolders
- `GET /key-holders/:id` - Get KeyHolder by ID

### Admin
- `GET /users/manage/list` - Get all users (paginated)
- `PUT /users/:userId/role` - Update user role
- `PUT /users/:userId/block` - Block user
- `PUT /users/:userId/unblock` - Unblock user

## Postman Collection

Import the `PearlOfLife_Postman_Collection.json` file into Postman to test all API endpoints.

### Setup Postman Variables:
1. `baseUrl`: `http://localhost:3000`
2. `accessToken`: (Will be set after login)

## Features Implemented

### ✅ Database Migration
- Migrated from Sequelize/MSSQL to TypeORM/MySQL
- Created TypeORM entities for all models
- Added migrations and seeders

### ✅ PayPal Integration
- Create order endpoint
- Capture order endpoint
- Cancel subscription endpoint
- Webhook handling
- Auto subscription billing

### ✅ Role-Based Access Control
- USER, ADMIN, KEYHOLDER roles
- Role guards and decorators
- KeyHolder restrictions (view-only)

### ✅ Account Termination
- Email notifications (user + company)
- PayPal subscription cancellation
- Account deactivation
- Login prevention

### ✅ Upload Features
- Video upload (file)
- Video links (YouTube/Vimeo)
- Image upload
- Notes creation
- Audio upload support

### ✅ Plan Limits
- Max video length enforcement
- Max images limit
- Max uploads limit
- Subscription-based restrictions

## Admin Panel

The admin panel is accessible at `/admin` route in Angular.

### Admin Login:
- URL: `http://localhost:4200/admin/login`
- Default Credentials:
  - Email: `admin@pearloflife.com`
  - Password: `Admin@123`

### Admin Features:
- **Dashboard**: Overview with stats (users, key holders, subscriptions, revenue)
- **User Management**: View, search, filter, activate/deactivate/terminate users
- **Key Holders**: View and manage all key holders
- **Uploads**: View and manage all uploaded content (videos, images, audio, notes)
- **Plans**: Create, update, delete subscription plans with limits
- **Subscriptions**: View, cancel, and change user subscriptions
- **Payments**: View all PayPal transactions and payment history
- **Email Logs**: View all sent emails with filters
- **Settings**: Configure system settings (PayPal, email, file uploads)

### Admin APIs:
All admin APIs are prefixed with `/admin` and require admin role:
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/users` - List users with filters
- `GET /admin/users/:id` - Get user details
- `PATCH /admin/users/:id/activate` - Activate user
- `PATCH /admin/users/:id/deactivate` - Deactivate user
- `PATCH /admin/users/:id/terminate` - Terminate user
- `GET /admin/keyholders` - List key holders
- `DELETE /admin/keyholders/:id` - Delete key holder
- `GET /admin/uploads` - List uploads with filters
- `DELETE /admin/uploads/:id` - Delete upload
- `GET /admin/plans` - List all plans
- `POST /admin/plans` - Create plan
- `PATCH /admin/plans/:id` - Update plan
- `DELETE /admin/plans/:id` - Delete plan
- `GET /admin/subscriptions` - List subscriptions
- `PATCH /admin/subscriptions/:id/cancel` - Cancel subscription
- `PATCH /admin/subscriptions/:id/change-plan` - Change subscription plan
- `GET /admin/payments` - List payments with filters
- `GET /admin/email-logs` - List email logs with filters

## KeyHolder Access

KeyHolders have restricted access:
- ✅ Can view and download allowed content
- ❌ Cannot edit, update, delete, or modify account
- ❌ Cannot upload new content

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### PayPal Integration Issues
- Verify PayPal credentials in `.env`
- Check PayPal mode (sandbox/live)
- Ensure PayPal app is configured correctly

### Migration Issues
- Ensure database is empty or backup existing data
- Check TypeORM configuration
- Verify entity definitions match database schema

## Development Notes

### TypeScript Errors
Run `npm run build` to check for TypeScript errors in both frontend and backend.

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd angular
npm run lint
```

## Production Deployment

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Build both frontend and backend
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure PayPal for live mode

## Support

For issues or questions, contact the development team.

## License

[Your License Here]

