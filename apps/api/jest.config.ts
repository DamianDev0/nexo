import { nestConfig } from '@repo/jest-config'

export default {
  ...nestConfig,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.spec.json' }],
  },
  collectCoverageFrom: [
    'modules/auth/**/*.(t|j)s',
    '!modules/auth/**/__tests__/**',
    '!modules/auth/**/*.spec.ts',
    '!modules/auth/**/*.module.ts',
    '!modules/auth/**/*.dto.ts',
    '!modules/auth/**/*.interface.ts',
    '!modules/auth/**/*.guard.ts',
    '!modules/auth/**/*.strategy.ts',
    '!modules/auth/**/*.constants.ts',
  ],
}
