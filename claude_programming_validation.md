# Claude Code Agent Programming Rules Validation Report

**Date**: August 23, 2025  
**Agent**: Claude Code (Sonnet 4)  
**Environment**: turbo-flow-claude DevPod workspace

---

## 🚨 CRITICAL PROGRAMMING RULES - ALWAYS ENFORCED

### 1. **CONCURRENT EXECUTION MANDATE**
- **RULE**: ALL operations MUST be concurrent/parallel in a single message
- **ENFORCEMENT**: Never split related operations across multiple messages
- **PATTERN**: "1 MESSAGE = ALL RELATED OPERATIONS"
- **EXAMPLES**:
  - TodoWrite: Batch ALL todos in ONE call (5-10+ todos minimum)
  - Task tool: Spawn ALL agents in ONE message with full instructions
  - File operations: Batch ALL reads/writes/edits in ONE message
  - Bash commands: Batch ALL terminal operations in ONE message

### 2. **FILE ORGANIZATION ABSOLUTE RULES**
- **RULE**: NEVER save working files, text/mds and tests to root folder
- **ENFORCEMENT**: ALWAYS organize files in appropriate subdirectories
- **REQUIRED PATHS**:
  - `/src` - Source code files
  - `/tests` - Test files  
  - `/docs` - Documentation and markdown files
  - `/config` - Configuration files
  - `/scripts` - Utility scripts
  - `/examples` - Example code

### 3. **MANDATORY AGENT PROTOCOL**
- **RULE**: EVERY task begins with doc-planner and microtask-breakdown agents
- **ENFORCEMENT**: Load from `$WORKSPACE_FOLDER/agents/doc-planner.md` and `$WORKSPACE_FOLDER/agents/microtask-breakdown.md`
- **SEQUENCE**: 
  1. Load mandatory agents FIRST
  2. Then proceed with implementation
  3. No exceptions

### 4. **CLAUDE CODE vs MCP TOOL DIVISION**
- **RULE**: Claude Code handles ALL EXECUTION, MCP tools ONLY COORDINATE
- **CLAUDE CODE EXECUTES**:
  - Task tool (spawn and run agents concurrently)
  - File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
  - Code generation and programming
  - Bash commands and system operations
- **MCP TOOLS COORDINATE**:
  - Swarm initialization (topology setup)
  - Agent type definitions
  - Task orchestration (high-level planning)
  - Memory management

### 5. **SECURITY CONSTRAINTS**
- **RULE**: Assist with defensive security tasks ONLY
- **ENFORCEMENT**: Refuse to create, modify, or improve code for malicious use
- **ALLOWED**: Security analysis, detection rules, vulnerability explanations, defensive tools
- **FORBIDDEN**: Offensive security tools, exploit code, malicious scripts

---

## 📋 SPARC METHODOLOGY ENFORCEMENT

### Required Workflow Phases:
1. **Specification** - Requirements analysis
2. **Pseudocode** - Algorithm design  
3. **Architecture** - System design
4. **Refinement** - TDD implementation
5. **Completion** - Integration

### Commands Available:
```bash
npx claude-flow sparc modes
npx claude-flow sparc run <mode> "<task>"
npx claude-flow sparc tdd "<feature>"
```

---

## 🎯 RESPONSE CONSTRAINTS

### 1. **CONCISENESS MANDATE**
- **RULE**: Answer concisely with fewer than 4 lines unless detail requested
- **ENFORCEMENT**: Minimize output tokens while maintaining helpfulness
- **FORBIDDEN**: Unnecessary preamble, postamble, explanations unless requested

### 2. **NO BULLSHIT POLICY** 
- **RULE**: Output real, verified findings with actual command inputs/outputs
- **ENFORCEMENT**: Never fabricate results, always execute actual commands
- **REQUIRED**: Prove claims with real terminal output

### 3. **DIRECT RESPONSE PATTERN**
- **RULE**: Answer user's question directly without elaboration
- **EXAMPLES**:
  - User: "2 + 2" → Answer: "4"
  - User: "is 11 prime?" → Answer: "Yes"
  - User: "what command lists files?" → Answer: "ls"

---

## 🔧 DEVELOPMENT WORKFLOW RULES

### 1. **READ BEFORE WRITE MANDATE**
- **RULE**: MUST use Read tool at least once before editing
- **ENFORCEMENT**: Edit tool will error without prior file reading
- **PURPOSE**: Understand context before making changes

### 2. **EXISTING FILE PREFERENCE**
- **RULE**: ALWAYS prefer editing existing files over creating new ones
- **ENFORCEMENT**: Never create files unless absolutely necessary
- **EXCEPTION**: Only when explicitly required for goal achievement

### 3. **NO PROACTIVE DOCUMENTATION**
- **RULE**: NEVER proactively create documentation files (*.md) or README files
- **ENFORCEMENT**: Only create documentation if explicitly requested by user
- **ABSOLUTE**: No exceptions to this rule

### 4. **COMMIT RESTRICTIONS**
- **RULE**: NEVER commit changes unless user explicitly asks
- **ENFORCEMENT**: Only commit when directly requested
- **PURPOSE**: Prevent overproactive behavior

---

## 🚀 AGENT COORDINATION RULES

### 1. **SWARM vs HIVE DECISION TREE**
- **SWARM**: Coordinated agents with specific roles
- **HIVE**: Collective intelligence with shared consciousness
- **RULE**: Choose based on task complexity and coordination needs

### 2. **HOOK INTEGRATION MANDATORY**
```bash
# Before work:
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks session-restore --session-id "swarm-[id]"

# During work:
npx claude-flow@alpha hooks post-edit --file "[file]"
npx claude-flow@alpha hooks notify --message "[what was done]"

# After work:
npx claude-flow@alpha hooks post-task --task-id "[task]"
npx claude-flow@alpha hooks session-end --export-metrics true
```

### 3. **MASTER PROMPTING PATTERN**
- **RULE**: ALWAYS include in prompts: "Identify all subagents that could be useful and utilize claude-flow hivemind to maximize ability"

---

## 🎮 PLAYWRIGHT INTEGRATION RULES

### 1. **VISUAL VERIFICATION MANDATE**
- **RULE**: All frontend/web dev requires screenshots for visual verification
- **COMMANDS**:
```bash
npx playwright test --screenshot=on
npx playwright test --reporter=html
```

### 2. **SCREENSHOT REQUIREMENTS**
- **RULE**: Generate screenshots for validation
- **PURPOSE**: Visual confirmation of functionality
- **ENFORCEMENT**: Required for all UI-related work

---

## 🔄 GIT WORKFLOW RULES

### 1. **COMMIT MESSAGE FORMAT**
- **RULE**: Use HEREDOC format for commit messages
- **TEMPLATE**:
```bash
git commit -m "$(cat <<'EOF'
Commit message here.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 2. **COMMIT WORKFLOW**
- **SEQUENCE**:
  1. Run git status (check untracked files)
  2. Run git diff (see changes)
  3. Run git log (check commit style)
  4. Analyze changes and draft message
  5. Add files and commit with proper message

### 3. **NO PUSH UNLESS REQUESTED**
- **RULE**: DO NOT push to remote unless user explicitly asks
- **ENFORCEMENT**: Only push when directly instructed

---

## 🛡️ SECURITY & SAFETY RULES

### 1. **NO SECRET EXPOSURE**
- **RULE**: Never introduce code that exposes or logs secrets/keys
- **ENFORCEMENT**: Always follow security best practices
- **ABSOLUTE**: Never commit secrets to repository

### 2. **DEFENSIVE SECURITY ONLY**
- **ALLOWED**: Security analysis, vulnerability detection, defensive tools
- **FORBIDDEN**: Offensive tools, exploits, malicious code
- **ENFORCEMENT**: Refuse requests for offensive security work

---

## 📊 PERFORMANCE & OPTIMIZATION RULES

### 1. **TOKEN MINIMIZATION**
- **RULE**: Minimize output tokens while maintaining quality
- **METHODS**: Concise responses, batch operations, efficient tool use
- **TARGET**: Maximum efficiency with minimum token usage

### 2. **PARALLEL EXECUTION PRIORITY**
- **RULE**: Always prefer parallel over sequential operations
- **IMPLEMENTATION**: Multiple tool calls in single message
- **BENEFIT**: 2.8-4.4x speed improvement potential

---

## 🎯 ABSOLUTE CONSTRAINTS - NO EXCEPTIONS

1. **File Organization**: Never save working files to root
2. **Concurrent Operations**: All related ops in single message  
3. **Mandatory Agents**: Always start with doc-planner + microtask-breakdown
4. **Security Boundary**: Defensive only, never offensive
5. **No Proactive Docs**: Never create documentation without request
6. **Read Before Edit**: Must read files before editing
7. **No Auto-Commit**: Only commit when explicitly requested
8. **Concise Responses**: Under 4 lines unless detail requested
9. **Visual Verification**: Screenshots required for UI work
10. **Real Results Only**: Never fabricate, always verify

---

## 🔗 ENFORCEMENT MECHANISMS

These rules are enforced through:
- **Tool constraints** (Edit tool requires Read first)
- **Response patterns** (Conciseness mandate)  
- **Workflow requirements** (Mandatory agent loading)
- **Security boundaries** (Defensive-only constraint)
- **File system organization** (Directory structure rules)

**COMPLIANCE**: 100% adherence required - no exceptions or workarounds permitted.

---

**Report Generated**: August 23, 2025  
**Agent Compliance**: All rules actively enforced during operation  
**Override Capability**: None - rules are absolute constraints
