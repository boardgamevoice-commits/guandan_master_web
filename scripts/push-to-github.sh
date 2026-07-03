#!/usr/bin/env bash
# 首次推送至 GitHub 并启用 Pages 部署
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v gh >/dev/null 2>&1; then
  echo "请先安装 GitHub CLI: brew install gh"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "请先登录 GitHub:"
  echo "  gh auth login"
  exit 1
fi

USER=$(gh api user -q .login)
REPO="guandan_master_web"

echo "→ 创建仓库 ${USER}/${REPO} 并推送..."
gh repo create "$REPO" --public --source=. --remote=origin --push 2>/dev/null || {
  git remote add origin "https://github.com/${USER}/${REPO}.git" 2>/dev/null || true
  git push -u origin main
}

echo ""
echo "→ 请在 GitHub 启用 Pages（仅需一次）："
echo "  1. 打开 https://github.com/${USER}/${REPO}/settings/pages"
echo "  2. Source 选择「GitHub Actions」"
echo ""
echo "→ 推送完成后 Actions 会自动部署，访问："
echo "  https://${USER}.github.io/${REPO}/"
