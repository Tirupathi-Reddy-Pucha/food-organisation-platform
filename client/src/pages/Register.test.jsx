import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Register from './Register';

// Mock axios and router
vi.mock('axios');
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Mock window.location.reload
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: vi.fn() },
        });
    });

    const renderWithRouter = (ui) => {
        return render(<BrowserRouter>{ui}</BrowserRouter>);
    };

    it('renders the registration form fields', () => {
        renderWithRouter(<Register />);
        expect(screen.getByPlaceholderText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/name@example.com/i)).toBeInTheDocument();
        // The default role is Donor
        expect(screen.getByRole('button', { name: /Create Donor Account/i })).toBeInTheDocument();
    });

    it('successfully registers a user', async () => {
        const mockResponse = {
            data: {
                msg: 'Registration successful',
                token: 'fake-jwt-token',
                user: { id: '123', name: 'Test User', role: 'Donor', email: 'test@test.com' }
            }
        };
        axios.post.mockResolvedValueOnce(mockResponse);

        renderWithRouter(<Register />);

        fireEvent.change(screen.getByPlaceholderText(/John Doe/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByPlaceholderText(/name@example.com/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/^••••••••$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByPlaceholderText(/\+1 \(555\)/i), { target: { value: '+1 (555) 123-4567' } });
        fireEvent.change(screen.getByPlaceholderText(/123 Main St/i), { target: { value: '123 Fake St' } });

        // Check terms
        const termsCheckbox = screen.getByRole('checkbox');
        fireEvent.click(termsCheckbox);

        fireEvent.click(screen.getByRole('button', { name: /Create Donor Account/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
            expect(window.location.reload).toHaveBeenCalledTimes(1);
        });
    });
});
