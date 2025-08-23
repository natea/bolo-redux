#!/bin/bash
set -ex  # Add -x for debugging output

# Get the directory where this script is located
readonly DEVPOD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Claude Dev Environment Setup ==="
echo "WORKSPACE_FOLDER: $WORKSPACE_FOLDER"
echo "DEVPOD_WORKSPACE_FOLDER: $DEVPOD_WORKSPACE_FOLDER"
echo "AGENTS_DIR: $AGENTS_DIR"
echo "DEVPOD_DIR: $DEVPOD_DIR"

# Install npm packages
npm install -g @anthropic-ai/claude-code
npm install -g claude-usage-cli

# Install uv package manager
echo "Installing uv package manager..."
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env

# Install Claude Monitor using uv
echo "Installing Claude Code Usage Monitor..."
uv tool install claude-monitor || pip install claude-monitor

# Verify installation
if command -v claude-monitor >/dev/null 2>&1; then
    echo "✅ Claude Monitor installed successfully"
else
    echo "❌ Claude Monitor installation failed"
fi

# Initialize claude-flow in the project directory
cd "$WORKSPACE_FOLDER"
npx claude-flow@alpha init --force

# Install Claude subagents
echo "Installing Claude subagents..."
mkdir -p "$AGENTS_DIR"
cd "$AGENTS_DIR"
git clone https://github.com/ChrisRoyse/610ClaudeSubagents.git temp-agents
cp -r temp-agents/agents/*.md .
rm -rf temp-agents

# Copy additional agents if they're included in the repo
ADDITIONAL_AGENTS_DIR="$WORKSPACE_FOLDER/additional-agents"
if [ -d "$ADDITIONAL_AGENTS_DIR" ]; then
    echo "Copying additional agents..."
    
    # Copy doc-planner.md
    if [ -f "$ADDITIONAL_AGENTS_DIR/doc-planner.md" ]; then
        cp "$ADDITIONAL_AGENTS_DIR/doc-planner.md" "$AGENTS_DIR/"
        echo "✅ Copied doc-planner.md"
    fi
    
    # Copy microtask-breakdown.md
    if [ -f "$ADDITIONAL_AGENTS_DIR/microtask-breakdown.md" ]; then
        cp "$ADDITIONAL_AGENTS_DIR/microtask-breakdown.md" "$AGENTS_DIR/"
        echo "✅ Copied microtask-breakdown.md"
    fi
fi

echo "Installed $(ls -1 *.md | wc -l) agents in $AGENTS_DIR"
cd "$WORKSPACE_FOLDER"

# Create claude.md file
cat << 'EOF' > claude.md
# Claude Code Configuration - SPARC Development Environment

## 🚨 DevPod Environment Variables
- WORKSPACE_FOLDER: Main workspace directory
- DEVPOD_WORKSPACE_FOLDER: DevPod workspace directory
- AGENTS_DIR: $WORKSPACE_FOLDER/agents

## 🚨 CRITICAL: Concurrent Execution Rules

**ABSOLUTE RULE**: ALL operations MUST be concurrent/parallel in ONE message:

### 🔴 Mandatory Patterns:
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message
- **File operations**: ALWAYS batch ALL reads/writes/edits
- **Bash commands**: ALWAYS batch ALL terminal operations
- **Memory operations**: ALWAYS batch ALL store/retrieve

### ⚡ Golden Rule: "1 MESSAGE = ALL RELATED OPERATIONS"

✅ **CORRECT**: Everything in ONE message
```javascript
[Single Message]:
  - TodoWrite { todos: [10+ todos] }
  - Task("Agent 1"), Task("Agent 2"), Task("Agent 3")
  - Read("file1.js"), Read("file2.js")
  - Write("output1.js"), Write("output2.js")
  - Bash("npm install"), Bash("npm test")
```

❌ **WRONG**: Multiple messages (6x slower!)

## 🎯 Claude Code vs MCP Tools

### Claude Code Handles ALL:
- File operations (Read/Write/Edit/Glob/Grep)
- Code generation & programming
- Bash commands & system operations
- TodoWrite & task management
- Git operations & package management
- Testing, debugging & implementation

### MCP Tools ONLY:
- Coordination & planning
- Memory management
- Performance tracking
- Swarm orchestration
- GitHub integration

**Key**: MCP coordinates, Claude Code executes!

## 📦 SPARC Commands

### Core:
- `npx claude-flow sparc modes` - List modes
- `npx claude-flow sparc run <mode> "<task>"` - Execute mode
- `npx claude-flow sparc tdd "<feature>"` - TDD workflow
- `npx claude-flow sparc batch <modes> "<task>"` - Parallel modes
- `npx claude-flow sparc pipeline "<task>"` - Full pipeline

### Build:
- `npm run build/test/lint/typecheck`

## 🤖 Agent Reference (600+ Total)

### Mandatory Agents (Use for EVERY task)
| Agent | Purpose | Location |
|-------|---------|----------|
| doc-planner | Documentation planning, SPARC workflow | `$AGENTS_DIR/doc-planner.md` |
| microtask-breakdown | Atomic task decomposition | `$AGENTS_DIR/microtask-breakdown.md` |

### Core Development
| Agent | Purpose |
|-------|---------|
| coder | Implementation |
| reviewer | Code quality |
| tester | Test creation |
| planner | Strategic planning |
| researcher | Information gathering |

### Swarm Coordination
| Agent | Purpose |
|-------|---------|
| hierarchical-coordinator | Queen-led |
| mesh-coordinator | Peer-to-peer |
| adaptive-coordinator | Dynamic topology |
| collective-intelligence-coordinator | Hive-mind |
| swarm-memory-manager | Distributed memory |

### Specialized
| Agent | Purpose |
|-------|---------|
| backend-dev | API development |
| mobile-dev | React Native |
| ml-developer | Machine learning |
| system-architect | High-level design |
| sparc-coder | TDD implementation |
| production-validator | Real validation |

### GitHub Integration
| Agent | Purpose |
|-------|---------|
| github-modes | Comprehensive integration |
| pr-manager | Pull requests |
| code-review-swarm | Multi-agent review |
| issue-tracker | Issue management |
| release-manager | Release coordination |

### Performance & Consensus
| Agent | Purpose |
|-------|---------|
| perf-analyzer | Bottleneck identification |
| performance-benchmarker | Performance testing |
| byzantine-coordinator | Fault tolerance |
| raft-manager | Leader election |
| consensus-builder | Decision-making |

## 🚀 Swarm Patterns

### Full-Stack Swarm (8 agents)
```bash
# ALWAYS start with doc-planner and microtask-breakdown!
Task("Documentation", "Create comprehensive plan", "doc-planner")
Task("Microtasks", "Break down to atomic tasks", "microtask-breakdown")
Task("Architecture", "...", "system-architect")
Task("Backend", "...", "backend-dev")
Task("Frontend", "...", "mobile-dev")
Task("Testing", "...", "performance-benchmarker")
Task("Validation", "...", "production-validator")
```

### Agent Count Rules
1. **Mandatory 2**: doc-planner + microtask-breakdown ALWAYS
2. **CLI Args**: `npx claude-flow@alpha --agents 5`
3. **Auto-Decide**: Simple (3-4), Medium (5-7), Complex (8-12)

## 📋 Agent Coordination Protocol

### Every Agent MUST:

**1️⃣ START:**
```bash
# First, load mandatory agents from workspace
cat $AGENTS_DIR/doc-planner.md
cat $AGENTS_DIR/microtask-breakdown.md

# Then initialize
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ DURING (After EVERY step):**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[decision]"
```

**3️⃣ END:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]" --analyze-performance true
npx claude-flow@alpha hooks session-end --export-metrics true
```

## 🛠️ MCP Setup

```bash
# Add MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

### Key MCP Tools:
- `mcp__claude-flow__swarm_init` - Setup topology
- `mcp__claude-flow__agent_spawn` - Create agents
- `mcp__claude-flow__task_orchestrate` - Coordinate tasks
- `mcp__claude-flow__memory_usage` - Persistent memory
- `mcp__claude-flow__swarm_status` - Monitor progress

## 📊 Progress Format

```
📊 Progress Overview
├── Total: X | ✅ Complete: X | 🔄 Active: X | ⭕ Todo: X
└── Priority: 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW
```

## 🎯 Performance Tips

1. **Doc-First** - ALWAYS start with doc-planner
2. **Atomic Tasks** - Use microtask-breakdown for 10-min tasks
3. **Batch Everything** - Multiple operations = 1 message
4. **Parallel First** - Think concurrent execution
5. **Memory is Key** - Cross-agent coordination
6. **Monitor Progress** - Real-time tracking
7. **Enable Hooks** - Automated coordination

## ⚡ Quick Examples

### Research Task with Mandatory Agents
```javascript
// Single message with all operations
cat $AGENTS_DIR/doc-planner.md
cat $AGENTS_DIR/microtask-breakdown.md
mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 7 }
mcp__claude-flow__agent_spawn { type: "doc-planner" }
mcp__claude-flow__agent_spawn { type: "microtask-breakdown" }
mcp__claude-flow__agent_spawn { type: "researcher" }
mcp__claude-flow__agent_spawn { type: "code-analyzer" }
mcp__claude-flow__task_orchestrate { task: "Research patterns" }
```

### Development Task with Proper Planning
```javascript
// All todos in ONE call, but AFTER planning
TodoWrite { todos: [
  { id: "1", content: "Run doc-planner for architecture", status: "in_progress", priority: "high" },
  { id: "2", content: "Use microtask-breakdown for phases", status: "pending", priority: "high" },
  { id: "3", content: "Design API", status: "pending", priority: "high" },
  { id: "4", content: "Implement auth", status: "pending", priority: "high" },
  { id: "5", content: "Write tests", status: "pending", priority: "medium" },
  { id: "6", content: "Documentation", status: "pending", priority: "low" }
]}
```

## 🔗 Resources

- Docs: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- SPARC: https://github.com/ruvnet/claude-flow/docs/sparc.md
- 610 Agents: https://github.com/ChrisRoyse/610ClaudeSubagents

---

## Protocols (a.k.a. YOLO Protocols)
Standard protocols executed on request, e.g. "Initialize CI protocol": 

### Model Protocol
Always use Claude Sonnet. Start every Claude session with `model /sonnet`.

### Mandatory Agent Protocol
EVERY task begins with:
1. Load and execute doc-planner
2. Load and execute microtask-breakdown
3. Only then proceed with implementation

### Agile Delivery Protocols
Deliver work in manageable chunks through fully automated pipelines. The goal is to deliver features and keep going unattended (don't stop!) until the feature is fully deployed.

#### Work Chunking Protocol (WCP)
Feature-based agile with CI integration using EPICs, Features, and Issues:

##### 🎯 PHASE 1: Planning (MANDATORY doc-planner + microtask-breakdown)
1. **LOAD AGENTS**: 
   ```bash
   cat $AGENTS_DIR/doc-planner.md
   cat $AGENTS_DIR/microtask-breakdown.md
   ```

2. **EPIC ISSUE**: Business-focused GitHub issue with objectives, requirements, criteria, dependencies. Labels: `epic`, `enhancement`

3. **FEATURE BREAKDOWN**: 3-7 Features (1-3 days each, independently testable/deployable, incremental value)

4. **MICROTASK DECOMPOSITION**: Use microtask-breakdown to create 10-minute atomic tasks

##### 🔗 PHASE 2: GitHub Structure
5. **CREATE SUB-ISSUES** (GitHub CLI + GraphQL):
   ```bash
   # Create issues
   gh issue create --title "Parent Feature" --body "Description"
   gh issue create --title "Sub-Issue Task" --body "Description"
   
   # Get GraphQL IDs  
   gh api graphql --header 'X-Github-Next-Global-ID:1' -f query='
   { repository(owner: "OWNER", name: "REPO") { 
       issue(number: PARENT_NUM) { id }
   }}'
   
   # Add sub-issue relationship
   gh api graphql --header 'X-Github-Next-Global-ID:1' -f query='
   mutation { addSubIssue(input: {
     issueId: "PARENT_GraphQL_ID"
     subIssueId: "CHILD_GraphQL_ID"
   }) { issue { id } subIssue { id } }}'
   ```

6. **EPIC TEMPLATE** (with mandatory agents):
   ```markdown
   # EPIC: [Name]
   
   ## Planning Agents Used
   - [ ] doc-planner: Phase documentation created
   - [ ] microtask-breakdown: Atomic tasks defined
   
   ## Business Objective
   [Goal and value]
   
   ## Technical Requirements
   - [ ] Requirement 1-N
   
   ## Features (Linked)
   - [ ] Feature 1: #[num] - [Status]
   
   ## Atomic Tasks (from microtask-breakdown)
   - [ ] task_000: Environment setup
   - [ ] task_001: Create types
   - [ ] task_002: Write first test
   [... continue with all atomic tasks]
   
   ## Success Criteria
   - [ ] Criteria 1-N
   - [ ] CI/CD: 100% success
   
   ## CI Protocol
   Per CLAUDE.md: 100% CI before progression, implementation-first, swarm coordination
   
   ## Dependencies
   [List external dependencies]
   ```

##### 🚀 PHASE 3: Execution
7. **ONE FEATURE AT A TIME**: Complete current feature (100% CI) before next. No parallel features. One PR per feature.

8. **SWARM DEPLOYMENT**: For complex features (2+ issues) - hierarchical topology, agent specialization, memory coordination

##### 🔄 PHASE 4: CI Integration
9. **MANDATORY CI**: Research→Implementation→Monitoring. 100% success required.

10. **CI MONITORING with Playwright**:
    ```bash
    # Install playwright for visual verification
    npm install -D playwright
    
    # Run visual tests
    npx playwright test --reporter=html
    
    # Monitor CI runs
    gh run list --repo owner/repo --branch feature/[name] --limit 10
    gh run view [RUN_ID] --repo owner/repo --log-failed
    npx claude-flow@alpha hooks ci-monitor-init --branch feature/[name]
    ```

##### 📊 PHASE 5: Tracking
11. **VISUAL TRACKING**:
    ```
    📊 EPIC: [Name]
      ├── Planning: ✅ doc-planner | ✅ microtask-breakdown
      ├── Features: X total
      ├── ✅ Complete: X (X%)
      ├── 🔄 Current: [Feature] (X/3 issues)
      ├── ⭕ Pending: X
      └── 🎯 CI: [PASS/FAIL]
    ```

12. **ISSUE UPDATES**: Add labels, link parents, close with comments

##### 🎯 KEY RULES
- ALWAYS start with doc-planner and microtask-breakdown
- ONE feature at a time to production
- 100% CI before progression
- Playwright for visual verification
- Swarm for complex features
- Implementation-first focus
- Max 3 issues/feature, 7 features/EPIC

#### Continuous Integration (CI) Protocol
Fix→Test→Commit→Push→Monitor→Repeat until 100%:

##### 🔬 PHASE 1: Research with Deep Learning
1. **SWARM**: Deploy researcher/analyst/detective via `mcp__ruv-swarm__swarm_init`

2. **DEEP RESEARCH SOURCES**: 
   - YouTube transcripts (tools/youtube-transcript-api)
   - GitHub repos (trending and established)
   - Blog posts (dev.to, medium, personal blogs)
   - Context7 MCP, WebSearch
   - Current date context: Tuesday, August 12, 2025

3. **ANALYSIS**: Root causes vs symptoms, severity categorization, GitHub documentation

4. **TARGETED FIXES**: Focus on specific CI failures (TypeScript violations, console.log, unused vars)

##### 🎯 PHASE 2: Implementation with Iteration
5. **IMPLEMENTATION-FIRST**: Fix logic not test expectations, handle edge cases, realistic thresholds

6. **ITERATE UNTIL SUCCESS**: 
   - Keep trying different approaches
   - If stuck, do deep research
   - Recursive problem breakdown
   - Never give up until working

7. **SWARM EXECUTION**: Systematic TDD, coordinate via hooks/memory, target 100% per component

##### 🚀 PHASE 3: Monitoring with ML Predictions
8. **ACTIVE MONITORING**: ALWAYS check after pushing
   ```bash
   # Use enhanced Claude Monitor
   claude-monitor --predict --ml-analysis
   
   # Fallback to standard monitoring
   gh run list --repo owner/repo --limit N
   gh run view RUN_ID --repo owner/repo
   ```

9. **INTELLIGENT MONITORING**:
   ```bash
   npx claude-flow@alpha hooks ci-monitor-init --adaptive true
   ```
   Smart backoff (2s-5min), auto-merge, swarm coordination

10. **INTEGRATION**: Regular commits, interval pushes, PR on milestones

11. **ISSUE MANAGEMENT**: Close with summaries, update tracking, document methods, label appropriately

12. **ITERATE**: Continue until deployment success, apply lessons, scale swarm by complexity

##### 🏆 TARGET: 100% test success with visual verification

#### Continuous Deployment (CD) Protocol with Playwright
Deploy→E2E→Monitor→Validate→Auto-promote:

##### 🚀 PHASE 1: Staging
1. **AUTO-DEPLOY**: Blue-green after CI passes
   ```bash
   gh workflow run deploy-staging.yml --ref feature/[name]
   ```

2. **VALIDATE with Playwright**: 
   ```bash
   # Take screenshots for verification
   npx playwright test e2e/staging-smoke.spec.ts --screenshot=on
   ```

##### 🧪 PHASE 2: E2E Testing with Visual Verification
3. **PLAYWRIGHT EXECUTION**: 
   ```javascript
   // Install playwright
   npm install -D playwright
   
   // Visual verification test
   test('dashboard renders correctly', async ({ page }) => {
     await page.goto('https://staging.app.com');
     await page.screenshot({ path: 'dashboard.png', fullPage: true });
     // Verify elements are visible
     await expect(page.locator('.dashboard')).toBeVisible();
   });
   ```

4. **ANALYSIS**: Deploy swarm on failures, categorize flaky/environment/code, auto-retry, block critical

##### 🔍 PHASE 3: Production Readiness
5. **SECURITY**: SAST/DAST, container vulnerabilities, compliance, SSL/encryption

6. **PERFORMANCE**: SLA validation, load tests, response/throughput metrics, baseline comparison

##### 🎯 PHASE 4: Production
7. **DEPLOY**: Canary 5%→25%→50%→100%, monitor phases, auto-rollback on spikes, feature flags

##### 🔄 PHASE 5: Validation
9. **VALIDATE with Playwright**: 
   ```bash
   # Production smoke tests with screenshots
   npx playwright test e2e/prod-smoke.spec.ts --reporter=html
   ```

10. **CLEANUP**: Archive logs/metrics, clean temp resources, update docs/runbooks, tag VCS

11. **COMPLETE**: Update GitHub issues/boards, generate summary, update swarm memory

##### 🏆 TARGETS: Zero-downtime, <1% error rate, visual verification passed

---

## 📚 Subagents Directory

**600+ specialized Claude subagents** are available in your agents directory.

### Essential Commands:
```bash
# DevPod provides $WORKSPACE_FOLDER automatically
# View all available agents
ls $AGENTS_DIR/*.md | wc -l

# Search for specific agent types
ls $AGENTS_DIR/*test*.md
ls $AGENTS_DIR/*dev*.md
ls $AGENTS_DIR/*security*.md

# View agent index
cat $AGENTS_DIR/agents-index.md

# MANDATORY: Always start with these
cat $AGENTS_DIR/doc-planner.md
cat $AGENTS_DIR/microtask-breakdown.md
```

### Agent Categories:
- **Planning & Documentation** (doc-planner, microtask-breakdown)
- **Development** (coder, backend-dev, frontend-dev, mobile-dev)
- **Testing** (tester, e2e-tester, performance-tester)
- **Security** (security-auditor, penetration-tester)
- **DevOps** (cicd-engineer, kubernetes-specialist)
- **Data & ML** (data-scientist, ml-engineer)
- **Business** (product-manager, business-analyst)
- **500+ more specialized roles**

Each agent follows strict CLAUDE.md principles and provides atomic, testable tasks.

---

## 🔧 Development Workflow Summary

1. **ALWAYS START** with doc-planner and microtask-breakdown
2. **Use Playwright** for all visual verification
3. **Iterate until success** - never give up
4. **Deep research** when stuck (YouTube, GitHub, blogs)
5. **Batch operations** in single messages
6. **Current date**: Tuesday, August 12, 2025
7. **Monitor** with ML-enhanced predictions
8. **Swarm vs Hive** - choose based on complexity

**Remember**: Claude Flow coordinates, Claude Code creates! 
Never save working files, text/mds and tests to the root folder.

---

## 🚀 DevPod Environment

This configuration is designed for DevPod environments where workspace variables are automatically set:
- `$WORKSPACE_FOLDER` - Main workspace directory
- `$DEVPOD_WORKSPACE_FOLDER` - DevPod workspace root  
- `$AGENTS_DIR` - Set to `$WORKSPACE_FOLDER/agents`

No manual configuration required - all paths work out of the box!

---

**Success = Doc-First + Atomic Tasks + Visual Verification + Persistent Iteration**
EOF

# Delete existing claude.md and copy CLAUDE.md to overwrite it if it exists
if [ -f "$WORKSPACE_FOLDER/CLAUDE.md" ]; then
    echo "Found CLAUDE.md, replacing claude.md with it..."
    rm -f "$WORKSPACE_FOLDER/claude.md"
    cp "$WORKSPACE_FOLDER/CLAUDE.md" "$WORKSPACE_FOLDER/claude.md"
    echo "✅ Replaced claude.md with CLAUDE.md"
fi

# Clean up - remove CLAUDE.md if it exists
if [ -f "$WORKSPACE_FOLDER/CLAUDE.md" ]; then
    rm "$WORKSPACE_FOLDER/CLAUDE.md"
    echo "✅ Removed CLAUDE.md from workspace root"
fi

echo "Setup completed successfully!"
