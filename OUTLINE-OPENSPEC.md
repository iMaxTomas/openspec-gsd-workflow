# OpenSpec 详细大纲

## 1. 核心概念

### 1.1 Change（变更）
- **定义**: 一个独立的、可交付的变更单元
- **生命周期**: Propose → Design → Spec → Implement → Validate → Archive
- **原则**: 每个 change 有明确边界，不随意扩大范围

### 1.2 Proposal（提案）
- **Goal**: 一句话描述目标
- **Context**: 背景和动机
- **Decisions**: 关键决策（冻结后不变）
- **Non-Goals**: 明确不包含的内容

### 1.3 Spec（规范）
- **AC (Acceptance Criteria)**: Given/When/Then 格式的验收标准
- **Constraints**: 约束条件
- **Edge Cases**: 边界情况
- **Dependencies**: 依赖项

### 1.4 Task（任务）
- **分解原则**: 每个任务 < 2 小时
- **格式**: `- [ ] 任务描述 (AC-001)`
- **证据**: 完成后附加证据（截图/日志/测试）

---

## 2. 文件结构详解

### 2.1 proposal.md
```markdown
# Proposal: {change-id}

## Goal
[一句话目标]

## Context
[背景、动机、当前状态]

## Decisions
| 决策 | 理由 | 影响 |
|------|------|------|
| [决策1] | [理由] | [影响] |

## Non-Goals
- [明确不做的内容]

## Success Criteria
- [可衡量的成功标准]
```

### 2.2 design.md
```markdown
# Design: {change-id}

## Architecture
[架构图/描述]

## Key Decisions
| 决策 | 备选方案 | 选择理由 | 风险 |
|------|----------|----------|------|
| [决策] | [备选] | [理由] | [风险] |

## Integration Points
[与现有系统的集成]

## Risks & Mitigations
- [风险]: [缓解措施]
```

### 2.3 tasks.md
```markdown
# Tasks: {change-id}

## Phase 1: [名称]
- [ ] [任务1] ([AC-001])
  - Evidence: [完成后填写]
- [ ] [任务2] ([AC-002])

## Phase 2: [名称]
- [ ] [任务3] ([AC-003])
```

### 2.4 STATUS.md
```markdown
# Status: {change-id}

## Current State
- Phase: [X] of [Y]
- Progress: [░░░░░░░░░░] 0%

## Session History
- [日期] [时间]: [做了什么] → [结果]

## Blockers
- [阻塞事项]

## Next Actions
1. [下一步]
```

### 2.5 specs/{capability}/spec.md
```markdown
# Spec: {capability}

## Requirement
[需求描述]

## Acceptance Criteria

### AC-001: [场景名称]
- **Given**: [前置条件]
- **When**: [操作]
- **Then**: [期望结果]

### AC-002: [边界情况]
- **Given**: [边界条件]
- **When**: [操作]
- **Then**: [期望结果]

## Constraints
- [约束1]

## Edge Cases
- [边界情况1]: [处理方式]
```

---

## 3. 工作流程

### 3.1 Create Change
1. 创建目录 `openspec-ob/active/changes/{id}/`
2. 编写 `proposal.md`
3. 冻结 Decisions
4. 创建 `design.md`（如需要）
5. 编写 `specs/*.md`
6. 分解 `tasks.md`

### 3.2 Implement Change
1. 读取 `tasks.md` 当前 phase
2. 执行 task
3. 标记完成 `[x]`
4. 附加证据
5. 更新 `STATUS.md`
6. 重复直到 phase 完成

### 3.3 Validate Change
1. 检查所有 AC 满足
2. 运行测试
3. 更新文档
4. 标记 `STATUS.md` 为 "Ready for Review"

### 3.4 Archive Change
1. 移动到 `openspec-ob/archive/{id}/`
2. 创建 `LESSONS-LEARNED.md`
3. 更新项目文档

---

## 4. 验证门

### 4.1 Planning Gate
- [ ] Proposal 完整
- [ ] Decisions 已冻结
- [ ] Design 已审查
- [ ] Specs 完整
- [ ] Tasks 分解合理

### 4.2 Implementation Gate
- [ ] 每个 task 有证据
- [ ] 代码符合 design
- [ ] 测试通过
- [ ] 文档已更新

### 4.3 Completion Gate
- [ ] 所有 AC 满足
- [ ] 测试覆盖率 > 80%
- [ ] Review 通过
- [ ] 无未解决的 blockers

---

## 5. 最佳实践

### 5.1 Proposal 写作
- 用一句话描述 Goal
- Decisions 要具体且可冻结
- Non-Goals 要明确排除范围

### 5.2 Spec 写作
- AC 使用 Given/When/Then
- 每个 AC 可独立测试
- Edge Cases 覆盖主要异常

### 5.3 Task 分解
- 每个 task 产生可验证的产出
- 复杂 task 进一步分解
- 保留分解的决策理由

### 5.4 Status 维护
- 每次 session 后更新
- 记录决策和 blockers
- 更新进度百分比

---

## 6. 与 GSD 整合点

### 6.1 Change 创建
- GSD: `/gsd-new-workspace` 触发 OpenSpec change 创建
- 自动创建 proposal.md 模板
- 初始化 STATUS.md

### 6.2 Session 管理
- GSD: `/gsd-pause-work` 更新 STATUS.md
- 记录 session 历史
- 同步 checkpoint 到 STATUS

### 6.3 流程审查
- GSD: `/gsd-audit-change` 检查 OpenSpec 完整性
- 验证所有 gate 通过
- 生成审查报告

---

## 7. 待实现功能

- [ ] Change 创建模板脚本
- [ ] Proposal/Design/Spec 生成助手
- [ ] Task 分解建议
- [ ] Status 自动更新
- [ ] Archive 自动化
- [ ] 跨 change 依赖追踪
- [ ] 变更影响分析
