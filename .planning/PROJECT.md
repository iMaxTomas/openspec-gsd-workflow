# Project

## Milestone: v1.0 Terminal Workspace

Establish the first usable Windows-local terminal workspace baseline for `172.29.111.218`.

Scope is intentionally narrow: make VTM the preferred Windows-side workflow, standardize shell integration on PowerShell 7 (`pwsh`), adopt Maple Mono as the default font baseline, and define bounded personalization that does not drift outside the terminal workspace surface.

Theme sync is in scope for v1.0 and starts with a manual synchronized light/dark toggle, so shell semantic colors and terminal appearance move together in both modes. WezTerm remains relevant as a supported local path for parity checks, but it is not the primary workflow for this milestone.

Out of scope: full rock5t rollout, remote-first terminal architecture changes, and broader automation beyond the initial manual theme sync baseline.
