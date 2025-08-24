#!/bin/bash
set -e  # Exit on any error

echo "🚀 Running Turbo-Flow Claude Complete Setup"
echo "=========================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Script directory: $SCRIPT_DIR"
echo ""

# Function to run script with auto-yes responses
run_script_with_yes() {
    local script_name="$1"
    local script_path="$SCRIPT_DIR/$script_name"
    
    if [[ -f "$script_path" ]]; then
        echo "🔧 Running $script_name..."
        cd "$SCRIPT_DIR"  # Change to script directory before running
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
echo "Next steps:"
echo "- Source your bashrc: source ~/.bashrc"
echo "- Test with: cf 'Hello world'"
echo "- Start coding with AI assistance!"
