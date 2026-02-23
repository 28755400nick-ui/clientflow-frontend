import '@testing-library/jest-dom';

// Mock next/navigation globally
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: jest.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: jest.fn((key: string, value: string) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete localStorageMock.store[key];
  }),
  clear: jest.fn(() => {
    localStorageMock.store = {};
  }),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Reset between tests
beforeEach(() => {
  localStorageMock.store = {};
  jest.clearAllMocks();
});
