## Why

`plan-opencode-multiagent-team-v3` now freezes an implementation-ready first slice: one custom primary front-door owner, visible execution/research/review lanes, and a passive state path limited to `state-log` and `checkpoint`. The next step is to land that slice as a bounded local OpenCode implementation without widening into hidden subagent complexity, unresolved/risk pipeline expansion, or broader runtime topology work.

## What Changes

- Implement slice one of the local OpenCode multiagent team from `plan-opencode-multiagent-team-v3`.
- Add one custom primary front-door owner to `.opencode/agents/`.
- Keep execution, research, and review as visible retained lanes in the first landing.
- Wire a first passive state path that writes `state-log` and `checkpoint` artifacts only.
- Limit passive behavior to non-interfering logging/checkpoint output with no operator-thread interruption.
- Validate owner closure, hard-gate routing, passive non-interference, and artifact separation before widening the team.

## Capabilities

### New Capabilities

- `opencode-multiagent-team-v3-slice-one-implementation`
  - Implements the first local OpenCode landing for the v3 team shape: one custom primary owner, visible specialist lanes, and bounded passive logging/checkpoint outputs.

### Modified Capabilities

- `opencode-passive-state-pipeline`
  - Narrowly applies the first implementation slice to `state-log` and `checkpoint` output only.

## Impact

- Affected planning repo:
  - `openspec-ob/active/changes/implement-opencode-multiagent-team-v3-slice-1`
- Affected runtime/config surfaces:
  - `opencode.json`
  - `.opencode/agents/`
  - passive logging/checkpoint plugin wiring
- Keeps the broader v3 planning line intact while proving one bounded local landing path.
