# AGENTS.md

## Project
JobQuest — gamified job search tracker. Monorepo: apps/backend (NestJS),
apps/frontend (React/Vite), apps/extension (Chrome MV3).

## Before implementing anything, read the relevant spec:
- Data model / schema → specs/data-model.md
- XP, leveling, quest/achievement rules → specs/business-logic.md
- Endpoint contracts → specs/api.md
- Screens, states, components → specs/ui-spec.md

## Conventions
- Package manager: npm (workspaces), not pnpm/yarn
- Never invent XP values or level thresholds — they live in specs/business-logic.md, treat it as source of truth
- Skills: see .agent-skills/backend/ and .agent-skills/frontend/ for stack-specific conventions