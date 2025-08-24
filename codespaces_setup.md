# 🚀 DevPods Setup for GitHub Codespaces

## ⚡ Recommended: Automated Setup

### **Use setup_codespace.sh (Preferred Method)**

**Step 1: Clone the repository and navigate to your project**
```bash
# Clone the turbo-flow-claude repository
git clone https://github.com/marcuspat/turbo-flow-claude.git

# Navigate to your project directory (or create one)
cd /workspaces/projectname
# OR create a new project: mkdir my-project && cd my-project

# Move the devpods directory to your project
mv turbo-flow-claude/devpods/ .

# Make all scripts executable
chmod +x devpods/*.sh

# Run all 3 scripts in order

./devpods/setup.sh && ./devpods/post-setup.sh && ./devpods/tmux-workspace.sh 

```
---

## 🛠️ Alternative Setup Methods

### **Method 1: One-Command Clone and Setup**

```bash
# Clone repository to temp directory and copy devpods to current project
TEMP_DIR=$(mktemp -d)
git clone https://github.com/marcuspat/turbo-flow-claude.git "$TEMP_DIR/turbo-flow-claude"
cp -r "$TEMP_DIR/turbo-flow-claude/devpods" ./
rm -rf "$TEMP_DIR"

# Make all scripts executable and run automated setup
chmod +x devpods/*.sh
./devpods/setup_codespace.sh
```

### **Method 2: Download Individual Scripts**

```bash
# Download all required scripts
mkdir -p devpods
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh -o devpods/setup.sh
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/post-setup.sh -o devpods/post-setup.sh
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/tmux-workspace.sh -o devpods/tmux-workspace.sh
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup_codespace.sh -o devpods/setup_codespace.sh

# Make all scripts executable and run automated setup
chmod +x devpods/*.sh
./devpods/setup_codespace.sh
```

### **Method 3: Manual Script Execution** *(Not Recommended)*

Only use this if you need to run scripts individually for debugging:

```bash
# Set environment variables
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$WORKSPACE_FOLDER/agents"

# Make scripts executable
chmod +x devpods/*.sh

# Run scripts manually (you'll have to answer prompts)
./devpods/setup.sh
./devpods/post-setup.sh
./devpods/tmux-workspace.sh
```

---

## 🚀 Complete Installation Script

If you want a single script that downloads everything and runs setup:

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

# Run the automated setup script (preferred method)
echo "🔧 Running automated setup..."
chmod +x devpods/*.sh
./devpods/setup_codespace.sh

echo ""
echo "🎉 DevPods setup complete!"
echo ""
echo "📋 What was installed:"
echo "  ✅ Claude Code CLI"
echo "  ✅ Claude Monitor" 
echo "  ✅ Claude Flow with context wrapper"
echo "  ✅ Extensive AI agent library"
echo "  ✅ Playwright Testing"
echo "  ✅ TypeScript Environment"
echo "  ✅ Tmux Workspace (4 windows)"
echo ""
echo "🎯 Next Steps:"
echo "  1. source ~/.bashrc"
echo "  2. tmux attach -t workspace"
echo "  3. cf 'Hello world'"
echo "  4. Start building with AI assistance!"
EOF

chmod +x install-devpods.sh
./install-devpods.sh
```

---

## 📁 What Gets Installed

After running `setup_codespace.sh`, you'll have:

```
your-project/
├── devpods/                    # Setup scripts
│   ├── setup.sh               # Main installation
│   ├── post-setup.sh          # Verification
│   ├── tmux-workspace.sh      # Tmux config
│   └── setup_codespace.sh     # 🆕 Automated runner
├── agents/                     # Extensive AI agent library
│   ├── doc-planner.md         # SPARC planning agent
│   ├── microtask-breakdown.md # Task decomposition
│   └── [many more agents]
├── src/                        # Source code directory
├── tests/                      # Test files
├── docs/                       # Documentation
├── config/                     # Configuration files
├── cf-with-context.sh         # 🆕 Context wrapper script
├── CLAUDE.md                  # Claude development rules
├── FEEDCLAUDE.md              # Streamlined instructions
├── package.json               # Node.js configuration
├── playwright.config.ts       # Testing configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🎯 Command Aliases Available

After running `setup_codespace.sh`, these commands are available:

```bash
# Turbo-Flow Commands (with auto-context loading)
cf "any task or question"                    # General AI coordination
cf-swarm "build specific feature"            # Focused implementation
cf-hive "complex architecture planning"      # Multi-agent coordination

# Legacy Commands
dsp                                          # claude --dangerously-skip-permissions
claude-monitor                               # Usage tracking
```

---

## 🖥️ Tmux Workspace

Access the 4-window tmux session:

```bash
tmux attach -t workspace
```

**Window Layout:**
- **Window 0**: Primary Claude workspace
- **Window 1**: Secondary Claude workspace  
- **Window 2**: Claude usage monitor
- **Window 3**: System monitor (htop)

**Tmux Navigation:**
```bash
Ctrl+b 0-3    # Switch between windows
Ctrl+b d      # Detach from session
Ctrl+b ?      # Help menu
```

---

## 💡 Quick Usage Examples

### **Test Your Setup**
```bash
# Source the new aliases
source ~/.bashrc

# Test basic AI coordination
cf "Hello! Test the setup and show me what agents are available"

# Test swarm coordination
cf-swarm "Create a simple hello world API structure"

# Test hive-mind planning
cf-hive "Plan a todo app with authentication and real-time updates"
```

### **Explore Available Agents**
```bash
# Check how many agents you have
ls agents/*.md | wc -l

# View key agents
cat agents/doc-planner.md
cat agents/microtask-breakdown.md

# Find specific agents
find agents/ -name "*api*"
find agents/ -name "*react*"
```

---

## ⚠️ Troubleshooting

### **setup_codespace.sh Won't Run**
```bash
# Make sure all scripts are executable
chmod +x devpods/*.sh
./devpods/setup_codespace.sh
```

### **Commands Not Found After Setup**
```bash
# Reload your shell configuration
source ~/.bashrc

# Or restart your terminal/codespace
```

### **Environment Variables Missing**
```bash
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$(pwd)/agents"
```

### **Tmux Issues**
```bash
# Kill existing tmux sessions
tmux kill-server

# Re-run tmux setup via the automated script
./devpods/setup_codespace.sh
```

### **Agent Files Missing**
```bash
# Check if agents directory exists
ls -la agents/

# Re-run the complete setup
./devpods/setup_codespace.sh
```

### **Context Wrapper Not Working**
```bash
# Check if the wrapper script exists
ls -la cf-with-context.sh

# Make it executable
chmod +x cf-with-context.sh

# Test manually
./cf-with-context.sh swarm "test command"
```

---

## 🔄 Update/Reinstall

To update your setup:

```bash
# Backup any custom changes
cp CLAUDE.md CLAUDE.md.backup

# Re-download and run the automated setup
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup_codespace.sh -o setup_codespace.sh
chmod +x setup_codespace.sh
./setup_codespace.sh
```

---

## 🎉 You're Ready!

After successful `setup_codespace.sh` execution, you have:

✅ **Complete AI development environment**  
✅ **Extensive agent library with automatic context loading**  
✅ **Monitoring and testing tools**  
✅ **Optimized workspace configuration**  
✅ **Simple command aliases for AI coordination**

**Start building with AI assistance:**
```bash
cf-swarm "Help me build my first app with this setup"
```
