const request = require('supertest');
const express = require('express');
const path = require('path');
const carRouter = require('./car');

// Mock pool
const mockPool = {
  query: jest.fn(),
};

// Create test app
const createApp = () => {
  const app = express();
  app.set('view engine', 'pug');
  app.set('views', path.join(__dirname, '../views'));
  app.use('/car', carRouter(mockPool));
  return app;
};

describe('Car Routes - Print Functionality', () => {
  let app;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  const mockCar = {
    id: 1,
    name: 'My Car',
    make: 'Toyota',
    model: 'Corolla',
    year: 2020,
    mileage: 50000,
    vin: 'VIN1234567890',
    license_plate: 'TEST-PLATE'
  };

  const mockEvents = [
    {
      id: 10,
      car_id: 1,
      date: '2026-01-01',
      mileage: 45000,
      performed_by: 'Mechanic A',
      description: 'Oil Change',
      notes: 'Used synthetic oil',
      sei_id: 100,
      service_item_id: 1,
      service_item_title: 'Oil & Filter',
      item_notes: 'High quality filter'
    }
  ];

  describe('GET /car/:id/print', () => {
    test('should render the aggregated print view with car and event details', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [mockCar] }) // Car details
        .mockResolvedValueOnce({ rows: mockEvents }); // Service events

      const response = await request(app).get('/car/1/print');

      expect(response.status).toBe(200);
      expect(response.text).toContain('My Car');
      expect(response.text).toContain('(2020 Toyota Corolla)');
      expect(response.text).toContain('VIN1234567890');
      expect(response.text).toContain('TEST-PLATE');
      expect(response.text).toContain('45,000 mi');
      expect(response.text).toContain('Oil Change');
      expect(response.text).toContain('Mechanic A');
      expect(response.text).toContain('window.print()');
    });

    test('should return 404 if car is not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/car/999/print');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Car not found');
    });

    test('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/car/1/print');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error loading print view');
    });
  });

  describe('GET /car/:id/events/:eventId', () => {
    test('should render the single event details view', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [mockCar] }) // Car details
        .mockResolvedValueOnce({ rows: mockEvents }); // Single service event

      const response = await request(app).get('/car/1/events/10');

      expect(response.status).toBe(200);
      expect(response.text).toContain('My Car');
      expect(response.text).toContain('(2020 Toyota Corolla)');
      expect(response.text).toContain('VIN1234567890');
      expect(response.text).toContain('TEST-PLATE');
      expect(response.text).toContain('45,000 mi');
      expect(response.text).toContain('Oil Change');
      expect(response.text).toContain('Mechanic A');
      expect(response.text).toContain('Used synthetic oil');
      expect(response.text).toContain('Oil &amp; Filter'); // Pug escapes by default
      expect(response.text).toContain('window.print()');
    });

    test('should return 404 if car is not found', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/car/999/events/10');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Car not found');
    });

    test('should return 404 if service event is not found', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [mockCar] })
        .mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get('/car/1/events/999');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Service event not found');
    });

    test('should handle database errors', async () => {
      mockPool.query.mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/car/1/events/10');

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error loading event details');
    });
  });
});
