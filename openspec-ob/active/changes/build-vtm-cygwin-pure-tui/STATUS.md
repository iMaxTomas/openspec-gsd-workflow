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
