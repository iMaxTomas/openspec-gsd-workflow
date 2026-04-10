## Why

`implement-opencode-multiagent-team-v3-slice-1` proved the bounded local runtime surface: one custom primary front-door owner, visible retained lanes, hard-gate routing, and a passive path limited to `state-log` and `checkpoint`. The next widening step should preserve that low-noise owner-first shape while adding the first durable cross-slice carry-forward surface.

The safest next slice is not hidden subagents. It is the controlled promotion pipeline that was already frozen in the planning line but intentionally deferred from slice one: `unresolved-item`, `handoff-candidate`, and the owner/review-mediated promotion path from `observation-only` material into the formal line.

## What Changes

- Implement slice two of the local OpenCode multiagent team from `plan-opencode-multiagent-team-v3`.
- Extend the passive pipeline beyond `state-log` and `checkpoint` to include bounded `unresolved-item` and `handoff-candidate` outputs.
- Add a controlled promotion path so `observation-only` material can be reviewed or corrected before formal adoption.
- Keep one front-door owner, visible retained lanes, and the existing hard-gate matrix intact.
- Explicitly defer hidden internal subagents and any topology widening beyond the current visible lane model.

## Capabilities

### Modified Capabilities

- `opencode-passive-state-pipeline`
  - widens the passive implementation from log/checkpoint only to log/checkpoint plus durable unresolved-item and handoff-candidate artifacts.
- `opencode-specialist-lane-gates`
  - makes the promotion path inspectable by defining when owner correction is sufficient versus when review-lane promotion is required.

## Impact

- Affected planning repo:
  - `openspec-ob/active/changes/implement-opencode-multiagent-team-v3-slice-2-promotion-pipeline`
- Expected runtime/config surfaces in later implementation:
  - `.opencode/passive/`
  - `.opencode/scripts/`
  - owner-facing routing/promotion instructions
- Keeps the validated slice-one runtime surface intact while adding the first bounded cross-slice carry-forward mechanism.
