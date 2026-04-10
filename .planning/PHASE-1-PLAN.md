# Phase 1 Plan: Windows-local VTM baseline

## Goal

Stand up the first usable Windows-local terminal workspace baseline on the Windows host `172.29.111.218` with VTM as the primary local operator path, PowerShell 7 via `pwsh` as the inspectable shell surface, Maple Mono as the default font baseline, bounded personalization, and a manual synchronized light/dark toggle that keeps shell and terminal appearance aligned.

## Scope

### In scope

- Windows-local operator workflow only.
- Primary terminal path: VTM.
- Shell integration surface: PowerShell 7 (`pwsh`).
- Default font baseline: Maple Mono.
- Bounded personalization limited to terminal and shell appearance.
- Manual synchronized light/dark switching.
- WezTerm validation only as a supported non-primary parity path.

### Out of scope

- Any rock5t rollout or broader remote deployment.
- Making WezTerm the primary workflow.
- Automatic theme synchronization with system or application state.
- Remote-first terminal architecture changes.
- Broad shell ecosystem changes beyond the `pwsh` integration surface.
- General personalization outside the defined terminal workspace boundary.

## Prerequisites

- Access to the Windows host `172.29.111.218` as the execution and user-interface environment for this phase.
- VTM available on that Windows host.
- PowerShell 7 installed and invocable as `pwsh`.
- Maple Mono installed or installable on the Windows host.
- Ability to inspect and edit VTM and WezTerm local configuration surfaces.
- Ability to inspect the PowerShell profile boundary that will own terminal-facing shell appearance.
- A short manual validation checklist prepared before config changes begin.

## Ordered Tasks

1. Freeze the local workflow boundary.
   - Confirm the operator-facing path is Windows-local VTM, not a transport-first or remote-launched VTM pattern.
   - Record the exact operator launch path on the Windows host `172.29.111.218`.
   - Define what counts as in workflow for Phase 1: VTM config, `pwsh` startup, font baseline, appearance settings, manual theme toggle, and parity evidence.

2. Establish the shell entry surface.
   - Configure the preferred VTM profile to launch `pwsh` explicitly.
   - Remove ambiguity around alternate shells or inherited defaults.
   - Make the shell entry inspectable so later evidence can show that the active baseline is actually `pwsh`.

3. Apply the VTM baseline.
   - Create or normalize the primary VTM profile used for the Windows-local workflow.
   - Set Maple Mono as the baseline font for that profile.
   - Keep non-font appearance settings minimal until the bounded personalization contract is defined.

4. Define and apply bounded personalization.
   - Separate baseline settings from optional personalization.
   - Limit personalization to inspectable appearance-only surfaces.
   - Exclude behavior drift such as alternate shells, transport changes, plugin sprawl, or unrelated prompt frameworks.

5. Implement the manual synchronized theme toggle.
   - Define exactly two supported states: light and dark.
   - For each state, set matching terminal appearance and shell semantic color intent.
   - Implement a manual switch path that changes both surfaces together.
   - Keep the toggle inspectable and repeatable.

6. Preserve WezTerm as a non-primary parity path.
   - Set up or validate a minimal WezTerm configuration that mirrors the same Phase 1 expectations.
   - Do not optimize or promote WezTerm beyond parity checking.

7. Run acceptance verification and capture evidence.
   - Validate the primary VTM path first.
   - Validate light and dark mode behavior.
   - Validate personalization boundaries.
   - Validate WezTerm parity without treating it as a competing primary path.

## Verification Steps

- Workflow check: collect one launch artifact showing the preferred path starts `D:\Ops\vtm\bin\vtm.exe` from the Windows host `172.29.111.218` and does not depend on a transport-first or remote-hosted UI path.
- Shell check: collect one inspectable startup artifact showing the preferred VTM path launches `C:\Program Files\PowerShell\7\pwsh.exe`, such as the launch script, profile command, or VTM config entry used by the baseline.
- Font check: collect one inspectable artifact showing Maple Mono is the configured VTM font baseline, and one runtime confirmation artifact such as a screenshot or visible font selection state.
- Boundary check: collect one bounded-personalization note that distinguishes baseline settings from optional appearance-only settings and explicitly excludes shell substitution, transport changes, and unrelated prompt or plugin expansion.
- Light-mode check: collect one artifact for terminal light-mode settings and one artifact for shell light-mode settings, and show that both belong to the same named light-mode state.
- Dark-mode check: collect one artifact for terminal dark-mode settings and one artifact for shell dark-mode settings, and show that both belong to the same named dark-mode state.
- Manual-toggle check: collect one repeatable procedure, script, or paired command set that switches both shell and terminal between the two supported states without using automatic OS-theme detection.
- Readability check: collect one validation note or screenshot set showing that both light and dark modes remain readable with the chosen baseline colors and Maple Mono.
- WezTerm parity check: collect one minimal WezTerm parity artifact showing `pwsh`, Maple Mono, and the same two named light/dark states remain available there while WezTerm stays explicitly non-primary.

## Deliverables

- A defined VTM-first Windows-local workflow for the Windows host `172.29.111.218`.
- One inspectable VTM profile baseline using `pwsh`.
- Maple Mono applied as the default font baseline.
- A documented bounded personalization surface.
- A working manual synchronized light/dark toggle for shell plus terminal.
- A minimal WezTerm parity configuration or checklist.
- A short evidence pack or checklist showing Phase 1 exit criteria were met.

## Risks

- VTM and WezTerm may expose theme and color knobs differently, making parity easy to over-engineer.
- Existing PowerShell profile layers may blur the intended ownership boundary for appearance.
- Maple Mono may not be consistently installed or may resolve differently across apps.
- Manual theme switching can drift if shell and terminal settings are changed separately.
- Scope creep risk is high around automation, prompt customization, or transport redesign.

## Execution Slices

1. Slice 1: VTM + `pwsh` Windows-local baseline on the Windows host `172.29.111.218`.
2. Slice 2: Manual synchronized light/dark toggle for shell plus terminal.
3. Slice 3: Maple Mono confirmation, bounded personalization, and WezTerm parity validation.
