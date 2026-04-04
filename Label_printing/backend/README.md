# Label Printing System - Backend

Express.js backend for the Label Printing System.

## Prerequisites

- Node.js 16+
- PostgreSQL 14+
- npm or yarn hkjkj

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your PostgreSQL credentials:
```
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_NAME=label_printing
```

4. Create PostgreSQL database:
```bash
psql -U postgres -c "CREATE DATABASE label_printing"
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on: `http://localhost:5000`

## Database Setup

After Step 4 is complete, seed sample data:
```bash
npm run seed
```

## API Documentation

API will be available at: `http://localhost:5000/api/`

Endpoints:
- `/api/master/products` - Product management
- `/api/master/capacities` - Capacity management
- `/api/master/models` - Model management
- `/api/labels/` - Label operations
- `/api/serials/` - Serial number management
- `/api/reports/` - Print reports
- `/api/config` - System configuration

## Project Structure

```
src/
├── config/          - Database and environment config
├── controllers/     - Request handlers
├── models/          - Database queries
├── routes/          - API routes
├── middleware/      - Express middleware
├── utils/           - Helper functions
├── db/
│   └── migrations/  - Database schema files
└── index.js         - Server entry point
```
