(async function () {
  const state = { data: null };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  async function loadData() {
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load data.json');
    return res.json();
  }

  function renderHero(hero) {
    $('#heroTitle').textContent = hero.title;
    $('#heroTagline').textContent = hero.tagline;
    $('#heroSynopsis').textContent = hero.synopsis;
    $('#heroMatch').textContent = hero.match || '';

    const metaWrap = $('#heroMetaExtra');
    metaWrap.innerHTML = '';
    (hero.meta || []).forEach((m, i) => {
      const span = document.createElement('span');
      span.textContent = m;
      metaWrap.appendChild(span);
      if (i < hero.meta.length - 1) {
        const dot = document.createElement('span');
        dot.textContent = '•';
        dot.style.color = 'var(--text-faint)';
        metaWrap.appendChild(dot);
      }
    });

    const video = $('#heroVideo');
    if (hero.backgroundVideo) {
      video.src = hero.backgroundVideo;
      video.poster = hero.backgroundPoster || '';
      video.play().catch(() => {});
    } else if (hero.backgroundPoster) {
      video.remove();
      const img = document.createElement('img');
      img.src = hero.backgroundPoster;
      img.alt = '';
      $('.hero-media').prepend(img);
    }
  }

  function cardTemplate(item, kind) {
    const el = document.createElement('div');
    el.className = kind === 'connect' ? 'card connect-card' : 'card';
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `Open details for ${item.title}`);

    const img = document.createElement('img');
    img.src = item.poster;
    img.alt = item.title;
    img.loading = 'lazy';
    el.appendChild(img);

    const info = document.createElement('div');
    info.className = 'card-hover-info';
    const t = document.createElement('div');
    t.className = 'card-hover-title';
    t.textContent = item.title;
    info.appendChild(t);

    if (item.tags && item.tags.length) {
      const tagWrap = document.createElement('div');
      tagWrap.className = 'card-tags';
      item.tags.slice(0, 3).forEach(tag => {
        const s = document.createElement('span');
        s.textContent = tag;
        tagWrap.appendChild(s);
      });
      info.appendChild(tagWrap);
    }

    el.appendChild(info);

    const open = () => openModal(item, kind);
    el.addEventListener('click', open);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });

    return el;
  }

  function renderRow(rowId, items, kind, trackId) {
    const track = document.getElementById(trackId);
    track.innerHTML = '';
    items.forEach(item => track.appendChild(cardTemplate(item, kind)));
  }

  function setupArrows() {
    $all('.row-track-wrap').forEach(wrap => {
      const track = $('.row-track', wrap);
      const left = $('.row-arrow.left', wrap);
      const right = $('.row-arrow.right', wrap);
      const scrollBy = () => Math.max(track.clientWidth * 0.8, 300);
      left.addEventListener('click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
      right.addEventListener('click', () => track.scrollBy({ left: scrollBy(), behavior: 'smooth' }));
    });
  }

  // ---------- MODAL ----------
  const overlay = $('#modalOverlay');
  const modal = $('#modal');

  function embedBlock(item) {
    if (item.embedType === 'link' && item.githubUrl) {
      return `
        <div class="modal-embed-wrap">
          <div class="modal-embed-label">This one lives on GitHub — the full script, ready to read.</div>
          <a class="modal-cta-link" href="${item.githubUrl}" target="_blank" rel="noopener">
            View Source on GitHub ↗
          </a>
        </div>`;
    }
    if (item.embedType === 'tableau' && item.liveAppUrl) {
      return `
        <div class="modal-embed-wrap">
          <div class="modal-embed-label">Live dashboard</div>
          <a class="modal-cta-link" href="${item.liveAppUrl}" target="_blank" rel="noopener">
            Open on Tableau Public ↗
          </a>
        </div>`;
    }
    if (item.embedType === 'iframe' && item.liveAppUrl) {
      return `
        <div class="modal-embed-wrap">
          <div class="modal-embed-label">Try it yourself</div>
          <iframe class="modal-live-embed" src="${item.liveAppUrl}" loading="lazy"
            title="${item.title} live app"></iframe>
        </div>`;
    }
    return '';
  }

  function openModal(item, kind) {
    if (kind === 'connect') {
      modal.innerHTML = `
        <div class="modal-backdrop">
          <img src="${item.poster}" alt="${item.title}">
          <div class="modal-backdrop-fade"></div>
          <button class="modal-close" aria-label="Close">${closeIcon()}</button>
          <div class="modal-title-block">
            <h2 class="modal-title">${item.title}</h2>
          </div>
        </div>
        <div class="modal-body">
          <div>
            <p class="modal-synopsis">${item.synopsis}</p>
            <a class="modal-cta-link" href="${item.url}" target="_blank" rel="noopener">
              ${item.cta || 'Open'} ↗
            </a>
          </div>
          <div class="modal-side">
            ${(item.tags || []).length ? `<div class="modal-tags">${item.tags.map(t => `<span class="modal-tag">${t}</span>`).join('')}</div>` : ''}
          </div>
        </div>`;
    } else {
      modal.innerHTML = `
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
        </div>`;
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.modal-close', modal).addEventListener('click', closeModal);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { modal.innerHTML = ''; }, 200);
  }

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  function closeIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  }
  function playIcon() {
    return `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>`;
  }

  // ---------- NAV SCROLL STATE ----------
  window.addEventListener('scroll', () => {
    $('#siteNav').classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ---------- INIT ----------
  try {
    const data = await loadData();
    state.data = data;
    renderHero(data.hero);

    const featured = data.projects.filter(p => p.featured);
    renderRow('featured', featured, 'project', 'trackFeatured');
    renderRow('all', data.projects, 'project', 'trackAll');
    renderRow('connect', data.connect, 'connect', 'trackConnect');

    setupArrows();
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<div style="padding:60px;color:#fff;font-family:sans-serif;">
      Couldn't load site data. Make sure <code>data.json</code> is present. (${err.message})
    </div>`;
  }
})();
