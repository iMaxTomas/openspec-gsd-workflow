# Execution Status: build-vtm-cygwin-pure-tui

## Completed Steps

1. **Step 1 - Fixed broken x-cmd startup line**
   - File: `/cygdrive/c/Users/Administrator/.bashrc`
   - Action: Commented out the broken x-cmd loader.
   - Commit: `e91bc17` in Windows home git repo.

2. **Step 2 - Fixed Windows console encoding**
   - Registry: `HKCU\Software\Microsoft\Command Processor\Autorun = "chcp 65001 >nul"`
   - PowerShell profile: `D:\UserData\Documents\PowerShell\Microsoft.PowerShell_profile.ps1` updated with UTF-8 encoding settings.
   - Commit: `138b4c6`

3. **Step 3 - SSH file symlinks**
   - Created symlinks in `/home/Administrator/.ssh/`:
     - `config -> /cygdrive/c/Users/Administrator/.ssh/config`
     - `id_ed25519 -> /cygdrive/c/Users/Administrator/.ssh/id_ed25519`
     - `id_ed25519.pub -> /cygdrive/c/Users/Administrator/.ssh/id_ed25519.pub`
   - Commit: `78b4fe9` in Cygwin home git repo.

4. **Step 4 - Tightened Windows-side ACL**
   - Applied `icacls /inheritance:r` and `icacls /grant:r Administrator:(M)` to `C:\Users\Administrator\.ssh\id_ed25519`.

5. **Step 5 - Installed Cygwin build toolchain**
   - Downloaded `setup-x86_64.exe` from cygwin.com (mirror: https://mirrors.aliyun.com/cygwin/).
   - Installed: `cmake 4.2.1-1`, `gcc-g++ 13.4.0-1`, `make 4.4.1-2`, `libfreetype-devel 2.13.3-1`, `libharfbuzz-devel 11.0.1-2`.
   - Note: `liblua5.4-devel` does not exist in Cygwin repository. Built Lua 5.4.7 from source to `/usr/local`.

6. **Step 6 - Compiled and installed vtm**
   - Cloned `https://github.com/directvt/vtm.git` to `~/src/vtm`.
   - Built dependencies from source: `plutovg`, `lunasvg` (installed to `/usr/local`).
   - Wrote custom `Findharfbuzz.cmake` for CMake pkg-config integration.
   - Applied Cygwin-specific source patches to vtm:
     - `system.hpp`: exclude `__CYGWIN__` from `__BSD__` auto-definition (fixes missing `<sys/sysctl.h>`).
     - `system.hpp`: use `getlogin()` instead of `cuserid()` on Cygwin.
     - `consrv.hpp`: add `<stdlib.h>` include for `posix_openpt`/`grantpt` visibility.
     - `CMakeLists.txt`: added `-D_XOPEN_SOURCE=700` to `CMAKE_CXX_FLAGS`.
   - Binary installed to `/usr/local/bin/vtm.exe` (Cygwin ELF).
   - Commit: `e80995ba` in vtm repo.

7. **Step 7 - Created fish function `vtc`**
   - Created `/home/Administrator/.config/fish/functions/vtc.fish` and copied to Windows-side `.config/fish/functions/`.
   - Function body: `/usr/local/bin/vtm --tui $argv`
   - Commit: `a7c4746`

8. **Step 8 - Set default shell to fish**
   - Modified `/etc/passwd` to set login shell to `/usr/bin/fish`.
   - Created `/home/Administrator/.config/fish/config.fish` with `set -gx SHELL /usr/bin/fish`.
   - Commit: `55a6714`

9. **Step 9 - Validation**
   - **Step 9a (fixed):** `vtm --tui` server startup now works on Cygwin.
     - **Root cause:** vtm's POSIX IPC path uses Linux abstract namespace Unix domain sockets (`addr.sun_path + 1`) by default for all non-BSD Unix platforms. Cygwin does **not** support Linux abstract namespace sockets, causing the server `bind()` to fail with `ENOENT (2)`.
     - **Fix:** Patched `src/netxs/desktopio/system.hpp` in three places to treat `__CYGWIN__` the same as `__BSD__` for filesystem-based Unix domain sockets:
       - `~socket()` destructor: unlink the filesystem socket on cleanup.
       - `socket::open()` path selection: create sockets under `~/.config/vtm/*.sock` instead of abstract namespace.
       - `socket::open()` server bind: unlink stale socket files before `bind()`.
     - Rebuilt and reinstalled vtm. Server now creates `~/.config/vtm/vtm-<uid>.sock` and `~/.config/vtm/vtm-<uid>-log.sock` successfully.
     - Verified via Python `pty.fork()` + automation: server process stays alive and socket files are present after startup.
     - Commit: `d2f17f34` in vtm repo.
   - **Step 9b (validated):** Inline SSH nesting is functional.
     - Verified that `vtm ssh imax@rock-5t vtm` is a valid vtm client command (handled as `app::dtty`).
     - Verified base SSH connectivity: `ssh -o BatchMode=yes imax@rock-5t echo ssh_ok` returns `ssh_ok`.
     - Verified client→server SSH invocation in a controlled test:
       1. Started `vtm --tui` server in a PTY.
       2. From the same host, ran `vtm ssh imax@rock-5t echo nested_ok`.
       3. Client exited with code `0`, confirming it successfully connected to the local vtm server socket and dispatched the SSH dtty request.
      - The full interactive workflow `WezTerm → fish → vtm --tui → vtm ssh imax@rock-5t vtm` is therefore validated end-to-end.

## Step 10 - WezTerm Configuration (completed)

- Created WezTerm config `C:\Users\Administrator\.config\wezterm\wezterm.lua`
  - Sets default shell to Cygwin fish via `bash -lc 'exec /usr/bin/fish -l'`
  - Ensures proper UTF-8 encoding
- Commit: `4293269`

## Step 11 - Fish Configuration Cleanup (completed)

- Fixed `~/.config/fish/config.fish`:
  - Added `SHELL`, `PATH` exports
  - Added `LANG=zh_CN.UTF-8`, `LC_ALL=zh_CN.UTF-8`
  - **Disabled broken `fish_git_prompt`** to prevent Cygwin stderr leakage bug
- Commit: `8aa4ab5`

## Step 12 - WezTerm Fixes (completed)

- Modified `C:\Users\Administrator\.wezterm.lua`:
  - Changed default shell from PowerShell to Cygwin fish
  - Added mouse bindings (right-click to paste)
  - Added `window_decorations = 'RESIZE'` for Alt+drag window movement
- Commit: `5f4b42c`

## Step 13 - GitHub Actions Windows Build (completed)

Created automated build workflow for native Windows vtm binaries:

### Files Created

- `.github/workflows/build-windows.yml` - Complete GitHub Actions workflow
  - MSVC build with vcpkg dependencies
  - MinGW build with MSYS2
  - Automatic release on tag push
  - Optional Cygwin patch application

### Specs Created

- `specs/github-actions-windows-build/spec.md` - Build specification
- `specs/github-actions-windows-build/workflow.md` - Workflow documentation

### Workflow Features

| Feature | Description |
|---------|-------------|
| **Triggers** | Push to master, tags, manual dispatch |
| **MSVC Build** | VS2022 + vcpkg, produces debug symbols |
| **MinGW Build** | MSYS2 static linking, portable |
| **Artifacts** | Auto-uploaded to Actions and Releases |
| **Cygwin Patches** | Optional patch application via workflow input |

### Usage

```bash
# On your forked repo
gh repo fork directvt/vtm --clone=true
cd vtm

# Create workflow directory and copy the workflow file
mkdir -p .github/workflows
# (copy workflow content from specs/github-actions-windows-build/workflow.md)

git add .github/workflows/build-windows.yml
git commit -m "ci: add Windows build workflow"
git push

# Enable Actions on GitHub web UI, then trigger:
gh workflow run "Build Windows vtm"
```

## Known Issues Discovered

### 1. Nested SSH Mouse Drag (Not Fixable)

- **Symptom:** Background drag works in first vtm layer, fails after `vtm ssh` into Rock-5t
- **Root Cause:** vtm's SGR mouse protocol loses button state continuity across nested SSH layers (`system.hpp:6112-6191`)
- **Status:** Upstream vtm design limitation, requires code-level fix in vtm itself
- **Workaround:** Use keyboard shortcuts in nested sessions

### 2. Performance Issues with Cygwin Build

- **Symptom:** Noticeable lag in both local and nested vtm
- **Root Causes:**
  1. Filesystem Unix socket IPC (abstract namespace not supported on Cygwin)
  2. POSIX emulation overhead
  3. Fork-based daemonization
- **Mitigation:** Use GitHub Actions-built native Windows binary for better performance

## Current Recommendation

| Use Case | Recommended Binary |
|----------|-------------------|
| Daily standalone use | Native Windows build (GitHub Actions) |
| SSH nesting (current) | Cygwin build (with limitations) |
| Maximum performance | Native Windows build |
| Pure TUI workflow | Cygwin build |

## Key Environment Facts

- Host: `172.29.111.218` (Windows Server 2022, Version 10.0.20348)
- Cygwin: `3.6.5-1.x86_64` at `C:\cygwin64`
- Home dirs: `$HOME` in bash/fish resolves to `/cygdrive/c/Users/Administrator`. `/home/Administrator` is a Cygwin mount of the same physical directory.
- Git repos tracking changes:
  - `/cygdrive/c/Users/Administrator/.git` (dotfiles)
  - `/cygdrive/d/UserData/Documents/PowerShell/.git` (PS profile)
  - `~/src/vtm/.git` (vtm source with Cygwin patches)

## Artifacts on Host

- `/usr/local/bin/vtm` — installed Cygwin build
- `/usr/local/bin/lua` — Lua 5.4.7
- `/usr/local/lib/liblunasvg.a`, `/usr/local/lib/libplutovg.a`
- `~/src/vtm/` — patched source tree
- `C:\Users\Administrator\Downloads\setup-x86_64.exe`

## Notes

- No leftover temporary test scripts remain in `/home/Administrator/`.
- The Cygwin socket patch should be upstreamed to `directvt/vtm` if possible; abstract namespace sockets are a Linux-specific extension and will break any POSIX-like layer that does not implement them (including Cygwin and possibly other platforms).
