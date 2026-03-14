/**
 * Shared Prettier configuration for the NexoCRM monorepo.
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  // Line length
  printWidth: 100,

  // Indentation
  tabWidth: 2,
  useTabs: false,

  // Semicolons — false keeps code clean, consistent with codebase
  semi: false,

  // Quotes
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,

  // Trailing commas — 'all' gives cleaner git diffs
  trailingComma: 'all',

  // Brackets
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // Line endings — LF always, regardless of OS
  endOfLine: 'lf',

  // Auto-format embedded languages (template literals, etc.)
  embeddedLanguageFormatting: 'auto',
}

export default config
