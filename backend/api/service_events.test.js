const request = require('supertest');
const express = require('express');
const serviceEventsRouter = require('./service_events');

// Mock pool
const mockPool = {
  query: jest.fn(),
};

// Create test app
const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/service-events', serviceEventsRouter(mockPool));
  return app;
};

describe('GET /api/service-events/service-item/:serviceItemId', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should return all service events for a service item', async () => {
    const mockEvents = [
      { id: 1, service_item_id: 1, date: '2024-06-20', mileage: 45000, performed_by: 'Quick Lube', notes: 'Oil change' },
      { id: 2, service_item_id: 1, date: '2024-01-15', mileage: 40000, performed_by: 'Quick Lube', notes: 'Oil change' },
    ];

    mockPool.query.mockResolvedValue({ rows: mockEvents });

    const response = await request(app).get('/api/service-events/service-item/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockEvents);
    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT * FROM service_events WHERE service_item_id = $1 ORDER BY date DESC',
      ['1']
    );
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/service-events/service-item/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch service events' });
  });
});

describe('GET /api/service-events/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should return a single service event by id', async () => {
    const mockEvent = { id: 1, service_item_id: 1, date: '2024-06-20', mileage: 45000, performed_by: 'Quick Lube', notes: 'Oil change' };

    mockPool.query.mockResolvedValue({ rows: [mockEvent] });

    const response = await request(app).get('/api/service-events/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockEvent);
    expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM service_events WHERE id = $1', ['1']);
  });

  test('should return 404 if service event not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app).get('/api/service-events/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service event not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/service-events/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch service event' });
  });
});

describe('POST /api/service-events', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should create a new service event', async () => {
    const newEvent = { service_item_id: 1, date: '2024-12-01', mileage: 50000, performed_by: 'Auto Shop', notes: 'Routine maintenance' };
    const createdEvent = { id: 3, ...newEvent };

    mockPool.query.mockResolvedValue({ rows: [createdEvent] });

    const response = await request(app)
      .post('/api/service-events')
      .send(newEvent);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdEvent);
    expect(mockPool.query).toHaveBeenCalledWith(
      'INSERT INTO service_events (service_item_id, date, mileage, performed_by, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newEvent.service_item_id, newEvent.date, newEvent.mileage, newEvent.performed_by, newEvent.notes]
    );
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/service-events')
      .send({ service_item_id: 1, date: '2024-12-01', mileage: 50000, performed_by: 'Auto Shop', notes: 'Routine maintenance' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to create service event' });
  });
});

describe('PUT /api/service-events/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should update an existing service event', async () => {
    const updatedEvent = { id: 1, service_item_id: 1, date: '2024-12-05', mileage: 50500, performed_by: 'DIY', notes: 'Updated notes' };

    mockPool.query.mockResolvedValue({ rows: [updatedEvent] });

    const response = await request(app)
      .put('/api/service-events/1')
      .send({ date: '2024-12-05', mileage: 50500, performed_by: 'DIY', notes: 'Updated notes' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedEvent);
    expect(mockPool.query).toHaveBeenCalledWith(
      'UPDATE service_events SET date = $1, mileage = $2, performed_by = $3, notes = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      ['2024-12-05', 50500, 'DIY', 'Updated notes', '1']
    );
  });

  test('should return 404 if service event not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app)
      .put('/api/service-events/999')
      .send({ date: '2024-12-05', mileage: 50500, performed_by: 'DIY', notes: 'Updated notes' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service event not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .put('/api/service-events/1')
      .send({ date: '2024-12-05', mileage: 50500, performed_by: 'DIY', notes: 'Updated notes' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to update service event' });
  });
});

describe('DELETE /api/service-events/:id', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  test('should delete an existing service event', async () => {
    const deletedEvent = { id: 1, service_item_id: 1, date: '2024-06-20', mileage: 45000, performed_by: 'Quick Lube', notes: 'Oil change' };

    mockPool.query.mockResolvedValue({ rows: [deletedEvent] });

    const response = await request(app).delete('/api/service-events/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Service event deleted successfully', service_event: deletedEvent });
    expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM service_events WHERE id = $1 RETURNING *', ['1']);
  });

  test('should return 404 if service event not found', async () => {
    mockPool.query.mockResolvedValue({ rows: [] });

    const response = await request(app).delete('/api/service-events/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service event not found' });
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).delete('/api/service-events/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to delete service event' });
  });
});
