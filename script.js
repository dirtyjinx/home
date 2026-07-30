// ==========================================================================
// Dirty Jinx — semi-dynamic site driven by config.json
// ==========================================================================

let config = null;
let galleryMedia = [];

const SOCIAL_META = {
    facebook:   { icon: 'bi-facebook',  label: 'Facebook',   color: '#1877F2' },
    instagram:  { icon: 'bi-instagram', label: 'Instagram',  color: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' },
    tiktok:     { icon: 'bi-tiktok',    label: 'TikTok',     color: '#000' },
    youtube:    { icon: 'bi-youtube',   label: 'YouTube',    color: '#FF0000' },
    soundcloud: { icon: 'bi-soundwave', label: 'SoundCloud', color: '#FF5500' }
};

// --- Boot ------------------------------------------------------------------

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        config = await response.json();
        initializePage();
    } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
    }
}

function initializePage() {
    document.getElementById('footerBandName').textContent = config.band.name;

    const heroLogo = document.getElementById('heroLogo');
    const navLogo = document.querySelector('.nav-logo img');
    const footerLogo = document.getElementById('footerLogo');
    if (config.hero.logo) heroLogo.src = config.hero.logo;
    if (config.hero.logoIcon) {
        if (navLogo) navLogo.src = config.hero.logoIcon;
        if (footerLogo) footerLogo.src = config.hero.logoIcon;
    }

    loadAbout();
    loadConcerts();
    loadGallery();
    loadMusicians();
    loadContact();

    initNav();
    initReveal();
}

// --- Shared helpers --------------------------------------------------------

function buildSocials(container) {
    if (!container) return;
    container.innerHTML = '';
    const social = config.contact.social || {};
    Object.keys(SOCIAL_META).forEach(key => {
        if (!social[key]) return;
        const meta = SOCIAL_META[key];
        const a = document.createElement('a');
        a.className = 'social-link';
        a.href = social[key];
        a.target = '_blank';
        a.rel = 'noopener';
        a.setAttribute('aria-label', meta.label);
        a.innerHTML = `<span class="social-brand" style="background:${meta.color}"><i class="bi ${meta.icon}"></i></span><span class="social-name">${meta.label}</span>`;
        container.appendChild(a);
    });
}

// --- Section 1: About ------------------------------------------------------

function loadAbout() {
    const a = config.about;
    document.getElementById('aboutEyebrow').textContent = a.eyebrow;
    document.getElementById('aboutTitle').textContent = a.title;
    document.getElementById('aboutText').innerHTML = a.text;
    buildSocials(document.getElementById('aboutSocials'));
}

// --- Section 2: Concerts ---------------------------------------------------

function loadConcerts() {
    const c = config.concerts;
    document.getElementById('concertsEyebrow').textContent = c.eyebrow;
    document.getElementById('concertsTitle').textContent = c.title;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];
    (c.dates || []).forEach(item => {
        const d = new Date(item.date);
        if (isNaN(d)) return;
        (d >= today ? upcoming : past).push({ ...item, dateObj: d });
    });
    upcoming.sort((a, b) => a.dateObj - b.dateObj);
    past.sort((a, b) => b.dateObj - a.dateObj);

    document.getElementById('upcomingCount').textContent = upcoming.length;
    document.getElementById('pastCount').textContent = past.length;

    renderConcertList(document.getElementById('upcomingList'), upcoming, 'Aucune date à venir pour le moment. Revenez bientôt !');
    renderConcertList(document.getElementById('pastList'), past, 'Aucune date passée enregistrée.');

    initConcerts();
}

function renderConcertList(ul, items, emptyMsg) {
    ul.innerHTML = '';
    ul.classList.toggle('is-empty', !items.length);
    if (!items.length) {
        const li = document.createElement('li');
        li.className = 'concerts-empty';
        li.textContent = emptyMsg;
        ul.appendChild(li);
        return;
    }
    items.forEach(item => {
        const day = item.dateObj.toLocaleDateString('fr-FR', { day: '2-digit' });
        const month = item.dateObj.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
        const li = document.createElement('li');
        li.className = 'concert-item';
        li.innerHTML = `
            <span class="concert-date">
                <span class="day">${day}</span>
                <span class="month">${month}</span>
            </span>
            <span class="concert-show">${item.show}</span>
            <span class="concert-location"><i class="bi bi-geo-alt"></i>${item.location}</span>
        `;
        ul.appendChild(li);
    });
}

const CONCERTS_MAX_ROWS = 5;

function initConcerts() {
    const panel = document.querySelector('.concerts-panel');
    const tabs = document.querySelectorAll('.tab-btn');
    const lists = {
        upcoming: document.getElementById('upcomingList'),
        past: document.getElementById('pastList')
    };
    if (!panel) return;

    const activeKey = () => {
        const t = document.querySelector('.tab-btn.active');
        return t ? t.dataset.tab : 'upcoming';
    };

    const rowHeight = () => {
        const item = panel.querySelector('.concert-item');
        return item ? item.getBoundingClientRect().height : 90;
    };

    // Hauteur réelle du contenu d'une liste, sans le centrage (is-empty) ni le masquage.
    const contentHeight = (ul) => {
        const wasHidden = ul.classList.contains('is-hidden');
        const wasEmpty = ul.classList.contains('is-empty');
        if (wasHidden) ul.classList.remove('is-hidden');
        if (wasEmpty) ul.classList.remove('is-empty');
        const h = ul.scrollHeight;
        if (wasEmpty) ul.classList.add('is-empty');
        if (wasHidden) ul.classList.add('is-hidden');
        return h;
    };

    const updateScrollState = () => {
        const moreBelow = panel.scrollHeight - panel.clientHeight - panel.scrollTop > 1;
        panel.classList.toggle('is-scrollable', moreBelow);
    };

    const resize = () => {
        const cap = rowHeight() * CONCERTS_MAX_ROWS;
        const natural = Math.max(contentHeight(lists.upcoming), contentHeight(lists.past));
        panel.style.height = Math.min(cap, natural) + 'px';
        updateScrollState();
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            Object.keys(lists).forEach(key => {
                lists[key].classList.toggle('is-hidden', key !== target);
            });
            panel.scrollTop = 0;
            updateScrollState();
        });
    });

    panel.addEventListener('scroll', updateScrollState);

    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
    window.addEventListener('load', resize);
}

// --- Section 3: Gallery (carousel + modal) ---------------------------------

function loadGallery() {
    const g = config.gallery;
    document.getElementById('galleryEyebrow').textContent = g.eyebrow;
    document.getElementById('galleryTitle').textContent = g.title;

    galleryMedia = [];
    (g.images || []).forEach(img => galleryMedia.push({
        type: 'image',
        src: `${g.imagesFolder}/${img}`,
        alt: img.replace(/\.[^/.]+$/, '')
    }));
    (g.videos || []).forEach(vid => galleryMedia.push({
        type: 'video',
        src: `${g.videosFolder}/${vid}`,
        alt: vid.replace(/\.[^/.]+$/, '')
    }));
    galleryMedia = shuffleArray(galleryMedia);

    const track = document.getElementById('carouselTrack');
    track.innerHTML = '';
    galleryMedia.forEach((media, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.addEventListener('click', () => openModal(index));

        if (media.type === 'image') {
            const img = document.createElement('img');
            img.src = media.src;
            img.alt = media.alt;
            img.loading = 'lazy';
            img.decoding = 'async';
            item.appendChild(img);
        } else {
            // Lazy : pas de src au départ (data-src), on charge/joue à l'entrée à l'écran.
            const video = document.createElement('video');
            video.dataset.src = media.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.preload = 'none';
            item.appendChild(video);

            const badge = document.createElement('span');
            badge.className = 'media-badge';
            badge.innerHTML = '<i class="bi bi-play-fill"></i>';
            item.appendChild(badge);
        }
        track.appendChild(item);
    });

    observeGalleryVideos(track);

    initCarouselControls(track);
}

// Charge et joue chaque vidéo seulement quand elle est visible ; la met en
// pause (et libère la source) quand elle quitte l'écran → rien n'est
// téléchargé tant qu'on n'a pas fait défiler jusqu'à la vidéo.
function observeGalleryVideos(track) {
    const videos = track.querySelectorAll('video[data-src]');
    if (!videos.length) return;

    if (!('IntersectionObserver' in window)) {
        videos.forEach(v => { v.src = v.dataset.src; v.play().catch(() => {}); });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                if (!video.src) video.src = video.dataset.src;
                video.play().catch(() => {});
            } else {
                video.pause();
            }
        });
    }, { root: track, threshold: 0.4 });

    videos.forEach(v => observer.observe(v));
}

function initCarouselControls(track) {
    const prev = document.getElementById('carouselPrev');
    const next = document.getElementById('carouselNext');
    const step = () => {
        const first = track.querySelector('.carousel-item');
        const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
        return first ? first.getBoundingClientRect().width + gap : track.clientWidth * 0.8;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));

    // Drag-to-slide (pointer)
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', e => {
        isDown = true; moved = false;
        startX = e.clientX;
        startScroll = track.scrollLeft;
    });
    track.addEventListener('pointermove', e => {
        if (!isDown) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 6) { moved = true; track.classList.add('dragging'); }
        track.scrollLeft = startScroll - dx;
    });
    const endDrag = () => { isDown = false; track.classList.remove('dragging'); };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointerleave', endDrag);
    track.addEventListener('pointercancel', endDrag);
    // Prevent click-through opening the modal right after a drag
    track.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
}

// --- Modal -----------------------------------------------------------------

const modal = document.getElementById('mediaModal');
const modalContent = document.getElementById('mediaModalContent');

function openModal(index) {
    const media = galleryMedia[index];
    if (!media) return;
    modalContent.innerHTML = '';

    if (media.type === 'image') {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.alt;
        modalContent.appendChild(img);
    } else {
        const video = document.createElement('video');
        video.src = media.src;
        video.controls = true;
        video.autoplay = true;
        video.playsInline = true;
        modalContent.appendChild(video);
    }
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const video = modalContent.querySelector('video');
    if (video) { video.pause(); video.currentTime = 0; }
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalContent.innerHTML = '';
    document.body.style.overflow = '';
}

document.getElementById('mediaModalClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

// --- Section 4: Musicians --------------------------------------------------

function loadMusicians() {
    const m = config.members;
    document.getElementById('musiciansEyebrow').textContent = m.eyebrow;
    document.getElementById('musiciansTitle').textContent = m.title;

    const grid = document.getElementById('musiciansGrid');
    grid.innerHTML = '';
    (m.list || []).forEach(member => {
        const card = document.createElement('div');
        card.className = 'musician-card reveal';
        card.innerHTML = `
            <img src="${member.photo}" alt="${member.name}" class="musician-photo" loading="lazy">
            <h3 class="musician-name">${member.name}</h3>
            <p class="musician-instrument">${member.instrument}</p>
            <p class="musician-bio">${member.bio}</p>
        `;
        grid.appendChild(card);
    });
}

// --- Section 5: Contact ----------------------------------------------------

function loadContact() {
    const c = config.contact;
    document.getElementById('contactEyebrow').textContent = c.eyebrow;
    document.getElementById('contactTitle').textContent = c.title;
    document.getElementById('contactText').textContent = c.text || '';

    const emailEl = document.getElementById('contactEmail');
    const emailLink = document.getElementById('contactEmailLink');
    emailEl.textContent = c.email;
    emailLink.href = `mailto:${c.email}`;

    const phoneEl = document.getElementById('contactPhone');
    const phoneLink = document.getElementById('contactPhoneLink');
    phoneEl.textContent = c.phone;
    phoneLink.href = `tel:${c.phone.replace(/\s+/g, '')}`;

    buildSocials(document.getElementById('contactSocials'));

    // Form composes a mailto (static, no backend)
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('cfName').value.trim();
        const email = document.getElementById('cfEmail').value.trim();
        const message = document.getElementById('cfMessage').value.trim();
        const subject = encodeURIComponent(`Contact site — ${name}`);
        const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
        window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
    });
}

// --- Navigation ------------------------------------------------------------

function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const links = document.getElementById('navLinks');

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    burger.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        nav.classList.toggle('menu-open', open);
        burger.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            links.classList.remove('open');
            nav.classList.remove('menu-open');
            burger.setAttribute('aria-expanded', 'false');
        });
    });
}

// --- Reveal on scroll ------------------------------------------------------

function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
    els.forEach(el => observer.observe(el));
}

// --- Utils -----------------------------------------------------------------

function shuffleArray(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

document.addEventListener('DOMContentLoaded', loadConfig);
