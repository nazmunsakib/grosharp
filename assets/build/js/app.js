(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ─── Helpers ──────────────────────────────────────────────────────────── */
	function gs()  { return window.gsap; }
	function st()  { return window.ScrollTrigger; }
	function ok()  { return !prefersReducedMotion && gs() && st(); }

	/**
	 * Standard bidirectional ScrollTrigger defaults.
	 * "play reverse play reverse" = plays on enter, reverses on scroll-back,
	 * replays if you scroll down again.
	 */
	function stDefaults(trigger, extra) {
		return Object.assign({
			trigger:       trigger,
			start:         'top 82%',
			toggleActions: 'play none play reset',
		}, extra || {});
	}

	/** Bidirectional timeline factory */
	function makeTl(trigger, extra) {
		return gs().timeline({ scrollTrigger: stDefaults(trigger, extra) });
	}

	/* ─── Word splitter ────────────────────────────────────────────────────── */
	/**
	 * Wraps each word in a <span class="gs-word-wrap"> that clips overflow,
	 * with an inner <span class="gs-word"> for the translate animation.
	 * Returns the inner spans so GSAP can animate them.
	 */
	function splitWords(el) {
		if (!el) return [];
		var text  = el.textContent;
		var words = text.split(/\s+/).filter(Boolean);
		el.innerHTML = words.map(function (w) {
			return '<span class="gs-word-wrap" style="display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.18em;margin-bottom:-0.18em">'
				+ '<span class="gs-word" style="display:inline-block">' + w + '</span>'
				+ '</span>';
		}).join(' ');
		return Array.prototype.slice.call(el.querySelectorAll('.gs-word'));
	}

	/** Restore a split element to plain text (for reverse compatibility) */
	function unsplitWords(el) {
		if (!el) return;
		el.textContent = Array.prototype.map.call(
			el.querySelectorAll('.gs-word'),
			function (s) { return s.textContent; }
		).join(' ');
	}

	/* ─── Lenis smooth scroll ──────────────────────────────────────────────── */
	function initSmoothScroll() {
		if (prefersReducedMotion || !window.Lenis) return;

		var lenis = new window.Lenis({
			duration:    1.25,
			easing:      function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
			smoothWheel: true,
			smoothTouch: false,
		});

		if (st()) {
			lenis.on('scroll', st().update);
			gs().ticker.add(function (time) { lenis.raf(time * 1000); });
			gs().ticker.lagSmoothing(0);
		} else {
			(function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
		}

		document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
			anchor.addEventListener('click', function (e) {
				var id     = anchor.getAttribute('href');
				var target = id && id.length > 1 && document.querySelector(id);
				if (!target) return;
				e.preventDefault();
				lenis.scrollTo(target, { offset: -80, duration: 1.4 });
			});
		});

		window.__lenis = lenis;
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   HERO ENTRANCE
	   Plays once on page load — not scroll-driven.
	   Hero scroll-exit parallax handled separately.
	═══════════════════════════════════════════════════════════════════════ */
	function initHeroEntrance() {
		if (prefersReducedMotion || !gs()) return;
		var hero = document.querySelector('.grosharp-hero');
		if (!hero) return;

		/* Pre-clear any .gs-reveal so the generic fallback won't double-animate */
		hero.querySelectorAll('.gs-reveal').forEach(function (el) {
			el.style.opacity   = '1';
			el.style.transform = 'none';
		});

		var eyebrow = hero.querySelector('[data-gs-eyebrow]');
		var h1      = hero.querySelector('h1');
		var body    = h1 && h1.nextElementSibling;
		var ctas    = hero.querySelectorAll('[data-gs-hero-cta], .wp-block-buttons a, .gs-btn');
		var badge   = hero.querySelector('[data-gs-hero-badge]');

		var tl = gs().timeline({ delay: 0.15 });

		/* Eyebrow pill: fade + slight rise */
		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 16, scale: 0.95 },
				{ opacity: 1, y: 0,  scale: 1, duration: 0.7, ease: 'power3.out' },
				0
			);
		}

		/* H1 words: cascade up from below clip */
		if (h1) {
			var words = splitWords(h1);
			if (words.length) {
				tl.fromTo(words,
					{ yPercent: 110 },
					{ yPercent: 0, duration: 1.0, ease: 'power4.out', stagger: 0.045 },
					0.1
				);
			}
		}

		/* Body paragraph */
		if (body && body.matches('p')) {
			tl.fromTo(body,
				{ opacity: 0, y: 24 },
				{ opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
				0.45
			);
		}

		/* CTA buttons */
		if (ctas.length) {
			tl.fromTo(ctas,
				{ opacity: 0, y: 18, scale: 0.96 },
				{ opacity: 1, y: 0,  scale: 1, duration: 0.7, ease: 'back.out(1.4)', stagger: 0.08 },
				0.6
			);
		}

		/* Badge / trust indicator */
		if (badge) {
			tl.fromTo(badge,
				{ opacity: 0, x: -12 },
				{ opacity: 1, x: 0, duration: 0.65, ease: 'power3.out' },
				0.75
			);
		}

		/* Subtle hero background gradient drift */
		gs().fromTo(hero,
			{ backgroundPosition: '50% 0%' },
			{ backgroundPosition: '50% 8%', duration: 12, ease: 'sine.inOut', yoyo: true, repeat: -1 }
		);
	}

	/* Hero exit parallax — content drifts up slightly as user scrolls away */
	function initHeroParallax() {
		if (!ok()) return;
		var hero = document.querySelector('.grosharp-hero');
		if (!hero) return;

		var inner = hero.querySelector('.gs-container') || hero.firstElementChild;
		if (!inner) return;

		gs().fromTo(inner,
			{ yPercent: 0 },
			{
				yPercent: -12,
				ease: 'none',
				scrollTrigger: {
					trigger:  hero,
					start:    'top top',
					end:      'bottom top',
					scrub:    1.2,
				},
			}
		);
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   LOGO STRIP / MARQUEE
	═══════════════════════════════════════════════════════════════════════ */
	function initLogoMarquees() {
		if (prefersReducedMotion || !gs()) return;

		document.querySelectorAll('[data-gs-logo-marquee]').forEach(function (marquee) {
			var track    = marquee.querySelector('[data-gs-logo-track]');
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

			/* Strip wrapper entrance */
			if (st()) {
				var wrapper = marquee.closest('.grosharp-logo-strip') || marquee.parentElement;
				gs().fromTo(wrapper,
					{ opacity: 0, y: 20 },
					{
						opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
						scrollTrigger: stDefaults(wrapper),
					}
				);
			}
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   SERVICES SECTION
	   Header words cascade → cards clip-path reveal with stagger (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initServicesAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-services');
		if (!section) return;

		/* ── Section header ── */
		var tl      = makeTl(section, { start: 'top 80%' });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var sub     = section.querySelector('p:not([data-gs-eyebrow])');
		var headerCta = section.querySelector('a[href*="service"]');

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14, scale: 0.92 },
				{ opacity: 1, y: 0,  scale: 1, duration: 0.6, ease: 'power3.out' },
				0
			);
		}
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: 105, opacity: 0 },
				{ yPercent: 0, opacity: 1, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
				0.1
			);
		}
		if (sub) {
			tl.fromTo(sub,
				{ opacity: 0, y: 16 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
				0.3
			);
		}
		if (headerCta) {
			tl.fromTo(headerCta,
				{ opacity: 0, x: 16 },
				{ opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' },
				0.4
			);
		}

		/* ── Service cards: staggered clip-path wipe + scale ── */
		var cards = section.querySelectorAll('[data-gs-service-card]');
		if (cards.length) {
			cards.forEach(function (card, i) {
				var row = Math.floor(i / 3); /* 3-column grid */
				var col = i % 3;

				/* Alternate entry direction per column for visual rhythm */
				var xFrom = col === 0 ? -40 : col === 2 ? 40 : 0;

				gs().fromTo(card,
					{
						opacity: 0,
						y: 56,
						x: xFrom,
						scale: 0.92,
						clipPath: 'inset(12% ' + (col === 0 ? '0%' : col === 2 ? '0%' : '4%') + ' 0% ' + (col === 0 ? '4%' : col === 2 ? '4%' : '4%') + ' round 1.5rem)',
					},
					{
						opacity: 1,
						y: 0,
						x: 0,
						scale: 1,
						clipPath: 'inset(0% 0% 0% 0% round 1.5rem)',
						duration: 0.85,
						ease: 'power3.out',
						delay: row * 0.08 + col * 0.1,
						scrollTrigger: stDefaults(card, { start: 'top 90%' }),
					}
				);
			});

			/* ── Hover: icon lift + number watermark scale ── */
			cards.forEach(function (card) {
				var icon   = card.querySelector('.gs-service-icon');
				var number = card.querySelector('.gs-service-number');

				card.addEventListener('mouseenter', function () {
					if (icon)   gs().to(icon,   { y: -6, duration: 0.4, ease: 'power2.out' });
					if (number) gs().to(number, { scale: 1.15, opacity: 0.35, duration: 0.5, ease: 'power2.out' });
				});
				card.addEventListener('mouseleave', function () {
					if (icon)   gs().to(icon,   { y: 0, duration: 0.55, ease: 'elastic.out(1, 0.5)' });
					if (number) gs().to(number, { scale: 1, opacity: 1, duration: 0.45, ease: 'power2.inOut' });
				});
			});
		}
	}

	/* Services horizontal auto-scroll marquee */
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

	/* ═══════════════════════════════════════════════════════════════════════
	   PROCESS / HOW WE WORK
	   Number → title → description cascade per step (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initProcessAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-process');
		if (!section) return;

		/* Section header */
		var headerEl = section.querySelector('[data-gs-step-header]');
		if (headerEl) {
			var tl      = makeTl(headerEl, { start: 'top 84%' });
			var eyebrow = headerEl.querySelector('[data-gs-eyebrow]');
			var h2      = headerEl.querySelector('h2');
			var sub     = headerEl.querySelector('p');

			if (eyebrow) {
				tl.fromTo(eyebrow,
					{ opacity: 0, y: 14 },
					{ opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
					0
				);
			}
			if (h2) {
				var words = splitWords(h2);
				tl.fromTo(words.length ? words : [h2],
					{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 32 },
					{ yPercent: 0, opacity: 1, y: 0, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
					0.1
				);
			}
			if (sub) {
				tl.fromTo(sub,
					{ opacity: 0, y: 18 },
					{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
					0.28
				);
			}
		}

		/* Each step card: stagger from left with distance offset */
		var steps = section.querySelectorAll('[data-gs-step]');
		if (steps.length) {
			steps.forEach(function (step, i) {
				gs().fromTo(step,
					{ opacity: 0, x: -32, y: 24 },
					{
						opacity: 1, x: 0, y: 0, duration: 0.78, ease: 'power3.out',
						scrollTrigger: stDefaults(step, { start: 'top 88%', delay: i * 0.1 }),
					}
				);
			});
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   STATS  — cells pop up + count-up numbers (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initStatsAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-stats');
		if (!section) return;

		var cells = section.querySelectorAll('[data-gs-stat]');
		if (!cells.length) return;

		/* Header */
		var tl  = makeTl(section, { start: 'top 82%' });
		var h2  = section.querySelector('h2');
		var sub = h2 && h2.nextElementSibling;
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 32 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
				0
			);
		}
		if (sub && sub.matches('p')) {
			tl.fromTo(sub,
				{ opacity: 0, y: 18 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
				0.25
			);
		}

		/* Stat cells */
		tl.fromTo(cells,
			{ opacity: 0, y: 40, scale: 0.94 },
			{ opacity: 1, y: 0,  scale: 1, duration: 0.85, ease: 'power3.out', stagger: { amount: 0.35 } },
			0.2
		);

		/* Count-up (only plays on scroll-down; reset on scroll-back) */
		var numbers = section.querySelectorAll('[data-stat-number]');
		numbers.forEach(function (el) {
			var endVal = parseFloat(el.getAttribute('data-stat-number')) || 0;
			var prefix = el.getAttribute('data-stat-prefix') || '';
			var suffix = el.getAttribute('data-stat-suffix') || '';
			var dec    = String(endVal).includes('.') ? 1 : 0;

			gs().fromTo({ val: 0 }, { val: endVal }, {
				duration: 1.8, ease: 'power2.out',
				onUpdate: function () {
					el.textContent = prefix + this.targets()[0].val.toFixed(dec) + suffix;
				},
				onReverseComplete: function () {
					el.textContent = prefix + (0).toFixed(dec) + suffix;
				},
				scrollTrigger: stDefaults(el, { start: 'top 85%' }),
			});
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   FEATURED PROJECTS
	   Header words → cards clip-path reveal + image hover scale (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initProjectCards() {
		if (!gs()) return;
		var section = document.querySelector('.grosharp-projects');
		if (!section) return;

		if (!prefersReducedMotion && st()) {
			var eyebrow = section.querySelector('[data-gs-project-eyebrow]');
			var heading = section.querySelector('[data-gs-project-heading]');
			var cta     = section.querySelector('[data-gs-project-cta]');
			var cards   = section.querySelectorAll('[data-gs-project-card]');

			var tl = makeTl(section, { start: 'top 80%' });

			if (eyebrow) {
				tl.fromTo(eyebrow,
					{ opacity: 0, y: 14, scale: 0.92 },
					{ opacity: 1, y: 0,  scale: 1, duration: 0.6, ease: 'power3.out' },
					0
				);
			}
			if (heading) {
				var words = splitWords(heading);
				tl.fromTo(words.length ? words : [heading],
					{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 36 },
					{ yPercent: 0, opacity: 1, y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.045 },
					0.1
				);
			}
			if (cta) {
				tl.fromTo(cta,
					{ opacity: 0, x: 20 },
					{ opacity: 1, x: 0, duration: 0.55, ease: 'power3.out' },
					0.3
				);
			}

			/* Cards: clip-path wipe upward + scale */
			if (cards.length) {
				tl.fromTo(cards,
					{ opacity: 0, y: 60, scale: 0.95, clipPath: 'inset(8% 0% 0% 0% round 1.5rem)' },
					{
						opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 1.5rem)',
						duration: 0.95, ease: 'power3.out', stagger: { amount: 0.3 },
					},
					0.28
				);
			}
		} else {
			/* Reduced motion fallback */
			section.querySelectorAll('[data-gs-project-card], [data-gs-project-eyebrow], [data-gs-project-heading], [data-gs-project-cta]').forEach(function (el) {
				el.style.opacity   = '1';
				el.style.transform = 'none';
			});
		}

		/* Image zoom on hover */
		if (!prefersReducedMotion && gs()) {
			section.querySelectorAll('[data-gs-project-card]').forEach(function (card) {
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

	/* ═══════════════════════════════════════════════════════════════════════
	   LATEST POSTS
	   Header → cards stagger up with clip-path (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initLatestPostsAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-latest-posts');
		if (!section) return;

		var tl      = makeTl(section, { start: 'top 80%' });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var sub     = h2 && h2.nextElementSibling;
		var cards   = section.querySelectorAll('[data-gs-post-card]');

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
				0
			);
		}
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 32 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
				0.08
			);
		}
		if (sub && sub.matches('p')) {
			tl.fromTo(sub,
				{ opacity: 0, y: 18 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
				0.22
			);
		}
		if (cards.length) {
			tl.fromTo(cards,
				{ opacity: 0, y: 52, scale: 0.96, clipPath: 'inset(6% 0% 0% 0% round 1rem)' },
				{
					opacity: 1, y: 0, scale: 1, clipPath: 'inset(0% 0% 0% 0% round 1rem)',
					duration: 0.9, ease: 'power3.out', stagger: { amount: 0.25 },
				},
				0.28
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   TESTIMONIALS
	   Header entrance + slide-fade on the slider wrapper (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initTestimonialsAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-testimonials');
		if (!section) return;

		var tl      = makeTl(section, { start: 'top 82%' });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var sub     = h2 && h2.nextElementSibling;
		var slider  = section.querySelector('.swiper, .gs-testimonials-slider, [class*="testimonial"]');

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14, scale: 0.92 },
				{ opacity: 1, y: 0,  scale: 1, duration: 0.6, ease: 'power3.out' },
				0
			);
		}
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 36 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 0.9, ease: 'power4.out', stagger: 0.045 },
				0.1
			);
		}
		if (sub && sub.matches('p')) {
			tl.fromTo(sub,
				{ opacity: 0, y: 18 },
				{ opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
				0.28
			);
		}
		if (slider) {
			tl.fromTo(slider,
				{ opacity: 0, y: 36 },
				{ opacity: 1, y: 0, duration: 0.85, ease: 'power3.out' },
				0.38
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   PRICING
	   Cards pop in with staggered scale + clip-path (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initPricingAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-pricing');
		if (!section) return;

		var tl      = makeTl(section, { start: 'top 80%' });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var sub     = h2 && h2.nextElementSibling;
		var cards   = section.querySelectorAll('.gs-pricing-card, [class*="pricing"] .gs-card, .gs-card');

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
				0
			);
		}
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 32 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
				0.08
			);
		}
		if (sub && sub.matches('p')) {
			tl.fromTo(sub,
				{ opacity: 0, y: 18 },
				{ opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
				0.22
			);
		}
		if (cards.length) {
			tl.fromTo(cards,
				{ opacity: 0, y: 48, scale: 0.94 },
				{
					opacity: 1, y: 0, scale: 1,
					duration: 0.88, ease: 'power3.out',
					stagger: { amount: 0.28, from: 'center' },
				},
				0.25
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   FAQ
	   Header → accordion items slide in alternating left/right (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initFAQAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-faq');
		if (!section) return;

		var tl      = makeTl(section, { start: 'top 82%' });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var sub     = h2 && h2.nextElementSibling;
		var items   = section.querySelectorAll('.grosharp-faq__list > *, details, .faq-item, .gs-card');

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
				0
			);
		}
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 32 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
				0.08
			);
		}
		if (sub && sub.matches('p')) {
			tl.fromTo(sub,
				{ opacity: 0, y: 18 },
				{ opacity: 1, y: 0, duration: 0.65, ease: 'power3.out' },
				0.22
			);
		}
		if (items.length) {
			items.forEach(function (item, i) {
				tl.fromTo(item,
					{ opacity: 0, x: i % 2 === 0 ? -28 : 28, y: 12 },
					{ opacity: 1, x: 0, y: 0, duration: 0.72, ease: 'power3.out' },
					0.28 + i * 0.07
				);
			});
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   CTA BAND
	   Large heading scale-up + glow, button spring in (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initCTAAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-cta');
		if (!section) return;

		var tl  = makeTl(section, { start: 'top 80%' });
		var h2  = section.querySelector('h2');
		var txt = h2 && h2.nextElementSibling;
		var btn = section.querySelector('a[href], .wp-block-button__link');

		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 110 : 0, opacity: 0, y: words.length ? 0 : 52, scale: words.length ? 1 : 0.96 },
				{
					yPercent: 0, opacity: 1, y: 0, scale: 1,
					duration: 1.0, ease: 'power4.out', stagger: 0.045,
				},
				0
			);
		}
		if (txt && txt.matches('p')) {
			tl.fromTo(txt,
				{ opacity: 0, y: 22 },
				{ opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' },
				0.35
			);
		}
		if (btn) {
			tl.fromTo(btn,
				{ opacity: 0, y: 18, scale: 0.9 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.72, ease: 'back.out(1.6)' },
				0.5
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   CONTACT SECTION
	   Left info → right form stagger (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initContactAnimation() {
		if (!ok()) return;
		var section = document.querySelector('.grosharp-contact');
		if (!section) return;

		var tl      = makeTl(section, { start: 'top 82%' });
		var eyebrow = section.querySelector('[data-gs-eyebrow]');
		var h2      = section.querySelector('h2');
		var left    = section.querySelector('.gs-contact-info, [class*="contact-info"], [class*="contact__left"]');
		var right   = section.querySelector('.gs-contact-form, form, [class*="contact-form"], [class*="contact__right"]');
		var cards   = section.querySelectorAll('.gs-contact-card, .gs-card');

		if (eyebrow) {
			tl.fromTo(eyebrow,
				{ opacity: 0, y: 14 },
				{ opacity: 1, y: 0, duration: 0.55, ease: 'power3.out' },
				0
			);
		}
		if (h2) {
			var words = splitWords(h2);
			tl.fromTo(words.length ? words : [h2],
				{ yPercent: words.length ? 105 : 0, opacity: 0, y: words.length ? 0 : 32 },
				{ yPercent: 0, opacity: 1, y: 0, duration: 0.85, ease: 'power4.out', stagger: 0.04 },
				0.1
			);
		}
		if (left) {
			tl.fromTo(left,
				{ opacity: 0, x: -36 },
				{ opacity: 1, x: 0, duration: 0.85, ease: 'power3.out' },
				0.2
			);
		}
		if (right) {
			tl.fromTo(right,
				{ opacity: 0, x: 36 },
				{ opacity: 1, x: 0, duration: 0.85, ease: 'power3.out' },
				0.2
			);
		}
		if (cards.length && !left && !right) {
			tl.fromTo(cards,
				{ opacity: 0, y: 32, scale: 0.96 },
				{ opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', stagger: { amount: 0.22 } },
				0.22
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   FOOTER
	   Brand name horizontal wipe → link groups fade up (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initFooterAnimation() {
		if (!ok()) return;
		var footer = document.querySelector('footer, .grosharp-footer, footer.wp-block-template-part');
		if (!footer) return;

		var brand    = footer.querySelector('.gs-footer-brand-name, [class*="brand-name"]');
		var colGroups = footer.querySelectorAll('.gs-footer-col, [class*="footer-col"], [class*="footer__col"]');
		var legal    = footer.querySelector('[class*="footer-legal"], [class*="footer__legal"]');

		if (brand) {
			gs().fromTo(brand,
				{ opacity: 0, clipPath: 'inset(0% 100% 0% 0%)' },
				{
					opacity: 1, clipPath: 'inset(0% 0% 0% 0%)',
					duration: 1.1, ease: 'power4.out',
					scrollTrigger: stDefaults(brand, { start: 'top 90%' }),
				}
			);
		}

		if (colGroups.length) {
			gs().fromTo(colGroups,
				{ opacity: 0, y: 28 },
				{
					opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
					stagger: { amount: 0.3 },
					scrollTrigger: stDefaults(footer, { start: 'top 90%' }),
				}
			);
		}

		if (legal) {
			gs().fromTo(legal,
				{ opacity: 0 },
				{
					opacity: 1, duration: 0.7, ease: 'power2.out',
					scrollTrigger: stDefaults(legal, { start: 'top 95%' }),
				}
			);
		}
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   GENERIC .gs-reveal FALLBACK
	   Any element tagged .gs-reveal that isn't handled above (bidirectional)
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
			if (el.closest('.grosharp-hero')) return; /* hero handles its own */

			gs().fromTo(el,
				{ opacity: 0, y: 28 },
				{
					opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
					scrollTrigger: st() ? stDefaults(el, { start: 'top 86%' }) : null,
				}
			);
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   SECTION LINE DIVIDERS
	   Horizontal rule / decorative line wipes in from left (bidirectional)
	═══════════════════════════════════════════════════════════════════════ */
	function initDividerAnimations() {
		if (!ok()) return;

		document.querySelectorAll('.grosharp-block hr, .gs-divider').forEach(function (hr) {
			gs().fromTo(hr,
				{ scaleX: 0, transformOrigin: 'left center' },
				{
					scaleX: 1, duration: 0.9, ease: 'power4.out',
					scrollTrigger: stDefaults(hr, { start: 'top 90%' }),
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

		document.addEventListener('mousemove', function (e) {
			dotX(e.clientX); dotY(e.clientY);
			ringX(e.clientX); ringY(e.clientY);
		});

		var hoverSel = 'a, button, [role="button"], label, input, select, textarea, .gs-card, [data-gs-project-card], [data-cursor-hover]';
		function addHoverListeners(el) {
			el.addEventListener('mouseenter', function () { document.body.classList.add('gs-cursor-hover'); });
			el.addEventListener('mouseleave', function () { document.body.classList.remove('gs-cursor-hover'); });
		}
		document.querySelectorAll(hoverSel).forEach(addHoverListeners);

		new MutationObserver(function (mutations) {
			mutations.forEach(function (m) {
				m.addedNodes.forEach(function (node) {
					if (node.nodeType !== 1) return;
					if (node.matches && node.matches(hoverSel)) addHoverListeners(node);
					node.querySelectorAll && node.querySelectorAll(hoverSel).forEach(addHoverListeners);
				});
			});
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

		var STRENGTH   = 0.42;
		var RANGE      = 80;
		var RETURN_DUR = 0.65;
		var selector   = '.gs-button-primary, .gs-button-secondary, .wp-block-button__link';

		document.querySelectorAll(selector).forEach(function (btn) {
			btn.addEventListener('mousemove', function (e) {
				var rect    = btn.getBoundingClientRect();
				var distX   = e.clientX - (rect.left + rect.width  / 2);
				var distY   = e.clientY - (rect.top  + rect.height / 2);
				if (Math.sqrt(distX * distX + distY * distY) < RANGE) {
					gs().to(btn, { x: distX * STRENGTH, y: distY * STRENGTH, duration: 0.3, ease: 'power3.out', overwrite: 'auto' });
				}
			});
			btn.addEventListener('mouseleave', function () {
				gs().to(btn, { x: 0, y: 0, duration: RETURN_DUR, ease: 'elastic.out(1, 0.45)', overwrite: 'auto' });
			});
		});
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   STICKY HEADER — shadow class only
	═══════════════════════════════════════════════════════════════════════ */
	function initHeaderScroll() {
		var header = document.querySelector('header.wp-block-group');
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
		onScroll();
	}

	/* ═══════════════════════════════════════════════════════════════════════
	   MOBILE MENU — pure CSS transitions, no GSAP dependency
	═══════════════════════════════════════════════════════════════════════ */
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
		document.addEventListener('keydown', function (e) {
			if (e.key === 'Escape' && overlay.classList.contains('gs-menu-active')) closeMenu();
		});
		overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
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
		initDividerAnimations();
		initRevealAnimations();
	});
})();
