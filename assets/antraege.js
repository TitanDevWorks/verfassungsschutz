/* Antragsportal des Bundesamtes (fiktiv): Formulare aus dem Katalog des Backends, Eingangsbestätigung, Statusabfrage.
   Keine Abhängigkeiten, nur textContent (nie HTML aus Eingaben oder aus der Datenbank). */
(() => {
  'use strict';
  const API = '/api/oeffentlich/eingang';
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs, ...kinder) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of kinder.flat()) if (k != null && k !== false) e.append(k);
    return e;
  };
  const datum = iso => iso ? new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
  async function ruf(methode, pfad, daten) {
    let r;
    try {
      r = await fetch(API + pfad, { method: methode, credentials: 'same-origin', headers: { Accept: 'application/json', ...(daten ? { 'Content-Type': 'application/json' } : {}) }, body: daten ? JSON.stringify(daten) : undefined });
    } catch { throw new Error('Keine Verbindung zum Bundesamt. Bitte später erneut versuchen.'); }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.fehler || `Fehler ${r.status}`); e.status = r.status; throw e; }
    return j;
  }
  const kopieren = (text, knopf) => {
    const fertig = () => { const alt = knopf.textContent; knopf.textContent = 'Kopiert'; setTimeout(() => { knopf.textContent = alt; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(fertig, () => {}); else fertig();
  };
  const DISCORD = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 4h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-6.5L8 21.5V18H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3zm4 5.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm6 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/></svg>';
  const discordKnopf = (text = 'Mit Discord anmelden') => { const a = el('a', { class: 'btn btn-sm btn-discord', href: '/api/auth/discord?fuer=antrag' }); a.innerHTML = DISCORD; a.append(text); return a; };

  let katalog = null, token = null, tokenZeit = 0;
  async function katalogLaden() {
    const k = await ruf('GET', '/arten');
    katalog = k; token = k.token; tokenZeit = Date.now();
    return k;
  }

  // ——— Anmeldeleiste (Discord optional) ———
  function leiste(box, k) {
    if (!box) return;
    const weiter = box.closest('[data-ap-status]') ? el('a', { class: 'btn btn-sm', href: 'antraege.html', text: 'Neuer Antrag' }) : el('a', { class: 'btn btn-sm', href: 'antrag-status.html', text: 'Status abfragen' });
    if (k.angemeldet) {
      const ab = el('button', { class: 'btn btn-sm', type: 'button', text: 'Abmelden', onclick: async () => { await ruf('POST', '/abmelden', {}).catch(() => {}); location.hash = ''; location.reload(); } });
      box.replaceChildren(el('p', null, 'Angemeldet mit Discord als ', el('b', { text: k.angemeldet.name }), '. Ihre Anträge erscheinen unten unter „Meine Anträge“, Bestätigungen kommen per Direktnachricht.'),
        el('div', { class: 'ap-knoepfe' }, el('a', { class: 'btn btn-sm', href: '#meine', text: 'Meine Anträge' }), ab));
    } else if (k.discordLogin) {
      box.replaceChildren(el('p', null, el('b', { text: 'Optional: ' }), 'Mit Discord anmelden, dann sehen Sie Ihre Anträge ohne Abrufcode und bekommen Rückfragen per Direktnachricht. Ohne Anmeldung geht es auch.'),
        el('div', { class: 'ap-knoepfe' }, discordKnopf(), weiter));
    } else {
      box.replaceChildren(el('p', null, 'Ihren Antrag verfolgen Sie mit Vorgangsnummer und Abrufcode.'), el('div', { class: 'ap-knoepfe' }, weiter));
    }
  }

  // ——— Formular für eine Antragsart ———
  function feld(f) {
    const id = `f-${f.name}`;
    if (f.typ === 'check') {
      return el('label', { class: 'check' }, el('input', { type: 'checkbox', name: f.name, id, required: f.pflicht }), el('span', { class: f.pflicht ? 'pflicht' : null, text: f.label }));
    }
    let eingabe;
    if (f.typ === 'select') {
      eingabe = el('select', { name: f.name, id, required: f.pflicht }, el('option', { value: '', text: 'Bitte wählen' }), ...f.optionen.map(o => el('option', { value: o, text: o })));
    } else if (f.typ === 'textarea') {
      eingabe = el('textarea', { name: f.name, id, required: f.pflicht, maxlength: f.max, minlength: f.min || null, placeholder: f.hilfe || null });
    } else {
      eingabe = el('input', { name: f.name, id, required: f.pflicht, maxlength: f.max, minlength: f.min || null, placeholder: f.hilfe || null, autocomplete: 'off' });
    }
    const label = el('label', { for: id }, el('span', { class: f.pflicht ? 'pflicht' : null, text: f.label }), eingabe);
    if (f.typ === 'textarea') {
      const z = el('span', { class: 'zaehler', text: `0 / ${f.max}` });
      eingabe.addEventListener('input', () => { z.textContent = `${eingabe.value.length} / ${f.max}`; });
      label.append(z);
    }
    if (f.hilfe && f.typ === 'textarea') label.append(el('span', { class: 'hilfe', text: f.hilfe }));
    return label;
  }

  function formular(ziel, art, { fest = false } = {}) {
    const fehler = el('p', { class: 'fehler', role: 'alert', hidden: true });
    const knopf = el('button', { class: 'btn btn-primary', type: 'submit', style: 'justify-self:start', text: art.key === 'hinweis' ? 'Hinweis absenden' : 'Antrag einreichen' });
    const anonym = art.anonym ? el('input', { type: 'checkbox', name: 'anonym' }) : null;
    const name = el('input', { name: 'name', id: 'f-name', maxlength: 100, autocomplete: 'nickname', required: !art.anonym, value: katalog.angemeldet?.name || null });
    const kontakt = el('input', { name: 'kontakt', id: 'f-kontakt', maxlength: 160, placeholder: 'z. B. Discord-Name oder Telefon im Rollenspiel' });
    const absender = el('div', { style: 'display:grid;gap:16px' },
      el('label', { for: 'f-name' }, el('span', { class: art.anonym ? null : 'pflicht', text: art.anonym ? 'Ihr Name im Rollenspiel (freiwillig)' : 'Ihr Name im Rollenspiel' }), name),
      el('label', { for: 'f-kontakt' }, el('span', { text: 'Kontakt für Rückfragen (freiwillig)' }), kontakt));
    if (anonym) anonym.addEventListener('change', () => { absender.hidden = anonym.checked; });
    const form = el('form', { class: 'form', novalidate: true },
      el('div', { class: 'ap-kopf' },
        el('h2', { text: art.name }), el('p', { text: art.text }),
        el('div', { class: 'ap-meta' }, el('span', { class: 'tag gold', text: art.stelle }), el('span', { class: 'tag', text: `Bearbeitung: ${art.frist}` }), art.anonym ? el('span', { class: 'tag', text: 'auch anonym' }) : null)),
      ...art.felder.map(feld),
      el('div', { class: 'trenner' }),
      anonym ? el('label', { class: 'check' }, anonym, el('span', { text: 'Anonym einreichen (ohne Namen und ohne Discord-Konto)' })) : null,
      absender,
      // Honeypot: für Menschen unsichtbar
      el('div', { class: 'ap-honig', 'aria-hidden': 'true' }, el('label', null, 'Webseite', el('input', { name: 'webseite', tabindex: '-1', autocomplete: 'off' }))),
      el('label', { class: 'check' }, el('input', { type: 'checkbox', name: 'hinweisRp', required: true }),
        el('span', { class: 'pflicht', text: 'Mir ist klar: Das ist ein Rollenspiel. Ich gebe keine echten persönlichen Daten an, und echte Notfälle melde ich der echten Polizei (110).' })),
      fehler, knopf);

    form.addEventListener('submit', async e => {
      e.preventDefault();
      fehler.hidden = true;
      const fd = new FormData(form);
      const felder = {};
      for (const f of art.felder) felder[f.name] = f.typ === 'check' ? form.elements[f.name].checked : String(fd.get(f.name) || '').trim();
      // Pflichtfelder im Browser prüfen (das Backend prüft noch einmal)
      for (const f of art.felder) {
        const leer = f.typ === 'check' ? !felder[f.name] : !felder[f.name];
        if (f.pflicht && leer) return zeigen(`${f.label}: bitte ausfüllen.`, form.elements[f.name]);
        if (f.typ !== 'check' && felder[f.name] && f.min && felder[f.name].length < f.min) return zeigen(`${f.label}: bitte etwas ausführlicher (mindestens ${f.min} Zeichen).`, form.elements[f.name]);
      }
      const istAnonym = !!anonym?.checked;
      if (!art.anonym && !istAnonym && name.value.trim().length < 2) return zeigen('Bitte geben Sie Ihren Namen im Rollenspiel an.', name);
      if (!form.elements.hinweisRp.checked) return zeigen('Bitte bestätigen Sie den Hinweis zum Rollenspiel.', form.elements.hinweisRp);
      if (Date.now() - tokenZeit > 5 * 3600e3) await katalogLaden().catch(() => {});
      knopf.disabled = true; knopf.textContent = 'Wird übermittelt …';
      const daten = { art: art.key, felder, name: istAnonym ? '' : name.value.trim(), kontakt: istAnonym ? '' : kontakt.value.trim(), anonym: istAnonym, hinweisRp: true, token, webseite: String(fd.get('webseite') || '') };
      try {
        let r;
        try { r = await ruf('POST', '', daten); }
        catch (err) {
          // Zu schnell ausgefüllt: kurz warten und einmal erneut senden
          if (err.status === 429 && /schnell/.test(err.message)) { await new Promise(res => setTimeout(res, 4500)); r = await ruf('POST', '', daten); }
          else if (err.status === 400 && /abgelaufen/.test(err.message)) { await katalogLaden(); r = await ruf('POST', '', { ...daten, token }); }
          else throw err;
        }
        quittung(ziel, art, r);
      } catch (err) {
        zeigen(err.message);
        knopf.disabled = false; knopf.textContent = art.key === 'hinweis' ? 'Hinweis absenden' : 'Antrag einreichen';
      }
    });
    function zeigen(text, fokus) { fehler.textContent = text; fehler.hidden = false; (fokus || fehler).focus?.(); if (!fokus) fehler.scrollIntoView({ block: 'nearest' }); }
    ziel.replaceChildren(form);
    if (!fest) form.querySelector('input, select, textarea')?.focus({ preventScroll: true });
  }

  // ——— Eingangsbestätigung ———
  function quittung(ziel, art, r) {
    const statusLink = new URL(r.statusUrl, location.href).toString();
    const wert = (label, text) => el('div', { class: 'ap-wert' }, el('div', null, el('span', { text: label }), el('br'), el('code', { text })),
      el('button', { class: 'btn btn-sm', type: 'button', text: 'Kopieren', onclick: ev => kopieren(text, ev.currentTarget) }));
    const box = el('div', { class: 'ap-quittung', role: 'status', tabindex: '-1' },
      el('span', { class: 'kicker', text: 'Eingangsbestätigung' }),
      el('h2', { text: art.key === 'hinweis' ? 'Ihr Hinweis ist eingegangen.' : 'Ihr Antrag ist eingegangen.' }),
      el('p', { text: `Zuständig: ${r.stelle}. Übliche Bearbeitungszeit: ${r.frist}.` }),
      el('div', { class: 'ap-werte' }, wert('Vorgangsnummer', r.nr), wert('Abrufcode', r.code)),
      el('p', { class: 'ap-warn' }, el('b', { text: 'Bitte notieren Sie den Abrufcode jetzt. ' }), r.discord ? 'Sie finden den Vorgang auch unter „Meine Anträge“, solange Sie mit Discord angemeldet sind.' : 'Er wird nur dieses eine Mal angezeigt und kann nicht wiederhergestellt werden.'),
      r.aktenzeichen?.length ? el('p', { text: `Im Widerspruchsregister erfasst unter ${r.aktenzeichen.join(', ')}.` }) : null,
      el('div', { class: 'ap-knoepfe', style: 'display:flex;flex-wrap:wrap;gap:10px' },
        el('a', { class: 'btn btn-primary btn-sm', href: r.statusUrl, text: 'Status ansehen' }),
        el('button', { class: 'btn btn-sm', type: 'button', text: 'Statuslink kopieren', onclick: ev => kopieren(statusLink, ev.currentTarget) }),
        el('a', { class: 'btn btn-sm', href: 'antraege.html', text: 'Weiterer Antrag' })));
    ziel.replaceChildren(box);
    box.focus({ preventScroll: true });
    box.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  // ——— Übersicht aller Antragsarten (antraege.html) ———
  async function portal(wurzel) {
    const liste = $('[data-ap-liste]', wurzel), ziel = $('[data-ap-formular]', wurzel);
    let k;
    try { k = await katalogLaden(); }
    catch (e) { liste.replaceChildren(el('p', { class: 'lade leer', text: 'Das Antragsportal ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.' })); ziel.replaceChildren(); return; }
    leiste($('[data-ap-leiste]'), k);
    const gruppen = new Map();
    for (const a of k.arten) { if (!gruppen.has(a.gruppe)) gruppen.set(a.gruppe, []); gruppen.get(a.gruppe).push(a); }
    const knoepfe = new Map();
    const waehlen = (key, scroll) => {
      const art = k.arten.find(a => a.key === key);
      if (!art) return;
      knoepfe.forEach((b, kk) => b.setAttribute('aria-pressed', String(kk === key)));
      formular(ziel, art);
      if (location.hash.slice(1) !== key) history.replaceState(null, '', `#${key}`);
      if (scroll && matchMedia('(max-width: 1100px)').matches) ziel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    liste.replaceChildren(...[...gruppen].map(([g, arten]) => el('div', { class: 'ap-gruppe' }, el('h2', { text: g }),
      el('div', { class: 'ap-arten' }, ...arten.map(a => {
        const b = el('button', { class: 'ap-art', type: 'button', 'aria-pressed': 'false', 'aria-controls': 'ap-formular', onclick: () => waehlen(a.key, true) },
          el('b', { text: a.name }), el('span', { class: 'ap-frist', text: a.frist }), el('small', { text: a.text }));
        knoepfe.set(a.key, b);
        return b;
      })))));
    const start = location.hash.slice(1);
    if (k.arten.some(a => a.key === start)) waehlen(start, false);
    if (k.angemeldet) meine($('[data-ap-meine]'));
  }

  // ——— Meine Anträge (mit Discord angemeldet) ———
  async function meine(box) {
    if (!box) return;
    box.hidden = false;
    const inhalt = $('[data-ap-meine-liste]', box);
    try {
      const { vorgaenge } = await ruf('GET', '/meine');
      if (!vorgaenge.length) return inhalt.replaceChildren(el('p', { class: 'lade leer', text: 'Noch keine Anträge mit diesem Discord-Konto.' }));
      inhalt.replaceChildren(...vorgaenge.map(v => el('a', { href: `antrag-status.html#nr=${encodeURIComponent(v.nr)}` },
        el('span', { class: 'nr', text: v.nr }), el('span', { class: 'was', text: `${v.artName}${v.betreff ? ` · ${v.betreff}` : ''}` }),
        el('span', { class: `tag ${v.status === 'rueckfrage' ? 'gold' : v.offen ? '' : 'red'}`.trim(), text: v.statusName }))));
      if (location.hash === '#meine' || location.hash === '#angemeldet') box.scrollIntoView({ block: 'start' });
    } catch (e) { inhalt.replaceChildren(el('p', { class: 'lade leer', text: e.message })); }
  }

  // ——— Einzelnes Formular (hinweise.html) ———
  async function festesFormular(ziel) {
    try {
      const k = await katalogLaden();
      const art = k.arten.find(a => a.key === ziel.dataset.antragsformular);
      if (!art) throw new Error();
      formular(ziel, art, { fest: true });
    } catch { ziel.replaceChildren(el('p', { class: 'lade leer', text: 'Das Formular ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.' })); }
  }

  // ——— Statusabfrage (antrag-status.html) ———
  const SCHRITTE = [['eingegangen', 'Eingegangen'], ['in_bearbeitung', 'In Bearbeitung'], ['rueckfrage', 'Rückfrage'], ['ende', 'Entschieden']];
  function statusAnsicht(ziel, v, zugang) {
    const ende = ['beschieden', 'abgeschlossen', 'zurueckgewiesen'].includes(v.status);
    const stufe = ende ? 3 : v.status === 'rueckfrage' ? 2 : v.status === 'eingegangen' ? 0 : 1;
    const schritte = el('ol', { class: 'ap-schritte', 'aria-label': 'Bearbeitungsstand' }, ...SCHRITTE.map(([key, name], i) =>
      el('li', { class: i <= stufe ? (i === 3 && v.status === 'zurueckgewiesen' ? 'an rot' : 'an') : null, text: i === 3 && ende ? v.statusName : name })));
    const nachrichten = v.nachrichten.length
      ? el('ul', { class: 'ap-verlauf' }, ...v.nachrichten.map(n => el('li', { class: `ap-nachricht ${n.von}` },
        el('header', null, el('b', { text: n.von === 'bfv' ? v.stelle : 'Sie' }), el('time', { text: datum(n.at) })), el('p', { text: n.text }))))
      : el('p', { class: 'muted', text: 'Noch keine Nachrichten. Sobald die zuständige Stelle Ihnen schreibt, steht es hier.' });
    const teile = [
      el('div', { class: 'ap-status-kopf' }, el('span', { class: 'nr', text: v.nr }), el('span', { class: `tag ${v.status === 'rueckfrage' ? 'gold' : v.status === 'zurueckgewiesen' ? 'red' : ''}`.trim(), text: v.statusName })),
      el('h2', { text: v.betreff || v.artName }),
      schritte,
      el('dl', { class: 'ap-daten' },
        el('div', null, el('dt', { text: 'Antragsart' }), el('dd', { text: v.artName })),
        el('div', null, el('dt', { text: 'Zuständig' }), el('dd', { text: v.stelle })),
        el('div', null, el('dt', { text: 'Eingegangen' }), el('dd', { text: datum(v.eingegangen) })),
        el('div', null, el('dt', { text: 'Letzte Änderung' }), el('dd', { text: datum(v.aktualisiert) })),
        ...v.aktenzeichen.map(a => el('div', null, el('dt', { text: a.art }), el('dd', { class: 'mono', text: a.az })))),
      el('h3', { text: 'Nachrichten' }), nachrichten,
    ];
    if (v.offen) {
      const ta = el('textarea', { name: 'text', maxlength: 4000, required: true, placeholder: v.status === 'rueckfrage' ? 'Ihre Antwort auf die Rückfrage' : 'Ergänzung zu Ihrem Antrag' });
      const f = el('p', { class: 'fehler', role: 'alert', hidden: true });
      const b = el('button', { class: 'btn btn-primary btn-sm', type: 'submit', style: 'justify-self:start', text: 'Nachricht senden' });
      const form = el('form', { class: 'form', novalidate: true }, el('label', null, el('span', { text: v.status === 'rueckfrage' ? 'Antwort auf die Rückfrage' : 'Ergänzung senden' }), ta), f, b);
      form.addEventListener('submit', async e => {
        e.preventDefault(); f.hidden = true;
        if (ta.value.trim().length < 2) { f.textContent = 'Bitte eine Nachricht eingeben.'; f.hidden = false; return; }
        b.disabled = true;
        try { const r = await ruf('POST', '/antwort', { ...zugang, text: ta.value }); statusAnsicht(ziel, r.vorgang, zugang); }
        catch (err) { f.textContent = err.message; f.hidden = false; b.disabled = false; }
      });
      teile.push(form);
    } else teile.push(el('p', { class: 'muted', text: 'Der Vorgang ist abgeschlossen. Für ein neues Anliegen stellen Sie bitte einen neuen Antrag.' }));
    ziel.replaceChildren(el('div', { class: 'ap-status form' }, ...teile));
  }

  async function status(wurzel) {
    const form = $('form[data-ap-abfrage]', wurzel), ziel = $('[data-ap-ergebnis]', wurzel), fehler = $('.fehler', form);
    const h = new URLSearchParams(location.hash.slice(1));
    if (h.get('nr')) form.elements.nr.value = h.get('nr');
    if (h.get('code')) form.elements.code.value = h.get('code');
    // Abrufcode nicht in Adresszeile, Verlauf und Lesezeichen stehen lassen (nur die Vorgangsnummer bleibt)
    if (h.get('code')) history.replaceState(null, '', h.get('nr') ? `#nr=${encodeURIComponent(h.get('nr'))}` : location.pathname);
    let ich = null;
    try { ich = await ruf('GET', '/ich'); } catch {}
    leiste($('[data-ap-leiste]'), { angemeldet: ich?.angemeldet, discordLogin: ich?.discordLogin });
    const abfragen = async () => {
      fehler.hidden = true;
      const zugang = { nr: form.elements.nr.value.trim(), code: form.elements.code.value.trim() };
      if (!zugang.nr || (!zugang.code && !ich?.angemeldet)) { fehler.textContent = 'Bitte Vorgangsnummer und Abrufcode eingeben.'; fehler.hidden = false; return; }
      ziel.replaceChildren(el('p', { class: 'lade', text: 'Wird abgefragt …' }));
      try { const r = await ruf('POST', '/status', zugang); statusAnsicht(ziel, r.vorgang, zugang); }
      catch (e) { ziel.replaceChildren(); fehler.textContent = e.message; fehler.hidden = false; }
    };
    form.addEventListener('submit', e => { e.preventDefault(); abfragen(); });
    if (h.get('nr') && (h.get('code') || ich?.angemeldet)) abfragen();
    if (ich?.angemeldet) meine($('[data-ap-meine]'));
  }

  const p = $('[data-ap-portal]'); if (p) portal(p);
  const s = $('[data-ap-status]'); if (s) status(s);
  document.querySelectorAll('[data-antragsformular]').forEach(festesFormular);
})();
