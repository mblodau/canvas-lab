# Canvas Lab

A Miro-like canvas-based web application built with React, TypeScript, and modern tooling.

## Tech Stack

- **React 19** - Latest React with React Compiler enabled
- **TypeScript** - Type-safe development with strict mode
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Fast unit test framework
- **MSW** - API mocking for tests
- **Zustand** - Lightweight state management
- **ESLint** - Code linting with React Compiler support
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

## Project Structure

This project follows a **feature-based architecture**:

```
src/
├── app/                 # App shell: routes, providers, layout
│   ├── providers/       # Context providers, Zustand store providers
│   ├── layout/          # Layout components
│   └── routes/         # Route definitions
├── features/           # Vertical slices: feature-based organization
│   └── canvas/         # Example feature (Miro-like canvas)
│       ├── components/ # Feature-specific UI components
│       ├── hooks/      # Feature-specific hooks
│       ├── store/      # Zustand store for this feature
│       ├── api/        # API calls for this feature
│       ├── types/      # TypeScript types for this feature
│       └── __tests__/  # Feature tests
├── shared/             # Reusable UI + utilities (no feature knowledge)
│   ├── ui/            # Shared UI components (Button, Input, etc.)
│   ├── hooks/         # Shared hooks
│   ├── utils/         # Utility functions
│   └── lib/           # Third-party library wrappers
└── entities/          # Optional: domain objects used across features
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (install with `npm install -g pnpm`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

### Building

Create a production build:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Create production build
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## Code Quality

This project uses:

- **ESLint** for linting (with React Compiler plugin)
- **Prettier** for code formatting
- **Husky** git hooks to run linting/formatting on commit
- **lint-staged** to only lint/format staged files

## Testing

Tests are written with Vitest and React Testing Library. MSW is used for API mocking.

Run tests:

```bash
pnpm test
```

Run tests with UI:

```bash
pnpm test:ui
```

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/app` → `src/app`
- `@/features` → `src/features`
- `@/shared` → `src/shared`
- `@/entities` → `src/entities`
- `@/*` → `src/*`

## Development Guidelines

### Feature Development

- Each feature is self-contained with its own components, hooks, state, API calls, types, and tests
- Features should not import from other features directly
- Shared code goes in `src/shared/`
- Domain objects shared across features go in `src/entities/`

### State Management

- Use Zustand for feature-level state management
- Each feature has its own store in `features/[feature-name]/store/`
- Global app state can be managed in `app/providers/`

### Testing

- Write tests for all features in `__tests__/` directories
- Use MSW for API mocking
- Follow React Testing Library best practices

## AI-Assisted Development

This project uses AI-assisted development with Cursor IDE. All AI-generated plans used for this project are documented in the `.cursor/ai-log/` folder.

## License

MIT
