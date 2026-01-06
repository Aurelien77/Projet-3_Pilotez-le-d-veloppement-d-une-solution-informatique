module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|scss|sass|less)$": "identity-obj-proxy",
    "\\.(jpg|jpeg|png|gif)$": "<rootDir>/src/__mocks__/fileMock.js",
    "\\.svg$": "<rootDir>/src/__mocks__/svgrMock.js",
  },
  testMatch: ["**/__tests__/**/*.test.tsx", "**/__tests__/**/*.test.ts"],
  roots: ["<rootDir>/src"],
  clearMocks: true,
  verbose: true,
};
