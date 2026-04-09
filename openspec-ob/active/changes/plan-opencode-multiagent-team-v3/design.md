## Context

The current operator goal is not to reopen the full host / `OpenClaw` / `VM103` topology. The goal is to turn the tightened `test-agent` v3 direction into one independent OpenSpec planning line that can guide a practical OpenCode multiagent landing. That means the change must stay same-runtime, local to OpenCode, and small enough to read and adopt quickly.

The earlier `test-agent` tree already contained the right intuition: one main entrypoint, specialist separation, cost discipline, and a passive state idea. The problem was not direction. The problem was shape. The v2 form still looked like a full personality tree with several long-lived named brains and a model table that could be mistaken for the architecture itself. This change narrows that into an owner-first, gate-driven template.

## Goals / Non-Goals

**Goals:**

- Define one independent OpenCode planning line for a local multiagent team.
- Keep one operator-visible front-door owner.
- Freeze the retained lane classes as execution, research, and review.
- Replace free-form role routing with hard gates.
- Reframe the passive long-horizon layer as a log/checkpoint/handoff pipeline.
- Keep current model bindings explicitly transitional.
- Produce a planning package that can feed a later implementation change directly.

**Non-Goals:**

- Do not replace or rewrite the accepted multi-runtime mainline.
- Do not define a full lab-wide team runtime or a new orchestration bus.
- Do not make the passive path a hidden router, supervisor, or speaking agent.
- Do not lock current model names into permanent architectural roles.
- Do not require immediate implementation in the same change.

## Decisions

### 1. Treat this as an independent same-runtime OpenCode planning line

This change stands on its own as a local OpenCode team plan. It does not need to inherit the burden of proving the entire broader topology before it becomes useful.

Alternative considered:
- Tie the plan directly to the current accepted multi-runtime mainline.
  - Rejected because it would slow down a narrow local team landing and encourage readers to confuse a local OpenCode template with the full lab contract.

### 2. Keep one front-door owner as the only operator-visible closure point

The OpenCode team should expose one front-door owner that receives the task, restates the boundary, chooses whether any specialist lane is needed, integrates evidence, and returns one bounded answer.

The owner contract is:

- every task begins with one explicit boundary restatement
- every delegated path records which lane was used and why
- every final answer distinguishes:
  - formal answer
  - `observation-only` material
  - unresolved items
- every lane result returns as evidence to the owner rather than as peer authority
- every promotion of external or passive material requires an explicit correction or promotion step

Alternative considered:
- Keep multiple long-lived named coordinators in parallel.
  - Rejected because it increases reading cost, invites role drift, and conflicts with the current preference for one owner and hard closure.

### 3. Recast specialists as on-demand lanes, not permanent peer brains

The retained specialist classes are:
- execution lane
- research lane
- review lane

They exist to serve the front-door owner. They are not alternative owners and they are not permanent operator-facing personas by default.

Alternative considered:
- Preserve the full named-role tree from the v2 artifact.
  - Rejected because the local OpenCode adoption target needs a smaller and more legible structure.

### 4. Route by hard gates instead of by free role preference

The routing contract is:
- read-heavy, comparison, inspection, and discovery work goes to research
- bounded implementation with a clear write boundary goes to execution
- high-risk, high-cost, high-disagreement, or final-judgment cases go to review
- slice-external results remain `observation-only` until an explicit correction or promotion step

This keeps the line inspectable and avoids the familiar failure mode where a strong role or stronger model silently expands its scope.

The first hard threshold contract is:

- research lane threshold:
  - the current slice is primarily read-heavy, comparison-heavy, lookup-heavy, or inspection-heavy
  - the slice does not yet have a frozen bounded write target
- execution lane threshold:
  - the slice has a declared bounded write target
  - the allowed files or write surface are inspectable
  - no-go boundaries were stated before write work starts
- review lane threshold:
  - the slice is high-risk, high-cost, final-judgment, or materially conflicting
  - or the owner cannot close the current line from returned evidence alone

The first threshold terms are:

- high-risk:
  - may affect architecture, topology, auth, governance, lane identity, or other cross-slice invariants
- high-cost:
  - would consume a stronger or scarcer lane that should not be used for commodity first-pass work
- materially conflicting:
  - two or more returned results imply different bounded conclusions, different promoted state, or different correction steps

Alternative considered:
- Route mainly by the perceived strength of the model or the charisma of a named role.
  - Rejected because it weakens repeatability and makes later review harder.

### 5. Convert the passive long-horizon layer into a passive state pipeline

The passive path may contain internal stages such as observation, synthesis, checkpoint writing, and handoff packing, but it is still one pipeline. It reads evidence and writes bounded artifacts. It does not speak in the operator thread, route work, or seize ownership.

The first passive artifact schema is:

- `state-log`
  - purpose: append-only chronological state trace for one local team line
  - minimum fields:
    - `timestamp`
    - `source_slice`
    - `lane_path`
    - `state_delta`
    - `risk_flag`
- `checkpoint`
  - purpose: compact resumable snapshot for later local reuse
  - minimum fields:
    - `timestamp`
    - `current_boundary`
    - `active_owner`
    - `active_or_last_lane`
    - `current_status`
    - `open_questions`
- `unresolved-item`
  - purpose: durable record of an issue that remains open across slices
  - minimum fields:
    - `item_id`
    - `first_seen`
    - `current_status`
    - `affected_scope`
    - `blocking_reason`
    - `next_needed_step`
- `handoff-candidate`
  - purpose: bounded package that may later be handed to a specialist or owner correction step
  - minimum fields:
    - `candidate_id`
    - `source_window`
    - `affected_scope`
    - `why_notable`
    - `recommended_lane`
    - `supporting_evidence_refs`
    - `confidence`

The passive pipeline cadence is:

- it may run on window close, explicit status request, or later bounded replay
- it may not emit operator-visible interruption by default
- it may only write bounded artifacts into its declared passive surface

Alternative considered:
- Keep the passive path as a hidden internal team.
  - Rejected because it is too easy to misread as a second orchestration brain.

### 6. Treat model bindings as transitional appendix material

Current bindings such as `GPT-5.4`, `GPT-5.3-codex`, `Kimi`, `MiniMax`, or reviewer-grade model choices may be recorded for the current period, but the architecture should remain stable when those bindings change.

Alternative considered:
- Make the model table part of the architectural core.
  - Rejected because the user has already stated that current `5.4 / 5.3` bindings are transitional.

### 7. Land this in phases

The recommended landing order is:
1. freeze the front-door owner and gate table
2. freeze the three lane classes and their ownership boundaries
3. define the passive pipeline in shadow mode
4. later implement concrete OpenCode config and plugin wiring

### 8. Freeze the first implementation slice

The first implementation slice is intentionally narrow:

- front-door owner:
  - implement as one custom primary agent immediately
- retained specialist lanes:
  - keep execution, research, and review visible in the first local landing
  - do not hide them behind internal subagents yet
- passive pipeline:
  - first implementation writes `state-log` and `checkpoint` only
  - `unresolved-item` and `handoff-candidate` remain planned outputs but are not required in slice one
- validation target:
  - prove owner closure, gate routing, passive non-interference, and artifact separation before widening functionality

Why:

- one custom primary owner makes the front-door contract concrete instead of remaining abstract
- visible retained lanes make routing behavior easier to inspect during early adoption
- limiting the passive path to `state-log` and `checkpoint` lowers drift risk while still proving the logging/checkpoint surface

Alternative considered:
- start from built-in `build/plan` plus only custom subagents
  - rejected for slice one because it keeps the front-door contract too implicit
- ship unresolved/risk summaries from day one
  - rejected for slice one because passive value should first be proven through low-noise checkpointing
- hide retained lanes immediately
  - rejected for slice one because visibility is more useful than elegance during first local stabilization

## Risks / Trade-offs

- [Risk] Readers may still confuse this change with the accepted multi-runtime mainline.  
  -> Mitigation: label the change as OpenCode-local and same-runtime throughout the proposal and specs.

- [Risk] The named role vocabulary may still push readers toward personality-first interpretation.  
  -> Mitigation: freeze lane classes and owner responsibilities first; treat names as labels, not authority proofs.

- [Risk] Passive state work could drift back into hidden orchestration.  
  -> Mitigation: require the passive pipeline to remain read-only on evidence inputs and write-only on bounded artifact outputs.

- [Risk] Model bindings could silently become architecture assumptions.  
  -> Mitigation: keep them out of the core requirements and classify them as transitional appendix material.

- [Risk] `observation-only` material may accumulate without a disciplined adoption path.
  -> Mitigation: freeze one explicit promotion workflow and keep lineage visible.

## Migration Plan

1. Freeze the independent OpenCode-local scope for this team plan.
2. Freeze the front-door owner and lane boundary table.
3. Freeze the hard gate routing matrix and observation-only rule.
4. Freeze the passive state pipeline contract and artifact types.
5. Freeze the `observation-only` correction/promotion workflow.
6. Prepare one later implementation change for `opencode.json`, `.opencode/agents/`, and passive plugin wiring.

## Observation-Only Promotion Workflow

The first promotion workflow is:

1. candidate created
   - a slice-external result or passive artifact is recorded as `observation-only`
2. owner review trigger
   - the front-door owner or a later planning slice explicitly selects the candidate for inspection
3. review or correction step
   - if the candidate affects a high-risk or conflicting area, it must pass through the review lane
   - otherwise the owner may perform a bounded correction step directly
4. promotion decision
   - accepted material is promoted into the current formal line with a saved correction note
5. lineage preservation
   - the saved record keeps:
     - original `observation-only` source
     - promotion timestamp
     - promoting actor/lane
     - superseded boundary reference

This keeps later adoption inspectable instead of silently rewriting history.

## Resolved First-Slice Decisions

- The first implementation change SHALL map the front-door owner onto one custom primary agent immediately.
- The first passive pipeline implementation SHALL write `state-log` and `checkpoint` only.
- The first local landing SHALL keep retained lanes visible until the role table stabilizes.
