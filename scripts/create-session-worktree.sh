#!/bin/bash
# Create Session Worktree for Context Reset
# Automatically triggered when context limit is reached

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Arguments
PROJECT_NAME="${1:-}"
CHANGE_ID="${2:-}"
PARENT_WORKTREE="${3:-$(pwd)}"

if [ -z "$PROJECT_NAME" ] || [ -z "$CHANGE_ID" ]; then
    echo -e "${RED}❌ Error: Missing required arguments${NC}"
    echo "Usage: $0 <project-name> <change-id> [parent-worktree-path]"
    echo ""
    echo "Example:"
    echo "  $0 my-project change-001 /home/user/project"
    exit 1
fi

# Configuration
WORKSPACE_ROOT="${HOME}/gsd-workspaces/${PROJECT_NAME}"
TIMESTAMP=$(date +%s)
SESSION_ID="${CHANGE_ID}-session-${TIMESTAMP}"
SESSION_PATH="${WORKSPACE_ROOT}/${SESSION_ID}"
PARENT_NAME=$(basename "$PARENT_WORKTREE")

echo -e "${BLUE}🔄 Creating session worktree...${NC}"
echo "   Project: $PROJECT_NAME"
echo "   Change: $CHANGE_ID"
echo "   Parent: $PARENT_WORKTREE"
echo "   New Session: $SESSION_ID"
echo ""

# 1. Validate parent worktree
if [ ! -d "$PARENT_WORKTREE/.git" ] && [ ! -f "$PARENT_WORKTREE/.git" ]; then
    echo -e "${RED}❌ Error: Parent is not a git worktree${NC}"
    exit 1
fi

# 2. Create worktree directory
mkdir -p "$WORKSPACE_ROOT"

# 3. Create new worktree from parent
echo -e "${BLUE}📁 Creating git worktree...${NC}"
cd "$PARENT_WORKTREE"
git worktree add "$SESSION_PATH" -b "$SESSION_ID"

# 4. Copy GSD state
echo -e "${BLUE}📋 Copying GSD state...${NC}"
if [ -d "$PARENT_WORKTREE/.gsd" ]; then
    cp -r "$PARENT_WORKTREE/.gsd" "$SESSION_PATH/"
fi

# 5. Copy OpenCode passive state
echo -e "${BLUE}📝 Copying checkpoint...${NC}"
mkdir -p "$SESSION_PATH/.opencode/passive"

if [ -f "$PARENT_WORKTREE/.opencode/passive/checkpoint.md" ]; then
    cp "$PARENT_WORKTREE/.opencode/passive/checkpoint.md" \
       "$SESSION_PATH/.opencode/passive/checkpoint.md"
fi

if [ -f "$PARENT_WORKTREE/.opencode/passive/state-log.md" ]; then
    cp "$PARENT_WORKTREE/.opencode/passive/state-log.md" \
       "$SESSION_PATH/.opencode/passive/state-log.md"
fi

# 6. Create handoff document
echo -e "${BLUE}📝 Creating handoff document...${NC}"
cat > "$SESSION_PATH/.opencode/passive/handoff-${PARENT_NAME}.md" << EOF
# Session Handoff

## Transfer Info
- **From**: ${PARENT_NAME}
- **To**: ${SESSION_ID}
- **Timestamp**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
- **Reason**: Context limit reached (15 messages)

## Parent Session Status
- **Messages**: 15
- **Status**: Paused
- **Resume File**: .continue-here.md

## How to Resume
1. Switch to this worktree:
   \`\`\`bash
   cd ${SESSION_PATH}
   \`\`\`

2. Run resume command:
   \`\`\`
   /gsd-resume-work
   \`\`\`

3. Or manually read the checkpoint:
   \`\`\`
   cat .opencode/passive/checkpoint.md
   \`\`\`

## Notes
- This worktree was automatically created when context limit was reached
- All state has been preserved
- You can safely continue working here
EOF

# 7. Create .continue-here.md for GSD resume
echo -e "${BLUE}🎯 Creating continue-here...${NC}"
cat > "$SESSION_PATH/.continue-here.md" << EOF
# Continue Here

## Session Info
- **Change**: ${CHANGE_ID}
- **Session**: ${SESSION_ID}
- **Resumed From**: ${PARENT_NAME}
- **Created**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Status
Session automatically created due to context limit.
Please review handoff-${PARENT_NAME}.md for details.

## Quick Start
\`\`\`bash
cd ${SESSION_PATH}
/gsd-resume-work
\`\`\`
EOF

# 8. Link openspec-ob (if exists in parent)
if [ -d "$PARENT_WORKTREE/openspec-ob" ]; then
    echo -e "${BLUE}🔗 Linking openspec-ob...${NC}"
    rm -rf "$SESSION_PATH/openspec-ob"
    ln -s "$PARENT_WORKTREE/openspec-ob" "$SESSION_PATH/openspec-ob"
fi

# 9. Update manifest
echo -e "${BLUE}📊 Updating manifest...${NC}"
MANIFEST_FILE="$WORKSPACE_ROOT/../manifests/${PROJECT_NAME}-manifest.yaml"
mkdir -p "$(dirname "$MANIFEST_FILE")"

# Simple manifest update (append mode)
cat >> "$MANIFEST_FILE" 2>/dev/null << EOF || true
worktree:
  id: ${SESSION_ID}
  change: ${CHANGE_ID}
  path: ${SESSION_PATH}
  parent: ${PARENT_NAME}
  created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
  status: active
---
EOF

# 10. Success message
echo ""
echo -e "${GREEN}✅ Session worktree created successfully!${NC}"
echo ""
echo -e "${BLUE}📍 Location:${NC}"
echo "   $SESSION_PATH"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "   1. Switch to the new worktree:"
echo "      cd $SESSION_PATH"
echo ""
echo "   2. Resume work:"
echo "      /gsd-resume-work"
echo ""
echo "   3. Or read the handoff:"
echo "      cat .opencode/passive/handoff-${PARENT_NAME}.md"
echo ""
echo -e "${YELLOW}💡 Tip: The parent worktree is preserved.${NC}"
echo "   You can return to it anytime with:"
echo "   cd $PARENT_WORKTREE"
echo ""

# Output machine-readable info for automation
echo "WORKTREE_PATH=$SESSION_PATH"
echo "SESSION_ID=$SESSION_ID"
echo "CHANGE_ID=$CHANGE_ID"
