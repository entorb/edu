# Flashcards Monorepo

This is a pnpm workspace monorepo hosting two Vue.js/Quasar educational applications using flashcards

- [apps/1x1](apps/1x1) ([CLAUDE.md](apps/1x1/CLAUDE.md)): Multiplication practice app (1x1 tables learning)
- [apps/voc](apps/voc) ([CLAUDE.md](apps/voc/CLAUDE.md)): Vocabulary learning app
- [packages/shared](packages/shared) ([CLAUDE.md](packages/shared/CLAUDE.md)): shared code for both apps

## Instructions

- do not create commits, but propose to the user to create a commit
- run `pnpm run check` after each step (includes format, lint, types, spell, and tests in parallel)
- run `pnpm run cy:run:1x1` and `pnpm run cy:run:voc` after each phase
- all text must be defined in @packages/shared/src/text-de.ts
- Vitest unit tests are placed next to the files they test and use the `.spec.ts` suffix: e.g. `CardsPage.vue` and `CardsPage.spec.ts`. DO NOT copy functions from the source file to the test file, import them!
- in Cypress e2e tests, use data-cy= locators instead of text or ids (Cypress is using the dev server)

### Prevent SonarQube Issues

**Critical patterns to avoid:**

1. **globalThis vs window**: Always use `globalThis` instead of `window` or `global`
   - Correct: `globalThis.localStorage`
   - Incorrect: `window.localStorage` or `global.localStorage`

2. **Loop syntax**: Prefer `for...of` over `.forEach()`
   - Correct: `for (const item of array) { ... }`
   - Incorrect: `array.forEach(item => { ... })`

3. **Number parsing**: Use `Number.parseInt()` instead of `parseInt()`
   - Correct: `Number.parseInt(str, 10)`
   - Incorrect: `parseInt(str)`

4. **String sorting with localeCompare**: Always use explicit comparator for string sorts
   - Correct: `items.sort((a, b) => a.localeCompare(b))`
   - Incorrect: `items.sort()` (uses default string comparison)

5. **Avoid redundant assignments**: Never assign a variable to itself or re-assign the same value immediately
   - Incorrect: `let x = 5; if (condition) x = 5;` (second assignment is redundant)
   - Correct: Check condition before assignment or omit redundant assignment

6. **Consolidate imports**: Combine multiple imports from the same module
   - Correct: `import type { Card, SelectionType } from '@/types'`
   - Incorrect: `import type { Card } from '@/types'; import type { SelectionType } from '@/types'`

7. **Function types vs interfaces**: For callable types (emit functions), use function type syntax instead of interface with call signature
   - Correct: `type Emits = (e: 'event') => void`
   - Incorrect: `interface Emits { (e: 'event'): void }`

8. **Cognitive complexity**: Extract nested logic into separate functions when complexity exceeds 15
   - Keep functions focused with single responsibility
   - Extract helper functions for complex conditional branches
   - Example: `addExtendedCards()` was refactored into `generateFeature1x2Cards()`, `generateFeature1x12Cards()`, `generateFeature1x20Cards()`

9. **Array push consolidation**: Avoid multiple separate `.push()` calls; use spread operator instead
   - Correct: `array.push(...newItems)` (single call)
   - Incorrect: `array.push(item1); array.push(item2);` (multiple calls)

10. **Separate complex statements**: Avoid chaining method calls on array operations
    - Correct: `const items = array.map(...); items.sort(...);` (separate statement)
    - Incorrect: `const items = array.map(...).sort(...)` (chained, harder to read)

## Fetching SonarCloud Issues

The project is configured with SonarCloud for continuous code quality analysis. To fetch and review issues:

**View issues in browser (no auth required):**

```bash
# Open the SonarCloud project dashboard in your browser
https://sonarcloud.io/project/issues?id=entorb_flashcards
```

**Fetch issues via API (for automation/scripting):**

```bash
# Get all issues in JSON format
curl "https://sonarcloud.io/api/issues/search?componentKeys=entorb_flashcards&ps=500" | jq '.'

# Get specific issue fields (severity, type, file, line, message)
curl "https://sonarcloud.io/api/issues/search?componentKeys=entorb_flashcards&ps=500" | \
  jq '.issues[] | {severity: .severity, type: .type, file: .component, line: .line, message: .message}'

# Filter by severity (CRITICAL, MAJOR, MINOR, INFO, BLOCKER)
curl "https://sonarcloud.io/api/issues/search?componentKeys=entorb_flashcards&severities=CRITICAL" | jq '.'

# Filter by issue type (BUG, VULNERABILITY, CODE_SMELL)
curl "https://sonarcloud.io/api/issues/search?componentKeys=entorb_flashcards&types=CODE_SMELL" | jq '.'
```

**Key SonarCloud Metrics:**

- **Rules:** TypeScript, JavaScript, Vue.js linting rules
- **Project Key:** `entorb_flashcards`
- **Organization:** `entorb`

## Tech Stack

- pnpm
- Vue.js
- Quasar Framework, no custom styles
- Typescript with strict rules
- Prettier
- ESLint
- Vitest unit tests
- Cypress E2E test
- [SonarQube](https://sonarcloud.io/project/issues?id=entorb_flashcards)

## Quick Navigation

See individual CLAUDE.md files for detailed documentation:

- **[apps/1x1/CLAUDE.md](apps/1x1/CLAUDE.md)** - Multiplication learning app (28 cards, 5-level system, weighted selection)
- **[apps/voc/CLAUDE.md](apps/voc/CLAUDE.md)** - Vocabulary learning app (custom cards, 3 modes, spaced repetition)
- **[packages/shared/CLAUDE.md](packages/shared/CLAUDE.md)** - Shared code (types, storage, components, base store)

## Central Files

**Shared resources used by both apps:**

- **Text (i18n):** `packages/shared/src/text-de.ts` - All German UI strings, organized by scope
- **Constants:**
  - `packages/shared/src/constants.ts`
  - `apps/1x1/src/constants.ts`
  - `apps/vov/src/constants.ts`
- **Types:**
  - `packages/shared/src/types.ts` - Shared types (BaseCard, GameStats, etc.)
  - `apps/1x1/src/types.ts` - 1x1 app types (extends BaseCard)
  - `apps/voc/src/types.ts` - Wordplay app types (extends BaseCard)
- **Base Game Store:** `packages/shared/src/composables/useBaseGameStore.ts` - Shared state management factory
- **Storage Services:** `packages/shared/src/services/storage.ts` - Generic localStorage operations

### Directory Layout

```text
/Users/torben/GitHub/flashcards/
├── apps/
│   ├── 1x1/              # Multiplication flashcard app (port 5173/4173)
│   └── voc/         # Vocabulary flashcard app (port 5174/4174)
├── packages/
│   └── shared/           # Shared components, text, and utilities
├── pnpm-workspace.yaml   # Workspace configuration
├── package.json          # Root workspace scripts
├── tsconfig.json         # TypeScript project references
├── tsconfig.base.json    # Shared TypeScript config
├── vite.config.base.ts   # Shared Vite configuration
├── vitest.config.base.ts # Shared Vitest configuration
└── eslint.config.ts      # Shared ESLint configuration
```

## Common Commands

All commands should be run from the repository root:

```bash
# Install dependencies
pnpm install

# Development (runs both apps in parallel)
pnpm dev

# Development (single app)
pnpm dev:1x1
pnpm dev:voc

# Build all apps (with types pre-flight)
pnpm build

# Build single app
pnpm build:1x1
pnpm build:voc

# Preview all apps (parallel)
pnpm preview:all

# Preview single app
pnpm preview:1x1
pnpm preview:voc

# Run all tests
pnpm test

# Run tests for single app
pnpm --filter 1x1 test
pnpm --filter voc test

# Run single test file
pnpm --filter 1x1 vitest src/services/storage.spec.ts

# Run Cypress E2E tests
pnpm run cy:run:1x1
pnpm run cy:run:voc

# Quality checks (all below in parallel)
pnpm run check

# Type checking
pnpm run types

# Linting with auto-fix
pnpm run lint

# Formatting with auto-fix
pnpm run format

# Spell checking
pnpm run spell
```

### Script Details

**`pnpm build`** - Runs types automatically before building (via `prebuild` hook)

**`pnpm run check`** - Comprehensive quality check that runs:

1. All unit tests first (fail-fast)
2. Then quality checks in parallel: format, lint, types, spell

**`pnpm run check`** - Runs quality checks in parallel

## Architecture Patterns

### Configuration Consolidation

The monorepo uses a **base configuration + app-specific overrides** pattern:

1. **TypeScript**: `tsconfig.base.json` contains shared compiler options. Each app's `tsconfig.app.json` extends the base and adds app-specific paths including `@flashcards/shared` mappings.

2. **Vite**: `vite.config.base.ts` exports common build/server settings. Apps use `mergeConfig()` to add app-specific settings (base path, ports, PWA config).

3. **Vitest**: `vitest.config.base.ts` exports a `getVitestConfig(rootDir)` function. Each app's config is just 3 lines importing and calling this function.

4. **ESLint/Prettier**: Single root-level config shared by all apps.

### Port Configuration

Each app has hardcoded ports to enable concurrent development:

- **1x1 app**: Dev port 5173, Preview port 4173 (Vite defaults)
- **voc app**: Dev port 5174, Preview port 4174 (incremented)

### Shared Package (@flashcards/shared)

The shared package provides:

- **TEXT_DE**: Centralized German text strings with structured sections:
  - `common`: Shared actions (start, continue, check, correct, incorrect, etc.)
  - `nav`: Navigation labels (stats, history)
  - `stats`: Shared statistics labels
  - `oneXone`: 1x1 app specific text
  - `voc`: Wordplay app specific text
- **AppFooter**: Shared footer component (imported via `@flashcards/shared/components`)
- **helperStatsDataRead/Write**: Shared statistics helpers

**Import patterns:**

```typescript
// In Vue components and TypeScript files
import { TEXT_DE, helperStatsDataRead } from '@flashcards/shared'
import { AppFooter } from '@flashcards/shared/components'
```

**Important:** Do NOT import TEXT_DE or BASE_PATH in `vite.config.ts` files. This causes Node.js ESM resolution issues. Use hardcoded constants instead:

```typescript
// vite.config.ts - CORRECT approach
const BASE_PATH = '1x1' // or 'voc'
const APP_TITLE = "Vyvit's 1x1 Spiel" // or "Rabat's Wortspiel"

// vite.config.ts - INCORRECT (causes runtime errors)
import { BASE_PATH } from './src/config/constants'
import { TEXT_DE } from '@flashcards/shared'
```

### BASE_PATH Constant Pattern

Each app defines `BASE_PATH` as the first constant in `src/config/constants.ts`:

```typescript
// apps/1x1/src/config/constants.ts
export const BASE_PATH = '1x1'

// apps/voc/src/config/constants.ts
export const BASE_PATH = 'voc'
```

This constant is used for:

- Router base path configuration
- Cypress baseUrl
- Database collection names: `STATS_DB_COL = BASE_PATH`

**Note:** BASE_PATH is **hardcoded separately** in `vite.config.ts` to avoid ESM resolution issues.

### Consolidation Limitations

**Do NOT attempt to consolidate:**

1. **tsconfig.node.json**: Each app has a ~30 line config with `composite: true` and must include shared package files. Attempting inheritance causes `vue-tsc` to hang indefinitely. The duplication is acceptable.

2. **vitest.workspace.ts**: Using a workspace config causes path resolution failures (`@/services/storage` not found). The 3-line per-app configs are optimal.

3. **vite.config.ts constants**: BASE_PATH and APP_TITLE must be hardcoded in each app's vite.config.ts. Importing from source files causes Node.js ESM module resolution failures.

## Application Details

See [apps/1x1/CLAUDE.md](apps/1x1/CLAUDE.md) and [apps/voc/CLAUDE.md](apps/voc/CLAUDE.md) for detailed specifications including:

- Architecture and file structure
- Game logic and algorithms
- Component documentation
- Testing strategies

## Technology Stack

- **Framework**: Vue 3 (Composition API) with Quasar
- **Build Tool**: Vite 6.x
- **Testing**: Vitest 2.1.9, Cypress 15.5.0
- **TypeScript**: Strict mode with project references and path mappings
- **Storage**: localStorage (flashcards, history, stats, settings)
- **Package Manager**: pnpm with workspaces (v9.0.0+)
- **PWA**: @vite-pwa/vite-plugin with service workers
- **Code Quality**: ESLint, Prettier, cspell
- **Shared Package**: @flashcards/shared (workspace package)

## PWA Implementation

Both apps are configured as Progressive Web Apps (PWAs) with offline support and automatic updates.

### Service Worker Registration

**Pattern** (`apps/*/src/main.ts`):

```typescript
// Register PWA service worker after app is mounted
import { registerSW } from 'virtual:pwa-register'
import { TEXT_DE } from '@flashcards/shared'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Prompt user before reloading to prevent data loss
    if (confirm(TEXT_DE.pwaUpdate.confirmMessage)) {
      updateSW(true)
    }
  }
})
```

**Key Points:**

- Registration occurs **after** `app.mount()` to ensure DOM is ready
- `immediate: true` checks for updates on every page load (browser HTTP caching prevents excessive traffic)
- `onNeedRefresh()` callback prompts user before reload
- Uses centralized German text: `TEXT_DE.pwaUpdate.confirmMessage`

### Vite PWA Configuration

**Pattern** (`apps/*/vite.config.ts`):

```typescript
{
  VitePWA({
    registerType: 'prompt', // Returns update function (NOT 'autoUpdate')
    manifest: {
      name: APP_TITLE,
      short_name: APP_TITLE
      // ... icons and other manifest properties
    }
  })
}
```

**Critical Configuration:**

- `registerType: 'prompt'` - Provides callback for custom update handling
- `registerType: 'autoUpdate'` returns undefined and will cause runtime errors
- Manifest includes app title and icons for home screen installation

### Display Mode Detection

**Pattern** (`packages/shared/src/components/PwaInstallInfo.vue`):

```typescript
const isPwaInstalled = ref(false)

onMounted(() => {
  const isStandalone =
    globalThis.matchMedia('(display-mode: standalone)').matches ||
    (globalThis.navigator as Navigator & { standalone?: boolean }).standalone === true
  isPwaInstalled.value = isStandalone
})
```

**Behavior:**

- Hides install instructions when app is already running as installed PWA
- Works on desktop, Android, and iOS
- Uses `globalThis` for SonarQube compliance

### Update Message

**Centralized Text** (`packages/shared/src/text-de.ts`):

```typescript
pwaUpdate: {
  confirmMessage: 'Neue Version verfügbar. Neu laden?'
}
```

### Update Flow

1. Service worker checks for updates on every page load
2. If update available, `onNeedRefresh()` callback fires
3. User sees confirmation dialog (native `confirm()`)
4. If user accepts, app reloads with new version
5. User data is preserved in localStorage

### PWA Important Notes

- **Automatic Checks**: Browser handles HTTP cache headers to prevent excessive traffic
- **No Force Updates**: Users can manually close/reopen app to force check (respects their control)
- **Data Safety**: Confirmation prompt prevents accidental loss of unsaved game data
- **Type Declarations**: Requires `apps/*/src/vite-env.d.ts` with PWA type references

## Important Notes

**Text Internationalization (i18n)**: All user-facing text is in `@flashcards/shared/src/text-de.ts`:

- Shared: `TEXT_DE.common.*`, `TEXT_DE.nav.*`, `TEXT_DE.stats.*`
- 1x1: `TEXT_DE.oneXone.*`
- Wordplay: `TEXT_DE.voc.*`

**TypeScript Configuration**: Each app's tsconfig includes `@flashcards/shared` path mappings. The shared package uses `composite: true` without `noEmit` for project references.

**Known Issues**:

- Do NOT import TEXT_DE/BASE_PATH in `vite.config.ts` - causes ESM errors. Hardcode constants instead.
- `vue-tsc` hangs if tsconfig.node.json uses inheritance - keep configs duplicated.
- Ensure path mappings in both tsconfig.app.json and tsconfig.node.json for `@flashcards/shared`.

**Pre-commit**: Run `pnpm run types` to ensure TypeScript compliance across all apps and packages.
