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
- 📅 **Date Context Integration** - Current date: Friday, August 22, 2025

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

### 📝 **Example Usage in Prompts:**

#### 🎯 **Method 1: Direct Context Injection**
```
"I need to build a React dashboard. First, let me provide context from FEEDCLAUDE.md:

$(cat /workspaces/turbo-flow-claude/FEEDCLAUDE.md)

Now, using these instructions:
1. Load doc-planner and microtask-breakdown agents
2. Use concurrent execution patterns
3. Follow the master prompting pattern
4. Implement with Playwright visual verification"
```

#### 🚀 **Method 2: Section-Specific Context**
```
"Build an API with authentication. Follow these FEEDCLAUDE.md patterns:

MANDATORY AGENTS:
- Always start with doc-planner and microtask-breakdown
- Load from $WORKSPACE_FOLDER/agents/

EXECUTION PATTERN:
- Batch ALL operations in single messages
- Use Task tool for parallel agent spawning
- Follow agent coordination protocol

MASTER PATTERN:
- Identify all useful subagents
- Utilize claude-flow hivemind for maximum effectiveness"
```

#### 🎨 **Method 3: Progressive Context Building**
```
"Phase 1: Load essential context"
$(grep -A 10 "CRITICAL EXECUTION RULES" /workspaces/turbo-flow-claude/FEEDCLAUDE.md)

"Phase 2: Apply to my task - create a mobile app with..."
[Your specific requirements]

"Phase 3: Execute with patterns from FEEDCLAUDE.md"
[Implementation following the loaded patterns]
```

### 🔧 **Integration Tips:**

#### ✅ **Best Practices:**
- 📋 **Always include mandatory agent rules** when starting new projects
- ⚡ **Use concurrent execution patterns** for complex tasks
- 🎯 **Reference master prompting pattern** for agent coordination
- 📊 **Include progress format** for tracking
- 🧪 **Add Playwright requirements** for frontend work

#### 🎯 **Quick Commands for Common Scenarios:**
```bash
# 🚀 Full development project context
echo "Context: $(grep -A 20 'MANDATORY.*Doc-Planner\|Correct Execution Pattern\|Agent Count Rules' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"

# 🎨 Frontend development with visual verification
echo "Context: $(grep -A 15 'Playwright Integration\|Visual verification' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"

# 🤖 Agent coordination patterns
echo "Context: $(grep -A 10 'Agent Coordination Protocol\|Master Prompting Pattern' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"

# 📊 Progress tracking and CI protocols
echo "Context: $(grep -A 10 'Progress Format\|CI Protocol' /workspaces/turbo-flow-claude/FEEDCLAUDE.md)"
```

### 📈 **Performance Benefits:**
- **⚡ 6x faster execution** through concurrent patterns
- **🎯 83% reduced context size** while maintaining full effectiveness
- **📋 100% adherence** to mandatory development fundamentals
- **🔄 Consistent iteration patterns** until success
- **🧪 Visual verification** integration for all frontend work

### 💡 **Pro Tips:**
1. **🔴 Always start** with doc-planner and microtask-breakdown sections
2. **📁 Never save to root** - include file organization rules
3. **⚡ Batch everything** - use concurrent execution examples
4. **📅 Include date context** - "Current date: Friday, August 22, 2025"
5. **🔄 Iterate until success** - include persistence patterns

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
- 📋 **FEEDCLAUDE.md** - Streamlined prompting instructions (NEW!)
- 📝 **Enhanced CLAUDE.md** - Unified optimal configuration (UPDATED!)
  
### 🎯 **Installed Features & Tools**
- 🐳 **Docker-in-Docker** - Run containers inside your development container
- 🟢 **Node.js and npm** - JavaScript runtime and package manager
- 🦀 **Rust 1.70** - Systems programming language
- 🖥️ **tmux** - Terminal multiplexer with pre-configured workspace
- 🤖 **Claude Code CLI** (`@anthropic-ai/claude-code`) - Official Claude development tools
- 📊 **Advanced Claude Monitor** - ML-based usage monitoring with Rich UI (UPGRADED!)
- ⚡ **Claude Flow** - SPARC workflow automation with 54+ built-in agents
- 🎯 **600+ Specialized Agents** - From 610ClaudeSubagents repository plus custom additions
- 🧪 **Playwright** - Visual verification and screenshot automation (NEW!)

### 🎨 **VSCode Extensions (Auto-installed)**
- 🤖 **Roo Cline** - AI pair programming
- 📝 **Gist FS** - GitHub Gist integration
- 🧠 **GitHub Copilot** - AI code completion
- 💬 **GitHub Copilot Chat** - AI chat interface

---

## 🔥 Recent Major Enhancements

### 🚀 **Enhanced Monitoring & Development Fundamentals**

We've upgraded from basic `claude-usage-cli` to the advanced **🔍 Claude Monitor** by @Maciek-roboblog, featuring:
- 🧠 **ML-based predictions** - Intelligent usage forecasting
- 🎨 **Beautiful Rich terminal UI** - Enhanced developer experience
- 📊 **Real-time analytics** - Live usage tracking
- ⚡ **Intelligent session limit detection** - Smart limit management

More significantly, we've implemented **🎯 comprehensive development methodology** where the **doc-planner** and **microtask-breakdown** agents are now **🔴 MANDATORY** for ALL work - individual tasks, swarms, and hive-minds.

### 🎯 **New Development Fundamentals**
- 🧪 **Playwright Integration** - All frontend/web development requires Playwright for screenshots and visual verification
- 🔄 **Recursive Problem Solving** - Complex problems broken down recursively to atomic, solvable units
- ⚡ **Iterate Until Success** - Tasks continue until goal achieved - no giving up
- 🔍 **Deep Research Protocol** - When stuck, agents auto-search YouTube transcripts, GitHub repos, and blogs
- 📅 **Date Context** - Current date always specified: **Friday, August 22, 2025**
- 🤖 **Swarm vs Hive Guidance** - Clear decision tree for choosing coordination patterns

### 📋 **Enhanced Configuration System**
- ✅ **Merged CLAUDE.md** - Unified configuration from multiple sources without duplication
- 📝 **Created FEEDCLAUDE.md** - 83% size reduction, pure instruction set for prompts
- 📁 **File Organization Rules** - Never save to root, structured directory approach
- ⚡ **Concurrent Execution** - All operations batched in single messages (6x faster!)

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

#### ⚙️ **Step 4: Customize for Your Project**
Edit `.devcontainer.json` to add project-specific requirements:
```json
{
  "name": "Your Project + Claude Environment",
  "build": {
    "dockerFile": "../Dockerfile"  // if you have a custom Dockerfile
  },
  "features": {
    // Your project-specific features
    "ghcr.io/devcontainers/features/python:1": {},
    "ghcr.io/devcontainers/features/java:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        // Your project-specific extensions
        "ms-python.python",
        "redhat.java"
      ]
    }
  }
}
```

### 🎯 **Which Option to Choose?**

#### 🚀 **Choose Option 1 (Standalone) if:**
- Starting a new project
- Want a clean, optimized development environment
- Working on multiple projects that can benefit from Claude agents
- Prefer a dedicated workspace for AI-enhanced development

#### 🔄 **Choose Option 2 (Integration) if:**
- Have an existing project with specific dependencies
- Need to maintain your current Docker/container setup
- Want to add Claude capabilities to an established workflow
- Working in a team environment with existing standards

### 💡 **Pro Tips for Both Options:**

#### 🎯 **After Setup:**
```bash
# Verify Claude environment is ready
ls /workspaces/*/agents/*.md | wc -l  # Should show 600+

# Load mandatory agents (ALWAYS DO THIS FIRST!)
cat $WORKSPACE_FOLDER/agents/doc-planner.md
cat $WORKSPACE_FOLDER/agents/microtask-breakdown.md

# Check tmux workspace is running
tmux list-sessions
```

#### 📁 **File Structure After Integration:**
```
your-project/
├── 🐳 .devcontainer/
│   └── devcontainer.json
├── 🛠️ devpods/
│   ├── setup.sh
│   ├── post-setup.sh
│   ├── tmux-workspace.sh
│   ├── FEEDCLAUDE.md
│   ├── CLAUDE.md
│   └── additional-agents/
├── 📁 [your existing project files]
└── 🤖 [agents will be installed at runtime]
```

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
# 📊 List all available agents
ls /workspaces/turbo-flow-claude/agents/*.md | wc -l

# 🔍 Search for specific agents
ls /workspaces/turbo-flow-claude/agents/*test*.md

# 💬 Tell Claude to use agents
"Look in /workspaces/turbo-flow-claude/agents/ and select the best agents for [task]"

# 📝 Load mandatory agents (ALWAYS START WITH THESE!)
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
📅 Remember the current date is August 22, 2025. 
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

#### 🔬 **Example 6: Multi-Agent Research Coordination**
```
"📚 I need to research Kubernetes LLM serving, cost optimization, and deployment patterns. Current date is August 22, 2025.
- 🚀 Spawn specialized agents for: Infrastructure (kimi k2), Cost analysis (Triton), GPU optimization ($0.71/hr H100 spot)
- ⚡ Create parallel deployment strategies using available MCP servers
- 🔄 Keep iterating until implementation path is clear
- 🌐 Use web-accessible sources, GitHub repos, and YouTube video transcripts
- 🤖 Coordinate findings across all agents to identify optimal solutions
- 🤔 Ask yourself: should I use swarm or hivemind for this task?"
```

### 🎯 **Advanced Prompting Techniques**

#### 🔄 **Recursive Problem Solving with Deep Research**
```
"🧠 Use recursive thinking to break down this problem. If you get stuck, spawn a research agent to do deep research into:
- 🎥 YouTube transcripts for tutorials
- 📚 GitHub repos for implementation examples  
- 📝 Blog posts for best practices
- 🔍 Analyze existing code for patterns
- 🌐 Search all web-accessible resources
🔄 Keep recursing until you find a working solution. If stuck, do deep research to come up with solutions to try."
```

#### 🧪 **TDD with Goal Achievement and Iteration**
```
"🎯 Define the end result: A working API with 100% test coverage
🧪 Use TDD approach and iterate until goal is achieved:
1. Write failing tests for each endpoint
2. Implement minimal code to pass
3. Refactor while keeping tests green
4. Iterate until all acceptance criteria are met
5. 📸 Use playwright to take screenshots and verify GUI output is correct
6. If tests fail, do prompt-specific research and try again
7. 🔄 Keep iterating until goal is achieved
Use CC (Claude Code) for more tasks"
```

#### 📸 **Visual Verification Loop with Playwright**
```
"🎨 Build the dashboard component:
1. Create the UI component
2. 🧪 Install and use playwright for screenshots so the agent can verify the output in the GUI is correct
3. 📸 Take a screenshot at 1920x1080 resolution
4. ✅ Verify the output matches the design specs
5. 🔄 If not correct, iterate on the CSS/layout
6. Keep iterating until pixel-perfect
7. 🧠 Use recursive thinking if stuck
Use CC (Claude Code) for implementing changes"
```

#### 🔍 **Deep Research Pattern**
```
"📚 Research the best approach for implementing real-time collaborative editing. Current date is August 22, 2025.
1. 🌐 Search all web-accessible resources from the last 2 years
2. 🎥 Analyze YouTube video transcripts for 'collaborative editing implementation'
3. 📚 Study GitHub repos using CRDTs or OT algorithms
4. 📝 Read blog posts about scaling collaborative apps
5. 🔍 Analyze code for desired patterns
6. 📊 Do research for desired result
7. ⚡ Feed findings from MCP tools into your analysis
8. 🗺️ Describe the way - multiple implementation paths with pros/cons"
```

### 🎯 **Key Prompting Principles**

1. 📅 **Always specify the current date** - "Remember the current date is August 22, 2025"
2. 🎯 **Define clear end goals** - "Define the end result" - Agents work better with specific targets
3. 🔄 **Use iterative refinement** - "Keep iterating until [specific condition]" - "Iterate until goal"
4. 📸 **Leverage visual verification** - "Install and use playwright for screenshots" - GUI testing
5. 🔍 **Combine research and implementation** - "If stuck do deep research" using all sources
6. 🤔 **Choose the right pattern** - "Ask Claude whether to use swarm or hivemind"
7. ⚡ **Feed MCP into prompts** - "Feed MCP into Claude prompts" for context
8. 🤖 **Spawn agents concurrently** - "Spawn 5 agents to work on this process concurrently"
9. 📁 **Specify output locations** - "Put the output into research/rackspace folder"
10. 🔄 **Include fallback strategies** - "If stuck, do deep research to come up with solutions to try"
11. 🧠 **Use recursive thinking** - Break down problems recursively
12. 🎯 **Prompt-specific research** - Research tailored to the specific problem
13. 🗺️ **Describe the way** - Have agents explain their approach
14. ⚡ **Use CC for more tasks** - Leverage Claude Code for implementation
15. 🌐 **Search all web-accessible resources** - YouTube, GitHub, blogs, etc.

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
├── 📋 claude.md                  # Claude configuration
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
echo "Claude-usage: $(which claude-usage-cli && echo '✓ Installed' || echo '✗ Missing')"
echo "Claude-flow: $(ls /workspaces/turbo-flow-claude/claude-flow 2>/dev/null && echo '✓ Installed' || echo '✗ Missing')"
echo "Tmux: $(which tmux && echo '✓ Installed' || echo '✗ Missing')"
```
## 🔥 **DSP Alias**

Quick shortcut for `claude --dangerously-skip-permissions`

### **Usage:**
```bash
# Instead of:
claude --dangerously-skip-permissions

# Just type:
dsp

## 🏗️ Architecture Overview
```
Your Computer
    ↓ (DevPod CLI)
☁️ Cloud Provider (DigitalOcean/AWS/Azure/GCP)
    ├── 🐳 Docker Engine
    └── 🏗️ DevContainer
         ├── 📁 Your Code
         ├── 🤖 600+ AI Agents
         ├── 🛠️ Development Tools
         ├── 🐳 Docker-in-Docker
         └── 💻 VSCode Server
              ↓
         💻 Your VSCode (connected)
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
- 📊 [Claude Usage Monitor CLI](https://github.com/jedarden/claude-usage-monitor-cli) - Track your Claude API usage (Note: We use the npm version `claude-usage-cli`)

---

🎯 **Note**: This setup provides a complete Claude development environment with extensive AI agent capabilities. The 600+ agents cover everything from code review to test generation, documentation planning to performance optimization.

🚀 **Success = Doc-First + Atomic Tasks + Visual Verification + Persistent Iteration**

**Remember: Claude Flow coordinates, Claude Code creates!**
