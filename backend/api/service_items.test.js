const request = require('supertest');
const express = require('express');
const serviceItemsRouter = require('./service_items');

// Mock pool
const mockPool = {
  query: jest.fn(),
};

// Create test app
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/service-items', serviceItemsRouter(mockPool));
  return app;
};

describe('GET /api/service-items/car/:carId', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should return all service items for a car', async () => {
    const mockItems = [
      { id: 1, car_id: 1, title: 'Oil Change', description: 'Regular oil change', mileage_interval: 5000, month_interval: 6 },
      { id: 2, car_id: 1, title: 'Tire Rotation', description: 'Rotate tires', mileage_interval: 7500, month_interval: null },
    ];

    mockPool.query.mockResolvedValue({ rows: mockItems });

    const response = await request(app).get('/api/service-items/car/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockItems);
    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT * FROM service_items WHERE car_id = $1 ORDER BY id',
      ['1']
    );
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/service-items/car/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch service items' });
  });
});

describe('GET /api/service-items/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should return a single service item by id', async () => {
    const mockItem = { id: 1, car_id: 1, title: 'Oil Change', description: 'Regular oil change', mileage_interval: 5000, month_interval: 6 };

    mockPool.query.mockResolvedValue({ rows: [mockItem] });

    const response = await request(app).get('/api/service-items/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockItem);
    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM service_items WHERE id = $1', ['1']);
  });

  test('should return 404 if service item not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app).get('/api/service-items/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service item not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/service-items/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch service item' });
  });
});

describe('POST /api/service-items', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should create a new service item', async () => {
    const newItem = { car_id: 1, title: 'Brake Inspection', description: 'Check brake pads', mileage_interval: 10000, month_interval: 12 };
    const createdItem = { id: 3, ...newItem };

    mockPool.query.mockResolvedValue({ rows: [createdItem] });

    const response = await request(app)
      .post('/api/service-items')
      .send(newItem);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdItem);
    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO service_items (car_id, title, description, mileage_interval, month_interval) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newItem.car_id, newItem.title, newItem.description, newItem.mileage_interval, newItem.month_interval]
    );
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/service-items')
      .send({ car_id: 1, title: 'Brake Inspection', description: 'Check brake pads', mileage_interval: 10000, month_interval: 12 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to create service item' });
  });
});

describe('PUT /api/service-items/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should update an existing service item', async () => {
    const updatedItem = { id: 1, car_id: 1, title: 'Oil Change', description: 'Synthetic oil change', mileage_interval: 7500, month_interval: 6 };

    mockPool.query.mockResolvedValue({ rows: [updatedItem] });

    const response = await request(app)
      .put('/api/service-items/1')
      .send({ title: 'Oil Change', description: 'Synthetic oil change', mileage_interval: 7500, month_interval: 6 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedItem);
    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE service_items SET title = $1, description = $2, mileage_interval = $3, month_interval = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      ['Oil Change', 'Synthetic oil change', 7500, 6, '1']
    );
  });

  test('should return 404 if service item not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .put('/api/service-items/999')
      .send({ title: 'Oil Change', description: 'Synthetic oil change', mileage_interval: 7500, month_interval: 6 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service item not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .put('/api/service-items/1')
      .send({ title: 'Oil Change', description: 'Synthetic oil change', mileage_interval: 7500, month_interval: 6 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to update service item' });
  });
});

describe('DELETE /api/service-items/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should delete an existing service item', async () => {
    const deletedItem = { id: 1, car_id: 1, title: 'Oil Change', description: 'Regular oil change', mileage_interval: 5000, month_interval: 6 };

    mockPool.query.mockResolvedValue({ rows: [deletedItem] });

    const response = await request(app).delete('/api/service-items/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Service item deleted successfully', service_item: deletedItem });
    expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM service_items WHERE id = $1 RETURNING *', ['1']);
  });

  test('should return 404 if service item not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app).delete('/api/service-items/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service item not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).delete('/api/service-items/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to delete service item' });
  });
});
