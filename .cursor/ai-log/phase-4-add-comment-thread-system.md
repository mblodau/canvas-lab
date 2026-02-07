# Phase 4: Add Comment Thread System

## Overview

Replace the temporary crosshair debug markers with a real comment thread system anchored in world coordinates. Users can click anywhere on the canvas to create comment threads, view them in a side panel, and interact with comments through replies and editing.

## Objectives

1. Create a Zustand store for persistent editor state (threads, selection, filter)
2. Define CommentThread and Comment data models
3. Update canvas click handling to create threads at world coordinates
4. Render comment pins in the world layer with visual indicators
5. Add a right-side panel for viewing and managing threads
6. Implement smooth camera focus animation when selecting threads from list

---

## 1. State Management: Zustand Store

### Store Structure

Create `src/features/comments/store/useEditorStore.ts` with:

**State:**

- `threads: CommentThread[]` - Array of all comment threads
- `selectedThreadId: string | null` - Currently selected thread ID
- `filter: 'open' | 'resolved' | 'all'` - Filter for thread list view
- `focusTarget: { x: number; y: number } | null` - Target coordinates for camera animation

**Actions:**

- `addThreadAt(pos: { x: number; y: number })` - Create new thread at world coordinates
- `selectThread(id: string | null)` - Select/deselect a thread
- `setFilter(filter: Filter)` - Update filter
- `addComment(threadId: string, text: string)` - Add reply to thread
- `updateComment(threadId: string, commentId: string, text: string)` - Edit comment text
- `toggleResolved(threadId: string)` - Toggle resolved state
- `focusOnThread(id: string)` - Set focus target and select thread (for list click)
- `clearFocusTarget()` - Clear focus target after animation completes

### Implementation Notes

- Use `crypto.randomUUID()` for thread and comment IDs
- Set `selectedThreadId` automatically when creating a new thread (panel opens immediately)
- Export `EditorStore` type for use in tests and other features

---

## 2. Data Models

### CommentThread Interface

```typescript
interface CommentThread {
  id: string
  x: number // world coordinate
  y: number // world coordinate
  resolved: boolean
  createdAt: string // ISO string
  createdBy: string
  comments: Comment[]
}
```

### Comment Interface

```typescript
interface Comment {
  id: string
  author: string
  createdAt: string // ISO string
  text: string
}
```

**Location:** `src/features/comments/types/index.ts`

---

## 3. Canvas Integration

### Update Canvas Click Handling

**File:** `src/features/canvas/hooks/useCanvasInteraction.ts`

- Remove `crosshairs` state and related logic
- Import `useEditorStore` from `@/features/comments/store`
- In `handlePointerUp`, convert click to world coordinates and call `addThreadAt({ x: worldPos.x, y: worldPos.y })`
- Subscribe to `focusTarget` from editor store
- Add `useEffect` for smooth camera animation using `requestAnimationFrame` and lerp function
- Call `clearFocusTarget()` when animation completes

### Smooth Camera Focus Animation

When `focusTarget` is set:

1. Calculate target camera position to center the target point in viewport
2. Use `requestAnimationFrame` loop with lerp (e.g., `LERP_FACTOR = 0.1`)
3. Update camera position each frame until distance threshold is reached
4. Clear `focusTarget` on completion

### Render Comment Pins

**File:** `src/features/canvas/components/Canvas.tsx`

- Import `useEditorStore` to read `threads`
- Map over `threads` and render `CommentPin` component for each thread
- Remove `CrosshairMarker` import and rendering

---

## 4. Comment Pin Component

### Component: CommentPin

**File:** `src/features/comments/components/CommentPin.tsx`

**Visual Design:**

- Speech bubble shape with rounded corners, except bottom-left corner (pointed corner)
- Bottom-left corner anchors at world coordinate `(x, y)`
- Color: Blue for open threads, green for resolved threads
- Yellow ring when selected
- Avatar (first letter of author name) shown in collapsed state
- Expands on hover to show preview tooltip

**Hover Expansion:**

- Collapsed: 32x32px showing avatar
- Expanded: 256px width, variable height showing:
  - Header: Avatar, author name, relative time ("Just now", "5 minutes ago", etc.)
  - Content: First comment text (or "New thread" if empty)
  - Footer: Comment count

**Animation:**

- Smooth width/height transition (0.2s ease-out)
- Use `useLayoutEffect` to measure `scrollHeight` for expanded height
- Always render content at full width, clip with `overflow: hidden`

**Interaction:**

- Click pin → select thread (opens panel)
- Stop propagation on `pointerDown` and `pointerUp` to prevent canvas pan
- Z-index: 9999 when hovered, 10 when selected, 1 otherwise

**Semantic Attributes:**

- `data-testid="comment-pin"`
- `data-resolved={thread.resolved}`
- `data-selected={isSelected}`

---

## 5. Side Panel Components

### SidePanel (Container)

**File:** `src/features/comments/components/SidePanel.tsx`

- Conditional rendering: `ThreadPanel` if `selectedThreadId` is set, otherwise `ThreadList`
- Fixed width: 320px (`w-80`)

### ThreadList

**File:** `src/features/comments/components/ThreadList.tsx`

**Features:**

- Filter tabs: All, Open, Resolved (with counts)
- List of threads showing:
  - Status badge (Open/Resolved)
  - Relative time
  - First comment preview (or "New thread")
  - Comment count
- Click thread item → calls `focusOnThread(thread.id)` (triggers camera animation)
- Empty states for each filter

**Semantic Attributes:**

- `data-testid="thread-items"` on list container
- `data-testid="thread-item"` on each thread button
- `data-testid="thread-status-badge"` on status badges

### ThreadPanel

**File:** `src/features/comments/components/ThreadPanel.tsx`

**Features:**

- Header: Thread title, close button, metadata (time, author)
- Comments list:
  - Each comment shows author, time, text
  - Edit button → inline editing mode
  - Edit mode: textarea with Save/Cancel buttons
- Reply input:
  - Textarea with placeholder
  - Add Reply button (disabled when empty)
  - Cmd/Ctrl+Enter shortcut to submit
- Resolve/Reopen toggle button

**Implementation Notes:**

- Use `formatRelativeTime` for all date displays
- Handle whitespace in textareas (no special styles needed - native behavior)
- Prevent spacebar pan mode when typing in textareas (check `isEditableElement` in keyboard handler)

---

## 6. Date Formatting Utility

### Shared Utility

**File:** `src/shared/utils/formatUtils.ts`

Extract `formatRelativeTime` function used across components:

- "Just now" for < 1 minute
- "X minutes ago" for < 1 hour
- "X hours ago" for < 1 day
- "X days ago" for >= 1 day

All three components (`CommentPin`, `ThreadPanel`, `ThreadList`) import from this shared utility.

---

## 7. App Integration

**File:** `src/App.tsx`

- Import `SidePanel` from `@/features/comments/components`
- Update `main` section to flex layout:
  - `Canvas` takes `flex-1`
  - `SidePanel` fixed width on right

---

## 8. Testing Requirements

### Store Tests

**File:** `src/features/comments/__tests__/useEditorStore.test.ts`

- Test all actions (addThreadAt, selectThread, addComment, updateComment, toggleResolved, focusOnThread, clearFocusTarget)
- Test initial state
- Mock `crypto.randomUUID` for deterministic IDs

### Component Tests

**CommentPin.test.tsx:**

- Renders at correct world position
- Shows comment count
- Marks resolved/open state via data attributes
- Calls selectThread on click
- Shows selected state via data attribute

**ThreadList.test.tsx:**

- Shows empty state
- Renders threads with first comment text
- Shows "New thread" for threads without comments
- Shows comment count
- Shows Open/Resolved badges
- Calls focusOnThread when clicked
- Calls setFilter when filter tabs clicked
- Filters threads by resolved status

**ThreadPanel.test.tsx:**

- Renders thread not found when thread doesn't exist
- Renders thread header with author and time
- Does not display thread position
- Renders comments
- Calls selectThread(null) when close clicked
- Calls addComment when reply submitted
- Disables Add Reply when empty
- Calls toggleResolved when resolve clicked
- Shows Reopen for resolved threads
- Enters edit mode when Edit clicked
- Calls updateComment when edit saved
- Exits edit mode when cancel clicked
- Shows empty state when no comments

**SidePanel.test.tsx:**

- Renders ThreadList when no thread selected
- Renders ThreadPanel when thread selected

### Testing Best Practices

- Use semantic `data-testid` attributes, not CSS class queries
- Use `data-*` attributes for visual state (resolved, selected)
- Prefer accessible queries (`getByRole`, `getByText`, `getByLabelText`)
- Mock Zustand stores with complete state objects
- Use relative imports for types in test files when module is mocked

---

## 9. Code Quality Requirements

### Avoid Implementation Details in Tests

- Never query by CSS class names (Tailwind or otherwise)
- Use semantic `data-*` attributes for visual state
- Prefer accessible queries over `querySelector`

### Code Comments

- No obvious comments (e.g., `{/* Header */}`, `{/* Footer */}`)
- Only comment when explaining "why" something non-obvious is done

### DRY Principle

- Extract shared utilities (e.g., `formatRelativeTime`) to `shared/utils/`
- Avoid duplicating logic across components

---

## 10. File Structure

```
src/
├── features/
│   ├── comments/
│   │   ├── components/
│   │   │   ├── CommentPin.tsx
│   │   │   ├── ThreadPanel.tsx
│   │   │   ├── ThreadList.tsx
│   │   │   ├── SidePanel.tsx
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   ├── useEditorStore.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── __tests__/
│   │       ├── useEditorStore.test.ts
│   │       ├── CommentPin.test.tsx
│   │       ├── ThreadList.test.tsx
│   │       ├── ThreadPanel.test.tsx
│   │       └── SidePanel.test.tsx
│   └── canvas/
│       ├── components/
│       │   └── Canvas.tsx (updated)
│       └── hooks/
│           └── useCanvasInteraction.ts (updated)
├── shared/
│   └── utils/
│       └── formatUtils.ts
└── App.tsx (updated)
```

---

## 11. Constraints

- Keep high-frequency pointer/camera logic local (refs/useState)
- Keep canvas renderer "dumb" — it renders what the store provides
- Avoid abstract tool registries or command systems
- Use TypeScript throughout
- Tailwind CSS for styling
- Focus on clarity and correctness, not visual perfection
- Pragmatic cross-feature dependency: Canvas can import comment store (one-way)

---

## 12. Fine-Tuning (Post-Implementation)

### Visual Refinements

- Comment pin shape: Speech bubble with pointed bottom-left corner
- Hover tooltip: Unified with pin, expands from bottom-left corner
- Avatar: First letter of username, shown in collapsed pin
- Date formatting: Relative time ("Just now", "X ago") throughout
- Selection/hover styling: Yellow ring for selected, subtle styling

### Interaction Refinements

- Smooth camera focus animation when clicking thread in list
- Prevent spacebar pan mode when typing in textareas
- Remove position display from ThreadPanel (keep in state but don't show)

### Code Quality Refinements

- Extract `formatRelativeTime` to shared utility (DRY)
- Add semantic `data-*` attributes for testing
- Remove obvious JSX comments
- Fix test implementation detail violations

---

## Implementation Status

✅ **Completed**: All objectives achieved

- ✅ Zustand store created with all required state and actions
- ✅ CommentThread and Comment types defined
- ✅ Canvas click handling updated to create threads
- ✅ CommentPin component with hover expansion and animation
- ✅ SidePanel, ThreadList, and ThreadPanel components
- ✅ Smooth camera focus animation
- ✅ Shared date formatting utility
- ✅ Comprehensive test coverage (111 tests)
- ✅ Code quality improvements (DRY, semantic attributes, no implementation detail tests)
- ✅ Documentation updated

### Final Test Coverage

- **Store tests**: 13 tests (`useEditorStore.test.ts`)
- **Component tests**: 45 tests (`CommentPin.test.tsx` - 7, `ThreadList.test.tsx` - 10, `ThreadPanel.test.tsx` - 13, `SidePanel.test.tsx` - 2)
- **Canvas integration tests**: Updated to reflect comment system
- **Shared utility tests**: 7 tests (`formatUtils.test.ts`)
- **Total**: 111 tests across 9 test files

### Key Features Delivered

- Click-to-create comment threads at world coordinates
- Visual comment pins with hover preview
- Filterable thread list (open/resolved/all)
- Thread detail panel with replies and editing
- Smooth camera animation to focus on selected threads
- Resolve/unresolve workflow
- Relative time formatting throughout
- Comprehensive test coverage following best practices
