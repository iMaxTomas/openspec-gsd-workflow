#!/bin/bash
# Git Agent 自动化跟进脚本
# 用于 OpenSpec + GSD + Worktree 三位一体项目

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
PROJECT_NAME="opencode-lab"
ITERATION_PREFIX="iteration"
MANIFEST_FILE=".git-agent/manifest.json"
REVIEW_LOG=".git-agent/review-log.md"

# 初始化 Git Agent
init() {
    echo -e "${BLUE}🚀 初始化 Git Agent...${NC}"
    
    mkdir -p .git-agent
    
    # 创建 manifest
    cat > "$MANIFEST_FILE" << 'EOF'
{
  "project": "opencode-lab",
  "currentIteration": null,
  "iterations": [],
  "completedPhases": [],
  "pendingReviews": [],
  "metrics": {
    "totalCommits": 0,
    "totalReviews": 0,
    "issuesFound": 0,
    "issuesFixed": 0
  }
}
EOF
    
    # 创建 review log
    cat > "$REVIEW_LOG" << 'EOF'
# Git Agent Review Log

## 项目: opencode-lab
## 架构: OpenSpec + GSD + Worktree

---

EOF
    
    # Git 钩子
    setup_hooks
    
    echo -e "${GREEN}✅ Git Agent 初始化完成${NC}"
    echo ""
    echo "使用方法:"
    echo "  ./git-agent.sh start-iteration --name 1-infrastructure --goal '创建基础 worktree'"
    echo "  ./git-agent.sh review"
    echo "  ./git-agent.sh complete-iteration"
}

# 设置 Git 钩子
setup_hooks() {
    mkdir -p .git/hooks
    
    # post-commit 钩子
    cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
# Git Agent Post-Commit Hook

if [ -f .git-agent/manifest.json ]; then
    echo "🤖 Git Agent: 检测到提交，建议运行审查"
    echo "   运行: ./git-agent.sh review"
fi
EOF
    chmod +x .git/hooks/post-commit
    
    echo -e "${GREEN}✅ Git 钩子已设置${NC}"
}

# 开始新迭代
start_iteration() {
    local name=""
    local goal=""
    
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --name)
                name="$2"
                shift 2
                ;;
            --goal)
                goal="$2"
                shift 2
                ;;
            *)
                shift
                ;;
        esac
    done
    
    if [ -z "$name" ] || [ -z "$goal" ]; then
        echo -e "${RED}❌ 错误: 需要提供 --name 和 --goal${NC}"
        echo "用法: ./git-agent.sh start-iteration --name 1-infrastructure --goal '创建基础 worktree'"
        exit 1
    fi
    
    echo -e "${BLUE}🎯 开始迭代: $name${NC}"
    echo "目标: $goal"
    
    # 创建分支
    local branch="${ITERATION_PREFIX}/${name}"
    git checkout -b "$branch"
    
    # 更新 manifest
    node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
const iteration = {
  id: '$name',
  branch: '$branch',
  goal: '$goal',
  status: 'in-progress',
  startedAt: new Date().toISOString(),
  commits: [],
  reviews: [],
  blockers: []
};
manifest.currentIteration = '$name';
manifest.iterations.push(iteration);
fs.writeFileSync('$MANIFEST_FILE', JSON.stringify(manifest, null, 2));
"
    
    echo -e "${GREEN}✅ 迭代 $name 已开始${NC}"
    echo "分支: $branch"
    echo ""
    echo "下一步:"
    echo "  1. 开始开发"
    echo "  2. 定期提交: git commit -m '...'"
    echo "  3. 运行审查: ./git-agent.sh review"
}

# 审查当前代码
review() {
    echo -e "${BLUE}🔍 Git Agent 开始审查...${NC}"
    
    # 获取当前迭代
    local current=$(node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
console.log(manifest.currentIteration || 'none');
")
    
    if [ "$current" = "none" ]; then
        echo -e "${YELLOW}⚠️  没有活跃的迭代，请先开始迭代${NC}"
        exit 1
    fi
    
    echo "审查迭代: $current"
    echo ""
    
    # 运行检查
    local issues=()
    
    # 检查 1: 文件结构
    echo -e "${BLUE}检查 1/5: 文件结构...${NC}"
    if [ ! -d "openspec-ob/active/changes" ]; then
        issues+=("缺少 openspec-ob/active/changes 目录")
    fi
    if [ ! -d ".gsd" ]; then
        issues+=("缺少 .gsd 目录")
    fi
    
    # 检查 2: 代码风格
    echo -e "${BLUE}检查 2/5: 代码风格...${NC}"
    if command -v shellcheck &> /dev/null; then
        for file in scripts/*.sh; do
            if [ -f "$file" ]; then
                if ! shellcheck "$file" 2>/dev/null; then
                    issues+=("ShellCheck 警告: $file")
                fi
            fi
        done
    fi
    
    # 检查 3: 文档完整性
    echo -e "${BLUE}检查 3/5: 文档完整性...${NC}"
    if [ ! -f "ARCHITECTURE-PLAN.md" ]; then
        issues+=("缺少 ARCHITECTURE-PLAN.md")
    fi
    if [ ! -f "IMPLEMENTATION-PLAN.md" ]; then
        issues+=("缺少 IMPLEMENTATION-PLAN.md")
    fi
    
    # 检查 4: 测试（如果有）
    echo -e "${BLUE}检查 4/5: 测试状态...${NC}"
    if [ -f "package.json" ]; then
        if npm test 2>/dev/null; then
            echo -e "${GREEN}✅ 测试通过${NC}"
        else
            issues+=("测试失败或未配置")
        fi
    fi
    
    # 检查 5: 提交信息
    echo -e "${BLUE}检查 5/5: 提交信息...${NC}"
    local last_commit=$(git log -1 --pretty=format:"%s")
    if [[ ! "$last_commit" =~ ^\[iteration-[0-9]+\] ]]; then
        issues+=("提交信息格式建议: [iteration-N] 描述")
    fi
    
    # 生成报告
    echo ""
    echo "================================"
    echo -e "${BLUE}审查报告${NC}"
    echo "================================"
    echo "迭代: $current"
    echo "时间: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo ""
    
    if [ ${#issues[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ 所有检查通过！${NC}"
        
        # 更新 manifest
        node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
const iteration = manifest.iterations.find(i => i.id === '$current');
if (iteration) {
  iteration.reviews.push({
    timestamp: new Date().toISOString(),
    status: 'passed',
    issues: []
  });
  manifest.metrics.totalReviews++;
  fs.writeFileSync('$MANIFEST_FILE', JSON.stringify(manifest, null, 2));
}
"
    else
        echo -e "${YELLOW}⚠️  发现 ${#issues[@]} 个问题:${NC}"
        echo ""
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
        echo ""
        
        # 更新 manifest
        node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
const iteration = manifest.iterations.find(i => i.id === '$current');
if (iteration) {
  iteration.reviews.push({
    timestamp: new Date().toISOString(),
    status: 'issues-found',
    issues: $(printf '%s\n' '${issues[@]}' | jq -R . | jq -s .)
  });
  manifest.metrics.totalReviews++;
  manifest.metrics.issuesFound += ${#issues[@]};
  fs.writeFileSync('$MANIFEST_FILE', JSON.stringify(manifest, null, 2));
}
"
        
        # 追加到 review log
        {
            echo "## Review: $current"
            echo "时间: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
            echo "状态: ⚠️ 发现问题"
            echo ""
            echo "### 问题列表"
            for issue in "${issues[@]}"; do
                echo "- [ ] $issue"
            done
            echo ""
            echo "---"
            echo ""
        } >> "$REVIEW_LOG"
        
        echo -e "${YELLOW}建议修复后再次运行: ./git-agent.sh review${NC}"
        exit 1
    fi
    
    echo ""
    echo "审查日志: $REVIEW_LOG"
}

# 完成当前迭代
complete_iteration() {
    echo -e "${BLUE}🏁 完成当前迭代...${NC}"
    
    local current=$(node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
console.log(manifest.currentIteration || 'none');
")
    
    if [ "$current" = "none" ]; then
        echo -e "${RED}❌ 没有活跃的迭代${NC}"
        exit 1
    fi
    
    # 获取分支名
    local branch=$(node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
const iteration = manifest.iterations.find(i => i.id === '$current');
console.log(iteration ? iteration.branch : '');
")
    
    echo "迭代: $current"
    echo "分支: $branch"
    
    # 最终审查
    if ! review; then
        echo -e "${RED}❌ 审查未通过，无法完成迭代${NC}"
        exit 1
    fi
    
    # 创建标签
    local tag="${current}-complete"
    git tag "$tag"
    
    # 合并到 main
    git checkout main
    git merge "$branch" --no-ff -m "Complete $current"
    
    # 更新 manifest
    node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
const iteration = manifest.iterations.find(i => i.id === '$current');
if (iteration) {
  iteration.status = 'completed';
  iteration.completedAt = new Date().toISOString();
  iteration.tag = '$tag';
}
manifest.currentIteration = null;
manifest.completedPhases.push('$current');
fs.writeFileSync('$MANIFEST_FILE', JSON.stringify(manifest, null, 2));
"
    
    echo -e "${GREEN}✅ 迭代 $current 已完成${NC}"
    echo "标签: $tag"
    echo "已合并到 main"
    echo ""
    echo "开始下一轮:"
    echo "  ./git-agent.sh start-iteration --name 2-context-monitor --goal '实现上下文监控'"
}

# 显示状态
status() {
    echo -e "${BLUE}📊 Git Agent 状态${NC}"
    echo ""
    
    if [ ! -f "$MANIFEST_FILE" ]; then
        echo -e "${YELLOW}⚠️  未初始化，请先运行: ./git-agent.sh init${NC}"
        exit 1
    fi
    
    node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));

console.log('项目:', manifest.project);
console.log('');

if (manifest.currentIteration) {
  console.log('🟢 当前迭代:', manifest.currentIteration);
  const iteration = manifest.iterations.find(i => i.id === manifest.currentIteration);
  if (iteration) {
    console.log('   目标:', iteration.goal);
    console.log('   分支:', iteration.branch);
    console.log('   开始:', iteration.startedAt);
    console.log('   审查次数:', iteration.reviews.length);
  }
} else {
  console.log('⚪ 当前迭代: 无');
}

console.log('');
console.log('已完成迭代:', manifest.completedPhases.length);
manifest.completedPhases.forEach(p => console.log('  ✓', p));

console.log('');
console.log('指标:');
console.log('  总提交数:', manifest.metrics.totalCommits);
console.log('  总审查数:', manifest.metrics.totalReviews);
console.log('  发现问题:', manifest.metrics.issuesFound);
console.log('  已修复:', manifest.metrics.issuesFixed);
"
}

# 显示帮助
help() {
    echo "Git Agent - OpenSpec + GSD + Worktree 自动化跟进"
    echo ""
    echo "命令:"
    echo "  init                                      初始化 Git Agent"
    echo "  start-iteration --name N --goal '...'     开始新迭代"
    echo "  review                                    审查当前代码"
    echo "  complete-iteration                        完成当前迭代"
    echo "  status                                    显示状态"
    echo "  help                                      显示帮助"
    echo ""
    echo "示例:"
    echo "  ./git-agent.sh init"
    echo "  ./git-agent.sh start-iteration --name 1-infrastructure --goal '创建基础 worktree'"
    echo "  ./git-agent.sh review"
    echo "  ./git-agent.sh complete-iteration"
}

# 主命令分发
case "${1:-help}" in
    init)
        init
        ;;
    start-iteration)
        shift
        start_iteration "$@"
        ;;
    review)
        review
        ;;
    complete-iteration)
        complete_iteration
        ;;
    status)
        status
        ;;
    help|--help|-h)
        help
        ;;
    *)
        echo -e "${RED}❌ 未知命令: $1${NC}"
        help
        exit 1
        ;;
esac
