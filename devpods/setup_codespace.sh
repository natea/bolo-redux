#!/bin/bash
set -e

echo "🚀 Running Turbo-Flow Claude Complete Setup"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Set workspace to parent of devpods directory (where project should be)
WORKSPACE_FOLDER="$(dirname "$SCRIPT_DIR")"
AGENTS_DIR="$WORKSPACE_FOLDER/agents"

# Export these for the setup scripts to use
export WORKSPACE_FOLDER
export DEVPOD_WORKSPACE_FOLDER="$WORKSPACE_FOLDER"  
export AGENTS_DIR

echo "Installing to workspace: $WORKSPACE_FOLDER"

# Change to workspace directory before running scripts
cd "$WORKSPACE_FOLDER"

# Run scripts from their location but with workspace as working directory
yes | "$SCRIPT_DIR/setup.sh" || true
yes | "$SCRIPT_DIR/post-setup.sh" || true  
yes | "$SCRIPT_DIR/tmux-workspace.sh" || true

echo "✅ Setup complete in $WORKSPACE_FOLDER!"
