# 社区案例参考库

## 案例 1: Liatrio Spec-Driven Workflow

### 来源
- **仓库**: `liatrio-labs/spec-driven-workflow`
- **文档**: README.md, prompts/SDD-*.md

### 核心机制
**Planning Audit Gate（规划审查门）**
- 在 task 生成前强制审查 spec
- 要求每个 functional requirement 映射到 task
- 要求每个 task 有证据计划

### 可借鉴点
```markdown
## Planning Audit Checklist
- [ ] All functional requirements mapped to tasks
- [ ] Each task has acceptance criteria
- [ ] Each task has evidence plan
- [ ] Required proof artifacts identified
- [ ] No task exceeds 2 hours
- [ ] Dependencies between tasks explicit
```

### 整合建议
**在 GSD `/gsd-new-workspace` 后执行:**
```javascript
async function planningAudit(changeId) {
  const spec = await readOpenspecSpec(changeId);
  const tasks = await readOpenspecTasks(changeId);
  
  const issues = [];
  
  // 检查 AC 覆盖
  for (const ac of spec.acceptanceCriteria) {
    if (!tasks.some(t => t.links.includes(ac.id))) {
      issues.push(`AC ${ac.id} not linked to any task`);
    }
  }
  
  // 检查 task 大小
  for (const task of tasks) {
    if (task.estimatedHours > 2) {
      issues.push(`Task ${task.id} exceeds 2 hours`);
    }
  }
  
  return { passed: issues.length === 0, issues };
}
```

---

## 案例 2: GitHub Spec Kit + Plan Review Gate

### 来源
- **主仓库**: `github/spec-kit`
- **扩展**: `luno/spec-kit-plan-review-gate`

### 核心机制
**PR 级别的 Spec 审查**
- 阻止 `/speckit.tasks` 直到 spec 审查通过
- 通过 PR/MR 合并 spec.md 和 plan.md
- 强制审查后才能生成 tasks

### 可借鉴点
```yaml
# .github/workflows/spec-review-gate.yml
name: Spec Review Gate

on:
  pull_request:
    paths:
      - '**/*.spec.md'
      - '**/*.plan.md'

jobs:
  spec-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check spec completeness
        run: |
          speckit verify --check-required-fields
          speckit verify --check-ac-coverage
          
      - name: Block if not reviewed
        if: github.event.pull_request.reviews < 1
        run: |
          echo "Spec requires at least 1 review"
          exit 1
```

### 整合建议
**在 GSD 中实现类似 gate:**
```javascript
// GSD Spec Review Gate
async function specReviewGate(changeId) {
  const proposal = await readOpenspecProposal(changeId);
  const design = await readOpenspecDesign(changeId);
  
  const checks = {
    hasProposal: !!proposal,
    hasDesign: !!design,
    decisionsFrozen: design?.decisions?.every(d => d.frozen),
    hasNonGoals: proposal?.nonGoals?.length > 0
  };
  
  if (!Object.values(checks).every(Boolean)) {
    return {
      passed: false,
      blockers: Object.entries(checks)
        .filter(([_, v]) => !v)
        .map(([k, _]) => k)
    };
  }
  
  return { passed: true };
}
```

---

## 案例 3: SpecWeave Validation Workflow

### 来源
- **网站**: spec-weave.com
- **文档**: docs/workflows/validation/

### 核心机制
**三层验证**
1. **Quick**: Task 完成、基础测试
2. **Full**: 全覆盖、AC 追溯、文档完整
3. **AI QA**: 代码质量、风险评估

### 可借鉴点
```bash
# SpecWeave 命令
sw:validate 0001 --quick      # 快速验证
sw:validate 0001              # 完整验证
sw:qa 0001                    # AI 质量评估
sw:grill 0001                 # 代码审查
```

### 验证输出
```markdown
# Increment Validation: 0001-user-authentication

## Summary
Status: READY TO SHIP

## Checks
### Tasks
- Total: 15
- Complete: 15
- Status: PASS

### Tests
- Total: 47
- Passing: 47
- Status: PASS

### Coverage
- Target: 80%
- Actual: 87%
- Status: PASS

### AC-IDs
- Total: 12
- Satisfied: 12
- Status: PASS
```

### 整合建议
**GSD 分层审查:**
```yaml
# .gsd/validation-gates.yaml
gates:
  advisory:  # 仅报告，不阻塞
    checks:
      - naming_conventions
      - spec_structure
    action: report
    
  soft_fail:  # 警告，可覆盖
    checks:
      - task_decomposition
      - evidence_quality
    action: warn
    
  hard_fail:  # 阻塞，必须修复
    checks:
      - tests_passing
      - ac_coverage
      - security_policy
    action: block
```

---

## 案例 4: OpenCode Multi-Agent Team

### 来源
- **当前仓库**: `plan-opencode-multiagent-team-v3`
- **文件**: design.md, specs/opencode-passive-state-pipeline/spec.md

### 核心机制
**Passive State Pipeline（被动状态管道）**
- 只读证据输入
- 只写边界工件输出
- 不中断操作员线程

### 工件类型
```markdown
- state-log: 追加式时序状态跟踪
- checkpoint: 可恢复检查点
- unresolved-item: 持久化未解决问题
- handoff-candidate: 待处理候选
```

### 整合建议
**已部分实现，需完善:**
```javascript
// .opencode/scripts/slice-one-runner.mjs

// 已有功能:
// ✓ checkpoint 生成
// ✓ state-log 追加
// ✓ lane 路由

// 需完善:
// - 自动触发（上下文满时）
// - worktree 集成
// - GSD 状态同步
```

---

## 案例 5: GSD 2 Multi-Provider Model

### 来源
- **文档**: docs/configuration.md
- **文件**: references/model-profiles.md

### 核心机制
**自动上下文检查点**
```yaml
context_pause_threshold: 80  # 上下文使用率 80% 时暂停
```

**自动压缩**
```typescript
if (usage.tokens > 100_000) {
  ctx.compact({
    customInstructions: "Focus on recent changes"
  });
}
```

### 整合建议
**在 GSD 1.x 中实现:**
```yaml
# .gsd/context-rules.yaml
thresholds:
  yellow: 10  # 对话轮数
  red: 15     # 强制创建 checkpoint

actions:
  yellow:
    - notify: "Context getting full"
    - suggest: "/compact"
    
  red:
    - enforce: "/gsd-pause-work"
    - trigger: "create-session-worktree"
```

---

## 案例 6: Claude Code Context Management

### 来源
- **官方文档**: code.claude.com/docs
- **社区指南**: claudefa.st, jdhodges.com

### 核心机制
**80/20 规则**
- 0-50%: 自由工作
- 50-75%: 注意选择
- 75-90%: 必须 `/compact`
- 90%+: 必须 `/clear`

**Session Handoff**
```markdown
## Current State
- Goal: [目标]
- Status: [状态]

## Files Changed
- [文件]: [修改]

## Decisions
- [决策]: [理由]

## Next Steps
1. [下一步]
```

### 整合建议
**在 GSD 中实现:**
```javascript
// 消息轮数监控（替代 token 计数）
class ContextMonitor {
  constructor() {
    this.messageCount = 0;
    this.thresholds = {
      green: [0, 10],
      yellow: [10, 12],
      red: [12, 15]
    };
  }
  
  getStatus() {
    if (this.messageCount < 10) return 'green';
    if (this.messageCount < 12) return 'yellow';
    return 'red';
  }
}
```

---

## 案例 7: Spec Kit Verify Extension

### 来源
- **仓库**: ismaelJimenez/spec-kit-verify

### 核心机制
**实现证据检查**
- 检查每个 AC 有实现证据
- 验证代码符合 spec
- 生成验证报告

### 验证输出
```markdown
## Verification Report

### Findings
✅ All acceptance criteria have implementation evidence
⚠️ Missing documentation for AC-003
❌ Task T-005 incomplete (no test coverage)

### Recommendations
- Add docstrings to auth.ts
- Complete tests for edge cases
```

### 整合建议
**GSD 验证报告:**
```javascript
async function generateVerificationReport(changeId) {
  const spec = await readOpenspecSpec(changeId);
  const tasks = await readOpenspecTasks(changeId);
  const evidence = await collectEvidence(changeId);
  
  return {
    findings: [
      { type: 'pass', message: 'All ACs have evidence' },
      { type: 'warn', message: 'Missing docs for AC-003' },
      { type: 'fail', message: 'Task T-005 incomplete' }
    ],
    coverage: calculateCoverage(spec, tasks),
    recommendations: generateRecommendations(spec, tasks)
  };
}
```

---

## 案例 8: ai-agents PR Validation

### 来源
- **仓库**: rjmurillo/ai-agents
- **文件**: .github/workflows/ai-spec-validation.yml

### 核心机制
**PR 时 Spec 验证**
- 检查 spec 存在
- 验证实现符合 spec
- 生成验证报告评论

### Workflow
```yaml
name: AI Spec Validation
on: [pull_request]

jobs:
  validate:
    steps:
      - name: Check spec exists
        run: |
          if [ ! -f ".specs/current/spec.md" ]; then
            echo "No spec found"
            exit 1
          fi
      
      - name: Validate implementation
        run: npm run test:acceptance
        
      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Spec validation passed'
            })
```

### 整合建议
**GSD 审查时执行类似检查:**
```javascript
async function prStyleValidation(changeId) {
  const checks = {
    specExists: await checkSpecExists(changeId),
    acCovered: await checkAcCoverage(changeId),
    testsPass: await checkTestsPass(changeId),
    docsUpdated: await checkDocsUpdated(changeId)
  };
  
  const report = generateReport(checks);
  await postComment(changeId, report);
  
  return checks;
}
```

---

## 整合矩阵

| 案例 | 机制 | 整合点 | 优先级 |
|------|------|--------|--------|
| Liatrio | Planning Audit | GSD new-workspace | High |
| Spec Kit | PR Review Gate | GSD audit-change | High |
| SpecWeave | Layered Validation | GSD validation-gates | High |
| OpenCode | Passive Pipeline | Worktree checkpoint | Medium |
| GSD 2 | Auto Checkpoint | Context monitor | High |
| Claude Code | 80/20 Rule | Message thresholds | High |
| Spec Kit Verify | Evidence Check | GSD audit | Medium |
| ai-agents | PR Validation | GSD report | Medium |

---

## 参考文件清单

### 必须阅读
1. `liatrio-labs/spec-driven-workflow/prompts/SDD-2-generate-task-list-from-spec.md`
2. `gsd-build/get-shit-done/docs/configuration.md`
3. `Fission-AI/OpenSpec/docs/getting-started.md`

### 推荐阅读
4. `github/spec-kit/README.md`
5. `spec-weave.com/docs/workflows/validation/`
6. `code.claude.com/docs/en/best-practices`

### 参考实现
7. `.opencode/scripts/slice-one-runner.mjs`（当前）
8. `openspec-ob/active/changes/plan-opencode-multiagent-team-v3/design.md`

---

## 下一步

1. **研究这些案例**
   - 阅读参考文件
   - 理解核心机制
   - 提取可借鉴点

2. **设计整合方案**
   - 确定整合点
   - 设计接口
   - 编写伪代码

3. **迭代实现**
   - 每轮整合 1-2 个案例
   - 验证效果
   - 调整设计

**要我帮你开始研究第一个案例吗？**
