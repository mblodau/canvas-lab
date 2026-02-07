# Developer Documentation Changelog

This file tracks all changes to the developer documentation, including what changed, why it changed, and when.

## Format

Each entry follows this format:

```markdown
## [Date] - [Brief Description]

### Changed

- **What**: [Description of change]
- **Why**: [Reason for change]
- **When**: [Timestamp]
```

---

## 2026-02-07 - Retrospective: Testing and TypeScript Guidance Updates

### Changed

- **What**: Updated Testing Guidelines with React import requirement, coordinate-based interaction testing patterns, and RefObject type guidance
- **Why**: Discovered during retrospective that test examples were missing React import (required for TypeScript even with jsx: "react-jsx"), missing guidance on userEvent.pointer() for coordinate-based interactions, and missing RefObject type clarification
- **When**: 2026-02-07

- **What**: Updated test examples to use correct import path (`cameraUtils` instead of `camera`) and added integration test example
- **Why**: Examples were outdated after file rename; integration tests are important pattern not previously documented
- **When**: 2026-02-07

- **What**: Updated Canvas Feature test counts and file structure to reflect actual implementation (65 tests total, CrosshairMarker component added)
- **Why**: Documentation was outdated - test count was 45, actual is 65; CrosshairMarker component was missing from file structure
- **When**: 2026-02-07

---

## 2026-02-07 - Standardized Utility File Naming to camelCase

### Changed

- **What**: Renamed `utils/camera.ts` to `utils/cameraUtils.ts` and updated naming convention to camelCase for utility files
- **Why**: For consistency with hooks (`useCanvas.ts`) and stores (`useCanvasStore.ts`) which also use camelCase; utility files are feature-specific code files like hooks/stores
- **When**: 2026-02-07

---

## 2026-02-07 - Clarified Naming Conventions for Utility Files

### Changed

- **What**: Updated Naming Conventions section to clarify that utility files use descriptive domain names rather than matching export names
- **Why**: Utility files like `camera.ts` export multiple functions, so "match export name" rule doesn't apply; clarified that rule applies to single-export files (components, hooks, stores)
- **When**: 2026-02-07

---

## 2026-02-07 - Canvas Refinement: Multi-Touch, Code Quality, and Unit Tests

### Changed

- **What**: Updated Interaction Patterns section with cross-platform trackpad support (two-finger pan, pinch-to-zoom via ctrlKey detection, smooth exponential zoom, non-passive wheel listener, React-state cursor management)
- **Why**: Canvas now supports trackpad multi-touch gestures across macOS, Windows, and Linux; documentation must reflect these patterns
- **When**: 2026-02-07

- **What**: Updated Canvas Feature overview with new file structure: extracted `useCanvasInteraction` hook, `utils/camera.ts` pure functions, and three test files (45 tests total)
- **Why**: Major refactor extracted monolithic Canvas.tsx into slim component + interaction hook + pure utils for testability and code quality
- **When**: 2026-02-07

- **What**: Updated Code Organization best practices to reflect extracted utilities pattern and interaction hook pattern
- **Why**: Canvas utilities are now extracted to `utils/camera.ts` (no longer inline); interaction logic lives in dedicated hooks
- **When**: 2026-02-07

- **What**: Expanded Testing Guidelines with concrete examples for pure function tests, hook tests (renderHook), and component smoke tests; added guidance on test prioritization and data-testid usage
- **Why**: First real tests added to the project; document established testing patterns for consistency
- **When**: 2026-02-07

---

## 2026-02-07 - Canvas Architecture Documentation

### Changed

- **What**: Added Canvas Architecture section documenting viewport/world two-layer structure, camera model, coordinate conversion patterns, and interaction patterns
- **Why**: After implementing hello-world DOM canvas, these patterns should be documented for future canvas development work
- **When**: 2026-02-07

- **What**: Updated Canvas Feature section in Codebase Overview to reflect actual implementation (pan/zoom, coordinate conversion, interactive elements) instead of placeholder description
- **Why**: Canvas component is now a substantial implementation, not a placeholder
- **When**: 2026-02-07

- **What**: Added guidance on state management for prototyping (inline useState/useRef acceptable for hello-world, migrate to Zustand when patterns stabilize)
- **Why**: Clarify when to use inline state vs Zustand based on implementation phase
- **When**: 2026-02-07

- **What**: Added note about canvas utility organization (coordinate functions can be inline initially, extract when reused)
- **Why**: Provide guidance on when to extract utilities vs keeping them inline
- **When**: 2026-02-07

---

## 2026-02-07 - Initial Documentation

### Added

- **What**: Created initial developer documentation structure
- **Why**: Establish foundation for developer documentation system
- **When**: 2026-02-07
