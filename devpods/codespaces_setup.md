# Files to Add/Update in Your Repository

## 1. Add this file: `/install.sh` (repository root)

```bash
#!/bin/bash
set -e

echo "🚀 Claude Development Environment - Complete Installer"
echo "====================================================="

# Create devpods directory if it doesn't exist
mkdir -p devpods
cd devpods

echo "📥 Downloading all required scripts..."

# Download all necessary files
curl -s -o setup.sh https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh
curl -s -o post-setup.sh https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/post-setup.sh  
curl -s -o tmux-workspace.sh https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/tmux-workspace.sh

# Verify downloads
if [[ ! -f setup.sh ]] || [[ ! -f post-setup.sh ]] || [[ ! -f tmux-workspace.sh ]]; then
    echo "❌ Error: Failed to download one or more required scripts"
    echo "Please check your internet connection and try again"
    exit 1
fi

# Make scripts executable
chmod +x *.sh

echo "✅ All scripts downloaded successfully:"
echo "  - setup.sh"
echo "  - post-setup.sh" 
echo "  - tmux-workspace.sh"

# Go back to project root
cd ..

# Set environment variables
export WORKSPACE_FOLDER="$(pwd)"
export DEVPOD_WORKSPACE_FOLDER="$(pwd)"  
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"

echo ""
echo "🔧 Running complete installation..."
echo "Environment: $WORKSPACE_FOLDER"

# Run the complete setup sequence
echo "Step 1/3: Main setup..."
./devpods/setup.sh

echo "Step 2/3: Post-setup verification..."
./devpods/post-setup.sh

echo "Step 3/3: Tmux workspace setup..."
./devpods/tmux-workspace.sh &
disown

echo ""
echo "🎉 Installation Complete!"
echo "========================"
echo ""
echo "📋 What was installed:"
echo "  ✅ Claude Code CLI" 
echo "  ✅ Claude Monitor"
echo "  ✅ Terminal Jarvis"
echo "  ✅ 600+ AI Agents"
echo "  ✅ Playwright Testing"
echo "  ✅ TypeScript Environment"
echo "  ✅ Tmux Workspace (4 windows)"
echo ""
echo "🎯 Next Steps:"
echo "  1. tmux attach -t workspace"
echo "  2. cat agents/doc-planner.md"  
echo "  3. Use 'dsp' for quick Claude access"
echo "  4. Start building with Claude Flow!"
echo ""
echo "🔗 More info: cat devpods/codespaces_setup.md"
```

## 2. Update this file: `/devpods/codespaces_setup.md`

```markdown
# 🚀 Using DevPods Configuration with GitHub Codespaces

## Overview

GitHub Codespaces has its own devcontainer configuration. You just need to **copy the devpods directory** to your project root and run the setup scripts to get the complete Claude development environment.

## 📋 Quick Setup Procedure

### **Step 1: Clone the Repository**

In your Codespace or local environment:

```bash
git clone https://github.com/marcuspat/turbo-flow-claude.git
```

### **Step 2: Copy DevPods to Your Project**

Copy the devpods directory to your project root:

```bash
# Navigate to your project
cd /path/to/your/project

# Copy the entire devpods directory
cp -r /path/to/turbo-flow-claude/devpods ./

# Verify the copy
ls -la devpods/
```

### **Step 3: Run the Automated Setup**

Create and run this setup script:

```bash
# Create automated setup script
cat << 'EOF' > setup-claude-environment.sh
#!/bin/bash
set -e

echo "🚀 Setting up Claude development environment..."

# Set environment variables
export WORKSPACE_FOLDER="$(pwd)"
export DEVPOD_WORKSPACE_FOLDER="$(pwd)"  
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"

echo "📁 Environment variables set:"
echo "  WORKSPACE_FOLDER: $WORKSPACE_FOLDER"
echo "  AGENTS_DIR: $AGENTS_DIR"

# Make scripts executable
chmod +x devpods/setup.sh
chmod +x devpods/post-setup.sh  
chmod +x devpods/tmux-workspace.sh

# Run setup script
echo "🔧 Running main setup..."
./devpods/setup.sh

# Run post-setup verification
echo "✅ Running post-setup verification..."
./devpods/post-setup.sh

# Setup tmux workspace (optional)
echo "🖥️ Setting up tmux workspace..."
./devpods/tmux-workspace.sh &
disown

echo "🎉 Claude development environment setup complete!"
echo ""
echo "📋 What was installed:"
echo "  ✅ Claude Code CLI"
echo "  ✅ Claude Monitor"
echo "  ✅ Terminal Jarvis"
echo "  ✅ 600+ AI Agents"
echo "  ✅ Playwright for visual testing"
echo "  ✅ TypeScript development environment"
echo "  ✅ Tmux workspace with 4 windows"
echo ""
echo "🎯 Next steps:"
echo "  1. Load mandatory agents: cat agents/doc-planner.md"
echo "  2. Use DSP alias: dsp (shortcut for claude --dangerously-skip-permissions)"
echo "  3. Start development with Claude Flow agents!"
EOF

# Make it executable and run
chmod +x setup-claude-environment.sh
./setup-claude-environment.sh
```

## 🎯 One-Line Installation

**Super Simple** (after install.sh is added to repo):

```bash
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/install.sh | bash
```

**Alternative** (downloads all required scripts manually):

```bash
mkdir -p devpods && cd devpods && \
curl -sO https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh && \
curl -sO https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/post-setup.sh && \
curl -sO https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/tmux-workspace.sh && \
chmod +x *.sh && cd .. && \
export WORKSPACE_FOLDER="$(pwd)" AGENTS_DIR="$(pwd)/agents" && \
./devpods/setup.sh && ./devpods/post-setup.sh && ./devpods/tmux-workspace.sh
```

## 📁 What Gets Installed

After running the setup, your project will have:

```
your-project/
├── devpods/                 # Setup scripts and configs
│   ├── setup.sh            # Main installation script
│   ├── post-setup.sh       # Verification script
│   └── tmux-workspace.sh   # Tmux configuration
├── agents/                  # 600+ AI agents
├── src/                     # Source code directory
├── tests/                   # Test files
├── docs/                    # Documentation
├── config/                  # Configuration files
├── CLAUDE.md               # Claude programming rules
├── FEEDCLAUDE.md           # Streamlined instructions
├── package.json            # Node.js project config
├── playwright.config.ts    # Playwright testing config
├── tsconfig.json           # TypeScript configuration
└── node_modules/           # Dependencies
```

## 🖥️ Tmux Workspace

The setup creates a tmux session with 4 windows:

- **Window 0 (Claude-1)**: Primary Claude workspace
- **Window 1 (Claude-2)**: Secondary Claude workspace  
- **Window 2 (Claude-Monitor)**: Claude usage monitoring
- **Window 3 (htop)**: System resource monitor

Access with: `tmux attach -t workspace`

## 🔧 Manual Setup (If Automated Fails)

If the automated setup doesn't work, run scripts individually:

```bash
# Set environment variables
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"

# Run each script in order
./devpods/setup.sh
./devpods/post-setup.sh
./devpods/tmux-workspace.sh
```

## 💡 Usage Tips

### **Load Mandatory Agents**
```bash
# Always start with these agents
cat agents/doc-planner.md
cat agents/microtask-breakdown.md
```

### **Use DSP Alias**
```bash
# Quick access to Claude without permissions
dsp  # Instead of: claude --dangerously-skip-permissions
```

### **Claude Flow Commands**
```bash
# Spawn AI swarms
npx claude-flow@alpha swarm "build a REST API" --claude

# Use hive-mind for complex projects
npx claude-flow@alpha hive-mind spawn "complex project" --claude
```

## ⚠️ Troubleshooting

### **Permission Issues**
```bash
chmod +x devpods/*.sh
```

### **Missing Environment Variables**
```bash
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"
```

### **Script Download Issues**
```bash
# Check if files downloaded correctly
ls -la devpods/
file devpods/*.sh

# Re-download if needed
curl -sO https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh
```

### **Tmux Connection Issues**
```bash
tmux kill-server
./devpods/tmux-workspace.sh
tmux attach -t workspace
```

### **All Scripts Missing**
If you only have one script, download all three:

```bash
cd devpods
curl -sO https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/post-setup.sh
curl -sO https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/tmux-workspace.sh
chmod +x *.sh
cd ..
```

## 📋 Required Files Checklist

Before running setup, ensure you have all files:

```bash
ls devpods/
# Should show:
# setup.sh
# post-setup.sh  
# tmux-workspace.sh
```

## 🎉 Success!

You now have a complete Claude development environment with:
- ✅ 600+ specialized AI agents
- ✅ Advanced monitoring and usage tracking  
- ✅ Visual testing with Playwright
- ✅ TypeScript development setup
- ✅ Optimized tmux workspace
- ✅ Claude Flow SPARC methodology

Start developing with AI-powered workflows! 🚀
```

## Summary

**ADD THESE 2 FILES:**

1. **`/install.sh`** - New file in repository root
2. **Update `/devpods/codespaces_setup.md`** - Replace existing content

Then users can use: `curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/install.sh | bash`
