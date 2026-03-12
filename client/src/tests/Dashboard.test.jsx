import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import Dashboard from '../pages/Dashboard';

// Mock axios
vi.mock('axios');

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

const renderDashboard = () => {
    return render(
        <BrowserRouter>
            <Dashboard />
        </BrowserRouter>
    );
};

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        // Setup mock user for Donor role
        localStorage.setItem('user_id', '123');
        localStorage.setItem('user_name', 'Test User');
        localStorage.setItem('user_role', 'Donor');
        localStorage.setItem('token', 'fake-token');
    });

    it('renders Donor dashboard correctly', async () => {
        // Mock API calls for dashboard
        axios.get.mockImplementation((url) => {
            if (url.includes('/stats')) return Promise.resolve({ data: { total_donations: 5, meals_saved: 20, co2_saved: 10, water_saved: 50 } });
            return Promise.resolve({ data: [] });
        });

        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText(/Live Feed/i)).toBeInTheDocument();
            expect(screen.getByText(/Meals Saved/i)).toBeInTheDocument();
        });
    });

    it('shows safety training alert for Volunteers if not trained', async () => {
        localStorage.setItem('user_role', 'Volunteer');
        localStorage.setItem('user_trained', 'false');

        renderDashboard();
        
        // screen.debug();

        await waitFor(() => {
            expect(screen.queryByText(/Handling/i) || screen.queryByText(/Hygiene/i)).toBeInTheDocument();
        });
    });
});
