# verfassungsschutz – Webseite des fiktiven Bundesamtes für Verfassungsschutz

> **Fiktives Rollenspiel.** Webseite des „Bundesamtes für Verfassungsschutz“ im Rollenspiel
> „BDR: Bundesrepublik Deutschland RP“ (Roblox). Kein Angebot einer echten Behörde;
> Personen, Ämter, Gesetze und Vorgänge sind erfunden.

Statische Seite ohne Build-Schritt und ohne Backend, gleiche Gestaltung wie die BMIH-Seite
([bmibund](https://github.com/TitanDevWorks/bmibund)): „Nacht“, nur dunkel, Geist + Instrument Serif.

| Seite | Inhalt |
| --- | --- |
| `index.html` | Start: Lagebild mit Countdown, Neuanfang, Auftrag, Zahlen, Ministerzitat, Amtsleitung |
| `amt.html` | Auftrag, Fach- und Rechtsaufsicht, Neuaufstellung (Entlassungen), Organigramm, Kontrolle |
| `aufgaben.html` | Arbeitsfelder: Terror, Spionage/Sabotage, Cyber, gewaltbereiter Extremismus |
| `vsnog.html` | VSNOG, Drucksache 3/15: Kurz erklärt, Vorher/Nachher, Kernpunkte, Zeitplan, FAQ, Wortlaut |
| `presse.html` | Pressemitteilungen und Pressefotos (Großansicht, JPG-Download) |
| `antraege.html` | Antragsportal: 13 Antragsarten, Formulare aus `/api/oeffentlich/eingang/arten`, Eingangsbestätigung mit Vorgangsnummer und Abrufcode, optional Discord-Anmeldung („Meine Anträge“) |
| `antrag-status.html` | Statusabfrage mit Vorgangsnummer + Abrufcode (im URL-Fragment), Rückfragen beantworten |
| `hinweise.html` | Hinweisformular, sendet über das Antragsportal an die zuständige Fachabteilung |
| `impressum.html` | Impressum, Fiktionshinweis, Datenschutz |

Kopf und Fuß kommen aus `assets/vs.js`, die Gestaltung aus `assets/vs.css`, das Antragsportal aus `assets/antraege.js` (Backend im privaten Repo, `server/src/api/eingang-oeffentlich.js`).
Pressefotos stammen aus `bmibund/assets/presse/fiedel/` (KI-generiert, fiktiv).

Lokal ansehen: `python3 -m http.server 8080`

## Veröffentlichen (Vorschlag)

Gleicher Server wie die BMIH-Seite, davor der vorhandene System-Caddy:

1. DuckDNS: Subdomain `verfassungsschutz` anlegen und auf die Server-IP zeigen lassen
   (beim vorhandenen DuckDNS-Updater die Domain mit Komma ergänzen).
2. Server: Repo nach `/opt/verfassungsschutz` klonen, dann `sudo ./scripts/update.sh`.
3. Block aus `deploy/Caddyfile.verfassungsschutz` an `/etc/caddy/Caddyfile` anhängen (vorher Backup),
   `sudo caddy validate --config /etc/caddy/Caddyfile` und `sudo systemctl reload caddy`.
4. Updates danach: `cd /opt/verfassungsschutz && sudo ./scripts/update.sh`

## Sicherheit

- `deploy/Caddyfile.verfassungsschutz`: HSTS, strenge CSP (keine fremden Skripte, kein Inline-JS), COOP/CORP,
  keine versteckten Dateien oder Quellordner, nur GET/HEAD, Fehlerseiten ohne Server-Interna, JSON-Zugriffslog.
- `scripts/update.sh`: zieht nur aus diesem Repo, kopiert keine Symlinks und keine versteckten Dateien,
  `site/` gehört root und ist für Caddy nur lesbar.
- Geänderten Caddy-Block einspielen (mit Backup, bei Fehler zurück):

  ```
  BK=/etc/caddy/Caddyfile.vor-haertung.$(date +%Y%m%d%H%M%S); sudo cp /etc/caddy/Caddyfile "$BK"
  # alten Block verfassungsschutz.duckdns.org { … } in /etc/caddy/Caddyfile durch den neuen ersetzen
  sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile && sudo systemctl reload caddy || sudo cp "$BK" /etc/caddy/Caddyfile
  ```
- Interner Code (Login, Dienstportal, Bot, Secrets-Vorlagen) liegt im privaten Repo `verfassungsschutz_private`,
  nie hier. Keine Tokens, Passwörter oder Server-Zugänge in dieses öffentliche Repo.
