# Strategy Card Governance Upgrade

Date: 2026-04-26

This note records the current strategy-card governance upgrade for large-output and evidence-heavy AI development tasks.

## Operator Flow

```text
I start a task
  -> the task freezes a strategy card
  -> the planning audit checks the card before execution
  -> wrappers, probes, RTK, or sidecars capture large output
  -> raw output is saved as artifacts
  -> the main context receives only a bounded summary and key paths
  -> if evidence is insufficient, a bounded second search expands from named roots
  -> the task stops at the recorded stop line and reports the result
```

The goal is not to forbid large commands. The goal is to keep large commands inspectable, resumable, and bounded.

## What Changed

| Area | Before | After |
|------|--------|-------|
| Strategy card | Often treated as a planning note | Required task-start contract |
| Large output | Could flow into the main context directly | Raw output goes to artifacts first |
| Tool responsibility | Could be described generically | Must name owner, fallback, raw-output path, and summary contract |
| Sidecars | Optional and sometimes implicit | Must record sidecar decision or bounded no-sidecar rationale |
| Second search | Could drift or be over-blocked | Allowed when rooted, bounded, and tied to the evidence gap |
| Stop policy | Often implicit | Must record a stop line before execution |

## Required Card Fields

A governed strategy card should record:

- task goal
- execution path
- output-load classification
- sidecar decision or no-sidecar rationale
- tool responsibility by family
- raw-output artifact path
- main-context output contract
- fallback path when the preferred tool is insufficient
- stop line

For light tasks, the minimal card can stay short, but it still needs a goal, path, expected result, and stop line.

## Cross-Tool Responsibility

When a task names RTK, wrappers, artifact-first capture, sidecars, planning audit, strategy cards, external CLIs, remote commands, JSON processors, logs, tests, search, or file reads, the card must state who owns each output family.

Minimum responsibility record:

```text
Tool family: repo-wide search
Preferred owner: wrapper
Fallback: targeted rg by source root
Raw output: artifacts/search/raw.txt
Main context: hit count, key files, selected snippets only
Stop line: stop if the hit set expands beyond the named roots
```

This prevents vague lines such as "the wrapper handles output" from passing as governance.

## Large-Output Command Handling

High-output commands include:

- repo-wide search, recursive file listing, and broad tree walks
- large JSON, logs, diffs, and test exports
- `docker logs`, `journalctl`, `systemctl status`
- broad `git diff`, `git log`, or `git show`
- external CLI exports and remote evidence collection

Expected handling:

```text
large command
  -> wrapper/probe captures full output
  -> artifact stores raw result
  -> summary extracts counts, paths, and selected evidence
  -> main context receives the summary
  -> second search only runs from a named evidence gap
```

## Gate Behavior

The gate blocks:

- missing strategy card
- placeholder card with only a heading
- `none` or empty responsibility values
- counts-only text pretending to be a main-context contract
- generic per-family blanket ownership
- negated sidecar wording such as "no sidecar decision needed"
- stale handoff prose replacing the current card

The gate allows:

- targeted `git show` reads
- targeted health/status `curl`
- named-source-root searches
- bounded second-pass search with a stop line
- natural-language stop lines when they are specific enough

## Validation Matrix

This upgrade was validated with:

- syntax check for the planning-audit script
- pass/fail fixtures for output gates and task-start gates
- adversarial red-team cases for over-permissive and over-rigid behavior
- independent no-memory validation of the strategy-card flow
- strict OpenSpec validation for the affected changes

Representative fail cases:

- `none` responsibility values
- counts-only main-context contract
- generic blanket ownership
- negated sidecar decision
- stale handoff-only responsibility

Representative pass cases:

- bounded repo-wide search
- precise second search
- named workspace source root
- targeted `git show`
- targeted `/health` read
- prose stop line with a clear stopping condition

## Practical Result

The upgrade changes large-output work from:

```text
run command -> paste huge output -> lose context -> summarize from memory
```

to:

```text
plan command -> capture raw output -> save artifact -> summarize bounded result -> expand only when needed
```

This keeps high-volume work fast while preserving evidence, follow-up paths, and reviewability.
