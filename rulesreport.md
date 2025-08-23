I asked claude "if I tell you to write code what rules are you going to follow - ouput all the rules you will follow to rulesreport.md" this was his answer:

# Code Writing Rules

## 🚨 CRITICAL EXECUTION RULES

### 1. CONCURRENT EXECUTION & FILE MANAGEMENT
- **ALL operations MUST be concurrent/parallel in a single message**
- **NEVER save working files, text/mds and tests to the root folder**
- **ALWAYS organize files in appropriate subdirectories**
- **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently

### 2. GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message

### 3. MANDATORY AGENT PROTOCOL
**EVERY coding session MUST start with:**
1. **Doc-Planner Agent** - Load from `$WORKSPACE_FOLDER/agents/doc-planner.md`
2. **Microtask-Breakdown Agent** - Load from `$WORKSPACE_FOLDER/agents/microtask-breakdown.md`

## 📁 FILE ORGANIZATION RULES

### Directory Structure (NEVER save to root)
- `/src` - Source code files
- `/tests` - Test files  
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code

## 💻 CODE STYLE & BEST PRACTICES

### Core Principles
- **DO NOT ADD ANY COMMENTS** unless explicitly asked
- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns
- **Follow existing conventions**: Mimic existing code style

### Security Rules
- Never introduce code that exposes or logs secrets and keys
- Never commit secrets or keys to the repository
- Always follow security best practices
- Only assist with defensive security tasks

### Library Usage
- **NEVER assume libraries are available** - always check first
- Look at package.json/cargo.toml/etc for existing dependencies
- Check neighboring files for framework patterns
- Follow existing project conventions

## 🧪 TESTING & VALIDATION RULES

### Testing Protocol
- **NEVER assume specific test framework** - check README/codebase first
- Write tests before implementation (TDD)
- Target 90%+ test coverage
- Use Playwright for frontend/web visual verification
- Always run tests after implementation

### Build & Validation Commands
After code changes, MUST run:
- `npm run lint` (if available)
- `npm run typecheck` (if available) 
- `npm run test` (if available)
- `npm run build` (if available)

## 🔄 DEVELOPMENT WORKFLOW

### SPARC Methodology
1. **Specification** - Requirements analysis
2. **Pseudocode** - Algorithm design
3. **Architecture** - System design
4. **Refinement** - TDD implementation
5. **Completion** - Integration

### Implementation Rules
- **Iterate until success** - never give up until goal achieved
- **Recursive problem solving** - break complex problems to atomic units
- **Deep research** when stuck (YouTube, GitHub, blogs, WebSearch)
- **Implementation-first** - fix logic not test expectations

## 🤖 AGENT COORDINATION

### Task Tool Usage (Claude Code)
```javascript
// ✅ CORRECT: Spawn all agents concurrently
Task("Research agent", "Analyze requirements...", "researcher")
Task("Coder agent", "Implement features...", "coder")
Task("Tester agent", "Create tests...", "tester")
```

### Agent Hook Protocol
Every agent must run:
- **BEFORE**: `npx claude-flow@alpha hooks pre-task`
- **DURING**: `npx claude-flow@alpha hooks post-edit`
- **AFTER**: `npx claude-flow@alpha hooks post-task`

## 📊 PROJECT MANAGEMENT

### Todo Management
- Use TodoWrite tool for ALL task tracking
- Batch ALL todos in single calls (5-10+ minimum)
- Mark todos as completed IMMEDIATELY after finishing
- Include priority levels (high/medium/low)

### Git & Version Control
- **NEVER commit unless explicitly asked**
- Follow existing commit message patterns
- Use proper branch naming conventions
- Push only when requested

## 🚀 PERFORMANCE & OPTIMIZATION

### Execution Rules
- **Batch operations** for maximum performance
- **Parallel execution** whenever possible
- **Memory coordination** between agents
- **Visual verification** with Playwright screenshots

### Monitoring
- Monitor CI/CD pipeline status
- Track performance metrics
- Use ML-enhanced predictions for optimization

## 🎯 COMMUNICATION RULES

### Response Guidelines
- **Concise and direct** - minimize output tokens
- **Answer questions directly** without preamble/postamble
- **No unnecessary explanations** unless requested
- **One word answers when appropriate**

### Documentation
- **NEVER create documentation files proactively**
- Only create docs when explicitly requested
- Follow existing documentation patterns
- Keep documentation updated with code changes

## 🔧 TOOL USAGE HIERARCHY

### Claude Code Tools (PRIMARY)
- File operations (Read, Write, Edit, MultiEdit)
- Code generation and programming
- Bash commands and system operations
- Task spawning and agent coordination
- Git operations and package management

### MCP Tools (COORDINATION ONLY)
- Swarm initialization (topology setup)
- Agent type definitions
- High-level task orchestration
- Memory management and neural features

## 🎪 SPECIAL PROTOCOLS

### Playwright Integration
- **ALL frontend/web development** requires screenshots for visual verification
- Install with `npm install -D playwright`
- Use for E2E testing and visual validation
- Take screenshots during testing phases

### Error Handling
- Research root causes vs symptoms
- Categorize by severity
- Apply targeted fixes
- Iterate until resolution
- Document solutions for future reference

---

**SUCCESS FORMULA**: Doc-First + Atomic Tasks + Visual Verification + Persistent Iteration + Concurrent Execution
