#!/bin/bash
set -e

echo "🚀 Running Turbo-Flow Claude Complete Setup"

# Get script directory and run the three scripts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Running setup scripts with auto-yes responses..."

# Run all three scripts with yes piped to handle prompts
cd "$SCRIPT_DIR"
yes | ./setup.sh || true
yes | ./post-setup.sh || true  
yes | ./tmux-workspace.sh || true

echo "✅ Setup complete!"
