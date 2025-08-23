#!/bin/bash
set -ex  # Add -x for debugging output

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
if [ -f "$HOME/.cargo/env" ]; then
  source "$HOME/.cargo/env"
else
  export PATH="$HOME/.cargo/bin:$PATH"
fi

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

# 🪝 Configure Claude Code hooks for automatic context loading
echo "🪝 Setting up Claude Code hooks for automatic context loading..."
mkdir -p .claude

# Create hooks configuration that auto-loads context files
cat << 'HOOKS_EOF' > .claude/settings.json
{
  "hooks": {
    "sessionStartHook": {
      "command": "bash",
      "args": ["-c", "echo '=== 📋 LOADING CLAUDE CONTEXT ===' && if [ -f 'CLAUDE.md' ]; then echo '🤖 Claude Rules:' && cat CLAUDE.md && echo -e '\\n'; fi && if [ -f 'agents/doc-planner.md' ]; then echo '📋 Doc Planner Agent:' && cat agents/doc-planner.md && echo -e '\\n'; fi && if [ -f 'agents/microtask-breakdown.md' ]; then echo '🔧 Microtask Breakdown Agent:' && cat agents/microtask-breakdown.md && echo -e '\\n'; fi && echo '=== ✅ CONTEXT LOADED ===\\n'"],
      "alwaysRun": true
    },
    "postEditHook": {
      "command": "npx",
      "args": ["claude-flow@alpha", "hooks", "post-edit", "--file", "$CLAUDE_EDITED_FILE", "--format", "true"],
      "alwaysRun": true
    }
  }
}
HOOKS_EOF

echo "✅ Claude Code hooks configured:"
echo "  - sessionStartHook: Auto-loads CLAUDE.md + agents on every session"
echo "  - postEditHook: Auto-formats code after edits"

# Fix hook variable interpolation for Claude Code compatibility
npx claude-flow@alpha fix-hook-variables .claude/settings.json 2>/dev/null || echo "Hook variables already compatible"

# Setup Node.js project if package.json doesn't exist
if [ ! -f "package.json" ]; then
  echo "📦 Initializing Node.js project..."
  npm init -y
fi

# Fix TypeScript module configuration
echo "🔧 Fixing TypeScript module configuration..."
npm pkg set type="module"

# Install Playwright (REQUIRED by CLAUDE.md for visual verification)
echo "🧪 Installing Playwright for visual verification..."
npm install -D playwright
npx playwright install
npx playwright install-deps

# Install TypeScript and build tools (needed for proper development)
echo "🔧 Installing TypeScript and development tools..."
npm install -D typescript @types/node

# Update tsconfig.json for ES modules
echo "⚙️ Updating TypeScript configuration for ES modules..."
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# Create Playwright configuration
echo "🧪 Creating Playwright configuration..."
cat << 'EOF' > playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
 testDir: './tests',
 use: {
   screenshot: 'only-on-failure',
   trace: 'on-first-retry',
 },
 projects: [
   {
     name: 'chromium',
     use: { channel: 'chromium' },
   },
 ],
});
EOF

# Create basic test example
echo "📝 Creating example test..."
mkdir -p tests
cat << 'EOF' > tests/example.spec.ts
import { test, expect } from '@playwright/test';

test('environment validation', async ({ page }) => {
 // Basic test to verify Playwright works
 expect(true).toBe(true);
});
EOF

# Create essential directories (required by CLAUDE.md file organization rules)
echo "📁 Creating project directories..."
mkdir -p src tests docs scripts examples config

# Update package.json with essential scripts
echo "📝 Adding essential npm scripts..."
npm pkg set scripts.build="tsc"
npm pkg set scripts.test="playwright test"
npm pkg set scripts.lint="echo 'Add linting here'"  
npm pkg set scripts.typecheck="tsc --noEmit"
npm pkg set scripts.playwright="playwright test"

# Verify Playwright installation
if npx playwright --version >/dev/null 2>&1; then
  echo "✅ Playwright installed and ready for visual verification"
else
  echo "⚠️ Playwright installation may have issues"
fi

# Install Claude subagents
echo "Installing Claude subagents..."
mkdir -p "$AGENTS_DIR"
cd "$AGENTS_DIR"
git clone https://github.com/ChrisRoyse/610ClaudeSubagents.git temp-agents
cp -r temp-agents/agents/*.md .
rm -rf temp-agents

# Copy additional agents if they're included in the repo
ADDITIONAL_AGENTS_DIR="$DEVPOD_DIR/additional-agents"
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

# Delete existing CLAUDE.md and copy CLAUDE.md to overwrite it if it exists
if [ -f "$DEVPOD_DIR/CLAUDE.md" ]; then
  echo "Found CLAUDE.md in devpods directory, replacing CLAUDE.md with it..."
  # Rename existing CLAUDE.md to CLAUDE.md.OLD if it exists
  if [ -f "$WORKSPACE_FOLDER/CLAUDE.md" ]; then
      mv "$WORKSPACE_FOLDER/CLAUDE.md" "$WORKSPACE_FOLDER/CLAUDE.md.OLD"
      echo "Renamed existing CLAUDE.md to CLAUDE.md.OLD"
  fi
  cp "$DEVPOD_DIR/CLAUDE.md" "$WORKSPACE_FOLDER/CLAUDE.md"
  echo "✅ Replaced CLAUDE.md with CLAUDE.md from devpods directory"
else
  echo "⚠️ CLAUDE.md not found in $DEVPOD_DIR - using default CLAUDE.md"
fi

# Create dsp alias for claude --dangerously-skip-permissions
echo 'alias dsp="claude --dangerously-skip-permissions"' >> ~/.bashrc

# Create claude-flow context loading aliases
echo "🔗 Creating Claude Flow context loading aliases..."
cat << 'ALIASES_EOF' >> ~/.bashrc

# Claude Flow context loading aliases
alias load-claude='cat CLAUDE.md 2>/dev/null || echo "CLAUDE.md not found"'
alias load-doc-planner='cat agents/doc-planner.md 2>/dev/null || echo "doc-planner.md not found"'
alias load-microtask='cat agents/microtask-breakdown.md 2>/dev/null || echo "microtask-breakdown.md not found"'
alias load-all-agents='echo "=== CLAUDE RULES ===" && cat CLAUDE.md 2>/dev/null && echo -e "\n=== DOC PLANNER ===" && cat agents/doc-planner.md 2>/dev/null && echo -e "\n=== MICROTASK BREAKDOWN ===" && cat agents/microtask-breakdown.md 2>/dev/null'

# Claude Flow with auto-context loading
alias cf-swarm='(cat CLAUDE.md 2>/dev/null && echo -e "\n---\n" && cat agents/doc-planner.md 2>/dev/null && echo -e "\n---\n" && cat agents/microtask-breakdown.md 2>/dev/null) | npx claude-flow@alpha swarm'
alias cf-hive='(cat CLAUDE.md 2>/dev/null && echo -e "\n---\n" && cat agents/doc-planner.md 2>/dev/null && echo -e "\n---\n" && cat agents/microtask-breakdown.md 2>/dev/null) | npx claude-flow@alpha hive-mind spawn'

ALIASES_EOF

echo "Setup completed successfully!"
echo "🎯 Environment is now 100% production-ready!"
echo "✅ TypeScript ES module configuration fixed"
echo "✅ Playwright tests configured with proper imports"
echo "✅ DSP alias configured"
echo "✅ Claude Code hooks configured for automatic context loading"
echo "✅ Claude Flow context loading aliases created:"
echo "    - load-claude, load-doc-planner, load-microtask, load-all-agents"
echo "    - cf-swarm, cf-hive (auto-loads context)"
