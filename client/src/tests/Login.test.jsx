import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import Login from '../pages/Login';

// Mock axios
vi.mock('axios');

// Mock matchMedia for framer-motion/react components if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const renderLogin = () => {
    return render(
        <BrowserRouter>
            <Login />
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders login form properly', () => {
        renderLogin();
        expect(screen.getByPlaceholderText(/name@organization.com/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
        expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
    });

    it('handles input changes', () => {
        renderLogin();
        
        const emailInput = screen.getByPlaceholderText(/name@organization.com/i);
        const passwordInput = screen.getByPlaceholderText(/••••••••/i);

        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@test.com');
        expect(passwordInput.value).toBe('password123');
    });

    it('handles successful login', async () => {
        const mockResponse = {
            data: {
                token: 'fake-token',
                user: { id: '1', role: 'Donor', name: 'Test User', isVerified: true, isTrained: true }
            }
        };
        axios.post.mockResolvedValueOnce(mockResponse);

        // Spy on window.location.reload
        const reloadSpy = vi.fn();
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { reload: reloadSpy, href: '' }
        });

        renderLogin();
        
        fireEvent.change(screen.getByPlaceholderText(/name@organization.com/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(localStorage.getItem('token')).toBe('fake-token');
            expect(localStorage.getItem('user_role')).toBe('Donor');
            expect(reloadSpy).toHaveBeenCalled();
        });
    });

    it('shows error on failed login', async () => {
        const mockError = {
            response: {
                data: { msg: 'Invalid Credentials' }
            }
        };
        axios.post.mockRejectedValueOnce(mockError);

        renderLogin();
        
        fireEvent.change(screen.getByPlaceholderText(/name@organization.com/i), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText(/••••••••/i), { target: { value: 'wrongpass' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(/Invalid Credentials/i)).toBeInTheDocument();
        });
    });
});
