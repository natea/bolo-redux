# 🚀 DevPods Setup for GitHub Codespaces

## ⚡ Quick Setup - One Command

### **Automated Installation Script**

A setup script is available in the `devpods` directory that automates the entire installation process.

**The script (`devpods/setup-devpods.sh`) does the following:**
```bash
#!/bin/bash
set -e

echo "🚀 Setting up DevPods..."

# Clone the repository
git clone https://github.com/marcuspat/turbo-flow-claude.git

# Navigate into the cloned directory
cd turbo-flow-claude

# Move devpods directory to parent
mv devpods ..

# Go back and remove the cloned repo
cd ..
rm -rf turbo-flow-claude

# Make scripts executable
chmod +x ./devpods/*.sh

# Run the setup
./devpods/codespace_setup.sh

echo "✅ Setup complete! Run: tmux attach -t workspace"
```

**To use:**
1. Save the script as `setup-devpods.sh` in the `devpods` directory
2. Make it executable: `chmod +x devpods/setup-devpods.sh`
3. Run it: `./devpods/setup-devpods.sh`
4. Connect to tmux: `tmux attach -t workspace`

---

## 📁 What Gets Installed

After running the setup script, you'll have:

```
your-project/
├── devpods/                    # Setup scripts directory
│   ├── setup.sh               # Main installation
│   ├── post-setup.sh          # Verification
│   ├── tmux-workspace.sh      # Tmux config
│   ├── codespace_setup.sh     # Automated runner
│   └── setup-devpods.sh       # One-command setup script
├── agents/                     # Extensive AI agent library
│   ├── doc-planner.md         # SPARC planning agent
│   ├── microtask-breakdown.md # Task decomposition
│   └── [many more agents]
├── src/                        # Source code directory
├── tests/                      # Test files
├── docs/                       # Documentation
├── config/                     # Configuration files
├── cf-with-context.sh         # Context wrapper script
├── CLAUDE.md                  # Claude development rules
├── FEEDCLAUDE.md              # Streamlined instructions
├── package.json               # Node.js configuration
├── playwright.config.ts       # Testing configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🎯 Available Commands

After setup, these commands are available:

```bash
# Turbo-Flow Commands (with auto-context loading)
cf "any task or question"                    # General AI coordination
cf-swarm "build specific feature"            # Focused implementation
cf-hive "complex architecture planning"      # Multi-agent coordination

# Utility Commands
dsp                                          # claude --dangerously-skip-permissions
claude-monitor                               # Usage tracking
```

---

## 🖥️ Tmux Workspace

After setup, connect to your workspace:

```bash
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
Ctrl+b d      # Detach from session
Ctrl+b ?      # Help menu
```

---

## 💡 Quick Usage Examples

### **Complete Workflow**
```bash
# 1. Run the one-command setup
./devpods/setup-devpods.sh

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

---

## ⚠️ Troubleshooting

### **Script Won't Run**
```bash
# Make sure the script is executable
chmod +x devpods/setup-devpods.sh
./devpods/setup-devpods.sh
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
```

### **Tmux Session Issues**
```bash
# Kill existing tmux sessions
tmux kill-server

# Re-run tmux setup
./devpods/tmux-workspace.sh

# Then attach
tmux attach -t workspace
```

---

## 🔄 Update/Reinstall

To update your setup, simply re-run the setup script:

```bash
./devpods/setup-devpods.sh
tmux attach -t workspace
```

---

## 🎉 You're Ready!

After running the setup script and connecting to tmux:

✅ **Complete AI development environment**  
✅ **Extensive agent library with automatic context loading**  
✅ **Monitoring and testing tools**  
✅ **Optimized 4-window tmux workspace**  
✅ **Simple command aliases for AI coordination**

**Your workflow:**
1. **Run setup**: `./devpods/setup-devpods.sh`
2. **Connect to tmux**: `tmux attach -t workspace`  
3. **Start building**: `cf-swarm "Help me build my first app"`

**Remember**: Always work inside the tmux session for the best experience!
