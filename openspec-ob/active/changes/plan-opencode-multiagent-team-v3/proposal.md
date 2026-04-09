## Why

The current `test-agent` v2 tree is useful as a brainstorming artifact, but it is still too personality-heavy, too model-bound, and too easy to misread as a larger lab topology contract. The immediate operator need is narrower: land one practical OpenCode multiagent team that can be used locally, read quickly, and widened later without reopening the whole multi-runtime design.

This change creates a new independent OpenSpec planning line for that purpose. It is not a replacement for the accepted host-facing or `VM103` multi-runtime mainline. It is a same-runtime OpenCode planning template that freezes one front door, on-demand specialist lanes, explicit hard gates, and a passive state pipeline that only records and hands off state.

## What Changes

- Define one independent OpenCode multiagent v3 planning line for local adoption:
  - `one front-door owner -> on-demand specialist lanes -> passive state pipeline`
- Freeze the operator-visible owner pattern:
  - one front-door owner remains the only closure point for the operator
- Freeze the retained lane classes:
  - execution lane
  - research lane
  - review lane
- Define hard gate routing instead of role-first free routing:
  - read-heavy work goes to research
  - bounded write work goes to execution
  - high-risk, high-cost, or disagreement cases go to review
  - slice-external results remain `observation-only` until explicit correction or promotion
- Freeze an explicit owner contract:
  - the front-door owner must restate scope, declare lane usage, classify formal answer vs `observation-only`, and remain the only closure point
- Freeze threshold contracts for gate selection:
  - research, execution, and review entry conditions must be inspectable instead of ad-hoc
- Reframe the passive long-horizon idea as a pipeline:
  - reads evidence only
  - writes logs, checkpoints, unresolved items, and handoff candidates only
  - does not route, interrupt, or speak as a hidden team
- Define a first passive artifact schema:
  - `state-log`
  - `checkpoint`
  - `unresolved-item`
  - `handoff-candidate`
- Define the promotion workflow for `observation-only` material:
  - candidate -> review -> correction/promotion -> preserved lineage
- Mark current model bindings as transitional appendix material, not architecture truth
- Prepare a later implementation boundary for:
  - `opencode.json`
  - `.opencode/agents/`
  - passive logging or checkpoint plugin wiring

## Capabilities

### New Capabilities

- `opencode-multiagent-team-template`
  - Defines the operator-facing OpenCode team shape: one front-door owner, on-demand lanes, and single-owner closure.
- `opencode-specialist-lane-gates`
  - Defines the hard gate matrix that routes work between research, execution, and review lanes.
- `opencode-passive-state-pipeline`
  - Defines the passive state path as a non-interfering log/checkpoint/handoff pipeline.

### Modified Capabilities

- None.

## Impact

- Affects OpenCode local planning, agent-role naming, task routing, and later plugin or checkpoint wiring.
- Reuses current built-in primary/subagent discipline instead of inventing a new peer-brain runtime.
- Keeps the current broader multi-runtime line untouched while creating a narrow independent planning artifact that can be implemented quickly.
- Creates a clean handoff surface for a later implementation change that writes real OpenCode config and agent files.
