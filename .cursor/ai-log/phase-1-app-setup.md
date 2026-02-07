# React Canvas App Setup Plan

## Overview

Create a new React application with TypeScript, Vite, and all necessary tooling for building a Miro-like canvas-based web application.

## Project Structure

```
canvas-lab/
├── src/
│   ├── app/                 # App shell: routes, providers, layout
│   │   ├── providers/       # Context providers, Zustand store providers
│   │   ├── layout/          # Layout components
│   │   └── routes/          # Route definitions (if routing needed)
│   ├── features/            # Vertical slices: feature-based organization
│   │   └── canvas/          # Example feature (Miro-like canvas)
│   │       ├── components/  # Feature-specific UI components
│   │       ├── hooks/       # Feature-specific hooks
│   │       ├── store/       # Zustand store for this feature
│   │       ├── api/         # API calls for this feature
│   │       ├── types/       # TypeScript types for this feature
│   │       └── __tests__/   # Feature tests
│   ├── shared/              # Reusable UI + utilities (no feature knowledge)
│   │   ├── ui/              # Shared UI components (Button, Input, etc.)
│   │   ├── hooks/           # Shared hooks
│   │   ├── utils/           # Utility functions
│   │   └── lib/             # Third-party library wrappers
│   ├── entities/            # Optional: domain objects used across features
│   │   └── [entity-name]/   # Entity-specific code
│   ├── styles/              # Global styles
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Vite type definitions
├── public/                  # Static assets
├── tests/                   # Test utilities and setup
│   └── setup.ts             # Vitest and MSW setup
├── .vscode/                 # VS Code settings
├── .husky/                  # Git hooks
├── .eslintrc.cjs            # ESLint configuration
├── .prettierrc              # Prettier configuration
├── .prettierignore          # Prettier ignore patterns
├── .cursor/                 # Cursor IDE rules and documentation
│   ├── rules/               # Cursor rules (.mdc files)
│   │   ├── dev-docs.mdc     # Dev docs rule (alwaysApply: true)
│   │   └── retrospective.mdc # Retrospective rule (alwaysApply: true)
│   └── docs/                # Generated developer documentation
│       ├── index.md         # Main dev docs file (auto-generated)
│       └── CHANGELOG.md     # Changelog tracking dev docs updates
├── tsconfig.json            # TypeScript config (strict mode)
├── tsconfig.node.json       # TypeScript config for Vite
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── package.json             # Dependencies and scripts
├── pnpm-lock.yaml           # pnpm lockfile
└── README.md                # Project documentation
```

## Implementation Steps

### 1. Initialize Vite Project

- Use `pnpm create vite@latest` with React + TypeScript template
- Configure Vite for React Compiler support

### 2. TypeScript Configuration

- Set up `tsconfig.json` with strict mode enabled
- Configure path aliases for feature-based structure:
  - `@/app` → `src/app`
  - `@/features` → `src/features`
  - `@/shared` → `src/shared`
  - `@/entities` → `src/entities`
- Set up `tsconfig.node.json` for Vite config files

### 3. React Compiler Setup

- Install `babel-plugin-react-compiler`
- Configure Vite to use React Compiler via Babel plugin
- Add React Compiler ESLint plugin

### 4. Styling Setup

- Install Tailwind CSS and dependencies (`tailwindcss`, `postcss`, `autoprefixer`)
- Configure `tailwind.config.js` with content paths
- Set up `postcss.config.js`
- Create base Tailwind CSS file in `src/styles/`
- Configure Tailwind for canvas-specific utilities

### 5. Linting and Formatting

- Install ESLint with React, TypeScript, and React Compiler plugins
- Configure `.eslintrc.cjs` with strict rules
- Install Prettier and configure `.prettierrc`
- Set up `.prettierignore`
- Configure VS Code settings for auto-format on save

### 6. Testing Setup

- Install Vitest and related dependencies (`vitest`, `@vitest/ui`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`)
- Configure `vitest.config.ts` with React Testing Library setup
- Install MSW (`msw`) and set up handlers
- Create `tests/setup.ts` for test utilities and MSW server initialization
- Configure Vitest to use the setup file

### 7. State Management

- Install Zustand
- Create example feature store structure in `src/features/[feature-name]/store/`
- Set up Zustand provider in `src/app/providers/` if needed
- Each feature manages its own state/actions within its directory

### 8. Git Hooks

- Install Husky and lint-staged
- Set up pre-commit hook to run linting and formatting
- Configure `lint-staged` to run ESLint and Prettier on staged files

### 9. Package Scripts

- Set up scripts in `package.json`:
  - `dev`: Start development server
  - `build`: Production build
  - `preview`: Preview production build
  - `test`: Run Vitest tests
  - `test:ui`: Run Vitest with UI
  - `lint`: Run ESLint
  - `format`: Run Prettier
  - `type-check`: Run TypeScript type checking

### 10. Basic App Structure

- Create `src/app/` directory structure:
  - `app/providers/` for context/store providers
  - `app/layout/` for layout components
- Create `src/shared/` directory:
  - `shared/ui/` for reusable UI components
  - `shared/hooks/` for shared hooks
  - `shared/utils/` for utility functions
- Create example feature structure in `src/features/canvas/`:
  - `components/` for canvas UI components
  - `hooks/` for canvas-specific hooks
  - `store/` for canvas Zustand store
  - `api/` for canvas API calls
  - `types/` for canvas TypeScript types
  - `__tests__/` for canvas tests
- Create minimal `App.tsx` with Tailwind styling
- Set up basic routing structure in `app/routes/` (if needed later)

### 11. Documentation

- Create `README.md` with setup instructions, tech stack overview, and development guidelines

### 12. Cursor Rules Setup

#### Dev Docs Rule

- Create Cursor rule file `.cursor/rules/dev-docs.mdc` with YAML frontmatter:
  - Set `alwaysApply: true` so it applies in all Cursor modes (composer, chat, etc.)
  - Include description: "Internal developer documentation context foundation"
- The dev docs rule content should:
  - **Require confirmation**: Always include "dev docs considered" confirmation message in responses
  - **Generate and maintain** internal developer documentation that includes:
    - **Project Purpose**: Explanation of what this project is and its goals
    - **Design Patterns**: Established patterns (e.g., features pattern for app structure)
    - **Best Practices**: Code quality standards and conventions
    - **Testing Guidelines**: Standards for writing unit tests
    - **Codebase Overview**: Human-readable documentation parsing the entire codebase, making it easy for developers to quickly understand what the app contains
  - **Use as context foundation**: The dev docs should be referenced for all planning and implementation tasks
  - **Update mechanism**: Instructions to update dev docs when codebase changes significantly
- Create initial dev docs file structure in `.cursor/docs/index.md` or `docs/index.md`
- The rule should guide the AI to parse the codebase and generate comprehensive, human-readable documentation

#### Retrospective Rule

- Create Cursor rule file `.cursor/rules/retrospective.mdc` with YAML frontmatter:
  - Set `alwaysApply: true` so it applies in all Cursor modes
  - Include description: "Retrospective process for evaluating developer documentation usage"
- The retrospective rule content should:
  - **Trigger**: When the user writes "do a retrospective", perform a retrospective on the current chat thread in relation to the developer documentation
  - **Ask three key questions**:
    1. **Was the developer documentation considered?** - Check if dev docs were referenced and used during the task
    2. **Was the developer documentation correct and did it help in your task?** - Evaluate accuracy and usefulness
    3. **Does the developer documentation need to be updated with new changes from the accomplished task?** - Identify gaps or outdated information
  - **For each question**: If the answer is "no" or "partially", reason about why and improve the documentation so that it works better next time
  - **Action items**:
    - Update the developer documentation file (`.cursor/docs/index.md`) with improvements, corrections, or new information discovered during the retrospective
    - **Update changelog**: Fill in `.cursor/docs/CHANGELOG.md` with entries tracking:
      - **What changed**: Description of the documentation change
      - **Why**: Reason for the change (based on retrospective findings)
      - **When**: Timestamp/date of the change
  - **Changelog format**: Use a simple, readable format (e.g., date-based entries with bullet points)

## Key Configuration Files

### `vite.config.ts`

- React Compiler plugin configuration
- Path alias resolution:
  - `@/app` → `src/app`
  - `@/features` → `src/features`
  - `@/shared` → `src/shared`
  - `@/entities` → `src/entities`
- Test environment setup

### `tsconfig.json`

- Strict mode enabled
- Path mapping for feature-based imports (`@/app`, `@/features`, `@/shared`, `@/entities`)
- ES2020+ target
- Module resolution settings

### `vitest.config.ts`

- React Testing Library setup
- MSW integration
- Path alias resolution
- Coverage configuration

### `.eslintrc.cjs`

- React Compiler rules
- TypeScript rules
- Prettier integration
- Import ordering rules

## Dependencies Summary

**Core:**

- react, react-dom (latest)
- typescript
- vite

**React Compiler:**

- babel-plugin-react-compiler
- eslint-plugin-react-compiler

**Styling:**

- tailwindcss
- postcss
- autoprefixer

**Testing:**

- vitest
- @vitest/ui
- @testing-library/react
- @testing-library/jest-dom
- jsdom
- msw

**State Management:**

- zustand

**Linting/Formatting:**

- eslint
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser
- eslint-plugin-react
- eslint-plugin-react-hooks
- eslint-plugin-react-compiler
- eslint-config-prettier
- prettier

**Git Hooks:**

- husky
- lint-staged

## Notes

- **Feature-based architecture**: Each feature is self-contained with its own components, hooks, state, API calls, types, and tests
- **Shared layer**: Contains only reusable UI components and utilities that have no feature-specific knowledge
- **App layer**: Contains app-level concerns like routing, providers, and layout
- **Entities layer**: Optional domain objects that are shared across multiple features
- **Cursor Dev Docs Rule**: A rule that always applies and requires "dev docs considered" confirmation, maintaining comprehensive internal documentation
- **Cursor Retrospective Rule**: A rule that always applies and triggers when user says "do a retrospective" to evaluate dev docs usage, ask three key questions, improve documentation based on findings, and update a changelog file tracking what changed, why, and when
- Canvas library selection deferred until initial setup is complete
- React Router can be added later if routing is needed
- Environment variables setup can be added if needed
- Path aliases configured for cleaner imports (`@/app`, `@/features`, `@/shared`, `@/entities`)
