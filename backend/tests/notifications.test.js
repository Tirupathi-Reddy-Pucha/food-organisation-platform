import request from 'supertest';
import app from '../index.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import jwt from 'jsonwebtoken';

describe('Notification Routes - Integration Tests', () => {
    let token;
    let otherToken;
    let userId;
    let otherUserId;

    beforeAll(async () => {
        await setupTestDB();

        // Create a user
        const user = await User.create({
            name: 'Notify User',
            email: 'notify@example.com',
            password: 'password123',
            role: 'Donor',
            phone: '1234567890',
            address: 'Test Address'
        });
        userId = user._id;
        token = jwt.sign({ user: { id: userId, role: user.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        // Create another user
        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@example.com',
            password: 'password123',
            role: 'Donor',
            phone: '0987654321',
            address: 'Other Address'
        });
        otherUserId = otherUser._id;
        otherToken = jwt.sign({ user: { id: otherUserId, role: otherUser.role } }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await Notification.deleteMany({});
    });

    describe('GET /api/notifications', () => {
        it('should return notifications for the logged-in user', async () => {
            await Notification.create({
                recipient: userId,
                msg: 'Test notification',
                type: 'Info'
            });

            const res = await request(app)
                .get('/api/notifications')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('msg', 'Test notification');
        });

        it('should not return notifications of other users', async () => {
            await Notification.create({
                recipient: otherUserId,
                msg: 'Other user notification',
                type: 'Info'
            });

            const res = await request(app)
                .get('/api/notifications')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBe(0);
        });
    });

    describe('PUT /api/notifications/:id/read', () => {
        it('should mark notification as read', async () => {
            const notification = await Notification.create({
                recipient: userId,
                msg: 'Unread',
                isRead: false
            });

            const res = await request(app)
                .put(`/api/notifications/${notification._id}/read`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('isRead', true);
        });

        it('should return 401 for marking other user notification as read', async () => {
            const notification = await Notification.create({
                recipient: otherUserId,
                msg: 'Other unread',
                isRead: false
            });

            const res = await request(app)
                .put(`/api/notifications/${notification._id}/read`)
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PUT /api/notifications/read-all', () => {
        it('should mark all notifications as read', async () => {
            await Notification.create({ recipient: userId, msg: 'N1', isRead: false });
            await Notification.create({ recipient: userId, msg: 'N2', isRead: false });

            const res = await request(app)
                .put('/api/notifications/read-all')
                .set('x-auth-token', token);

            expect(res.statusCode).toEqual(200);
            const count = await Notification.countDocuments({ recipient: userId, isRead: false });
            expect(count).toBe(0);
        });
    });
}, 30000);
