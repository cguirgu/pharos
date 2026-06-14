// RNTL's built-in matchers are auto-registered by @testing-library/react-native
// v12.4+. This file is the place for any global test setup (mocks, timers).

// Silence the reanimated layout-animation warning in tests.
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
