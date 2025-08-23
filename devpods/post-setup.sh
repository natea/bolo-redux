#!/bin/bash
set -ex

# Get the directory where this script is located
readonly DEVPOD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Claude Dev Environment Setup ==="
echo "WORKSPACE_FOLDER: $WORKSPACE_FOLDER"
echo "DEVPOD_WORKSPACE_FOLDER: $DEVPOD_WORKSPACE_FOLDER"
echo "AGENTS_DIR: $AGENTS_DIR"
echo "DEVPOD_DIR: $DEVPOD_DIR"

# Install npm packages
npm install -g @anthropic-ai/claude-code
npm install -g claude-usage-cli

# Install uv package manager
echo "Installing uv package manager..."
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.cargo/env

# Install Claude Monitor using uv
echo "Installing Claude Code Usage Monitor..."
uv tool install claude-monitor || pip install claude-monitor

# Verify installation
if command -v claude-monitor >/dev/null 2>&1; then
    echo "✅ Claude Monitor installed successfully"
else
    echo "❌ Claude Monitor installation failed"
fi

# Initialize claude-flow in the project directory
cd "$WORKSPACE_FOLDER"
npx claude-flow@alpha init --force

# Install Claude subagents
echo "Installing Claude subagents..."
mkdir -p "$AGENTS_DIR"
cd "$AGENTS_DIR"
git clone https://github.com/ChrisRoyse/610ClaudeSubagents.git temp-agents
cp -r temp-agents/agents/*.md .
rm -rf temp-agents

# Copy additional agents if they're included in the repo
ADDITIONAL_AGENTS_DIR="$WORKSPACE_FOLDER/additional-agents"
if [ -d "$ADDITIONAL_AGENTS_DIR" ]; then
    echo "Copying additional agents..."
    
    # Copy doc-planner.md
    if [ -f "$ADDITIONAL_AGENTS_DIR/doc-planner.md" ]; then
        cp "$ADDITIONAL_AGENTS_DIR/doc-planner.md" "$AGENTS_DIR/"
        echo "✅ Copied doc-planner.md"
    fi
    
    # Copy microtask-breakdown.md
    if [ -f "$ADDITIONAL_AGENTS_DIR/microtask-breakdown.md" ]; then
        cp "$ADDITIONAL_AGENTS_DIR/microtask-breakdown.md" "$AGENTS_DIR/"
        echo "✅ Copied microtask-breakdown.md"
    fi
fi

echo "Installed $(ls -1 *.md | wc -l) agents in $AGENTS_DIR"
cd "$WORKSPACE_FOLDER"

# Create claude.md file from template in devpods directory
if [ -f "$DEVPOD_DIR/templates/claude.md" ]; then
    cp "$DEVPOD_DIR/templates/claude.md" "$WORKSPACE_FOLDER/claude.md"
    echo "✅ Copied claude.md configuration"
else
    echo "⚠️ Claude.md template not found in $DEVPOD_DIR/templates/"
fi

# Delete existing claude.md and copy CLAUDE.md to overwrite it if it exists
if [ -f "$WORKSPACE_FOLDER/CLAUDE.md" ]; then
    echo "Found CLAUDE.md, replacing claude.md with it..."
    rm -f "$WORKSPACE_FOLDER/claude.md"
    cp "$WORKSPACE_FOLDER/CLAUDE.md" "$WORKSPACE_FOLDER/claude.md"
    echo "✅ Replaced claude.md with CLAUDE.md"
fi

# Clean up - remove CLAUDE.md if it exists
if [ -f "$WORKSPACE_FOLDER/CLAUDE.md" ]; then
    rm "$WORKSPACE_FOLDER/CLAUDE.md"
    echo "✅ Removed CLAUDE.md from workspace root"
fi

echo "Setup completed successfully!"
