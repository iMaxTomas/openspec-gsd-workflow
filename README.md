# OpenSpec + GSD + Workflow

[![Version](https://img.shields.io/badge/version-v0.3.0--advanced-blue)](https://github.com/iMaxTomas/openspec-gsd-workflow/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **AI-assisted development workflow with automatic context management, spec-driven development, and git worktree isolation.**

This project integrates three powerful concepts to solve the context window problem in AI-assisted development:

- **OpenSpec**: Spec-driven development for clear requirements
- **GSD**: Automatic checkpoint and session management
- **Git Worktree**: Isolated development contexts

## ✨ Features

### 🔄 Automatic Context Management

Never lose track of your work due to context window limits again!

- **Message counting** with 3-stage alerts (🟢🟡🔴)
- **Automatic handoff** at 12+ messages
- **Session worktree creation** for seamless continuation
- **State preservation** across sessions

```bash
# Monitor your context
node .opencode/scripts/context-monitor.mjs simulate

# 🟢 Messages 1-9: Work freely
# 🟡 Messages 10-11: Prepare for handoff
# 🔴 Messages 12+: Automatic worktree creation
```

### 🔍 Planning Audit

Ensure quality from the start with comprehensive planning checks:

- ✅ Proposal completeness
- ✅ Design decisions frozen
- ✅ Spec coverage
- ✅ Task decomposition (< 2 hours)
- ✅ Evidence planning

```bash
node .opencode/scripts/planning-audit.mjs my-change
```

### 🛡️ Three-Layer Validation Gates

Flexible validation that doesn't block development:

| Gate | Action | Description |
|------|--------|-------------|
| **Advisory** | Report only | Style conventions, best practices |
| **Soft Fail** | Warning (overridable) | Task size, evidence quality |
| **Hard Fail** | Block | Missing specs, failing tests, security issues |

```bash
node .opencode/scripts/validation-gates.mjs my-change
```

### 🤖 Git Agent Automation

Automated iteration management:

```bash
./git-agent.sh start-iteration --name feature-auth --goal "Implement auth"
./git-agent.sh review
./git-agent.sh complete-iteration
```

### 🧠 ML-Powered Suggestions

Intelligent recommendations based on task analysis:

- **Complexity estimation** - Predict task difficulty and time
- **Approach recommendations** - Suggest optimal development lane
- **Risk identification** - Detect potential issues early
- **Worktree naming** - Auto-generate meaningful names

```bash
# Analyze a task
npm run ml:analyze -- "Implement user authentication"

# Get worktree name suggestion
npm run ml:worktree -- "Fix login bug"
```

### 🔮 Predictive Context Management

Predict and optimize context usage:

- **Exhaustion prediction** - Know when you'll run out of context
- **Session planning** - Optimize task batching
- **Checkpoint timing** - Smart reminders for checkpoints
- **Usage analytics** - Track and improve efficiency

```bash
# Predict context exhaustion
npm run predict -- 5 "Task 1" implementation "Task 2" testing

# Plan optimal session
npm run plan -- 60 "Feature A" high 3 "Bug fix" medium 2
```

### ⚡ Performance Optimization

Optimize your workflow performance:

- **Script profiling** - Measure execution time and memory
- **Code analysis** - Find optimization opportunities
- **Parallel execution** - Identify tasks that can run in parallel
- **Cache management** - Keep caches efficient

```bash
# Profile a script
npm run perf:profile -- ./script.mjs

# Analyze code for optimizations
npm run perf:analyze -- .opencode/scripts/context-monitor.mjs

# Generate performance report
npm run perf:report
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/iMaxTomas/openspec-gsd-workflow.git
cd openspec-gsd-workflow
```

### 2. Test Context Monitor

```bash
node .opencode/scripts/context-monitor.mjs simulate
```

### 3. Create a Change

```bash
./git-agent.sh start-iteration --name my-change --goal "Implement feature"
```

### 4. Run Planning Audit

```bash
node .opencode/scripts/planning-audit.mjs my-change
```

### 5. Monitor Context During Development

```bash
node .opencode/scripts/context-monitor.mjs status my-change
```

## 📁 Project Structure

```
.
├── .gsd/
│   ├── context-rules.yaml          # Context threshold configuration
│   └── validation-gates.yaml       # Validation gate configuration
│
├── .opencode/scripts/
│   ├── context-monitor.mjs         # Context monitoring & auto-handoff
│   ├── planning-audit.mjs          # Planning quality audit
│   ├── validation-gates.mjs        # Three-layer validation
│   ├── ml-suggestions.mjs          # ML-powered task suggestions
│   ├── predictive-context.mjs      # Predictive context management
│   └── performance-optimizer.mjs   # Performance optimization
│
├── scripts/
│   └── create-session-worktree.sh  # Automatic worktree creation
│
├── docs/
│   ├── CONTEXT-MONITOR.md          # Usage guide
│   └── EXAMPLE-WORKFLOW.md         # Complete example
│
├── tests/
│   └── context-monitor.test.mjs    # Test suite
│
└── git-agent.sh                    # Git automation tool
```

## 🏗️ Architecture

This project implements a **three-layer architecture**:

### Layer 1: OpenSpec (Specification)
- Define what you're building
- Freeze requirements and decisions
- Track changes with delta specs

### Layer 2: GSD (Process)
- Manage session lifecycle
- Automatic checkpoint creation
- Context monitoring and alerts

### Layer 3: Worktree (Isolation)
- Isolated development contexts
- Seamless session switching
- Shared code with isolated state

### Layer 4: Intelligence (Advanced)
- ML-powered suggestions
- Predictive context management
- Performance optimization

## 📖 Documentation

- [Architecture Overview](ARCHITECTURE-PLAN.md)
- [Implementation Roadmap](IMPLEMENTATION-PLAN.md)
- [Context Monitor Guide](docs/CONTEXT-MONITOR.md)
- [Example Workflow](docs/EXAMPLE-WORKFLOW.md)
- [Final Summary](FINAL-SUMMARY.md)

## 🎯 Use Cases

### Long-Running AI Sessions
AI coding assistants have limited context windows. This workflow automatically:
- Monitors context usage
- Creates checkpoints at the right time
- Switches to new isolated sessions
- Preserves all state

### Spec-Driven Development
Ensure quality from the start:
- Audit plans before implementation
- Validate against specs
- Track evidence for each task

### Parallel Development
Work on multiple features simultaneously:
- Each change gets its own worktree
- Isolated contexts prevent interference
- Easy switching between features

### Intelligent Planning
Leverage ML for better planning:
- Estimate task complexity
- Identify risks early
- Optimize session structure
- Learn from past sessions

## 🏆 Best Practices from Community

This project integrates best practices from:

- **Claude Code**: 80/20 rule for context management
- **GSD 2**: Automatic checkpoint creation
- **Liatrio**: Planning audit gates
- **SpecWeave**: Layered validation
- **OpenCode**: Passive state pipeline

## 📊 Project Stats

- **Development Time**: ~4 hours
- **Iterations**: 5 complete
- **Files Created**: 25+
- **Lines of Code**: 4000+
- **Test Coverage**: Core modules
- **Advanced Features**: ML suggestions, predictive context, performance optimization

## 🔧 Requirements

- Node.js 18+
- Git 2.30+
- Bash 5.0+

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [x] Implement `/gsd-pause-work` and `/gsd-resume-work` commands
- [x] Add CI/CD integration
- [ ] Create VS Code extension
- [x] Add ML-powered suggestions
- [x] Add predictive context management
- [x] Add performance optimization
- [ ] Add more test coverage
- [ ] Improve error recovery

## 📄 License

MIT License - feel free to use, modify, and distribute!

## 🙏 Acknowledgments

Thanks to these projects for inspiration:
- Claude Code team
- GSD 2 project
- Liatrio Labs
- SpecWeave
- OpenCode community

---

**Made with ❤️ for better AI-assisted development**

*Context management should be automatic, not manual.*
