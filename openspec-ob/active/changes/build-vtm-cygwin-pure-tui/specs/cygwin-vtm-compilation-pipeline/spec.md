## Capability: cygwin-vtm-compilation-pipeline

### Source Checkout

Clone the official vtm repository into a build directory inside the Cygwin filesystem:

```bash
mkdir -p ~/src && cd ~/src
git clone https://github.com/directvt/vtm.git
cd vtm
```

### CMake Configuration

Configure the build with a prefix that keeps the binary isolated from the Windows-native vtm:

```bash
cmake . -B bin -DCMAKE_INSTALL_PREFIX=/usr/local
```

If Cygwin’s `liblua` package naming causes CMake find-module issues, an explicit path or manual `LUA_INCLUDE_DIR` / `LUA_LIBRARY` hint may be required.

### Build and Install

```bash
cmake --build bin -j$(nproc)
sudo cmake --install bin
```

Without `sudo`, install to a user-local prefix instead:

```bash
cmake . -B bin -DCMAKE_INSTALL_PREFIX=$HOME/.local
cmake --build bin -j$(nproc)
cmake --install bin
```

### Output Artifact

The build produces a Cygwin ELF binary (e.g., `/usr/local/bin/vtm` or `$HOME/.local/bin/vtm`). Because it is linked against Cygwin DLLs and does not include the Win32 GUI backend, running it from a native Windows terminal (cmd/pwsh without Cygwin DLL in PATH) will likely fail. It must be invoked from within a Cygwin terminal or from a Windows terminal that prepends `C:\cygwin64\bin` to PATH and understands Cygwin pseudoterminals.

### Version Validation

After install, confirm:

```bash
vtm --version
```

Output must match the repository release tag (e.g., `v2026.04.09`) and must **not** contain any Windows-specific GUI initialization logs when run with `--tui`.

### Default Shell Integration

fish is already installed under Cygwin. vtm panes should spawn fish rather than bash to keep the entire interactive stack consistent (`WezTerm → fish → vtm --tui → fish pane`). Ensure fish is the login shell for the Administrator account, or configure vtm to spawn `/usr/bin/fish -l` in its terminal app settings.

### Coexistence with Windows-native vtm

The existing Windows-native binary remains at:
- `D:\Ops\vtm\bin\vtm.exe`

The Cygwin build must not overwrite or interfere with it. The recommended path is:
- `/usr/local/bin/vtm` (inside Cygwin)

A convenience launcher `vtc` can be added to the fish configuration (e.g., `~/.config/fish/functions/vtc.fish`) to start `vtm --tui` by default, keeping the two binaries semantically separated:

```fish
function vtc
    /usr/local/bin/vtm --tui $argv
end
```
