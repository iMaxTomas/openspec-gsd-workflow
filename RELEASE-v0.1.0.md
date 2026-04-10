# v0.1.0 MVP - Context-Aware AI Development Workflow

🎉 **First Release: MVP Complete**

This release introduces a complete AI-assisted development workflow that solves the context window problem through automatic session management, spec-driven development, and git worktree isolation.

## ✨ Major Features

### 1. Automatic Context Management
- **Message counting** with visual indicators (🟢🟡🔴)
- **3-stage alerts**: Healthy (0-9), Attention (10-11), Critical (12+)
- **Automatic worktree creation** when context limit reached
- **State preservation** across sessions

### 2. Planning Audit
Comprehensive 5-point quality check before implementation:
- ✅ Proposal completeness
- ✅ Design decisions frozen  
- ✅ Spec coverage
- ✅ Task decomposition (< 2 hours)
- ✅ Evidence planning

### 3. Three-Layer Validation Gates
Flexible validation system:
- **Advisory**: Report only (style, conventions)
- **Soft Fail**: Warning with override option (task size, evidence)
- **Hard Fail**: Blocking (missing specs, failing tests, security)

### 4. Git Agent Automation
Automated iteration management with:
- Iteration tracking
- Code review automation
- Status monitoring
- Tag management

## 🚀 Quick Start

```bash
# Test context monitoring
node .opencode/scripts/context-monitor.mjs simulate

# Run planning audit
node .opencode/scripts/planning-audit.mjs my-change

# Run validation gates  
node .opencode/scripts/validation-gates.mjs my-change

# Manage with Git Agent
./git-agent.sh start-iteration --name feature --goal "..."
```

## 📊 Stats

- **Development Time**: ~3.5 hours
- **Iterations**: 2 complete
- **Files**: 20+
- **Code Lines**: 3000+
- **Tests**: ✅ Core modules covered

## 🏗️ Architecture

Three-layer design integrating:
- **OpenSpec**: Specification layer (what to build)
- **GSD**: Process layer (how to manage)
- **Worktree**: Isolation layer (where to work)

## 📚 Documentation

- [README](README.md) - Overview and quick start
- [Architecture Plan](ARCHITECTURE-PLAN.md) - Design decisions
- [Context Monitor Guide](docs/CONTEXT-MONITOR.md) - Usage details
- [Example Workflow](docs/EXAMPLE-WORKFLOW.md) - Step-by-step example

## 🙏 Community Inspiration

This project integrates best practices from:
- Claude Code (80/20 context rule)
- GSD 2 (auto checkpoint)
- Liatrio Labs (planning audit)
- SpecWeave (layered validation)
- OpenCode (passive state)

## 🔮 What's Next

See [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) for upcoming features:
- `/gsd-pause-work` and `/gsd-resume-work` commands
- CI/CD integration
- VS Code extension
- Advanced error recovery

---

**Full Changelog**: Compare with initial commit
