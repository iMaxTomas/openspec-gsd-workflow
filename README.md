# OpenSpec + GSD + Workflow

[![Version](https://img.shields.io/badge/version-v0.1.0--mvp-blue)](https://github.com/iMaxTomas/openspec-gsd-workflow/releases)
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
│   └── validation-gates.mjs        # Three-layer validation
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

## 🏆 Best Practices from Community

This project integrates best practices from:

- **Claude Code**: 80/20 rule for context management
- **GSD 2**: Automatic checkpoint creation
- **Liatrio**: Planning audit gates
- **SpecWeave**: Layered validation
- **OpenCode**: Passive state pipeline

## 📊 Project Stats

- **Development Time**: ~3.5 hours
- **Iterations**: 2 complete
- **Files Created**: 20+
- **Lines of Code**: 3000+
- **Test Coverage**: Core modules

## 🔧 Requirements

- Node.js 18+
- Git 2.30+
- Bash 5.0+

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- [ ] Implement `/gsd-pause-work` and `/gsd-resume-work` commands
- [ ] Add CI/CD integration
- [ ] Create VS Code extension
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
