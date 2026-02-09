
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock Modules
vi.mock('axios');
vi.mock('react-leaflet', () => ({
    MapContainer: () => <div>MapContainer</div>,
    TileLayer: () => <div>TileLayer</div>,
    Marker: () => <div>Marker</div>,
    Popup: () => <div>Popup</div>,
    useMap: () => ({ setView: vi.fn() }),
}));
vi.mock('react-qr-code', () => {
    return { default: () => <div>QRCode</div> };
});

// Mock Leaflet CSS
vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('leaflet', () => {
    const L = {
        Icon: {
            Default: {
                prototype: { _getIconUrl: vi.fn() },
                mergeOptions: vi.fn(),
            }
        }
    };
    return { default: L, ...L };
});

describe('App Component', () => {
    it('renders the main title', () => {
        render(<App />);
        // Based on translations.en.title "♻️ Food Redistribution Platform"
        const titleElement = screen.getByText(/Food Redistribution Platform/i);
        expect(titleElement).toBeInTheDocument();
    });
});
