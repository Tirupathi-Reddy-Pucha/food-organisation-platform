import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock axios globally if needed, or just let components handle it
vi.mock('axios');

describe('App Component', () => {
    it('renders the GiveBite logo text', () => {
        render(<App />);
        const titleElements = screen.getAllByText(/GiveBite/i);
        expect(titleElements.length).toBeGreaterThan(0);
    });
});
