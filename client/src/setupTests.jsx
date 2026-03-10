// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global mocks for DOM APIs not available in jsdom
class IntersectionObserver {
    observe = vi.fn()
    disconnect = vi.fn()
    unobserve = vi.fn()
}
Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});

// Global mocks for Leaflet
vi.mock('leaflet', () => {
    const L = {
        Icon: function () { return {}; },
        icon: function () { return {}; },
        Marker: {
            prototype: { options: {} }
        },
        DivIcon: function () { return {}; }
    };
    L.Icon.Default = {
        prototype: { _getIconUrl: vi.fn() },
        mergeOptions: vi.fn(),
    };
    return { default: L, ...L };
});

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }) => <div data-testid="popup">{children}</div>,
    Polyline: () => <div data-testid="polyline" />,
    useMap: () => ({ setView: vi.fn() }),
}));

vi.mock('react-qr-code', () => ({
    default: () => <div data-testid="qr-code" />
}));

vi.mock('html5-qrcode', () => ({
    Html5QrcodeScanner: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        clear: vi.fn().mockResolvedValue()
    }))
}));

vi.mock('react-webcam', () => ({
    default: () => <div data-testid="webcam" />
}));
