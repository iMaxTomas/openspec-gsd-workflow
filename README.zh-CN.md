# OpenSpec + GSD + Workflow

[English](README.md) | [简体中文](README.zh-CN.md)

[![Version](https://img.shields.io/badge/version-v0.3.0--advanced-blue)](https://github.com/iMaxTomas/openspec-gsd-workflow/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **一个面向 AI 辅助开发的工作流，集成自动上下文管理、规范驱动开发和 Git Worktree 隔离。**

这个项目把三个强力概念组合在一起，用来解决 AI 辅助开发中的上下文窗口问题：

- **OpenSpec**：用规范驱动开发，把需求讲清楚
- **GSD**：自动化 checkpoint 和 session 管理
- **Git Worktree**：隔离的开发上下文

## ✨ 功能特性

### 🔄 自动上下文管理

不用再因为上下文窗口限制而丢失工作进度。

- **消息计数**，带 3 段式提醒（🟢🟡🔴）
- **12+ 消息时自动 handoff**
- **自动创建 session worktree**，实现无缝续接
- **跨 session 保存状态**

```bash
# 监控你的上下文
node .opencode/scripts/context-monitor.mjs simulate

# 🟢 消息 1-9：自由工作
# 🟡 消息 10-11：准备 handoff
# 🔴 消息 12+：自动创建 worktree
```

### 🔍 规划审计

从一开始就用完整的规划检查保证质量：

- ✅ Proposal 完整性
- ✅ Design 决策已冻结
- ✅ Spec 覆盖率
- ✅ Task 拆分合理（< 2 小时）
- ✅ Evidence 规划

```bash
node .opencode/scripts/planning-audit.mjs my-change
```

### 🛡️ 三层验证门

既灵活又不阻塞开发的验证机制：

| Gate | 动作 | 说明 |
|------|------|------|
| **Advisory** | 仅报告 | 风格约定、最佳实践 |
| **Soft Fail** | 警告（可覆盖） | 任务大小、证据质量 |
| **Hard Fail** | 阻塞 | 缺失 spec、测试失败、安全问题 |

```bash
node .opencode/scripts/validation-gates.mjs my-change
```

### 🤖 Git Agent 自动化

自动化管理迭代流程：

```bash
./git-agent.sh start-iteration --name feature-auth --goal "Implement auth"
./git-agent.sh review
./git-agent.sh complete-iteration
```

### 🧠 ML 驱动建议

基于任务分析给出智能推荐：

- **复杂度估计**：预测任务难度与耗时
- **方案推荐**：建议更优开发路径
- **风险识别**：尽早发现潜在问题
- **Worktree 命名**：自动生成有意义的名称

```bash
# 分析一个任务
npm run ml:analyze -- "Implement user authentication"

# 获取 worktree 名称建议
npm run ml:worktree -- "Fix login bug"
```

### 🔮 预测性上下文管理

预测并优化上下文使用方式：

- **上下文耗尽预测**：提前知道什么时候会用完
- **Session 规划**：优化任务打包方式
- **Checkpoint 时机提醒**：智能提示什么时候该留断点
- **使用分析**：跟踪并持续优化效率

```bash
# 预测上下文耗尽
npm run predict -- 5 "Task 1" implementation "Task 2" testing

# 规划最优 session
npm run plan -- 60 "Feature A" high 3 "Bug fix" medium 2
```

### ⚡ 性能优化

优化你的工作流性能：

- **脚本分析**：测量执行时间和内存占用
- **代码分析**：找出可优化点
- **并行执行**：识别可并行的任务
- **缓存管理**：保持缓存高效

```bash
# 分析脚本性能
npm run perf:profile -- ./script.mjs

# 分析代码优化空间
npm run perf:analyze -- .opencode/scripts/context-monitor.mjs

# 生成性能报告
npm run perf:report
```

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/iMaxTomas/openspec-gsd-workflow.git
cd openspec-gsd-workflow
```

### 2. 测试 Context Monitor

```bash
node .opencode/scripts/context-monitor.mjs simulate
```

### 3. 创建一个 Change

```bash
./git-agent.sh start-iteration --name my-change --goal "Implement feature"
```

### 4. 运行 Planning Audit

```bash
node .opencode/scripts/planning-audit.mjs my-change
```

### 5. 在开发过程中监控上下文

```bash
node .opencode/scripts/context-monitor.mjs status my-change
```

## 📁 项目结构

```text
.
├── .gsd/
│   ├── context-rules.yaml          # 上下文阈值配置
│   └── validation-gates.yaml       # 验证门配置
│
├── .opencode/scripts/
│   ├── context-monitor.mjs         # 上下文监控与自动 handoff
│   ├── planning-audit.mjs          # 规划质量审计
│   ├── validation-gates.mjs        # 三层验证门
│   ├── ml-suggestions.mjs          # ML 建议
│   ├── predictive-context.mjs      # 预测性上下文管理
│   └── performance-optimizer.mjs   # 性能优化
│
├── scripts/
│   └── create-session-worktree.sh  # 自动创建会话 worktree
│
├── docs/
│   ├── CONTEXT-MONITOR.md          # 使用指南
│   └── EXAMPLE-WORKFLOW.md         # 完整示例
│
├── tests/
│   └── context-monitor.test.mjs    # 测试套件
│
└── git-agent.sh                    # Git 自动化工具
```

## 🏗️ 架构

这个项目实现了一个**三层架构**：

### 第 1 层：OpenSpec（Specification）
- 定义你要构建什么
- 冻结需求与决策
- 用 delta specs 跟踪变更

### 第 2 层：GSD（Process）
- 管理 session 生命周期
- 自动创建 checkpoint
- 监控上下文并发出提醒

### 第 3 层：Worktree（Isolation）
- 隔离的开发上下文
- 无缝切换 session
- 共享代码但隔离状态

### 第 4 层：Intelligence（Advanced）
- ML 驱动建议
- 预测性上下文管理
- 性能优化

## 📖 文档

- [架构总览](ARCHITECTURE-PLAN.md)
- [实施路线图](IMPLEMENTATION-PLAN.md)
- [Context Monitor 指南](docs/CONTEXT-MONITOR.md)
- [完整工作流示例](docs/EXAMPLE-WORKFLOW.md)
- [AI Dialogue Modes Canvas (EN)](docs/AI-DIALOGUE-MODES-CANVAS.md)
- [AI 对话使用方式白板 (ZH-CN)](docs/AI-DIALOGUE-MODES-CANVAS.zh-CN.md)
- [最终总结](FINAL-SUMMARY.md)

## 🎯 使用场景

### 长时运行的 AI Session
AI 编码助手的上下文窗口有限。这个工作流会自动：
- 监控上下文使用情况
- 在合适时机创建 checkpoint
- 切换到新的隔离 session
- 保留全部状态

### 规范驱动开发
从一开始就确保质量：
- 在实现前审计计划
- 按 spec 做验证
- 为每个 task 跟踪 evidence

### 并行开发
同时处理多个功能：
- 每个 change 拥有独立 worktree
- 隔离上下文，避免互相干扰
- 在不同 feature 之间轻松切换

### 智能规划
用 ML 提升规划质量：
- 估计任务复杂度
- 提前识别风险
- 优化 session 结构
- 从过去的 session 中学习

## 🏆 来自社区的最佳实践

这个项目整合了以下来源的最佳实践：

- **Claude Code**：上下文管理的 80/20 规则
- **GSD 2**：自动 checkpoint 创建
- **Liatrio**：规划审计门
- **SpecWeave**：分层验证
- **OpenCode**：被动状态流水线

## 📊 项目数据

- **开发时间**：约 4 小时
- **迭代次数**：已完成 5 轮
- **创建文件数**：25+
- **代码行数**：4000+
- **测试覆盖**：核心模块
- **高级特性**：ML 建议、预测性上下文、性能优化

## 🔧 环境要求

- Node.js 18+
- Git 2.30+
- Bash 5.0+

## 🤝 贡献

欢迎贡献。可以继续改进的方向包括：

- [x] 实现 `/gsd-pause-work` 和 `/gsd-resume-work`
- [x] 集成 CI/CD
- [ ] 创建 VS Code 扩展
- [x] 增加 ML 驱动建议
- [x] 增加预测性上下文管理
- [x] 增加性能优化
- [ ] 增加更多测试覆盖
- [ ] 改善错误恢复

## 📄 许可证

MIT License，欢迎使用、修改与分发。

## 🙏 致谢

感谢以下项目提供启发：
- Claude Code team
- GSD 2 project
- Liatrio Labs
- SpecWeave
- OpenCode community

---

**为更好的 AI 辅助开发而构建**

*上下文管理应该是自动的，而不是手动的。*
