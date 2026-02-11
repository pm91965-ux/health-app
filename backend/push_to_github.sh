#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

git add -A
git commit -m "${1:-chore: automated update}" || true
GIT_SSH_COMMAND="ssh -i ~/.openclaw/keys/github_deploy_key -o IdentitiesOnly=yes" git push
