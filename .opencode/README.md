# slice-one runtime helpers

This worktree uses a minimal local runner to exercise the frozen slice-one owner/lane contract without widening the runtime surface.

## Commands

- Shadow routing validation:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Inspect current passive outputs" --shadow --json`
- Live research-lane validation with owner closure:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Inspect the existing passive state files and summarize whether the current checkpoint matches the state log without changing any files." --json`
- Live execution-lane validation with bounded write declaration:
  - `node .opencode/scripts/slice-one-runner.mjs --task "Update the checkpoint wording for the next validation pass." --write-target ".opencode/passive/checkpoint.md" --no-go "Do not write outside .opencode/passive/*.md" --json`

## Behavior

- Applies the frozen hard-gate matrix to choose `research-lane`, `execution-lane`, or `review-lane`.
- Optionally runs the selected lane through `opencode run --agent <lane>`.
- Always routes the lane evidence back through `front-door-owner` for single-point closure on live runs.
- Automatically appends `state-log` and rewrites `checkpoint` so passive artifacts stay bounded and non-interrupting.
