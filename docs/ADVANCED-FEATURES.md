# Advanced Features Guide

This guide covers the advanced features of OpenSpec + GSD + Workflow: ML-powered suggestions, predictive context management, and performance optimization.

## Table of Contents

- [ML-Powered Suggestions](#ml-powered-suggestions)
- [Predictive Context Management](#predictive-context-management)
- [Performance Optimization](#performance-optimization)
- [Integration Examples](#integration-examples)

---

## ML-Powered Suggestions

The ML Suggestions module analyzes your tasks and provides intelligent recommendations.

### Basic Usage

```bash
# Analyze a task
npm run ml:analyze -- "Implement user authentication"

# Get worktree name suggestion
npm run ml:worktree -- "Fix critical login bug"

# Record session for learning
npm run ml:record -- iteration-6 "Add tests and documentation"
```

### Features

#### 1. Complexity Estimation

Automatically estimates task complexity based on keywords:

```bash
$ npm run ml:analyze -- "Refactor the entire database layer"

📊 Complexity Estimate:
   Level: HIGH
   Score: 8/10
   Estimated: 4-8 hours
```

**Complexity Indicators:**
- **High**: refactor, architecture, migrate, rewrite, implement
- **Medium**: add, update, modify, fix, improve
- **Low**: update, change, tweak, adjust, format

#### 2. Approach Recommendations

Suggests the optimal development approach:

```bash
🎯 Recommended Approach:
   Type: feature
   Suggested Lane: research
   Steps:
   1. Define requirements
   2. Create spec/proposal
   3. Design architecture
   4. Implement incrementally
   5. Add tests
   6. Document changes
```

**Approach Types:**
- **Feature**: Research → Design → Implement → Test
- **Bugfix**: Reproduce → Identify → Fix → Test
- **Refactoring**: Analyze → Plan → Change → Verify

#### 3. Risk Identification

Detects potential risks early:

```bash
⚠️  Potential Risks:
   • Security implications
     Mitigation: Security review required
   • Database migration complexity
     Mitigation: Test migrations thoroughly, backup data
```

**Risk Patterns:**
- Security: auth, security, permission
- Database: database, schema, migration
- API Changes: api, interface
- Performance: performance, scale
- Legacy: legacy, old, deprecated

#### 4. Checkpoint Timing

Suggests optimal checkpoint times:

```bash
⏰ Checkpoint Timing:
   Initial: After requirements/spec complete
   Intermediate: Every 2-3 hours or major milestone
   Final: Before final review and merge
```

#### 5. Worktree Naming

Auto-generates meaningful worktree names:

```bash
$ npm run ml:worktree -- "Implement user authentication"
implement-user-authentication-1775860714749
```

---

## Predictive Context Management

Predict and optimize your context usage before you run out.

### Basic Usage

```bash
# Predict context exhaustion
npm run predict -- 5 "Task 1" implementation "Task 2" testing

# Plan optimal session
npm run plan -- 60 "Feature A" high 3 "Bug fix" medium 2

# View usage statistics
npm run predict:stats
```

### Features

#### 1. Exhaustion Prediction

Predicts when you'll run out of context:

```bash
$ npm run predict -- 8 "Implement auth" implementation "Write tests" testing

🔮 Predictive Context Analysis

Current Messages: 8/15
Remaining Capacity: 7 messages
Estimated Tasks Remaining: 2
Time Until Exhaustion: ~84 minutes
Risk Level: MEDIUM
```

#### 2. Task Impact Analysis

Analyzes how pending tasks affect context:

```bash
📋 Task Impact Analysis:
   Total Estimated Messages: 10
   • Implement auth: ~6 messages (implementation)
   • Write tests: ~4 messages (testing)
```

**Complexity Weights:**
- Research: 2 messages
- Implementation: 3 messages
- Refactoring: 4 messages
- Debugging: 2 messages
- Documentation: 1 message
- Testing: 2 messages

#### 3. Smart Recommendations

Provides actionable recommendations:

```bash
💡 Recommendations:
   🟡 [HIGH] Plan checkpoint within next 2-3 tasks
      Approaching context warning threshold
   🟢 [MEDIUM] Complete max 3 tasks in current session
      Leave buffer for unexpected complexity
```

#### 4. Optimal Session Planning

Plans your session for maximum efficiency:

```bash
$ npm run plan -- 120 "Feature A" high 3 "Bug fix" medium 2 "Docs" low 1

📅 Optimal Session Plan

Available Time: 120 minutes
Message Capacity: 10 messages
Recommended Tasks: 3
Efficiency: A - Excellent efficiency

✅ Tasks in This Session:
   1. Feature A (high)
   2. Bug fix (medium)
   3. Docs (low)

⏳ Tasks Deferred to Next Session:
   (none)

⏰ Checkpoint Schedule:
   • After 36 minutes (30% time elapsed)
   • After 72 minutes (60% time elapsed)
   • After 102 minutes (Before session end)
```

#### 5. Usage Statistics

Track and improve your efficiency:

```bash
📊 Context Usage Statistics

Average Usage:
   Messages per Hour: 5
   Average Session: 35 minutes

Peak Activity Hours: 9, 14, 20

Total Sessions: 25
Context Exhaustions: 3
Exhaustion Rate: 12%
```

---

## Performance Optimization

Optimize your workflow and script performance.

### Basic Usage

```bash
# Profile a script
npm run perf:profile -- ./script.mjs

# Analyze code for optimizations
npm run perf:analyze -- .opencode/scripts/context-monitor.mjs

# View cache status
npm run perf:cache

# Generate performance report
npm run perf:report
```

### Features

#### 1. Script Profiling

Measure execution time and memory:

```bash
$ npm run perf:profile -- .opencode/scripts/context-monitor.mjs

Execution time: 45ms
Memory delta: {"heapUsed":2048000,"external":102400}
```

#### 2. Code Analysis

Find optimization opportunities:

```bash
$ npm run perf:analyze -- .opencode/scripts/example.mjs

📊 Analysis: example.mjs
Lines: 150 | Size: 4500 bytes
Score: B

Optimizations Found:
   🟡 [MEDIUM] Array.push() in loops can cause reallocations
      → Pre-allocate array size if known, or use Array.from()
      Line: 45
   🟡 [MEDIUM] Regex compilation inside loops
      → Compile regex outside loop: const regex = /pattern/
      Line: 62
```

**Detected Patterns:**
- Synchronous operations in loops
- Inefficient array operations
- Regex compilation in loops
- JSON.parse in loops
- Large file sizes

#### 3. Parallel Execution

Identify tasks that can run in parallel:

```bash
$ npm run perf:parallel -- task1 5 "" task2 3 "" task3 10 task1

🔄 Parallelization Recommendations

Parallelizable: 2
Sequential: 1
Time Savings: 3 minutes (30%)
```

#### 4. Cache Management

Keep caches efficient:

```bash
$ npm run perf:cache

💾 Cache Status

Total Files: 15
Total Size: 2.3MB
Stale Files: 2
```

#### 5. Performance Report

Generate comprehensive reports:

```bash
$ npm run perf:report

⚡ Performance Report

Summary:
   Total Script Runs: 50
   Average Execution: 120ms
   Cache Hit Rate: 85%
   Total Time: 6s

🐌 Slowest Scripts:
   • validation-gates.mjs: 450ms
   • planning-audit.mjs: 380ms

💡 Recommendations:
   [HIGH] Multiple slow script executions detected
   → Profile scripts and optimize hot paths
```

---

## Integration Examples

### Example 1: Starting a New Feature

```bash
# 1. Analyze the task
npm run ml:analyze -- "Implement real-time notifications"

# 2. Check current context
node .opencode/scripts/context-monitor.mjs status

# 3. Predict if we have enough context
npm run predict -- 3 "Setup websocket" implementation "Add UI" implementation

# 4. Start the iteration
./git-agent.sh start-iteration --name notifications --goal "Implement real-time notifications"
```

### Example 2: Optimizing Existing Code

```bash
# 1. Analyze performance
npm run perf:analyze -- ./slow-script.mjs

# 2. Profile it
npm run perf:profile -- ./slow-script.mjs

# 3. Check if changes affect context usage
npm run predict -- 10 "Optimize script" refactoring
```

### Example 3: Planning a Long Session

```bash
# 1. Plan optimal session
npm run plan -- 180 "Task 1" high 3 "Task 2" medium 2 "Task 3" low 1

# 2. Monitor during development
node .opencode/scripts/context-monitor.mjs status

# 3. Check predictions
npm run predict -- 8 "Remaining task" implementation
```

### Example 4: Complete Workflow

```bash
#!/bin/bash
# complete-workflow.sh

TASK="Implement user dashboard with analytics"

# Step 1: Analyze
npm run ml:analyze -- "$TASK"

# Step 2: Get worktree name
WORKTREE=$(npm run ml:worktree -- "$TASK" 2>/dev/null | tail -1)

# Step 3: Check context
node .opencode/scripts/context-monitor.mjs status

# Step 4: Predict usage
npm run predict -- 2 "$TASK" implementation

# Step 5: Start iteration
./git-agent.sh start-iteration --name "$WORKTREE" --goal "$TASK"
```

---

## Best Practices

### 1. Always Analyze Before Starting

```bash
# Good: Analyze first
npm run ml:analyze -- "Your task"
# Then start development

# Bad: Start without analysis
./git-agent.sh start-iteration --name task --goal "Your task"
```

### 2. Monitor Context Regularly

```bash
# Check every few tasks
node .opencode/scripts/context-monitor.mjs status

# Predict before adding more tasks
npm run predict -- <current-count> "New task" implementation
```

### 3. Use Checkpoints Wisely

```bash
# Plan checkpoints based on complexity
npm run plan -- 120 "Task 1" high 3 "Task 2" medium 2

# Follow the checkpoint schedule
```

### 4. Optimize Before Committing

```bash
# Profile before committing
npm run perf:profile -- ./your-script.mjs

# Analyze for issues
npm run perf:analyze -- ./your-script.mjs
```

### 5. Record Sessions for Learning

```bash
# Record completed sessions
npm run ml:record -- iteration-name "Goal description"

# View statistics
npm run predict:stats
```

---

## Troubleshooting

### ML Suggestions Not Working

```bash
# Check if data directory exists
ls -la .opencode/ml-data/

# Reset if needed
rm -rf .opencode/ml-data/
```

### Predictions Seem Off

```bash
# Record more sessions to improve accuracy
npm run ml:record -- session-name "Description"
npm run predict:record -- 10 30 2 implementation
```

### Performance Issues

```bash
# Clear cache
rm -rf .opencode/cache/

# Generate report
npm run perf:report
```

---

## Next Steps

- Read the [Context Monitor Guide](CONTEXT-MONITOR.md)
- Check out the [Example Workflow](EXAMPLE-WORKFLOW.md)
- Review the [Architecture Overview](../ARCHITECTURE-PLAN.md)

---

**Happy coding with intelligent workflow management!** 🚀
