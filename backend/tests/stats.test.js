import request from 'supertest';
import app from '../index.js';
import FoodListing from '../models/FoodListing.js';
import User from '../models/User.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

describe('Stats Routes - Integration Tests', () => {
    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
    });

    describe('GET /api/stats/', () => {
        it('should return zero stats when no data exists', async () => {
            const res = await request(app).get('/api/stats/');

            expect(res.statusCode).toEqual(200);
            expect(res.body.total_donations).toBe(0);
            expect(res.body.meals_saved).toBe(0);
            expect(res.body.co2_saved).toBe(0);
        });

        it('should calculate stats correctly with sample data', async () => {
            // Create a test donor
            const donor = await User.create({
                name: 'Test Donor',
                email: 'donor@test.com',
                password: 'hashedpassword',
                role: 'Donor',
                phone: '1234567890',
                address: 'Test Address'
            });

            // Create test listings
            await FoodListing.create({
                title: 'Food Item 1',
                description: 'Test',
                quantity: 10,
                unit: 'kg',
                category: 'Cooked',
                expiry_hours: 24,
                donor: donor._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Delivered'
            });

            await FoodListing.create({
                title: 'Food Item 2',
                description: 'Test',
                quantity: 20,
                unit: 'kg',
                category: 'Raw',
                expiry_hours: 48,
                donor: donor._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Delivered'
            });

            const res = await request(app).get('/api/stats/');

            expect(res.statusCode).toEqual(200);
            expect(res.body.total_donations).toBe(2);
            // 30 kg / 0.4 kg per meal = 75 meals
            expect(res.body.meals_saved).toBe(75);
            // 30 kg * 2.5 kg CO2 per kg = 75 kg CO2
            expect(res.body.co2_saved).toBe(75);
        });
    });

    describe('GET /api/stats/leaderboard', () => {
        it('should return empty array when no donors exist', async () => {
            const res = await request(app).get('/api/stats/leaderboard');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(0);
        });

        it('should return top donors leaderboard', async () => {
            // Create test donors
            const donor1 = await User.create({
                name: 'Top Donor',
                email: 'donor1@test.com',
                password: 'hashedpassword',
                role: 'Donor',
                phone: '1234567890',
                address: 'Test Address 1'
            });

            const donor2 = await User.create({
                name: 'Second Donor',
                email: 'donor2@test.com',
                password: 'hashedpassword',
                role: 'Donor',
                phone: '9876543210',
                address: 'Test Address 2'
            });

            // Create different numbers of listings for each donor
            for (let i = 0; i < 5; i++) {
                await FoodListing.create({
                    title: `Food Item ${i}`,
                    description: 'Test',
                    quantity: 10,
                    unit: 'kg',
                    category: 'Cooked',
                    expiry_hours: 24,
                    donor: donor1._id,
                    location: { lat: 40.7128, lng: -74.0060 },
                    status: 'Delivered'
                });
            }

            for (let i = 0; i < 3; i++) {
                await FoodListing.create({
                    title: `Food Item ${i}`,
                    description: 'Test',
                    quantity: 10,
                    unit: 'kg',
                    category: 'Cooked',
                    expiry_hours: 24,
                    donor: donor2._id,
                    location: { lat: 40.7128, lng: -74.0060 },
                    status: 'Delivered'
                });
            }

            const res = await request(app).get('/api/stats/leaderboard');

            expect(res.statusCode).toEqual(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);

            // Top donor should be first
            expect(res.body[0].name).toBe('Top Donor');
            expect(res.body[0].count).toBe(5);

            // Second donor should be second
            expect(res.body[1].name).toBe('Second Donor');
            expect(res.body[1].count).toBe(3);
        });

        it('should exclude cancelled listings from leaderboard', async () => {
            const donor = await User.create({
                name: 'Test Donor',
                email: 'donor@test.com',
                password: 'hashedpassword',
                role: 'Donor',
                phone: '1234567890',
                address: 'Test Address'
            });

            // Create delivered listing
            await FoodListing.create({
                title: 'Delivered Food',
                description: 'Test',
                quantity: 10,
                unit: 'kg',
                category: 'Cooked',
                expiry_hours: 24,
                donor: donor._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Delivered'
            });

            // Create cancelled listing
            await FoodListing.create({
                title: 'Cancelled Food',
                description: 'Test',
                quantity: 10,
                unit: 'kg',
                category: 'Cooked',
                expiry_hours: 24,
                donor: donor._id,
                location: { lat: 40.7128, lng: -74.0060 },
                status: 'Cancelled'
            });

            const res = await request(app).get('/api/stats/leaderboard');

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            // Should only count the delivered listing
            expect(res.body[0].count).toBe(1);
        });
    });
}, 30000); // 30 second timeout for integration tests
