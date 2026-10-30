#!/usr/bin/env bash
# RailConnect — GitHub Push Helper Script
# Repository: balamurugan-cse/railconnect

set -e

echo "🚆 RailConnect GitHub Sync Helper"
echo "Repository: https://github.com/balamurugan-cse/railconnect"
echo ""

if [ -z "$1" ]; then
  echo "Usage Option 1 (using GitHub Personal Access Token):"
  echo "  ./push-to-github.sh <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>"
  echo ""
  echo "Usage Option 2 (using SSH):"
  echo "  git remote set-url origin git@github.com:balamurugan-cse/railconnect.git"
  echo "  git push -u origin main"
  exit 1
fi

GITHUB_TOKEN="$1"
REMOTE_URL="https://${GITHUB_TOKEN}@github.com/balamurugan-cse/railconnect.git"

echo "Pushing commits to main branch..."
git push "${REMOTE_URL}" main

echo ""
echo "✅ Successfully synced code to balamurugan-cse/railconnect!"
