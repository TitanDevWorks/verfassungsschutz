#!/usr/bin/env bash
# Holt den neuesten Stand und veröffentlicht ihn. Aufruf auf dem Server:
#   cd /opt/verfassungsschutz && sudo ./scripts/update.sh
# Nur auf Zuruf, kein Timer.
set -euo pipefail

# Alles in einer Funktion: Bash liest sie komplett ein, bevor git reset
# dieses Skript selbst überschreibt.
main() {
  umask 022
  cd "$(dirname "$0")/.."
  BRANCH="${BRANCH:-main}"

  # Nur aus dem erwarteten Repo ziehen (schützt vor umgebogenem origin)
  ERWARTET="github.com/titandevworks/verfassungsschutz"
  URL="$(git remote get-url origin | tr 'A-Z' 'a-z')"
  case "$URL" in
    *"$ERWARTET"|*"$ERWARTET.git") ;;
    *) echo "Abbruch: origin ist $URL, erwartet $ERWARTET" >&2; exit 1 ;;
  esac

  git fetch --quiet origin "$BRANCH"
  git reset --quiet --hard "origin/$BRANCH"

  # Nur die öffentlichen Dateien nach site/ spiegeln:
  # keine versteckten Dateien, keine Skripte/Deploy-Dateien, keine Symlinks
  # (ein Symlink im Repo könnte sonst Dateien vom Server ausliefern).
  mkdir -p site
  rsync -r --delete --no-links --no-perms --no-owner --no-group --times \
    --exclude '.*' --exclude 'deploy' --exclude 'scripts' --exclude 'site' --exclude 'README.md' \
    ./ site/

  # Caddy darf lesen, aber nichts schreiben
  chown -R root:root site
  find site -type d -exec chmod 755 {} +
  find site -type f -exec chmod 644 {} +
  echo "Stand: $(git log -1 --format='%h %s')"
}
main "$@"
exit 0
