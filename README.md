# Turbo-Flow Claude v1.0 Alpha Enhanced AI Development Environment 

# 🚀 Claude Code DevPod Configuration 

[![DevPod](https://img.shields.io/badge/DevPod-Ready-blue?style=flat-square&logo=docker)](https://devpod.sh)
[![Claude Flow](https://img.shields.io/badge/Claude%20Flow-SPARC-purple?style=flat-square)](https://github.com/ruvnet/claude-flow)
[![Agents](https://img.shields.io/badge/Agents-600+-green?style=flat-square)](https://github.com/ChrisRoyse/610ClaudeSubagents)
[![TDD](https://img.shields.io/badge/TDD-London%20School-orange?style=flat-square)](https://github.com/ruvnet/claude-flow)

> 🎯 **The Ultimate Claude Development Environment**: A complete DevPod workspace featuring 600+ specialized AI agents, SPARC methodology, advanced monitoring, and optimized Claude Code workflows.

## 🌟 What We've Enhanced

### 🔥 Recent Major Upgrades

#### 📋 **Enhanced Configuration System**
- ✅ **Merged CLAUDE.md files** - Unified optimal configuration from multiple sources
- ✅ **Created FEEDCLAUDE.md** - Streamlined instruction set for prompt engineering
- ✅ **Enhanced file organization** - Never save to root, structured directory approach
- ✅ **Concurrent execution patterns** - All operations in single messages for 6x speed

#### 🤖 **Mandatory Development Fundamentals**
- 🔴 **Doc-Planner Agent** - MANDATORY for ALL tasks (SPARC workflow, TDD methodology)
- 🔴 **Microtask-Breakdown Agent** - MANDATORY atomic 10-minute task decomposition
- 🎯 **Master Prompting Pattern** - Optimized agent identification and hivemind utilization
- 🧪 **Playwright Integration** - Visual verification for all frontend development

#### 📊 **Advanced Monitoring & Analytics**
- 🔍 **Claude Monitor by @Maciek-roboblog** - ML-based predictions, Rich UI, real-time analytics
- 📈 **Session limit detection** - Intelligent usage monitoring
- 🎨 **Beautiful terminal interface** - Enhanced developer experience
- ⚡ **Performance tracking** - 84.8% SWE-Bench solve rate, 2.8-4.4x speed improvement

#### 🔄 **Enhanced Development Protocols**
- 🎯 **Recursive Problem Solving** - Break complex problems to atomic units
- 🔄 **Iterate Until Success** - Never give up until goal achieved
- 🔍 **Deep Research Protocol** - Auto-search YouTube, GitHub, blogs when stuck
- 📅 **Date Context Integration** - Current date: Saturday, August 23, 2025

---

## 📋 How to Use FEEDCLAUDE.md

### 🎯 **What is FEEDCLAUDE.md?**
FEEDCLAUDE.md is a **streamlined instruction set** (83% smaller than the full CLAUDE.md) containing only the essential prompting rules and execution patterns needed for optimal Claude performance.

### 🚀 **3 Ways to Use FEEDCLAUDE.md:**

#### 1️⃣ **System Prompt Integration**
```bash
# 📋 Copy FEEDCLAUDE.md content into your Claude system prompt
cat /workspaces/turbo-flow-claude/FEEDCLAUDE.md

# 💡 Pro Tip: Include relevant sections based on your task type
```

#### 2️⃣ **Prompt Engineering Reference**
```bash
# 🔍 Quick reference for specific patterns
grep -A 10 "Master Prompting Pattern" /workspaces/turbo-flow-claude/FEEDCLAUDE.md
grep -A 15 "Agent Coordination Protocol" /workspaces/turbo-flow-claude/FEEDCLAUDE.md
grep -A 20 "Correct Execution Pattern" /workspaces/turbo-flow-claude/FEEDCLAUDE.md
```

#### 3️⃣ **Context Injection for Specific Tasks**
```bash
# 🎯 For development tasks, include these sections in your prompt:
echo "=== CONTEXT FROM FEEDCLAUDE.md ==="
echo "$(grep -A 5 'MANDATORY.*Doc-Planner' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"
echo "$(grep -A 10 'Agent Count Rules' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"
echo "$(grep -A 15 'Correct Execution Pattern' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"
```

---

## 🛠️ Prerequisites & Installation

### 📥 1. Install DevPod

#### 🍎 **macOS**
```bash
# 🍺 Using Homebrew (recommended)
brew install loft-sh/devpod/devpod

# 📦 Or download from releases (Intel)
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-amd64" && sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod

# 🔥 For Apple Silicon Macs
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-darwin-arm64" && sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod
```

#### 🪟 **Windows**
```powershell
# 🍫 Using Chocolatey
choco install devpod

# 🥄 Using Scoop
scoop bucket add loft-sh https://github.com/loft-sh/scoop-bucket.git
scoop install loft-sh/devpod

# 📦 Or download manually from: https://github.com/loft-sh/devpod/releases
```

#### 🐧 **Linux**
```bash
# 📦 Download and install
curl -L -o devpod "https://github.com/loft-sh/devpod/releases/latest/download/devpod-linux-amd64" && sudo install -c -m 0755 devpod /usr/local/bin && rm -f devpod
```

---

## 🌍 Provider Configuration

### 🌊 **DigitalOcean Provider (Recommended)**

#### 🔑 **Setup Account & API Token**
1. 📝 Sign up at [DigitalOcean](https://www.digitalocean.com/)
2. 🔗 Go to **API → Personal access tokens**
3. ✨ Generate new token with **read/write permissions**
4. 📋 Copy the token

#### ⚙️ **Configure DevPod**
```bash
# 🌊 Add DigitalOcean provider
devpod provider add digitalocean
devpod provider use digitalocean

# 🔐 Set API token
devpod provider update digitalocean --option DIGITALOCEAN_ACCESS_TOKEN=your_token_here

# 💰 Configure instance size
# 💡 2GB RAM ($12/month) - Good for most development
devpod provider update digitalocean --option DROPLET_SIZE=s-2vcpu-2gb

# 🚀 4GB RAM ($24/month) - For memory-intensive work
devpod provider update digitalocean --option DROPLET_SIZE=s-2vcpu-4gb

# 🔥 8GB RAM ($48/month) - Default, best performance
devpod provider update digitalocean --option DROPLET_SIZE=s-4vcpu-8gb
```

### ☁️ **AWS Provider**

#### 🔑 **Setup AWS Credentials**
```bash
# 📦 Install AWS CLI first
pip install awscli
aws configure  # Enter your access key, secret, and region

# ☁️ Add AWS provider
devpod provider add aws
devpod provider use aws

# ⚙️ Configure instance type and region
devpod provider update aws --option AWS_INSTANCE_TYPE=t3.medium
devpod provider update aws --option AWS_REGION=us-east-1

# 🔐 Optional: Set specific credentials
devpod provider update aws --option AWS_ACCESS_KEY_ID=your_access_key
devpod provider update aws --option AWS_SECRET_ACCESS_KEY=your_secret_key
```

#### 💰 **Popular AWS Instance Types**
```bash
# 💡 t3.micro (1GB RAM, $8/month) - Basic development
devpod provider update aws --option AWS_INSTANCE_TYPE=t3.micro

# 🚀 t3.medium (4GB RAM, $30/month) - Recommended
devpod provider update aws --option AWS_INSTANCE_TYPE=t3.medium

# 🔥 t3.large (8GB RAM, $60/month) - Heavy workloads
devpod provider update aws --option AWS_INSTANCE_TYPE=t3.large
```

### 🔵 **Azure Provider**

#### 🔑 **Setup Azure Account**
```bash
# 📦 Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash  # Linux
brew install azure-cli  # macOS

# 🔐 Login to Azure
az login

# 🔵 Add Azure provider
devpod provider add azure
devpod provider use azure

# ⚙️ Configure VM size and location
devpod provider update azure --option AZURE_VM_SIZE=Standard_B2s
devpod provider update azure --option AZURE_LOCATION=eastus

# 🏷️ Set resource group
devpod provider update azure --option AZURE_RESOURCE_GROUP=devpod-resources
```

#### 💰 **Popular Azure VM Sizes**
```bash
# 💡 Standard_B1s (1GB RAM, ~$8/month) - Basic
devpod provider update azure --option AZURE_VM_SIZE=Standard_B1s

# 🚀 Standard_B2s (4GB RAM, ~$30/month) - Recommended
devpod provider update azure --option AZURE_VM_SIZE=Standard_B2s

# 🔥 Standard_B4ms (16GB RAM, ~$120/month) - Heavy workloads
devpod provider update azure --option AZURE_VM_SIZE=Standard_B4ms
```

### 🌥️ **Google Cloud Provider**

#### 🔑 **Setup GCP Credentials**
```bash
# 📦 Install gcloud CLI
curl https://sdk.cloud.google.com | bash  # Linux/macOS
exec -l $SHELL  # Restart shell

# 🔐 Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 🌥️ Add GCP provider
devpod provider add gcp
devpod provider use gcp

# ⚙️ Configure machine type and zone
devpod provider update gcp --option GOOGLE_PROJECT_ID=your-project-id
devpod provider update gcp --option GOOGLE_ZONE=us-central1-a
devpod provider update gcp --option GOOGLE_MACHINE_TYPE=e2-medium
```

#### 💰 **Popular GCP Machine Types**
```bash
# 💡 e2-micro (1GB RAM, ~$6/month) - Basic
devpod provider update gcp --option GOOGLE_MACHINE_TYPE=e2-micro

# 🚀 e2-medium (4GB RAM, ~$25/month) - Recommended
devpod provider update gcp --option GOOGLE_MACHINE_TYPE=e2-medium

# 🔥 e2-standard-4 (16GB RAM, ~$100/month) - Heavy workloads
devpod provider update gcp --option GOOGLE_MACHINE_TYPE=e2-standard-4
```

### 🏢 **Rackspace Provider**

#### 🔑 **Setup Rackspace Cloud Servers**
```bash
# 📦 First, ensure you have your Rackspace credentials
# Get these from Rackspace Cloud Control Panel → Account Settings → API Keys

# 🏢 Add Rackspace provider
devpod provider add rackspace
devpod provider use rackspace

# 🔐 Configure credentials and region
devpod provider update rackspace --option RACKSPACE_USERNAME=your_username
devpod provider update rackspace --option RACKSPACE_API_KEY=your_api_key
devpod provider update rackspace --option RACKSPACE_REGION=DFW  # or IAD, ORD, LON, HKG, SYD

# 💰 Configure server flavor
devpod provider update rackspace --option RACKSPACE_FLAVOR=general1-2  # 2GB RAM, recommended
```

#### 💰 **Popular Rackspace Flavors**
```bash
# 💡 general1-1 (1GB RAM, ~$15/month) - Basic development
devpod provider update rackspace --option RACKSPACE_FLAVOR=general1-1

# 🚀 general1-2 (2GB RAM, ~$30/month) - Recommended for Claude development
devpod provider update rackspace --option RACKSPACE_FLAVOR=general1-2

# 🔥 general1-4 (4GB RAM, ~$60/month) - Heavy workloads
devpod provider update rackspace --option RACKSPACE_FLAVOR=general1-4

# ⚡ compute1-8 (8GB RAM, ~$120/month) - High performance computing
devpod provider update rackspace --option RACKSPACE_FLAVOR=compute1-8
```

#### 🌍 **Rackspace Regions**
```bash
# 🇺🇸 US Regions
devpod provider update rackspace --option RACKSPACE_REGION=DFW  # Dallas
devpod provider update rackspace --option RACKSPACE_REGION=IAD  # Northern Virginia
devpod provider update rackspace --option RACKSPACE_REGION=ORD  # Chicago

# 🌍 International Regions
devpod provider update rackspace --option RACKSPACE_REGION=LON  # London
devpod provider update rackspace --option RACKSPACE_REGION=HKG  # Hong Kong
devpod provider update rackspace --option RACKSPACE_REGION=SYD  # Sydney
```

### 🖥️ **Local Docker Provider**

#### ⚙️ **Setup Local Development**
```bash
# 🐳 Ensure Docker is running
docker --version

# 🏠 Add Docker provider
devpod provider add docker
devpod provider use docker

# ⚙️ No additional configuration needed!
```

### 🔧 **Fix DevPod Permissions (macOS/Linux)**
If you encounter permission errors, run this one-time fix:
```bash
# 🛠️ Fix all DevPod permissions (run once)
sudo chown -R $(whoami):staff ~/.devpod && \
find ~/.devpod -type d -exec chmod 755 {} \; && \
find ~/.devpod -type f -exec chmod 644 {} \; && \
find ~/.devpod -name "*provider*" -type f -path "*/binaries/*" -exec chmod +x {} \; && \
find ~/.devpod -name "devpod*" -type f -exec chmod +x {} \;
```

### ✅ **Verify Installation**
```bash
# 🔍 Check DevPod version
devpod version

# 📋 List available providers
devpod provider list

# 🧪 Test your chosen provider
devpod provider test digitalocean  # or aws, azure, gcp, docker
```

---

## 📦 What's Included

### 📄 **Enhanced Configuration Files**
- 🐳 **devcontainer.json** - DevContainer config with all features, extensions, auto-launch
- 🚀 **setup.sh** - Automated setup script installing all tools and 600+ Claude agents
- ✅ **post-setup.sh** - Verification script running after VS Code connects
- 🖥️ **tmux-workspace.sh** - Creates 4-window tmux session optimized for Claude development
- 🤖 **additional-agents/** - Custom agents including mandatory doc-planner & microtask-breakdown
- 📋 **FEEDCLAUDE.md** - Streamlined prompting instructions
- 📝 **Enhanced CLAUDE.md** - Unified optimal configuration
  
### 🎯 **Installed Features & Tools**
- 🐳 **Docker-in-Docker** - Run containers inside your development container
- 🟢 **Node.js and npm** - JavaScript runtime and package manager
- 🦀 **Rust 1.70** - Systems programming language
- 🖥️ **tmux** - Terminal multiplexer with pre-configured workspace
- 🤖 **Claude Code CLI** (`@anthropic-ai/claude-code`) - Official Claude development tools
- 📊 **Advanced Claude Monitor** - ML-based usage monitoring with Rich UI
- ⚡ **Claude Flow** - SPARC workflow automation with 54+ built-in agents
- 🎯 **600+ Specialized Agents** - From 610ClaudeSubagents repository plus custom additions
- 🧪 **Playwright** - Visual verification and screenshot automation

### 🎨 **VSCode Extensions (Auto-installed)**
- 🤖 **Roo Cline** - AI pair programming
- 📝 **Gist FS** - GitHub Gist integration
- 🧠 **GitHub Copilot** - AI code completion
- 💬 **GitHub Copilot Chat** - AI chat interface

---

## 🚀 Quick Start - Two Ways to Use This Environment

### 🎯 **Option 1: Standalone DevPod Workspace (Recommended)**

Use this as a complete development environment for any project:

```bash
devpod up https://github.com/marcuspat/turbo-flow-claude --ide vscode
```

This single command:
- 🌊 Creates a cloud instance (DigitalOcean/AWS/Azure/GCP/Rackspace) or local container
- 🐳 Builds a Docker container with all features
- 🛠️ Installs all tools and 600+ agents
- ⚙️ Configures the development environment
- 💻 Opens VSCode connected to the container
- 📁 Provides a clean workspace ready for any project

### 🔄 **Option 2: Integrate with Existing Project**

Add this enhanced Claude environment to your existing project:

#### 📋 **Step 1: Clone the Configuration**
```bash
# Clone this repository
git clone https://github.com/marcuspat/turbo-flow-claude claude-config

# Or download specific files you need
curl -O https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/.devcontainer.json
curl -O https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh
```

#### 📁 **Step 2: Copy to Your Project**
```bash
# Navigate to your existing project
cd /path/to/your/project

# Copy the essential directories
cp -r /path/to/claude-config/.devcontainer ./
cp -r /path/to/claude-config/devpods ./

# Alternative: Copy just what you need
mkdir -p .devcontainer
cp /path/to/claude-config/.devcontainer.json ./.devcontainer/
cp /path/to/claude-config/devpods/setup.sh ./
cp /path/to/claude-config/devpods/post-setup.sh ./
cp /path/to/claude-config/devpods/tmux-workspace.sh ./
```

#### 🔄 **Step 3: Launch Your Enhanced Project**
```bash
# From your project root directory
devpod up . --ide vscode
# From you local workstation pulling it across the wire
devpod up https://github.com/username/reponame --ide vscode
```

---

## 🔧 Automatic Context Loading

After setup, you'll have **automatic context loading** for Claude Flow commands:

### 🎯 **Enhanced Claude Flow Commands**
```bash
# These commands automatically load CLAUDE.md + doc-planner + microtask-breakdown
cf-swarm "build a tic-tac-toe game"         # Swarm with full context
cf-hive "create a REST API"                 # Hive-mind with full context  
cf "memory stats"                           # Any Claude Flow command with context
```

### 🤖 **What Gets Loaded Automatically**
- **📋 CLAUDE.md** - All development rules and patterns
- **🎯 doc-planner.md** - MANDATORY planning agent (SPARC methodology)
- **🔧 microtask-breakdown.md** - MANDATORY task decomposition agent
- **📚 Agent Library Info** - Notification about 600+ available agents

### 🔄 **Before vs After Setup**
```bash
# ❌ OLD WAY (manual context loading)
(cat CLAUDE.md && cat agents/doc-planner.md && cat agents/microtask-breakdown.md) | npx claude-flow@alpha swarm "build game" --claude

# ✅ NEW WAY (automatic)
cf-swarm "build game"
```

### 💡 **Usage Examples**
```bash
# 🎮 Game development
cf-swarm "build a multiplayer tic-tac-toe game with real-time updates"

# 🌐 Web development  
cf-hive "create a full-stack blog with authentication and admin panel"

# 🔍 Analysis tasks
cf "analyze this codebase and suggest improvements"

# 📊 Any Claude Flow command
cf "memory query recent --limit 10"
cf "neural train --pattern coordination"
```

### 🚀 **Available Context Commands**
```bash
# Main context-loaded commands
cf-swarm "task"          # Swarm with auto-loaded context
cf-hive "task"           # Hive-mind spawn with auto-loaded context  
cf "any command"         # General Claude Flow with context

# Quick aliases
dsp                      # claude --dangerously-skip-permissions

# Manual context loading (optional)
load-claude              # Show CLAUDE.md
load-doc-planner         # Show doc-planner.md  
load-microtask           # Show microtask-breakdown.md
load-all-context         # Show all context files

# Agent discovery
list-agents              # ls agents/
find-agent "keyword"     # find agents matching keyword
count-agents             # count total agents
```

---

### 🔄 **2. Automatic Setup**
When VSCode opens, the workspace automatically:
- 🚀 **postCreateCommand**: Runs setup.sh to install dependencies and agents
- ✅ **postAttachCommand**: Runs post-setup.sh to verify installations and create tmux workspace
- 🖥️ **Terminal Profile**: Auto-connects to tmux workspace when opening terminals

The **🖥️ tmux workspace** includes 4 optimized windows:
- 🎯 **Window 0 (Claude-1)**: Primary Claude workspace
- ⚡ **Window 1 (Claude-2)**: Secondary Claude workspace
- 📊 **Window 2 (Claude-Monitor)**: Running advanced `claude-monitor` for usage monitoring
- 📈 **Window 3 (htop)**: System resource monitor

### 🤖 **3. Using Claude Agents**
```bash
# 🚀 NEW: Use context-loaded Claude Flow (RECOMMENDED)
cf-swarm "Look at available agents and build a REST API"
cf-hive "Select appropriate agents for a complex e-commerce platform"

# 📊 Check what context is loaded
load-all-context  # Manual command to see loaded context

# 📊 List all available agents
ls /workspaces/turbo-flow-claude/agents/*.md | wc -l

# 🔍 Search for specific agents
ls /workspaces/turbo-flow-claude/agents/*test*.md

# 💬 Tell Claude to use agents (traditional method)
"Look in /workspaces/turbo-flow-claude/agents/ and select the best agents for [task]"

# 📝 Load mandatory agents (now automatic with cf- commands)
cat /workspaces/turbo-flow-claude/agents/doc-planner.md
cat /workspaces/turbo-flow-claude/agents/microtask-breakdown.md
```

---

## 🎛️ Management Commands

### 🚀 **Create and Delete Workspace**
```bash
# ✨ Create workspace
devpod up https://github.com/marcuspat/turbo-flow-claude --ide vscode

# 🗑️ Delete workspace completely
devpod delete turbo-flow-claude --force

# ⚡ Force delete if needed
devpod delete turbo-flow-claude --force
```

### 🎯 **DevPod Management**
```bash
# 📋 List workspaces
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

### 🌟 **The Master Pattern**
Always include this in your prompts to maximize agent effectiveness:
```
"🤖 Identify all of the subagents that could be useful in any way for this task and then figure out how to utilize the claude-flow hivemind to maximize your ability to accomplish the task."
```

### 🎨 **Essential Prompting Examples**

#### 🚀 **Example 1: Full Project Development with Visualizations**
```
"🎯 I need to build a REST API for a todo application. Look in /workspaces/turbo-flow-claude/agents/ and:
1. 🔍 Identify all subagents that could be useful for this task
2. 📋 Create a complete development plan with visualizations
3. 🎨 Break down the plans into many SVG visualizations that are simple and explainable
4. 🤖 Figure out how to utilize the claude-flow hivemind to maximize our ability to accomplish this
5. 🔗 Chain the appropriate agents together for planning, implementation, testing, and deployment
6. 🎪 Create visualizations of what I would build first
7. 📖 Make sure visualizations are extremely explainable and understandable by a human being"
```

#### 📊 **Example 2: Complex Analysis with Visual Breakdowns**
```
"📈 Analyze this codebase and create visualizations of what I would build first. 
- 🎨 Break down all plans into many many visualizations that would be useful to someone about to develop this project
- 🖼️ Make sure it's done in simple SVG so it's extremely explainable and understandable by a human being
- 🎯 That is your ultimate goal
- 🤖 Identify all subagents that could be useful in any way for this task
- 🚀 Figure out how to utilize the claude-flow hivemind to maximize your ability to accomplish the task"
```

#### 💼 **Example 3: Business and Life Enhancement (500+ Non-Coding Agents)**
```
"💡 I want to improve my startup's development workflow. There are agents to help with all aspects of your business and life. 500+ Non Coding Agents. Claude Code has access to the internet and any MCP tools you give it. Simply tell it what you want and then tell it to:
- 🔍 Identify all subagents that could be useful for workflow optimization
- 📊 Create visual diagrams of the current vs improved workflow
- 🤖 Utilize the claude-flow hivemind to create a comprehensive improvement plan
- 👥 Include agents for project management, team coordination, and productivity"
```

#### 🏗️ **Example 4: Infrastructure Research & Implementation**
```
"🔬 Draft detailed research into using rackspace spot H100-enabled servers to spawn a self hosted LLM service on rackspace spot compute platform using kubernetes. Put the output into research/rackspace folder. 
📊 Draw information from youtube transcripts (tools/youtube-transcript-api), github repos, blog posts, and any web-accessible source. 
📝 Draft detailed instructions to create the kubernetes manifests to serve the likes of qwen3 coder, kimi k2, and other state of the art models. 
📅 Remember the current date is August 23, 2025. 
🤖 Spawn 5 agents to work on this process concurrently. 
⚡ Use the available MCP servers to conduct this research. 
🔄 Keep iterating until a clear path to implementation exists. 
💰 Include cost analysis on a per 1 million token basis based on a H100 bid price of $0.71/hr."
```

#### 🎬 **Example 5: Creative Animation Project with Visual Verification**
```
"🎨 Create a folder in /front-end-demo/ create a detailed animation using anime.js highlighting the benefits of pineapple on pizza. 
🤖 Spawn 3 agents to work on this project in parallel. 
⚡ Use the available MCP servers. 
🧪 Install playwright and use playwright to generate screenshots of the created webpage animation using a 400x750px viewport. 
🎪 Create an animation where the pizza spins as the user scrolls down where pineapple slices are added or removed from the pizza as the user scrolls. 
🔄 Keep iterating until the animation is smooth and will reliably work on mobile devices. 
🔍 If stuck, contact deep research using web-accessible sources, github repos, and youtube video transcripts to identify solutions."
```

### 🎯 **Key Prompting Principles**

1. 📅 **Always specify the current date** - "Remember the current date is August 23, 2025"
2. 🎯 **Define clear end goals** - "Define the end result" - Agents work better with specific targets
3. 🔄 **Use iterative refinement** - "Keep iterating until [specific condition]" - "Iterate until goal"
4. 📸 **Leverage visual verification** - "Install and use playwright for screenshots" - GUI testing
5. 🔍 **Combine research and implementation** - "If stuck do deep research" using all sources
6. 🤔 **Choose the right pattern** - "Ask Claude whether to use swarm or hivemind"
7. ⚡ **Feed MCP into prompts** - "Feed MCP into Claude prompts" for context
8. 🤖 **Spawn agents concurrently** - "Spawn 5 agents to work on this process concurrently"
9. 📁 **Specify output locations** - "Put the output into research/rackspace folder"
10. 🔄 **Include fallback strategies** - "If stuck, do deep research to come up with solutions to try"

---

## 📂 File Structure
```
devpods/
├── 🐳 devcontainer.json      # Container configuration
├── 🚀 setup.sh              # Automated setup script
├── ✅ post-setup.sh         # Verification script (runs after VS Code connects)
├── 🖥️ tmux-workspace.sh     # Tmux session creator
├── 📝 README.md             # This file
├── 📋 FEEDCLAUDE.md         # Streamlined prompting instructions
├── 📄 CLAUDE.md            # Enhanced unified configuration
└── 🤖 additional-agents/   # Custom agents directory
    ├── doc-planner.md
    └── microtask-breakdown.md
```

## 📁 After Setup
Your workspace will have:
```
/workspaces/turbo-flow-claude/
├── 🤖 agents/                    # 600+ AI agents
│   ├── doc-planner.md
│   ├── microtask-breakdown.md
│   └── ... (600+ more)
├── 📋 CLAUDE.md                  # Claude configuration
├── ⚡ claude-flow               # SPARC workflow tools
└── 📁 [your project files]
```

## 🖥️ Tmux Navigation
- `Ctrl+b` then `0-3`: Switch between windows
- `Ctrl+b` then `n`: Next window
- `Ctrl+b` then `p`: Previous window
- `Ctrl+b` then `d`: Detach from session
- `tmux attach -t workspace`: Reattach to session

### ✅ Verification Commands
```bash
# 🔍 Quick system check
echo "=== SYSTEM CHECK ==="
echo "Agents: $(ls -1 /workspaces/turbo-flow-claude/agents/*.md 2>/dev/null | wc -l)"
echo "Claude-code: $(which claude-code && echo '✓ Installed' || echo '✗ Missing')"
echo "Claude-monitor: $(which claude-monitor && echo '✓ Installed' || echo '✗ Missing')"
echo "Claude-flow: $(ls /workspaces/turbo-flow-claude/claude-flow 2>/dev/null && echo '✓ Installed' || echo '✗ Missing')"
echo "Tmux: $(which tmux && echo '✓ Installed' || echo '✗ Missing')"
```

## 🔧 Troubleshooting

### 🔐 Permission Issues
```bash
# 🛠️ Fix DevPod permissions (all in one command)
sudo chown -R $(whoami):staff ~/.devpod && \
find ~/.devpod -type d -exec chmod 755 {} \; && \
find ~/.devpod -type f -exec chmod 644 {} \; && \
find ~/.devpod -name "*provider*" -type f -path "*/binaries/*" -exec chmod +x {} \; && \
find ~/.devpod -name "devpod*" -type f -exec chmod +x {} \;
```

### 🔗 Connection Issues
1. 🚪 Close VSCode completely: `killall "Code"`
2. 🔄 Retry: `devpod up turbo-flow-claude --ide vscode`

### ✅ Verify Agent Installation
```bash
# 🔍 Check specific agents exist
ls -la /workspaces/turbo-flow-claude/agents/doc-planner.md
ls -la /workspaces/turbo-flow-claude/agents/microtask-breakdown.md
```

## 🔄 Updates and Maintenance

To update the setup (new agents, tools, etc.):
1. 📝 Modify files in this directory
2. 📤 Commit and push to repository
3. 🔄 Delete and recreate workspace to apply changes:
```bash
devpod delete turbo-flow-claude --force
devpod up https://github.com/marcuspat/turbo-flow-claude --ide vscode
```

### 💰 Money-Saving Tips
```bash
# ⏸️ Stop workspace (preserves everything, stops billing for compute)
devpod stop turbo-flow-claude

# ▶️ Resume workspace
devpod up turbo-flow-claude --ide vscode
```

## 📚 Resources
- 📖 [DevPod Documentation](https://devpod.sh/docs)
- ⚡ [Claude Flow SPARC](https://github.com/ruvnet/claude-flow) - by Reuven Cohen.
- 🤖 [610ClaudeSubagents Repository](https://github.com/ChrisRoyse/610ClaudeSubagents) - The source of 600+ specialized Claude agents by Christopher Royse.
- 📊 [Claude Code Usage Monitor](https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor) - Advanced Claude usage monitor with ML-based predictions and Rich UI by Maciek-roboblog.
- 🤖 [Terminal Jarvis](https://github.com/BA-CalderonMorales/terminal-jarvis) - AI-powered terminal assistant for enhanced development workflows. By Brandon Calderon-Morales

---

🎯 **Note**: This setup provides a complete Claude development environment with extensive AI agent capabilities. The 600+ agents cover everything from code review to test generation, documentation planning to performance optimization.

🚀 **Success = Doc-First + Atomic Tasks + Visual Verification + Persistent Iteration**

**Remember: Claude Flow coordinates, Claude Code creates!**
