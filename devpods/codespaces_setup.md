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

For the fastest setup, run this single command in your project root:

```bash
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh | bash
```

## 📁 What Gets Installed

After running the setup, your project will have:

```
your-project/
├── devpods/                 # Setup scripts and configs
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

# Run each script
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

### **Tmux Connection Issues**
```bash
tmux kill-server
./devpods/tmux-workspace.sh
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
