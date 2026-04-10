# Context Monitor 使用指南

## 概述

Context Monitor 实现了基于消息轮数的上下文管理，参考 Claude Code 的 80/20 规则和 GSD 2 的自动检查点机制。

## 阈值规则

| 状态 | 消息数 | 颜色 | 行动 |
|------|--------|------|------|
| 🟢 Healthy | 0-9 | 绿色 | 自由工作 |
| 🟡 Attention | 10-11 | 黄色 | 准备 handoff |
| 🔴 Critical | 12+ | 红色 | 自动创建 checkpoint |

## 使用方法

### 1. 查看当前状态

```bash
node .opencode/scripts/context-monitor.mjs status [change-id]
```

**示例输出**:
```
=== Context Monitor Status ===
🟢 Status: GREEN
📊 Messages: 5/15
💬 Context healthy
🎯 Action: Work freely
================================
```

### 2. 记录消息

```bash
node .opencode/scripts/context-monitor.mjs message [change-id] [content]
```

**示例**:
```bash
node .opencode/scripts/context-monitor.mjs message my-change "Implement auth"
# 🟢 Message 1/15
```

### 3. 重置计数器

```bash
node .opencode/scripts/context-monitor.mjs reset [change-id]
```

### 4. 模拟测试

```bash
node .opencode/scripts/context-monitor.mjs simulate [change-id]
```

这会模拟 15 轮对话，展示不同状态的触发。

## 自动触发机制

当消息数达到 12 轮时，会自动：

1. 🚨 显示红色警告
2. 📝 触发 `/gsd-pause-work`
3. 🔄 创建新的 session worktree
4. 📋 生成 handoff 文档
5. 🔗 链接 openspec-ob

**用户需要做的**:
```bash
# 1. 切换到新 worktree（系统会显示路径）
cd ~/gsd-workspaces/opencode-lab/change-001-session-...

# 2. 恢复工作
/gsd-resume-work

# 3. 继续开发
```

## 配置文件

编辑 `.gsd/context-rules.yaml` 自定义阈值：

```yaml
thresholds:
  green:
    range: [0, 10]
    status: "healthy"
    action: "work_freely"
    
  yellow:
    range: [10, 12]
    status: "attention"
    action: "prepare_handoff"
    
  red:
    range: [12, 15]
    status: "critical"
    action: "create_checkpoint"
```

## 状态文件

监控状态保存在：
```
.opencode/passive/context-monitor-{change-id}.json
```

**示例内容**:
```json
{
  "changeId": "my-change",
  "messageCount": 5,
  "lastUpdate": "2026-04-10T18:00:00Z",
  "status": "green"
}
```

## 测试

运行测试套件：

```bash
node tests/context-monitor.test.mjs
```

## 常见问题

### Q: 为什么不使用 token 计数？
**A**: Token 计数依赖具体模型实现，消息轮数更通用且易于理解。

### Q: 达到限制后必须切换吗？
**A**: 不强制，但强烈建议。继续对话会导致上下文质量下降。

### Q: 可以禁用自动触发吗？
**A**: 编辑 `.gsd/context-rules.yaml` 设置 `auto_compact: false`。

### Q: 如何手动创建 session worktree？
**A**: 
```bash
./scripts/create-session-worktree.sh \
  opencode-lab \
  change-001 \
  /path/to/current/worktree
```

## 最佳实践

1. **10 轮时准备**: 开始考虑当前子任务是否快完成
2. **12 轮时行动**: 尽快完成或创建 checkpoint
3. **定期检查状态**: 每 5 轮检查一次状态
4. **保持 worktree 整洁**: 及时清理旧的 session worktree

## 故障排除

### 问题: "Script not found"
**解决**: 确保从项目根目录运行命令

### 问题: "Failed to create worktree"
**解决**: 
1. 检查是否有未提交的修改
2. 手动运行脚本查看详细错误
3. 确保有足够的磁盘空间

### 问题: 状态没有保存
**解决**: 检查 `.opencode/passive/` 目录是否存在且可写

## 相关命令

- `node .opencode/scripts/context-monitor.mjs` - 上下文监控
- `./scripts/create-session-worktree.sh` - 创建会话工作区
- `./git-agent.sh status` - 查看 Git Agent 状态
- `/gsd-pause-work` - 手动创建检查点
- `/gsd-resume-work` - 从检查点恢复
