# Developer Documentation

## Project Purpose

**Canvas Lab** is a Miro-like canvas-based web application for experimenting with canvas-based interactions and features. The project serves as a laboratory for building and testing canvas functionality using modern React and TypeScript tooling.

### Goals

- Provide a foundation for canvas-based web applications
- Demonstrate feature-based architecture patterns
- Showcase modern React development practices
- Enable rapid experimentation with canvas features

## Design Patterns

### Feature-Based Architecture

The application follows a **feature-based architecture** pattern where each feature is a self-contained vertical slice:

```
src/
├── app/          # App shell (routing, providers, layout)
├── features/     # Feature modules (canvas, etc.)
├── shared/       # Shared utilities and UI (no feature knowledge)
└── entities/     # Domain objects shared across features
```

### Key Principles

1. **Feature Isolation**: Each feature contains all its code (components, hooks, store, API, types, tests)
2. **No Cross-Feature Imports**: Features should not import from other features directly
3. **Shared Layer**: Contains only reusable code with no feature-specific knowledge
4. **App Layer**: Contains app-level concerns (routing, providers, layout)

### Feature Structure

Each feature follows this structure:

```
features/[feature-name]/
├── components/   # Feature-specific UI components
├── hooks/        # Feature-specific hooks
├── store/        # Zustand store for feature state
├── api/          # API calls for this feature
├── types/        # TypeScript types
└── __tests__/    # Feature tests
```

## Best Practices

### Code Organization

- **One feature per directory**: Keep features isolated
- **Barrel exports**: Use `index.ts` files for cleaner imports
- **Co-location**: Keep related code together (components with their tests)

### Naming Conventions

- **Components**: PascalCase (e.g., `Canvas.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useCanvas.ts`)
- **Stores**: camelCase ending with "Store" (e.g., `useCanvasStore.ts`)
- **Types**: PascalCase interfaces/types (e.g., `CanvasItem`)
- **Files**: Match export name (e.g., `Canvas.tsx` exports `Canvas`)

### Import Patterns

Use path aliases for cleaner imports:

```typescript
// ✅ Good
import { Canvas } from '@/features/canvas/components/Canvas'
import { Button } from '@/shared/ui'

// ❌ Bad
import { Canvas } from '../../../features/canvas/components/Canvas'
```

### State Management

- **Feature-level state**: Use Zustand stores in `features/[name]/store/`
- **Global app state**: Use Zustand in `app/providers/` if needed
- **Component state**: Use `useState` for local component state
- **Server state**: Consider React Query or similar for server state

## Testing Guidelines

### Test Structure

- Tests live in `__tests__/` directories within features
- Use descriptive test names: `describe('FeatureName', () => { ... })`
- Group related tests together

### Testing Patterns

```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Component } from '../Component'

describe('Component', () => {
  it('should render correctly', () => {
    render(<Component />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### MSW Usage

- Define handlers in `tests/mocks/handlers.ts`
- Use `setupServer` from `msw/node` for tests
- Mock API calls at the network level, not component level

### Test Coverage

- Aim for high coverage of business logic
- Test user interactions, not implementation details
- Use React Testing Library queries (getByRole, getByText, etc.)

## Codebase Overview

### Features

#### Canvas Feature (`src/features/canvas/`)

The main canvas feature for Miro-like functionality:

- **Components**: `Canvas.tsx` - Main canvas component
- **Hooks**: `useCanvas.ts` - Canvas feature hook
- **Store**: `useCanvasStore.ts` - Canvas state management
- **Types**: `CanvasItem` - Canvas item type definitions
- **API**: Placeholder API functions for canvas data

### Shared Components

#### UI Components (`src/shared/ui/`)

- **Button**: Reusable button component with variants

### App Structure

- **App.tsx**: Main app component with layout
- **main.tsx**: Application entry point

## Technology Stack

- **React 19** with React Compiler
- **TypeScript** (strict mode)
- **Vite** for building
- **Tailwind CSS** for styling
- **Vitest** for testing
- **MSW** for API mocking
- **Zustand** for state management
- **ESLint** + **Prettier** for code quality

## Development Workflow

1. Create feature in `src/features/[feature-name]/`
2. Add components, hooks, store, API, types, tests
3. Use path aliases for imports
4. Write tests alongside code
5. Follow established patterns
6. Update this documentation when patterns change
