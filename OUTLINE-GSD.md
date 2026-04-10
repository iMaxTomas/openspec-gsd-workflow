# GSD 详细大纲

## 1. 核心概念

### 1.1 Session（会话）
- **定义**: 一次连续的 AI 交互过程
- **限制**: 200K tokens / 建议 15 轮对话
- **管理**: 通过 checkpoint 和 handoff 实现连续性

### 1.2 Checkpoint（检查点）
- **定义**: 可恢复的会话状态快照
- **触发**: 手动 `/gsd-pause-work` 或自动（15 轮后）
- **内容**: 当前任务、进度、决策、blockers

### 1.3 Handoff（交接）
- **定义**: 会话间的状态传递
- **格式**: `.continue-here.md` + `HANDOFF.json`
- **使用**: `/gsd-resume-work` 读取恢复

### 1.4 Workspace（工作区）
- **定义**: 隔离的开发环境
- **类型**: Main / Change / Session
- **实现**: Git worktree

---

## 2. 文件结构详解

### 2.1 .gsd/STATE.md
```markdown
# Project State

## Project Reference
- Core value: [一句话]
- Current focus: [当前 change]

## Current Position
- Phase: [X] of [Y]
- Plan: [A] of [B]
- Status: [状态]
- Last activity: [日期] - [描述]

## Performance Metrics
- Total plans completed: [N]
- Average duration: [X] min

## Accumulated Context
### Decisions
- [Phase X]: [决策摘要]

### Pending Todos
- [待办]

### Blockers
- [阻塞]

## Session Continuity
- Last session: [日期时间]
- Stopped at: [最后动作]
- Resume file: [路径]
```

### 2.2 .gsd/context-rules.yaml
```yaml
thresholds:
  yellow: 10    # 预警轮数
  red: 15       # 强制 pause 轮数

actions:
  yellow:
    - notify: "已 10 轮，建议准备 handoff"
    - suggest: "/compact"
    
  red:
    - enforce: "/gsd-pause-work"
    - create: ["checkpoint.md", "handoff.md"]
    - trigger: "create-session-worktree"
    
context_monitor:
  enabled: true
  check_interval: "every_message"
  auto_compact: false
```

### 2.3 .gsd/change-manifest.yaml
```yaml
changes:
  change-001:
    id: "change-001"
    status: "active"
    current_phase: "implementation"
    workspace: "~/gsd-workspaces/project/change-001"
    sessions:
      - id: "session-1"
        start: "2026-04-11T10:00:00Z"
        end: "2026-04-11T11:30:00Z"
        messages: 15
        status: "paused"
        handoff_to: "session-2"
      
      - id: "session-2"
        start: "2026-04-11T11:35:00Z"
        status: "active"
        resumed_from: "session-1"
        messages: 3
        
  change-002:
    id: "change-002"
    status: "planning"
    workspace: "~/gsd-workspaces/project/change-002"
```

### 2.4 .gsd/phases/{change}/.continue-here.md
```markdown
# Continue Here

## Phase
[change-id]

## Current Task
[X] of [Y]

## Status
[进行中/阻塞/完成]

## Completed Work
- [x] ...

## Remaining Work
- [ ] ...

## Decisions Made
- [决策]: [理由]

## Blockers
- [阻塞]: [原因]

## Mental Context
[当前思考/上下文]

## Next Action
[具体下一步]

## Files Modified
- [文件路径]
```

### 2.5 .gsd/phases/{change}/HANDOFF.json
```json
{
  "timestamp": "2026-04-11T11:30:00Z",
  "change_id": "change-001",
  "session_id": "session-1",
  "messages_count": 15,
  "checkpoint": {
    "current_task": "Implement auth middleware",
    "progress": "60%",
    "files_modified": ["src/auth.ts", "src/middleware.ts"]
  },
  "decisions": [
    {
      "decision": "Use JWT for auth",
      "rationale": "Industry standard, well-supported"
    }
  ],
  "blockers": [],
  "next_action": "Complete token validation logic"
}
```

---

## 3. 核心命令

### 3.1 /gsd-new-workspace
**用途**: 创建隔离的 change workspace
**参数**:
- `--name`: workspace 名称
- `--repos`: 仓库路径
- `--strategy`: `worktree` 或 `clone`
- `--branch`: 分支名

**执行**:
1. git worktree add [path] -b [branch]
2. 创建 .gsd/ 目录结构
3. 初始化 STATE.md
4. 创建 change-manifest.yaml 条目

### 3.2 /gsd-pause-work
**用途**: 创建检查点，准备结束 session
**执行**:
1. 生成 .continue-here.md
2. 生成 HANDOFF.json
3. 更新 change-manifest.yaml
4. 可选：创建 git commit

### 3.3 /gsd-resume-work
**用途**: 从检查点恢复工作
**执行**:
1. 读取 HANDOFF.json
2. 恢复 checkpoint 状态
3. 更新 change-manifest.yaml
4. 显示 continue-here.md 内容

### 3.4 /gsd-audit-change
**用途**: 审查 change 的完整流程
**参数**:
- `--change`: change ID

**检查项**:
- [ ] checkpoint 存在且完整
- [ ] handoff 链连续
- [ ] 状态同步正确
- [ ] 无孤立 worktree

### 3.5 /gsd-progress
**用途**: 显示项目整体进度
**输出**:
- 当前 change 进度
- 会话统计
- 下一步建议

---

## 4. 上下文监控机制

### 4.1 自动监控
```javascript
// .opencode/scripts/context-monitor.mjs

const ContextMonitor = {
  messageCount: 0,
  threshold: {
    yellow: 10,
    red: 15
  },
  
  onMessage() {
    this.messageCount++;
    
    if (this.messageCount === this.threshold.yellow) {
      this.showYellowAlert();
    }
    
    if (this.messageCount >= this.threshold.red) {
      this.triggerRedAction();
    }
  },
  
  showYellowAlert() {
    console.log("🟡 已 10 轮，建议准备 handoff");
    console.log("提示: 运行 /gsd-pause-work 创建检查点");
  },
  
  triggerRedAction() {
    console.log("🔴 已达到 15 轮，自动创建检查点...");
    this.createCheckpoint();
    this.createNewSessionWorktree();
  },
  
  createCheckpoint() {
    // 调用 /gsd-pause-work
  },
  
  createNewSessionWorktree() {
    // 创建新的 worktree
  }
};
```

### 4.2 手动检查
```bash
# 检查当前上下文使用率
/gsd-status

# 显示:
# - 当前轮数: 12/15
# - 上下文使用率: 80%
# - 建议: 准备 handoff
```

---

## 5. 与 OpenSpec 整合点

### 5.1 Change 创建时
```javascript
// /gsd-new-workspace 内部

async function createChangeWorkspace(name) {
  // 1. GSD: 创建 worktree
  const worktreePath = await createWorktree(name);
  
  // 2. OpenSpec: 创建 change 目录
  await createOpenspecChange(name);
  
  // 3. GSD: 初始化状态
  await initGsdState(name, worktreePath);
  
  // 4. OpenSpec: 创建模板文件
  await createOpenspecTemplates(name);
  
  return worktreePath;
}
```

### 5.2 Session 切换时
```javascript
// 自动触发（15 轮后）

async function switchSession(changeId) {
  // 1. GSD: pause 当前 session
  await gsdPauseWork(changeId);
  
  // 2. OpenSpec: 更新 STATUS.md
  await updateOpenspecStatus(changeId, "session-paused");
  
  // 3. GSD: 创建新 worktree
  const newWorktree = await createSessionWorktree(changeId);
  
  // 4. OpenSpec: 同步状态到新 worktree
  await syncOpenspecToWorktree(changeId, newWorktree);
  
  return newWorktree;
}
```

### 5.3 流程审查时
```javascript
// /gsd-audit-change

async function auditChange(changeId) {
  // 1. GSD: 检查 worktree 健康
  const worktreeHealth = await checkWorktreeHealth(changeId);
  
  // 2. OpenSpec: 检查规范完整性
  const specCompleteness = await checkOpenspecCompleteness(changeId);
  
  // 3. GSD: 检查 checkpoint 链
  const checkpointChain = await checkCheckpointChain(changeId);
  
  // 4. 生成审计报告
  return generateAuditReport({
    worktreeHealth,
    specCompleteness,
    checkpointChain
  });
}
```

---

## 6. 与 Worktree 整合点

### 6.1 Worktree 类型
1. **Main Worktree**: 主仓库，规范定义
2. **Change Worktree**: 每个 change 一个，`~/gsd-workspaces/{project}/{change}/`
3. **Session Worktree**: 上下文满时创建，`~/gsd-workspaces/{project}/{change}-session-{n}/`

### 6.2 状态隔离
- **共享**: `openspec-ob/`（规范）、`src/`（代码）
- **独立**: `.gsd/`（GSD 状态）、`.opencode/passive/`（运行时状态）

### 6.3 同步机制
```yaml
同步规则:
  openspec-ob/:
    direction: main -> worktree
    trigger: change creation, spec update
    
  .gsd/phases/{change}/:
    direction: bidirectional
    trigger: every pause/resume
    
  src/:
    direction: bidirectional (via git)
    trigger: git commit/push/pull
```

---

## 7. 待实现功能

- [ ] 自动上下文监控脚本
- [ ] /gsd-pause-work 集成
- [ ] /gsd-resume-work 集成
- [ ] Session worktree 自动创建
- [ ] Change manifest 管理
- [ ] 流程审查自动化
- [ ] 性能指标收集
- [ ] 最佳实践建议
- [ ] 集成 OpenCode agent runner
