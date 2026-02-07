# Canvas Lab

A Miro-like canvas-based web application built with React, TypeScript, and modern tooling.

## Tech Stack

- **React 19** - Latest React with React Compiler enabled
- **TypeScript** - Type-safe development with strict mode
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Vitest** - Fast unit test framework
- **Zustand** - Lightweight state management
- **ESLint** - Code linting with React Compiler support
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Run linters on staged files

## Project Structure

This project follows a **feature-based architecture**:

```
src/
├── features/           # Vertical slices: feature-based organization
│   ├── canvas/        # Canvas feature (Miro-like infinite canvas)
│   │   ├── components/ # Feature-specific UI components
│   │   ├── hooks/      # Feature-specific hooks
│   │   ├── types/     # TypeScript types for this feature
│   │   ├── utils/     # Utility functions
│   │   └── __tests__/ # Feature tests
│   └── comments/      # Comment thread system feature
│       ├── components/ # Feature-specific UI components
│       ├── store/      # Zustand store for this feature
│       ├── types/     # TypeScript types for this feature
│       └── __tests__/ # Feature tests
└── shared/            # Reusable utilities (no feature knowledge)
    └── utils/         # Utility functions
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

Tests are written with Vitest and React Testing Library.

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

- `@/features` → `src/features`
- `@/shared` → `src/shared`
- `@/*` → `src/*`

## Development Guidelines

### Feature Development

- Each feature is self-contained with its own components, hooks, state, types, and tests
- Pragmatic cross-feature dependencies are acceptable when features are tightly coupled (e.g., canvas importing comment store). The dependent feature knows about the dependency, but the dependency has no knowledge of the dependent feature.
- Shared code goes in `src/shared/`

### State Management

- Use Zustand for feature-level state management
- Each feature has its own store in `features/[feature-name]/store/` when needed
- Component state can use `useState`/`useRef` for local state

### Testing

- Write tests for all features in `__tests__/` directories
- Follow React Testing Library best practices
- Use semantic `data-testid` attributes for structural elements
- Never query by CSS class names in tests

## AI-Assisted Development

This project uses AI-assisted development with Cursor IDE. All AI-generated plans used for this project are documented in the `.cursor/ai-log/` folder.

## License

MIT
