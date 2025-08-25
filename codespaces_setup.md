# 🚀 DevPods Setup for GitHub Codespaces

## ⚡ Recommended: Automated Setup

### **Use codespace_setup.sh (Preferred Method)**

**Step 1: Clone the repository and navigate to your project**
```bash
# Clone the turbo-flow-claude repository
git clone https://github.com/marcuspat/turbo-flow-claude.git

# Navigate to your codespace project directory
cd /workspaces/your-project-name

# Move the devpods directory to your project and delete turbo flow claude dir
mv turbo-flow-claude/devpods/ .
rm -rf turbo-flow-claude

# Make all scripts executable
chmod +x devpods/*.sh

# Run the automated setup script
./devpods/codespace_setup.sh
```

**Step 2: Connect to tmux workspace**
```bash
# After setup completes, attach to the tmux session
tmux attach -t workspace
```

**Alternative: Direct download method**
```bash
# If you prefer not to clone the full repo
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/codespace_setup.sh -o codespace_setup.sh
chmod +x codespace_setup.sh
./codespace_setup.sh

# Then attach to tmux
tmux attach -t workspace
```

**What `codespace_setup.sh` does:**
- Automatically runs `setup.sh`, `post-setup.sh`, and `tmux-workspace.sh`
- Installs tmux and htop if not available
- Handles all interactive prompts with automatic "yes" responses
- Creates a 4-window tmux workspace but doesn't auto-attach
- Provides clear progress feedback throughout the process
- Stops on errors with helpful messages
- No manual intervention required

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
./devpods/codespace_setup.sh

# Connect to tmux workspace
tmux attach -t workspace
```

### **Method 2: Download Individual Scripts**

```bash
# Download all required scripts
mkdir -p devpods
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/setup.sh -o devpods/setup.sh
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/post-setup.sh -o devpods/post-setup.sh
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/tmux-workspace.sh -o devpods/tmux-workspace.sh
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/codespace_setup.sh -o devpods/codespace_setup.sh

# Make all scripts executable and run automated setup
chmod +x devpods/*.sh
./devpods/codespace_setup.sh

# Connect to tmux workspace
tmux attach -t workspace
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

# Connect to tmux workspace
tmux attach -t workspace
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
./devpods/codespace_setup.sh

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

# After running the install script, connect to tmux
tmux attach -t workspace
```

---

## 📁 What Gets Installed

After running `codespace_setup.sh`, you'll have:

```
your-project/
├── devpods/                    # Setup scripts
│   ├── setup.sh               # Main installation
│   ├── post-setup.sh          # Verification
│   ├── tmux-workspace.sh      # Tmux config
│   └── codespace_setup.sh     # 🆕 Automated runner
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

After running `codespace_setup.sh`, these commands are available:

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

**⚠️ IMPORTANT: You must manually attach to the tmux session after setup**

```bash
# Connect to the tmux workspace (required after setup)
tmux attach -t workspace
```

**Window Layout:**
- **Window 0**: Primary Claude workspace
- **Window 1**: Secondary Claude workspace  
- **Window 2**: Claude usage monitor (running claude-monitor)
- **Window 3**: System monitor (running htop)

**Tmux Navigation:**
```bash
Ctrl+b 0-3    # Switch between windows
Ctrl+b 1-3    # Alternative window switching
Ctrl+b d      # Detach from session (returns to bash)
Ctrl+b ?      # Help menu
```

**Tmux Session Management:**
```bash
tmux attach -t workspace         # Attach to workspace
tmux detach                      # Detach from current session
tmux list-sessions              # See all tmux sessions
tmux kill-session -t workspace  # Kill the workspace session
```

---

## 💡 Quick Usage Examples

### **Complete Setup Workflow**
```bash
# 1. Run the setup
./devpods/codespace_setup.sh

# 2. Connect to tmux workspace
tmux attach -t workspace

# 3. Source the new aliases (in tmux)
source ~/.bashrc

# 4. Test your AI setup
cf "Hello! Test the setup and show me what agents are available"
```

### **Test Your Setup**
```bash
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

### **codespace_setup.sh Won't Run**
```bash
# Make sure all scripts are executable
chmod +x devpods/*.sh
./devpods/codespace_setup.sh
```

### **Can't Connect to Tmux**
```bash
# Check if tmux session exists
tmux list-sessions

# If no session, create manually:
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$(pwd)/agents"
./devpods/tmux-workspace.sh

# Then attach
tmux attach -t workspace
```

### **Commands Not Found After Setup**
```bash
# Reload your shell configuration (run inside tmux)
source ~/.bashrc

# Or restart your terminal/codespace
```

### **Environment Variables Missing**
```bash
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$(pwd)/agents"
```

### **Tmux Session Issues**
```bash
# Kill existing tmux sessions
tmux kill-server

# Re-run tmux setup
export WORKSPACE_FOLDER="$(pwd)"
export AGENTS_DIR="$(pwd)/agents"
./devpods/tmux-workspace.sh

# Then attach
tmux attach -t workspace
```

### **Agent Files Missing**
```bash
# Check if agents directory exists
ls -la agents/

# Re-run the complete setup
./devpods/codespace_setup.sh
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
curl -s https://raw.githubusercontent.com/marcuspat/turbo-flow-claude/main/devpods/codespace_setup.sh -o codespace_setup.sh
chmod +x codespace_setup.sh
./codespace_setup.sh

# Connect to the updated tmux workspace
tmux attach -t workspace
```

---

## 🎉 You're Ready!

After successful `codespace_setup.sh` execution and connecting to tmux:

✅ **Complete AI development environment**  
✅ **Extensive agent library with automatic context loading**  
✅ **Monitoring and testing tools**  
✅ **Optimized 4-window tmux workspace**  
✅ **Simple command aliases for AI coordination**

**Your workflow:**
1. **Run setup**: `./devpods/codespace_setup.sh`
2. **Connect to tmux**: `tmux attach -t workspace`  
3. **Start building**: `cf-swarm "Help me build my first app"`

**Remember**: Always work inside the tmux session for the best experience!
