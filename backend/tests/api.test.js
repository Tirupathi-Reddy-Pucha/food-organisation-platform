
import request from 'supertest';
import app from '../index.js';
import { jest } from '@jest/globals';

// Mock mongoose to prevent actual DB connection during tests if not needed for simple API check
// For integration tests, you might want a real DB connection (e.g. in-memory mongo), 
// but for now let's just test that the app structure works.
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    Schema: class { },
    model: jest.fn(),
}));

describe('API Health Check', () => {
    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.statusCode).toEqual(404);
    });

    // Add more tests here once we know what endpoints are available and easier to test
    // For example, if there is a public endpoint.
});
