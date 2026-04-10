# Requirements

## v1.0 Terminal Workspace Summary

This milestone delivers a Windows-local terminal baseline that is usable against `172.29.111.218`.

### Required outcomes

- Preferred local workflow is VTM on Windows, not a transport-first remote launch path.
- Shell integration surface is PowerShell 7, invoked as `pwsh`.
- Maple Mono is the default font baseline.
- Personalization is in scope, but remains bounded and inspectable.
- Light and dark themes stay synchronized between shell colors and terminal appearance.
- The first synchronization step is a manual light/dark toggle, not full automation.
- WezTerm stays supported as a relevant non-primary local path with parity expectations visible.

### Out of scope

- Full rollout beyond the Windows-local baseline.
- Replacing VTM with WezTerm as the primary workflow.
- Omitting theme synchronization.
