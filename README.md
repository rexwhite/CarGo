# CarGo

Automotive Maintenance Tracker

## Overview

CarGo is a web application for tracking vehicle information and maintenance records. Built with React frontend and Node.js/Express backend, using PostgreSQL for data persistence.

## Tech Stack

- **Frontend**: React 19
- **Backend**: Node.js, Express
- **Database**: PostgreSQL 16
- **Container**: Podman/Podman Compose

## Prerequisites

- Node.js (v14 or higher)
- npm
- Podman and podman-compose

## Setup

### 1. Start PostgreSQL Database

```bash
podman-compose up -d
```

This starts PostgreSQL on port 5432 with the following credentials:
- Database: `cargo_db`
- User: `cargo_user`
- Password: `cargo_password`

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Build Frontend

```bash
cd frontend
npm run build
```

### 5. Start the Server

```bash
cd backend
node server.js
```

The application will be available at `http://localhost:8000`

## API Endpoints

- `GET /api/cars` - Get all cars
- `GET /api/hello` - Health check endpoint

## Database Schema

### Cars Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Car nickname |
| make | VARCHAR(100) | Manufacturer |
| model | VARCHAR(100) | Model name |
| year | INTEGER | Year of manufacture |
| mileage | INTEGER | Current mileage |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Development

The backend serves the built React frontend as static files. For development:

1. Make changes to frontend code in `frontend/src/`
2. Rebuild the frontend: `npm run build` (in frontend directory)
3. Restart the backend server

## Environment Variables

The backend supports the following environment variables:

- `PORT` - Server port (default: 8000)
- `DB_USER` - Database user (default: cargo_user)
- `DB_HOST` - Database host (default: localhost)
- `DB_NAME` - Database name (default: cargo_db)
- `DB_PASSWORD` - Database password (default: cargo_password)
- `DB_PORT` - Database port (default: 5432)

## License

MIT
