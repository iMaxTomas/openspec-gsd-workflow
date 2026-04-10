# OpenSpec + GSD + Worktree 三位一体架构规划

## 架构愿景

构建一个**规范驱动、上下文隔离、可恢复、可审查**的 AI 辅助开发工作流，实现：
- 每个 Change 有完整的规范追踪
- 每个会话有独立的上下文空间
- 每个检查点可精确恢复
- 每个流程可被 GSD 审查和优化

---

## 第一层：OpenSpec（规范层）

### 核心职责
- 定义 **What**（做什么）
- 冻结需求和验收标准
- 建立变更的可追溯性

### 文件结构
```
openspec-ob/
├── active/
│   └── changes/
│       └── {change-id}/
│           ├── proposal.md          # 变更提案（Why）
│           ├── design.md            # 设计方案（How）
│           ├── tasks.md             # 任务清单（What）
│           ├── STATUS.md            # 执行状态
│           └── specs/
│               └── {capability}/
│                   └── spec.md      # 详细规范
│
├── archive/                         # 已完成的 changes
│   └── {change-id}/
│       └── ...
│
└── .best-practices/                 # 最佳实践验证层
    ├── review-checklist.md
    └── validation-gates.yaml
```

### 关键流程
1. **Propose** - 创建 proposal.md
2. **Design** - 冻结 design.md 决策
3. **Spec** - 编写 specs/*.md
4. **Implement** - 按 tasks.md 执行
5. **Validate** - 验证符合 spec
6. **Archive** - 归档到 archive/

---

## 第二层：GSD（流程层）

### 核心职责
- 定义 **How**（怎么做）
- 管理会话上下文生命周期
- 提供检查点和恢复机制
- 审查流程完整性

### 文件结构
```
.gsd/
├── STATE.md                         # 项目全局状态
├── context-rules.yaml               # 上下文管理规则
├── change-manifest.yaml             # 所有 changes 的追踪
│
├── phases/
│   └── {change-id}/
│       ├── .continue-here.md        # 暂停恢复文件
│       ├── HANDOFF.json             # 结构化 handoff
│       └── session-log.md           # 会话历史
│
└── workspaces/
    └── {workspace-id}/
        └── workspace-manifest.yaml  # Worktree 追踪
```

### 关键流程
1. **/gsd:new-project** - 初始化 GSD 状态
2. **/gsd:new-workspace** - 创建 worktree
3. **/gsd:pause-work** - 创建检查点
4. **/gsd:resume-work** - 从检查点恢复
5. **/gsd:audit-milestone** - 审查流程完整性

---

## 第三层：Worktree（隔离层）

### 核心职责
- 提供 **Where**（在哪里做）
- 隔离不同 change 的上下文
- 支持并行开发
- 实现上下文重置而不丢失状态

### 目录结构
```
~/gsd-workspaces/                    # GSD 工作区根目录
│
├── {project-name}/                  # 项目级 worktree
│   ├── .git                         # 共享仓库
│   ├── openspec-ob/                 # 规范（符号链接或副本）
│   ├── .gsd/                        # GSD 状态（独立）
│   ├── .opencode/                   # OpenCode 状态（独立）
│   │   └── passive/
│   │       ├── checkpoint.md        # 可恢复检查点
│   │       ├── state-log.md         # 状态历史
│   │       └── handoff.md           # 会话交接
│   │
│   └── src/                         # 代码（共享或隔离）
│
└── manifests/
    └── {project-name}-manifest.yaml # 工作区清单
```

### Worktree 类型
1. **Main Worktree** - 主仓库，只读规范
2. **Change Worktree** - 每个 change 一个 worktree
3. **Session Worktree** - 上下文满时自动创建

---

## 三位一体整合点

### 整合点 1: Change 创建时
```bash
# 用户执行
/gsd-new-workspace --name feature-auth --repos . --strategy worktree

# 内部执行流程
1. OpenSpec: 创建 openspec-ob/active/changes/feature-auth/
2. GSD: 初始化 .gsd/phases/feature-auth/
3. Worktree: git worktree add ~/gsd-workspaces/feature-auth
```

### 整合点 2: 任务执行时
```bash
# 在 change worktree 中
node .opencode/scripts/slice-one-runner.mjs --task "..." --lane execution

# 内部执行
1. OpenSpec: 读取 change/feature-auth/tasks.md
2. GSD: 检查上下文使用率，必要时触发 pause-work
3. Worktree: 当前 worktree 是隔离的执行环境
```

### 整合点 3: 上下文满时
```bash
# 自动触发（15 轮对话后）

1. GSD: /gsd-pause-work
   - 创建 .continue-here.md
   - 生成 HANDOFF.json

2. Worktree: 创建新 session worktree
   git worktree add ~/gsd-workspaces/feature-auth-session-2
   
3. OpenSpec: 更新 STATUS.md
   - 记录会话切换
   - 更新任务进度

4. 用户切换
   cd ~/gsd-workspaces/feature-auth-session-2
   /gsd-resume-work
```

### 整合点 4: 流程审查时
```bash
# GSD 审查 OpenSpec 流程
/gsd-audit-change --change feature-auth

# 审查维度
1. OpenSpec 完整性检查
   - proposal.md 是否存在？
   - specs/ 是否完整？
   - tasks.md 是否覆盖所有 AC？

2. GSD 流程检查
   - 是否有 checkpoint？
   - 会话切换是否合理？
   - handoff 是否完整？

3. Worktree 健康检查
   - worktree 是否孤立？
   - 状态是否正确同步？
   - 是否有未合并的 worktree？
```

---

## 关键机制设计

### 1. 上下文自动监控
```yaml
# .gsd/context-rules.yaml
thresholds:
  yellow: 10
  red: 15

actions:
  yellow:
    - notify: "已 10 轮，建议准备 handoff"
    - suggest: "/compact 或 /gsd-pause-work"
    
  red:
    - enforce: "/gsd-pause-work"
    - create: ["checkpoint.md", "handoff.md"]
    - trigger: "create-session-worktree"
```

### 2. 状态同步机制
```yaml
# 主仓库 <---> Change Worktree <---> Session Worktree

同步规则:
1. openspec-ob/active/ - 单向同步（主 -> worktree）
2. .gsd/phases/{change}/ - 双向同步
3. src/ - 双向同步（通过 git）
4. .opencode/passive/ - worktree 独立
```

### 3. GSD 审查 OpenSpec 的清单
```markdown
# GSD Review Checklist for OpenSpec

## Phase 1: Planning Quality
- [ ] Proposal 完整（Goal, Non-Goals, Decisions）
- [ ] Design 冻结（Decisions 可追溯）
- [ ] Specs 完整（AC 可测试）
- [ ] Tasks 分解合理（< 2 小时/任务）

## Phase 2: Implementation Tracking
- [ ] 每个 task 有对应 checkpoint
- [ ] 上下文切换有 handoff
- [ ] Blockers 记录到 unresolved-item
- [ ] 证据（截图/日志）已保存

## Phase 3: Validation
- [ ] 实现符合 spec
- [ ] 测试覆盖 AC
- [ ] 文档已更新
- [ ] 可归档

## Phase 4: Process Improvement
- [ ] 识别流程瓶颈
- [ ] 记录最佳实践
- [ ] 更新模板
```

---

## 实施路线图

### 阶段 1: 基础设施（Week 1）
- [ ] 创建 OpenSpec 目录结构
- [ ] 创建 GSD 配置框架
- [ ] 实现 Worktree 管理脚本
- [ ] 建立三者整合点

### 阶段 2: 上下文管理（Week 2）
- [ ] 实现自动上下文监控
- [ ] 实现 /gsd-pause-work 集成
- [ ] 实现 Session Worktree 自动创建
- [ ] 测试 handoff/recovery 流程

### 阶段 3: 验证层（Week 3）
- [ ] 实现 GSD 审查 OpenSpec 流程
- [ ] 创建验证门（Validation Gates）
- [ ] 集成最佳实践检查
- [ ] 实现流程改进反馈

### 阶段 4: 优化迭代（Week 4+）
- [ ] 根据实际使用优化
- [ ] 补充社区最佳实践
- [ ] 完善文档和模板
- [ ] 自动化更多流程

---

## 社区案例参考

### 案例 1: Liatrio Spec-Driven Workflow
- **可借鉴**: 实施前的 Planning Audit Gate
- **整合**: GSD 在 change 创建时执行 Planning Audit

### 案例 2: GitHub Spec Kit + Plan Review Gate
- **可借鉴**: PR 级别的 spec 审查
- **整合**: GSD 在每个 worktree 提交前执行 Spec Review

### 案例 3: SpecWeave Validation Workflow
- **可借鉴**: 分层验证（Quick/Full/AI QA）
- **整合**: GSD 实施分层审查（Advisory/Soft Fail/Hard Fail）

### 案例 4: OpenCode Multi-Agent Team
- **可借鉴**: Passive State Pipeline
- **整合**: 当前的 checkpoint/state-log 机制

### 案例 5: GSD 2 Multi-Provider Model
- **可借鉴**: context_pause_threshold 自动检查点
- **整合**: 自动触发 /gsd-pause-work

---

## 下一步行动

1. **立即开始**: 创建三个大纲的详细文档
2. **Git Agent**: 设置持续跟进流程
3. **首轮迭代**: 实现最基本的 change worktree 创建
4. **社区调研**: 收集更多实际使用案例

---

## 附录: 文件清单

### OpenSpec 层
- `openspec-ob/active/changes/{id}/proposal.md`
- `openspec-ob/active/changes/{id}/design.md`
- `openspec-ob/active/changes/{id}/tasks.md`
- `openspec-ob/active/changes/{id}/STATUS.md`
- `openspec-ob/active/changes/{id}/specs/{cap}/spec.md`

### GSD 层
- `.gsd/STATE.md`
- `.gsd/context-rules.yaml`
- `.gsd/change-manifest.yaml`
- `.gsd/phases/{id}/.continue-here.md`
- `.gsd/phases/{id}/HANDOFF.json`

### Worktree 层
- `.gsd/workspaces/{id}/workspace-manifest.yaml`
- `~/gsd-workspaces/{project}/{change}/`
- `~/gsd-workspaces/{project}/{change}-session-{n}/`

### 整合脚本
- `.opencode/scripts/init-change.mjs`
- `.opencode/scripts/context-monitor.mjs`
- `.opencode/scripts/create-session-worktree.mjs`
- `.opencode/scripts/gsd-audit-change.mjs`
