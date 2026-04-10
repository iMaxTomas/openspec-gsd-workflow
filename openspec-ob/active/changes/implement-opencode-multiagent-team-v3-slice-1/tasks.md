## 1. Freeze slice-one implementation boundaries

- [x] 1.1 Record that this change implements only the first bounded local landing from `plan-opencode-multiagent-team-v3`.
- [x] 1.2 Record that slice one includes one custom primary owner, visible retained lanes, and passive `state-log` / `checkpoint` outputs only.
- [x] 1.3 Record that hidden internal subagents, unresolved-item output, and handoff-candidate output are out of scope.

## 2. Wire the front-door owner

- [x] 2.1 Add one custom primary front-door owner under `.opencode/agents/`.
- [x] 2.2 Make the owner restate bounded scope, lane usage, and formal-answer versus `observation-only` classification.
- [x] 2.3 Keep the owner as the only operator-visible closure point.

## 3. Wire visible retained specialist lanes

- [x] 3.1 Add or map visible execution, research, and review retained lanes for the first local landing.
- [x] 3.2 Ensure lane outputs return as evidence to the owner rather than as peer conclusions.
- [x] 3.3 Enforce the frozen hard-gate routing matrix for research, execution, and review entry.

## 4. Wire the passive state path

- [x] 4.1 Add passive logging/checkpoint wiring for `state-log` output.
- [x] 4.2 Add passive logging/checkpoint wiring for `checkpoint` output.
- [x] 4.3 Ensure the passive path does not interrupt the operator thread by default.
- [x] 4.4 Ensure passive outputs remain distinguishable from formal task answers.

## 5. Validate the first landing

- [x] 5.1 Run one shadow-mode validation proving passive non-interference.
- [x] 5.2 Run one routing validation proving research / execution / review gate selection is inspectable.
- [x] 5.3 Run one closure validation proving the custom primary owner remains the single bounded answer point.
- [x] 5.4 Record rollback conditions if passive output becomes noisy or lane boundaries drift.

## 6. Prepare the next widening slice

- [x] 6.1 Record what remains deferred: hidden subagents, `unresolved-item`, and `handoff-candidate` output.
- [x] 6.2 Record the evidence needed before widening beyond slice one.

## 7. Evidence notes

- Shadow validation ran through `.opencode/scripts/slice-one-runner.mjs` and updated passive artifacts without interrupting the operator-facing thread.
- Live routing validations completed through `research-lane`, `execution-lane`, and `review-lane`, each returning through `front-door-owner` as the only bounded closure point.
- Runtime evidence currently lives in:
  - `/home/imax/codex-workspaces/opencode-lab-slice-1-wt/.opencode/passive/state-log.md`
  - `/home/imax/codex-workspaces/opencode-lab-slice-1-wt/.opencode/passive/checkpoint.md`
- Rollback condition: if passive artifacts begin surfacing terminal/ANSI noise or owner closure stops cleanly distinguishing formal answer vs observation-only material, revert to shadow-mode-only validation and tighten runner output parsing before further widening.
- Deferred beyond slice one: hidden internal subagents, `unresolved-item` output, `handoff-candidate` output, and any widening beyond visible retained lanes.
