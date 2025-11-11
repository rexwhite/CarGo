# CarGo

Automotive Maintenance Tracker

## Overview

CarGo is a comprehensive web application for tracking vehicle information, maintenance schedules, and service history. Built with React frontend and Node.js/Express backend, using PostgreSQL for data persistence. Features include:

- Multi-vehicle management
- Service item scheduling (mileage and time-based intervals)
- Service history tracking with detailed notes
- Responsive UI with Bootstrap components

## Tech Stack

- **Frontend**: React 19, Bootstrap 5, React-Bootstrap
- **Backend**: Node.js, Express
- **Database**: PostgreSQL 16
- **Container**: Podman/Podman Compose
- **Testing**: Jest, Supertest

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

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Initialize Database

Run the database initialization and seeding:

```bash
cd backend
node db/init.js
```

This will:
- Drop and recreate tables: `cars`, `service_items`, `service_events`
- Seed sample data for 3 cars with service items and history

### 4. Build Frontend

```bash
cd frontend
npm run build
```

### 5. Start the Server

```bash
cd backend
npm start
```

The application will be available at `http://localhost:8000`

### Development Mode

For backend development with auto-reload:

```bash
cd backend
npm run dev
```

### Running Tests

```bash
cd backend
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## API Endpoints

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/:id` - Get a single car
- `POST /api/cars` - Create a new car
- `PUT /api/cars/:id` - Update a car
- `DELETE /api/cars/:id` - Delete a car

### Service Items
- `GET /api/service-items/car/:carId` - Get all service items for a car
- `GET /api/service-items/:id` - Get a single service item
- `POST /api/service-items` - Create a new service item
- `PUT /api/service-items/:id` - Update a service item
- `DELETE /api/service-items/:id` - Delete a service item

### Service Events
- `GET /api/service-events/service-item/:serviceItemId` - Get all events for a service item
- `GET /api/service-events/:id` - Get a single service event
- `POST /api/service-events` - Create a new service event
- `PUT /api/service-events/:id` - Update a service event
- `DELETE /api/service-events/:id` - Delete a service event

### Other
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

### Service Items Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| car_id | INTEGER | Foreign key to cars |
| title | VARCHAR(255) | Service item name |
| description | TEXT | Detailed description |
| mileage_interval | INTEGER | Miles between service |
| month_interval | INTEGER | Months between service |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

### Service Events Table

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| service_item_id | INTEGER | Foreign key to service_items |
| date | DATE | Date service was performed |
| mileage | INTEGER | Odometer reading |
| performed_by | VARCHAR(255) | Who performed the service |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Features

### Vehicle Management
- Add, edit, and delete vehicles
- Track make, model, year, and current mileage
- View detailed information for each vehicle

### Service Items
- Define maintenance tasks with descriptions
- Set mileage-based intervals (e.g., every 5,000 miles)
- Set time-based intervals (e.g., every 6 months)
- Track multiple service items per vehicle

### Service History
- Record service events with dates and mileage
- Add notes and track who performed the service
- View complete service history chronologically
- Link service events to specific service items

### User Interface
- Responsive Bootstrap-based design
- Navigation bar with logo branding
- Clickable table rows for easy navigation
- Visual feedback with hover effects
- Color-coded sections for better organization

## Project Structure

```
CarGo/
├── backend/
│   ├── api/
│   │   ├── cars.js              # Cars CRUD endpoints
│   │   ├── cars.test.js         # Cars tests
│   │   ├── service_items.js     # Service items CRUD endpoints
│   │   ├── service_items.test.js
│   │   ├── service_events.js    # Service events CRUD endpoints
│   │   ├── service_events.test.js
│   │   └── index.js             # API router
│   ├── db/
│   │   ├── pool.js              # PostgreSQL connection pool
│   │   ├── db_create.js         # Database schema
│   │   ├── db_seed.js           # Sample data
│   │   └── init.js              # Database initialization
│   ├── server.js                # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   │   ├── CarGo.png            # Application logo
│   │   └── index.html
│   ├── src/
│   │   ├── App.js               # Main React component
│   │   ├── App.css              # Application styles
│   │   └── index.js
│   └── package.json
├── podman-compose.yml           # PostgreSQL container config
└── README.md
```

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
