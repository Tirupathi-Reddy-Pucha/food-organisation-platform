import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

describe('Auth Routes - Integration Tests', () => {
    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'password123',
                    role: 'Donor',
                    phone: '1234567890',
                    address: '123 Main St'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('name', 'John Doe');
            expect(res.body.user).toHaveProperty('role', 'Donor');
        });

        it('should return 400 if user already exists', async () => {
            // Create first user
            await User.create({
                name: 'Existing User',
                email: 'existing@example.com',
                password: await bcrypt.hash('password123', 10),
                role: 'Donor',
                phone: '1234567890',
                address: 'Test Address'
            });

            // Try to register with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Another User',
                    email: 'existing@example.com',
                    password: 'password123',
                    role: 'NGO',
                    phone: '9876543210',
                    address: 'Test Address 2'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toContain('already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            // Create test user with hashed password
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                name: 'Test User',
                email: 'test@example.com',
                password: hashedPassword,
                role: 'Donor',
                phone: '1234567890',
                address: 'Test Address'
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('role', 'Donor');
        });

        it('should return 400 with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toContain('Invalid');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return 401 without authentication token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.statusCode).toEqual(401);
        });
    });
}, 30000); // 30 second timeout for integration tests
