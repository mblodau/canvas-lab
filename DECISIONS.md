# Decisions

Key product, technical, and process decisions made during this project.

## Technical Decisions

**DOM-based canvas over `<canvas>` or WebGL**
Chose DOM-based rendering because it was the fastest solution to implement for the assignment. Canvas content is rendered as absolutely positioned divs within transformable containers, allowing React to manage the component lifecycle naturally.

**React 19 with React Compiler**
Using the latest React with React Compiler enabled for automatic memoization and performance optimizations without manual `useMemo`/`useCallback` annotations.

**Feature-based architecture (vertical slices)**
Organized code by features rather than by technical layers (components, hooks, etc.). Each feature is self-contained with its own components, hooks, store, types, and tests. This makes features easier to understand, test, and potentially extract.

**Zustand for state management**
Lightweight state management library chosen for its simplicity and TypeScript support. Used for feature-level state (comment threads) while keeping high-frequency canvas state (camera position) in React hooks for performance.

**Three-layer DOM rendering with constant-size comment pins**
Split canvas rendering into three layers:

- Viewport (fixed container with grid background)
- ContentWorld (scales with zoom, holds design elements)
- MetaOverlay (constant screen size, holds comment pins).

This architectural decision enables pins to remain readable and clickable at all zoom levels while content scales naturally.

## Process Decisions

**Full AI-based/agentic development workflow**
Used the mechanisms that i adopted during daily work and leveraged AI to the absolute maximum. My workflow:

- Built a domain expert thread in ChatGPT by parsing of your public website and conceptually reverse-engineering everything i saw and understood from the demo session.
- Used this expert as a sounding board for ideas and decisions that became the foundation for Cursor implementation plans (documented in `.cursor/ai-log/`).
- Built a foundation of rules and self-improving context documentation to be able to keep a rapid pace of development while keeping the AI on track.
- Created each plan with Opus 4.6 (highest thinking model), iterated with suggestions, and let the model triple-check it's own plan.
- Used Cursor Composer1 for implementing each plan and iterating on details.
- Switched back to Opus 4.6 for cleanup, code quality review, and internal retrospectives.

**Developer documentation as context foundation (`.cursor/docs/`)**
Maintained comprehensive developer documentation in `.cursor/docs/index.md` that serves as context for all AI-based development. Documentation includes project purpose, design patterns, best practices, testing guidelines, and codebase overview.

**Retrospective rule for continuous documentation improvement**
Implemented a Cursor rule that triggers retrospectives on developer documentation usage. After completing tasks, evaluates whether docs were considered, whether they were helpful, and whether they need updates. This ensures documentation stays accurate and useful.

**AI-log for documenting plans per phase**
Documented all AI-generated implementation plans in `.cursor/ai-log/` directory, one file per development phase. This provides a complete history of how the project evolved and what decisions were made at each stage.
