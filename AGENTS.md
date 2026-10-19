# Repository Guidelines

## Project Structure & Module Organization

`backend/src/` contains the Express API, IMAP/SMTP services, routes, utilities, and plugin runtime; migrations live in `backend/migrations/`. `frontend/src/` contains the React UI, translations, utilities, and plugins. Desktop and Android packaging is under `frontend/packages/`. Treat the GTD directories as the reference plugin implementation. Deployment files are at the root; screenshots and branding assets are in `media/`.

## Build, Test, and Development Commands

Use Node.js 22 and install each package independently:

```bash
cd backend && npm ci
npm run dev          # watch and run the API
npm test             # Vitest suite
npm run lint         # ESLint; zero warnings allowed
npm run lint:plugins # enforce plugin import boundaries

cd ../frontend && npm ci
npm run dev          # Vite development server
npm run build        # production bundle
npm test             # Node test runner
npm run lint
```

Run the complete stack with `docker compose up -d --build` after copying `.env.example` to `.env` and configuring required secrets.

## Coding Style & Naming Conventions

Use ES modules, async/await, two-space indentation, semicolons, and single quotes, matching nearby code. React components use PascalCase filenames; functions, utilities, and hooks use camelCase. Name migrations with the next zero-padded sequence, such as `0067_description.sql`. Comments should explain surprising rationale, not obvious mechanics. Frontend styling primarily uses inline `style={{ ... }}` objects and shared rules in `frontend/src/index.css`; Tailwind is not the prevailing convention. Discuss new dependencies first.

## Testing Guidelines

Place tests beside implementations as `*.test.js`, `*.test.jsx`, or `*.test.cjs`. Behavior changes need a regression test proven to fail without the fix. Run the affected package's tests and lint; backend plugin changes must also pass `npm run lint:plugins`. CI builds the frontend and audits production dependencies.

## Commit & Pull Request Guidelines

Use Conventional Commits, for example `fix(imap): handle stalled connections`. Write imperative subjects under 72 characters with no trailing period. Branches follow `fix/describe-the-fix` or `feat/describe-the-feature`. Keep one focused PR open per author; discuss large features, refactors, dependencies, or core behavior changes in an issue first. Complete the PR template with summary, changes, testing evidence, linked issues, and screenshots for UI changes. CI, maintainer approval, and the CLA checkbox are required.

## Security & Reliability

Never commit `.env`, credentials, email content, or production data. Mail deletion, migrations, authentication, encryption, sanitization, and IMAP connection lifecycle are high-risk areas; preserve fail-loud behavior and seek maintainer review. Prefer plugins over core changes when the capability surface permits it.
