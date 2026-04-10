# 实施计划与迭代路线图

## 迭代策略

采用 **"快速原型 → 验证 → 完善"** 的迭代方式，每轮迭代 1-2 天，快速跑通完整流程。

---

## 第一轮：基础设施（Day 1-2）

### 目标
建立最基本的三位一体结构，能创建 change worktree 并手动切换。

### 任务
1. **OpenSpec 基础**
   - [ ] 创建 `openspec-ob/active/changes/` 目录结构
   - [ ] 创建 proposal.md 模板
   - [ ] 创建 STATUS.md 模板

2. **GSD 基础**
   - [ ] 创建 `.gsd/` 目录结构
   - [ ] 实现 `context-rules.yaml`
   - [ ] 创建 STATE.md 模板

3. **Worktree 基础**
   - [ ] 创建 `~/gsd-workspaces/` 目录
   - [ ] 实现 `create-change-worktree.sh`
   - [ ] 测试 worktree 创建和切换

### 验证标准
```bash
# 能成功执行
./scripts/create-change-worktree.sh my-project change-001 ~/project
cd ~/gsd-workspaces/my-project/change-001
ls -la  # 看到 .gsd/ .opencode/ openspec-ob/
```

---

## 第二轮：上下文管理（Day 3-4）

### 目标
实现自动上下文监控和 session worktree 切换。

### 任务
1. **上下文监控**
   - [ ] 实现 `context-monitor.mjs`
   - [ ] 添加消息计数器
   - [ ] 实现 10/15 轮预警

2. **Session Worktree**
   - [ ] 实现 `create-session-worktree.sh`
   - [ ] 实现 checkpoint 复制
   - [ ] 实现 handoff 生成

3. **GSD 集成**
   - [ ] 模拟 `/gsd-pause-work`
   - [ ] 实现 checkpoint 生成
   - [ ] 更新 manifest

### 验证标准
```javascript
// 模拟 15 轮对话
for (let i = 0; i < 15; i++) {
  contextMonitor.onMessage();
}
// 看到输出："🔴 已达到 15 轮，创建新 worktree"
// 看到新 worktree 创建成功
```

---

## 第三轮：流程整合（Day 5-6）

### 目标
打通 OpenSpec → GSD → Worktree 的完整流程。

### 任务
1. **Change 创建流程**
   - [ ] `/gsd-new-workspace` 创建 OpenSpec change
   - [ ] 自动初始化所有模板
   - [ ] 更新 manifest

2. **Session 切换流程**
   - [ ] 上下文满时自动触发
   - [ ] 更新 OpenSpec STATUS.md
   - [ ] 恢复 checkpoint

3. **Resume 流程**
   - [ ] 实现 `/gsd-resume-work`
   - [ ] 读取 checkpoint
   - [ ] 显示 continue-here.md

### 验证标准
```bash
# 完整流程测试
/gsd-new-workspace --name test-change --repos . --strategy worktree
# ... 工作 15 轮 ...
# 自动提示：新 worktree 已创建
cd ~/gsd-workspaces/.../test-change-session-...
/gsd-resume-work
# 成功恢复到之前状态
```

---

## 第四轮：验证层（Day 7-8）

### 目标
实现 GSD 审查 OpenSpec 流程和最佳实践检查。

### 任务
1. **审查清单**
   - [ ] 创建 `review-checklist.md`
   - [ ] 实现 Planning Gate 检查
   - [ ] 实现 Implementation Gate 检查

2. **自动化审查**
   - [ ] 实现 `/gsd-audit-change`
   - [ ] 检查 worktree 健康
   - [ ] 检查 OpenSpec 完整性
   - [ ] 生成审查报告

3. **最佳实践集成**
   - [ ] 整合社区最佳实践
   - [ ] 添加警告和建议
   - [ ] 实现改进反馈

### 验证标准
```bash
/gsd-audit-change --change test-change
# 输出:
# ✓ Worktree 健康
# ✓ Checkpoint 链完整
# ⚠ Proposal 缺少 Non-Goals
# ✓ 所有 AC 有对应 Task
```

---

## 第五轮：优化与社区整合（Day 9-10）

### 目标
优化细节，整合社区案例，完善文档。

### 任务
1. **性能优化**
   - [ ] 优化 worktree 创建速度
   - [ ] 实现增量同步
   - [ ] 优化 checkpoint 大小

2. **社区案例整合**
   - [ ] 整合 Liatrio Planning Audit
   - [ ] 整合 Spec Kit Review Gate
   - [ ] 整合 SpecWeave Validation

3. **文档完善**
   - [ ] 编写用户指南
   - [ ] 创建示例项目
   - [ ] 编写故障排除指南

### 验证标准
- 完整流程跑通 < 5 分钟
- 所有社区最佳实践已整合
- 文档完整，新手可上手

---

## Git Agent 持续跟进策略

### 每次迭代后

1. **提交变更**
   ```bash
   git add -A
   git commit -m "[iteration-1] 基础设施 - 创建 change worktree"
   ```

2. **Git Agent 审查**
   ```bash
   # 让 Git Agent 审查代码
   git-agent review --scope iteration-1
   ```

3. **应用反馈**
   - 根据 Git Agent 建议改进
   - 修复问题
   - 更新文档

4. **标记完成**
   ```bash
   git tag iteration-1-complete
   ```

### 跨迭代追踪

```yaml
# .git-agent/tracking.yaml
iterations:
  iteration-1:
    status: "complete"
    commits: ["abc123", "def456"]
    validation: "passed"
    issues: []
    
  iteration-2:
    status: "in-progress"
    branch: "feature/context-monitor"
    blockers: []
    
  iteration-3:
    status: "pending"
    dependencies: ["iteration-2"]
```

---

## 社区案例参考清单

### 1. Liatrio Spec-Driven Workflow
**可借鉴**: Planning Audit Gate
**整合方式**: GSD 在 change 创建时执行 Planning Audit
**参考文件**: `prompts/SDD-2-generate-task-list-from-spec.md`

### 2. GitHub Spec Kit + Plan Review Gate
**可借鉴**: PR 级别的 spec 审查
**整合方式**: GSD 在每个 worktree 提交前执行 Spec Review
**参考文件**: `README.md` (Spec Kit), `README.md` (Plan Review Gate)

### 3. SpecWeave Validation Workflow
**可借鉴**: 分层验证（Quick/Full/AI QA）
**整合方式**: GSD 实施分层审查（Advisory/Soft Fail/Hard Fail）
**参考文件**: `docs/workflows/validation/`

### 4. OpenCode Multi-Agent Team
**可借鉴**: Passive State Pipeline
**整合方式**: 当前的 checkpoint/state-log 机制
**参考文件**: `specs/opencode-passive-state-pipeline/spec.md`

### 5. GSD 2 Multi-Provider Model
**可借鉴**: context_pause_threshold 自动检查点
**整合方式**: 自动触发 /gsd-pause-work
**参考文件**: `docs/configuration.md`

### 6. Claude Code Context Management
**可借鉴**: 80% 规则，/compact 命令
**整合方式**: 10/15 轮阈值，自动压缩建议
**参考文件**: 官方文档

### 7. Spec Kit Verify Extension
**可借鉴**: 实现证据检查
**整合方式**: 每个 task 需要附加证据
**参考文件**: `README.md` (Verify Extension)

### 8. ai-agents PR Validation
**可借鉴**: PR 时 spec 验证
**整合方式**: GSD audit 时验证实现符合 spec
**参考文件**: `.github/workflows/ai-spec-validation.yml`

---

## 迭代检查清单

### 每轮迭代开始
- [ ] 从上一轮 tag 创建分支
- [ ] 更新实施计划
- [ ] 明确本轮目标

### 每轮迭代中
- [ ] 每日提交代码
- [ ] 记录遇到的问题
- [ ] 更新文档

### 每轮迭代结束
- [ ] 完成功能实现
- [ ] 通过验证标准
- [ ] Git Agent 审查通过
- [ ] 更新 ARCHITECTURE-PLAN.md
- [ ] 创建 tag
- [ ] 合并到 main

### 跨迭代
- [ ] 检查社区案例更新
- [ ] 整合新的最佳实践
- [ ] 调整后续计划

---

## 快速启动命令

```bash
# Day 1: 开始第一轮
git checkout -b iteration/1-infrastructure

# 创建基础结构
mkdir -p openspec-ob/active/changes
mkdir -p .gsd/phases
mkdir -p ~/gsd-workspaces

# 开始实现...

# Day 2: 结束第一轮
git add -A
git commit -m "[iteration-1] 基础设施完成"
git tag iteration-1-complete
git checkout main
git merge iteration/1-infrastructure

# 开始第二轮
git checkout -b iteration/2-context-monitor
# ...
```

---

## 预期成果

10 天后，你将拥有：

1. **完整的三位一体架构**
   - OpenSpec 规范层
   - GSD 流程层
   - Worktree 隔离层

2. **自动化的上下文管理**
   - 15 轮自动切换
   - 无缝恢复
   - 状态不丢失

3. **流程审查机制**
   - GSD 审查 OpenSpec
   - 最佳实践检查
   - 改进建议

4. **可复用的模板和脚本**
   - 开箱即用
   - 可扩展
   - 社区兼容

---

## 下一步行动

**立即开始第一轮？**

1. 创建分支 `iteration/1-infrastructure`
2. 实现 `create-change-worktree.sh`
3. 创建 OpenSpec 模板
4. 提交并标记 `iteration-1-complete`

**要我帮你开始第一轮的具体实现吗？**
