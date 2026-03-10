import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';

// Mock axios and react-router-dom hooks
vi.mock('axios');
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

describe('Login Component', () => {
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

    it('renders the login form fields correctly', () => {
        renderWithRouter(<Login />);
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    });

    it('successfully logs in and stores tokens', async () => {
        const mockResponse = {
            data: {
                token: 'fake-jwt-token',
                user: { id: '123', name: 'Test User', role: 'Donor', email: 'test@test.com' }
            }
        };
        axios.post.mockResolvedValueOnce(mockResponse);

        renderWithRouter(<Login />);

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
            expect(window.location.reload).toHaveBeenCalledTimes(1);
        });

        // Verify localStorage was called correctly
        expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        expect(localStorage.getItem('user_id')).toBe('123');
        expect(localStorage.getItem('user_role')).toBe('Donor');
    });

    it('handles login failure', async () => {
        axios.post.mockRejectedValueOnce({
            response: { data: { msg: 'Invalid credentials' } }
        });

        renderWithRouter(<Login />);

        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'wrong@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
        });
    });
});
