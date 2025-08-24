#!/bin/bash
set -e  # Exit on any error

echo "🚀 Running Turbo-Flow Claude Complete Setup"
echo "=========================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set proper workspace directory for DevPod environment
if [[ -n "$DEVPOD_WORKSPACE_FOLDER" ]]; then
    WORKSPACE_FOLDER="$DEVPOD_WORKSPACE_FOLDER"
elif [[ -n "$CODESPACE_VSCODE_FOLDER" ]]; then
    WORKSPACE_FOLDER="$CODESPACE_VSCODE_FOLDER"
elif [[ -d "/workspace" ]]; then
    WORKSPACE_FOLDER="/workspace"
else
    # Fallback to parent directory of devpods
    WORKSPACE_FOLDER="$(dirname "$SCRIPT_DIR")"
fi

# Set agents directory
AGENTS_DIR="$WORKSPACE_FOLDER/agents"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Workspace directory: $WORKSPACE_FOLDER"
echo "📁 Agents directory: $AGENTS_DIR"
echo ""

# Export environment variables for the setup scripts
export WORKSPACE_FOLDER
export DEVPOD_WORKSPACE_FOLDER="$WORKSPACE_FOLDER"
export AGENTS_DIR

# Function to run script with auto-yes responses
run_script_with_yes() {
    local script_name="$1"
    local script_path="$SCRIPT_DIR/$script_name"
    
    if [[ -f "$script_path" ]]; then
        echo "🔧 Running $script_name..."
        # Change to workspace directory before running scripts
        cd "$WORKSPACE_FOLDER"
        # Use 'yes' command to automatically answer prompts with 'y'
        # Pipe to the script and also pass -y flag if supported
        yes | bash "$script_path" -y 2>/dev/null || bash "$script_path" -y || yes | bash "$script_path"
        echo "✅ $script_name completed"
        echo ""
    else
        echo "❌ $script_name not found at $script_path"
        exit 1
    fi
}

# Ensure we're in the correct workspace directory
cd "$WORKSPACE_FOLDER"
echo "📂 Working in workspace directory: $(pwd)"
echo ""

# Run setup.sh first
echo "1️⃣ Starting main setup..."
run_script_with_yes "setup.sh"

# Run post-setup.sh second  
echo "2️⃣ Starting post-setup..."
run_script_with_yes "post-setup.sh"

# Run tmux-workspace.sh last
echo "3️⃣ Starting tmux workspace setup..."
run_script_with_yes "tmux-workspace.sh"

echo "🎉 All setup scripts completed successfully!"
echo "✅ Turbo-Flow Claude environment is ready to use"
echo ""
echo "📁 Installation completed in: $WORKSPACE_FOLDER"
echo ""
echo "Next steps:"
echo "- Source your bashrc: source ~/.bashrc"
echo "- Test with: cf 'Hello world'"
echo "- Start coding with AI assistance!"
