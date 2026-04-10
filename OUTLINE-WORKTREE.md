# Worktree 详细大纲

## 1. 核心概念

### 1.1 Git Worktree
- **定义**: 同一个 Git 仓库的多个工作目录
- **特点**: 共享 `.git`，独立工作区
- **优势**: 轻量、快速切换、并行开发

### 1.2 Workspace 类型
1. **Main**: 主仓库，规范定义，不直接开发
2. **Change**: 每个 change 一个，隔离上下文
3. **Session**: 上下文满时创建，恢复检查点

### 1.3 状态隔离与共享
- **共享**: Git 历史、远程配置、规范定义
- **独立**: 工作区文件、运行时状态、GSD 配置

---

## 2. 目录结构设计

### 2.1 全局结构
```
~/gsd-workspaces/                    # GSD 工作区根
│
├── manifests/
│   └── {project}-manifest.yaml      # 项目级清单
│
└── {project}/                       # 项目目录
    ├── main/                        # 主 worktree（符号链接到原仓库）
    │
    ├── change-{id}/                 # Change worktree
    │   ├── .git                     # 共享（指向主仓库 .git）
    │   ├── openspec-ob/             # 符号链接或绑定挂载
    │   ├── src/                     # 代码工作区
    │   ├── .gsd/                    # GSD 状态（独立）
    │   └── .opencode/               # OpenCode 状态（独立）
    │       └── passive/
    │           ├── checkpoint.md
    │           ├── state-log.md
    │           └── handoff.md
    │
    └── change-{id}-session-{n}/     # Session worktree
        ├── .git
        ├── openspec-ob/             # 符号链接
        ├── src/                     # 符号链接（保持代码一致）
        ├── .gsd/                    # 继承自父 worktree
        └── .opencode/
            └── passive/
                ├── checkpoint.md    # 复制自父 worktree
                ├── handoff-from-{parent}.md
                └── state-log.md     # 新的日志
```

### 2.2 Worktree Manifest
```yaml
# manifests/{project}-manifest.yaml

project: "my-project"
main_repo: "~/project"
main_worktree: "~/project"

current_change: "change-001"
current_session: "change-001-session-2"

worktrees:
  change-001:
    type: "change"
    path: "~/gsd-workspaces/my-project/change-001"
    branch: "workspace/change-001"
    parent: "main"
    status: "paused"
    sessions:
      - id: "session-1"
        path: "~/gsd-workspaces/my-project/change-001"
        status: "paused"
        messages: 15
        checkpoint: ".opencode/passive/checkpoint.md"
        
      - id: "session-2"
        path: "~/gsd-workspaces/my-project/change-001-session-2"
        status: "active"
        messages: 3
        checkpoint: ".opencode/passive/checkpoint.md"
        resumed_from: "session-1"
    
  change-002:
    type: "change"
    path: "~/gsd-workspaces/my-project/change-002"
    branch: "workspace/change-002"
    parent: "main"
    status: "active"
    sessions:
      - id: "session-1"
        path: "~/gsd-workspaces/my-project/change-002"
        status: "active"
        messages: 5

orphaned_worktrees:
  - path: "~/gsd-workspaces/my-project/change-001-session-1"
    reason: "session-2 created, session-1 no longer needed"
    cleanup_after: "2026-04-18"
```

---

## 3. 核心操作

### 3.1 创建 Change Worktree
```bash
#!/bin/bash
# scripts/create-change-worktree.sh

PROJECT_NAME="$1"
CHANGE_ID="$2"
MAIN_REPO="$3"

WORKTREE_ROOT="$HOME/gsd-workspaces/$PROJECT_NAME"
CHANGE_PATH="$WORKTREE_ROOT/$CHANGE_ID"
BRANCH_NAME="workspace/$CHANGE_ID"

echo "Creating change worktree: $CHANGE_ID"

# 1. 创建 worktree
cd "$MAIN_REPO"
git worktree add "$CHANGE_PATH" -b "$BRANCH_NAME"

# 2. 设置符号链接（openspec-ob/）
ln -s "$MAIN_REPO/openspec-ob" "$CHANGE_PATH/openspec-ob"

# 3. 初始化 .gsd/
mkdir -p "$CHANGE_PATH/.gsd/phases/$CHANGE_ID"

# 4. 初始化 .opencode/passive/
mkdir -p "$CHANGE_PATH/.opencode/passive"
cat > "$CHANGE_PATH/.opencode/passive/checkpoint.md" << 'EOF'
# checkpoint
- timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- current_boundary: "change initialization"
- active_owner: front-door-owner
- active_or_last_lane: none
- current_status: "initialized"
- open_questions:
  - none
EOF

# 5. 更新 manifest
# ... (调用 node 脚本更新 yaml)

echo "Change worktree created at: $CHANGE_PATH"
echo "Branch: $BRANCH_NAME"
```

### 3.2 创建 Session Worktree
```bash
#!/bin/bash
# scripts/create-session-worktree.sh

PROJECT_NAME="$1"
CHANGE_ID="$2"
PARENT_SESSION="$3"

WORKTREE_ROOT="$HOME/gsd-workspaces/$PROJECT_NAME"
PARENT_PATH="$WORKTREE_ROOT/$CHANGE_ID"
TIMESTAMP=$(date +%s)
SESSION_ID="${CHANGE_ID}-session-${TIMESTAMP}"
SESSION_PATH="$WORKTREE_ROOT/$SESSION_ID"

echo "Creating session worktree: $SESSION_ID"

# 1. 从父 worktree 创建新 worktree
cd "$PARENT_PATH"
git worktree add "$SESSION_PATH"

# 2. 复制 GSD 状态
cp -r "$PARENT_PATH/.gsd" "$SESSION_PATH/"

# 3. 复制 checkpoint
mkdir -p "$SESSION_PATH/.opencode/passive"
cp "$PARENT_PATH/.opencode/passive/checkpoint.md" \
   "$SESSION_PATH/.opencode/passive/checkpoint.md"

# 4. 生成 handoff 文件
cat > "$SESSION_PATH/.opencode/passive/handoff-from-$PARENT_SESSION.md" << EOF
# Handoff from $PARENT_SESSION

## Source
- Worktree: $PARENT_PATH
- Session: $PARENT_SESSION

## Target
- Worktree: $SESSION_PATH
- Session: $SESSION_ID

## Transfer Time
$(date -u +%Y-%m-%dT%H:%M:%SZ)

## Context
Resumed from parent session due to context limit.
EOF

# 5. 重新链接 openspec-ob/
rm -rf "$SESSION_PATH/openspec-ob"
ln -s "$PARENT_PATH/openspec-ob" "$SESSION_PATH/openspec-ob"

# 6. 如果是 src/ 有修改，保留符号链接或复制
# 根据策略决定：如果是开发中，可能需要复制当前修改

# 7. 更新 manifest
# ... (调用 node 脚本)

echo "Session worktree created at: $SESSION_PATH"
echo "Resume with: cd $SESSION_PATH && /gsd-resume-work"
```

### 3.3 清理旧 Worktree
```bash
#!/bin/bash
# scripts/cleanup-worktree.sh

PROJECT_NAME="$1"
WORKTREE_PATH="$2"

echo "Cleaning up worktree: $WORKTREE_PATH"

# 1. 检查是否有未提交的修改
cd "$WORKTREE_PATH"
if [ -n "$(git status --porcelain)" ]; then
  echo "Warning: Uncommitted changes detected"
  echo "Please commit or stash before cleanup"
  exit 1
fi

# 2. 移除 worktree
git worktree remove "$WORKTREE_PATH"

# 3. 清理 manifest
# ... (调用 node 脚本)

echo "Worktree cleaned up"
```

### 3.4 列出所有 Worktree
```bash
#!/bin/bash
# scripts/list-worktrees.sh

PROJECT_NAME="$1"
MANIFEST="$HOME/gsd-workspaces/manifests/${PROJECT_NAME}-manifest.yaml"

echo "Worktrees for project: $PROJECT_NAME"
echo "================================"

# 使用 yq 或 node 解析 yaml
# 显示：
# - Change ID
# - Status (active/paused)
# - Current Session
# - Path
# - Last Activity
```

---

## 4. 与 OpenSpec 整合

### 4.1 Change 创建时
```javascript
// worktree-adapter.mjs

async function onOpenspecChangeCreated(changeId) {
  // 1. 获取主仓库路径
  const mainRepo = await getMainRepoPath();
  
  // 2. 创建 change worktree
  const worktreePath = await createChangeWorktree({
    project: getProjectName(),
    changeId,
    mainRepo
  });
  
  // 3. 链接 openspec-ob/
  await linkOpenspecDir(worktreePath, mainRepo);
  
  // 4. 创建 OpenSpec change 目录
  await createOpenspecChangeDir(changeId);
  
  return worktreePath;
}
```

### 4.2 Session 切换时
```javascript
async function onContextLimitReached(changeId, currentSession) {
  // 1. GSD 创建 checkpoint
  await gsdPauseWork(changeId);
  
  // 2. 创建 session worktree
  const newWorktree = await createSessionWorktree({
    project: getProjectName(),
    changeId,
    parentSession: currentSession
  });
  
  // 3. 更新 OpenSpec STATUS
  await updateOpenspecStatus(changeId, {
    status: "session-switched",
    from: currentSession,
    to: newWorktree.sessionId
  });
  
  return newWorktree;
}
```

### 4.3 状态同步
```yaml
同步规则:

openspec-ob/active/changes/{id}/:
  source: main worktree
  targets: all change/session worktrees
  method: symbolic link
  trigger: initial setup only
  
openspec-ob/active/changes/{id}/STATUS.md:
  source: any worktree
  targets: main worktree
  method: git commit/push
  trigger: on pause/resume
  
.gsd/phases/{id}/:
  source: parent worktree
  targets: child worktrees
  method: copy on create
  trigger: session creation
  
src/:
  method: git operations
  note: worktrees share git history, use branches for isolation
```

---

## 5. 与 GSD 整合

### 5.1 GSD 命令实现
```javascript
// gsd-worktree-commands.mjs

const GsdWorktreeCommands = {
  async newWorkspace({ name, repos, strategy }) {
    if (strategy === 'worktree') {
      return await createChangeWorktree({
        project: getProjectName(),
        changeId: name,
        mainRepo: repos
      });
    }
    // ...
  },
  
  async pauseWork(changeId) {
    // 1. 获取当前 worktree
    const worktree = await getCurrentWorktree();
    
    // 2. 创建 checkpoint
    await createCheckpoint(worktree, changeId);
    
    // 3. 更新 manifest
    await updateWorktreeManifest({
      changeId,
      sessionId: worktree.sessionId,
      status: 'paused'
    });
  },
  
  async resumeWork(changeId) {
    // 1. 获取最新的 active worktree
    const worktree = await getLatestWorktree(changeId);
    
    // 2. 切换到该 worktree
    console.log(`cd ${worktree.path}`);
    
    // 3. 读取 checkpoint
    const checkpoint = await readCheckpoint(worktree);
    
    return checkpoint;
  },
  
  async auditWorkspaces() {
    const manifest = await readManifest();
    const issues = [];
    
    for (const [changeId, worktree] of Object.entries(manifest.worktrees)) {
      // 检查 worktree 是否存在
      if (!await fs.access(worktree.path)) {
        issues.push({
          type: 'orphaned_manifest',
          changeId,
          path: worktree.path
        });
      }
      
      // 检查是否有孤立 worktree
      // ...
    }
    
    return issues;
  }
};
```

### 5.2 自动上下文管理
```javascript
// context-monitor.mjs

class ContextMonitor {
  constructor(changeId) {
    this.changeId = changeId;
    this.messageCount = 0;
    this.worktreeManager = new WorktreeManager();
  }
  
  async onMessage() {
    this.messageCount++;
    
    if (this.messageCount >= 15) {
      // 触发 worktree 切换
      await this.worktreeManager.createSessionWorktree({
        changeId: this.changeId,
        parentSession: this.getCurrentSession()
      });
      
      // 提示用户
      console.log('上下文已满，已创建新 worktree');
      console.log('请切换后继续');
    }
  }
}
```

---

## 6. 脚本清单

### 6.1 管理脚本
```
opencode-worktree/
├── scripts/
│   ├── init.mjs                    # 初始化项目
│   ├── create-change-worktree.sh   # 创建 change worktree
│   ├── create-session-worktree.sh  # 创建 session worktree
│   ├── cleanup-worktree.sh         # 清理 worktree
│   ├── list-worktrees.sh           # 列出 worktree
│   ├── sync-manifest.mjs           # 同步 manifest
│   └── audit-worktrees.mjs         # 审计 worktrees
│
├── lib/
│   ├── worktree-manager.mjs        # Worktree 管理核心
│   ├── manifest-manager.mjs        # Manifest 管理
│   ├── context-monitor.mjs         # 上下文监控
│   └── sync-engine.mjs             # 同步引擎
│
└── templates/
    ├── checkpoint.md               # Checkpoint 模板
    ├── handoff.md                  # Handoff 模板
    └── manifest.yaml               # Manifest 模板
```

### 6.2 使用方法
```bash
# 初始化项目
node .opencode-worktree/scripts/init.mjs

# 创建 change
node .opencode-worktree/scripts/create-change-worktree.sh my-project change-001 ~/project

# 创建 session（自动）
# 当上下文满时自动触发

# 列出 worktrees
node .opencode-worktree/scripts/list-worktrees.sh my-project

# 清理旧 worktree
node .opencode-worktree/scripts/cleanup-worktree.sh my-project ~/gsd-workspaces/...

# 审计
node .opencode-worktree/scripts/audit-worktrees.mjs my-project
```

---

## 7. 待实现功能

- [ ] Worktree 管理核心（create/remove/list）
- [ ] Manifest 管理系统
- [ ] Session worktree 自动创建
- [ ] 状态同步引擎
- [ ] 上下文监控集成
- [ ] 清理和审计工具
- [ ] GSD 命令集成
- [ ] OpenSpec 目录链接
- [ ] 跨 worktree 的 git 操作协调
- [ ] 孤立 worktree 检测和清理
