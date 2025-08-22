#!/bin/bash

echo "=== Starting TMux Workspace ==="
echo "WORKSPACE_FOLDER: $WORKSPACE_FOLDER"
echo "DEVPOD_WORKSPACE_FOLDER: $DEVPOD_WORKSPACE_FOLDER"
echo "AGENTS_DIR: $AGENTS_DIR"

# Ensure we're in the workspace directory
cd "$WORKSPACE_FOLDER"

# Kill existing session if it exists
tmux kill-session -t workspace 2>/dev/null || true

# Create new session with first window for Claude
tmux new-session -d -s workspace -n "Claude-1" -c "$WORKSPACE_FOLDER"

# Create second window for Claude
tmux new-window -t workspace:1 -n "Claude-2" -c "$WORKSPACE_FOLDER"

# Create third window for Claude monitor
tmux new-window -t workspace:2 -n "Claude-Monitor" -c "$WORKSPACE_FOLDER"

# Create fourth window for htop
tmux new-window -t workspace:3 -n "htop" -c "$WORKSPACE_FOLDER"

# Start htop in window 3
if command -v htop >/dev/null 2>&1; then
    tmux send-keys -t workspace:3 "htop" C-m
else
    tmux send-keys -t workspace:3 "echo 'htop not installed. Run: sudo apt-get install -y htop'" C-m
fi

# Set up Claude Monitor window
if command -v claude-monitor >/dev/null 2>&1; then
    tmux send-keys -t workspace:2 "claude-monitor" C-m
elif command -v claude-usage-cli >/dev/null 2>&1; then
    tmux send-keys -t workspace:2 "claude-usage-cli" C-m
else
    tmux send-keys -t workspace:2 "echo 'Claude monitor tools not installed'" C-m
    tmux send-keys -t workspace:2 "echo 'Run: pip install claude-monitor'" C-m
fi

# Send helpful messages to Claude windows
tmux send-keys -t workspace:0 "echo '=== Claude Window 1 Ready ==='" C-m
tmux send-keys -t workspace:0 "echo 'Workspace: $WORKSPACE_FOLDER'" C-m
tmux send-keys -t workspace:0 "echo 'Agents: $AGENTS_DIR'" C-m
tmux send-keys -t workspace:0 "echo ''" C-m
tmux send-keys -t workspace:0 "echo 'Load mandatory agents with:'" C-m
tmux send-keys -t workspace:0 "echo 'cat \$AGENTS_DIR/doc-planner.md'" C-m
tmux send-keys -t workspace:0 "echo 'cat \$AGENTS_DIR/microtask-breakdown.md'" C-m

tmux send-keys -t workspace:1 "echo '=== Claude Window 2 Ready ==='" C-m
tmux send-keys -t workspace:1 "echo 'Workspace: $WORKSPACE_FOLDER'" C-m

# Select the first window
tmux select-window -t workspace:0

# Attach to the session
tmux attach-session -t workspace
