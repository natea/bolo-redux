# 🚀 DevPods Setup for GitHub Codespaces

## Quick Setup - Clone & Run

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/marcuspat/turbo-flow-claude.git
```

### **Step 2: Move DevPods to Your Project**

```bash
# Navigate to your project root
cd /path/to/your/project

# Copy devpods directory from the cloned repo
cp -r /path/to/turbo-flow-claude/devpods ./

# Or if you cloned in the same directory:
cp -r turbo-flow-claude/devpods ./
```

### **Step 3: Run Setup Scripts**

```bash
# Make scripts executable
chmod +x devpods/*.sh

# Set environment variables
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"

# Run all setup scripts
./devpods/setup.sh && ./devpods/post-setup.sh && ./devpods/tmux-workspace.sh
```

## 🚀 One-Command Setup Script

Create this script to automate the entire process:

```bash
cat << 'EOF' > install-devpods.sh
#!/bin/bash
set -e

echo "🚀 Setting up DevPods in current directory..."

# Clone the repo to temp directory
TEMP_DIR=$(mktemp -d)
echo "📥 Cloning turbo-flow-claude to temp directory..."
git clone https://github.com/marcuspat/turbo-flow-claude.git "$TEMP_DIR/turbo-flow-claude"

# Copy devpods to current directory
echo "📁 Copying devpods directory..."
cp -r "$TEMP_DIR/turbo-flow-claude/devpods" ./

# Clean up temp directory
rm -rf "$TEMP_DIR"

# Make scripts executable
chmod +x devpods/*.sh

# Set environment variables
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"

echo "📁 Environment variables set:"
echo "  WORKSPACE_FOLDER: $WORKSPACE_FOLDER"
echo "  AGENTS_DIR: $AGENTS_DIR"

# Run setup scripts
echo "🔧 Running setup scripts..."
./devpods/setup.sh
./devpods/post-setup.sh
./devpods/tmux-workspace.sh &
disown

echo ""
echo "🎉 DevPods setup complete!"
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
EOF

chmod +x install-devpods.sh
./install-devpods.sh
```

## 🎯 Super Quick One-Liner

Run this single command in your project directory:

```bash
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh -o setup.sh && \
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/post-setup.sh -o post-setup.sh && \
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/tmux-workspace.sh -o tmux-workspace.sh && \
mkdir -p devpods && mv *.sh devpods/ && chmod +x devpods/*.sh && \
export WORKSPACE_FOLDER="$(pwd)" AGENTS_DIR="$(pwd)/agents" && \
./devpods/setup.sh && ./devpods/post-setup.sh && ./devpods/tmux-workspace.sh
```

## 📁 What Gets Installed

```
your-project/
├── devpods/                 # Setup scripts
│   ├── setup.sh            # Main installation
│   ├── post-setup.sh       # Verification
│   └── tmux-workspace.sh   # Tmux config
├── agents/                  # 600+ AI agents
├── src/                     # Source code
├── tests/                   # Test files
├── docs/                    # Documentation
├── config/                  # Configuration
├── CLAUDE.md               # Claude rules
├── FEEDCLAUDE.md           # Instructions
├── package.json            # Node.js config
├── playwright.config.ts    # Testing config
└── tsconfig.json           # TypeScript config
```

## 🖥️ Tmux Workspace

Access the 4-window tmux session:

```bash
tmux attach -t workspace
```

**Windows:**
- **0**: Primary Claude workspace
- **1**: Secondary Claude workspace  
- **2**: Claude usage monitor
- **3**: System monitor (htop)

## 💡 Quick Usage

```bash
# Load key agents
cat agents/doc-planner.md
cat agents/microtask-breakdown.md

# Quick Claude access
dsp  # alias for: claude --dangerously-skip-permissions

# Claude Flow commands
npx claude-flow@alpha swarm "build API" --claude
```

## ⚠️ Troubleshooting

**Scripts not executable:**
```bash
chmod +x devpods/*.sh
```

**Missing environment variables:**
```bash
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$(pwd)/agents"
```

**Tmux issues:**
```bash
tmux kill-server
./devpods/tmux-workspace.sh
```

## 🎉 Ready!

You now have a complete Claude development environment with 600+ AI agents, monitoring tools, and optimized workspace configuration.

Start building with AI-powered workflows! 🚀
