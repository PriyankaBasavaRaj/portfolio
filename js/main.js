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

    // Hero media plays directly — no separate intro screen, no skip button
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
    const sideFade = document.createElement('div');
    sideFade.className = 'hero-fade-side';
    mediaWrap.appendChild(sideFade);
    if (mediaEl.play) mediaEl.play().catch(() => {});

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

  // Single-click utility icon: no modal-then-arrow chain — each icon does its whole job in one click
  function utilityIconCard(item) {
    const el = document.createElement('button');
    el.className = 'utility-icon-card';
    el.innerHTML = `<img src="${item.icon}" alt="${item.label}"><span>${item.label}</span>`;
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
      case 'modal-awards':
        openAwardsModal(d.awards);
        break;
      case 'anchor-professional':
        scrollToSection('section-professional');
        break;
      case 'anchor-projects':
        scrollToSection('section-projects');
        break;
      case 'mailto-contact':
        window.location.href = `mailto:${d.hireMe.email}`;
        break;
    }
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Single-click direct link card (no modal step)
  function pickLinkCard(item) {
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
      const cw = rowHeader(`Continue Watching for ${profile.label}`);
      const cwWrap = trackWrap();
      const cwTrack = $('.row-track', cwWrap);
      d.projects.forEach(p => cwTrack.appendChild(projectLinkCard(p)));
      cw.appendChild(cwWrap);
      container.appendChild(cw);
      wireArrows(cwWrap);

      const picks = rowHeader(`Today's Top Picks for ${profile.label}`);
      const picksWrap = trackWrap();
      const picksTrack = $('.row-track', picksWrap);
      d.topPicksStalker.forEach(item => picksTrack.appendChild(pickLinkCard(item)));
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

    // ---- Recruiter / Referrer ----

    // Continue Watching for [Profile] — now the single row of utility icons
    const cw = rowHeader(`Continue Watching for ${profile.label}`);
    const cwWrap = trackWrap();
    const cwTrack = $('.row-track', cwWrap);
    d.utilityIcons.forEach(item => cwTrack.appendChild(utilityIconCard(item)));
    cw.appendChild(cwWrap);
    container.appendChild(cw);
    wireArrows(cwWrap);

    // Professional (full experience, always visible — no click-through needed)
    const profSection = document.createElement('section');
    profSection.className = 'row professional-section';
    profSection.id = 'section-professional';
    const profList = document.createElement('div');
    profList.className = 'professional-list';
    profSection.innerHTML = `<div class="row-header"><h2 class="row-title">Professional</h2></div>`;
    d.experience.forEach(e => {
      const card = document.createElement('div');
      card.className = 'professional-card';
      card.innerHTML = `
        <h3>${e.role}</h3>
        <div class="prof-meta">${e.company}${e.dates ? ' · ' + e.dates : ''}</div>
        <ul>${e.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
      profList.appendChild(card);
    });
    profSection.appendChild(profList);
    container.appendChild(profSection);

    // Skills (kept as a section for direct nav access)
    const skillsSection = rowHeader('Skills');
    skillsSection.id = 'section-skills';
    const skillsWrap = trackWrap();
    const skillsTrack = $('.row-track', skillsWrap);
    d.skills.forEach(s => skillsTrack.appendChild(skillCard(s)));
    skillsSection.appendChild(skillsWrap);
    container.appendChild(skillsSection);
    wireArrows(skillsWrap);

    // Projects (grid, always-visible details, single click opens link)
    const projSection = document.createElement('section');
    projSection.className = 'row';
    projSection.id = 'section-projects';
    projSection.innerHTML = `<div class="row-header"><h2 class="row-title">Projects</h2></div>`;

    const banner = document.createElement('div');
    banner.className = 'projects-banner';
    banner.innerHTML = `
      <div class="projects-banner-text">
        <h3>${d.projectsBanner.title}</h3>
        <p>${d.projectsBanner.body}</p>
      </div>
      <a class="btn btn-primary" href="${d.projectsBanner.url}" target="_blank" rel="noopener">${d.projectsBanner.buttonLabel}</a>`;
    projSection.appendChild(banner);

    const grid = document.createElement('div');
    grid.className = 'projects-grid';
    d.projects.forEach(p => {
      const a = document.createElement('a');
      a.className = 'project-grid-card';
      a.href = p.githubUrl || p.liveAppUrl || '#';
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerHTML = `
        <div class="pgc-media">
          <img src="${p.backdrop}" alt="${p.title}">
          ${p.updated ? `<span class="pgc-updated">Updated ${p.updated}</span>` : ''}
        </div>
        <div class="pgc-body">
          <h4>${p.title}</h4>
          <p>${p.synopsis}</p>
          <div class="pgc-tags">${(p.tags || []).map(t => `<span>${t}</span>`).join('')}</div>
        </div>`;
      grid.appendChild(a);
    });
    projSection.appendChild(grid);
    container.appendChild(projSection);

    // Today's Top Picks
    const picks = rowHeader(`Today's Top Picks for ${profile.label}`);
    const picksWrap = trackWrap();
    const picksTrack = $('.row-track', picksWrap);
    d.topPicksShared.forEach(item => picksTrack.appendChild(pickLinkCard(item)));
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
        <ul>${awards.map(a => `<li>${a.title}${a.category ? ' — ' + a.category : ''}, ${a.year}</li>`).join('')}</ul>
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
