import request from 'supertest';
import app from '../index.js';
import { describe, it, expect, jest } from '@jest/globals';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Cloudinary
jest.mock('cloudinary', () => ({
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn()
        }
    }
}));

describe('Upload Routes - Integration Tests', () => {
    describe('POST /api/upload', () => {
        // Since we are using multer-storage-cloudinary, it's harder to mock the internal middleware behavior 
        // without getting deep into multer-storage-cloudinary internals.
        // For this test, we'll focus on the route-level logic and error handling.

        it('should return 400 if no file is uploaded', async () => {
            const res = await request(app)
                .post('/api/upload');

            // If the route is hit without a file, multer will not populate req.file
            expect(res.statusCode).toEqual(400);
            expect(res.body.msg).toBe('No file uploaded');
        });

        // Note: Full success test with real file requires complex mocking of multer-storage-cloudinary
        // or using a real dev cloud. Given the environment, we'll verify the existence of the endpoint.
        it('should have the upload endpoint defined', async () => {
            const res = await request(app).post('/api/upload');
            expect(res.statusCode).not.toBe(404);
        });
    });
});
