# Jest Testing Setup

This directory contains the Jest testing setup for the micro-ui-internals project.

## Setup

To get started with testing, you'll need to install the dependencies:

```bash
cd frontend/web/micro-ui-internals/tests
npm install
```

## Running Tests

### Available Scripts

- `npm test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode (re-runs on file changes)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:debug` - Run tests in debug mode

### Examples

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- SampleComponent.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="should handle"
```

## Test Structure

### Test Files Location

Tests can be placed in:

- `__tests__/` directory (current setup)
- Files ending with `.test.js` or `.spec.js`

### Sample Tests

The setup includes sample tests to demonstrate:

- Basic Jest assertions
- React component testing with React Testing Library
- Mock functions
- Async operations

## Configuration

### Jest Configuration (`jest.config.js`)

The Jest configuration includes:

- **Test Environment**: jsdom for DOM testing
- **Transform**: Babel for JSX and ES6+ support
- **Module Mapping**: For CSS modules and assets
- **Coverage**: Collection and reporting settings
- **Setup**: Global test setup and mocks

### Babel Configuration (`babel.config.js`)

Babel is configured with:

- `@babel/preset-env` for modern JavaScript
- `@babel/preset-react` for JSX support
- `@babel/plugin-transform-runtime` for runtime helpers

### Test Setup (`jest.setup.js`)

Global test setup includes:

- DOM testing utilities
- Mock implementations for browser APIs
- Extended Jest matchers

## Writing Tests

### Basic Test Structure

```javascript
describe("Component Name", () => {
  test("should do something", () => {
    // Test implementation
    expect(actual).toBe(expected);
  });
});
```

### React Component Testing

```javascript
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MyComponent from "../components/MyComponent";

describe("MyComponent", () => {
  test("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  test("handles user interactions", () => {
    const mockHandler = jest.fn();
    render(<MyComponent onClick={mockHandler} />);

    fireEvent.click(screen.getByRole("button"));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### Testing Components from Packages

To test components from the packages directory:

```javascript
// Import components from the packages
import { Button } from "../packages/ui-components/src/atoms/Button";
import { SomeModule } from "../packages/modules/core/src/components/SomeModule";

describe("Button Component", () => {
  test("renders with correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

### End-to-End (E2E) API Testing

The test suite includes a complete E2E test for the architect application flow that makes real API calls:

```javascript
// Example E2E test structure
describe("Architect Application E2E Flow - Sequential Execution", () => {
  test("Sequential E2E Flow with Parallel File Uploads", async () => {
    // Step 0: OAuth Authentication
    const authInfo = await loginAndGetAuthInfo();
    expect(authInfo.authToken).toBeDefined();

    // Step 1: Search for permits (Sequential)
    const servicesResponse = await apiRequest(`${API_BASE_URL}/public-service/v1/service?tenantId=${TENANT_ID}`);

    // Step 2: Get MDMS configuration (Sequential)
    const mdmsResponse = await apiRequest(`${API_BASE_URL}/egov-mdms-service/v2/_search`, {
      method: "POST",
      body: JSON.stringify({
        /* ... */
      }),
    });

    // Step 3: Get workflow configuration (Sequential)
    const workflowResponse = await apiRequest(`${API_BASE_URL}/egov-workflow-v2/egov-wf/businessservice/_search`);

    // Step 4: Create DRAFT application (Sequential)
    const draftResponse = await apiRequest(`${API_BASE_URL}/public-service/v1/application/${SERVICE_CODE}`, {
      method: "POST",
      body: JSON.stringify({
        /* RequestInfo uses real authInfo */
      }),
    });

    // Step 5: Upload multiple documents in PARALLEL
    const uploadedFiles = await uploadMultipleFiles(filesToUpload, authInfo.authToken);

    // Step 6: Submit final application (Sequential)
    const submitResponse = await apiRequest(`${API_BASE_URL}/public-service/v1/application/${SERVICE_CODE}`, {
      method: "PUT",
      body: JSON.stringify({
        /* RequestInfo uses real authInfo */
      }),
    });

    // Assertions
    expect(submitResponse.Application.applicationNumber).toBeDefined();
  });
});
```

**Key Features of E2E Tests:**

- **Real Authentication**: Uses OAuth login to get real auth tokens
- **Real API Calls**: No mocks - tests actual API endpoints
- **Complete Flow**: Tests the entire architect application process
- **Live Data**: Uses real test data from flow documentation
- **Parallel File Upload**: Tests multiple file uploads simultaneously
- **Workflow Testing**: Verifies business process workflow actions
- **Sequential Execution**: Ensures proper step-by-step flow except for file uploads

**Running E2E Tests:**

```bash
# Run only E2E tests
npm test -- --testPathPattern=e2e

# Run specific E2E test
npm test -- architect-application-flow.test.js

# Run E2E tests with detailed output
npm test -- --verbose architect-application-flow.test.js
```

## Coverage

Coverage reports are generated in the `coverage/` directory and include:

- HTML report (`coverage/lcov-report/index.html`)
- LCOV report (`coverage/lcov.info`)
- Text summary in terminal

Coverage thresholds are set to 50% for:

- Branches
- Functions
- Lines
- Statements

## Mocking

### Mock Functions

```javascript
const mockFn = jest.fn();
mockFn("test");
expect(mockFn).toHaveBeenCalledWith("test");
```

### Mock Modules

```javascript
jest.mock("../path/to/module", () => ({
  someFunction: jest.fn(),
}));
```

### Mock API Calls

```javascript
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: "test" }),
  })
);
```

## Best Practices

1. **Test Structure**: Use descriptive test names and group related tests
2. **Isolation**: Each test should be independent
3. **Coverage**: Aim for meaningful coverage, not just high percentages
4. **Mocking**: Mock external dependencies and APIs
5. **Assertions**: Use specific assertions that clearly show intent
6. **Setup/Teardown**: Use `beforeEach`/`afterEach` for test setup

## Troubleshooting

### Common Issues

1. **Module not found**: Check import paths and ensure dependencies are installed
2. **Transform errors**: Verify Babel configuration for JSX/ES6 support
3. **DOM not available**: Ensure `testEnvironment: 'jsdom'` in config
4. **CSS imports failing**: Check module name mapping in Jest config

### Debug Tips

- Use `console.log` in tests for debugging
- Use `screen.debug()` to see rendered DOM
- Run tests with `--verbose` flag for detailed output
- Use `--detectOpenHandles` to find hanging promises

## Dependencies

Main testing dependencies:

- `jest` - Testing framework
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - Additional Jest matchers
- `babel-jest` - Babel transformer for Jest
- `identity-obj-proxy` - Mock CSS modules
- `jest-environment-jsdom` - DOM environment for tests
- `node-fetch` - HTTP client for E2E API calls
- `form-data` - Form data support for file uploads
