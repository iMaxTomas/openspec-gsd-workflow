## 1. Freeze independent Windows-local scope

- [ ] 1.1 Record this change as an independent Windows-local terminal planning line.
- [ ] 1.2 Record that this planning line prefers a Windows-local VTM workflow instead of a transport-first remote launch path.
- [ ] 1.3 Record that WezTerm remains relevant as a local terminal emulator path even when it is not the preferred workflow.
- [ ] 1.4 Record that this change is planning-only and does not yet land runtime or profile edits.

## 2. Freeze workflow and shell boundaries

- [ ] 2.1 Define the preferred Windows-local VTM workflow boundary.
- [ ] 2.2 Define PowerShell 7 as the shell integration surface.
- [ ] 2.3 Record that the target shell invocation surface is `pwsh`.
- [ ] 2.4 Record the non-primary WezTerm path boundary so later implementation keeps parity expectations inspectable.

## 3. Freeze personalization boundaries

- [ ] 3.1 Define Maple Mono as the default font baseline.
- [ ] 3.2 Define the bounded personalization surface for terminal and shell appearance.
- [ ] 3.3 Record how personalization remains valid for both the preferred VTM path and the still-relevant WezTerm path.
- [ ] 3.4 Record the PowerShell profile scope boundary so later implementation does not drift between shell layers.

## 4. Freeze synchronized light/dark theming

- [ ] 4.1 Define the shared light-mode contract for shell and terminal appearance.
- [ ] 4.2 Define the shared dark-mode contract for shell and terminal appearance.
- [ ] 4.3 Define the synchronization rule between terminal appearance state and shell semantic color state.
- [ ] 4.4 Define how synchronization remains inspectable for both the preferred VTM path and the still-relevant WezTerm path.
- [ ] 4.5 Define minimum accessibility and contrast expectations for synchronized themes.

## 5. Add planning-time validation gates

- [ ] 5.1 Define acceptance cases for the preferred Windows-local VTM + PowerShell 7 path.
- [ ] 5.2 Define acceptance cases for synchronized light-mode behavior.
- [ ] 5.3 Define acceptance cases for synchronized dark-mode behavior.
- [ ] 5.4 Define acceptance cases for Maple Mono and bounded personalization.
- [ ] 5.5 Define no-regression checks proving that WezTerm remains a relevant local path.

## 6. Prepare later implementation handoff

- [ ] 6.1 Freeze slice one to the Windows-local VTM + PowerShell 7 baseline.
- [ ] 6.2 Freeze slice two to synchronized light/dark theme wiring.
- [ ] 6.3 Freeze slice three to Maple Mono, personalization, and WezTerm parity validation.
- [ ] 6.4 Record the minimum evidence required before widening beyond the preferred local workflow.
