```markdown
# 🚀 Claude Code DevPod Configuration

> ✨ **The Ultimate AI Development Environment** ✨  
> Complete setup for Claude Code development with 600+ specialized AI agents using DevPod

---

## 📋 What's Included

### 🔧 Configuration Files
- **🐳 devcontainer.json** - DevContainer configuration with all features, extensions, and auto-launch settings
- **⚙️ setup.sh** - Automated setup script that installs all tools and 600+ Claude agents
- **✅ post-setup.sh** - Verification script that runs after VS Code connects
- **🖥️ tmux-workspace.sh** - Creates a 4-window tmux session optimized for Claude development
- **🤖 additional-agents/** - Directory containing custom agents not in the main collection
  
### 🛠️ Installed Features
- **🐋 Docker-in-Docker** - Run containers inside your development container
- **📦 Node.js and npm** - JavaScript runtime and package manager
- **🦀 Rust 1.70** - Systems programming language
- **🖥️ tmux** - Terminal multiplexer with pre-configured workspace
- **🤖 Claude Code CLI** (`@anthropic-ai/claude-code`) - Official Claude development tools
- **📊 Claude Usage CLI** (`claude-usage-cli`) - Monitor Claude API usage
- **⚡ Claude Flow** - SPARC workflow automation with 54+ built-in agents
- **🎯 600+ Specialized Agents** - From the 610ClaudeSubagents repository plus custom additions

### 🎨 VSCode Extensions (Auto-installed)
- **🤖 Roo Cline** - AI pair programming
- **📄 Gist FS** - GitHub Gist integration
- **🔮 GitHub Copilot** - AI code completion
- **💬 GitHub Copilot Chat** - AI chat interface

---

## 📦 Prerequisites & Installation

### 1️⃣ Install DevPod

#### 🍎 macOS
```bash
# 🍺 Using Homebrew (recommended)
brew install loft-sh/devpod/devpod

# 📥 Or download from releases (Intel Macs)
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-amd64" && sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod

# 🔥 For Apple Silicon Macs
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-arm64" && sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod
```

#### 🪟 Windows
```powershell
# 🍫 Using Chocolatey
choco install devpod

# 🥄 Using Scoop
scoop bucket add loft-sh https://github.com/loft-sh/scoop-bucket.git
scoop install loft-sh/devpod

# 📥 Or download manually from: https://github.com/loft-sh/devpod/releases
```

#### 🐧 Linux
```bash
# 📥 Download and install
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64" && sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod
```

### 2️⃣ Setup DigitalOcean Provider

#### 🌊 Create DigitalOcean Account & API Token
1. 📝 Sign up at [DigitalOcean](https://www.digitalocean.com/)
2. 🔑 Go to API → Personal access tokens
3. ⚡ Generate new token with read/write permissions
4. 📋 Copy the token (you'll need it in the next step)

#### ⚙️ Configure DevPod with DigitalOcean
```bash
# ➕ Add DigitalOcean as provider
devpod provider add digitalocean

# 🎯 Configure with your API token
devpod provider use digitalocean

# 🔐 Set your API token (replace with your actual token)
devpod provider update digitalocean --option DIGITALOCEAN_ACCESS_TOKEN=your_token_here

# 💰 Optional: Set droplet size (default is 8GB RAM)
# 💸 2GB RAM ($12/month) - Good for most development
devpod provider update digitalocean --option DROPLET_SIZE=s-2vcpu-2gb

# 💵 4GB RAM ($24/month) - For memory-intensive work
devpod provider update digitalocean --option DROPLET_SIZE=s-2vcpu-4gb

# 💎 8GB RAM ($48/month) - Current default, best performance
devpod provider update digitalocean --option DROPLET_SIZE=s-4vcpu-8gb
```

### 3️⃣ Fix DevPod Permissions (macOS/Linux)
If you encounter permission errors, run this one-time fix:
```bash
# 🔧 Fix all DevPod permissions (run once)
sudo chown -R $(whoami):staff ~/.devpod && \
find ~/.devpod -type d -exec chmod 755 {} \; && \
find ~/.devpod -type f -exec chmod 644 {} \; && \
find ~/.devpod -name "*provider*" -type f -path "*/binaries/*" -exec chmod +x {} \; && \
find ~/.devpod -name "devpod*" -type f -exec chmod +x {} \;
```

### 4️⃣ Verify Installation
```bash
# 🔍 Check DevPod version
devpod version

# 📋 List available providers
devpod provider list

# 🧪 Test DigitalOcean connection
devpod provider test digitalocean
```

---

## 🚀 Quick Start

### 1️⃣ Create DevPod Workspace
```bash
devpod up https://github.com/marcuspat/turbo-flow-claude --ide vscode
```

This single command:
- 🌊 Creates a DigitalOcean droplet (VM)
- 🐳 Builds a Docker container with all features
- 🤖 Installs all tools and 600+ agents
- ⚙️ Configures the development environment
- 💻 Opens VSCode connected to the container

### 2️⃣ Automatic Setup
When VSCode opens, the workspace automatically:
- **🏗️ postCreateCommand**: Runs setup.sh to install all dependencies and agents
- **🔗 postAttachCommand**: Runs post-setup.sh to verify installations and create tmux workspace
- **🖥️ Terminal Profile**: Auto-connects to tmux workspace when opening terminals

The tmux workspace includes 4 windows:
- **🪟 Window 0 (Claude-1)**: Primary Claude workspace
- **🪟 Window 1 (Claude-2)**: Secondary Claude workspace
- **📊 Window 2 (Claude-Monitor)**: Running `claude-monitor` for usage monitoring
- **⚡ Window 3 (htop)**: System resource monitor

### 3️⃣ Using Claude Agents
```bash
# 📊 List all available agents
ls /workspaces/turbo-flow-claude/agents/*.md | wc -l

# 🔍 Search for specific agents
ls /workspaces/turbo-flow-claude/agents/*test*.md

# 💬 Tell Claude to use agents
"Look in /workspaces/turbo-flow-claude/agents/ and select the best agents for [task]"

# 📖 Load a specific agent
cat /workspaces/turbo-flow-claude/agents/doc-planner.md
```

---

## ⚙️ Management Commands

### 🏗️ Create and Delete Workspace
```bash
# ✨ Create workspace
devpod up https://github.com/marcuspat/turbo-flow-claude --ide vscode

# 🗑️ Delete workspace completely
devpod delete turbo-flow-claude --force

# 💥 Force delete if needed
devpod delete turbo-flow-claude --force
```

### 📋 DevPod Management
```bash
# 📝 List workspaces
devpod list

# 🔗 SSH into workspace
devpod ssh turbo-flow-claude

# ⏸️ Stop workspace (preserves everything, stops billing for compute)
devpod stop turbo-flow-claude

# ▶️ Resume workspace
devpod up turbo-flow-claude --ide vscode
```

---

## 🎯 Complete Prompting Guide - Maximize Your Agent Hivemind

### 🔮 The Master Pattern
Always include this in your prompts to maximize agent effectiveness:
```
"Identify all of the subagents that could be useful in any way for this task and then figure out how to utilize the claude-flow hivemind to maximize your ability to accomplish the task."
```

### 💡 Essential Prompting Examples

#### 🏗️ Example 1: Full Project Development with Visualizations
```
"I need to build a REST API for a todo application. Look in /workspaces/turbo-flow-claude/agents/ and:
1. 🤖 Identify all subagents that could be useful for this task
2. 📊 Create a complete development plan with visualizations
3. 🎨 Break down the plans into many SVG visualizations that are simple and explainable
4. ⚡ Figure out how to utilize the claude-flow hivemind to maximize our ability to accomplish this
5. 🔗 Chain the appropriate agents together for planning, implementation, testing, and deployment
6. 🎯 Create visualizations of what I would build first
7. 👥 Make sure visualizations are extremely explainable and understandable by a human being"
```

#### 📈 Example 2: Complex Analysis with Visual Breakdowns
```
"Analyze this codebase and create visualizations of what I would build first. 
- 📊 Break down all plans into many many visualizations that would be useful to someone about to develop this project
- 🎨 Make sure it's done in simple SVG so it's extremely explainable and understandable by a human being
- 🎯 That is your ultimate goal
- 🤖 Identify all subagents that could be useful in any way for this task
- ⚡ Figure out how to utilize the claude-flow hivemind to maximize your ability to accomplish the task"
```

#### 🚀 Example 3: Business and Life Enhancement (500+ Non-Coding Agents)
```
"I want to improve my startup's development workflow. There are agents to help with all aspects of your business and life. 500+ Non Coding Agents. Claude Code has access to the internet and any MCP tools you give it. Simply tell it what you want and then tell it to:
- 🤖 Identify all subagents that could be useful for workflow optimization
- 📊 Create visual diagrams of the current vs improved workflow
- ⚡ Utilize the claude-flow hivemind to create a comprehensive improvement plan
- 👥 Include agents for project management, team coordination, and productivity"
```

#### 🏗️ Example 4: Infrastructure Research & Implementation
```
"Draft detailed research into using rackspace spot H100-enabled servers to spawn a self hosted LLM service on rackspace spot compute platform using kubernetes. Put the output into research/rackspace folder. Draw information from youtube transcripts (tools/youtube-transcript-api), github repos, blog posts, and any web-accessible source. Draft detailed instructions to create the kubernetes manifests to serve the likes of qwen3 coder, kimi k2, and other state of the art models. Remember the current date is August 22, 2025. 🚀 Spawn 5 agents to work on this process concurrently. Use the available MCP servers to conduct this research. Keep iterating until a clear path to implementation exists. Include cost analysis on a per 1 million token basis based on a H100 bid price of $0.71/hr."
```

#### 🎨 Example 5: Creative Animation Project with Visual Verification
```
"Create a folder in /front-end-demo/ create a detailed animation using anime.js highlighting the benefits of pineapple on pizza. 🚀 Spawn 3 agents to work on this project in parallel. Use the available MCP servers. Install playwright and use playwright to generate screenshots of the created webpage animation using a 400x750px viewport. Create an animation where the pizza spins as the user scrolls down where pineapple slices are added or removed from the pizza as the user scrolls. Keep iterating until the animation is smooth and will reliably work on mobile devices. If stuck, contact deep research using web-accessible sources, github repos, and youtube video transcripts to identify solutions."
```

#### 🔬 Example 6: Multi-Agent Research Coordination
```
"I need to research Kubernetes LLM serving, cost optimization, and deployment patterns. Current date is August 22, 2025.
- 🤖 Spawn specialized agents for: Infrastructure (kimi k2), Cost analysis (Triton), GPU optimization ($0.71/hr H100 spot)
- ⚡ Create parallel deployment strategies using available MCP servers
- 🔄 Keep iterating until implementation path is clear
- 🔍 Use web-accessible sources, GitHub repos, and YouTube video transcripts
- 🎯 Coordinate findings across all agents to identify optimal solutions
- 🤔 Ask yourself: should I use swarm or hivemind for this task?"
```

---

## 📁 File Structure
```
devpods/
├── 🐳 devcontainer.json      # Container configuration
├── ⚙️ setup.sh              # Automated setup script
├── ✅ post-setup.sh         # Verification script (runs after VS Code connects)
├── 🖥️ tmux-workspace.sh     # Tmux session creator
├── 📖 README.md            # This file
└── 🤖 additional-agents/   # Custom agents directory
    ├── doc-planner.md
    └── microtask-breakdown.md
```

## 🏗️ After Setup
Your workspace will have:
```
/workspaces/turbo-flow-claude/
├── 🤖 agents/                    # 600+ AI agents
│   ├── doc-planner.md
│   ├── microtask-breakdown.md
│   └── ... (600+ more)
├── 📝 claude.md                  # Claude configuration
├── ⚡ claude-flow               # SPARC workflow tools
└── 📁 [your project files]
```

---

## 🖥️ Tmux Navigation
- `Ctrl+b` then `0-3`: 🔄 Switch between windows
- `Ctrl+b` then `n`: ➡️ Next window
- `Ctrl+b` then `p`: ⬅️ Previous window
- `Ctrl+b` then `d`: 🔌 Detach from session
- `tmux attach -t workspace`: 🔗 Reattach to session

### 🔍 Verification Commands
```bash
# 📊 Quick system check
echo "=== 🔍 SYSTEM CHECK ==="
echo "🤖 Agents: $(ls -1 /workspaces/turbo-flow-claude/agents/*.md 2>/dev/null | wc -l)"
echo "🤖 Claude-code: $(which claude-code && echo '✅ Installed' || echo '❌ Missing')"
echo "📊 Claude-usage: $(which claude-usage-cli && echo '✅ Installed' || echo '❌ Missing')"
echo "⚡ Claude-flow: $(ls /workspaces/turbo-flow-claude/claude-flow 2>/dev/null && echo '✅ Installed' || echo '❌ Missing')"
echo "🖥️ Tmux: $(which tmux && echo '✅ Installed' || echo '❌ Missing')"
```

---

## 🏗️ Architecture Overview
```
💻 Your Computer
    ↓ (DevPod CLI)
🌊 DigitalOcean Droplet (VM)
    ├── 🐋 Docker Engine
    └── 🐳 DevContainer
         ├── 📁 Your Code
         ├── 🤖 600+ AI Agents
         ├── 🛠️ Development Tools
         ├── 🐋 Docker-in-Docker
         └── 🖥️ VSCode Server
              ↓
         💻 Your VSCode (connected)
```

---

## 🛠️ Troubleshooting

### 🔧 Permission Issues
```bash
# 🔧 Fix DevPod permissions (all in one command)
sudo chown -R $(whoami):staff ~/.devpod && \
find ~/.devpod -type d -exec chmod 755 {} \; && \
find ~/.devpod -type f -exec chmod 644 {} \; && \
find ~/.devpod -name "*provider*" -type f -path "*/binaries/*" -exec chmod +x {} \; && \
find ~/.devpod -name "devpod*" -type f -exec chmod +x {} \;
```

### 🔌 Connection Issues
1. 🚪 Close VSCode completely: `killall "Code"`
2. 🔄 Retry: `devpod up turbo-flow-claude --ide vscode`

### ✅ Verify Agent Installation
```bash
# 🔍 Check specific agents exist
ls -la /workspaces/turbo-flow-claude/agents/doc-planner.md
ls -la /workspaces/turbo-flow-claude/agents/microtask-breakdown.md
```

---

## 🔄 Updates and Maintenance

To update the setup (new agents, tools, etc.):
1. 📝 Modify files in this directory
2. 🚀 Commit and push to repository
3. 🗑️ Delete and recreate workspace to apply changes:
```bash
devpod delete turbo-flow-claude --force
devpod up https://github.com/marcuspat/turbo-flow-claude --ide vscode
```

### 💰 Recommended Droplet Sizes
```bash
# 📏 Before creating workspace, configure size:

# 💸 2GB RAM ($12/month) - Good for most development
devpod provider update digitalocean --option DROPLET_SIZE=s-2vcpu-2gb

# 💵 4GB RAM ($24/month) - For memory-intensive work
devpod provider update digitalocean --option DROPLET_SIZE=s-2vcpu-4gb

# 💎 Current default: 8GB RAM ($48/month)
```

### 💰 Save Money When Not Working
```bash
# ⏸️ Stop workspace (preserves everything, stops billing for compute)
devpod stop turbo-flow-claude

# ▶️ Resume workspace
devpod up turbo-flow-claude --ide vscode
```

---

## 🔗 Resources
- 📚 [DevPod Documentation](https://devpod.sh/docs)
- ⚡ [Claude Flow SPARC](https://github.com/ruvnet/claude-flow)
- 🤖 [610ClaudeSubagents Repository](https://github.com/ChrisRoyse/610ClaudeSubagents) - The source of 600+ specialized Claude agents
- 📊 [Claude Usage Monitor CLI](https://github.com/jedarden/claude-usage-monitor-cli) - Track your Claude API usage (Note: We use the npm version `claude-usage-cli`)

---

> 🎉 **Note**: This setup provides a complete Claude development environment with extensive AI agent capabilities. The 600+ agents cover everything from code review to test generation, documentation planning to performance optimization.

✨ **Happy Coding with AI!** ✨
```
