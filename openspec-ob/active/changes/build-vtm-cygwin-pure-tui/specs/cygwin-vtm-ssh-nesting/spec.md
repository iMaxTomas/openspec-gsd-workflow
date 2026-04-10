## Capability: cygwin-vtm-ssh-nesting

### Problem Statement

With the Windows-native `vtm.exe`, the following chain is impossible inside a single terminal window:

```
WezTerm → vtm --tui → fish → vtm ssh rock-5t vtm
```

The `vtm ssh` step forces a separate Win32 GUI window because the DirectVT Gateway on Windows expects a native GUI surface.

### Solution via Cygwin Build

A vtm binary compiled under Cygwin has **no Win32 GUI code**. Both `vtm --tui` and the underlying `vtm ssh` (which spawns a `dtty` gateway) can only emit VT escape sequences. Therefore, the entire chain remains inside the current terminal pane.

### Target Workflow

1. Open **WezTerm** configured to launch the Cygwin shell (`C:\cygwin64\bin\fish.exe -l`).
2. Launch local vtm desktop in pure TUI mode (via the `vtc` convenience function):
   ```fish
   vtc
   ```
3. Inside the local vtm desktop, open a terminal pane (default shell is **fish** under Cygwin).
4. Run the remote connect command:
   ```fish
   vtm ssh imax@rock-5t vtm
   ```
5. The remote vtm desktop renders **inline** as a logical window/pane inside the local vtm TUI. No independent OS window appears.

### SSH Key and Config Bridging

The Windows host already has:
- `C:\Users\Administrator\.ssh\config` with a `Host rock-5t` entry
- `C:\Users\Administrator\.ssh\id_ed25519`

Cygwin’s OpenSSH expects these under `/home/Administrator/.ssh/`. Rather than maintaining two separate `.ssh` directories (Windows native + Cygwin), the implementation should **symlink the individual files** from the Windows side into the Cygwin side so there is a single source of truth:

```bash
ln -sf /cygdrive/c/Users/Administrator/.ssh/config /home/Administrator/.ssh/config
ln -sf /cygdrive/c/Users/Administrator/.ssh/id_ed25519 /home/Administrator/.ssh/id_ed25519
ln -sf /cygdrive/c/Users/Administrator/.ssh/id_ed25519.pub /home/Administrator/.ssh/id_ed25519.pub
chmod 600 /home/Administrator/.ssh/id_ed25519
```

> Note: `known_hosts` under Cygwin already exists and currently contains a different host key algorithm entry for `rock-5t` than the Windows copy. It is acceptable to leave the Cygwin `known_hosts` as-is because OpenSSH will append new keys as needed.

Both Windows native OpenSSH (`C:\Windows\System32\OpenSSH\ssh.exe`) and Cygwin OpenSSH (`/usr/bin/ssh`) will remain installed. Only the Cygwin `.ssh/` directory needs to point back to Windows files; there is no requirement to independently maintain a second copy of the SSH configuration.

### Validation Criteria

1. `vtm --tui` from Cygwin launches without `gui: Set window to normal state` or any Win32 font enumeration logs.
2. `vtm ssh imax@rock-5t vtm` from inside Cygwin `vtm --tui` completes connection without spawning a new OS window.
3. The remote desktop is operable: `Alt+Shift+|` splits panes, `Ctrl+Tab` switches windows, `Shift+F7` disconnects back to the local desktop.
4. Disconnecting the remote session returns control cleanly to the local `vtm --tui` instance.

### Fallback and Coexistence

If the operator ever wants the native GUI window behavior (e.g., for better mouse drag resizing), the Windows-native binary at `D:\Ops\vtm\bin\vtm.exe` remains available. The two binaries serve different purposes:

| Binary | Use case |
|--------|----------|
| `D:\Ops\vtm\bin\vtm.exe` | Standalone native GUI on Windows; fastest local rendering |
| Cygwin `/usr/local/bin/vtm` | Full TUI nesting including remote `vtm ssh` inside a single terminal |
