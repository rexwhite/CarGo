const request = require('supertest');
const express = require('express');
const serviceEventsRouter = require('./service_events');

const mockPool = {
  query: jest.fn(),
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/service-events', serviceEventsRouter(mockPool));
  return app;
};

describe('GET /api/service-events/car/:carId', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  test('should return all service events for a car', async () => {
    const mockRow = {
      id: 1, car_id: 1, date: '2024-06-20', mileage: 45000,
      performed_by: 'Quick Lube', description: null, notes: null,
      created_at: null, updated_at: null,
      sei_id: 1, service_item_id: 1, service_item_title: 'Oil Change', item_notes: 'Used synthetic',
    };
    mockPool.query.mockResolvedValue({ rows: [mockRow] });

    const response = await request(app).get('/api/service-events/car/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      id: 1, car_id: 1, date: '2024-06-20', mileage: 45000,
      performed_by: 'Quick Lube', description: null, notes: null,
      created_at: null, updated_at: null,
      items: [{ id: 1, service_item_id: 1, service_item_title: 'Oil Change', notes: 'Used synthetic' }],
    }]);
  });

  test('should handle database errors', async () => {
    mockPool.query.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/service-events/car/1');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to fetch service events' });
  });
});

describe('GET /api/service-events/:id', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  test('should return a single service event by id', async () => {
    const mockRow = {
      id: 1, car_id: 1, date: '2024-06-20', mileage: 45000,
      performed_by: 'Quick Lube', description: null, notes: 'Oil change',
      created_at: null, updated_at: null,
      sei_id: 1, service_item_id: 1, service_item_title: 'Oil Change', item_notes: 'Used synthetic',
    };
    mockPool.query.mockResolvedValue({ rows: [mockRow] });

    const response = await request(app).get('/api/service-events/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1, car_id: 1, date: '2024-06-20', mileage: 45000,
      performed_by: 'Quick Lube', description: null, notes: 'Oil change',
      created_at: null, updated_at: null,
      items: [{ id: 1, service_item_id: 1, service_item_title: 'Oil Change', notes: 'Used synthetic' }],
    });
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
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn().mockResolvedValue({}), release: jest.fn() };
    mockPool.connect = jest.fn().mockResolvedValue(mockClient);
    app = createApp();
  });

  test('should create a new service event', async () => {
    const newEvent = {
      car_id: 1, date: '2024-12-01', mileage: 50000,
      performed_by: 'Auto Shop', description: null, notes: 'Routine maintenance',
      items: [{ service_item_id: 1, notes: 'Oil changed' }],
    };
    const createdEvent = {
      id: 3, car_id: 1, date: '2024-12-01', mileage: 50000,
      performed_by: 'Auto Shop', description: null, notes: 'Routine maintenance',
      created_at: null, updated_at: null,
    };
    const fullEventRow = {
      ...createdEvent,
      sei_id: 1, service_item_id: 1, service_item_title: 'Oil Change', item_notes: 'Oil changed',
    };

    mockClient.query
      .mockResolvedValueOnce({})                       // BEGIN
      .mockResolvedValueOnce({ rows: [createdEvent] }) // INSERT service_events
      .mockResolvedValueOnce({})                       // INSERT service_event_items
      .mockResolvedValueOnce({});                      // UPDATE cars mileage
    // COMMIT uses default mockResolvedValue({})

    mockPool.query.mockResolvedValue({ rows: [fullEventRow] }); // getEventWithItems

    const response = await request(app)
      .post('/api/service-events')
      .send(newEvent);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 3, car_id: 1, date: '2024-12-01', mileage: 50000,
      items: [{ service_item_id: 1, service_item_title: 'Oil Change', notes: 'Oil changed' }],
    });
    expect(mockPool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('should handle database errors', async () => {
    mockClient.query
      .mockResolvedValueOnce({})                                 // BEGIN
      .mockRejectedValueOnce(new Error('Database error'));       // INSERT throws
    // ROLLBACK uses default mockResolvedValue({})

    const response = await request(app)
      .post('/api/service-events')
      .send({ car_id: 1, date: '2024-12-01', mileage: 50000, items: [] });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to create service event' });
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe('PUT /api/service-events/:id', () => {
  let app;
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = { query: jest.fn().mockResolvedValue({}), release: jest.fn() };
    mockPool.connect = jest.fn().mockResolvedValue(mockClient);
    app = createApp();
  });

  test('should update an existing service event', async () => {
    const updatedEvent = {
      id: 1, car_id: 1, date: '2024-12-05', mileage: 50500,
      performed_by: 'DIY', description: null, notes: 'Updated notes',
      created_at: null, updated_at: null,
    };
    const fullEventRow = {
      ...updatedEvent,
      sei_id: 1, service_item_id: 1, service_item_title: 'Oil Change', item_notes: null,
    };

    mockClient.query
      .mockResolvedValueOnce({})                         // BEGIN
      .mockResolvedValueOnce({ rows: [updatedEvent] })   // UPDATE service_events
      .mockResolvedValueOnce({});                        // DELETE service_event_items
    // INSERT service_event_items + COMMIT use default mockResolvedValue({})

    mockPool.query.mockResolvedValue({ rows: [fullEventRow] }); // getEventWithItems

    const response = await request(app)
      .put('/api/service-events/1')
      .send({ date: '2024-12-05', mileage: 50500, performed_by: 'DIY', description: null, notes: 'Updated notes', items: [{ service_item_id: 1, notes: null }] });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1, car_id: 1, date: '2024-12-05', mileage: 50500,
      items: [{ service_item_id: 1, service_item_title: 'Oil Change' }],
    });
    expect(mockPool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('should return 404 if service event not found', async () => {
    mockClient.query
      .mockResolvedValueOnce({})              // BEGIN
      .mockResolvedValueOnce({ rows: [] });   // UPDATE returns empty
    // ROLLBACK uses default mockResolvedValue({})

    const response = await request(app)
      .put('/api/service-events/999')
      .send({ date: '2024-12-05', mileage: 50500, performed_by: 'DIY', notes: 'Updated notes', items: [] });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Service event not found' });
    expect(mockClient.release).toHaveBeenCalled();
  });

  test('should handle database errors', async () => {
    mockClient.query
      .mockResolvedValueOnce({})                           // BEGIN
      .mockRejectedValueOnce(new Error('Database error')); // UPDATE throws
    // ROLLBACK uses default mockResolvedValue({})

    const response = await request(app)
      .put('/api/service-events/1')
      .send({ date: '2024-12-05', mileage: 50500, performed_by: 'DIY', notes: 'Updated notes', items: [] });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Failed to update service event' });
    expect(mockClient.release).toHaveBeenCalled();
  });
});

describe('DELETE /api/service-events/:id', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
  });

  test('should delete an existing service event', async () => {
    const deletedEvent = { id: 1, car_id: 1, date: '2024-06-20', mileage: 45000, performed_by: 'Quick Lube', notes: 'Oil change' };

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
