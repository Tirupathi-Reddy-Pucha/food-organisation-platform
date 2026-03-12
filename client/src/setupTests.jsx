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

// Mock matchMedia
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

// Mock Geolocation
global.navigator.geolocation = {
    getCurrentPosition: vi.fn().mockImplementation((success) =>
        Promise.resolve(
            success({
                coords: {
                    latitude: 19.076,
                    longitude: 72.877,
                },
            })
        )
    ),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
};

// Mock ResizeObserver
class ResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}
window.ResizeObserver = ResizeObserver;

// Global mock for framer-motion
const filterProps = (props) => {
  const { 
    whileHover, whileTap, initial, animate, transition, exit,
    viewport, variants, layout, transitionEnd, onAnimationComplete,
    ...rest 
  } = props;
  return rest;
};

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...filterProps(props)}>{children}</div>,
    nav: ({ children, ...props }) => <nav {...filterProps(props)}>{children}</nav>,
    span: ({ children, ...props }) => <span {...filterProps(props)}>{children}</span>,
    button: ({ children, ...props }) => <button {...filterProps(props)}>{children}</button>,
    section: ({ children, ...props }) => <section {...filterProps(props)}>{children}</section>,
    h1: ({ children, ...props }) => <h1 {...filterProps(props)}>{children}</h1>,
    p: ({ children, ...props }) => <p {...filterProps(props)}>{children}</p>,
    img: (props) => <img {...filterProps(props)} />,
  },
  AnimatePresence: ({ children }) => children,
}));
