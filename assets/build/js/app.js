(function () {
	'use strict';

	var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function initRevealAnimations() {
		if (prefersReducedMotion || !window.gsap) {
			document.querySelectorAll('.gs-reveal').forEach(function (element) {
				element.style.opacity = '1';
				element.style.transform = 'none';
			});
			return;
		}

		if (window.ScrollTrigger) {
			window.gsap.registerPlugin(window.ScrollTrigger);
		}

		window.gsap.utils.toArray('.gs-reveal').forEach(function (element) {
			window.gsap.to(element, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'power3.out',
				scrollTrigger: window.ScrollTrigger
					? {
							trigger: element,
							start: 'top 84%',
							once: true
						}
					: null
			});
		});
	}

	function initHeroMotion() {
		var visual = document.querySelector('[data-gs-hero-visual]');

		if (prefersReducedMotion || !visual || !window.gsap) {
			return;
		}

		window.gsap.to(visual, {
			y: -14,
			duration: 3.5,
			ease: 'sine.inOut',
			repeat: -1,
			yoyo: true
		});
	}

	function initLogoMarquees() {
		if (prefersReducedMotion || !window.gsap) {
			return;
		}

		document.querySelectorAll('[data-gs-logo-marquee]').forEach(function (marquee) {
			var track = marquee.querySelector('[data-gs-logo-track]');

			if (!track) {
				return;
			}

			var distance = track.scrollWidth / 2;
			var speed = parseFloat(marquee.getAttribute('data-speed')) || 42;

			if (!distance) {
				return;
			}

			window.gsap.set(track, { x: 0 });
			window.gsap.to(track, {
				x: -distance,
				duration: Math.max(distance / speed, 12),
				ease: 'none',
				repeat: -1,
				modifiers: {
					x: function (value) {
						return (parseFloat(value) % distance) + 'px';
					}
				}
			});
		});
	}

	document.addEventListener('DOMContentLoaded', function () {
		initRevealAnimations();
		initHeroMotion();
		initLogoMarquees();
	});
})();
