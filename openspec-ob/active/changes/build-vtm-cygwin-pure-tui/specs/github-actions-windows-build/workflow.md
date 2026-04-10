# GitHub Actions Windows Build Workflow

## Workflow Location

Create file: `.github/workflows/build-windows.yml`

## Full Workflow Content

```yaml
name: Build Windows vtm

on:
  push:
    branches: [ master, main ]
    tags: [ 'v*' ]
  pull_request:
    branches: [ master, main ]
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build type'
        required: true
        default: 'Release'
        type: choice
        options:
          - Release
          - Debug
      enable_cygwin_patches:
        description: 'Apply Cygwin compatibility patches'
        required: false
        default: false
        type: boolean

env:
  VCPKG_BINARY_SOURCES: "clear;x-gha,readwrite"

jobs:
  build-windows-msvc:
    runs-on: windows-2022
    name: Build Windows (MSVC)
    
    steps:
    - name: Checkout vtm source
      uses: actions/checkout@v4
      with:
        repository: directvt/vtm
        ref: master
        
    - name: Setup MSVC
      uses: ilammy/msvc-dev-cmd@v1
      
    - name: Setup vcpkg
      uses: lukka/run-vcpkg@v11
      with:
        vcpkgGitCommitId: 'a1a1cbc975abf909a6c8985a6a2b8fe20bbd9bd6'
        
    - name: Install dependencies via vcpkg
      run: |
        vcpkg install freetype:x64-windows
        vcpkg install harfbuzz:x64-windows
        vcpkg install lua:x64-windows
        vcpkg install lunasvg:x64-windows
        
    - name: Apply Cygwin patches (if enabled)
      if: inputs.enable_cygwin_patches
      shell: bash
      run: |
        echo "Applying Cygwin compatibility patches..."
        # Patch 1: Fix socket implementation for filesystem sockets
        sed -i 's/#if defined(__BSD__)/#if defined(__BSD__) || defined(__CYGWIN__)/g' src/netxs/desktopio/system.hpp
        # Patch 2: Use getlogin instead of cuserid on Cygwin
        sed -i 's/cuserid(getlogin)/getlogin()/g' src/netxs/desktopio/system.hpp || true
        # Patch 3: Add stdlib include for posix_openpt
        sed -i '1s/^/#include <stdlib.h>\n/' src/netxs/desktopio/consrv.hpp || true
        
    - name: Configure CMake
      run: |
        cmake -B build -S . `
          -DCMAKE_BUILD_TYPE=${{ inputs.build_type || 'Release' }} `
          -DCMAKE_TOOLCHAIN_FILE="${env:VCPKG_ROOT}/scripts/buildsystems/vcpkg.cmake" `
          -DVCPKG_TARGET_TRIPLET=x64-windows `
          -DCMAKE_CXX_FLAGS="/O2 /MT /DWIN32_LEAN_AND_MEAN" `
          -DCMAKE_EXE_LINKER_FLAGS="/SUBSYSTEM:WINDOWS /ENTRY:wWinMainCRTStartup"
          
    - name: Build
      run: cmake --build build --config ${{ inputs.build_type || 'Release' }} --parallel
      
    - name: Prepare artifact
      run: |
        mkdir -p artifact
        cp build/${{ inputs.build_type || 'Release' }}/vtm.exe artifact/
        cp build/${{ inputs.build_type || 'Release' }}/vtm.pdb artifact/ 2>/dev/null || true
        
    - name: Upload artifact
      uses: actions/upload-artifact@v4
      with:
        name: vtm-windows-msvc-x64
        path: artifact/*
        retention-days: 30

  build-windows-mingw:
    runs-on: windows-2022
    name: Build Windows (MinGW)
    
    steps:
    - name: Checkout vtm source
      uses: actions/checkout@v4
      with:
        repository: directvt/vtm
        ref: master
        
    - name: Setup MSYS2
      uses: msys2/setup-msys2@v2
      with:
        msystem: MINGW64
        update: true
        install: >-
          mingw-w64-x86_64-gcc
          mingw-w64-x86_64-cmake
          mingw-w64-x86_64-freetype
          mingw-w64-x86_64-harfbuzz
          mingw-w64-x86_64-lua
          mingw-w64-x86_64-lunasvg
          mingw-w64-x86_64-plutovg
          make
          
    - name: Build in MSYS2
      shell: msys2 {0}
      run: |
        mkdir -p build && cd build
        cmake .. \
          -DCMAKE_BUILD_TYPE=Release \
          -DCMAKE_C_COMPILER=gcc \
          -DCMAKE_CXX_COMPILER=g++ \
          -DCMAKE_CXX_FLAGS="-O2 -static-libgcc -static-libstdc++" \
          -DFREETYPE_INCLUDE_DIRS=/mingw64/include/freetype2 \
          -DFREETYPE_LIBRARY=/mingw64/lib/libfreetype.a
        make -j$(nproc)
        
    - name: Upload artifact
      uses: actions/upload-artifact@v4
      with:
        name: vtm-windows-mingw-x64
        path: build/vtm.exe
        retention-days: 30

  release:
    needs: [build-windows-msvc, build-windows-mingw]
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/')
    
    steps:
    - name: Download MSVC artifact
      uses: actions/download-artifact@v4
      with:
        name: vtm-windows-msvc-x64
        path: msvc/
        
    - name: Download MinGW artifact
      uses: actions/download-artifact@v4
      with:
        name: vtm-windows-mingw-x64
        path: mingw/
        
    - name: Create Release Archives
      run: |
        mkdir -p release
        cd msvc && zip -r ../release/vtm-windows-msvc-x64.zip vtm.exe vtm.pdb 2>/dev/null || zip -r ../release/vtm-windows-msvc-x64.zip vtm.exe
        cd ../mingw && zip -r ../release/vtm-windows-mingw-x64.zip vtm.exe
        cd ..
        
    - name: Upload to Release
      uses: softprops/action-gh-release@v1
      with:
        files: release/*.zip
        draft: false
        prerelease: false
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Setup Instructions

1. **Fork the repository:**
   ```bash
   gh repo fork directvt/vtm --clone=false
   ```

2. **Enable GitHub Actions:**
   - Go to your forked repo on GitHub
   - Click **Actions** tab
   - Click **I understand my workflows, go ahead and enable them**

3. **Create the workflow file:**
   ```bash
   cd your-forked-vtm-repo
   mkdir -p .github/workflows
   cat > .github/workflows/build-windows.yml << 'EOF'
   # Paste the workflow content above
   EOF
   git add .github/workflows/build-windows.yml
   git commit -m "ci: add Windows build workflow"
   git push
   ```

4. **Trigger a build:**
   - Push to master, or
   - Go to Actions tab → Build Windows vtm → Run workflow

## Build Outputs

| Artifact | Description |
|----------|-------------|
| `vtm-windows-msvc-x64` | MSVC build with debug symbols |
| `vtm-windows-mingw-x64` | MinGW static build |
| Release ZIP | Automatically created on tag push |

## Notes

- MSVC build links dynamically with vcpkg libraries
- MinGW build attempts static linking for portability
- Cygwin patches can be applied via workflow dispatch option
