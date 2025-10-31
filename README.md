# Flashcards Apps

This is a pnpm workspace monorepo hosting two Vue.js/Quasar educational applications using flashcards

- [apps/1x1](apps/1x1): Multiplication practice app (1x1 tables learning)
- [apps/voc](apps/voc): Vocabulary learning app

## Tech Stack

- pnpm
- Vue.js
- Quasar Framework, no custom styles
- Typescript with strict rules
- Prettier
- ESLint
- Vitest unit tests
- Cypress E2E test
- [SonarCloud](https://sonarcloud.io/project/issues?id=entorb_flashcards) for code quality analysis

## Scripts

```sh
# Development
pnpm install             # Install all dependencies
pnpm dev                 # Run both apps in parallel
pnpm dev:1x1             # Run only 1x1 app
pnpm dev:voc        # Run only voc app

# Build
pnpm build               # Build all apps
pnpm build:1x1           # Build only 1x1 app
pnpm build:voc      # Build only voc app

# Preview
pnpm preview             # Preview all apps in parallel
pnpm preview:1x1         # Preview only 1x1 app
pnpm preview:voc    # Preview only voc app

# Quality Checks
pnpm types          # Type check all apps and packages
pnpm lint                # Lint all code
pnpm format              # Format all code
pnpm test                # Run tests in all apps
pnpm spell               # Spell check all files
pnpm check               # Run all checks

# Testing Vitest Unit Tests
pnpm run test

# Testing Cypress E2E Tests
pnpm run cy:run:1x1
pnpm run cy:run:voc

# Maintenance
pnpm clean               # Remove all node_modules and dist folders
pnpm clean:cache         # Remove cache files
```
