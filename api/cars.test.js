const request = require('supertest');
const express = require('express');
const carsRouter = require('./cars');

// Mock pool
const mockPool = {
  query: jest.fn(),
};

// Create test app
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/cars', carsRouter(mockPool));
  return app;
};

describe('GET /api/cars', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should return all cars', async () => {
    const mockCars = [
      { id: 1, make: 'Toyota', model: 'Camry', year: 2020, color: 'Blue', price: 25000 },
      { id: 2, make: 'Honda', model: 'Accord', year: 2021, color: 'Red', price: 28000 },
    ];

    mockPool.query.mockResolvedValue({ rows: mockCars });

    const response = await request(app).get('/api/cars');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCars);
    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM cars ORDER BY id');
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/cars');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch cars' });
  });
});

describe('GET /api/cars/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should return a single car by id', async () => {
    const mockCar = { id: 1, make: 'Toyota', model: 'Camry', year: 2020, color: 'Blue', price: 25000 };

    mockPool.query.mockResolvedValue({ rows: [mockCar] });

    const response = await request(app).get('/api/cars/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockCar);
    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM cars WHERE id = $1', ['1']);
  });

  test('should return 404 if car not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app).get('/api/cars/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Car not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/cars/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch car' });
  });
});

describe('POST /api/cars', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should create a new car', async () => {
    const newCar = { name: 'Stang', make: 'Ford', model: 'Mustang', year: 2022, mileage: 5000, vin: '12345678901234567', license_plate: 'PLATE1' };
    const createdCar = { id: 3, ...newCar };

    mockPool.query.mockResolvedValue({ rows: [createdCar] });

    const response = await request(app)
      .post('/api/cars')
      .send(newCar);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdCar);
    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO cars (name, make, model, year, mileage, vin, license_plate) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newCar.name, newCar.make, newCar.model, newCar.year, newCar.mileage, newCar.vin, newCar.license_plate]
    );
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/cars')
      .send({ name: 'Stang', make: 'Ford', model: 'Mustang', year: 2022, mileage: 5000 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to create car' });
  });
});

describe('PUT /api/cars/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should update an existing car', async () => {
    const updatedCar = { id: 1, name: 'Daily Driver', make: 'Toyota', model: 'Camry', year: 2021, mileage: 26000, vin: 'VIN123', license_plate: 'ABC-123' };

    mockPool.query.mockResolvedValue({ rows: [updatedCar] });

    const response = await request(app)
      .put('/api/cars/1')
      .send({ name: 'Daily Driver', make: 'Toyota', model: 'Camry', year: 2021, mileage: 26000, vin: 'VIN123', license_plate: 'ABC-123' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedCar);
    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE cars SET name = $1, make = $2, model = $3, year = $4, mileage = $5, vin = $6, license_plate = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
      ['Daily Driver', 'Toyota', 'Camry', 2021, 26000, 'VIN123', 'ABC-123', '1']
    );
  });

  test('should return 404 if car not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .put('/api/cars/999')
      .send({ name: 'Daily Driver', make: 'Toyota', model: 'Camry', year: 2021, mileage: 26000 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Car not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .put('/api/cars/1')
      .send({ name: 'Daily Driver', make: 'Toyota', model: 'Camry', year: 2021, mileage: 26000 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to update car' });
  });
});

describe('DELETE /api/cars/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should delete an existing car', async () => {
    const deletedCar = { id: 1, make: 'Toyota', model: 'Camry', year: 2020, color: 'Blue', price: 25000 };

    mockPool.query.mockResolvedValue({ rows: [deletedCar] });

    const response = await request(app).delete('/api/cars/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Car deleted successfully', car: deletedCar });
    expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM cars WHERE id = $1 RETURNING *', ['1']);
  });

  test('should return 404 if car not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app).delete('/api/cars/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Car not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).delete('/api/cars/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to delete car' });
  });
});
