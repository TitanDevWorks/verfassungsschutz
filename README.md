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
| `hinweise.html` | Hinweisformular (Rollenspiel: sendet und speichert nichts) |
| `impressum.html` | Impressum, Fiktionshinweis, Datenschutz |

Kopf und Fuß kommen aus `assets/vs.js`, die Gestaltung aus `assets/vs.css`.
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
