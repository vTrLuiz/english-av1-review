# English AV1 Review Quiz Design

## Purpose

Create a polished, shareable A1 English review experience for the user's classmates. The application must preserve the useful material from the existing quiz while following the supplied Review 1 presentation closely. It must work well on mobile devices, explain mistakes clearly, save local progress, and publish as a static public website through GitHub.

## Source material

The Review 1 presentation is the canonical source for the assessed content:

1. Jessie, 26, from Japan: complete and answer questions about nickname, age, origin, nationality, and appearance.
2. Kyle, 32, from Colombia: write questions that match answers about first name, nationality, age, origin, and appearance.
3. Jessie and Kyle's dialogue: complete the missing WH words in context, including how, why, where, what, and when.
4. Role-play: meeting a new friend online and talking about a perfect match.

The existing HTML quiz supplies useful question patterns, immediate feedback, local progress, scoring, topic selection, keyboard shortcuts, and error review. Its 500-question bank is highly repetitive, so the redesign will retain relevant concepts rather than preserve every generated variation.

## Audience and language

The audience is Portuguese-speaking A1 English learners preparing for AV1. Instructions, feedback, and grammar explanations will use concise Brazilian Portuguese. Questions, answers, profiles, and dialogue practice will remain in English.

## Learning structure

The home screen offers three paths:

### Guided review

The guided review follows the presentation in order:

1. Jessie's profile and WH question completion.
2. Kyle's answers and question construction.
3. The Jessie and Kyle dialogue with contextual WH words.
4. Role-play preparation with prompts and useful sentence starters.

Each step introduces the underlying rule before a short practice activity. Learners may move backward and forward without losing answers.

### AV1 simulation

The simulation draws a balanced set of questions from four assessed skills:

- WH questions
- personal profiles
- dialogue comprehension
- core grammar and vocabulary

The default simulation contains 20 questions. Question order and answer choices vary between attempts. The simulation shows overall progress but does not reveal the final percentage until completion.

### Review my mistakes

The application stores incorrect question identifiers locally. This mode presents those questions again and removes each one from the review list after the learner answers it correctly. If no errors are stored, the screen explains that clearly and offers a new simulation.

## Exercise types

The question bank uses a small set of accessible interaction patterns:

- single-choice completion for WH words and grammar;
- matching a supplied answer to the correct question;
- profile comprehension using Jessie and Kyle;
- dialogue completion in conversational context;
- structured role-play prompts with model language and a checklist.

The application will not depend on drag-and-drop. Every activity must work with touch, mouse, and keyboard.

## Feedback model

After each objective answer, the learner receives:

- a clear correct or incorrect state;
- the correct sentence in full;
- a short explanation in Portuguese;
- a targeted hint that addresses the likely misconception.

Incorrect feedback must explain the language rule rather than merely reveal the right option. The interface announces feedback through an accessible live region and moves focus predictably to the next available action.

Role-play activities do not receive an artificial numeric score. They provide model phrases and a self-check list covering greeting, personal information, WH questions, and a natural closing.

## Results

The results screen shows:

- total score and percentage;
- performance by the four assessed skills;
- the questions answered incorrectly;
- a short recommendation based on the weakest skill;
- actions to retry mistakes or start a new simulation.

Results and stored mistakes stay on the learner's device. The application has no account, analytics, remote database, or personal-data collection.

## Visual direction

The interface uses an independent educational identity with a subtle visual reference to the source deck. It does not reproduce the Sesc logo or imply official institutional publication.

The palette combines deep blue, turquoise, warm off-white, and restrained coral. Jessie and Kyle appear through lightweight typographic profile illustrations and country cues rather than copied photographs. Cards use generous spacing and a clear reading hierarchy. Motion remains short and optional.

Mobile layout receives priority. Primary actions have comfortable touch targets, questions remain readable with text zoom, and sticky controls never cover content. Wider screens may use two columns for profile or review material when that improves comprehension.

## Accessibility

The application targets WCAG 2.2 AA practices relevant to a static learning tool:

- semantic headings, landmarks, buttons, and form controls;
- complete keyboard access and visible focus;
- sufficient color contrast without relying on color alone;
- `aria-live` announcements for answer feedback;
- logical focus management between questions;
- touch targets of at least 44 by 44 CSS pixels;
- support for browser text zoom and narrow screens;
- respect for `prefers-reduced-motion`;
- meaningful labels in Portuguese and correct language metadata for English passages.

## Technical architecture

The deliverable is a framework-free static web application:

- `index.html` contains semantic page structure and metadata.
- `styles.css` owns responsive layout, theme tokens, component states, and motion preferences.
- `src/questions.js` contains validated learning content and stable identifiers.
- `src/quiz-engine.js` contains pure scoring, selection, progress, and recommendation logic.
- `src/storage.js` wraps local storage and falls back to in-memory state when storage is unavailable.
- `src/app.js` renders screens, manages navigation and focus, and connects the interface to the engine.
- `tests/` verifies content and behavior.

The application uses ES modules and no production dependencies. A lightweight development and test setup may use Node.js. GitHub Pages serves the built source directly without a server or build step.

## Navigation and state

The interface behaves as a single-page application while preserving meaningful browser history. Major screens update the URL hash so the browser Back action returns to the previous screen instead of discarding the session unexpectedly.

In-progress answers remain in memory. Completed question history, best score, and the mistake list persist in local storage. Corrupted or unavailable stored data is ignored safely and replaced with valid defaults.

## Error handling

- Storage failures do not block the quiz.
- Unknown routes return to the home screen with a short message.
- An empty question selection produces an explanatory state instead of a blank screen.
- Invalid question records fail automated validation before publication.
- The interface prevents double submissions and keeps the next action available after feedback.

## Testing and acceptance criteria

Automated tests cover:

- question schema, stable identifiers, valid correct answers, category coverage, and duplicate detection;
- balanced simulation selection;
- scoring and per-skill results;
- mistake persistence and removal after correction;
- storage fallback behavior;
- recommendation logic;
- main user journeys on desktop and a mobile viewport;
- keyboard interaction and focus transitions;
- automated accessibility checks on the main screens.

Manual verification confirms:

- all learning content matches the five presentation slides;
- the guided review, simulation, and mistake-review flows complete successfully;
- layouts remain usable on narrow and wide screens;
- reduced-motion and text enlargement work;
- the static site loads correctly from its GitHub Pages subpath.

## Repository and publication

The repository will include source files, tests, a license, a clear README, and a GitHub Actions workflow for static GitHub Pages deployment. The README explains the learning scope, how to run the site locally, how to run tests, and how classmates can use the published version.

After verification, the project will be committed and pushed to a new public repository in the user's connected GitHub account. The final handoff will include only URLs confirmed by GitHub. If repository creation or Pages deployment fails, the handoff will state the exact limitation instead of inventing a URL.

## Out of scope

- user accounts or cloud synchronization;
- teacher dashboards or analytics;
- speech recognition or automatic pronunciation grading;
- multiplayer features;
- a content-management system;
- copying institutional logos or representing the quiz as an official Sesc publication.
