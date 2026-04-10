#!/bin/bash
# Installation script for OpenSpec + GSD + Workflow
# Usage: curl -fsSL https://raw.githubusercontent.com/iMaxTomas/openspec-gsd-workflow/main/scripts/install.sh | bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_URL="https://github.com/iMaxTomas/openspec-gsd-workflow"
INSTALL_DIR="${HOME}/.openspec-gsd-workflow"
BIN_DIR="${HOME}/.local/bin"
VERSION="${1:-latest}"

echo -e "${BLUE}🚀 Installing OpenSpec + GSD + Workflow...${NC}"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required, found $(node --version)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is required but not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git $(git --version | cut -d' ' -f3)${NC}"

# Check Bash
if [ -z "${BASH_VERSION:-}" ]; then
    echo -e "${YELLOW}⚠️  Bash recommended for full functionality${NC}"
else
    echo -e "${GREEN}✅ Bash ${BASH_VERSION}${NC}"
fi

echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$BIN_DIR"
mkdir -p "${HOME}/gsd-workspaces"
echo -e "${GREEN}✅ Directories created${NC}"

# Download or clone
echo ""
echo "📥 Downloading..."

if [ "$VERSION" = "latest" ] || [ "$VERSION" = "main" ]; then
    # Clone repository
    if [ -d "$INSTALL_DIR/.git" ]; then
        echo "   Updating existing installation..."
        cd "$INSTALL_DIR"
        git pull origin main
    else
        echo "   Cloning repository..."
        git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
    fi
else
    # Download specific version
    echo "   Downloading version $VERSION..."
    curl -fsSL "$REPO_URL/releases/download/$VERSION/openspec-gsd-workflow-$VERSION.tar.gz" | tar -xz -C "$INSTALL_DIR"
fi

echo -e "${GREEN}✅ Downloaded${NC}"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
cd "$INSTALL_DIR"
if [ -f package.json ]; then
    npm install --production 2>/dev/null || echo -e "${YELLOW}⚠️  npm install skipped (optional)${NC}"
fi
echo -e "${GREEN}✅ Dependencies ready${NC}"

# Create symlinks
echo ""
echo "🔗 Creating command shortcuts..."

# Make scripts executable
chmod +x "$INSTALL_DIR/git-agent.sh"
chmod +x "$INSTALL_DIR/scripts"/*.sh 2>/dev/null || true

# Create wrapper scripts
for script in context-monitor planning-audit validation-gates gsd-pause-work gsd-resume-work worktree-doctor; do
    cat > "$BIN_DIR/gsd-$script" << EOF
#!/bin/bash
# Wrapper for gsd-$script
exec node "$INSTALL_DIR/.opencode/scripts/$script.mjs" "\$@"
EOF
    chmod +x "$BIN_DIR/gsd-$script"
done

# Git agent wrapper
cat > "$BIN_DIR/gsd-agent" << EOF
#!/bin/bash
# Wrapper for git-agent
exec "$INSTALL_DIR/git-agent.sh" "\$@"
EOF
chmod +x "$BIN_DIR/gsd-agent"

echo -e "${GREEN}✅ Commands installed${NC}"

# Add to PATH if needed
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo ""
    echo "⚠️  Please add the following to your shell profile:"
    echo "   export PATH=\"$BIN_DIR:\$PATH\""
    echo ""
    echo "   Or run this command now:"
    echo "   echo 'export PATH=\"$BIN_DIR:\$PATH\"' >> ~/.bashrc"
fi

# Setup complete
echo ""
echo -e "${GREEN}🎉 Installation complete!${NC}"
echo ""
echo "Available commands:"
echo "  gsd-context-monitor     - Monitor context usage"
echo "  gsd-planning-audit      - Audit change planning"
echo "  gsd-validation-gates    - Run validation gates"
echo "  gsd-pause-work          - Create checkpoint"
echo "  gsd-resume-work         - Resume from checkpoint"
echo "  gsd-worktree-doctor     - Check worktree health"
echo "  gsd-agent               - Git agent automation"
echo ""
echo "Quick start:"
echo "  gsd-context-monitor simulate"
echo ""
echo "Documentation:"
echo "  cat $INSTALL_DIR/README.md"
