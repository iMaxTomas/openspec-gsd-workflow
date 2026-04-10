## Capability: cygwin-build-environment

### Current State

The Windows host 172.29.111.218 has Cygwin 3.6.5-1.x86_64 installed at `C:\cygwin64` (confirmed via HKLM registry and `uname -a`).

Core runtime binaries are present:
- `C:\cygwin64\bin\cygwin1.dll`
- `C:\cygwin64\bin\bash.exe`
- `C:\cygwin64\bin\uname.exe`

Build toolchain is **absent**:
- `cmake` — not found in `/usr/bin`
- `g++` (`gcc-g++`) — not found in `/usr/bin`
- `make` — not found in `/usr/bin`
- `git` — present (confirmed usable from Cygwin bash)

Environment hygiene issues observed:
- **Broken x-cmd startup**: `~/.bashrc` sources `$HOME/.x-cmd.root/X`, which references a missing `/c/Users/Administrator/.x-cmd.root/v/latest/X`. This causes a startup error on every bash invocation and can interfere with non-interactive scripts.
- **Incomplete `.ssh` bridging**: `/home/Administrator/.ssh/` exists but only contains symlinks for `id_rsa_new`; `config`, `id_ed25519`, and `id_ed25519.pub` are missing from the Cygwin view.
- **Windows firewall fully disabled** on Domain, Private, and Public profiles. This is accepted as-is for this build effort.
- Port 2222 is occupied by an unknown `svchost.exe` service; this does not conflict with Cygwin but is noted for awareness.

### Required Packages

To build vtm from source, the following Cygwin packages must be installed:

| Package | Purpose |
|---------|---------|
| `cmake` | Build system generator (minimum v3.22) |
| `gcc-g++` | C++20 compiler (GCC 12+ preferred) |
| `make` | Build driver |
| `libfreetype-devel` | Font rasterization headers/libs |
| `libharfbuzz-devel` | Text shaping headers/libs |
| `liblua5.4-devel` | Scripting engine headers/libs (v5.4+) |
| `git` | Source checkout (already present) |

> Note: Exact package names may vary slightly in the Cygwin package repository (e.g., `libharfbuzz-devel` vs `libharfbuzz0-devel`). The implementation task must resolve the correct Cygwin package names during `setup-x86_64.exe` invocation.

### Pre-Build Hygiene Fixes

Before installing packages or compiling, fix the following environment issues:

1. **Disable the broken x-cmd loader** in `~/.bashrc`:
   ```bash
   sed -i 's/\[ ! -f "$HOME\/.x-cmd.root\/X" \] || . "$HOME\/.x-cmd.root\/X"/# x-cmd disabled/' ~/.bashrc
   ```
2. **Fix Windows console encoding** so that Chinese output and build logs render correctly over SSH instead of producing GBK/UTF-8 mismatch garbled text:
   ```cmd
   REG ADD "HKCU\Software\Microsoft\Command Processor" /v Autorun /t REG_SZ /d "chcp 65001 >nul" /f
   ```
   Optional: also configure PowerShell to default to UTF-8 by adding the following to the PowerShell profile (`$PROFILE`):
   ```powershell
   [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
   $OutputEncoding = [System.Text.Encoding]::UTF8
   ```
3. **Bridge SSH files into Cygwin** so that only one source of truth (Windows `C:\Users\Administrator\.ssh\`) needs maintenance:
   ```bash
   ln -sf /cygdrive/c/Users/Administrator/.ssh/config /home/Administrator/.ssh/config
   ln -sf /cygdrive/c/Users/Administrator/.ssh/id_ed25519 /home/Administrator/.ssh/id_ed25519
   ln -sf /cygdrive/c/Users/Administrator/.ssh/id_ed25519.pub /home/Administrator/.ssh/id_ed25519.pub
   chmod 600 /home/Administrator/.ssh/id_ed25519
   ```
4. **Tighten Windows-side private-key ACL** so OpenSSH does not reject the key:
   ```powershell
   icacls "C:\Users\Administrator\.ssh\id_ed25519" /inheritance:r
   icacls "C:\Users\Administrator\.ssh\id_ed25519" /grant:r "Administrator:(M)"
   ```

### Installation Method

Because the Cygwin GUI setup executable is not currently present on the host, the implementation must either:
1. Download the latest `setup-x86_64.exe` from cygwin.com and run it in unattended mode:
   ```cmd
   setup-x86_64.exe -q -P cmake,gcc-g++,make,libfreetype-devel,libharfbuzz-devel,liblua5.4-devel
   ```
2. Or retrieve an existing `setup-x86_64.exe` from Downloads if it exists elsewhere.

### Success Criteria

- `cygcheck -c` lists all required packages with status `OK`.
- `cmake --version`, `g++ --version`, and `make --version` all return successful version output from a Cygwin bash shell.
