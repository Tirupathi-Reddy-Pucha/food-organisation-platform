import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import BugReport from '../models/BugReport.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Bug Report Routes - Integration Tests', () => {
    let token;
    let adminToken;
    let userId;
    let adminId;

    beforeAll(async () => {
        await setupTestDB();

        // Create a regular user
        const user = await User.create({
            name: 'Bug Reporter',
            email: 'reporter@example.com',
            password: 'password123',
            role: 'Donor',
            phone: '1234567890',
            address: 'Test Address'
        });
        userId = user._id;
        token = jwt.sign({ user: { id: userId, role: user.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // Create an admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'password123',
            role: 'Admin',
            phone: '0987654321',
            address: 'Admin Address'
        });
        adminId = admin._id;
        adminToken = jwt.sign({ user: { id: adminId, role: admin.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await BugReport.deleteMany({});
    });

    describe('POST /api/bugs', () => {
        it('should create a new bug report with valid data', async () => {
            const res = await request(app)
                .post('/api/bugs')
                .set('x-auth-token', token)
                .send({
                    description: 'Test bug description'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('description', 'Test bug description');
            expect(res.body).toHaveProperty('reporter', userId.toString());
        });

        it('should return 400 if description is missing', async () => {
            const res = await request(app)
                .post('/api/bugs')
                .set('x-auth-token', token)
                .send({});

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('Please provide a bug description');
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/bugs')
                .send({
                    description: 'Test bug description'
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/bugs', () => {
        it('should allow admin to get all bug reports', async () => {
            // Create a bug report first
            await BugReport.create({
                reporter: userId,
                description: 'Existing bug'
            });

            const res = await request(app)
                .get('/api/bugs')
                .set('x-auth-token', adminToken);

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('description', 'Existing bug');
            expect(res.body[0].reporter).toHaveProperty('name', 'Bug Reporter');
        });

        it('should deny access to non-admin users', async () => {
            const res = await request(app)
                .get('/api/bugs')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(403);
            expect(res.body.msg).toBe('Access denied');
        });
    });
}, 30000);
