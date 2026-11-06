/* Bundesamt für Verfassungsschutz (fiktiv) – Kopf, Fuß und kleine Helfer. Keine Abhängigkeiten. */
(() => {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const page = document.body.dataset.page || '';
  const nav = [
    ['index.html', 'start', 'Start'],
    ['amt.html', 'amt', 'Das Amt'],
    ['aufgaben.html', 'aufgaben', 'Arbeitsfelder'],
    ['vsnog.html', 'vsnog', 'VSNOG', true],
    ['urteile.html', 'urteile', 'Urteile'],
    ['einstufungen.html', 'einstufungen', 'Einstufungen'],
    ['presse.html', 'presse', 'Presse'],
    ['hinweise.html', 'hinweise', 'Hinweise']
  ];
  const links = nav.map(([href, id, label, hot]) =>
    `<a href="${href}"${hot ? ' class="hot"' : ''}${id === page ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const heute = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const kopf = `
    <a class="skip" href="#main">Zum Inhalt springen</a>
    <div class="read-progress" aria-hidden="true"></div>
    <div class="rp-bar"><div class="container">
      <span><b>Fiktiv</b> · Rollenspiel „BDR: Bundesrepublik Deutschland RP“ (Roblox). Kein Angebot einer echten Behörde.</span>
      <span class="rp-rechts"><span class="day mono">${heute}</span><a class="dienst-link" href="/dienst/">Dienstportal</a></span>
    </div></div>
    <header class="site-header"><div class="container head-row">
      <a class="logo" href="index.html" aria-label="Bundesamt für Verfassungsschutz, zur Startseite">
        <span class="flag" aria-hidden="true"><i></i><i></i><i></i></span>
        <img class="wappen" src="assets/marke/wappen-animiert.svg" alt="" width="30" height="35">
        <span class="words">Bundesamt für<br>Verfassungsschutz<small>BfV · Köln · Berlin</small></span>
      </a>
      <nav class="mainnav" id="mainnav" aria-label="Hauptnavigation">${links}</nav>
      <a class="btn btn-primary btn-sm head-cta" href="hinweise.html">Hinweis geben</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-controls="mainnav" aria-label="Menü öffnen">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div></header>`;

  const fuss = `
    <footer class="footer"><div class="container">
      <div class="foot-grid">
        <div>
          <a class="logo" href="index.html"><span class="flag" aria-hidden="true"><i></i><i></i><i></i></span><img class="wappen" src="assets/marke/wappen.svg" alt="" width="30" height="35">
            <span class="words">Bundesamt für<br>Verfassungsschutz<small>Im Geschäftsbereich des BMIH</small></span></a>
          <p class="claim">Nachrichtendienst des Bundes für Terror-, Spionage- und Cyberabwehr. Unter der Fach- und Rechtsaufsicht des Bundesministeriums für Inneres und Heimat.</p>
        </div>
        <div><h4>Das Amt</h4><ul><li><a href="amt.html">Auftrag und Aufsicht</a></li><li><a href="amt.html#leitung">Amtsleitung</a></li><li><a href="amt.html#personal">Neuaufstellung</a></li><li><a href="aufgaben.html">Arbeitsfelder</a></li></ul></div>
        <div><h4>Aktuell</h4><ul><li><a href="vsnog.html">VSNOG · Drs. 3/15</a></li><li><a href="vsnog.html#text">Gesetzestext</a></li><li><a href="urteile.html">Urteile des BVerfG</a></li><li><a href="einstufungen.html">Einstufungen</a></li><li><a href="presse.html">Pressemitteilungen</a></li><li><a href="presse.html#fotos">Pressefotos</a></li></ul></div>
        <div><h4>Service</h4><ul><li><a href="hinweise.html">Hinweis geben</a></li><li><a href="/dienst/">Dienstportal (intern)</a></li><li><a href="https://bmibund.duckdns.org">BMIH (Ministerium)</a></li><li><a href="impressum.html">Impressum</a></li><li><a href="impressum.html#datenschutz">Datenschutz</a></li></ul></div>
      </div>
      <div class="foot-word" aria-hidden="true">Verfassungsschutz</div>
      <div class="foot-bottom">
        <span>© 2026 Bundesamt für Verfassungsschutz · fiktiv</span>
        <span>Rollenspiel „BDR: Bundesrepublik Deutschland RP“ (Roblox). Personen, Ämter und Vorgänge sind erfunden.</span>
      </div>
    </div></footer>
    <button class="to-top" type="button" aria-label="Nach oben"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button>`;

  document.body.insertAdjacentHTML('afterbegin', kopf);
  document.body.insertAdjacentHTML('beforeend', fuss);

  // Menü (Handy)
  const header = document.querySelector('.site-header');
  const menuBtn = header.querySelector('.menu-btn');
  menuBtn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('open')) menuBtn.click(); });

  // Lesefortschritt und Nach-oben-Knopf
  const rp = document.querySelector('.read-progress');
  const top = document.querySelector('.to-top');
  top.addEventListener('click', () => scrollTo({ top: 0 }));
  const onScroll = () => {
    const max = doc.scrollHeight - innerHeight;
    rp.style.setProperty('--rp', max > 0 ? Math.min(1, scrollY / max) : 0);
    top.classList.toggle('show', scrollY > 900);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Einblenden
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
  } else items.forEach(el => el.classList.add('in'));

  // Lichtschein unter der Maus
  document.addEventListener('pointermove', e => {
    const c = e.target.closest && e.target.closest('.card');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`);
  }, { passive: true });

  // Countdown bis zur Veröffentlichung
  document.querySelectorAll('[data-release]').forEach(box => {
    const ziel = new Date(box.dataset.release).getTime();
    const felder = box.querySelectorAll('[data-clock] b');
    const tick = () => {
      let d = Math.max(0, ziel - Date.now());
      if (d === 0) { box.classList.add('is-live'); return false; }
      const teile = [864e5, 36e5, 6e4, 1e3].map(n => { const v = Math.floor(d / n); d -= v * n; return v; });
      felder.forEach((b, i) => { b.textContent = String(teile[i]).padStart(2, '0'); });
      return true;
    };
    if (tick()) { const t = setInterval(() => { if (!tick()) clearInterval(t); }, 1000); }
  });

  // Unternavigation: aktiven Abschnitt markieren
  const sub = document.querySelector('.subnav');
  if (sub && 'IntersectionObserver' in window) {
    const map = new Map();
    sub.querySelectorAll('a[href^="#"]').forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) map.set(s, a); });
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      sub.querySelectorAll('a.on').forEach(a => a.classList.remove('on'));
      const a = map.get(e.target);
      if (a) {
        a.classList.add('on');
        // Nur die Leiste waagerecht nachführen. scrollIntoView würde bei der sticky Leiste auch die Seite verschieben.
        const c = a.parentElement, cr = c.getBoundingClientRect(), ar = a.getBoundingClientRect();
        c.scrollTo({ left: c.scrollLeft + ar.left - cr.left - (cr.width - ar.width) / 2, behavior: 'smooth' });
      }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((_, s) => so.observe(s));
  }

  // Bildergalerie mit Großansicht
  const dlg = document.querySelector('dialog.lightbox');
  if (dlg) {
    const img = dlg.querySelector('img');
    const cap = dlg.querySelector('p');
    document.querySelectorAll('[data-full]').forEach(btn => btn.addEventListener('click', () => {
      img.src = btn.dataset.full;
      img.alt = btn.querySelector('img').alt;
      cap.textContent = btn.dataset.caption || img.alt;
      dlg.showModal();
    }));
    dlg.querySelector('.close').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }

  // Hinweisformular: im Rollenspiel nur Bestätigung, nichts wird gesendet
  document.querySelectorAll('form[data-rp]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const nr = 'BfV-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const out = f.querySelector('[data-nr]');
    if (out) out.textContent = nr;
    f.classList.add('sent');
    f.querySelector('button[type=submit]').disabled = true;
  }));
  // Live-Daten aus dem Dienstportal: verkündete Entscheidungen, öffentliche Einstufungen, freigegebene Pressemitteilungen.
  // Nur Text (textContent), nie HTML aus der Datenbank.
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const tagD = iso => iso ? new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  const anker = az => String(az).replace(/\s+/g, '-');
  const absaetze = (ziel, text) => String(text || '').split(/\n{2,}/).forEach(t => ziel.append(el('p', null, t)));
  const laden = async pfad => { const r = await fetch(pfad, { headers: { Accept: 'application/json' } }); if (!r.ok) throw new Error(r.status); return r.json(); };
  const leerText = (box, text) => box.replaceChildren(el('p', 'lade leer', text));
  const filtern = (name, box) => {
    const f = document.querySelector(`[data-suche="${name}"]`);
    if (!f) return;
    f.addEventListener('input', () => { const q = f.value.trim().toLowerCase(); box.querySelectorAll('[data-text]').forEach(x => { x.hidden = !!q && !x.dataset.text.includes(q); }); });
  };
  const ERG = { 'stattgegeben': 'gold', 'teilweise stattgegeben': 'gold', 'zurückgewiesen': '', 'als unzulässig verworfen': 'red' };

  const urteile = document.querySelector('[data-api="entscheidungen"]');
  if (urteile) laden('/api/oeffentlich/entscheidungen').then(({ entscheidungen: l }) => {
    if (!l.length) return leerText(urteile, 'Noch keine Entscheidung verkündet.');
    urteile.replaceChildren(...l.map((v, i) => {
      const e = v.entscheidung;
      const a = el('article', 'urteil reveal in');
      a.id = anker(v.az);
      a.dataset.text = `${v.az} ${v.art} ${v.gegenstand} ${e.tenor} ${e.leitsatz || ''}`.toLowerCase();
      a.style.setProperty('--d', `${Math.min(i, 6) * 0.05}s`);
      const kopfZeile = el('header', 'urteil-kopf');
      const az = el('a', 'az', v.az); az.href = `#${a.id}`;
      kopfZeile.append(az, el('span', 'tag ' + (ERG[e.ergebnis] || ''), `${e.art}: ${e.ergebnis}`), el('time', 'mono', tagD(e.datum)));
      const tenor = el('blockquote', 'tenor', e.tenor);
      const gruende = el('details', 'gruende'); gruende.append(el('summary', null, 'Gründe lesen')); absaetze(gruende, e.gruende);
      const fuss = el('footer', 'urteil-fuss');
      fuss.append(el('span', null, `${v.senat}. Senat`), el('span', null, v.art), el('span', null, `Antragsteller: ${v.antragsteller || '–'}`), el('span', 'mono', `Stimmen ${e.stimmen}`));
      a.append(kopfZeile, el('h3', null, v.gegenstand), e.leitsatz ? el('p', 'leitsatz', e.leitsatz) : '', tenor, gruende, fuss);
      return a;
    }));
    filtern('entscheidungen', urteile);
    if (location.hash && scrollY < 80) document.getElementById(location.hash.slice(1))?.scrollIntoView(); // nur wenn noch nicht selbst gescrollt
  }).catch(() => leerText(urteile, 'Die Entscheidungssammlung ist gerade nicht erreichbar.'));

  const einst = document.querySelector('[data-api="einstufungen"]');
  if (einst) laden('/api/oeffentlich/einstufungen').then(({ einstufungen: l }) => {
    if (!l.length) return leerText(einst, 'Derzeit ist keine Einstufung öffentlich bekanntgegeben.');
    einst.replaceChildren(...l.map(x => {
      const r = el('article', 'einst reveal in');
      r.dataset.text = `${x.name} ${x.stufe}`.toLowerCase();
      const name = el('div', 'einst-name'); name.append(el('b', null, x.name || 'Unbekannt'), el('span', null, `seit ${tagD(x.seit)}`));
      const tags = el('div', 'einst-tags'); tags.append(el('span', 'tag red', x.stufe));
      if (x.gerichtlich) tags.append(el('span', 'tag gold', 'gerichtlich bestätigt'));
      r.append(name, tags);
      return r;
    }));
    filtern('einstufungen', einst);
  }).catch(() => leerText(einst, 'Die Liste ist gerade nicht erreichbar.'));

  const news = document.querySelector('[data-api="presse"]');
  if (news) laden('/api/oeffentlich/presse').then(({ beitraege: l }) => {
    news.prepend(...l.map(b => {
      const a = el('article', 'news-item reveal in'); a.id = b.id;
      const t = el('time', null, tagD(b.datum)); t.dateTime = (b.datum || '').slice(0, 10);
      const d = el('div'); d.append(el('span', 'tag gold', b.kategorie), el('h3', null, b.titel)); absaetze(d, b.text);
      a.append(t, d);
      return a;
    }));
    if (location.hash && scrollY < 80) document.getElementById(location.hash.slice(1))?.scrollIntoView(); // nur wenn noch nicht selbst gescrollt
  }).catch(() => {});
})();
