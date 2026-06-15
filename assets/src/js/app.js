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

		var card    = section.querySelector('.cta-card');
		var eyebrow = section.querySelector('.cta-eyebrow');
		var h2      = section.querySelector('.cta-heading, h2');
		var sub     = section.querySelector('.cta-sub');
		var actions = section.querySelector('.cta-actions');

		/* Card rises as one unit */
		if (card) {
			gs().fromTo(card,
				{ opacity: 0, y: 48, scale: 0.97 },
				{ opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'power3.out',
				  scrollTrigger: stConfig(card, { start: 'top 86%' }) }
			);
		}

		/* Content sequences inside the card */
		var tl = gs().timeline({ scrollTrigger: stConfig(section, { start: 'top 80%' }), delay: 0.2 });
		if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
		if (h2)      tl.fromTo(h2,      { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0.12);
		if (sub)     tl.fromTo(sub,     { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 0.32);
		if (actions) tl.fromTo(actions, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.48);
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
	   ABOUT PAGE ANIMATIONS
	═══════════════════════════════════════════════════════════════════════ */
	function initAboutHero() {
		if (prefersReducedMotion || !gs()) return;
		var hero = document.querySelector('.grosharp-about-hero');
		if (!hero) return;

		var eyebrow = hero.querySelector('[data-gs-eyebrow]');
		var h1      = hero.querySelector('.about-hero-heading');
		var sub     = hero.querySelector('.about-hero-sub');
		var ctas    = hero.querySelectorAll('.about-hero-cta-primary, .about-hero-cta-secondary');
		var stats   = hero.querySelectorAll('.about-hero-stat');

		var tl = gs().timeline({ delay: 0.1 });

		if (eyebrow) {
			tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 0);
		}
		if (h1) {
			var spans = splitLines(h1);
			tl.fromTo(spans.length ? spans : [h1],
				{ yPercent: spans.length ? 100 : 0, opacity: 0, y: spans.length ? 0 : 32 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 1.05, ease: 'power3.out', stagger: 0.05 },
				0.15
			);
		}
		if (sub) {
			tl.fromTo(sub, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 0.5);
		}
		if (ctas.length) {
			tl.fromTo(ctas, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08 }, 0.65);
		}
		if (stats.length) {
			tl.fromTo(stats, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: { amount: 0.25 } }, 0.8);
		}
	}

	function initAboutStory() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-about-story');
		if (!section) return;

		var eyebrow   = section.querySelector('[data-gs-eyebrow]');
		var quoteWrap = section.querySelector('.about-story-quote-wrap');
		var quoteMark = section.querySelector('.about-story-quote-mark');
		var quote     = section.querySelector('.about-story-quote');
		var paras     = section.querySelectorAll('.about-story-p');

		/* Eyebrow pill */
		if (eyebrow) {
			gs().fromTo(eyebrow,
				{ opacity: 0, y: 14 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
				  scrollTrigger: stConfig(eyebrow, { start: 'top 88%' }) }
			);
		}

		/* Left column — pulled quote rises up, quote mark pops slightly after */
		if (quoteWrap) {
			var tl = gs().timeline({ scrollTrigger: stConfig(quoteWrap, { start: 'top 86%' }) });
			if (quoteMark) tl.fromTo(quoteMark, { opacity: 0, scale: 0.7, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.4)' }, 0);
			if (quote)     tl.fromTo(quote,     { opacity: 0, y: 28 },             { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' }, 0.1);

			/* Slow parallax on quote as you scroll past */
			if (st()) {
				st().create({
					trigger: section,
					start: 'top bottom',
					end: 'bottom top',
					scrub: 1.5,
					onUpdate: function (self) {
						if (quoteWrap) gs().set(quoteWrap, { y: self.progress * -28 });
					},
				});
			}
		}

		/* Right column — paragraphs cascade up one by one */
		if (paras.length) {
			gs().fromTo(paras,
				{ opacity: 0, y: 24 },
				{
					opacity: 1, y: 0,
					duration: 0.75, ease: 'power2.out',
					stagger: 0.14,
					scrollTrigger: stConfig(paras[0], { start: 'top 88%' }),
				}
			);
		}
	}

	function initAboutValues() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-about-values');
		if (!section) return;

		/* Section header: eyebrow → h2 → sub */
		revealHeader(section);

		var cards = section.querySelectorAll('[data-gs-value-card]');
		if (!cards.length) return;

		/* Cards cascade in with stagger — icons scale up inside each card */
		var icons = section.querySelectorAll('.about-value-icon');
		gs().set(icons, { scale: 0.75, opacity: 0 });

		gs().fromTo(cards,
			{ opacity: 0, y: 40 },
			{
				opacity: 1, y: 0,
				duration: 0.8, ease: 'power3.out',
				stagger: 0.12,
				scrollTrigger: stConfig(cards[0], { start: 'top 88%' }),
				onStart: function () {
					/* Icons pop in after cards start rising */
					gs().fromTo(icons,
						{ scale: 0.75, opacity: 0 },
						{ scale: 1, opacity: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: 0.12, delay: 0.2 }
					);
				},
			}
		);

		/* Hover: icon lifts, number watermark brightens */
		cards.forEach(function (card) {
			var icon = card.querySelector('.about-value-icon');
			card.addEventListener('mouseenter', function () {
				if (icon) gs().to(icon, { scale: 1.1, duration: 0.28, ease: 'power2.out' });
			});
			card.addEventListener('mouseleave', function () {
				if (icon) gs().to(icon, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
			});
		});
	}


	/* ─── PAGE HERO (general — About, Work, Contact, Services) ───────────────── */
	function initPageHero() {
		var section = document.querySelector('.grosharp-page-hero');
		if (!section || !gs()) return;

		var eyebrow = section.querySelector('[data-ph-eyebrow]');
		var heading = section.querySelector('[data-ph-heading]');
		var sub     = section.querySelector('[data-ph-sub]');
		var imgs    = section.querySelectorAll('[data-ph-img]');

		var tl = gs().timeline({ defaults: { ease: 'power2.out' } });

		/* Eyebrow slides in from slight upward offset */
		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }
			);
		}

		/* Heading: animate the two color-spans independently (preserves .ph-heading-dark / .ph-heading-accent colors).
		   Do NOT use splitLines() here — it rewrites innerHTML and strips the color spans. */
		if (heading) {
			var headingSpans = heading.querySelectorAll('.ph-heading-dark, .ph-heading-accent');
			var headingTarget = headingSpans.length ? headingSpans : heading;
			tl.fromTo(headingTarget,
				{ opacity: 0, y: 28 },
				{ opacity: 1, y: 0, duration: 0.65, stagger: { amount: 0.2 } },
				eyebrow ? '-=0.2' : 0
			);
		}

		/* Sub paragraph */
		if (sub) {
			tl.fromTo(sub,
				{ opacity: 0, y: 16 },
				{ opacity: 1, y: 0, duration: 0.55 },
				'-=0.3'
			);
		}

		/* Images stagger up */
		if (imgs.length) {
			tl.fromTo(imgs,
				{ opacity: 0, y: 32 },
				{ opacity: 1, y: 0, duration: 0.7, stagger: { amount: 0.18 } },
				'-=0.25'
			);
		}

		/* Above-fold: play immediately. Below fold: scroll trigger */
		var rect = section.getBoundingClientRect();
		if (rect.top < window.innerHeight * 1.05) {
			tl.play();
		} else if (st()) {
			st().create(Object.assign(
				stConfig(section, { start: 'top 82%' }),
				{ animation: tl }
			));
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   BOOT
	═══════════════════════════════════════════════════════════════════════ */

	/* ─── WORK GRID ──────────────────────────────────────────────────────────── */
	function initWorkGrid() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-work-grid');
		if (!section) return;

		var eyebrow = section.querySelector('.wg-eyebrow');
		var heading = section.querySelector('.wg-heading');
		var sub     = section.querySelector('.wg-sub');
		var cards   = section.querySelectorAll('[data-wg-card]');
		var filters = section.querySelectorAll('.wg-filter-btn');

		/* Header reveal */
		if (eyebrow || heading || sub) {
			var tl = gs().timeline({ scrollTrigger: stConfig(section, { start: 'top 84%' }) });
			if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0);
			if (heading) tl.fromTo(heading, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.1);
			if (sub)     tl.fromTo(sub,     { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 0.25);
		}

		/* Cards cascade in */
		if (cards.length) {
			gs().fromTo(cards,
				{ opacity: 0, y: 40 },
				{
					opacity: 1, y: 0,
					duration: 0.75, ease: 'power3.out',
					stagger: { amount: 0.35 },
					scrollTrigger: stConfig(cards[0], { start: 'top 90%' }),
				}
			);
		}

		/* Filter tabs — client-side show/hide with GSAP crossfade */
		filters.forEach(function (btn) {
			btn.addEventListener('click', function () {
				var filter = btn.getAttribute('data-filter');

				/* Update active tab */
				filters.forEach(function (b) {
					b.classList.remove('is-active');
					b.setAttribute('aria-selected', 'false');
				});
				btn.classList.add('is-active');
				btn.setAttribute('aria-selected', 'true');

				/* Fade + stagger visible cards */
				var showing = [];
				var hiding  = [];
				cards.forEach(function (card) {
					var types = (card.getAttribute('data-type') || '').split(' ');
					var match = filter === 'all' || types.indexOf(filter) !== -1;
					if (match) showing.push(card);
					else        hiding.push(card);
				});

				if (hiding.length) {
					gs().to(hiding, { opacity: 0, y: 12, duration: 0.2, ease: 'power2.in',
						onComplete: function () {
							hiding.forEach(function (c) { c.classList.add('wg-card--hidden'); });
						}
					});
				}
				showing.forEach(function (c) { c.classList.remove('wg-card--hidden'); });
				if (showing.length) {
					gs().fromTo(showing,
						{ opacity: 0, y: 20 },
						{ opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.06, delay: 0.15 }
					);
				}
			});
		});
	}

	/* ─── WORK FEATURED ──────────────────────────────────────────────────────── */
	function initWorkFeatured() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-work-featured');
		if (!section) return;

		var imgCol  = section.querySelector('[data-wf-img-col]');
		var eyebrow = section.querySelector('[data-wf-eyebrow]');
		var title   = section.querySelector('[data-wf-title]');
		var excerpt = section.querySelector('[data-wf-excerpt]');
		var stats   = section.querySelectorAll('.wf-stat');
		var cta     = section.querySelector('[data-wf-cta]');

		/* Image column slides in from left */
		if (imgCol) {
			gs().fromTo(imgCol,
				{ opacity: 0, x: -36 },
				{ opacity: 1, x: 0, duration: 1.0, ease: 'power3.out',
				  scrollTrigger: stConfig(imgCol, { start: 'top 84%' }) }
			);
			/* Subtle image parallax */
			if (st()) {
				st().create({
					trigger: section,
					start: 'top bottom',
					end: 'bottom top',
					scrub: 1.5,
					onUpdate: function (self) {
						if (imgCol) gs().set(imgCol, { y: self.progress * -24 });
					},
				});
			}
		}

		/* Right content sequences in */
		var tl = gs().timeline({ scrollTrigger: stConfig(section, { start: 'top 82%' }), delay: 0.15 });
		if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0);
		if (title)   tl.fromTo(title,   { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, 0.1);
		if (excerpt) tl.fromTo(excerpt, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, 0.28);
		if (stats.length) {
			tl.fromTo(stats,
				{ opacity: 0, y: 16 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', stagger: 0.1 },
				0.4
			);
		}
		if (cta) tl.fromTo(cta, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, 0.6);
	}

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
		/* About page */
		initAboutHero();
		initAboutStory();
		initAboutValues();
		/* General page hero */
		initPageHero();
		/* Work page */
		initWorkGrid();
		initWorkFeatured();
	});
})();

// BOOT already declared above — initPageHero appended here and called in DOMContentLoaded above
