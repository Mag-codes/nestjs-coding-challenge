# Employee Management API

NestJS v11 API for employee management with authentication, attendance tracking, and report generation.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Update `.env` with your database and Redis credentials.

4. Create the database:

```bash
createdb employee_management
```

5. Start the application:

```bash
npm run start:dev
```

The API runs at `http://localhost:3000`. Swagger docs at `http://localhost:3000/api`.

## Testing

```bash
npm run test
```

## API Overview

- **Auth**: Register, login, logout, forgot password, reset password
- **Employees**: CRUD (names, email, employeeIdentifier, phoneNumber)
- **Attendance**: Record arrival/departure; emails sent via queue
- **Reports**: PDF and Excel daily attendance reports

## Deployment

1. Set `NODE_ENV=production`
2. Set `synchronize: false` and use migrations for production DB
3. Configure all env vars from `.env.example`
4. Build: `npm run build`
5. Run: `npm run start:prod`
