# English AV1 Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a mobile-first A1 English review application aligned with the supplied Review 1 presentation.

**Architecture:** A framework-free static application separates canonical learning content, pure quiz logic, local persistence, view rendering, and orchestration. ES modules run directly in the browser and under Node's test runner; Playwright covers complete browser flows and accessibility.

**Tech Stack:** HTML5, CSS, JavaScript ES modules, Node.js 20+, `node:test`, Playwright, `@axe-core/playwright`, GitHub Actions, GitHub Pages

**Spec:** `docs/superpowers/specs/2026-10-16-english-av1-review-design.md`

## Global Constraints

- Keep the production site framework-free with no production dependencies or build step.
- Use Brazilian Portuguese for instructions and feedback and English for learning prompts and answers.
- Treat presentation slides 2 through 5 as the canonical learning source.
- Do not copy the Sesc logo, source photographs, or imply official institutional publication.
- Store progress only in the learner's browser; collect no personal data or analytics.
- Support keyboard, touch, 200% text zoom, narrow screens, visible focus, and reduced motion.
- Serve every asset correctly from a GitHub Pages repository subpath.

## Review Focus

- Corrupted or unavailable local storage must fall back to valid in-memory state without blocking a session; Task 3 pins this behavior.
- A requested simulation size larger than the bank must return every eligible question once and never duplicate one; Task 2 pins this behavior.
- A stale stored mistake ID that no longer exists in the bank must be ignored; Tasks 3 and 6 pin this behavior.
- Browser Back from an active question must return to the previous major screen without losing the in-memory session; Task 4 pins this behavior.
- Rapid double activation of an answer must record exactly one response and expose one next action; Task 6 pins this behavior.

---

## File map

- `index.html`: semantic document shell, metadata, and application mount point.
- `styles.css`: design tokens, responsive layout, component states, focus, contrast, and reduced motion.
- `src/questions.js`: 40 validated objective questions, 10 per assessed skill.
- `src/review-content.js`: the four guided-review steps and exact Jessie, Kyle, dialogue, and role-play content.
- `src/content-validation.js`: question and guided-content schema checks.
- `src/quiz-engine.js`: selection, grading, scoring, skill summaries, and recommendations.
- `src/storage.js`: versioned local persistence with an in-memory fallback.
- `src/router.js`: hash route parsing, browser-history updates, and route notifications.
- `src/views.js`: semantic screen templates and DOM event binding.
- `src/app.js`: application state and coordination among content, engine, storage, router, and views.
- `tests/*.test.mjs`: Node unit and content tests.
- `tests/e2e/*.spec.mjs`: Playwright user-journey, responsive, keyboard, and accessibility tests.
- `scripts/serve.mjs`: dependency-free local static server used by Playwright and contributors.
- `.github/workflows/test.yml`: CI verification.
- `.github/workflows/pages.yml`: static GitHub Pages publication.
- `README.md`, `LICENSE`, `.gitignore`, `package.json`, `playwright.config.mjs`: project and release support.

### Task 1: Canonical content and validation

**Files:**
- Create: `package.json`
- Create: `src/questions.js`
- Create: `src/review-content.js`
- Create: `src/content-validation.js`
- Create: `tests/content-validation.test.mjs`
- Create: `.gitignore`

**Interfaces:**
- Produces: `QUESTIONS: Question[]`, `GUIDED_REVIEW: ReviewStep[]`, `validateQuestions(questions): string[]`, and `validateGuidedReview(steps): string[]`.
- `Question` fields: `id`, `skill`, `prompt`, `options`, `correctIndex`, `correctSentence`, `explanationPt`, `hintPt`, and `sourceSlide`.
- `ReviewStep` fields: `id`, `title`, `introPt`, `content`, `practiceQuestionIds`, and `sourceSlide`.

- [ ] **Step 1: Create the Node test harness and write failing content tests**

  Assert 40 questions, exactly 10 questions in each of `wh`, `profiles`, `dialogue`, and `grammar`; unique IDs; four unique options; valid correct indices; non-empty feedback; no normalized duplicate prompt-and-answer pairs; and four ordered review steps named `jessie`, `kyle`, `dialogue`, and `roleplay`.

- [ ] **Step 2: Run the content test and confirm the imports fail**

  Run: `npm test -- tests/content-validation.test.mjs`
  Expected: FAIL because the content modules do not exist.

- [ ] **Step 3: Implement the validators and the smallest canonical content set that passes**

  Use the presentation's exact facts: Jessie is 26 and from Japan; Kyle is 32 and from Colombia; the dialogue answers require `How`, `Why`, `Where`, `What`, `When`, and `What`; the role-play offers meeting a new friend online and discussing a perfect match. Preserve useful grammar patterns from the old quiz only when they reinforce this material.

- [ ] **Step 4: Run the content tests**

  Run: `npm test -- tests/content-validation.test.mjs`
  Expected: PASS with 0 validation errors.

- [ ] **Step 5: Commit**

  Run: `git add package.json .gitignore src/questions.js src/review-content.js src/content-validation.js tests/content-validation.test.mjs && git commit -m "feat: add validated AV1 learning content"`

### Task 2: Quiz engine

**Files:**
- Create: `src/quiz-engine.js`
- Create: `tests/quiz-engine.test.mjs`

**Interfaces:**
- Consumes: `Question` objects from Task 1.
- Produces: `selectSimulation(questions, { count, random }): Question[]`, `gradeQuestion(question, selectedIndex): Grade`, `summarizeResults(questions, answers): Results`, and `recommendWeakSkill(perSkill): Recommendation`.
- `Grade` fields: `correct`, `correctIndex`, `correctSentence`, `explanationPt`, and `hintPt`.
- `Results` fields: `answered`, `correct`, `percentage`, `perSkill`, and `mistakeIds`.

- [ ] **Step 1: Write failing engine tests**

  Cover a balanced 20-question simulation with five questions per skill, deterministic injection of `random`, a request larger than the bank, a correct and incorrect grade, per-skill totals, percentage rounding, mistake IDs, and weakest-skill recommendation with a stable tie order.

- [ ] **Step 2: Run the engine tests and confirm failure**

  Run: `npm test -- tests/quiz-engine.test.mjs`
  Expected: FAIL because `src/quiz-engine.js` does not exist.

- [ ] **Step 3: Implement the pure engine functions**

  Keep selection free of global state and avoid mutating the imported question array. Use the skill order `wh`, `profiles`, `dialogue`, `grammar` for balancing and tie-breaking.

- [ ] **Step 4: Run all unit tests**

  Run: `npm test`
  Expected: PASS.

- [ ] **Step 5: Commit**

  Run: `git add src/quiz-engine.js tests/quiz-engine.test.mjs && git commit -m "feat: add balanced quiz engine"`

### Task 3: Resilient local progress

**Files:**
- Create: `src/storage.js`
- Create: `tests/storage.test.mjs`

**Interfaces:**
- Produces: `createProgressStore(storage, validQuestionIds): ProgressStore`.
- `ProgressStore` methods: `load(): ProgressState`, `recordResult(questionId, correct, percentage): ProgressState`, `clear(): ProgressState`.
- `ProgressState` fields: `version: 1`, `mistakeIds: string[]`, `completedIds: string[]`, and `bestScore: number | null`.

- [ ] **Step 1: Write failing storage tests**

  Cover empty state, save/load, mistake removal after correction, best-score retention, stale ID filtering, malformed JSON, and a storage object whose getter and setter both throw.

- [ ] **Step 2: Run the storage tests and confirm failure**

  Run: `npm test -- tests/storage.test.mjs`
  Expected: FAIL because `createProgressStore` is missing.

- [ ] **Step 3: Implement the versioned store with in-memory fallback**

  Use one key, `english-av1-review-progress`, and never propagate storage exceptions to callers.

- [ ] **Step 4: Run all unit tests**

  Run: `npm test`
  Expected: PASS.

- [ ] **Step 5: Commit**

  Run: `git add src/storage.js tests/storage.test.mjs && git commit -m "feat: persist quiz progress safely"`

### Task 4: Semantic shell and navigation

**Files:**
- Create: `index.html`
- Create: `src/router.js`
- Create: `src/views.js`
- Create: `src/app.js`
- Create: `scripts/serve.mjs`
- Create: `playwright.config.mjs`
- Create: `tests/router.test.mjs`
- Create: `tests/e2e/navigation.spec.mjs`

**Interfaces:**
- Consumes: content, engine, and store interfaces from Tasks 1 through 3.
- Produces: routes `#/home`, `#/review/:step`, `#/quiz/:index`, `#/mistakes/:index`, and `#/results`; `createRouter(window): Router`; `renderScreen(root, viewModel): ViewBindings`; `startApp({ window, document }): AppController`.

- [ ] **Step 1: Write failing route and navigation tests**

  Unit-test valid route parsing and unknown-route fallback. In Playwright, assert that the home screen exposes three paths, starting guided review changes the hash, and browser Back returns home while retaining the active review state.

- [ ] **Step 2: Run the focused tests and confirm failure**

  Run: `npm test -- tests/router.test.mjs && npx playwright test tests/e2e/navigation.spec.mjs`
  Expected: FAIL because the shell and router do not exist.

- [ ] **Step 3: Implement the semantic shell, router, minimal views, and app controller**

  Include a skip link, one `main` landmark, a persistent progress header only during activities, and an `aria-live="polite"` status region. Keep all asset links relative so the same files work under a repository subpath.

- [ ] **Step 4: Run unit and navigation tests**

  Run: `npm test && npx playwright test tests/e2e/navigation.spec.mjs`
  Expected: PASS.

- [ ] **Step 5: Commit**

  Run: `git add index.html src/router.js src/views.js src/app.js scripts/serve.mjs playwright.config.mjs tests/router.test.mjs tests/e2e/navigation.spec.mjs && git commit -m "feat: add accessible application shell"`

### Task 5: Guided review

**Files:**
- Modify: `src/views.js`
- Modify: `src/app.js`
- Create: `tests/e2e/guided-review.spec.mjs`

**Interfaces:**
- Consumes: `GUIDED_REVIEW`, `gradeQuestion`, `renderScreen`, and route navigation.
- Produces: complete `#/review/:step` flow with answer feedback, previous/next navigation, model phrases, and the role-play checklist.

- [ ] **Step 1: Write a failing guided-review journey**

  Assert the ordered Jessie, Kyle, dialogue, and role-play screens; the six dialogue WH answers; full-sentence feedback; keyboard activation; preserved answers when moving backward; and no numeric score on role-play.

- [ ] **Step 2: Run the journey and confirm failure**

  Run: `npx playwright test tests/e2e/guided-review.spec.mjs`
  Expected: FAIL on the first missing guided-review behavior.

- [ ] **Step 3: Implement the guided-review view models and interactions**

  After feedback, keep focus on a visible status heading or next button. Mark English passages with `lang="en"` and keep explanations in the document's `pt-BR` language.

- [ ] **Step 4: Run the guided-review and unit suites**

  Run: `npm test && npx playwright test tests/e2e/guided-review.spec.mjs`
  Expected: PASS.

- [ ] **Step 5: Commit**

  Run: `git add src/views.js src/app.js tests/e2e/guided-review.spec.mjs && git commit -m "feat: add guided AV1 review"`

### Task 6: Simulation, results, and mistake review

**Files:**
- Modify: `src/views.js`
- Modify: `src/app.js`
- Create: `tests/e2e/simulation.spec.mjs`
- Create: `tests/e2e/mistakes.spec.mjs`

**Interfaces:**
- Consumes: Tasks 1 through 4 interfaces.
- Produces: 20-question simulation, progress display, locked single-answer feedback, per-skill result summary, recommendation, and stored mistake-retry flow.

- [ ] **Step 1: Write failing simulation and mistake-review journeys**

  Assert 20 unique balanced questions, hidden final percentage during play, one recorded answer after rapid double activation, immediate didactic feedback, final per-skill results, weakest-skill recommendation, retry of only valid mistake IDs, and removal of a mistake after a correct retry.

- [ ] **Step 2: Run the journeys and confirm failure**

  Run: `npx playwright test tests/e2e/simulation.spec.mjs tests/e2e/mistakes.spec.mjs`
  Expected: FAIL on missing simulation behavior.

- [ ] **Step 3: Implement simulation and mistake-review state transitions**

  Disable answer controls after the first activation, persist results after each answer, and route empty mistake lists to an explanatory screen with a new-simulation action.

- [ ] **Step 4: Run all functional tests**

  Run: `npm test && npx playwright test tests/e2e/navigation.spec.mjs tests/e2e/guided-review.spec.mjs tests/e2e/simulation.spec.mjs tests/e2e/mistakes.spec.mjs`
  Expected: PASS.

- [ ] **Step 5: Commit**

  Run: `git add src/views.js src/app.js tests/e2e/simulation.spec.mjs tests/e2e/mistakes.spec.mjs && git commit -m "feat: add simulation and mistake review"`

### Task 7: Visual system, responsive behavior, and accessibility

**Files:**
- Create: `styles.css`
- Modify: `index.html`
- Modify: `src/views.js`
- Create: `tests/e2e/accessibility.spec.mjs`
- Create: `tests/e2e/responsive.spec.mjs`

**Interfaces:**
- Consumes: semantic states and data attributes from Tasks 4 through 6.
- Produces: documented CSS tokens and responsive components with correct focus, contrast, error, success, and reduced-motion states.

- [ ] **Step 1: Write failing accessibility and responsive checks**

  Run axe on home, review, active quiz, feedback, and results. At 390 by 844 and 1280 by 800, assert no horizontal overflow, 44-pixel primary targets, visible focused controls, and usable content at 200% browser zoom. Emulate reduced motion and assert transition durations become effectively zero.

- [ ] **Step 2: Run the visual checks and confirm failure**

  Run: `npx playwright test tests/e2e/accessibility.spec.mjs tests/e2e/responsive.spec.mjs`
  Expected: FAIL because the visual system is absent.

- [ ] **Step 3: Implement the approved visual direction**

  Define deep blue, turquoise, warm off-white, and restrained coral tokens; create lightweight typographic profile portraits and country cues without copied images; use a single-column mobile flow and a restrained two-column wide layout; never rely on color alone.

- [ ] **Step 4: Run the full browser suite and inspect screenshots**

  Run: `npx playwright test`
  Expected: PASS with no axe violations or viewport overflow. Inspect Playwright screenshots for home, Jessie review, dialogue, quiz feedback, and results at both target viewports.

- [ ] **Step 5: Commit**

  Run: `git add styles.css index.html src/views.js tests/e2e/accessibility.spec.mjs tests/e2e/responsive.spec.mjs && git commit -m "feat: add responsive accessible visual design"`

### Task 8: Documentation, CI, Pages, and public handoff

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `.github/workflows/test.yml`
- Create: `.github/workflows/pages.yml`
- Create: `tests/release-config.test.mjs`

**Interfaces:**
- Consumes: the verified static application and test commands.
- Produces: contributor instructions, MIT license, CI, Pages deployment, and a confirmed public repository and site URL.

- [ ] **Step 1: Write failing release-configuration tests**

  Assert the README names all three learning modes and documents `npm test`, Playwright, and local serving; assert the test workflow runs unit and browser suites; assert the Pages workflow deploys the repository root through the official Pages actions.

- [ ] **Step 2: Run the release test and confirm failure**

  Run: `npm test -- tests/release-config.test.mjs`
  Expected: FAIL because release files do not exist.

- [ ] **Step 3: Add documentation and workflows**

  The README must state that this is an independent study aid based on supplied review material and is not an official Sesc publication.

- [ ] **Step 4: Run complete local verification**

  Run: `npm test && npx playwright test`
  Expected: all tests PASS. Then run the static server and verify `index.html`, modules, styles, unknown hash fallback, and a simulated repository subpath return successfully.

- [ ] **Step 5: Commit the release configuration**

  Run: `git add README.md LICENSE .github/workflows/test.yml .github/workflows/pages.yml tests/release-config.test.mjs && git commit -m "docs: prepare public GitHub Pages release"`

- [ ] **Step 6: Create and push the public GitHub repository**

  Use the authenticated GitHub account, prefer repository name `english-av1-review`, confirm no conflicting repository exists, create it as public, add the returned remote, and push `main`. Do not invent a URL if any operation fails.

- [ ] **Step 7: Verify the remote and publication**

  Confirm the remote default branch contains the local HEAD SHA, inspect the GitHub Actions runs until test and Pages workflows reach terminal status, and open the returned Pages URL. Report the repository URL and live site URL only after each one responds successfully.
