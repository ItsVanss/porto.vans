// ── ELEMENTS ──
    const body      = document.body;
    const navbar    = document.getElementById('navbar');
    const diMenu    = document.getElementById('di-menu');
    const diNotif   = document.getElementById('di-notif');
    const notifBody = document.getElementById('notif-body');
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('nav-menu');
    const projectGrid = document.getElementById('projectGrid');

    // ── SCROLL ──
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 60));

    // ── NAV ITEMS FADE ──
    function hideNavItems() {
        [navMenu, hamburger].forEach(el => {
            el.style.transition = 'opacity 0.22s ease';
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        });
    }
    function showNavItems() {
        [navMenu, hamburger].forEach(el => {
            el.style.transition = 'opacity 0.35s ease';
            el.style.opacity = '1';
            el.style.pointerEvents = '';
        });
    }

    // ── CLOSE ALL ──
    function closeAll() {
        hamburger.classList.remove('active');
        diMenu.classList.remove('open');
        diNotif.classList.remove('open');
        navbar.classList.remove('menu-open');
        showNavItems();
        stopProgress();
        pendingUrl = null;
    }

    // ── HAMBURGER ──
    function toggleMenu() {
        const isOpen = diMenu.classList.contains('open');
        closeAll();
        if (!isOpen) {
            hamburger.classList.add('active');
            diMenu.classList.add('open');
            navbar.classList.add('menu-open');
        }
    }

    document.querySelectorAll('.di-menu a').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                closeAll();
                setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }), 300);
            }
        });
    });

    document.addEventListener('click', e => { if (!navbar.contains(e.target)) closeAll(); });

    // ── PROGRESS RING ──
    let progressRAF = null;
    let progressStart = null;
    let progressDuration = 4000;

    function startProgress(duration, colorClass) {
        stopProgress();
        progressDuration = duration;
        const ring = document.querySelector('.progress-ring');
        if (!ring) return;
        ring.className = 'progress-ring ' + colorClass;
        const circumference = 82;
        ring.style.strokeDashoffset = circumference;

        progressStart = performance.now();
        function tick(now) {
            const elapsed = now - progressStart;
            const progress = Math.min(elapsed / progressDuration, 1);
            ring.style.strokeDashoffset = circumference * (1 - progress);
            if (progress < 1) progressRAF = requestAnimationFrame(tick);
        }
        progressRAF = requestAnimationFrame(tick);
    }

    function stopProgress() {
        if (progressRAF) { cancelAnimationFrame(progressRAF); progressRAF = null; }
        if (autoTimer)   { clearTimeout(autoTimer); autoTimer = null; }
    }

    // ── OPEN NOTIF ──
    let pendingUrl = null;
    let autoTimer  = null;

    function openNotifPanel(html, autoMs, colorClass) {
        // Snap close if already open (swap)
        if (diNotif.classList.contains('open')) {
            diNotif.classList.remove('open');
            navbar.classList.remove('menu-open');
            stopProgress();
            // tiny delay so CSS transition resets cleanly
            setTimeout(() => _doOpen(html, autoMs, colorClass), 120);
        } else {
            // close nav menu
            hamburger.classList.remove('active');
            diMenu.classList.remove('open');
            _doOpen(html, autoMs, colorClass);
        }
    }

    function _doOpen(html, autoMs, colorClass) {
        notifBody.innerHTML = html;
        hideNavItems();
        requestAnimationFrame(() => {
            diNotif.classList.add('open');
            navbar.classList.add('menu-open');
        });
        if (autoMs) {
            startProgress(autoMs, colorClass || 'info');
            autoTimer = setTimeout(dismissNotif, autoMs);
        }
    }

    function dismissNotif() {
        diNotif.classList.remove('open');
        navbar.classList.remove('menu-open');
        showNavItems();
        stopProgress();
        pendingUrl = null;
    }

    // ── DISMISS WRAP HTML ──
    function dismissWrap(colorClass) {
        return `
        <div class="notif-dismiss-wrap" onclick="dismissNotif()">
            <svg viewBox="0 0 30 30">
                <circle class="progress-track" cx="15" cy="15" r="13"/>
                <circle class="progress-ring ${colorClass}" cx="15" cy="15" r="13"/>
            </svg>
            <div class="notif-x-btn"><i class="fa-solid fa-xmark"></i></div>
        </div>`;
    }

    // ── SOCIAL CONFIRM ──
    const socialMeta = {
        github:    { label: 'GitHub',    icon: 'fa-brands fa-github',    color: '#e2e8f0', bg: 'rgba(226,232,240,0.15)' },
        linkedin:  { label: 'LinkedIn',  icon: 'fa-brands fa-linkedin',  color: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
        instagram: { label: 'Instagram', icon: 'fa-brands fa-instagram', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
        email:     { label: 'Email',     icon: 'fa-solid fa-envelope',   color: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
    };

    function confirmVisit(e, type, url) {
        e.preventDefault(); e.stopPropagation();
        pendingUrl = url;
        const m = socialMeta[type];
        openNotifPanel(`
            <div class="notif-row">
                <div class="notif-icon type-social" style="background:${m.bg};color:${m.color}">
                    <i class="${m.icon}"></i>
                </div>
                <div class="notif-text">
                    <div class="notif-title">Buka ${m.label}?</div>
                    <div class="notif-desc">Anda akan mengunjungi ${m.label} milik&nbsp;<span class="hlt">Cavan</span></div>
                    <div class="notif-actions">
                        <button class="notif-btn confirm" onclick="doVisit()">
                            <i class="${m.icon}" style="margin-right:5px"></i>Ya, Kunjungi
                        </button>
                        <button class="notif-btn cancel" onclick="dismissNotif()">Batal</button>
                    </div>
                </div>
                ${dismissWrap('social')}
            </div>
        `, null, 'social');
    }

    function doVisit() {
        if (pendingUrl) {
            if (pendingUrl.startsWith('mailto:')) window.location.href = pendingUrl;
            else window.open(pendingUrl, '_blank');
        }
        dismissNotif();
    }

    // ── DEMO NOTIFS ──
    const notifConfig = {
        info:    { icon: 'fa-solid fa-circle-info',            cls: 'type-info',    color: 'info',    title: 'Informasi',        desc: 'Website ini masih dalam pengembangan aktif. Fitur baru segera hadir!', auto: 4000 },
        success: { icon: 'fa-solid fa-circle-check',           cls: 'type-success', color: 'success', title: 'Berhasil!',         desc: 'Project baru telah berhasil dipublikasikan ke portofolio.',             auto: 4000 },
        warning: { icon: 'fa-solid fa-triangle-exclamation',   cls: 'type-warning', color: 'warning', title: 'Perhatian',         desc: 'Beberapa project sedang dalam tahap finalisasi. Mohon bersabar.',       auto: 4000 },
        danger:  { icon: 'fa-solid fa-circle-xmark',           cls: 'type-danger',  color: 'danger',  title: 'Koneksi Terputus',  desc: 'Gagal memuat data. Periksa koneksi internet Anda.',                    auto: null },
    };

    function showNotif(type) {
        const c = notifConfig[type];
        openNotifPanel(`
            <div class="notif-row">
                <div class="notif-icon ${c.cls}"><i class="${c.icon}"></i></div>
                <div class="notif-text">
                    <div class="notif-title">${c.title}</div>
                    <div class="notif-desc">${c.desc}</div>
                    ${!c.auto ? `
                    <div class="notif-actions">
                        <button class="notif-btn confirm" onclick="dismissNotif()">Coba Lagi</button>
                        <button class="notif-btn cancel"  onclick="dismissNotif()">Tutup</button>
                    </div>` : ''}
                </div>
                ${dismissWrap(c.color)}
            </div>
        `, c.auto, c.color);
    }

    // Stop demo btn propagation
    document.querySelectorAll('.demo-btn').forEach(btn => btn.addEventListener('click', e => e.stopPropagation()));

    // ── PROJECT CARD MODAL (FIXED, BUG-FREE & RESPONSIVE) ──
    const cardModal    = document.getElementById('cardModal');
    const cardBackdrop = document.getElementById('cardBackdrop');
    const modalBody    = document.getElementById('modalBody');
    let sourceCard     = null;
    let closeTimeout   = null;
    const MODAL_MARGIN = 20; // px gap from edges

    const projectData = [
        {
            icon: '<i class="fa-solid fa-rocket icon-blue"></i>',
            title: 'Project 1',
            subtitle: 'Aplikasi web modern dengan desain glassmorphism dan interaksi yang smooth dan intuitif.',
            desc: 'Aplikasi web dengan UI glassmorphism penuh, animasi micro-interaction, dan sistem desain yang konsisten untuk pengalaman pengguna terbaik di semua perangkat.',
            tags: [
                { label: 'React', cls: 'blue' }, { label: 'TypeScript', cls: 'blue' },
                { label: 'Framer Motion', cls: 'purple' }, { label: 'Tailwind CSS', cls: '' }
            ]
        },
        {
            icon: '<i class="fa-solid fa-code icon-purple"></i>',
            title: 'Project 2',
            subtitle: 'Dashboard analitik real-time dengan visualisasi data interaktif dan elegan.',
            desc: 'Dashboard data real-time yang menampilkan visualisasi interaktif dengan grafik animasi dan layout yang responsif di semua perangkat.',
            tags: [
                { label: 'Next.js', cls: 'purple' }, { label: 'Chart.js', cls: 'blue' },
                { label: 'Node.js', cls: '' }, { label: 'PostgreSQL', cls: 'purple' }
            ]
        },
        {
            icon: '<i class="fa-solid fa-paintbrush icon-pink"></i>',
            title: 'Project 3',
            subtitle: 'Design system lengkap dengan komponen reusable dan dokumentasi interaktif.',
            desc: 'Design system komprehensif dengan 50+ komponen UI, panduan gaya, token desain, dan dokumentasi interaktif untuk tim pengembang.',
            tags: [
                { label: 'Figma', cls: 'pink' }, { label: 'Storybook', cls: 'blue' },
                { label: 'CSS Variables', cls: 'pink' }, { label: 'Web Components', cls: '' }
            ]
        }
    ];

    function openCardModal(card, idx) {
        // Abaikan klik jika modal sudah terbuka
        if (body.classList.contains('card-modal-open')) return;

        // Bersihkan sisa animasi tutup jika ada (Anti-bug spam klik)
        if (closeTimeout) {
            clearTimeout(closeTimeout);
            closeTimeout = null;
        }

        sourceCard = card;
        const data = projectData[idx];

        // 1. Measure source card
        const rect = card.getBoundingClientRect();

        // 2. Position modal exactly over the source card (start state)
        cardModal.style.transition = 'none';
        cardModal.style.top    = rect.top  + 'px';
        cardModal.style.left   = rect.left + 'px';
        cardModal.style.width  = rect.width  + 'px';
        cardModal.style.height = rect.height + 'px';
        cardModal.style.borderRadius = '28px';
        cardModal.style.opacity = '0';

        // 3. Build modal content
        const tagsHtml = data.tags.map(t => `<span class="modal-tag ${t.cls}">${t.label}</span>`).join('');

        modalBody.innerHTML = `
            <div class="modal-icon-wrap">${data.icon}</div>
            <div class="modal-status">Dalam Pengerjaan</div>
            <h2>${data.title}</h2>
            <p class="modal-subtitle">${data.subtitle}</p>
            <div class="modal-section">
                <div class="modal-section-label">Tentang Project</div>
                <p>${data.desc}</p>
            </div>
            <div class="modal-section">
                <div class="modal-section-label">Tech Stack</div>
                <div class="modal-tags">${tagsHtml}</div>
            </div>
            <div class="modal-section">
                <div class="modal-section-label">Status</div>
                <p>Project ini sedang aktif dalam tahap pengembangan. Estimasi rilis dalam waktu dekat.</p>
            </div>
        `;

        // 4. Show modal
        cardModal.style.display = '';
        card.classList.add('is-source');
        body.classList.add('card-modal-open');
        cardBackdrop.classList.add('open');

        // 5. Force reflow so transitions fire
        cardModal.offsetHeight;

        // 6. Nyalakan transisi membal bawaan CSS
        cardModal.style.transition = '';

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const modalW = Math.min(vw - MODAL_MARGIN * 2, 680);
        const modalH = Math.min(vh - MODAL_MARGIN * 2, 680);
        const modalL = (vw - modalW) / 2;
        const modalT = (vh - modalH) / 2;

        requestAnimationFrame(() => {
            cardModal.style.top    = modalT + 'px';
            cardModal.style.left   = modalL + 'px';
            cardModal.style.width  = modalW + 'px';
            cardModal.style.height = modalH + 'px';
            cardModal.style.borderRadius = '32px';
            cardModal.style.opacity = '1';
            cardModal.classList.add('open');
        });
    }

    function closeCardModal() {
        if (!body.classList.contains('card-modal-open')) return;

        // 1. Munculkan kartu asli instan
        if (sourceCard) {
            sourceCard.classList.remove('is-source');
        }

        // 2. Hilangkan background blur dan navbar hide instan
        body.classList.remove('card-modal-open');
        cardBackdrop.classList.remove('open');

        // 3. Paksa animasi memudar dengan cepat
        const rect = sourceCard.getBoundingClientRect();
        cardModal.style.transition = 'all 0.3s ease-out';
        
        cardModal.classList.remove('open');
        cardModal.style.top    = rect.top  + 'px';
        cardModal.style.left   = rect.left + 'px';
        cardModal.style.width  = rect.width  + 'px';
        cardModal.style.height = rect.height + 'px';
        cardModal.style.borderRadius = '28px';
        cardModal.style.opacity = '0';

        // 4. Cleanup setelah animasi 0.3s
        closeTimeout = setTimeout(() => {
            sourceCard = null;
            cardModal.scrollTop = 0;
            cardModal.style.transition = ''; 
            closeTimeout = null;
        }, 300);
    }

    // ── RESIZE LISTENER (SUPER RESPONSIVE) ──
    function updateModalPosition() {
        if (!body.classList.contains('card-modal-open')) return;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        
        const modalW = Math.min(vw - MODAL_MARGIN * 2, 680);
        const modalH = Math.min(vh - MODAL_MARGIN * 2, 680);
        const modalL = (vw - modalW) / 2;
        const modalT = (vh - modalH) / 2;

        cardModal.style.transition = 'none';
        cardModal.style.top    = modalT + 'px';
        cardModal.style.left   = modalL + 'px';
        cardModal.style.width  = modalW + 'px';
        cardModal.style.height = modalH + 'px';
        
        setTimeout(() => {
            if (body.classList.contains('card-modal-open')) {
                cardModal.style.transition = 'all 0.3s ease-out';
            }
        }, 10);
    }

    window.addEventListener('resize', updateModalPosition);

    // ESC key to close
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCardModal(); });

    // ── STAGGER CARDS ──
    const cards = document.querySelectorAll('.project-card');
    const observer = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => { entry.target.style.opacity='1'; entry.target.style.transform='translateY(0)'; }, i * 140);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(45px)';
        observer.observe(card);
    });

    // ── CURSOR GLOW ──
    const glow = document.getElementById('cursorGlow');
    document.addEventListener('mousemove', e => { glow.style.left = e.clientX+'px'; glow.style.top = e.clientY+'px'; });
