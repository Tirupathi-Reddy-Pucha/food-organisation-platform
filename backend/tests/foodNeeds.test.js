import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import FoodNeed from '../models/FoodNeed.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Food Need Routes - Integration Tests', () => {
    let ngoToken;
    let otherNgoToken;
    let adminToken;
    let ngoId;
    let otherNgoId;
    let adminId;

    beforeAll(async () => {
        await setupTestDB();

        // Create an NGO user
        const ngo = await User.create({
            name: 'Test NGO',
            email: 'ngo@example.com',
            password: 'password123',
            role: 'NGO',
            phone: '1234567890',
            address: 'NGO Address'
        });
        ngoId = ngo._id;
        ngoToken = jwt.sign({ user: { id: ngoId, role: ngo.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // Create another NGO user
        const otherNgo = await User.create({
            name: 'Other NGO',
            email: 'otherngo@example.com',
            password: 'password123',
            role: 'NGO',
            phone: '9876543210',
            address: 'Other NGO Address'
        });
        otherNgoId = otherNgo._id;
        otherNgoToken = jwt.sign({ user: { id: otherNgoId, role: otherNgo.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

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
        await FoodNeed.deleteMany({});
    });

    describe('GET /api/food-needs', () => {
        it('should return all open food needs', async () => {
            await FoodNeed.create({
                ngo: ngoId,
                title: 'Need 1',
                category: 'Cooked',
                quantity: 10,
                location: { lat: 12.34, lng: 56.78 },
                status: 'Open'
            });

            const res = await request(app).get('/api/food-needs');
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('title', 'Need 1');
        });
    });

    describe('POST /api/food-needs', () => {
        it('should create a food need for NGO', async () => {
            const res = await request(app)
                .post('/api/food-needs')
                .set('x-auth-token', ngoToken)
                .send({
                    title: 'New Need',
                    category: 'Raw',
                    quantity: 5,
                    lat: 12.34,
                    lng: 56.78
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('title', 'New Need');
            expect(res.body).toHaveProperty('ngo', ngoId.toString());
        });

        it('should return 403 for non-NGO users', async () => {
            const donor = await User.create({
                name: 'Donor',
                email: 'donor@example.com',
                password: 'password123',
                role: 'Donor',
                phone: '1112223333',
                address: 'Donor Address'
            });
            const donorToken = jwt.sign({ user: { id: donor._id, role: donor.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

            const res = await request(app)
                .post('/api/food-needs')
                .set('x-auth-token', donorToken)
                .send({
                    title: 'New Need',
                    category: 'Raw',
                    quantity: 5,
                    lat: 12.34,
                    lng: 56.78
                });

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('DELETE /api/food-needs/:id', () => {
        it('should allow owner to delete need', async () => {
            const need = await FoodNeed.create({
                ngo: ngoId,
                title: 'To Delete',
                category: 'Cooked',
                quantity: 10,
                location: { lat: 12.34, lng: 56.78 }
            });

            const res = await request(app)
                .delete(`/api/food-needs/${need._id}`)
                .set('x-auth-token', ngoToken);

            expect(res.statusCode).toEqual(200);
            const check = await FoodNeed.findById(need._id);
            expect(check).toBeNull();
        });

        it('should allow admin to delete need', async () => {
            const need = await FoodNeed.create({
                ngo: ngoId,
                title: 'Admin Delete',
                category: 'Cooked',
                quantity: 10,
                location: { lat: 12.34, lng: 56.78 }
            });

            const res = await request(app)
                .delete(`/api/food-needs/${need._id}`)
                .set('x-auth-token', adminToken);

            expect(res.statusCode).toEqual(200);
        });

        it('should return 401 for unauthorized deletion', async () => {
            const need = await FoodNeed.create({
                ngo: ngoId,
                title: 'Unauthorized Delete',
                category: 'Cooked',
                quantity: 10,
                location: { lat: 12.34, lng: 56.78 }
            });

            const res = await request(app)
                .delete(`/api/food-needs/${need._id}`)
                .set('x-auth-token', otherNgoToken);

            expect(res.statusCode).toEqual(401);
        });
    });
}, 30000);
