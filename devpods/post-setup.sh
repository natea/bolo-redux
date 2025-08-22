# Handle CLAUDE.md to claude.md replacement
if [ -f "$WORKSPACE_FOLDER/devpods/CLAUDE.md" ]; then
    # Delete existing claude.md if it exists
    if [ -f "$WORKSPACE_FOLDER/claude.md" ]; then
        rm "$WORKSPACE_FOLDER/claude.md"
        echo "✅ Deleted existing claude.md"
    fi
    
    # Copy CLAUDE.md as claude.md
    cp "$WORKSPACE_FOLDER/devpods/CLAUDE.md" "$WORKSPACE_FOLDER/claude.md"
    echo "✅ Copied CLAUDE.md to workspace root as claude.md"
else
    echo "⚠️  CLAUDE.md not found in devpods/"
fi

# Copy additional agents if not already done
ADDITIONAL_AGENTS_DIR="$WORKSPACE_FOLDER/devpods/additional-agents"#!/bin/bash

echo "=== Post-Setup Configuration ==="
echo "WORKSPACE_FOLDER: $WORKSPACE_FOLDER"
echo "DEVPOD_WORKSPACE_FOLDER: $DEVPOD_WORKSPACE_FOLDER"
echo "AGENTS_DIR: $AGENTS_DIR"

# Ensure claude-monitor is installed
if ! command -v claude-monitor >/dev/null 2>&1; then
    echo "Installing Claude Monitor..."
    if command -v uv >/dev/null 2>&1; then
        uv tool install claude-monitor
    else
        pip install claude-monitor
    fi
fi

# Handle CLAUDE.md to claude.md replacement
if [ -f "$WORKSPACE_FOLDER/devpods/claude-code/CLAUDE.md" ]; then
    # Delete existing claude.md if it exists
    if [ -f "$WORKSPACE_FOLDER/claude.md" ]; then
        rm "$WORKSPACE_FOLDER/claude.md"
        echo "✅ Deleted existing claude.md"
    fi
    
    # Copy CLAUDE.md as claude.md
    cp "$WORKSPACE_FOLDER/devpods/claude-code/CLAUDE.md" "$WORKSPACE_FOLDER/claude.md"
    echo "✅ Copied CLAUDE.md to workspace root as claude.md"
else
    echo "⚠️  CLAUDE.md not found in devpods/claude-code/"
fi

# Copy additional agents if not already done
ADDITIONAL_AGENTS_DIR="$WORKSPACE_FOLDER/devpods/claude-code/additional-agents"
if [ -d "$ADDITIONAL_AGENTS_DIR" ] && [ -d "$AGENTS_DIR" ]; then
    echo "Checking for additional agents..."
    
    # Copy doc-planner.md if not exists
    if [ -f "$ADDITIONAL_AGENTS_DIR/doc-planner.md" ] && [ ! -f "$AGENTS_DIR/doc-planner.md" ]; then
        cp "$ADDITIONAL_AGENTS_DIR/doc-planner.md" "$AGENTS_DIR/"
        echo "✅ Copied doc-planner.md"
    fi
    
    # Copy microtask-breakdown.md if not exists
    if [ -f "$ADDITIONAL_AGENTS_DIR/microtask-breakdown.md" ] && [ ! -f "$AGENTS_DIR/microtask-breakdown.md" ]; then
        cp "$ADDITIONAL_AGENTS_DIR/microtask-breakdown.md" "$AGENTS_DIR/"
        echo "✅ Copied microtask-breakdown.md"
    fi
fi

# Clean up - remove CLAUDE.md from root if it exists
if [ -f "$WORKSPACE_FOLDER/CLAUDE.md" ]; then
    rm "$WORKSPACE_FOLDER/CLAUDE.md"
    echo "✅ Removed CLAUDE.md from workspace root"
fi

# Create persistent tmux session if it doesn't exist
if command -v tmux >/dev/null 2>&1; then
    if ! tmux has-session -t persistent_claude_session 2>/dev/null; then
        tmux new-session -d -s persistent_claude_session 'echo "Persistent session ready"'
        echo "✅ Created persistent tmux session"
    fi
fi

echo "✅ Post-setup complete!"
