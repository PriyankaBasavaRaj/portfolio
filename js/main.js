(async function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const state = { data: null, profile: null };

  async function loadData() {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load data.json');
    return res.json();
  }

  function showScreen(id) {
    ['screenIntro', 'screenProfiles', 'screenProfileIntro'].forEach(s => {
      const el = document.getElementById(s);
      if (s === id) {
        el.dataset.state = 'active';
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
        setTimeout(() => { if (el.classList.contains('hidden')) el.dataset.state = 'offstage'; }, 500);
      }
    });
  }

  // ---------- SCREEN 1: INTRO ----------
  function runIntro() {
    setTimeout(() => {
      renderProfileGrid();
      showScreen('screenProfiles');
    }, 1900);
  }

  // ---------- SCREEN 2: WHO'S WATCHING ----------
  function renderProfileGrid() {
    const grid = $('#profileGrid');
    grid.innerHTML = '';
    state.data.profiles.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'profile-tile';
      btn.innerHTML = `
        <span class="profile-avatar"><img src="${p.avatar}" alt="${p.label}"></span>
        <span>${p.label}</span>`;
      btn.addEventListener('click', () => selectProfile(p.id));
      grid.appendChild(btn);
    });
  }

  // ---------- SCREEN 3: PROFILE INTRO PLAYBACK ----------
  function selectProfile(profileId) {
    const profile = state.data.profiles.find(p => p.id === profileId);
    state.profile = profile;
    const mediaWrap = $('#profileIntroMedia');
    mediaWrap.innerHTML = '';

    let el;
    if (profile.introType === 'video') {
      el = document.createElement('video');
      el.src = profile.introSrc;
      el.autoplay = true;
      el.muted = true;
      el.playsInline = true;
      el.addEventListener('ended', enterBrowse);
      el.addEventListener('error', () => setTimeout(enterBrowse, 500));
    } else {
      el = document.createElement('img');
      el.src = profile.introSrc;
      // GIFs don't fire 'ended' — advance after a fixed viewing window
      setTimeout(enterBrowse, 3500);
    }
    mediaWrap.appendChild(el);
    showScreen('screenProfileIntro');

    $('#skipIntroBtn').onclick = enterBrowse;

    let advanced = false;
    function enterBrowse() {
      if (advanced) return;
      advanced = true;
      buildBrowse(profile);
    }
  }

  // ---------- BROWSE APP ----------
  function buildBrowse(profile) {
    ['screenIntro', 'screenProfiles', 'screenProfileIntro'].forEach(s => {
      document.getElementById(s).classList.add('hidden');
      document.getElementById(s).dataset.state = 'offstage';
    });
    document.getElementById('app').style.display = '';
    window.scrollTo(0, 0);

    document.documentElement.style.setProperty('--red', profile.accent || '#e50914');

    $('#navProfileAvatar').src = profile.avatar;
    $('#navProfileLabel').textContent = profile.label;
    $('#heroTagline').textContent = profile.heroTagline;
    $('#heroSynopsis').textContent = profile.heroSynopsis;

    const heroImg = $('#heroImg');
    if (profile.id === 'stalker') {
      heroImg.src = 'images/placeholder-backdrop-1.svg';
    } else {
      heroImg.src = 'images/placeholder-backdrop-2.svg';
    }

    renderNav(profile);
    renderRows(profile);
  }

  function renderNav(profile) {
    const links = $all('#browseNavLinks a');
    const fullProfile = profile.id !== 'stalker';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (!fullProfile && (href === '#section-professional' || href === '#section-skills' || href === '#section-projects')) {
        a.classList.add('disabled');
      } else {
        a.classList.remove('disabled');
      }
    });
  }

  function rowHeader(title) {
    const section = document.createElement('section');
    section.className = 'row';
    const header = document.createElement('div');
    header.className = 'row-header';
    const h2 = document.createElement('h2');
    h2.className = 'row-title';
    h2.textContent = title;
    header.appendChild(h2);
    section.appendChild(header);
    return section;
  }

  function trackWrap() {
    const wrap = document.createElement('div');
    wrap.className = 'row-track-wrap';
    wrap.innerHTML = `
      <button class="row-arrow left" aria-label="Scroll left">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <div class="row-track"></div>
      <button class="row-arrow right" aria-label="Scroll right">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      </button>`;
    return wrap;
  }

  function wireArrows(wrap) {
    const track = $('.row-track', wrap);
    const left = $('.row-arrow.left', wrap);
    const right = $('.row-arrow.right', wrap);
    const amt = () => Math.max(track.clientWidth * 0.8, 300);
    left.addEventListener('click', () => track.scrollBy({ left: -amt(), behavior: 'smooth' }));
    right.addEventListener('click', () => track.scrollBy({ left: amt(), behavior: 'smooth' }));
  }

  function projectCard(item) {
    const el = document.createElement('div');
    el.className = 'card';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.innerHTML = `
      <img src="${item.poster}" alt="${item.title}" loading="lazy">
      <div class="card-hover-info">
        <div class="card-hover-title">${item.title}</div>
        <div class="card-tags">${(item.tags || []).slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>
      </div>`;
    const open = () => openProjectModal(item);
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    return el;
  }

  function pickCard(item) {
    const el = document.createElement('div');
    el.className = 'card connect-card';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.innerHTML = `
      <img src="${item.poster}" alt="${item.title}" loading="lazy">
      <div class="card-hover-info"><div class="card-hover-title">${item.title}</div></div>`;
    const open = () => openPickModal(item);
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    return el;
  }

  function textCard(eyebrow, title, sub, onOpen) {
    const el = document.createElement('div');
    el.className = 'text-card';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.innerHTML = `
      <div>
        <div class="text-card-eyebrow">${eyebrow}</div>
        <div class="text-card-title">${title}</div>
      </div>
      <div class="text-card-sub">${sub}</div>`;
    el.addEventListener('click', onOpen);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } });
    return el;
  }

  function skillCard(skill) {
    const el = document.createElement('div');
    el.className = 'skill-card';
    el.innerHTML = `<img src="${skill.icon}" alt="${skill.name}"><span>${skill.name}</span>`;
    return el;
  }

  function renderRows(profile) {
    const container = $('#rowsContainer');
    container.innerHTML = '';
    const d = state.data;

    if (profile.id === 'stalker') {
      // Continue Watching (reuse projects, playful framing)
      const cw = rowHeader(`Continue Watching for ${profile.label}`);
      const cwWrap = trackWrap();
      const cwTrack = $('.row-track', cwWrap);
      d.projects.forEach(p => cwTrack.appendChild(projectCard(p)));
      cw.appendChild(cwWrap);
      container.appendChild(cw);
      wireArrows(cwWrap);

      const picks = rowHeader(`Today's Top Picks for ${profile.label}`);
      const picksWrap = trackWrap();
      const picksTrack = $('.row-track', picksWrap);
      d.topPicksStalker.forEach(item => picksTrack.appendChild(pickCard(item)));
      picks.appendChild(picksWrap);
      container.appendChild(picks);
      wireArrows(picksWrap);

      const hireSection = document.createElement('section');
      hireSection.className = 'row';
      hireSection.id = 'section-hire-me';
      hireSection.innerHTML = `
        <div class="row-header"><h2 class="row-title">${d.hireMe.heading}</h2></div>
        <p class="empty-row-note">${d.hireMe.body} <a href="mailto:${d.hireMe.email}" style="color:var(--text);text-decoration:underline;">${d.hireMe.email}</a></p>`;
      container.appendChild(hireSection);
      return;
    }

    // ---- Recruiter / Referrer (shared structure) ----

    // Continue Watching for [Profile]
    const cw = rowHeader(`Continue Watching for ${profile.label}`);
    const cwWrap = trackWrap();
    const cwTrack = $('.row-track', cwWrap);
    d.projects.forEach(p => cwTrack.appendChild(projectCard(p)));
    cw.appendChild(cwWrap);
    container.appendChild(cw);
    wireArrows(cwWrap);

    // Easter egg banner
    if (profile.id === 'recruiter' && d.funExtras.promotion) {
      const banner = document.createElement('div');
      banner.className = 'easter-egg-banner';
      banner.innerHTML = `<img src="${d.funExtras.promotion}" alt="Career milestone">
        <div class="easter-egg-caption">Every project below led to one of these moments.</div>`;
      container.appendChild(banner);
    }
    if (profile.id === 'referrer' && d.funExtras.whyReferMe) {
      const banner = document.createElement('div');
      banner.className = 'easter-egg-banner';
      banner.innerHTML = `<img src="${d.funExtras.whyReferMe}" alt="Why refer me">
        <div class="easter-egg-caption">Why refer me? Keep scrolling.</div>`;
      container.appendChild(banner);
    }

    // Professional section anchor wraps Work Permit + Experience + Awards + Recommendations
    const professionalAnchor = document.createElement('div');
    professionalAnchor.id = 'section-professional';
    container.appendChild(professionalAnchor);

    // Work Permit
    const wp = rowHeader('Work Permit');
    const wpWrap = trackWrap();
    const wpTrack = $('.row-track', wpWrap);
    wpTrack.appendChild(textCard('Status', d.workPermit.heading, 'Tap for details', () => openTextModal(d.workPermit.heading, d.workPermit.lines)));
    wp.appendChild(wpWrap);
    container.appendChild(wp);
    wireArrows(wpWrap);

    // Skills
    const skillsSection = rowHeader('Skills');
    skillsSection.id = 'section-skills';
    const skillsWrap = trackWrap();
    const skillsTrack = $('.row-track', skillsWrap);
    d.skills.forEach(s => skillsTrack.appendChild(skillCard(s)));
    skillsSection.appendChild(skillsWrap);
    container.appendChild(skillsSection);
    wireArrows(skillsWrap);

    // Experience
    const exp = rowHeader('Experience');
    const expWrap = trackWrap();
    const expTrack = $('.row-track', expWrap);
    d.experience.forEach(e => {
      expTrack.appendChild(textCard(e.dates || e.company, e.role, e.company, () => openExperienceModal(e)));
    });
    exp.appendChild(expWrap);
    container.appendChild(exp);
    wireArrows(expWrap);

    // Awards
    const awards = rowHeader('Awards');
    const awardsWrap = trackWrap();
    const awardsTrack = $('.row-track', awardsWrap);
    d.awards.forEach(a => {
      awardsTrack.appendChild(textCard(a.year, a.title, a.category || '', () => openTextModal(a.title, [`${a.category ? a.category + ' — ' : ''}${a.year}`])));
    });
    awards.appendChild(awardsWrap);
    container.appendChild(awards);
    wireArrows(awardsWrap);

    // Recommendations
    const recs = rowHeader('Recommendations');
    if (d.recommendations && d.recommendations.length) {
      const recsWrap = trackWrap();
      const recsTrack = $('.row-track', recsWrap);
      d.recommendations.forEach(r => recsTrack.appendChild(textCard(r.role || '', r.name, r.quote, () => openTextModal(r.name, [r.quote]))));
      recs.appendChild(recsWrap);
      container.appendChild(recs);
      wireArrows(recsWrap);
    } else {
      const note = document.createElement('p');
      note.className = 'empty-row-note';
      note.textContent = 'Coming soon.';
      recs.appendChild(note);
      container.appendChild(recs);
    }

    // Projects
    const projects = rowHeader('Projects');
    projects.id = 'section-projects';
    const projWrap = trackWrap();
    const projTrack = $('.row-track', projWrap);
    d.projects.forEach(p => projTrack.appendChild(projectCard(p)));
    projects.appendChild(projWrap);
    container.appendChild(projects);
    wireArrows(projWrap);

    // Today's Top Picks
    const picks = rowHeader(`Today's Top Picks for ${profile.label}`);
    const picksWrap = trackWrap();
    const picksTrack = $('.row-track', picksWrap);
    d.topPicksShared.forEach(item => picksTrack.appendChild(pickCard(item)));
    picks.appendChild(picksWrap);
    container.appendChild(picks);
    wireArrows(picksWrap);

    // Hire Me
    const hireSection = document.createElement('section');
    hireSection.className = 'row';
    hireSection.id = 'section-hire-me';
    hireSection.innerHTML = `
      <div class="row-header"><h2 class="row-title">${d.hireMe.heading}</h2></div>
      <p class="empty-row-note">${d.hireMe.body} <a href="mailto:${d.hireMe.email}" style="color:var(--text);text-decoration:underline;">${d.hireMe.email}</a></p>`;
    container.appendChild(hireSection);
  }

  // ---------- MODALS ----------
  const overlay = $('#modalOverlay');
  const modal = $('#modal');

  function closeIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  }
  function playIcon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>`;
  }

  function openModalShell(bodyHtml) {
    modal.innerHTML = bodyHtml;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).addEventListener('click', closeModal);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.innerHTML = ''; }, 200);
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  function embedBlock(item) {
    if (item.embedType === 'link' && item.githubUrl) {
      return `<div class="modal-embed-wrap">
        <div class="modal-embed-label">This one lives on GitHub — the full script, ready to read.</div>
        <a class="modal-cta-link" href="${item.githubUrl}" target="_blank" rel="noopener">View Source on GitHub ↗</a>
      </div>`;
    }
    if (item.embedType === 'tableau' && item.liveAppUrl) {
      return `<div class="modal-embed-wrap">
        <div class="modal-embed-label">Live dashboard</div>
        <a class="modal-cta-link" href="${item.liveAppUrl}" target="_blank" rel="noopener">Open on Tableau Public ↗</a>
      </div>`;
    }
    if (item.embedType === 'iframe' && item.liveAppUrl) {
      return `<div class="modal-embed-wrap">
        <div class="modal-embed-label">Try it yourself</div>
        <iframe class="modal-live-embed" src="${item.liveAppUrl}" loading="lazy" title="${item.title} live app"></iframe>
      </div>`;
    }
    return '';
  }

  function openProjectModal(item) {
    openModalShell(`
      <div class="modal-backdrop">
        <img src="${item.backdrop || item.poster}" alt="${item.title}">
        <div class="modal-backdrop-fade"></div>
        <button class="modal-close" aria-label="Close">${closeIcon()}</button>
        <div class="modal-title-block">
          <h2 class="modal-title">${item.title}</h2>
          <div class="modal-actions">
            ${item.liveAppUrl ? `<a class="btn btn-secondary" href="${item.liveAppUrl}" target="_blank" rel="noopener">${playIcon()} Try It</a>` : ''}
            ${item.githubUrl ? `<a class="btn btn-secondary" href="${item.githubUrl}" target="_blank" rel="noopener">Source</a>` : ''}
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div>
          <div class="modal-meta-row">
            ${item.year ? `<span>${item.year}</span>` : ''}
            ${item.rating ? `<span class="rated">${item.rating}</span>` : ''}
            ${item.duration ? `<span>${item.duration}</span>` : ''}
          </div>
          <p class="modal-synopsis">${item.synopsis}</p>
        </div>
        <div class="modal-side">
          <p><span class="label">Tools:</span> ${(item.tags || []).join(', ')}</p>
        </div>
        ${embedBlock(item)}
      </div>`);
  }

  function openPickModal(item) {
    openModalShell(`
      <div class="modal-backdrop">
        <img src="${item.poster}" alt="${item.title}">
        <div class="modal-backdrop-fade"></div>
        <button class="modal-close" aria-label="Close">${closeIcon()}</button>
        <div class="modal-title-block"><h2 class="modal-title">${item.title}</h2></div>
      </div>
      <div class="modal-body">
        <div>
          <p class="modal-synopsis">${item.synopsis}</p>
          <a class="modal-cta-link" href="${item.url}" target="_blank" rel="noopener">Open ↗</a>
        </div>
        <div class="modal-side"></div>
      </div>`);
  }

  function openTextModal(heading, lines) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>${heading}</h2>
        ${lines.map(l => `<p>${l}</p>`).join('')}
      </div>`);
  }

  function openExperienceModal(exp) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>${exp.role}</h2>
        <div class="modal-meta-row"><span>${exp.company}</span>${exp.dates ? `<span>•</span><span>${exp.dates}</span>` : ''}</div>
        <ul>${exp.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
      </div>`);
  }

  // ---------- NAV SCROLL STATE ----------
  window.addEventListener('scroll', () => {
    const nav = $('#siteNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ---------- PROFILE SWITCHER ----------
  $('#profileSwitcher').addEventListener('click', () => {
    document.getElementById('app').style.display = 'none';
    renderProfileGrid();
    showScreen('screenProfiles');
  });

  // ---------- INIT ----------
  try {
    state.data = await loadData();
    runIntro();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="padding:60px;color:#fff;font-family:sans-serif;">
      Couldn't load site data. Make sure <code>data.json</code> is present. (${err.message})
    </div>`;
  }
})();
