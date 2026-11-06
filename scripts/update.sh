#!/usr/bin/env bash
# Holt den neuesten Stand und veröffentlicht ihn. Aufruf auf dem Server:
#   cd /opt/verfassungsschutz && sudo ./scripts/update.sh
# Nur auf Zuruf, kein Timer.
set -euo pipefail
cd "$(dirname "$0")/.."
BRANCH="${BRANCH:-main}"
git fetch --quiet origin "$BRANCH"
git reset --quiet --hard "origin/$BRANCH"
# Nur die öffentlichen Dateien nach site/ spiegeln (keine Skripte, kein .git)
mkdir -p site
rsync -a --delete --exclude '.git' --exclude 'deploy' --exclude 'scripts' --exclude 'site' --exclude 'README.md' ./ site/
chmod -R a+rX site
echo "Stand: $(git log -1 --format='%h %s')"
