# AI Agent Operational Guidelines

This document serves as the **supreme instruction set** for any AI agent working on this project. You must adhere to these rules strictly to ensure project stability and consistency.

## 🚨 CRITICAL: Configuration Locking

### 1. Sandpack Configuration is FROZEN

The configuration for the Sandpack environment in `components/DashboardPreview.tsx` is considered **STABLE and FROZEN**.

- **DO NOT** modify the `customSetup`, `npmRegistries`, `dependencies`, or `options` objects in this file without explicit user permission.
- **DO NOT** change the refresh/retry logic (`refreshKey`, `retryKey`, `refreshId`, `isLoading` handling). This logic has been carefully tuned to handle stream timing and initialization race conditions.
- **Reference**: Always consult `.spec/sandbox.md` to understand the rationale behind the current configuration before even _thinking_ about suggesting changes.

## 📜 Workflow & Knowledge Base

### 2. Mandatory Spec Reading

Before starting any task involving core architecture, UI components, or configuration, you **MUST** check the `.spec/` directory.

- Files in `.spec/` contain source-of-truth documentation for critical modules.
- Current Specs:
  - `.spec/sandbox.md`: Definitive guide for Sandpack configuration.

### 3. Modification Protocol

If you believe a modification to a "frozen" configuration is absolutely necessary (e.g., to fix a critical bug or support a user-requested feature that strictly requires it):

1.  **Read** the relevant `.spec` file first.
2.  **Explain** why the current configuration (as documented) prevents the task.
3.  **Propose** the change explicitly and ask for confirmation.
4.  **Update** the corresponding `.spec` file immediately after the change is applied.

## 🛠 Project Context

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS (Loaded via CDN in Sandpack, local otherwise)
- **State Management**: React Hooks (useState, useMemo, useEffect, useRef)
- **API Pattern**: Streaming responses handled via `EventSource`/`ReadableStream`.

---

## 🎨 UI & Styling Rules

### 4. Component & Style Protocol

You **MUST** strictly follow the UI patterns and styling rules defined in:

- **`.agent/instructions/component-rule.md`**

**Core Requirements:**

- **No Out-of-Spec Styles**: Do not use inline styles or Tailwind classes that deviate from the examples in `component-rule.md` (e.g., custom shadows, specific hex colors not listed, or complex border-radius).
- **Atomic Consistency**: Every button, dialog, and dropdown must look and behave exactly like the reference examples.
- **Stability First**: Refer to the "UI 与功能稳定性" sections in the global rules, but prioritize the specific examples in `component-rule.md` for visual implementation.

---

_Failure to follow these instructions will result in broken previews and unstable application states._
