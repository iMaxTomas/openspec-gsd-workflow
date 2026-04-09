## 1. Freeze slice-one implementation boundaries

- [ ] 1.1 Record that this change implements only the first bounded local landing from `plan-opencode-multiagent-team-v3`.
- [ ] 1.2 Record that slice one includes one custom primary owner, visible retained lanes, and passive `state-log` / `checkpoint` outputs only.
- [ ] 1.3 Record that hidden internal subagents, unresolved-item output, and handoff-candidate output are out of scope.

## 2. Wire the front-door owner

- [ ] 2.1 Add one custom primary front-door owner under `.opencode/agents/`.
- [ ] 2.2 Make the owner restate bounded scope, lane usage, and formal-answer versus `observation-only` classification.
- [ ] 2.3 Keep the owner as the only operator-visible closure point.

## 3. Wire visible retained specialist lanes

- [ ] 3.1 Add or map visible execution, research, and review retained lanes for the first local landing.
- [ ] 3.2 Ensure lane outputs return as evidence to the owner rather than as peer conclusions.
- [ ] 3.3 Enforce the frozen hard-gate routing matrix for research, execution, and review entry.

## 4. Wire the passive state path

- [ ] 4.1 Add passive logging/checkpoint wiring for `state-log` output.
- [ ] 4.2 Add passive logging/checkpoint wiring for `checkpoint` output.
- [ ] 4.3 Ensure the passive path does not interrupt the operator thread by default.
- [ ] 4.4 Ensure passive outputs remain distinguishable from formal task answers.

## 5. Validate the first landing

- [ ] 5.1 Run one shadow-mode validation proving passive non-interference.
- [ ] 5.2 Run one routing validation proving research / execution / review gate selection is inspectable.
- [ ] 5.3 Run one closure validation proving the custom primary owner remains the single bounded answer point.
- [ ] 5.4 Record rollback conditions if passive output becomes noisy or lane boundaries drift.

## 6. Prepare the next widening slice

- [ ] 6.1 Record what remains deferred: hidden subagents, `unresolved-item`, and `handoff-candidate` output.
- [ ] 6.2 Record the evidence needed before widening beyond slice one.
