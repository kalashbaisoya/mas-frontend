# mas-frontend

Lightweight frontend for the MAS project — a modern, maintainable React-based UI scaffold with sensible defaults for development, testing and deployment.

## Table of contents
- About
- Features
- Tech stack
- Quickstart
- Scripts
- Project structure
- Environment
- Testing
- Contributing
- License

## About
This repository contains the frontend application for MAS. It's intended to be a single-page application (SPA) focused on performance, accessibility and developer experience.

## Features
- React + TypeScript starter
- Component-driven architecture
- Routing and state management (configurable)
- Theming and responsive layout
- Linting, formatting and pre-commit hooks
- CI-friendly build and test setup

## Tech stack
- React
- TypeScript
- Vite (or Create React App — adapt as needed)
- React Router
- CSS Modules / Tailwind / Styled Components (pick one)
- Jest + Testing Library
- ESLint + Prettier
- Husky / lint-staged

## Quickstart

1. Clone
    git clone <repo-url> mas-frontend
    cd mas-frontend

2. Install
    npm install
    # or
    yarn

3. Development
    npm run dev
    # or
    yarn dev
    Open http://localhost:3000 (or port printed by the dev server)

4. Build
    npm run build
    # or
    yarn build
    Output in `dist/` (or `build/` depending on tool)

5. Preview production build
    npm run preview
    # or
    yarn preview

## Scripts
- dev — start development server with HMR
- build — produce production bundle
- preview — locally preview production build
- test — run unit tests
- lint — run ESLint
- format — run Prettier
- typecheck — run TypeScript type checks

(See package.json for exact script names and args.)

## Project structure (suggested)
- src/
  - components/      # reusable UI components
  - pages/           # routed page components
  - hooks/           # reusable hooks
  - services/        # API and data layer
  - styles/          # global styles / theme
  - assets/          # images, icons
  - App.tsx
  - main.tsx
- public/            # static assets
- tests/             # e2e or integration tests (optional)
- .eslintrc, tsconfig.json, vite.config.ts, package.json

## Environment
Create a .env file from .env.example (if present). Common variables:
- VITE_API_URL=https://api.example.com
- VITE_FEATURE_FLAG=true

Do not commit secrets.

## Testing
- Unit tests: npm run test
- Coverage: npm run test -- --coverage
- E2E: configure and run Cypress/Playwright if included

## Contributing
1. Fork the repo
2. Create a branch: feature/<name> or fix/<issue>
3. Run linters and tests before commit
4. Open a pull request with a clear description and related issue

Follow commit message conventions and add tests for new logic.

## License
MIT — update LICENSE file as needed.

initial release:
- feat: Add Login, Regenerate OTP, Verify OTP, and Welcome pages

- Implemented LoginPage with security question handling and error management.
- Created RegenerateOTPPage for generating new OTPs with email input.
- Developed VerifyOTPPage for OTP verification and resending OTP functionality.
- Added WelcomePage for navigation to login and registration.
- Introduced polyfills for Buffer, process, and crypto for compatibility.
- Set up websocketManager for handling WebSocket connections and subscriptions.
- Created websocketService for managing WebSocket client creation and presence updates.
- Configured Tailwind CSS and Vite for styling and build processes.
