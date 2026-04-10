## Why

The current Windows-native `vtm.exe` compiles with a Win32 native GUI rendering path. When running `vtm --tui` inside WezTerm and then launching a remote session via `v5t` (`vtm ssh imax@rock-5t vtm`), the Windows binary spawns a separate native GUI window instead of nesting the remote vtm desktop inside the current TUI pane. This breaks the expected single-window workflow.

Cygwin provides a POSIX TTY environment on Windows without virtualization overhead (no WSL2 required). A vtm binary built under Cygwin does not include the Win32 GUI backend; it is forced to operate in pure TUI mode, emitting VT escape sequences just like the Linux build. Therefore, `vtm --tui` combined with `vtm ssh` would remain entirely inside the host terminal window, eliminating the unwanted independent GUI popup.

**Decision: continue with Cygwin rather than WSL2 or switching host terminal to kitty.**
- WSL2 would add virtualization overhead, require a system reboot to enable, and complicate SSH key bridging and the `vtm ssh` invocation path.
- kitty is not officially supported on Windows and would introduce GPU-render wrapper instability; WezTerm already provides excellent VT sequence support and pane hosting.
- The existing Cygwin 3.6.5 environment on 172.29.111.218 needs only toolchain and hygiene fixes, not replacement.

The host at 172.29.111.218 already has Cygwin 3.6.5-1.x86_64 installed at `C:\cygwin64`, but the necessary build toolchain (cmake, gcc-g++, make) and libraries (freetype, harfbuzz, lua) are missing, and the Cygwin environment has minor health issues (a broken x-cmd startup line in `.bashrc` and incomplete `.ssh` symlinks). This change defines the planning line to heal the environment, provision the Cygwin build toolchain, compile vtm from source, and wire the resulting binary into the existing `WezTerm → fish → Cygwin` terminal workflow.

## What Changes

- Capture the current Cygwin state on 172.29.111.218: version 3.6.5-1.x86_64, rootdir `C:\cygwin64`, existing core runtime present, build toolchain absent.
- **Heal environment hygiene issues**: remove the broken x-cmd startup line from `~/.bashrc`, fix SSH file bridging between Windows and Cygwin, and ensure private-key permissions meet OpenSSH requirements.
- Define the exact Cygwin packages to install for C++20 compilation and vtm runtime dependencies.
- Define the CMake-based build pipeline from the official vtm Git repository.
- Define the installation target inside Cygwin (`/usr/local/bin` or a user-local path such as `/opt/vtm/bin`).
- Define how the Cygwin-built vtm binary integrates with the existing Windows SSH setup and the `WezTerm → fish → Cygwin` workflow.
- Define validation criteria proving that `vtm --tui` followed by `vtm ssh` no longer creates an independent OS window.

## Capabilities

### New Capabilities

- `cygwin-build-environment`
  - Documents the current installed Cygwin version and layout, and enumerates the required packages (build tools + libraries) needed to compile vtm from source.
- `cygwin-vtm-compilation-pipeline`
  - Describes the source checkout, CMake configuration, build, install, and versioning steps for a Cygwin-native vtm binary.
- `cygwin-vtm-ssh-nesting`
  - Defines the end-to-end user workflow: launch Cygwin terminal (or WezTerm → Cygwin bash) → `vtm --tui` → open pane → `vtm ssh rock-5t vtm` → remote desktop renders inline without an extra window.

### Modified Capabilities

- None.

## Impact

- Adds a toolchain dependency (Cygwin build environment) to the Windows host.
- Produces a second vtm binary on the same machine (Windows-native exe remains at `D:\Ops\vtm\bin\vtm.exe`; Cygwin build will live inside the Cygwin filesystem).
- Enables a pure TUI nested workflow for remote vtm access, satisfying the original operator expectation that `v5t` should stay inside the current terminal surface.
- Keeps the existing Windows-native vtm path available as a fallback for native GUI rendering if desired.
- Keeps WezTerm as the host terminal and uses fish (already installed under Cygwin) as the interactive shell inside vtm panes, avoiding a terminal-switching migration.

---

## Post-Completion Addendum

After the Cygwin build was completed, several issues were identified:

### Discovered Issues

1. **Nested SSH mouse drag not working**: First layer vtm supports background drag, but after `vtm ssh` into Rock-5t, the nested vtm canvas drag stops working. This is a known vtm limitation in nested session mouse event forwarding (SGR protocol state loss across layers).

2. **Performance degradation**: Cygwin build is noticeably slower than native Windows build due to:
   - POSIX emulation overhead
   - Filesocket-based IPC (our Cygwin patch uses `~/.config/vtm/*.sock` instead of abstract namespace)
   - Fork-based daemonization

3. **GitHub Actions Windows Build**: Created automated build workflow to produce native Windows binaries as alternative.
   - See spec: `github-actions-windows-build`
   - Supports MSVC and MinGW builds
   - Can apply Cygwin patches optionally

### Current Recommendation

- **For daily use**: Use the GitHub Actions-built native Windows binary for better performance
- **For SSH nesting**: Continue using Cygwin build despite limitations, or wait for upstream vtm fixes
- **Both can coexist**: Configure fish aliases to switch between them
