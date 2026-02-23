import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Apunta al directorio raíz de Next.js para leer next.config.js y .env.local
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',

  // Se ejecuta después de que jest-environment-jsdom se configura
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    // Resuelve alias @ → src/
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Archivos de test a buscar
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Excluir carpetas
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],

  // Cobertura
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/types/**',
  ],
};

export default createJestConfig(config);
