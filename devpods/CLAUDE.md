# Claude Code Configuration - SPARC Development Environment

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 🔴 MANDATORY FOR ALL WORK: Doc-Planner & Microtask-Breakdown

**EVERY coding session, swarm, and hive-mind MUST start with:**

1. **Doc-Planner Agent** 
   - Creates comprehensive documentation plans following SPARC workflow
   - Breaks down complex systems into manageable phases
   - Implements London School TDD methodology
   - Ensures atomic, testable tasks with clear dependencies

2. **Microtask-Breakdown Agent**
   - Decomposes phases into atomic 10-minute tasks
   - Follows strict CLAUDE.md principles (NO MOCKS, TDD, etc.)
   - Creates tasks that score 100/100 production readiness
   - Validates everything against real implementations

**Usage Pattern:**
```bash
# ALWAYS start with:
# Load doc-planner agent from workspace
cat $WORKSPACE_FOLDER/agents/doc-planner.md
# Plan the documentation and phases

# Load microtask-breakdown agent
cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md
# Break down into atomic tasks
```

### 🎯 CRITICAL: Claude Code Task Tool for Agent Execution

**Claude Code's Task tool is the PRIMARY way to spawn agents:**
```javascript
// ✅ CORRECT: Use Claude Code's Task tool for parallel agent execution
[Single Message]:
  Task("Research agent", "Analyze requirements and patterns...", "researcher")
  Task("Coder agent", "Implement core features...", "coder")
  Task("Tester agent", "Create comprehensive tests...", "tester")
  Task("Reviewer agent", "Review code quality...", "reviewer")
  Task("Architect agent", "Design system architecture...", "system-architect")
```
## 🔴 MANDATORY AGENT LOADING PROTOCOL

### ⚡ BEFORE ANY TASK: Auto-Load Mandatory Agents
```javascript
// EVERY development task MUST start with these reads:
[Single Message - Mandatory Agent Loading]:
  Read("agents/doc-planner.md")
  Read("agents/microtask-breakdown.md")
  
  // Then use Task tool with loaded agent instructions
  Task("Doc Planning", "Follow the doc-planner methodology just loaded to create comprehensive documentation plan", "planner")
  Task("Microtask Breakdown", "Follow the microtask-breakdown methodology just loaded to break into atomic 10-minute tasks", "analyst")
  
  // Continue with specialized agents
  Task("Implementation", "...", "coder")
  Task("Testing", "...", "tester")

**MCP tools are ONLY for coordination setup:**
- `mcp__claude-flow__swarm_init` - Initialize coordination topology
- `mcp__claude-flow__agent_spawn` - Define agent types for coordination
- `mcp__claude-flow__task_orchestrate` - Orchestrate high-level workflows

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

### 🎯 Core Development Principles

1. **Playwright Integration**: All frontend/web dev requires screenshots for visual verification
2. **Recursive Problem Solving**: Break complex problems to atomic units
3. **Iterate Until Success**: Continue until goal achieved - no giving up
4. **Deep Research Protocol**: Auto-search YouTube, GitHub, blogs when stuck
5. **Date Context**: Reference current date when relevant to tasks
6. **Swarm vs Hive**: Clear decision tree for coordination patterns

## Project Overview

This project uses SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology with Claude-Flow orchestration for systematic Test-Driven Development.

## SPARC Commands

### Core Commands
- `npx claude-flow sparc modes` - List available modes
- `npx claude-flow sparc run <mode> "<task>"` - Execute specific mode
- `npx claude-flow sparc tdd "<feature>"` - Run complete TDD workflow
- `npx claude-flow sparc info <mode>` - Get mode details

### Batchtools Commands
- `npx claude-flow sparc batch <modes> "<task>"` - Parallel execution
- `npx claude-flow sparc pipeline "<task>"` - Full pipeline processing
- `npx claude-flow sparc concurrent <mode> "<tasks-file>"` - Multi-task processing

### Build Commands
- `npm run build` - Build project
- `npm run test` - Run tests
- `npm run lint` - Linting
- `npm run typecheck` - Type checking

## SPARC Workflow Phases

1. **Specification** - Requirements analysis (`sparc run spec-pseudocode`)
2. **Pseudocode** - Algorithm design (`sparc run spec-pseudocode`)
3. **Architecture** - System design (`sparc run architect`)
4. **Refinement** - TDD implementation (`sparc tdd`)
5. **Completion** - Integration (`sparc run integration`)

## Code Style & Best Practices

- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns
- **Documentation**: Keep updated

## 🤖 Agent Reference (600+ Total)

## 🤖 Agent Discovery and Selection Protocol

### 🔍 MANDATORY: Agent Discovery Step
Before starting any task, ALWAYS discover available agents:

```bash
# Count total agents
ls $WORKSPACE_FOLDER/agents/*.md 2>/dev/null | wc -l

# Search for specific functionality
find $WORKSPACE_FOLDER/agents/ -name "*test*"
find $WORKSPACE_FOLDER/agents/ -name "*web*" 
find $WORKSPACE_FOLDER/agents/ -name "*api*"
find $WORKSPACE_FOLDER/agents/ -name "*game*"

# Sample random agents
ls $WORKSPACE_FOLDER/agents/*.md | shuf | head -10 | sed 's|.*/||g' | sed 's|.md||g'
```

### 🎯 Agent Selection Workflow
1. **Discover** - Run agent discovery commands
2. **Select** - Choose 3-7 relevant agents beyond mandatory 2
3. **Load** - Use `cat $WORKSPACE_FOLDER/agents/[agent-name].md`
4. **Coordinate** - Spawn via Task tool

### 🔄 Integration with Mandatory Workflow
- **BEFORE** doc-planner: Discover relevant agents for project type
- **DURING** microtask-breakdown: Select agents for each atomic task  
- **AFTER** planning: Load and coordinate selected agents

### Agents Directory Location
```bash
# DevPod automatically provides workspace variables
# No manual setup required - agents are located at:
$WORKSPACE_FOLDER/agents/

# The workspace folder is automatically set by DevPod
# Just use the paths directly without any configuration
```

### Mandatory Agents (Use for EVERY task)
| Agent | Purpose | Typical Location |
|-------|---------|----------|
| doc-planner | Documentation planning, SPARC workflow | `$WORKSPACE_FOLDER/agents/doc-planner.md` |
| microtask-breakdown | Atomic task decomposition | `$WORKSPACE_FOLDER/agents/microtask-breakdown.md` |

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

### Consensus & Distributed
| Agent | Purpose |
|-------|---------|
| byzantine-coordinator | Fault tolerance |
| raft-manager | Leader election |
| gossip-coordinator | Information propagation |
| consensus-builder | Decision-making |
| crdt-synchronizer | Conflict-free replication |
| quorum-manager | Consensus validation |
| security-manager | Security oversight |

### Performance & Optimization
| Agent | Purpose |
|-------|---------|
| perf-analyzer | Bottleneck identification |
| performance-benchmarker | Performance testing |
| task-orchestrator | Task coordination |
| memory-coordinator | Memory optimization |
| smart-agent | Intelligent automation |

### GitHub & Repository
| Agent | Purpose |
|-------|---------|
| github-modes | Comprehensive integration |
| pr-manager | Pull requests |
| code-review-swarm | Multi-agent review |
| issue-tracker | Issue management |
| release-manager | Release coordination |
| workflow-automation | CI/CD automation |
| project-board-sync | Project synchronization |
| repo-architect | Repository design |
| multi-repo-swarm | Multi-repository management |

### SPARC Methodology
| Agent | Purpose |
|-------|---------|
| sparc-coord | SPARC coordination |
| sparc-coder | TDD implementation |
| specification | Requirements analysis |
| pseudocode | Algorithm design |
| architecture | System design |
| refinement | Code refinement |

### Specialized Development
| Agent | Purpose |
|-------|---------|
| backend-dev | API development |
| mobile-dev | React Native |
| ml-developer | Machine learning |
| cicd-engineer | CI/CD pipeline |
| api-docs | API documentation |
| system-architect | High-level design |
| code-analyzer | Code analysis |
| base-template-generator | Template generation |

### Testing & Validation
| Agent | Purpose |
|-------|---------|
| tdd-london-swarm | London School TDD |
| production-validator | Production validation |

### Migration & Planning
| Agent | Purpose |
|-------|---------|
| migration-planner | Migration strategy |
| swarm-init | Swarm initialization |

## 🎯 Claude Code vs MCP Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn and run agents concurrently for actual work
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- Implementation work
- Project navigation and analysis
- TodoWrite and task management
- Git operations
- Package management
- Testing and debugging

### MCP Tools ONLY COORDINATE:
- Swarm initialization (topology setup)
- Agent type definitions (coordination patterns)
- Task orchestration (high-level planning)
- Memory management
- Neural features
- Performance tracking
- GitHub integration

**KEY**: MCP coordinates the strategy, Claude Code's Task tool executes with real agents.

## 🚀 Master Prompting Pattern

**ALWAYS include this in your prompts:**
```
"Identify all of the subagents that could be useful in any way for this task and then figure out how to utilize the claude-flow hivemind to maximize your ability to accomplish the task."
```

## 🚀 Quick Setup

```bash
# Add Claude Flow MCP server
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

## MCP Tool Categories

### Coordination
`swarm_init`, `agent_spawn`, `task_orchestrate`

### Monitoring
`swarm_status`, `agent_list`, `agent_metrics`, `task_status`, `task_results`

### Memory & Neural
`memory_usage`, `neural_status`, `neural_train`, `neural_patterns`

### GitHub Integration
`github_swarm`, `repo_analyze`, `pr_enhance`, `issue_triage`, `code_review`

### System
`benchmark_run`, `features_detect`, `swarm_monitor`

## 🚀 Agent Execution Flow with Claude Code

### The Correct Pattern:

1. **Mandatory**: Load doc-planner and microtask-breakdown agents
2. **Optional**: Use MCP tools to set up coordination topology
3. **REQUIRED**: Use Claude Code's Task tool to spawn agents that do actual work
4. **REQUIRED**: Each agent runs hooks for coordination
5. **REQUIRED**: Batch all operations in single messages

### Example Full-Stack Development:

```javascript
// ALWAYS start with mandatory agents
cat $WORKSPACE_FOLDER/agents/doc-planner.md
cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md

// Single message with all agent spawning via Claude Code's Task tool
[Parallel Agent Execution]:
  Task("Documentation", "Create comprehensive plan", "doc-planner")
  Task("Microtasks", "Break down to atomic tasks", "microtask-breakdown")
  Task("Backend Developer", "Build REST API with Express. Use hooks for coordination.", "backend-dev")
  Task("Frontend Developer", "Create React UI. Coordinate with backend via memory.", "coder")
  Task("Database Architect", "Design PostgreSQL schema. Store schema in memory.", "code-analyzer")
  Task("Test Engineer", "Write Jest tests. Check memory for API contracts.", "tester")
  Task("DevOps Engineer", "Setup Docker and CI/CD. Document in memory.", "cicd-engineer")
  Task("Security Auditor", "Review authentication. Report findings via hooks.", "reviewer")
  
  // All todos batched together
  TodoWrite { todos: [
    {id: "1", content: "Run doc-planner for architecture", status: "in_progress", priority: "high"},
    {id: "2", content: "Use microtask-breakdown for phases", status: "pending", priority: "high"},
    {id: "3", content: "Design API endpoints", status: "pending", priority: "high"},
    {id: "4", content: "Implement authentication", status: "pending", priority: "high"},
    {id: "5", content: "Create React components", status: "pending", priority: "medium"},
    {id: "6", content: "Write comprehensive tests", status: "pending", priority: "medium"},
    {id: "7", content: "Setup CI/CD pipeline", status: "pending", priority: "medium"},
    {id: "8", content: "Security audit", status: "pending", priority: "low"}
  ]}
  
  // All file operations together
  Write "backend/server.js"
  Write "frontend/App.jsx"
  Write "database/schema.sql"
  Write "tests/api.test.js"
  Write "docker-compose.yml"
```

## 📋 Agent Coordination Protocol

### Every Agent Spawned via Task Tool MUST:

**1️⃣ BEFORE Work:**
```bash
# First, load mandatory agents from workspace
cat $WORKSPACE_FOLDER/agents/doc-planner.md
cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md

# Then initialize
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"
```

**2️⃣ DURING Work:**
```bash
npx claude-flow@alpha hooks post-edit --file "[file]" --memory-key "swarm/[agent]/[step]"
npx claude-flow@alpha hooks notify --message "[what was done]"
```

**3️⃣ AFTER Work:**
```bash
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

## 🎯 Concurrent Execution Examples

### ✅ CORRECT WORKFLOW: MCP Coordinates, Claude Code Executes

```javascript
// Step 1: Load mandatory agents (ALWAYS REQUIRED)
[Single Message - Mandatory Planning]:
  cat $WORKSPACE_FOLDER/agents/doc-planner.md
  cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md

// Step 2: MCP tools set up coordination (optional, for complex tasks)
[Single Message - Coordination Setup]:
  mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 8 }
  mcp__claude-flow__agent_spawn { type: "doc-planner" }
  mcp__claude-flow__agent_spawn { type: "microtask-breakdown" }
  mcp__claude-flow__agent_spawn { type: "researcher" }
  mcp__claude-flow__agent_spawn { type: "coder" }
  mcp__claude-flow__agent_spawn { type: "tester" }

// Step 3: Claude Code Task tool spawns ACTUAL agents that do the work
[Single Message - Parallel Agent Execution]:
  // Claude Code's Task tool spawns real agents concurrently
  Task("Doc Planning", "Create comprehensive documentation plan following SPARC", "doc-planner")
  Task("Microtask Breakdown", "Break down phases into 10-minute atomic tasks", "microtask-breakdown")
  Task("Research agent", "Analyze API requirements and best practices. Check memory for prior decisions.", "researcher")
  Task("Coder agent", "Implement REST endpoints with authentication. Coordinate via hooks.", "coder")
  Task("Database agent", "Design and implement database schema. Store decisions in memory.", "code-analyzer")
  Task("Tester agent", "Create comprehensive test suite with 90% coverage.", "tester")
  Task("Reviewer agent", "Review code quality and security. Document findings.", "reviewer")
  
  // Batch ALL todos in ONE call
  TodoWrite { todos: [
    {id: "1", content: "Load and execute doc-planner", status: "completed", priority: "high"},
    {id: "2", content: "Load and execute microtask-breakdown", status: "completed", priority: "high"},
    {id: "3", content: "Research API patterns", status: "in_progress", priority: "high"},
    {id: "4", content: "Design database schema", status: "in_progress", priority: "high"},
    {id: "5", content: "Implement authentication", status: "pending", priority: "high"},
    {id: "6", content: "Build REST endpoints", status: "pending", priority: "high"},
    {id: "7", content: "Write unit tests", status: "pending", priority: "medium"},
    {id: "8", content: "Integration tests", status: "pending", priority: "medium"},
    {id: "9", content: "API documentation", status: "pending", priority: "low"},
    {id: "10", content: "Performance optimization", status: "pending", priority: "low"}
  ]}
  
  // Parallel file operations
  Bash "mkdir -p app/{src,tests,docs,config}"
  Write "app/package.json"
  Write "app/src/server.js"
  Write "app/tests/server.test.js"
  Write "app/docs/API.md"
```

### ❌ WRONG (Multiple Messages):
```javascript
Message 1: mcp__claude-flow__swarm_init
Message 2: Task("agent 1")
Message 3: TodoWrite { todos: [single todo] }
Message 4: Write "file.js"
// This breaks parallel coordination!
```

## 🚀 Swarm Patterns

### Full-Stack Swarm (10 agents)
```bash
# ALWAYS start with doc-planner and microtask-breakdown!
Task("Documentation", "Create comprehensive plan", "doc-planner")
Task("Microtasks", "Break down to atomic tasks", "microtask-breakdown")
Task("Architecture", "...", "system-architect")
Task("Backend", "...", "backend-dev")
Task("Frontend", "...", "mobile-dev")
Task("Testing", "...", "performance-benchmarker")
Task("Validation", "...", "production-validator")
Task("Security", "...", "security-manager")
```

### Agent Count Rules
1. **Mandatory 2**: doc-planner + microtask-breakdown ALWAYS
2. **CLI Args**: `npx claude-flow@alpha --agents 5`
3. **Auto-Decide**: Simple (3-4), Medium (5-7), Complex (8-12)

## Performance Benefits

- **84.8% SWE-Bench solve rate**
- **32.3% token reduction**
- **2.8-4.4x speed improvement**
- **27+ neural models**

## Hooks Integration

### Pre-Operation
- Auto-assign agents by file type
- Validate commands for safety
- Prepare resources automatically
- Optimize topology by complexity
- Cache searches

### Post-Operation
- Auto-format code
- Train neural patterns
- Update memory
- Analyze performance
- Track token usage

### Session Management
- Generate summaries
- Persist state
- Track metrics
- Restore context
- Export workflows

## Advanced Features (v2.0.0)

- 🚀 Automatic Topology Selection
- ⚡ Parallel Execution (2.8-4.4x speed)
- 🧠 Neural Training
- 📊 Bottleneck Analysis
- 🤖 Smart Auto-Spawning
- 🛡️ Self-Healing Workflows
- 💾 Cross-Session Memory
- 🔗 GitHub Integration

## Integration Tips

1. **Doc-First** - ALWAYS start with doc-planner
2. **Atomic Tasks** - Use microtask-breakdown for 10-min tasks
3. **Batch Everything** - Multiple operations = 1 message
4. **Parallel First** - Think concurrent execution
5. **Memory is Key** - Cross-agent coordination
6. **Monitor Progress** - Real-time tracking
7. **Enable Hooks** - Automated coordination

## 📊 Progress Format

```
📊 Progress Overview
├── Planning: ✅ doc-planner | ✅ microtask-breakdown
├── Total: X | ✅ Complete: X | 🔄 Active: X | ⭕ Todo: X
└── Priority: 🔴 HIGH | 🟡 MEDIUM | 🟢 LOW
```

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
   cat $WORKSPACE_FOLDER/agents/doc-planner.md
   cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md
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
   - Current date context: Friday, August 22, 2025

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

## 📚 Subagents Directory

**600+ specialized Claude subagents** are available in your agents directory.

### Essential Commands:
```bash
# DevPod provides $WORKSPACE_FOLDER automatically
# No setup needed - just use directly:

# View all available agents
ls $WORKSPACE_FOLDER/agents/*.md | wc -l

# Search for specific agent types
ls $WORKSPACE_FOLDER/agents/*test*.md
ls $WORKSPACE_FOLDER/agents/*dev*.md
ls $WORKSPACE_FOLDER/agents/*security*.md

# View agent index
cat $WORKSPACE_FOLDER/agents/agents-index.md

# MANDATORY: Always start with these
cat $WORKSPACE_FOLDER/agents/doc-planner.md
cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md
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

## Support

- Documentation: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- SPARC: https://github.com/ruvnet/claude-flow/docs/sparc.md
- 610 Agents: https://github.com/ChrisRoyse/610ClaudeSubagents

## 🔗 Resources

- Docs: https://github.com/ruvnet/claude-flow
- Issues: https://github.com/ruvnet/claude-flow/issues
- SPARC: https://github.com/ruvnet/claude-flow/docs/sparc.md
- 610 Agents: https://github.com/ChrisRoyse/610ClaudeSubagents

## 🚀 DevPod Environment

This configuration is designed for DevPod environments where `$WORKSPACE_FOLDER` is automatically set. No manual configuration required - all paths work out of the box!

The agents directory is located at: `$WORKSPACE_FOLDER/agents/`

---

## 🔧 Development Workflow Summary

1. **ALWAYS START** with doc-planner and microtask-breakdown
2. **Use Playwright** for all visual verification
3. **Iterate until success** - never give up
4. **Deep research** when stuck (YouTube, GitHub, blogs)
5. **Batch operations** in single messages
6. **Current date**: Friday, August 22, 2025
7. **Monitor** with ML-enhanced predictions
8. **Swarm vs Hive** - choose based on complexity

**Remember**: Claude Flow coordinates, Claude Code creates! 
Never save working files, text/mds and tests to the root folder.

---

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
Never save working files, text/mds and tests to the root folder.

---

**Success = Doc-First + Atomic Tasks + Visual Verification + Persistent Iteration**
