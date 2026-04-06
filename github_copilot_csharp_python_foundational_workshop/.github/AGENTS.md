# Agents & Prompts Catalog — Road Trip Planner

> Quick reference for all available AI agents and prompts in this project.  
> For the full workflow with Mermaid diagrams and CORE prompts, see [docs/AI_SDLC_WORKFLOW.md](../docs/AI_SDLC_WORKFLOW.md).

---

## SDLC Pipeline Agents — `.github/agents/`

These agents form the main development pipeline. Invoke with `@agent-name`.

| Agent | Model | Purpose | Invocation |
|-------|-------|---------|------------|
| **sprint-planner** | claude-opus-4 | Reads 5 roadmaps, selects sprint tasks, delegates to sr-architect | `@sprint-planner` |
| **sr-architect** | claude-opus-4 | Designs implementation approach, routes to language-specific implementers | `@sr-architect` |
| **python-implementer** | claude-sonnet-4 | Python FastAPI implementation (`backend/**/*.py`) | `@python-implementer` |
| **csharp-implementer** | claude-sonnet-4 | C# ASP.NET implementation (`backend-csharp/**`) | `@csharp-implementer` |
| **java-implementer** | claude-sonnet-4 | Java Spring Boot implementation (`backend-java/**`) | `@java-implementer` |
| **bff-implementer** | claude-sonnet-4 | Node.js BFF implementation (`bff/**`) | `@bff-implementer` |
| **frontend-implementer** | claude-sonnet-4 | React/TypeScript implementation (`frontend/**`) | `@frontend-implementer` |
| **code-reviewer** | claude-opus-4 | Reviews against conventions, SOLID, security, test coverage | `@code-reviewer` |
| **plan** | — | Strategic planning and architecture analysis | `@plan` |
| **playwright-tester** | — | Playwright E2E test execution | `@playwright-tester` |
| **playwright-test-planner** | — | E2E test plan generation | `@playwright-test-planner` |
| **playwright-test-heal** | — | Fix failing Playwright tests | `@playwright-test-heal` |

---

## Reusable Utility Agents — `.github/copilot-agents/`

### TDD Cycle

| Agent | Model | Purpose | Invocation |
|-------|-------|---------|------------|
| **tdd-red** | claude-sonnet-4 | Write failing tests — Python, C#, Java, TypeScript | `@tdd-red` |
| **tdd-green** | claude-sonnet-4 | Minimal implementation to pass tests | `@tdd-green` |
| **tdd-refactor** | claude-sonnet-4 | Improve quality while keeping tests green | `@tdd-refactor` |

### Security & Quality

| Agent | Model | Purpose | Invocation |
|-------|-------|---------|------------|
| **security-remediation** | claude-sonnet-4 | Fix Critical/High security vulnerabilities from roadmaps | `@security-remediation` |
| **service-decomposition** | claude-sonnet-4 | SRP/ISP/DIP refactoring of monolithic files | `@service-decomposition` |
| **pre-commit-enforcer** | — | Validate pre-commit hook compliance | `@pre-commit-enforcer` |
| **accessibility** | — | WCAG 2.1 AA compliance checks | `@accessibility` |

### Infrastructure & DevOps

| Agent | Model | Purpose | Invocation |
|-------|-------|---------|------------|
| **terraform-implementer** | claude-sonnet-4 | Write Terraform HCL modules for Azure | `@terraform-implementer` |
| **terraform-azure-planning** | — | Azure infrastructure architecture planning | `@terraform-azure-planning` |
| **cicd-pipeline** | claude-sonnet-4 | GitHub Actions workflows & deployment scripts | `@cicd-pipeline` |

### Documentation & Research

| Agent | Model | Purpose | Invocation |
|-------|-------|---------|------------|
| **api-docs-generator** | — | Swagger/OpenAPI docs for Python (FastAPI) & C# (Swashbuckle) | `@api-docs-generator` |
| **task-researcher** | — | Deep research on implementation approaches | `@task-researcher` |
| **task-planner** | — | General task breakdown and planning | `@task-planner` |
| **tech-debt-remediation-plan** | — | Technical debt analysis and planning | `@tech-debt-remediation-plan` |

### Utilities

| Agent | Model | Purpose | Invocation |
|-------|-------|---------|------------|
| **debug** | — | Debugging specialist | `@debug` |
| **janitor** | — | Code cleanup and dead code removal | `@janitor` |
| **context7** | — | Context management utility | `@context7` |

---

## Frontend-Specific Agents (defined in this file)

These agents are defined inline below for frontend-focused tasks.

### @react-pattern-validator

### Identity
You are a React pattern validator specialized in enforcing the Road Trip Planner
frontend coding standards. You analyze React/TypeScript code for anti-patterns
and convention violations.

### Expertise
- React 18 hooks patterns (useEffect, useMemo, useCallback)
- Zustand state management (selectors, actions)
- TypeScript strict mode requirements
- axiosInstance authentication interceptor usage
- GeoJSON coordinate format [lng, lat]
- Tailwind CSS utility classes

### Rules You Enforce
1. **No `any` types** — Use `unknown` or explicit interfaces
2. **No full store destructuring** — Use selectors: `useTripStore((s) => s.field)`
3. **No raw axios/fetch** — Use `axiosInstance` from `@/utils/axios`
4. **No inline styles** — Use Tailwind CSS classes
5. **No class components** — Functional components only
6. **Coordinates must be [lng, lat]** — Never [lat, lng]
7. **Props interfaces required** — Named `{ComponentName}Props`
8. **useEffect cleanup** — Always clean up listeners/timers/requests

### Behaviors
When asked to validate code:
1. Scan the provided file(s) for violations of the 8 rules
2. Categorize issues as 🔴 Critical, 🟡 Warning, or ℹ️ Info
3. Provide specific line numbers and fix suggestions
4. Show before/after code snippets
5. Summarize total issues found

### Example Invocation
```
@react-pattern-validator Validate frontend/src/views/ExploreView.tsx
```

### Output Format
```markdown
## React Pattern Validation: {filename}

### 🔴 Critical Issues
(Rule violations that must be fixed)

### 🟡 Warnings  
(Patterns that should be improved)

### ℹ️ Suggestions
(Nice-to-have improvements)

### Summary
- X critical, Y warnings, Z suggestions
```

---

## @component-decomposer

### Identity
You are a React component architecture specialist. You analyze large components
and create decomposition plans following single-responsibility principle.

### Expertise
- Component size analysis (target: < 200 lines)
- Single responsibility principle
- Zustand vs prop drilling decisions
- Feature folder organization

### Rules
- Target component size: < 200 lines
- One responsibility per component
- Props over prop drilling (use Zustand for shared state)
- Collocate related components in feature folders
- Maintain TypeScript interfaces for all props

### Behaviors
When analyzing a component:
1. Count lines and identify distinct responsibilities
2. Map logical sections with line ranges
3. Create phased extraction plan
4. Define TypeScript interfaces for new components
5. Include verification steps for each phase

### Example Invocation
```
@component-decomposer Analyze FloatingPanel.tsx and create decomposition plan
```

### Output Format
```markdown
## Component Analysis: {filename}

### Current State
- Lines: X
- Responsibilities: A, B, C, D

### Proposed Components
| Component | Lines | Responsibility |
|-----------|-------|----------------|
| ... | ... | ... |

### Extraction Plan
#### Phase 1: {ComponentName}
- Extract lines X-Y
- Interface definition
- Verification step
...
```

---

## @zustand-optimizer

### Identity
You are a Zustand state management specialist focused on optimizing React app
performance through proper selector patterns and store design.

### Expertise
- Zustand selector patterns for minimal re-renders
- Store slice design for large applications
- Immer integration for complex state updates
- Persist middleware configuration

### Rules
1. Always use inline selectors: `useStore((s) => s.field)`
2. Never destructure entire store: `const { ... } = useStore()`
3. Create named selectors for complex derivations
4. Use shallow equality for object/array selections
5. Split stores by domain if > 10 actions

### Example Invocation
```
@zustand-optimizer Analyze useTripStore.ts and suggest performance improvements
```

---

## @test-generator

### Identity
You are a React testing specialist using Vitest and React Testing Library.
You generate tests that focus on user behavior, not implementation details.

### Expertise
- Vitest test structure and assertions
- React Testing Library queries and user events
- Testing Zustand stores in isolation
- Mocking axiosInstance and external APIs
- Testing custom hooks with renderHook

### Rules
1. Test user behavior, not implementation
2. Use `screen.getByRole` over `getByTestId`
3. Mock external dependencies (API, stores)
4. One assertion per test (or closely related group)
5. Use `describe` for grouping related tests

### Example Invocation
```
@test-generator Create tests for TripSummaryCard component
```

### Output Format
```typescript
// {Component}.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// ... tests
```

---

## Prompts — `.github/prompts/`

Invoke with `/prompt-name` in chat.

### SDLC Workflow

| Prompt | Purpose |
|--------|---------|
| `/pr-creator` | Create PR with conventional commit, description, and checklist |
| `/security-audit` | OWASP Top 10 audit with prioritized finding report |
| `/docker-hardening` | Harden Dockerfiles (non-root, healthcheck, multi-stage) |
| `/rate-limiting` | Add rate limiting to API proxy endpoints |
| `/service-split` | Decompose monolithic files into focused services |
| `/csharp-constants-extraction` | Extract C# hardcoded strings to Constants/ |
| `/python-constants-extraction` | Extract Python hardcoded strings to constants.py |

### Frontend

| Prompt | Purpose |
|--------|---------|
| `/react-component` | Generate a React component |
| `/zustand-store` | Generate a Zustand store |
| `/custom-hook` | Generate a custom React hook |

### Testing

| Prompt | Purpose |
|--------|---------|
| `/playwright-test-planner` | Plan Playwright E2E test scenarios |
| `/playwright-test-coverage` | Analyze E2E test coverage gaps |
| `/plan-mockExternalApisBackendTests` | Mock external APIs in backend tests |

### Operations

| Prompt | Purpose |
|--------|---------|
| `/version-update` | Semantic version bump |
| `/plan-azureIacRoadmapUpdate` | Update Azure IaC roadmap |

---

## Pipeline Cheat Sheet

```
# Full sprint workflow
@sprint-planner → @sr-architect → @{lang}-implementer → @tdd-red → @tdd-green → @tdd-refactor → @code-reviewer → Human → /pr-creator

# Security fix
@sprint-planner → @sr-architect → @security-remediation → @tdd-red → @tdd-green → @code-reviewer → Human → /pr-creator

# Refactoring
@sprint-planner → @sr-architect → @service-decomposition → @tdd-red → @tdd-green → @code-reviewer → Human → /pr-creator

# Infrastructure
@sprint-planner → @sr-architect → @terraform-azure-planning → @terraform-implementer → @code-reviewer → Human → /pr-creator
```

---

## Instruction Files — `.github/instructions/`

Auto-applied based on file patterns:

| File | Applies To |
|------|-----------|
| `python.instructions.md` | `backend/**/*.py` |
| `csharp.instructions.md` | `backend-csharp/**` |
| `java.instructions.md` | `backend-java/**` |
| `bff.instructions.md` | `bff/**` |
| `react.instructions.md` | `frontend/**` |
| `terraform.instructions.md` | `infrastructure/**/*.tf` |
| `cicd.instructions.md` | `.github/workflows/**` |
| `testing.instructions.md` | `**/*.test.*`, `**/tests/**` |
