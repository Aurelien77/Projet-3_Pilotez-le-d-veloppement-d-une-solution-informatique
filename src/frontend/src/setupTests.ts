// setupTests.ts
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder
global.TextDecoder = TextDecoder as any;
global.TextEncoder = TextEncoder as any;

// ... autres mocks (matchMedia, IntersectionObserver, ResizeObserver, localStorage, sessionStorage, fetch) ...

// Mock console pour ignorer certains warnings React
const originalError = console.error;
const originalLog = console.log;

let errorSpy: jest.SpyInstance;
let logSpy: jest.SpyInstance;

beforeAll(() => {
  errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
});

afterAll(() => {
  if (errorSpy.mockRestore) errorSpy.mockRestore();
  if (logSpy.mockRestore) logSpy.mockRestore();
});

// Nettoyer après chaque test
afterEach(() => {
  jest.clearAllMocks();
  global.localStorage.clear?.();
  global.sessionStorage.clear?.();
});
