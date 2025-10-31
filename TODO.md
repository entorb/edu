# TODO

## Tech

## Both

- check which constants can be moved to the shared package
- Update @apps/1x1/README.md and @apps/1x1/AGENTS.md

## 1x1

## Wordplay

- Extract all logic configuration parameters / constants to apps/voc/src/config/constants.ts

---

## AI Proposals for 1x1

- Display scoring rules to the user
- 10er, 12er, 20er -> local storage, respect in stats

Additional Code Improvement Proposals

### High Priority

#### Add Dark Mode Support

- Leverage Quasar's dark mode plugin
- Add theme toggle in settings
- Use CSS variables for better theme switching
- Adjust color constants to support dark theme

#### Progressive Enhancement

- Add loading states with skeletons for better perceived performance
- Implement service worker caching strategies for faster subsequent loads
- Add offline mode indicator

#### Accessibility Improvements

- Add ARIA labels to interactive elements
- Improve keyboard navigation (tab order, focus indicators)
- Add screen reader announcements for game feedback
- Ensure color contrast meets WCAG AA standards
- Add skip navigation links

#### Performance Optimization

- Lazy load route components
- Add virtual scrolling for history list when it grows large
- Debounce localStorage writes
- Use shallowRef where deep reactivity isn't needed

#### Error Handling

- Add error boundaries for graceful failure
- Add retry logic for failed web stats API calls
- Validate localStorage data with schema validation (e.g., Zod)
- Handle quota exceeded errors for localStorage

### Medium Priority

#### Enhanced Statistics

- Add charts/graphs for progress over time (using Chart.js or similar)
- Show average time per level
- Display success rate trends
- Add weekly/monthly statistics views

#### Gamification

- Add achievements/badges system
- Implement streaks (days played consecutively)
- Add sound effects for correct/wrong answers (with mute toggle)
- Celebrate milestones (100 correct answers, all level 5, etc.)

#### Settings Page

- Add dedicated settings page
- Allow customization of auto-submit behavior
- Configurable timer settings
- Theme selection
- Sound effects toggle

#### Internationalization (i18n)

- Set up Vue I18n plugin
- Extract all TEXT constants to translation files
- Support German (current) and English
- Add language switcher

#### Testing Improvements

- Add E2E tests for all critical paths
- Increase unit test coverage for edge cases
- Add visual regression tests
- Test accessibility with axe-core

### Low Priority

#### Analytics & Insights

- Add privacy-friendly analytics (e.g., Plausible)
- Track common mistakes
- Identify problematic multiplication pairs
- Export statistics as CSV

#### Social Features

- Add share functionality for results
- Allow exporting progress as image
- Create shareable achievements

#### Advanced Game Modes

- Timed challenge mode (60 seconds, max points)
- Endless mode
- Multiplayer mode (local)
- Practice mode for specific cards

#### Code Quality

- Add JSDoc comments for complex functions
- Set up automated dependency updates (Dependabot)
- Add commit message linting (commitlint)
- Implement pre-commit hooks for linting

#### Developer Experience

- Add Storybook for component development
- Create component documentation
- Add development mode with mock data
- Set up automatic changelog generation
