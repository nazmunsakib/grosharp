(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ─── Helpers ──────────────────────────────────────────────────────── */

	function gs() { return window.gsap; }
	function st() { return window.ScrollTrigger; }

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

		var tl      = gs().timeline({ delay: 0.1 });
		var eyebrow = hero.querySelector('[data-gs-eyebrow]');
		var h1      = hero.querySelector('h1');
		var body    = h1 && h1.nextElementSibling;
		var ctas    = hero.querySelectorAll('[data-gs-hero-cta], .gs-btn');
		var visual  = hero.querySelector('[data-gs-hero-visual]');
		var badges  = hero.querySelectorAll('[data-gs-hero-badge]');

		if (eyebrow) tl.from(eyebrow, { y: 20, opacity: 0, duration: 0.65, ease: 'power3.out' }, 0);
		if (h1)      tl.from(h1,      { y: 52, opacity: 0, duration: 1.15, ease: 'power4.out' }, 0.1);
		if (body && body.matches('p')) {
			tl.from(body, { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.32);
		}
		if (ctas.length)   tl.from(ctas,   { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }, 0.48);
		if (visual)        tl.from(visual,  { y: 48, opacity: 0, scale: 0.96, duration: 1.25, ease: 'power4.out' }, 0.18);
		if (badges.length) tl.from(badges,  { y: 16, opacity: 0, duration: 0.65, ease: 'back.out(1.5)', stagger: 0.12 }, 0.58);
	}

	/* ─── Hero visual: ambient float + scroll parallax ─────────────────── */
	function initHeroVisual() {
		if (prefersReducedMotion || !gs()) return;
		var visual = document.querySelector('[data-gs-hero-visual]');
		if (!visual) return;

		gs().to(visual, { y: -14, duration: 3.5, ease: 'sine.inOut', repeat: -1, yoyo: true });

		if (st()) {
			st().create({
				trigger: '.grosharp-hero',
				start: 'top top',
				end: 'bottom top',
				scrub: 1.4,
				onUpdate: function (self) {
					gs().set(visual, { y: -14 + self.progress * -55 });
				},
			});
		}
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

	/* ─── Services section ─────────────────────────────────────────────── */
	function initServicesAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-services');
		if (!section) return;

		var tl    = makeSectionTl(section);
		var cards = section.querySelectorAll('article, .gs-card');

		addHeaderReveal(tl, section, 0);

		if (cards.length) {
			tl.from(cards, {
				y: 52, opacity: 0, scale: 0.97,
				duration: 0.9, ease: 'power3.out',
				stagger: { amount: 0.42 },
			}, 0.3);
		}

		/* Subtle hover lift on service cards */
		cards.forEach(function (card) {
			card.addEventListener('mouseenter', function () {
				gs().to(card, { y: -5, duration: 0.35, ease: 'power2.out' });
			});
			card.addEventListener('mouseleave', function () {
				gs().to(card, { y: 0, duration: 0.4, ease: 'power2.inOut' });
			});
		});
	}

	/* ─── Process steps ────────────────────────────────────────────────── */
	function initProcessAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-process');
		if (!section) return;

		var tl    = makeSectionTl(section);
		var steps = section.querySelectorAll('[data-gs-step], li, article');

		addHeaderReveal(tl, section, 0);

		if (steps.length) {
			tl.from(steps, {
				x: -28, opacity: 0, duration: 0.75,
				ease: 'power3.out', stagger: 0.13,
			}, 0.32);
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

	/* ─── Testimonials ──────────────────────────────────────────────────── */
	function initTestimonialsAnimation() {
		if (prefersReducedMotion || !gs() || !st()) return;
		var section = document.querySelector('.grosharp-testimonials');
		if (!section) return;

		var tl    = makeSectionTl(section);
		var cards = section.querySelectorAll('article, .gs-card, blockquote');

		addHeaderReveal(tl, section, 0);

		if (cards.length) {
			tl.from(cards, {
				y: 48, opacity: 0, scale: 0.97,
				duration: 0.9, ease: 'power3.out',
				stagger: { amount: 0.32 },
			}, 0.3);
		}
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

		if (!prefersReducedMotion) {
			cards.forEach(function (card) {
				var img     = card.querySelector('[data-gs-project-img]');
				var overlay = card.querySelector('[data-gs-project-overlay]');
				var arrow   = card.querySelector('[data-gs-project-arrow]');

				if (overlay) gs().set(overlay, { opacity: 0, y: 24 });
				if (arrow)   gs().set(arrow,   { scale: 0.7, opacity: 0 });

				card.addEventListener('mouseenter', function () {
					if (img)     gs().to(img,     { scale: 1.07, duration: 0.65, ease: 'power2.out' });
					if (overlay) gs().to(overlay, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
					if (arrow)   gs().to(arrow,   { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)', delay: 0.05 });
				});

				card.addEventListener('mouseleave', function () {
					if (img)     gs().to(img,     { scale: 1, duration: 0.65, ease: 'power2.inOut' });
					if (overlay) gs().to(overlay, { opacity: 0, y: 16, duration: 0.35, ease: 'power2.in' });
					if (arrow)   gs().to(arrow,   { scale: 0.7, opacity: 0, duration: 0.25, ease: 'power2.in' });
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

	/* ─── Boot ──────────────────────────────────────────────────────────── */
	document.addEventListener('DOMContentLoaded', function () {
		if (gs() && st()) {
			gs().registerPlugin(st());
		}

		initHeroEntrance();
		initHeroVisual();
		initLogoMarquees();
		initServicesAnimation();
		initProcessAnimation();
		initStatsAnimation();
		initTestimonialsAnimation();
		initCTAAnimation();
		initProjectCards();
		initRevealAnimations();
	});
})();
