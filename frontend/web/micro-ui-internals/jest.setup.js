import '@testing-library/jest-dom';

// Add fetch polyfill for Node.js environment
const FormData = require('form-data');
global.FormData = FormData;

// Mock fetch responses
const mockFetch = jest.fn((url, options) => {
  // Mock OTP send response
  if (url.includes('/user-otp/v1/_send')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ ResponseInfo: { status: "successful" } })
    });
  }

  // Mock OTP verify response
  if (url.includes('/user/oauth/token')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        access_token: "mock-token-123",
        UserRequest: {
          id: 24226,
          uuid: "8d3ef17c-630d-4e12-a455-eff48c700f18",
          userName: "77335577",
          name: "Test Architect",
          mobileNumber: "77335577",
          emailId: "architect@test.com",
          type: "CITIZEN"
        },
        ResponseInfo: { status: "successful" }
      })
    });
  }

  // Mock other API calls to return empty successful responses
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  });
});

global.fetch = mockFetch;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  unobserve() { }
};

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();

// Setup test timeout
jest.setTimeout(30000);
