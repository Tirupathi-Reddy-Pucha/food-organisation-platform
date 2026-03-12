import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RouteOptimization from '../pages/RouteOptimization';
import axios from 'axios';

// Mock axios
vi.mock('axios');

const renderRouteOptimization = () => {
    return render(
        <BrowserRouter>
            <RouteOptimization />
        </BrowserRouter>
    );
};

describe('RouteOptimization Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        localStorage.setItem('user_id', '123');
        localStorage.setItem('user_name', 'Test Volunteer');
        localStorage.setItem('user_role', 'Volunteer');
        localStorage.setItem('token', 'fake-token');
        localStorage.setItem('user_location', JSON.stringify({ lat: 19.076, lng: 72.877 }));
        localStorage.setItem('user_maxWeight', '50');
        localStorage.setItem('user_maxServings', '100');
    });

    it('renders Route Optimization page correctly', async () => {
        // Mock API calls
        axios.get.mockResolvedValue({ data: [] });

        renderRouteOptimization();

        await waitFor(() => {
            expect(screen.getByText(/Volunteer Route Optimizer/i)).toBeInTheDocument();
            expect(screen.getByText(/Batch Capacity/i)).toBeInTheDocument();
        });
    });

    it('shows message when no claimed listings found', async () => {
        axios.get.mockResolvedValue({ data: [] });

        renderRouteOptimization();

        await waitFor(() => {
            expect(screen.getByText(/No claimed listings within/i)).toBeInTheDocument();
        });
    });
});
