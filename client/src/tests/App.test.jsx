import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Since App contains the Navbar, we can check for brand text
    expect(screen.getAllByText(/Give/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bite/i).length).toBeGreaterThan(0);
  });
});
