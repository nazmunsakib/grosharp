(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ─── Helpers ──────────────────────────────────────────────────────── */

	function gs() { return window.gsap; }
	function st() { return window.ScrollTrigger; }

	/* ─── Lenis smooth scroll ──────────────────────────────────────────── */
	function initSmoothScroll() {
		if (prefersReducedMotion || !window.Lenis) return;

		var lenis = new window.Lenis({
			duration:   1.25,
			easing:     function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
			smoothWheel: true,
			smoothTouch: false,
		});

		/* Keep ScrollTrigger in sync */
		if (st()) {
			lenis.on('scroll', st().update);
			gs().ticker.add(function (time) { lenis.raf(time * 1000); });
			gs().ticker.lagSmoothing(0);
		} else {
			function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
			requestAnimationFrame(raf);
		}

		/* Anchor links: let Lenis handle them smoothly */
		document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
			anchor.addEventListener('click', function (e) {
				var id  = anchor.getAttribute('href');
				var target = id && id.length > 1 && document.querySelector(id);
				if (!target) return;
				e.preventDefault();
				lenis.scrollTo(target, { offset: -80, duration: 1.4 });
			});
		});

		window.__lenis = lenis;
	}

	/** Reveal a section's eyebrow → heading → subtext into a running timeline. */
	function addHeaderReveal(tl, container, offset) {
		offset = offset || 0;
		var eyebrow = container.querySelector('[data-gs-eyebrow]');
		var heading = container.querySelector('h2');
		var sub     = heading && heading.nextElementSibling;

		if (eyebrow) tl.from(eyebrow, { y: 18, opacity: 0, duration: 0.65, ease: 'power3.out' }, offset);
		if (heading) tl.from(heading, { y: 44, opacity: 0, duration: 1.05, ease: 'power4.out' }, offset + 0.1);
		if (sub && sub.matches('p')) {
			tl.from(sub, { y: 24, opacity: 0, duration: 0.75, ease: 'power3.out' }, offset + 0.28);
		}
	}

	function makeSectionTl(trigger, startAt) {
		return gs().timeline({
			scrollTrigger: { trigger: trigger, start: startAt || 'top 78%', once: true },
		});
	}

	/* ─── Hero entrance ────────────────────────────────────────────────── */
	function initHeroEntrance() {
		if (prefersReducedMotion || !gs()) return;
		var hero = document.querySelector('.grosharp-hero');
		if (!hero) return;

		/* Immediately make all gs-reveal elements inside hero visible
		   so initRevealAnimations() doesn't re-animate them */
		hero.querySelectorAll('.gs-reveal').forEach(function (el) {
			el.style.opacity  = '1';
			el.style.transform = 'none';
		});

		var tl      = gs().timeline({ delay: 0.1 });
		var eyebrow = hero.querySelector('[data-gs-eyebrow]');
		var h1      = hero.querySelector('h1');
		var body    = h1 && h1.nextElementSibling;
		var ctas    = hero.querySelectorAll('[data-gs-hero-cta], .gs-btn');
		var visual  = hero.querySelector('[data-gs-hero-visual]');

		if (eyebrow) tl.from(eyebrow, { y: 20, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0);
		if (h1)      tl.from(h1,      { y: 52, opacity: 0, duration: 1.15, ease: 'power4.out' }, 0.1);
		if (body && body.matches('p')) {
			tl.from(body, { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.32);
		}
		if (ctas.length) tl.from(ctas, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, 0.48);

		/* Visual: no animation — static display only */
	}

	/* ─── Hero visual: entrance only, no continuous motion ─────────────── */
	function initHeroVisual() {
		/* Intentionally empty — float and parallax removed to prevent shaking.
		   The hero visual animates in via initHeroEntrance() only. */
	}

	/* ─── Logo marquee ─────────────────────────────────────────────────── */
	function initLogoMarquees() {
		if (prefersReducedMotion || !gs()) return;

		document.querySelectorAll('[data-gs-logo-marquee]').forEach(function (marquee) {
			var track = marquee.querySelector('[data-gs-logo-track]');
			if (!track) return;
			var distance = track.scrollWidth / 2;
			var speed    = parseFloat(marquee.getAttribute('data-speed')) || 42;
			if (!distance) return;

			gs().set(track, { x: 0 });
			gs().to(track, {
				x: -distance,
				duration: Math.max(distance / speed, 12),
				ease: 'none',
				repeat: -1,
				modifiers: {
					x: function (v) { return (parseFloat(v) % distance) + 'px'; },
				},
			});
		});
	}

	/* ─── Services: header entrance ──────────────────────────────────── */
	function initServicesAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-services');
		if (!section) return;

		var tl = makeSectionTl(section, 'top 80%');
		addHeaderReveal(tl, section, 0);
	}

	/* ─── Services: horizontal auto-scroll marquee ────────────────────── */
	function initServicesScroll() {
		var marquee = document.querySelector('[data-gs-services-marquee]');
		if (!marquee || !gs() || prefersReducedMotion) return;

		var track     = marquee.querySelector('[data-gs-services-track]');
		var cardCount = parseInt(marquee.getAttribute('data-card-count') || '0', 10);

		if (!track || !track.children.length) return;

		/* Need at least 4 unique cards before activating the scroll marquee.
		   With fewer cards the same item fills the screen visibly. */
		if (cardCount < 4) return;

		var origCards      = Array.prototype.slice.call(track.children);
		var singleSetWidth = track.scrollWidth;
		if (singleSetWidth <= 0) return;

		/* Clone until we have at least 3× viewport width so the loop never gaps */
		var needed = Math.ceil((window.innerWidth * 3) / singleSetWidth);
		needed = Math.max(needed, 2);

		for (var s = 1; s < needed; s++) {
			origCards.forEach(function (card) {
				var clone = card.cloneNode(true);
				clone.setAttribute('aria-hidden', 'true');
				clone.querySelectorAll('a, button').forEach(function (el) {
					el.setAttribute('tabindex', '-1');
				});
				track.appendChild(clone);
			});
		}

		var tween = gs().to(track, {
			x: -singleSetWidth,
			duration: singleSetWidth / 52,
			ease: 'none',
			repeat: -1,
			modifiers: {
				x: function (v) { return (parseFloat(v) % singleSetWidth) + 'px'; },
			},
		});

		marquee.addEventListener('mouseenter', function () { tween.pause(); });
		marquee.addEventListener('mouseleave', function () { tween.play(); });
		marquee.addEventListener('focusin',    function () { tween.pause(); });
		marquee.addEventListener('focusout',   function () { tween.play(); });
	}

	/* ─── Process steps ────────────────────────────────────────────────── */
	function initProcessAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-process');
		if (!section) return;

		var tl     = makeSectionTl(section, 'top 80%');
		var header = section.querySelector('[data-gs-step-header]');
		var steps  = section.querySelectorAll('[data-gs-step]');

		if (header) {
			var eyebrow = header.querySelector('[data-gs-eyebrow]');
			var h2      = header.querySelector('h2');
			var sub     = header.querySelector('p');
			if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0);
			if (h2)      tl.fromTo(h2,      { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' }, 0.1);
			if (sub)     tl.fromTo(sub,      { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.24);
		}

		if (steps.length) {
			tl.fromTo(steps,
				{ y: 40, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.12 },
				0.3
			);
		}
	}

	/* ─── Stats ─────────────────────────────────────────────────────────── */
	function initStatsAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-stats');
		if (!section) return;

		var tl    = makeSectionTl(section, 'top 80%');
		var cells = section.querySelectorAll('[data-gs-stat]');

		if (cells.length) {
			tl.from(cells, {
				y: 32, opacity: 0, duration: 0.85,
				ease: 'power3.out', stagger: { amount: 0.35 },
			}, 0);
		}

		/* Count-up for numeric stat values */
		var numbers = section.querySelectorAll('[data-stat-number]');
		numbers.forEach(function (el) {
			var endVal  = parseFloat(el.getAttribute('data-stat-number')) || 0;
			var prefix  = el.getAttribute('data-stat-prefix') || '';
			var suffix  = el.getAttribute('data-stat-suffix') || '';
			var dec     = String(endVal).includes('.') ? 1 : 0;
			var proxy   = { val: 0 };

			tl.to(proxy, {
				val: endVal, duration: 1.6, ease: 'power2.out',
				onUpdate: function () {
					el.textContent = prefix + proxy.val.toFixed(dec) + suffix;
				},
			}, 0.15);
		});
	}

	/* ─── Latest posts ──────────────────────────────────────────────────── */
	function initLatestPostsAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-latest-posts');
		if (!section) return;

		var tl    = makeSectionTl(section, 'top 78%');
		var cards = section.querySelectorAll('[data-gs-post-card]');

		addHeaderReveal(tl, section, 0);

		if (cards.length) {
			tl.fromTo(cards,
				{ y: 48, opacity: 0, scale: 0.97 },
				{ y: 0,  opacity: 1, scale: 1, duration: 0.88, ease: 'power3.out', stagger: { amount: 0.28 } },
				0.25
			);
		}
	}

	/* ─── Testimonials header entrance (Swiper init is inline in render.php) ── */
	function initTestimonialsAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-testimonials');
		if (!section) return;

		var tl = makeSectionTl(section);
		addHeaderReveal(tl, section, 0);
	}

	/* ─── CTA section ───────────────────────────────────────────────────── */
	function initCTAAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-cta');
		if (!section) return;

		var tl  = makeSectionTl(section);
		var h2  = section.querySelector('h2');
		var txt = h2 && h2.nextElementSibling;
		var btn = section.querySelector('a[href], button');

		if (h2)  tl.from(h2,  { y: 44, opacity: 0, duration: 1.05, ease: 'power4.out' }, 0);
		if (txt && txt.matches('p')) {
			tl.from(txt, { y: 24, opacity: 0, duration: 0.75, ease: 'power3.out' }, 0.22);
		}
		if (btn) tl.from(btn,  { y: 20, opacity: 0, scale: 0.94, duration: 0.65, ease: 'back.out(1.5)' }, 0.38);
	}

	/* ─── Featured projects ─────────────────────────────────────────────── */
	function initProjectCards() {
		if (!gs()) return;
		var section = document.querySelector('.grosharp-projects');
		if (!section) return;

		var cards   = section.querySelectorAll('[data-gs-project-card]');
		var eyebrow = section.querySelector('[data-gs-project-eyebrow]');
		var heading = section.querySelector('[data-gs-project-heading]');
		var cta     = section.querySelector('[data-gs-project-cta]');

		if (st() && !prefersReducedMotion) {
			var tl = makeSectionTl(section);
			if (eyebrow) tl.from(eyebrow, { y: 18, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0);
			if (heading) tl.from(heading, { y: 44, opacity: 0, duration: 1.05, ease: 'power4.out' }, 0.1);
			if (cta)     tl.from(cta,     { y: 18, opacity: 0, duration: 0.55, ease: 'power2.out' }, 0.28);
			if (cards.length) {
				tl.from(cards, {
					y: 64, opacity: 0, scale: 0.97,
					duration: 0.92, ease: 'power3.out', stagger: 0.13,
				}, 0.3);
			}
		} else if (prefersReducedMotion) {
			[eyebrow, heading, cta].forEach(function (el) {
				if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
			});
			cards.forEach(function (c) { c.style.opacity = '1'; c.style.transform = 'none'; });
		}

		/* Image scale on hover — overlay uses CSS group-hover transitions */
		if (!prefersReducedMotion) {
			cards.forEach(function (card) {
				var img = card.querySelector('[data-gs-project-img]');
				if (!img) return;
				card.addEventListener('mouseenter', function () {
					gs().to(img, { scale: 1.07, duration: 0.65, ease: 'power2.out' });
				});
				card.addEventListener('mouseleave', function () {
					gs().to(img, { scale: 1, duration: 0.65, ease: 'power2.inOut' });
				});
			});
		}
	}

	/* ─── Generic .gs-reveal fallback ──────────────────────────────────── */
	function initRevealAnimations() {
		/* Always make visible — critical because CSS sets opacity:0 on .gs-reveal */
		if (prefersReducedMotion || !gs()) {
			document.querySelectorAll('.gs-reveal').forEach(function (el) {
				el.style.opacity = '1';
				el.style.transform = 'none';
			});
			return;
		}

		gs().utils.toArray('.gs-reveal').forEach(function (el) {
			/* Hero handles its own reveals — skip to avoid double-animation */
			if (el.closest('.grosharp-hero')) return;

			gs().fromTo(
				el,
				{ opacity: 0, y: 28 },
				{
					opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
					scrollTrigger: st() ? { trigger: el, start: 'top 86%', once: true } : null,
				}
			);
		});
	}

	/* ─── Custom cursor ────────────────────────────────────────────────────
	   Only activates on pointer:fine devices (mouse).
	   Dot follows cursor instantly; ring follows with a slight GSAP lag.
	   Ring expands on hoverable elements, collapses on click.
	─────────────────────────────────────────────────────────────────────── */
	function initCustomCursor() {
		/* Skip touch / reduced-motion */
		if (prefersReducedMotion) return;
		if (!window.matchMedia('(pointer: fine)').matches) return;
		if (!gs()) return;

		/* Create cursor elements */
		var dot  = document.createElement('div');
		var ring = document.createElement('div');
		dot.id  = 'gs-cursor-dot';
		ring.id = 'gs-cursor-ring';
		document.body.appendChild(dot);
		document.body.appendChild(ring);
		document.body.classList.add('gs-cursor-ready');

		/* GSAP quickTo for fast dot and lagging ring */
		var dotX  = gs().quickTo(dot,  'x', { duration: 0.08, ease: 'none' });
		var dotY  = gs().quickTo(dot,  'y', { duration: 0.08, ease: 'none' });
		var ringX = gs().quickTo(ring, 'x', { duration: 0.38, ease: 'power3.out' });
		var ringY = gs().quickTo(ring, 'y', { duration: 0.38, ease: 'power3.out' });

		document.addEventListener('mousemove', function (e) {
			dotX(e.clientX);
			dotY(e.clientY);
			ringX(e.clientX);
			ringY(e.clientY);
		});

		/* Hover state — expand ring */
		var hoverSelectors = 'a, button, [role="button"], label, input, select, textarea, .gs-card, [data-gs-project-card], [data-cursor-hover]';
		document.querySelectorAll(hoverSelectors).forEach(addHoverListeners);

		/* Watch for dynamically added elements */
		var observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (m) {
				m.addedNodes.forEach(function (node) {
					if (node.nodeType !== 1) return;
					if (node.matches && node.matches(hoverSelectors)) addHoverListeners(node);
					node.querySelectorAll && node.querySelectorAll(hoverSelectors).forEach(addHoverListeners);
				});
			});
		});
		observer.observe(document.body, { childList: true, subtree: true });

		function addHoverListeners(el) {
			el.addEventListener('mouseenter', function () { document.body.classList.add('gs-cursor-hover'); });
			el.addEventListener('mouseleave', function () { document.body.classList.remove('gs-cursor-hover'); });
		}

		/* Click state */
		document.addEventListener('mousedown', function () { document.body.classList.add('gs-cursor-click'); });
		document.addEventListener('mouseup',   function () { document.body.classList.remove('gs-cursor-click'); });

		/* Hide cursor when leaving window */
		document.addEventListener('mouseleave', function () {
			gs().to([dot, ring], { opacity: 0, duration: 0.3 });
		});
		document.addEventListener('mouseenter', function () {
			gs().to([dot, ring], { opacity: 1, duration: 0.3 });
		});
	}

	/* ─── Magnetic buttons ─────────────────────────────────────────────────
	   On mouse proximity, pull the button toward the cursor.
	   On mouse leave, spring back to origin.
	   Applies to .gs-button-primary, .gs-button-secondary, and .wp-block-button__link.
	─────────────────────────────────────────────────────────────────────── */
	function initMagneticButtons() {
		if (prefersReducedMotion || !gs()) return;
		if (!window.matchMedia('(pointer: fine)').matches) return;

		var STRENGTH   = 0.42;  /* How strongly the button moves (0–1) */
		var RANGE      = 80;    /* px radius from button center that activates the effect */
		var RETURN_DUR = 0.65;  /* seconds to snap back */

		var selector = '.gs-button-primary, .gs-button-secondary, .wp-block-button__link';

		document.querySelectorAll(selector).forEach(function (btn) {
			btn.addEventListener('mousemove', function (e) {
				var rect    = btn.getBoundingClientRect();
				var centerX = rect.left + rect.width  / 2;
				var centerY = rect.top  + rect.height / 2;
				var distX   = e.clientX - centerX;
				var distY   = e.clientY - centerY;
				var dist    = Math.sqrt(distX * distX + distY * distY);

				if (dist < RANGE) {
					gs().to(btn, {
						x: distX * STRENGTH,
						y: distY * STRENGTH,
						duration: 0.3,
						ease: 'power3.out',
						overwrite: 'auto',
					});
				}
			});

			btn.addEventListener('mouseleave', function () {
				gs().to(btn, {
					x: 0,
					y: 0,
					duration: RETURN_DUR,
					ease: 'elastic.out(1, 0.45)',
					overwrite: 'auto',
				});
			});
		});
	}

	/* ─── Header: smooth sticky on scroll ────────────────────────────────
	   Starts absolute (transparent over hero).
	   After THRESHOLD px scrolled → becomes fixed and slides in smoothly.
	   Accounts for WP admin bar height when logged in.
	─────────────────────────────────────────────────────────────────────── */
	/* ─── Sticky header ───────────────────────────────────────────────────
	   Header is always position:fixed (CSS handles it).
	   JS only toggles .gs-header-sticky for the shadow state.
	   No position switching = no jump.
	─────────────────────────────────────────────────────────────────────── */
	function initHeaderScroll() {
		var header    = document.querySelector('header.wp-block-group');
		if (!header) return;

		var THRESHOLD = 60;
		var isSticky  = false;
		var ticking   = false;

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(function () {
				var past = window.scrollY > THRESHOLD;
				if (past !== isSticky) {
					isSticky = past;
					header.classList.toggle('gs-header-sticky', past);
				}
				ticking = false;
			});
		}

		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll(); /* run once on load */
	}

	/* ─── Mobile menu ─────────────────────────────────────────────────────
	   Pure CSS-transition approach — no GSAP dependency.
	   Panel slide and backdrop fade are handled by CSS; JS only toggles
	   the .gs-menu-active class on the overlay.
	─────────────────────────────────────────────────────────────────────── */
	function initMobileMenu() {
		var overlay  = document.getElementById('gs-mobile-menu');
		var btnOpen  = document.getElementById('gs-menu-open');
		var btnClose = document.getElementById('gs-menu-close');

		if (!overlay || !btnOpen) return;

		function openMenu() {
			overlay.classList.add('gs-menu-active');
			overlay.setAttribute('aria-hidden', 'false');
			btnOpen.setAttribute('aria-expanded', 'true');
			document.body.classList.add('gs-menu-open');
		}

		function closeMenu() {
			overlay.classList.remove('gs-menu-active');
			overlay.setAttribute('aria-hidden', 'true');
			btnOpen.setAttribute('aria-expanded', 'false');
			document.body.classList.remove('gs-menu-open');
		}

		btnOpen.addEventListener('click', openMenu);
		if (btnClose) btnClose.addEventListener('click', closeMenu);

		/* Close on Escape */
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && overlay.classList.contains('gs-menu-active')) closeMenu();
		});

		/* Close when a nav link inside the menu is clicked */
		overlay.querySelectorAll('a').forEach(function (a) {
			a.addEventListener('click', closeMenu);
		});
	}

	/* ─── Boot ──────────────────────────────────────────────────────────── */
	document.addEventListener('DOMContentLoaded', function () {
		if (gs() && st()) {
			gs().registerPlugin(st());
		}

		initHeaderScroll();
		initMobileMenu();
		initCustomCursor();
		initMagneticButtons();
		initSmoothScroll();
		initHeroEntrance();
		initHeroVisual();
		initLogoMarquees();
		initServicesAnimation();
		initServicesScroll();
		initProcessAnimation();
		initStatsAnimation();
		initLatestPostsAnimation();
		initTestimonialsAnimation();
		initCTAAnimation();
		initProjectCards();
		initRevealAnimations();
	});
})();
