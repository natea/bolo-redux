# Claude-Flow v2.0.0 Alpha Command Reference

This document provides a comprehensive reference for all the shell aliases and utility functions configured for **Claude-Flow v2.0.0 Alpha**. These shortcuts are designed to streamline your workflow and make interacting with the `claude-flow` toolkit faster and more intuitive.

---
## Core Commands
These are the primary commands for interacting with Claude-Flow, automatically wrapping your requests with the necessary context.

| Alias | Command | Description |
| :--- | :--- | :--- |
| `cf` | `./cf-with-context.sh` | The base command. Runs any `claude-flow` command with auto-loaded context. |
| `cf-swarm` | `./cf-with-context.sh swarm` | Initiates a "swarm" of agents on a task with auto-loaded context. |
| `cf-hive` | `./cf-with-context.sh hive-mind spawn` | Spawns a "hive-mind" session for complex tasks with auto-loaded context. |
| `cf-dsp` | `claude --dangerously-skip-permissions` | A shortcut for the official Claude Code CLI, bypassing permission prompts. |
| `dsp` | `claude --dangerously-skip-permissions` | An even shorter alias for `cf-dsp`. |

---
## Initialization & Setup
Commands for setting up and verifying your Claude-Flow environment.

| Alias | Command | Description |
| :--- | :--- | :--- |
| `cf-init` | `npx claude-flow@alpha init --force` | Forces re-initialization of the Claude-Flow environment. |
| `cf-init-verify` | `npx claude-flow@alpha init --verify --pair --github-enhanced`| Verifies the setup, including pairing and enhanced GitHub features. |
| `cf-init-project`| `npx claude-flow@alpha init --force --project-name` | Initializes a new project with a specific name. |
| `cf-init-nexus`| `npx claude-flow@alpha init --flow-nexus` | Initializes the environment with Flow Nexus cloud features enabled. |

---
## Agent & Task Management
Commands are organized by their specific methodology or feature set, such as Hive-Mind, Swarm, Memory, and more.

### Hive-Mind Operations
For managing complex, multi-agent sessions.

| Alias | Command | Description |
| :--- | :--- | :--- |
| `cf-spawn` | `npx claude-flow@alpha hive-mind spawn` | Spawns a new hive-mind session. |
| `cf-wizard` | `npx claude-flow@alpha hive-mind wizard` | Starts the interactive wizard to configure a hive-mind session. |
| `cf-resume` | `npx claude-flow@alpha hive-mind resume` | Resumes a previously saved hive-mind session. |
| `cf-status` | `npx claude-flow@alpha hive-mind status` | Checks the status of the current hive-mind session. |
| `cf-sessions`| `npx claude-flow@alpha hive-mind sessions` | Lists all available hive-mind sessions. |
| `cf-upgrade` | `npx claude-flow@alpha hive-mind upgrade` | Upgrades a hive-mind session to the latest version. |
| `cf-github-hive`| `npx claude-flow@alpha hive-mind spawn --github-enhanced --agents 13 --claude` | Spawns a 13-agent hive-mind optimized for GitHub tasks. |

### Swarm Operations
For simpler, single-prompt agent swarms.

| Alias | Command | Description |
| :--- | :--- | :--- |
| `cf-continue` | `npx claude-flow@alpha swarm --continue-session` | Continues the last swarm session. |
| `cf-swarm-temp`| `npx claude-flow@alpha swarm --temp` | Runs a temporary swarm that won't be saved to memory. |
| `cf-swarm-namespace`| `npx claude-flow@alpha swarm --namespace` | Runs a swarm within a specific project namespace. |

### Memory Management
For interacting with the agent's long-term memory.

| Alias | Command | Description |
| :--- | :--- | :--- |
| `cf-memory-stats`| `npx claude-flow@alpha memory stats` | Displays statistics about the memory usage. |
| `cf-memory-list` | `npx claude-flow@alpha memory list` | Lists all items in memory. |
| `cf-memory-query`| `npx claude-flow@alpha memory query` | Queries the memory with a specific search term. |
| `cf-memory-recent`| `npx claude-flow@alpha memory query --recent --limit 5` | Shows the 5 most recent memory entries. |
| `cf-memory-clear`| `npx claude-flow@alpha memory clear` | Clears the entire memory. |
| `cf-memory-export`| `npx claude-flow@alpha memory export` | Exports the memory to a file. |
| `cf-memory-import`| `npx claude-flow@alpha memory import` | Imports memory from a file. |

### SPARC Methodology
Commands for following the **S**ituation, **P**lan, **A**ction, **R**esult, **C**ontext workflow.

| Alias | Command | Description |
| :--- | :--- | :--- |
| `cf-sparc-init` | `npx claude-flow@alpha sparc init` | Initializes a new SPARC workflow. |
| `cf-sparc-plan` | `npx claude-flow@alpha sparc plan` | Creates a plan for the current SPARC task. |
| `cf-sparc-execute`| `npx claude-flow@alpha sparc execute` | Executes the planned actions. |
| `cf-sparc-review`| `npx claude-flow@alpha sparc review` | Reviews the results of the execution. |

### Quick Commands (Shortcuts)
Single-letter and abbreviated aliases for the most common operations.

| Alias | Base Command | Description |
| :--- | :--- | :--- |
| `cfs` | `cf-swarm` | Quick shortcut for `cf-swarm`. |
| `cfh` | `cf-hive` | Quick shortcut for `cf-hive`. |
| `cfr` | `cf-resume` | Quick shortcut for `cf-resume`. |
| `cfst` | `cf-status` | Quick shortcut for `cf-status`. |
| `cfm` | `cf-memory-stats` | Quick shortcut for `cf-memory-stats`. |
| `cfmq` | `cf-memory-query` | Quick shortcut for `cf-memory-query`. |
| `cfa` | `cf-agents-list` | Quick shortcut for `cf-agents-list`. |
| `cfg` | `cf-github-analyze` | Quick shortcut for `cf-github-analyze`. |
| `cfn` | `cf-nexus-swarm` | Quick shortcut for `cf-nexus-swarm`. |

---
## Utility Functions
These are more advanced shell functions that accept arguments for dynamic operations.

* `cf-task "your task description"`
    * Quickly starts a swarm for a given task using the `--claude` flag.
* `cf-hive-ns "your task" "namespace"`
    * Spawns a hive-mind session for a task within a specified namespace.
* `cf-search "query"`
    * Searches the memory and includes recent context in the query.
* `cf-sandbox "template_name" "sandbox_name"`
    * Creates a new Flow Nexus cloud sandbox from a template.
* `cf-session [list | resume <id> | status]`
    * A helper to manage hive-mind sessions. You can `list` all sessions, `resume` a specific session by its ID, or check the `status` of the current session.

Would you like to use this content to create a `README.md` file for your GitHub project? We could add a nice introduction and some usage examples to make it ready to publish.
