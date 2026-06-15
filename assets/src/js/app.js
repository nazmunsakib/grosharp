(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ─── Helpers ──────────────────────────────────────────────────────────── */
	function gs()  { return window.gsap; }
	function st()  { return window.ScrollTrigger; }
	function ok()  { return !prefersReducedMotion && !!gs() && !!st(); }

	/*
	 * Standard ScrollTrigger config.
	 * play none play reset = plays on enter, stays visible scrolling past,
	 * replays when scrolled back into view, resets when fully above viewport.
	 */
	function stConfig(trigger, extra) {
		return Object.assign({
			trigger: trigger,
			start:   'top 88%',
			once:    true,
		}, extra || {});
	}

	/*
	 * splitLines — wraps each line in an overflow-hidden mask so words
	 * slide up from below without being visible outside the line box.
	 * Returns the inner word spans GSAP will animate.
	 * padding-bottom/margin-bottom prevent descender (g,y,p) clipping.
	 */
	function splitLines(el) {
		if (!el) return [];
		var text  = el.textContent.trim();
		var words = text.split(/\s+/).filter(Boolean);
		el.innerHTML = words.map(function (w) {
			return '<span style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.2em;margin-bottom:-0.2em">'
				+ '<span class="gs-line-inner" style="display:inline-block">' + w + '</span>'
				+ '</span>';
		}).join(' ');
		return Array.prototype.slice.call(el.querySelectorAll('.gs-line-inner'));
	}

	/* ─── Lenis smooth scroll ──────────────────────────────────────────────── */
	function initSmoothScroll() {
		if (prefersReducedMotion || !window.Lenis) return;

		var lenis = new window.Lenis({
			duration:    1.2,
			easing:      function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
			smoothWheel: true,
			smoothTouch: false,
		});

		if (st()) {
			lenis.on('scroll', st().update);
			gs().ticker.add(function (time) { lenis.raf(time * 1000); });
			gs().ticker.lagSmoothing(0);
		} else {
			(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
		}

		document.querySelectorAll('a[href^="#"]').forEach(function (a) {
			a.addEventListener('click', function (e) {
				var target = document.querySelector(a.getAttribute('href'));
				if (!target) return;
				e.preventDefault();
				lenis.scrollTo(target, { offset: -80, duration: 1.4 });
			});
		});

		window.__lenis = lenis;
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   HERO — one-time entrance, clean and restrained
	═══════════════════════════════════════════════════════════════════════ */
	function initHeroEntrance() {
		if (prefersReducedMotion || !gs()) return;

		var hero = document.querySelector('.grosharp-hero');
		if (!hero) return;

		/* Unlock any .gs-reveal elements inside hero */
		hero.querySelectorAll('.gs-reveal').forEach(function (el) {
			el.style.opacity   = '1';
			el.style.transform = 'none';
		});

		var eyebrow = hero.querySelector('[data-gs-eyebrow]');
		var h1      = hero.querySelector('h1');
		var body    = h1 && h1.nextElementSibling && h1.nextElementSibling.matches('p') ? h1.nextElementSibling : null;
		var ctas    = hero.querySelectorAll('[data-gs-hero-cta], .wp-block-buttons a');
		var badge   = hero.querySelector('[data-gs-hero-badge]');

		var tl = gs().timeline({ delay: 0.2 });

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 12 },
				{ opacity: 1, y: 0, duration: 0.75, ease: 'power2.out' },
				0
			);
		}

		/* H1: each word slides up from below its line mask */
		if (h1) {
			var spans = splitLines(h1);
			if (spans.length) {
				tl.fromTo(spans,
					{ yPercent: 100 },
					{ yPercent: 0, duration: 1.1, ease: 'power3.out', stagger: 0.04 },
					eyebrow ? 0.15 : 0
				);
			}
		}

		if (body) {
			tl.fromTo(body,
				{ opacity: 0, y: 16 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
				0.5
			);
		}

		if (ctas.length) {
			tl.fromTo(ctas,
				{ opacity: 0, y: 12 },
				{ opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 },
				0.65
			);
		}

		if (badge) {
			tl.fromTo(badge,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.6, ease: 'power2.out' },
				0.75
			);
		}
	}

	/* Subtle parallax as hero scrolls out of view */
	function initHeroParallax() {
		if (!ok()) return;
		var hero  = document.querySelector('.grosharp-hero');
		var inner = hero && (hero.querySelector('.gs-container') || hero.firstElementChild);
		if (!inner) return;

		gs().to(inner, {
			yPercent: -8,
			ease: 'none',
			scrollTrigger: {
				trigger: hero,
				start:   'top top',
				end:     'bottom top',
				scrub:   1.5,
			},
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   SECTION REVEAL — shared helper used by every section
	   Eyebrow fades in, heading slides up cleanly, subtext follows.
	═══════════════════════════════════════════════════════════════════════ */
	function revealHeader(section, offset) {
		offset = offset || 0;
		var tl      = gs().timeline({ scrollTrigger: stConfig(section, { start: 'top 84%' }) });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var sub     = h2 && h2.nextElementSibling && h2.nextElementSibling.matches('p') ? h2.nextElementSibling : null;

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 10 },
				{ opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
				offset
			);
		}

		if (h2) {
			/* Clean slide-up on the heading as a whole — no per-word split on sections */
			tl.fromTo(h2,
				{ opacity: 0, y: 28 },
				{ opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
				offset + (eyebrow ? 0.1 : 0)
			);
		}

		if (sub) {
			tl.fromTo(sub,
				{ opacity: 0, y: 16 },
				{ opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' },
				offset + 0.25
			);
		}

		return tl;
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   LOGO MARQUEE
	═══════════════════════════════════════════════════════════════════════ */
	function initLogoMarquees() {
		if (prefersReducedMotion || !gs()) return;

		document.querySelectorAll('[data-gs-logo-marquee]').forEach(function (marquee) {
			var track    = marquee.querySelector('[data-gs-logo-track]');
			if (!track) return;
			var distance = track.scrollWidth / 2;
			var speed    = parseFloat(marquee.getAttribute('data-speed')) || 42;
			if (!distance) return;

			gs().to(track, {
				x: -distance,
				duration: Math.max(distance / speed, 12),
				ease: 'none',
				repeat: -1,
				modifiers: { x: function (v) { return (parseFloat(v) % distance) + 'px'; } },
			});

			/* Strip wrapper fades in */
			if (st()) {
				var wrap = marquee.closest('.grosharp-logo-strip') || marquee.parentElement;
				gs().fromTo(wrap,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.8, ease: 'power2.out', scrollTrigger: stConfig(wrap) }
				);
			}
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   SERVICES
	═══════════════════════════════════════════════════════════════════════ */
	function initServicesAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-services');
		if (!section) return;

		/* Header */
		revealHeader(section);

		/* CTA link beside the header */
		var ctaLink = section.querySelector('.gs-container a');
		if (ctaLink) {
			gs().fromTo(ctaLink,
				{ opacity: 0 },
				{ opacity: 1, duration: 0.6, ease: 'power2.out',
				  scrollTrigger: stConfig(ctaLink) }
			);
		}

		/* Cards — simple staggered fade + small rise */
		var cards = section.querySelectorAll('[data-gs-service-card]');
		if (cards.length) {
			gs().fromTo(cards,
				{ opacity: 0, y: 32 },
				{
					opacity: 1, y: 0,
					duration: 0.8, ease: 'power2.out',
					stagger: { amount: 0.35 },
					scrollTrigger: stConfig(cards[0], { start: 'top 90%' }),
				}
			);

			/* Hover: icon lifts slightly */
			cards.forEach(function (card) {
				var icon   = card.querySelector('.gs-service-icon');
				var number = card.querySelector('.gs-service-number');

				card.addEventListener('mouseenter', function () {
					if (icon)   gs().to(icon,   { y: -6, duration: 0.35, ease: 'power2.out' });
					if (number) gs().to(number, { opacity: 0.4, duration: 0.35, ease: 'power2.out' });
				});
				card.addEventListener('mouseleave', function () {
					if (icon)   gs().to(icon,   { y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
					if (number) gs().to(number, { opacity: 1, duration: 0.35, ease: 'power2.out' });
				});
			});
		}
	}

	/* Services horizontal marquee */
	function initServicesScroll() {
		var marquee = document.querySelector('[data-gs-services-marquee]');
		if (!marquee || !gs() || prefersReducedMotion) return;

		var track     = marquee.querySelector('[data-gs-services-track]');
		var cardCount = parseInt(marquee.getAttribute('data-card-count') || '0', 10);
		if (!track || !track.children.length || cardCount < 4) return;

		var origCards      = Array.prototype.slice.call(track.children);
		var singleSetWidth = track.scrollWidth;
		if (singleSetWidth <= 0) return;

		var needed = Math.max(Math.ceil((window.innerWidth * 3) / singleSetWidth), 2);
		for (var s = 1; s < needed; s++) {
			origCards.forEach(function (card) {
				var clone = card.cloneNode(true);
				clone.setAttribute('aria-hidden', 'true');
				clone.querySelectorAll('a, button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
				track.appendChild(clone);
			});
		}

		var tween = gs().to(track, {
			x: -singleSetWidth,
			duration: singleSetWidth / 52,
			ease: 'none', repeat: -1,
			modifiers: { x: function (v) { return (parseFloat(v) % singleSetWidth) + 'px'; } },
		});

		marquee.addEventListener('mouseenter', function () { tween.pause(); });
		marquee.addEventListener('mouseleave', function () { tween.play(); });
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   PROCESS STEPS
	═══════════════════════════════════════════════════════════════════════ */
	function initProcessAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-process');
		if (!section) return;

		var header = section.querySelector('[data-gs-step-header]');
		if (header) revealHeader(header);

		var steps = section.querySelectorAll('[data-gs-step]');
		if (steps.length) {
			gs().fromTo(steps,
				{ opacity: 0, y: 28 },
				{
					opacity: 1, y: 0,
					duration: 0.75, ease: 'power2.out',
					stagger: { amount: 0.3 },
					scrollTrigger: stConfig(steps[0], { start: 'top 90%' }),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   STATS
	═══════════════════════════════════════════════════════════════════════ */
	function initStatsAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-stats');
		if (!section) return;

		revealHeader(section);

		var cells = section.querySelectorAll('[data-gs-stat]');
		if (cells.length) {
			gs().fromTo(cells,
				{ opacity: 0, y: 24 },
				{
					opacity: 1, y: 0,
					duration: 0.75, ease: 'power2.out',
					stagger: { amount: 0.25 },
					scrollTrigger: stConfig(cells[0], { start: 'top 88%' }),
				}
			);
		}

		/* Count-up numbers */
		section.querySelectorAll('[data-stat-number]').forEach(function (el) {
			var end    = parseFloat(el.getAttribute('data-stat-number')) || 0;
			var prefix = el.getAttribute('data-stat-prefix') || '';
			var suffix = el.getAttribute('data-stat-suffix') || '';
			var dec    = String(end).includes('.') ? 1 : 0;
			var proxy  = { val: 0 };

			gs().to(proxy, {
				val: end, duration: 1.8, ease: 'power2.out',
				onUpdate: function () { el.textContent = prefix + proxy.val.toFixed(dec) + suffix; },
				scrollTrigger: stConfig(el, { start: 'top 88%' }),
			});
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   FEATURED PROJECTS
	═══════════════════════════════════════════════════════════════════════ */
	function initProjectCards() {
		if (!gs()) return;
		var section = document.querySelector('.grosharp-projects');
		if (!section) return;

		if (ok()) {
			/* Header */
			var eyebrow = section.querySelector('[data-gs-project-eyebrow]');
			var heading = section.querySelector('[data-gs-project-heading]');
			var cta     = section.querySelector('[data-gs-project-cta]');

			var tl = gs().timeline({ scrollTrigger: stConfig(section, { start: 'top 82%' }) });

			if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0);
			if (heading) tl.fromTo(heading, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 0.1);
			if (cta)     tl.fromTo(cta,     { opacity: 0 },        { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.3);

			/* Cards */
			var cards = section.querySelectorAll('[data-gs-project-card]');
			if (cards.length) {
				gs().fromTo(cards,
					{ opacity: 0, y: 36 },
					{
						opacity: 1, y: 0,
						duration: 0.85, ease: 'power2.out',
						stagger: { amount: 0.25 },
						scrollTrigger: stConfig(cards[0], { start: 'top 90%' }),
					}
				);
			}
		}

		/* Image scale on hover */
		if (!prefersReducedMotion && gs()) {
			section.querySelectorAll('[data-gs-project-card]').forEach(function (card) {
				var img = card.querySelector('[data-gs-project-img]');
				if (!img) return;
				card.addEventListener('mouseenter', function () { gs().to(img, { scale: 1.05, duration: 0.6, ease: 'power2.out' }); });
				card.addEventListener('mouseleave', function () { gs().to(img, { scale: 1,    duration: 0.6, ease: 'power2.inOut' }); });
			});
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   LATEST POSTS
	═══════════════════════════════════════════════════════════════════════ */
	function initLatestPostsAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-latest-posts');
		if (!section) return;

		revealHeader(section);

		var cards = section.querySelectorAll('[data-gs-post-card]');
		if (cards.length) {
			gs().fromTo(cards,
				{ opacity: 0, y: 32 },
				{
					opacity: 1, y: 0,
					duration: 0.8, ease: 'power2.out',
					stagger: { amount: 0.22 },
					scrollTrigger: stConfig(cards[0], { start: 'top 90%' }),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   TESTIMONIALS
	═══════════════════════════════════════════════════════════════════════ */
	function initTestimonialsAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-testimonials');
		if (!section) return;

		revealHeader(section);

		var slider = section.querySelector('.swiper, [class*="testimonial-slider"]');
		if (slider) {
			gs().fromTo(slider,
				{ opacity: 0, y: 24 },
				{ opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
				  scrollTrigger: stConfig(slider) }
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   PRICING
	═══════════════════════════════════════════════════════════════════════ */
	function initPricingAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-pricing');
		if (!section) return;

		revealHeader(section);

		var cards = section.querySelectorAll('.gs-card, [class*="pricing-card"]');
		if (cards.length) {
			gs().fromTo(cards,
				{ opacity: 0, y: 32 },
				{
					opacity: 1, y: 0,
					duration: 0.8, ease: 'power2.out',
					stagger: { amount: 0.2, from: 'center' },
					scrollTrigger: stConfig(cards[0], { start: 'top 90%' }),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   FAQ
	═══════════════════════════════════════════════════════════════════════ */
	function initFAQAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-faq');
		if (!section) return;

		revealHeader(section);

		var items = section.querySelectorAll('details, .faq-item');
		if (items.length) {
			gs().fromTo(items,
				{ opacity: 0, y: 20 },
				{
					opacity: 1, y: 0,
					duration: 0.65, ease: 'power2.out',
					stagger: { amount: 0.25 },
					scrollTrigger: stConfig(items[0], { start: 'top 90%' }),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   CTA BAND
	═══════════════════════════════════════════════════════════════════════ */
	function initCTAAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-cta');
		if (!section) return;

		var tl  = gs().timeline({ scrollTrigger: stConfig(section, { start: 'top 82%' }) });
		var h2  = section.querySelector('h2');
		var sub = h2 && h2.nextElementSibling && h2.nextElementSibling.matches('p') ? h2.nextElementSibling : null;
		var btn = section.querySelector('.wp-block-button__link, a[href]');

		if (h2)  tl.fromTo(h2,  { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
		if (sub) tl.fromTo(sub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 0.2);
		if (btn) tl.fromTo(btn, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.35);
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   CONTACT
	═══════════════════════════════════════════════════════════════════════ */
	function initContactAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-contact');
		if (!section) return;

		revealHeader(section);

		/* All direct child columns / cards fade up together */
		var cols = section.querySelectorAll('.gs-contact-info, .gs-contact-form, form, .gs-card');
		if (cols.length) {
			gs().fromTo(cols,
				{ opacity: 0, y: 24 },
				{
					opacity: 1, y: 0,
					duration: 0.75, ease: 'power2.out',
					stagger: 0.1,
					scrollTrigger: stConfig(cols[0]),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   FOOTER
	═══════════════════════════════════════════════════════════════════════ */
	function initFooterAnimation() {
		if (!ok()) return;
		var footer = document.querySelector('footer, .grosharp-footer');
		if (!footer) return;

		var brand = footer.querySelector('.gs-footer-brand-name, [class*="brand-name"]');
		if (brand) {
			gs().fromTo(brand,
				{ opacity: 0, y: 20 },
				{ opacity: 1, y: 0, duration: 1.0, ease: 'power3.out',
				  scrollTrigger: stConfig(brand, { start: 'top 92%' }) }
			);
		}

		var cols = footer.querySelectorAll('.gs-footer-col, [class*="footer-col"]');
		if (cols.length) {
			gs().fromTo(cols,
				{ opacity: 0, y: 20 },
				{
					opacity: 1, y: 0,
					duration: 0.7, ease: 'power2.out',
					stagger: { amount: 0.2 },
					scrollTrigger: stConfig(footer, { start: 'top 92%' }),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   GENERIC .gs-reveal FALLBACK
	═══════════════════════════════════════════════════════════════════════ */
	function initRevealAnimations() {
		if (prefersReducedMotion || !gs()) {
			document.querySelectorAll('.gs-reveal').forEach(function (el) {
				el.style.opacity   = '1';
				el.style.transform = 'none';
			});
			return;
		}

		gs().utils.toArray('.gs-reveal').forEach(function (el) {
			if (el.closest('.grosharp-hero')) return;
			gs().fromTo(el,
				{ opacity: 0, y: 20 },
				{
					opacity: 1, y: 0, duration: 0.75, ease: 'power2.out',
					scrollTrigger: st() ? stConfig(el, { start: 'top 88%' }) : null,
				}
			);
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   CUSTOM CURSOR
	═══════════════════════════════════════════════════════════════════════ */
	function initCustomCursor() {
		if (prefersReducedMotion || !gs()) return;
		if (!window.matchMedia('(pointer: fine)').matches) return;

		var dot  = document.createElement('div');
		var ring = document.createElement('div');
		dot.id   = 'gs-cursor-dot';
		ring.id  = 'gs-cursor-ring';
		document.body.appendChild(dot);
		document.body.appendChild(ring);
		document.body.classList.add('gs-cursor-ready');

		var dotX  = gs().quickTo(dot,  'x', { duration: 0.08, ease: 'none' });
		var dotY  = gs().quickTo(dot,  'y', { duration: 0.08, ease: 'none' });
		var ringX = gs().quickTo(ring, 'x', { duration: 0.38, ease: 'power3.out' });
		var ringY = gs().quickTo(ring, 'y', { duration: 0.38, ease: 'power3.out' });

		document.addEventListener('mousemove', function (e) { dotX(e.clientX); dotY(e.clientY); ringX(e.clientX); ringY(e.clientY); });

		var sel = 'a, button, [role="button"], label, input, select, textarea, .gs-card, [data-gs-project-card]';
		function wire(el) {
			el.addEventListener('mouseenter', function () { document.body.classList.add('gs-cursor-hover'); });
			el.addEventListener('mouseleave', function () { document.body.classList.remove('gs-cursor-hover'); });
		}
		document.querySelectorAll(sel).forEach(wire);
		new MutationObserver(function (ms) {
			ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType !== 1) return; if (n.matches && n.matches(sel)) wire(n); n.querySelectorAll && n.querySelectorAll(sel).forEach(wire); }); });
		}).observe(document.body, { childList: true, subtree: true });

		document.addEventListener('mousedown', function () { document.body.classList.add('gs-cursor-click'); });
		document.addEventListener('mouseup',   function () { document.body.classList.remove('gs-cursor-click'); });
		document.addEventListener('mouseleave', function () { gs().to([dot, ring], { opacity: 0, duration: 0.3 }); });
		document.addEventListener('mouseenter', function () { gs().to([dot, ring], { opacity: 1, duration: 0.3 }); });
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   MAGNETIC BUTTONS
	═══════════════════════════════════════════════════════════════════════ */
	function initMagneticButtons() {
		if (prefersReducedMotion || !gs()) return;
		if (!window.matchMedia('(pointer: fine)').matches) return;

		document.querySelectorAll('.gs-button-primary, .gs-button-secondary, .wp-block-button__link').forEach(function (btn) {
			btn.addEventListener('mousemove', function (e) {
				var r = btn.getBoundingClientRect();
				var dx = e.clientX - (r.left + r.width / 2);
				var dy = e.clientY - (r.top  + r.height / 2);
				if (Math.sqrt(dx * dx + dy * dy) < 80) {
					gs().to(btn, { x: dx * 0.38, y: dy * 0.38, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
				}
			});
			btn.addEventListener('mouseleave', function () {
				gs().to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
			});
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   STICKY HEADER
	═══════════════════════════════════════════════════════════════════════ */
	function initHeaderScroll() {
		var header = document.querySelector('header.wp-block-group');
		if (!header) return;

		var isSticky = false, ticking = false;

		function onScroll() {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(function () {
				var past = window.scrollY > 60;
				if (past !== isSticky) { isSticky = past; header.classList.toggle('gs-header-sticky', past); }
				ticking = false;
			});
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   MOBILE MENU
	═══════════════════════════════════════════════════════════════════════ */
	function initMobileMenu() {
		var overlay  = document.getElementById('gs-mobile-menu');
		var btnOpen  = document.getElementById('gs-menu-open');
		var btnClose = document.getElementById('gs-menu-close');
		if (!overlay || !btnOpen) return;

		function open() {
			overlay.classList.add('gs-menu-active');
			overlay.setAttribute('aria-hidden', 'false');
			btnOpen.setAttribute('aria-expanded', 'true');
			document.body.classList.add('gs-menu-open');
		}
		function close() {
			overlay.classList.remove('gs-menu-active');
			overlay.setAttribute('aria-hidden', 'true');
			btnOpen.setAttribute('aria-expanded', 'false');
			document.body.classList.remove('gs-menu-open');
		}

		btnOpen.addEventListener('click', open);
		if (btnClose) btnClose.addEventListener('click', close);
		document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
		overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   BOOT
	═══════════════════════════════════════════════════════════════════════ */
	document.addEventListener('DOMContentLoaded', function () {
		if (gs() && st()) gs().registerPlugin(st());

		initHeaderScroll();
		initMobileMenu();
		initCustomCursor();
		initMagneticButtons();
		initSmoothScroll();
		initHeroEntrance();
		initHeroParallax();
		initLogoMarquees();
		initServicesAnimation();
		initServicesScroll();
		initProcessAnimation();
		initStatsAnimation();
		initProjectCards();
		initLatestPostsAnimation();
		initTestimonialsAnimation();
		initPricingAnimation();
		initFAQAnimation();
		initCTAAnimation();
		initContactAnimation();
		initFooterAnimation();
		initRevealAnimations();
	});
})();
