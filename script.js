        const navbar    = document.getElementById('navbar');
        const diMenu    = document.getElementById('di-menu');
        const diNotif   = document.getElementById('di-notif');
        const notifBody = document.getElementById('notif-body');
        const hamburger = document.getElementById('hamburger');
        const navMenu   = document.getElementById('nav-menu');

        // ── NAVBAR SCROLL ──
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        });

        // ── HIDE / SHOW nav items when notif is active ──
        function hideNavItems() {
            navMenu.style.transition   = 'opacity 0.2s ease';
            hamburger.style.transition = 'opacity 0.2s ease';
            navMenu.style.opacity      = '0';
            hamburger.style.opacity    = '0';
            navMenu.style.pointerEvents    = 'none';
            hamburger.style.pointerEvents  = 'none';
        }
        function showNavItems() {
            navMenu.style.transition   = 'opacity 0.3s ease';
            hamburger.style.transition = 'opacity 0.3s ease';
            navMenu.style.opacity      = '1';
            hamburger.style.opacity    = '1';
            navMenu.style.pointerEvents    = '';
            hamburger.style.pointerEvents  = '';
        }

        // ── CLOSE ALL PANELS ──
        function closeAll() {
            hamburger.classList.remove('active');
            diMenu.classList.remove('open');
            diNotif.classList.remove('open');
            navbar.classList.remove('menu-open');
            showNavItems();
            if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
            pendingUrl = null;
        }

        // ── NAV MENU TOGGLE (mobile hamburger) ──
        function toggleMenu() {
            const menuOpen = diMenu.classList.contains('open');
            closeAll();
            if (!menuOpen) {
                hamburger.classList.add('active');
                diMenu.classList.add('open');
                navbar.classList.add('menu-open');
            }
        }

        // smooth scroll for di-menu links
        document.querySelectorAll('.di-menu a').forEach(link => {
            link.addEventListener('click', e => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    closeAll();
                    setTimeout(() => {
                        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                    }, 300);
                }
            });
        });

        // close on outside click
        document.addEventListener('click', e => {
            if (!navbar.contains(e.target)) closeAll();
        });

        // ── OPEN NOTIF PANEL ──
        let pendingUrl = null;
        let autoTimer  = null;

        function openNotifPanel(html) {
            // close nav menu first, but don't call closeAll (would kill notif immediately)
            hamburger.classList.remove('active');
            diMenu.classList.remove('open');
            diNotif.classList.remove('open');
            navbar.classList.remove('menu-open');

            // small delay so notif opens fresh
            requestAnimationFrame(() => {
                notifBody.innerHTML = html;
                hideNavItems();
                diNotif.classList.add('open');
                navbar.classList.add('menu-open');
            });
        }

        function dismissNotif() {
            diNotif.classList.remove('open');
            navbar.classList.remove('menu-open');
            showNavItems();
            pendingUrl = null;
            if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
        }

        // ── SOCIAL CONFIRM ──
        const socialMeta = {
            github:    { label: 'GitHub',    icon: 'fa-brands fa-github',    color: '#e2e8f0', bg: 'rgba(226,232,240,0.15)' },
            linkedin:  { label: 'LinkedIn',  icon: 'fa-brands fa-linkedin',  color: '#60a5fa', bg: 'rgba(96,165,250,0.15)'  },
            instagram: { label: 'Instagram', icon: 'fa-brands fa-instagram', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
            email:     { label: 'Email',     icon: 'fa-solid fa-envelope',   color: '#34d399', bg: 'rgba(52,211,153,0.15)'  },
        };

        function confirmVisit(e, type, iconCls, color, url) {
            e.preventDefault();
            e.stopPropagation();
            pendingUrl = url;
            const m = socialMeta[type];
            openNotifPanel(`
                <div class="notif-row">
                    <div class="notif-icon type-social" style="background:${m.bg};color:${m.color}">
                        <i class="${m.icon}"></i>
                    </div>
                    <div class="notif-text">
                        <div class="notif-title">Buka ${m.label}?</div>
                        <div class="notif-desc">
                            Anda akan mengunjungi ${m.label} milik&nbsp;<span class="hlt">Cavan</span>
                        </div>
                        <div class="notif-actions">
                            <button class="notif-btn confirm" onclick="doVisit()">
                                <i class="${m.icon}" style="margin-right:5px"></i>Ya, Kunjungi
                            </button>
                            <button class="notif-btn cancel" onclick="dismissNotif()">Batal</button>
                        </div>
                    </div>
                    <div class="notif-dismiss" onclick="dismissNotif()"><i class="fa-solid fa-xmark"></i></div>
                </div>
            `);
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
            info: {
                icon: 'fa-solid fa-circle-info',           type: 'type-info',
                title: 'Informasi',
                desc: 'Website ini masih dalam pengembangan aktif. Fitur baru segera hadir!',
                btn: null, auto: true
            },
            success: {
                icon: 'fa-solid fa-circle-check',          type: 'type-success',
                title: 'Berhasil!',
                desc: 'Project baru telah berhasil dipublikasikan ke portofolio.',
                btn: null, auto: true
            },
            warning: {
                icon: 'fa-solid fa-triangle-exclamation',  type: 'type-warning',
                title: 'Perhatian',
                desc: 'Beberapa project sedang dalam tahap finalisasi. Mohon bersabar.',
                btn: null, auto: true
            },
            danger: {
                icon: 'fa-solid fa-circle-xmark',          type: 'type-danger',
                title: 'Koneksi Terputus',
                desc: 'Gagal memuat data. Periksa koneksi internet Anda.',
                btn: { label: 'Coba Lagi', action: 'dismissNotif()' }, auto: false
            }
        };

        function showNotif(type) {
            const c = notifConfig[type];
            openNotifPanel(`
                <div class="notif-row">
                    <div class="notif-icon ${c.type}"><i class="${c.icon}"></i></div>
                    <div class="notif-text">
                        <div class="notif-title">${c.title}</div>
                        <div class="notif-desc">${c.desc}</div>
                        ${c.btn ? `
                        <div class="notif-actions">
                            <button class="notif-btn confirm" onclick="${c.btn.action}">${c.btn.label}</button>
                            <button class="notif-btn cancel"  onclick="dismissNotif()">Tutup</button>
                        </div>` : ''}
                    </div>
                    <div class="notif-dismiss" onclick="dismissNotif()"><i class="fa-solid fa-xmark"></i></div>
                </div>
            `);
            if (c.auto) autoTimer = setTimeout(dismissNotif, 4000);
        }

        // Prevent demo buttons from bubbling to document closeAll
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', e => e.stopPropagation());
        });

        // ── CURSOR GLOW ──
        const glow = document.getElementById('cursorGlow');
        document.addEventListener('mousemove', e => {
            glow.style.left = e.clientX + 'px';
            glow.style.top  = e.clientY + 'px';
        });

        // ── STAGGER PROJECT CARDS ──
        const cards = document.querySelectorAll('.project-card');
        const observer = new IntersectionObserver(entries => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, i * 120);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';
            card.style.transition = 'opacity 0.7s cubic-bezier(0.34,1.56,0.64,1), transform 0.7s cubic-bezier(0.34,1.56,0.64,1), background 0.5s, border-color 0.5s, box-shadow 0.5s';
            observer.observe(card);
        });
