## Why

The current Windows-side terminal setup is still operating as a transport-first stack: a host terminal opens PowerShell and SSH sessions, and VTM is treated as something launched later from the remote side. That keeps the workflow familiar, but it leaves keyboard behavior, font alignment, shell appearance, and theme behavior split across too many layers.

The immediate operator need is narrower and more practical: freeze one Windows-local terminal planning line that makes VTM the preferred local workflow, keeps WezTerm relevant as a local terminal emulator, standardizes on PowerShell 7, adopts Maple Mono as the font baseline, and makes shell and terminal light/dark behavior move together instead of drifting separately.

This change is planning-only. It does not yet implement runtime configuration, profile wiring, or theme automation. It creates the bounded OpenSpec line needed so later GSD execution can land those changes without reopening the architecture question.

## What Changes

- Define one independent Windows-local terminal planning line.
- Freeze VTM as the preferred Windows-side workflow for the user-facing terminal environment.
- Freeze WezTerm as a still-relevant local terminal emulator path rather than a discarded alternative.
- Freeze PowerShell 7 (`pwsh`) as the shell integration surface.
- Freeze Maple Mono as the default font baseline.
- Freeze a bounded personalization surface instead of leaving appearance changes ad hoc.
- Define synchronized light/dark behavior between shell and terminal emulator as a formal requirement.
- Prepare later implementation slices for:
  - Windows-local VTM baseline setup
  - PowerShell 7 integration
  - Maple Mono and personalization wiring
  - light/dark theme synchronization
  - WezTerm parity validation for the non-primary path

## Capabilities

### New Capabilities

- `windows-local-terminal-workflow`
  - Defines the Windows-local workflow boundary, VTM preference, and the role of WezTerm as a still-supported local terminal path.
- `powershell-terminal-personalization`
  - Defines the PowerShell 7 integration surface, Maple Mono baseline, and bounded personalization contract.
- `terminal-theme-synchronization`
  - Defines synchronized light/dark behavior between shell semantic colors and terminal appearance state.

### Modified Capabilities

- None.

## Impact

- Affects later Windows-local terminal setup work, shell profile decisions, terminal emulator configuration, and theme wiring.
- Narrows the operator-facing workflow to a VTM-first Windows path while preserving WezTerm as a relevant supporting path.
- Creates an implementation handoff surface for later GSD execution without mixing planning and runtime edits in the same change.
- Makes theme synchronization an explicit requirement instead of a best-effort cosmetic preference.
