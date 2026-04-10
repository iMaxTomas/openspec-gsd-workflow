# slice runtime helpers

This worktree uses a minimal local runner to exercise the frozen slice-one owner/lane contract and the slice-two promotion pipeline without widening into hidden subagents.

## Commands

- Shadow routing validation:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Inspect current passive outputs" --shadow --json`
- Live research-lane validation with owner closure:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Inspect the existing passive state files and summarize whether the current checkpoint matches the state log without changing any files." --json`
- Live execution-lane validation with bounded write declaration:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Update the checkpoint wording for the next validation pass." --write-target ".opencode/passive/checkpoint.md" --no-go "Do not write outside .opencode/passive/*.md" --json`
- Passive unresolved-item validation:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Record an unresolved observation-only issue for later follow-up." --artifact unresolved-item --observation-source "validation://slice-two/unresolved" --affected-scope "promotion pipeline" --blocking-reason "promotion threshold not yet confirmed" --next-needed-step "decide owner-correction versus review-lane" --shadow --json`
- Passive handoff-candidate validation:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Capture a bounded observation-only candidate for later adoption." --artifact handoff-candidate --observation-source "validation://slice-two/candidate" --affected-scope "owner wording" --why-notable "bounded low-risk correction candidate" --supporting-evidence-refs "validation://slice-two/candidate" --confidence "medium" --promotion-risk low --shadow --json`
- Low-risk owner-correction promotion validation:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Promote a bounded low-risk observation-only wording correction." --artifact handoff-candidate --observation-source "validation://slice-two/owner" --affected-scope "owner wording" --why-notable "low-risk bounded correction" --supporting-evidence-refs "validation://slice-two/owner" --confidence "high" --promotion-risk low --promote owner --json`
- High-risk review-lane promotion validation:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Promote a high-risk observation-only architecture boundary change." --artifact handoff-candidate --observation-source "validation://slice-two/review" --affected-scope "architecture boundary" --why-notable "changes a cross-slice invariant" --supporting-evidence-refs "validation://slice-two/review" --confidence "high" --promotion-risk high --promote review --json`

## Behavior

- Applies the frozen hard-gate matrix to choose `research-lane`, `execution-lane`, or `review-lane`.
- Routes live validation through `front-door-owner`, which remains the only closure point.
- Always routes the lane evidence back through `front-door-owner` for single-point closure on live runs.
- Automatically appends `state-log`, rewrites `checkpoint`, and can also record bounded `unresolved-item` and `handoff-candidate` passive artifacts.

## Passive artifact surfaces

- `state-log.md`: append-only chronological runtime history
- `checkpoint.md`: current resumable boundary snapshot
- `unresolved-item.md`: durable passive ledger for issues that stay open across slices
- `handoff-candidate.md`: bounded passive ledger for observation-only candidates awaiting owner correction or review-mediated promotion
