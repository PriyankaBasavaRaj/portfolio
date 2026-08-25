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
    ['screenIntro', 'screenProfiles'].forEach(s => {
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
      btn.addEventListener('click', () => buildBrowse(p));
      grid.appendChild(btn);
    });
  }

  // ---------- BROWSE APP ----------
  function buildBrowse(profile) {
    state.profile = profile;
    ['screenIntro', 'screenProfiles'].forEach(s => {
      document.getElementById(s).classList.add('hidden');
      document.getElementById(s).dataset.state = 'offstage';
    });
    document.getElementById('app').style.display = '';
    window.scrollTo(0, 0);

    document.documentElement.style.setProperty('--red', profile.accent || '#e50914');

    $('#navProfileAvatar').src = profile.avatar;
    $('#navProfileLabel').textContent = profile.label;
    $('#heroTagline').textContent = profile.heroTagline || '';
    $('#heroSynopsis').textContent = profile.heroSynopsis || '';

    // Hero media plays directly, framed to a fixed rectangle — no separate intro screen
    const mediaWrap = $('#heroMedia');
    mediaWrap.innerHTML = '';
    let mediaEl;
    if (profile.heroBackgroundType === 'video') {
      mediaEl = document.createElement('video');
      mediaEl.src = profile.heroBackgroundSrc;
      mediaEl.autoplay = true;
      mediaEl.muted = true;
      mediaEl.loop = true;
      mediaEl.playsInline = true;
    } else {
      mediaEl = document.createElement('img');
      mediaEl.src = profile.heroBackgroundSrc;
      mediaEl.alt = '';
    }
    mediaWrap.appendChild(mediaEl);
    if (mediaEl.play) mediaEl.play().catch(() => {});

    renderNav(profile);
    renderRows(profile);

    // Stalker has no Hire Me and no Continue Watching row — adjust hero actions accordingly
    const heroHireMeBtn = $('#heroHireMeBtn');
    const viewProfileBtn = $('#heroViewProfileBtn');
    if (profile.id === 'stalker') {
      heroHireMeBtn.style.display = 'none';
      viewProfileBtn.setAttribute('href', '#row-top-picks');
    } else {
      heroHireMeBtn.style.display = '';
      viewProfileBtn.setAttribute('href', '#row-continue-watching');
    }
  }

  function renderNav(profile) {
    const fullProfile = profile.id !== 'stalker';
    $all('#browseNavLinks a').forEach(a => {
      const key = a.dataset.nav;
      if (!fullProfile && (key === 'professional' || key === 'skills' || key === 'projects' || key === 'hireme')) {
        a.classList.add('disabled');
      } else {
        a.classList.remove('disabled');
      }
    });
  }

  function rowHeader(title, id) {
    const section = document.createElement('section');
    section.className = 'row';
    if (id) section.id = id;
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

  const UTILITY_GLYPHS = {
    workpermit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><line x1="14" y1="10" x2="19" y2="10"/><line x1="14" y1="14" x2="19" y2="14"/></svg>',
    skills: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    experience: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    awards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M9 13.5 7 22l5-3 5 3-2-8.5"/></svg>',
    projects: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="12" r="3"/><path d="M8.6 7.5 15.4 10.5M8.6 16.5 15.4 13.5"/></svg>',
    contact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2 7 12 13 22 7"/></svg>'
  };

  // Single-click utility icon: photo card, whole card click opens the content directly
  function utilityIconCard(item) {
    const el = document.createElement('button');
    el.className = 'utility-icon-card';
    el.innerHTML = `
      <img class="uic-photo" src="${item.photo}" alt="${item.label}" loading="lazy">
      <div class="uic-label-bar">${UTILITY_GLYPHS[item.id] || ''}<span>${item.label}</span></div>`;
    el.addEventListener('click', () => runUtilityAction(item.action));
    return el;
  }

  function runUtilityAction(action) {
    const d = state.data;
    switch (action) {
      case 'modal-workpermit':
        openTextModal(d.workPermit.heading, d.workPermit.lines);
        break;
      case 'modal-skills':
        openSkillsModal(d.skills);
        break;
      case 'modal-experience':
        openExperienceModal(d.experience);
        break;
      case 'modal-awards':
        openAwardsModal(d.awards);
        break;
      case 'modal-projects':
        openProjectsModal(d);
        break;
      case 'modal-hireme':
        openHireMeModal(d.hireMe);
        break;
      case 'mailto-contact':
        window.location.href = `mailto:${d.hireMe.email}`;
        break;
    }
  }

  // Single-click direct link card, OR action-driven card (opens the same modal as its icon)
  function pickLinkCard(item) {
    if (item.action) {
      const btn = document.createElement('button');
      btn.className = 'pick-link-card';
      btn.style.border = 'none';
      btn.style.padding = '0';
      btn.innerHTML = `<img src="${item.poster}" alt="${item.title}"><div class="pick-title">${item.title}</div>`;
      btn.addEventListener('click', () => runUtilityAction(item.action));
      return btn;
    }
    if (item.logo) {
      const a = document.createElement('a');
      a.className = 'pick-link-card pick-logo-card';
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `
        <div class="pick-logo-tile"><img class="pick-logo-icon" src="${item.logo}" alt="${item.title}"></div>
        <div class="pick-title">${item.title}</div>`;
      return a;
    }
    const a = document.createElement('a');
    a.className = 'pick-link-card';
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<img src="${item.poster}" alt="${item.title}"><div class="pick-title">${item.title}</div>`;
    return a;
  }

  // Single-click direct link project card (used in Stalker's Continue Watching)
  function projectLinkCard(item) {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = item.githubUrl || item.liveAppUrl || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `
      <img src="${item.poster}" alt="${item.title}" loading="lazy">
      <div class="card-hover-info">
        <div class="card-hover-title">${item.title}</div>
        <div class="card-tags">${(item.tags || []).slice(0, 3).map(t => `<span>${t}</span>`).join('')}</div>
      </div>`;
    return a;
  }

  function renderRows(profile) {
    const container = $('#rowsContainer');
    container.innerHTML = '';
    const d = state.data;

    if (profile.id === 'stalker') {
      const picks = rowHeader(`Today's Top Picks for ${profile.label}`, 'row-top-picks');
      const picksWrap = trackWrap();
      const picksTrack = $('.row-track', picksWrap);
      d.topPicksStalker.forEach(item => picksTrack.appendChild(pickLinkCard(item)));
      picks.appendChild(picksWrap);
      container.appendChild(picks);
      wireArrows(picksWrap);
      return;
    }

    // ---- Recruiter / Referrer: exactly two rows ----

    const cw = rowHeader(`Continue Watching for ${profile.label}`, 'row-continue-watching');
    const cwWrap = trackWrap();
    const cwTrack = $('.row-track', cwWrap);
    d.utilityIcons.forEach(item => cwTrack.appendChild(utilityIconCard(item)));
    cw.appendChild(cwWrap);
    container.appendChild(cw);
    wireArrows(cwWrap);

    const picks = rowHeader(`Today's Top Picks for ${profile.label}`);
    const picksWrap = trackWrap();
    const picksTrack = $('.row-track', picksWrap);
    d.topPicksShared.forEach(item => picksTrack.appendChild(pickLinkCard(item)));
    picks.appendChild(picksWrap);
    container.appendChild(picks);
    wireArrows(picksWrap);
  }

  // ---------- MODALS ----------
  const overlay = $('#modalOverlay');
  const modal = $('#modal');

  function closeIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  }

  function openModalShell(bodyHtml, wide) {
    modal.className = wide ? 'modal modal-wide' : 'modal';
    modal.innerHTML = bodyHtml;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).addEventListener('click', closeModal);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.innerHTML = ''; modal.className = 'modal'; }, 200);
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal(); });

  function openTextModal(heading, lines) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>${heading}</h2>
        ${lines.map(l => `<p>${l}</p>`).join('')}
      </div>`);
  }

  function openSkillsModal(skills) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>Skills</h2>
        <div class="row-track" style="padding:0;overflow:visible;flex-wrap:wrap;">
          ${skills.map(s => `<div class="skill-card"><img src="${s.icon}" alt="${s.name}"><span>${s.name}</span></div>`).join('')}
        </div>
      </div>`);
  }

  function openAwardsModal(awards) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>Awards</h2>
        <ul>${awards.map(a => {
          const text = `${a.title}${a.category ? ' — ' + a.category : ''}, ${a.year}`;
          return a.url
            ? `<li><a href="${a.url}" target="_blank" rel="noopener" style="color:var(--text);text-decoration:underline;">${text}</a></li>`
            : `<li>${text}</li>`;
        }).join('')}</ul>
      </div>`);
  }

  function openHireMeModal(hireMe) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>${hireMe.heading}</h2>
        ${hireMe.paragraphs.map(p => `<p>${p}</p>`).join('')}
        <div class="hero-actions" style="margin-top:20px;">
          <a class="btn btn-primary" href="${hireMe.linkedinUrl}" target="_blank" rel="noopener">Connect with me on LinkedIn</a>
          <a class="btn btn-secondary" href="mailto:${hireMe.email}">Email Me</a>
        </div>
      </div>`);
  }

  function openExperienceModal(experience) {
    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>Experience</h2>
        ${experience.map(e => `
          <div class="professional-card" style="margin-bottom:16px;">
            <h3>${e.role}</h3>
            <div class="prof-meta">${e.company}${e.dates ? ' · ' + e.dates : ''}</div>
            <ul>${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>
          </div>`).join('')}
      </div>`, true);
  }

  function openProjectsModal(d) {
    const grid = d.projects.map(p => `
      <a class="project-grid-card" href="${p.githubUrl || p.liveAppUrl || '#'}" target="_blank" rel="noopener">
        <div class="pgc-media">
          <img src="${p.backdrop}" alt="${p.title}">
          ${p.updated ? `<span class="pgc-updated">Updated ${p.updated}</span>` : ''}
        </div>
        <div class="pgc-body">
          <h4>${p.title}</h4>
          <p>${p.synopsis}</p>
          <div class="pgc-tags">${(p.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
        </div>
      </a>`).join('');

    openModalShell(`
      <button class="modal-close" aria-label="Close" style="position:absolute;">${closeIcon()}</button>
      <div class="modal-text-block">
        <h2>Projects</h2>
        <div class="projects-banner" style="margin:0 0 20px;">
          <div class="projects-banner-text">
            <h3>${d.projectsBanner.title}</h3>
            <p>${d.projectsBanner.body}</p>
          </div>
          <a class="btn btn-primary" href="${d.projectsBanner.url}" target="_blank" rel="noopener">${d.projectsBanner.buttonLabel}</a>
        </div>
        <div class="modal-projects-grid">${grid}</div>
      </div>`, true);
  }

  // ---------- NAV ----------
  function wireNav() {
    $all('#browseNavLinks a').forEach(a => {
      a.addEventListener('click', e => {
        if (a.classList.contains('disabled')) { e.preventDefault(); return; }
        const key = a.dataset.nav;
        const d = state.data;
        if (key === 'home') return; // native anchor to #top is fine
        e.preventDefault();
        if (key === 'professional') openExperienceModal(d.experience);
        else if (key === 'skills') openSkillsModal(d.skills);
        else if (key === 'projects') openProjectsModal(d);
        else if (key === 'hireme') openHireMeModal(d.hireMe);
      });
    });
  }

  window.addEventListener('scroll', () => {
    const nav = $('#siteNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  $('#profileSwitcher').addEventListener('click', () => {
    document.getElementById('app').style.display = 'none';
    renderProfileGrid();
    showScreen('screenProfiles');
  });

  // ---------- INIT ----------
  try {
    state.data = await loadData();
    $('#heroHireMeBtn').addEventListener('click', e => {
      e.preventDefault();
      openHireMeModal(state.data.hireMe);
    });
    wireNav();
    runIntro();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="padding:60px;color:#fff;font-family:sans-serif;">
      Couldn't load site data. Make sure <code>data.json</code> is present. (${err.message})
    </div>`;
  }
})();
