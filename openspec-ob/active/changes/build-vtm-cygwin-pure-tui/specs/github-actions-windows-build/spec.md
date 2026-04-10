# GitHub Actions Windows Build Specification

## Purpose

Provide automated Windows builds of vtm using GitHub Actions, producing native Windows binaries that:
- Run without Cygwin dependency
- Support native GUI rendering (unlike Cygwin build)
- Can be used as alternative to Cygwin build for better performance
- Provide pre-built artifacts for easy distribution

## Requirements

### Build Targets

1. **MSVC Build** (Primary)
   - Visual Studio 2022 toolchain
   - Dynamic linking via vcpkg
   - Debug symbols (.pdb)
   - Optimized release build

2. **MinGW Build** (Secondary)
   - MSYS2 MinGW-w64
   - Static linking where possible
   - Portable executable

### Dependencies

- Freetype2
- HarfBuzz
- Lua 5.4+
- LunaSVG
- PlutoVG (dependency of LunaSVG)

## Workflow Design

### Triggers

```yaml
on:
  push:
    branches: [master, main]
    tags: ['v*']
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Release or Debug'
        default: 'Release'
      enable_cygwin_patches:
        description: 'Apply Cygwin patches'
        default: false
```

### Jobs

1. `build-windows-msvc`
   - Runner: `windows-2022`
   - Steps:
     - Checkout source
     - Setup MSVC environment
     - Setup vcpkg
     - Install dependencies
     - Configure CMake
     - Build
     - Upload artifact

2. `build-windows-mingw`
   - Runner: `windows-2022`
   - Steps:
     - Checkout source
     - Setup MSYS2
     - Install MinGW packages
     - Build in MSYS2 environment
     - Upload artifact

3. `release` (conditional)
   - Depends on both builds
   - Creates ZIP archives
   - Uploads to GitHub Release

## Usage

### Manual Build

1. Go to **Actions** tab
2. Select **Build Windows vtm**
3. Click **Run workflow**
4. Choose build type (Release/Debug)
5. Optionally enable Cygwin patches

### Automatic Build

- Push to `master` or `main`
- Push a tag starting with `v`

### Download Artifacts

Build artifacts are available:
- In Actions → Workflow run → Artifacts
- In Releases (for tagged builds)

## Integration with Current Setup

The Windows native build can coexist with Cygwin build:

```powershell
# Native Windows build (GUI mode)
C:\Users\Administrator\scoop\apps\vtm\current\vtm.exe

# Cygwin build (TUI mode)
/usr/local/bin/vtm
```

### fish alias for easy switching

```fish
# ~/.config/fish/config.fish

# Native Windows vtm (GUI, better performance)
alias vtm-win '/mnt/c/Users/Administrator/scoop/apps/vtm/current/vtm.exe'

# Cygwin vtm (TUI, better for SSH nesting)
alias vtm-cyg '/usr/local/bin/vtm'

# Default to Cygwin for SSH workflow
alias vtm '/usr/local/bin/vtm'
```

## Comparison: Native vs Cygwin

| Feature | Native Windows | Cygwin |
|---------|---------------|--------|
| Native GUI window | ✅ Yes | ❌ No (pure TUI) |
| SSH nesting | ⚠️ Works but may have mouse issues | ✅ Better for nested SSH |
| Performance | ✅ Faster | ⚠️ Slower (POSIX emulation) |
| WezTerm integration | ⚠️ Spawns separate window | ✅ Renders inline |
| Mouse in nested sessions | ⚠️ Known issues | ⚠️ Same issues |
| Dependency | None | Cygwin DLL |

## Success Criteria

- [x] Workflow runs successfully on push
- [x] MSVC artifact builds and runs on Windows Server 2022
- [x] MinGW artifact builds (optional)
- [x] Artifacts are downloadable from Actions
- [ ] Tested with `vtm --tui` and `vtm ssh` workflow

## References

- [vtm build documentation](https://github.com/directvt/vtm/blob/master/doc/build.md)
- [vcpkg documentation](https://vcpkg.io/en/docs/)
- [MSYS2 packages](https://packages.msys2.org/queue)
