---
name: attention-memory
description: A production-grade memory management system using attention-weighted architecture with semantic routing and dependency modeling. Use this skill to (1) Retrieve relevant context efficiently before complex tasks, and (2) Sync session insights with dynamic knowledge weighting.
license: MIT
version: 2.1
---

# Attention-Weighted Memory System

A **dual-storage memory architecture** optimized for LLM agents, featuring **semantic routing**, **dependency graphs**, and **adaptive token budgets**. Designed to minimize context pollution while maximizing retrieval accuracy.

---

## 0. Initialization: Memory Directory Configuration

> **CRITICAL**: Before using this skill, you MUST determine the memory directory location.

### Configuration File Location

The configuration file `.memory-config.yaml` is located **inside the skill directory** (not project root), making it easy to package and share across projects.

```text
.agent/skills/attention-memory/
├── SKILL.md
├── .memory-config.yaml    # <-- Configuration here (packaged with skill)
└── .git/
```

### Configuration Format

```yaml
# .memory-config.yaml (located in skill directory)
# Path is RELATIVE to PROJECT ROOT (not skill directory)
memory_root: ./memory
```

### First-Time Setup Protocol

When this skill is invoked for the first time in a project, perform the following steps:

#### Step 1: Check for Configuration File

Look for `.memory-config.yaml` in the **skill directory**: `.agent/skills/attention-memory/.memory-config.yaml`

#### Step 2: If Configuration Does NOT Exist

**ASK the user**:

```markdown
## 🧠 Memory System Initialization

This is your first time using the attention-memory skill in this project.
Please specify where you want to store the memory files:

**Options:**
1. `./memory` (Default - Project root/memory)
2. `./.agent/memory` (Inside .agent folder)
3. Custom path (please specify)

Which option do you prefer? (Default: 1)
```

#### Step 3: Create Configuration

After user responds, create `.memory-config.yaml` in **skill directory**:

```yaml
# Attention-Memory Skill Configuration
# Created: <current_date>
memory_root: <user_selected_path>  # Relative to project root
```

#### Step 4: Initialize Directory Structure

Create the directory structure at the configured path if it doesn't exist:

```text
<memory_root>/
├── CORE.md           # Essential facts (≤50 lines). Always loaded for complex tasks.
├── INDEX.md          # Attention router with semantic tags and dependency graph.
└── archive/          # Domain-specific knowledge, lazy-loaded.
    └── history.md    # Timeline, decisions, technical debt.
```

**Default CORE.md template:**
```markdown
# Core Knowledge Base
**Version**: 1.0
**Last Updated**: <current_date>

## Project Identity
- **Name**: <project_name>
- **Type**: <to be filled>

## Tech Stack
<to be filled on first sync>

## Critical Constraints
<to be filled on first sync>
```

**Default INDEX.md template:**
```markdown
# Attention Router (INDEX.md)

| Topic | File | Tags | Semantic Aliases | Dependencies | LastAccess | Weight |
|-------|------|------|------------------|--------------|------------|--------|
| **History** | `archive/history.md` | Decisions, TechDebt | changelog, why | - | <current_date> | 0.50 |
```

---

## 0.5 Path Resolution Rules

> **All memory paths in this skill are RELATIVE to the PROJECT ROOT**.

### When Reading Memory Files

1. Read `.memory-config.yaml` from **skill directory**: `.agent/skills/attention-memory/.memory-config.yaml`
2. Extract `memory_root` value (relative to project root)
3. Resolve absolute path: `<project_root>/<memory_root>`
4. Access files relative to that absolute path

### Example Resolution

```
Skill Directory: D:\code\MyProject\.agent\skills\attention-memory
Config File: D:\code\MyProject\.agent\skills\attention-memory\.memory-config.yaml
Config memory_root: ./memory

Project Root: D:\code\MyProject
Absolute Memory Path: D:\code\MyProject\memory
CORE.md Location: D:\code\MyProject\memory\CORE.md
Archive Folder: D:\code\MyProject\memory\archive\
```

### When No Config Exists (Legacy Migration)

If you find memory files but no `.memory-config.yaml` in skill directory:

1. **Scan for existing memory directories**:
   - `<project_root>/memory/`
   - `<project_root>/.agent/memory/`
   
2. **If found in one location**: Create config in skill directory pointing to that location
3. **If found in multiple locations**: Ask user which one to use as the canonical source
4. **If not found anywhere**: Follow [First-Time Setup Protocol](#first-time-setup-protocol)

---

## 1. CRITICAL PROTOCOL: The "Write-Back" Mandate

**Memory Rot** occurs when code evolves but documentation stagnates. To prevent this, you **MUST** follow this rule:

> **The "Exit Gate" Rule**:
> You are FORBIDDEN from marking a user's request as "Completed" or "Done" until you have performed a **Memory Impact Analysis**.

**Trigger**: Immediately after you finish writing code or providing a solution.
**Action**: Ask yourself 3 questions:
1. **New Fact?**: Did I learn a new constraint, pattern, or dependency? (Update `CORE.md`)
2. **Logic Change?**: Did I modify how a module works? (Update `archive/*.md`)
3. **Stale Pointer?**: Did I deprecate a feature? (Update `INDEX.md`)

**If YES to any**: You **MUST** execute the [Sync Memory (WRITE)](#5-workflow-sync-memory-write) workflow before adhering to the user's exit request.

---

## 2. Architecture Overview

```text
<memory_root>/          # Configured via .memory-config.yaml
├── CORE.md             # Essential facts (≤50 lines). Always loaded for complex tasks.
├── INDEX.md            # Attention router with semantic tags and dependency graph.
└── archive/            # Domain-specific knowledge, lazy-loaded.
    ├── <topic>.md      # Modular files (e.g., auth.md, api.md, deployment.md).
    └── history.md      # Timeline, decisions, technical debt.
```

**Design Principles**:
- **Core = Short-term Memory**: High-frequency facts (tech stack, constraints, global patterns).
- **Index = Sparse Attention**: Routes queries to relevant files without loading everything.
- **Archive = Long-term Memory**: Retrieved only when context matches task requirements.

---

## 3. INDEX.md Structure (Enhanced)

Each entry in `INDEX.md` should follow this format:

```markdown
| Topic | File | Tags | Semantic Aliases | Dependencies | LastAccess | Weight |
|-------|------|------|------------------|--------------|------------|--------|
| Authentication | `archive/auth.md` | OAuth2, JWT, Sessions | user login, SSO, identity | → Database | 2026-01-25 | 0.95 |
| Database | `archive/database.md` | PostgreSQL, Migrations, ORM | DB schema, SQL | ← Auth, → API | 2026-01-26 | 1.0 |
```

**Key Fields**:
- **Tags**: Precise technical terms (for keyword matching).
- **Semantic Aliases**: Natural language synonyms (for fuzzy matching).
- **Dependencies**: 
  - `→ Module`: This topic depends on Module (load Module if this is primary).
  - `← Module`: Module depends on this (reverse reference).

---

## 4. Workflow: Retrieve Context (READ)

### Step 0: Resolve Memory Path

```markdown
1. Read `.memory-config.yaml` from project root
2. Extract `memory_root` value
3. All subsequent file operations use: `<project_root>/<memory_root>/`
```

### Step 1: Task Classification

| Task Type | Examples | Memory Action |
|-----------|----------|---------------|
| **Simple** | Fix typo, add log, rename variable | **SKIP** memory entirely |
| **Medium** | Add new endpoint, refactor function | Load **CORE** + 1 archive file |
| **Complex** | New feature, architecture change, debugging | Load **CORE** + 1-3 archive files |

### Step 2: Load Core (Adaptive Depth)

```markdown
- **Simple Task** (complexity 1-3): SKIP CORE
- **Medium Task** (complexity 4-6): Load first 30 lines of CORE.md
- **Complex Task** (complexity 7-10): Load full CORE.md (50 lines)
```

### Step 3: Semantic Routing via INDEX

1. **Extract Keywords**: Identify key concepts from the task description.
2. **Match Strategy** (priority order):
   - **Exact Match**: Task keyword ∈ Tags → Score = 1.0
   - **Semantic Match**: Task concept ∈ Semantic Aliases → Score = 0.8
   - **Dependency Match**: Related module mentioned → Score = 0.5
3. **Rank Files**: `Final Score = (Match Score × 0.6) + (Weight × 0.4)`
4. **Select Top Files**: 
   - Load **primary** file (highest score).
   - Check **Dependencies** column: If `→ Module` exists, load up to 2 dependent files.

### Step 4: Targeted Fetch

```markdown
- Load the primary matched `archive/<topic>.md`.
- If dependencies declared (e.g., `→ Database, API`):
  - Load those files as well (max 2 additional).
- **Total Limit**: 1 primary + 2 dependencies = 3 files max.
```

---

## 5. Workflow: Sync Memory (WRITE)

> **MANDATORY**: This workflow must run at the end of every significant coding session.

### Step 0: Resolve Memory Path

Same as READ workflow - always resolve path from `.memory-config.yaml` first.

### Step 1: Analyze & Classify

Extract learnings from the session:

| Information Type | Destination | Examples |
|------------------|-------------|----------|
| **Core Facts** | `CORE.md` | Tech stack change, new critical constraint |
| **Domain Logic** | `archive/<topic>.md` | API endpoint details, auth flow |
| **Decisions/Debt** | `archive/history.md` | Why we chose X over Y, known issues |
| **Ephemeral** | ❌ Discard | Temporary debug code, one-off fixes |

### Step 2: Route & Create

- **Existing Topic**: Update the corresponding `archive/<topic>.md`.
- **New Topic**: 
  1. Create `<memory_root>/archive/<topic>.md` with metadata header:
     ```markdown
     # Topic Name
     **Version**: 1.0  
     **Created**: 2026-01-28  
     **Last Verified**: 2026-01-28  
     **Known Conflicts**: None
     ```
  2. Add new entry to `INDEX.md` with initial weight = 0.5.

### Step 3: Conflict Resolution (Version-Aware)

```markdown
1. **Codebase is Truth**: If memory contradicts current code:
   - Update memory content to match code.
   - Increment version number (e.g., 1.0 → 1.1).
   - Log conflict in `archive/history.md`:
     ```markdown
     ### 2026-01-28: Auth Flow Corrected
     - **Issue**: Memory showed OAuth2 flow using refresh tokens, but code uses short-lived JWTs.
     - **Resolution**: Updated `auth.md` to reflect JWT-only approach.
     ```

2. **Stale Detection**: 
   - If `Last Verified` > 30 days ago, mark file as "⚠️ Needs Verification" in INDEX.md.
```

### Step 4: Update Attention Weights (Enhanced Formula)

```markdown
**Boost Strategies**:
- **Read Access**: +0.10
- **Write Access**: +0.20 (modification signals importance)
- **Critical Task** (complexity ≥ 7): +0.25
- **Association Boost**: If file A accessed, its dependencies get +0.05

**Decay Strategy**:
- **Exponential Decay**: `New Weight = Current Weight × 0.9^(weeks_inactive)`
- Example: 1.0 → 0.9 (1 week) → 0.81 (2 weeks) → 0.73 (3 weeks)

**Clamping**:
- Min Weight: 0.1 (never drop to 0)
- Max Weight: 1.0
```

### Step 5: Dependency Update

If you modify a file with dependencies:
```markdown
- File `auth.md` has `→ Database`
- You updated `auth.md`
- Action: Boost `database.md` weight by +0.05 (association signal)
```

### Step 6: Pruning Strategy

```markdown
- **Weight < 0.2**: Mark as "Low Priority" in INDEX.md
- **Weight < 0.15 AND LastAccess > 60 days**: 
  - Option 1: Move to `archive/deprecated/`
  - Option 2: Merge into related file
  - Option 3: Delete if truly obsolete
```

### Step 7: Report to User (The Exit Gate)

**You must output this block to confirm Memory Sync:**

```markdown
## 🧠 Memory Sync Report
- **Memory Location**: <resolved_absolute_path>
- **Status**: [Skipped (No changes) | Updated | Created]
- **Modifications**:
  - `archive/api.md`: Updated endpoints (v2.1 → v2.2)
  - `INDEX.md`: Boosted api.md weight to 0.95
- **Reflections**:
  - "I noticed the 'Auth' module now depends on 'Redis', added dependency link in INDEX."
```

---

## 6. File Size Limits & Token Budget

### Static Limits
```markdown
- **CORE.md**: 50 lines max
- **INDEX.md**: 50 lines max (increased from 40 to support semantic aliases)
- **archive/*.md**: 120 lines max per file (increased for metadata headers)
```

### Dynamic Loading Depth
```markdown
**For Simple Tasks (complexity 1-3)**:
- CORE.md: Skip
- INDEX.md: Use cached routing (no reload)
- archive/*.md: Load first 50 lines only

**For Medium Tasks (complexity 4-6)**:
- CORE.md: First 30 lines
- INDEX.md: Full file
- archive/*.md: Load first 80 lines per file

**For Complex Tasks (complexity 7-10)**:
- CORE.md: Full file (50 lines)
- INDEX.md: Full file
- archive/*.md: Full files (up to 120 lines each)
- Allow loading 1 primary + 2 dependency files
```

---

## 7. Example INDEX.md Template

```markdown
# Attention Router (INDEX.md)

| Topic | File | Tags | Semantic Aliases | Dependencies | LastAccess | Weight |
|-------|------|------|------------------|--------------|------------|--------|
| **API Design** | `archive/api.md` | REST, GraphQL, Endpoints | backend routes, API spec | → Auth, Database | 2026-01-28 | 1.0 |
| **Authentication** | `archive/auth.md` | JWT, OAuth2, Sessions | user login, identity | → Database | 2026-01-27 | 0.95 |
| **Database** | `archive/db.md` | PostgreSQL, Migrations | schema, ORM, SQL | ← Auth, API | 2026-01-26 | 0.90 |
| **Frontend** | `archive/frontend.md` | React, Components, State | UI, client-side | → API | 2026-01-25 | 0.75 |
| **Deployment** | `archive/deploy.md` | Docker, CI/CD, K8s | infrastructure, DevOps | - | 2026-01-20 ⚠️ | 0.60 |
| **History** | `archive/history.md` | Decisions, TechDebt | changelog, why | - | 2026-01-28 | 0.50 |
```

**Legend**:
- ⚠️ = Needs verification (> 30 days since last verified)
- `→` = Depends on
- `←` = Depended by

---

## 8. Best Practices

### For Agents
1. **Always resolve path first**: Read `.memory-config.yaml` before any memory operation.
2. **Exit Gate is Non-Negotiable**: Never finish a turn without checking memory.
3. **Classify first**: Determine if a task is Simple, Medium, or Complex.
4. **Use semantic matching** when exact keyword match fails.
5. **Follow dependency chain** for interconnected modules.
6. **Update weights immediately** after each session.

### For Users
1. **Review INDEX.md monthly** to prune low-weight files.
2. **Keep CORE.md minimal** – only truly global facts.
3. **Split large archives** into sub-topics if > 120 lines.
4. **Document dependencies** when creating new archive files.
5. **Run verification** on stale files (⚠️ marker).

---

## 9. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Memory files in multiple locations | Missing config file | Run initialization to create `.memory-config.yaml` |
| Agent loads wrong file | Keyword mismatch | Add semantic aliases to INDEX.md |
| Context feels incomplete | Missing dependencies | Document `→` dependencies in INDEX.md |
| Memory contradicts code | Stale information | Run conflict resolution (Step 3 of WRITE) |
| INDEX.md too large | Too many topics | Consider two-tier index (advanced) |
| Weight stuck at 1.0 | No decay applied | Apply exponential decay formula weekly |

---

## 10. Migration Guide (For Existing Projects)

If you have memory files in multiple locations (e.g., both `./memory` and `./.agent/memory`):

### Step 1: Identify Canonical Source
Ask user: "Which memory location contains the most up-to-date information?"

### Step 2: Merge If Needed
If both have valuable content:
1. Compare CORE.md files, keep the most complete version
2. Merge INDEX.md entries (remove duplicates)
3. Copy all archive files, resolve conflicts manually

### Step 3: Create Configuration
Create `.memory-config.yaml` pointing to the chosen location.

### Step 4: Clean Up
After confirming the canonical source works, delete the duplicate memory directory.

---

## 11. Advanced: Two-Tier Index (Optional)

For projects with > 20 modules:

```text
<memory_root>/
├── CORE.md
├── INDEX.md              # Tier 1: High-priority (Weight > 0.6)
├── INDEX_EXTENDED.md     # Tier 2: Low-priority (Weight ≤ 0.6)
└── archive/
    ├── high_priority/
    └── low_priority/
```

**Routing Logic**:
1. Search `INDEX.md` first (high-weight files).
2. If no match, load `INDEX_EXTENDED.md` and search again.
3. This keeps the primary index compact while supporting large projects.
