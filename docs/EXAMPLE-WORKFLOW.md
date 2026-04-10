# 完整使用示例：从 Change 创建到 Session 切换

## 场景
你是一个开发者，要创建一个名为 "feature-auth" 的 change，在开发过程中上下文达到限制，系统自动切换到新的 session worktree。

---

## Step 1: 创建 Change

```bash
# 在项目根目录
./git-agent.sh start-iteration \
  --name feature-auth \
  --goal "Implement authentication system"

# Git Agent 会自动创建分支
# Switched to branch 'iteration/feature-auth'
```

---

## Step 2: 初始化 OpenSpec Change

```bash
# 创建 change 目录结构
mkdir -p openspec-ob/active/changes/feature-auth/specs

# 创建 proposal.md
cat > openspec-ob/active/changes/feature-auth/proposal.md << 'EOF'
# Proposal: feature-auth

## Goal
Implement user authentication system with JWT tokens

## Context
Current system lacks authentication. Need to add:
- User login
- Token generation
- Token validation

## Decisions
| Decision | Rationale |
|----------|-----------|
| Use JWT | Industry standard, stateless |
| 24h expiry | Balance security and UX |

## Non-Goals
- OAuth integration (future phase)
- Password reset (separate change)

## Success Criteria
- Users can login with email/password
- Tokens expire after 24h
- API endpoints protected
EOF
```

---

## Step 3: 开始开发（前 9 轮）

```bash
# 检查上下文状态
node .opencode/scripts/context-monitor.mjs status feature-auth

# === Context Monitor Status ===
# 🟢 Status: GREEN
# 📊 Messages: 0/15
# 💬 Context healthy
# 🎯 Action: Work freely
# ================================

# 开始工作...
# 每一轮对话后，状态会自动更新
# 🟢 Message 1/15
# 🟢 Message 2/15
# ...
# 🟢 Message 9/15
```

---

## Step 4: 黄色警告（第 10-11 轮）

```bash
# 🟡 Message 10/15
# ⚠️  Context at 10+ messages
#    Suggestions:
#    - Complete current subtask
#    - Run /gsd-pause-work to create checkpoint

# 此时应该：
# 1. 尽快完成当前子任务
# 2. 准备创建 checkpoint
```

---

## Step 5: 红色触发（第 12 轮）

```bash
# 🔴 Message 12/15
# 🚨 Context limit reached (12+)
# 🔴 CONTEXT LIMIT REACHED
# Auto-triggering handoff procedure...
#
# Creating new session worktree: feature-auth-session-1234567890
#
# 📁 Creating git worktree...
# 📋 Copying GSD state...
# 📝 Copying checkpoint...
# 📝 Creating handoff document...
# 🎯 Creating continue-here...
# 🔗 Linking openspec-ob...
# 📊 Updating manifest...
#
# ✅ Session worktree created successfully!
#
# 📍 Location:
#    ~/gsd-workspaces/opencode-lab/feature-auth-session-1234567890
#
# 🚀 Next Steps:
#    1. Switch to the new worktree:
#       cd ~/gsd-workspaces/opencode-lab/feature-auth-session-1234567890
#
#    2. Resume work:
#       /gsd-resume-work
#
#    3. Or read the handoff:
#       cat .opencode/passive/handoff-feature-auth.md
```

---

## Step 6: 切换到新 Worktree

```bash
# 1. 切换到新 worktree
cd ~/gsd-workspaces/opencode-lab/feature-auth-session-1234567890

# 2. 查看 checkpoint
cat .opencode/passive/checkpoint.md

# 3. 查看 handoff
cat .opencode/passive/handoff-feature-auth.md

# === Session Handoff ===
#
# ## Transfer Info
# - From: feature-auth
# - To: feature-auth-session-1234567890
# - Timestamp: 2026-04-10T18:00:00Z
# - Reason: Context limit reached (15 messages)
#
# ## How to Resume
# 1. Switch to this worktree:
#    cd ~/gsd-workspaces/opencode-lab/feature-auth-session-1234567890
#
# 2. Run resume command:
#    /gsd-resume-work
#
# 3. Or manually read the checkpoint:
#    cat .opencode/passive/checkpoint.md
```

---

## Step 7: 恢复工作

```bash
# 恢复 checkpoint
/gsd-resume-work

# 或手动读取 .continue-here.md
cat .continue-here.md

# 重置上下文计数器
node .opencode/scripts/context-monitor.mjs reset feature-auth

# 🔄 Context monitor reset

# 检查状态
node .opencode/scripts/context-monitor.mjs status feature-auth

# === Context Monitor Status ===
# 🟢 Status: GREEN
# 📊 Messages: 0/15
# 💬 Context healthy
# 🎯 Action: Work freely
# ================================

# 继续工作！
```

---

## Step 8: 继续开发

```bash
# 新 worktree 保留了：
# ✅ 所有代码修改
# ✅ GSD 状态
# ✅ Checkpoint 信息
# ✅ OpenSpec 链接

# 从上次离开的地方继续...
# 🟢 Message 1/15
# 🟢 Message 2/15
# ...
```

---

## Step 9: 完成 Change

```bash
# 开发完成，提交代码
git add -A
git commit -m "[feature-auth] Implement JWT authentication"

# 更新 OpenSpec STATUS
cat > openspec-ob/active/changes/feature-auth/STATUS.md << 'EOF'
# Status: feature-auth

## Current State
- Phase: Complete
- Progress: [██████████] 100%

## Session History
- 2026-04-10 10:00: Started implementation
- 2026-04-10 11:30: Session 1 (15 messages), switched to session-2
- 2026-04-10 12:00: Completed implementation

## Blockers
- None

## Next Actions
- Archive change
- Start new change
EOF

# 完成迭代
./git-agent.sh complete-iteration

# ✅ 迭代 feature-auth 已完成
# 标签: feature-auth-complete
# 已合并到 main
```

---

## 文件结构总结

### 主仓库
```
~/project/
├── openspec-ob/active/changes/feature-auth/
│   ├── proposal.md
│   ├── STATUS.md
│   └── specs/
└── src/                     # 代码修改在这里
```

### Session Worktrees
```
~/gsd-workspaces/opencode-lab/
├── feature-auth/            # 第一轮 (15 messages, paused)
│   ├── .gsd/
│   ├── .opencode/passive/
│   │   ├── checkpoint.md
│   │   └── handoff-feature-auth-session-2.md
│   └── src/                # 链接到主仓库
│
└── feature-auth-session-2/  # 第二轮 (active)
    ├── .gsd/               # 从 session-1 复制
    ├── .opencode/passive/
    │   ├── checkpoint.md   # 从 session-1 复制
    │   └── handoff-feature-auth.md
    └── src/                # 链接到主仓库
```

---

## 关键命令速查

```bash
# 开始 change
./git-agent.sh start-iteration --name ID --goal "..."

# 检查上下文
node .opencode/scripts/context-monitor.mjs status ID

# 手动创建 session worktree
./scripts/create-session-worktree.sh PROJECT ID PARENT_PATH

# 恢复 checkpoint
/gsd-resume-work

# 重置计数器
node .opencode/scripts/context-monitor.mjs reset ID

# 完成 change
./git-agent.sh complete-iteration

# 查看所有状态
./git-agent.sh status
```

---

## 注意事项

1. **自动触发**: 12 轮时自动创建新 worktree
2. **状态保留**: 所有修改都保存在 worktree 中
3. **代码共享**: 所有 worktree 共享同一个 src/（通过 git）
4. **清理**: 完成后可以删除旧的 session worktree
