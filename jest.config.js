/**
 * Jest config for Pharos.
 *
 * Uses the `jest-expo` preset so React Native component tests (RNTL) and the
 * pure-TS domain tests run under one command. The domain layer imports nothing
 * from RN/Expo, so its tests are unaffected by the preset's RN transform.
 */
/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@state/(.*)$': '<rootDir>/src/state/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|react-native-gesture-handler|drizzle-orm|zustand))',
  ],
  clearMocks: true,
};
