import request from 'supertest';
import app from '../index.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

describe('Listings Routes - Integration Tests', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Create a test user and get auth token
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await User.create({
            name: 'Test Donor',
            email: 'donor@test.com',
            password: hashedPassword,
            role: 'Donor',
            phone: '1234567890',
            address: 'Test Address'
        });

        // Generate a real JWT token
        authToken = jwt.sign(
            { user: { id: testUser._id.toString(), role: 'Donor' } },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '1h' }
        );
    });

    describe('GET /api/listings', () => {
        it('should fetch all listings without authentication', async () => {
            // Create a test listing
            await FoodListing.create({
                title: 'Test Food',
                description: 'Delicious food',
                quantity: 10,
                unit: 'kg',
                category: 'Cooked',
                expiry_hours: 24,
                donor: testUser._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Available'
            });

            const res = await request(app).get('/api/listings');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });

        it('should filter listings by search query', async () => {
            await FoodListing.create({
                title: 'Fresh Bread',
                description: 'Test',
                quantity: 5,
                unit: 'kg',
                category: 'Bakery',
                expiry_hours: 12,
                donor: testUser._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Available'
            });

            const res = await request(app).get('/api/listings?search=bread');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/listings', () => {
        it('should create a new listing with authentication', async () => {
            const res = await request(app)
                .post('/api/listings')
                .set('x-auth-token', authToken)
                .send({
                    title: 'New Food Item',
                    description: 'Fresh food',
                    quantity: 15,
                    unit: 'kg',
                    category: 'Cooked',
                    expiry_hours: 24,
                    isVeg: true,
                    lat: 40.7128,
                    lng: -74.0060
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('title', 'New Food Item');
            expect(res.body.donor).toEqual(testUser._id.toString());
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/listings')
                .send({
                    title: 'Test Food',
                    quantity: 5,
                    expiry_hours: 24
                });

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('DELETE /api/listings/:id', () => {
        it('should delete own listing', async () => {
            const listing = await FoodListing.create({
                title: 'My Food',
                description: 'Test',
                quantity: 10,
                unit: 'kg',
                category: 'Cooked',
                expiry_hours: 24,
                donor: testUser._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Available'
            });

            const res = await request(app)
                .delete(`/api/listings/${listing._id}`)
                .set('x-auth-token', authToken);

            expect(res.statusCode).toEqual(200);
        });
    });
}, 30000); // 30 second timeout for integration tests
