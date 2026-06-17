<?php
/**
 * Grosharp_Menus
 *
 * Registers nav-menu shortcodes and outputs the mobile overlay.
 * All content is driven by WordPress nav menus assigned to registered locations.
 *
 * Shortcodes:
 *   [grosharp_primary_nav]   — desktop pill nav + mobile hamburger
 *   [grosharp_footer_nav]    — footer column nav
 *   [grosharp_footer_legal]  — bottom-bar legal links
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles WordPress nav menus for the Grosharp theme.
 */
final class Grosharp_Menus {

	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'init',      array( $this, 'register_shortcodes' ) );
		add_action( 'wp_footer', array( $this, 'render_mobile_overlay' ) );
		add_filter( 'wp_nav_menu_objects', array( $this, 'mark_cpt_current' ), 10, 2 );
	}

	/* ── Shortcode registration ─────────────────────────────────────────── */

	/**
	 * Register all nav-menu shortcodes.
	 */
	public function register_shortcodes(): void {
		add_shortcode( 'grosharp_primary_nav',  array( $this, 'shortcode_primary_nav' ) );
		add_shortcode( 'grosharp_footer_nav',   array( $this, 'shortcode_footer_nav' ) );
		add_shortcode( 'grosharp_footer_legal', array( $this, 'shortcode_footer_legal' ) );
	}

	/* ── Shortcode callbacks ────────────────────────────────────────────── */

	/**
	 * [grosharp_primary_nav]
	 *
	 * Desktop pill nav + mobile hamburger button.
	 * Falls back to static links when no menu is assigned to "primary".
	 *
	 * @return string
	 */
	public function shortcode_primary_nav(): string {
		$fallback = $this->static_primary_links();

		$links = has_nav_menu( 'primary' )
			? (string) wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'echo'           => false,
				'fallback_cb'    => false,
				'items_wrap'     => '%3$s',
				'walker'         => new Grosharp_Primary_Nav_Walker(),
			) )
			: $fallback;

		$ham = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">'
			. '<rect y="3" width="20" height="2" rx="1" fill="currentColor"/>'
			. '<rect y="9" width="20" height="2" rx="1" fill="currentColor"/>'
			. '<rect y="15" width="20" height="2" rx="1" fill="currentColor"/>'
			. '</svg>';

		return '<nav class="hidden rounded-full bg-[#f7f5ff] px-1 py-1 lg:flex lg:items-center lg:gap-1" aria-label="Primary navigation">'
			. $links
			. '</nav>'
			. '<button id="gs-menu-open" '
			. 'class="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.09] bg-white/60 text-[#0d0d12] transition-colors hover:bg-white" '
			. 'aria-label="Open menu" aria-expanded="false" aria-controls="gs-mobile-menu">'
			. $ham
			. '</button>';
	}

	/**
	 * [grosharp_footer_nav]
	 *
	 * Footer right-column vertical nav.
	 * Falls back to static links when no menu is assigned to "footer".
	 *
	 * @return string
	 */
	public function shortcode_footer_nav(): string {
		if ( ! has_nav_menu( 'footer' ) ) {
			return '<nav class="flex flex-col gap-4 md:items-end md:pt-3" aria-label="Footer navigation">'
				. $this->static_footer_links()
				. '</nav>';
		}

		return (string) wp_nav_menu( array(
			'theme_location'       => 'footer',
			'container'            => 'nav',
			'container_class'      => 'flex flex-col gap-4 md:items-end md:pt-3',
			'container_aria_label' => 'Footer navigation',
			'echo'                 => false,
			'fallback_cb'          => false,
			'items_wrap'           => '%3$s',
			'walker'               => new Grosharp_Footer_Nav_Walker(),
		) );
	}

	/**
	 * [grosharp_footer_legal]
	 *
	 * Bottom-bar legal links (Privacy, Terms, etc.).
	 * Falls back to static links when no menu is assigned to "footer-legal".
	 *
	 * @return string
	 */
	public function shortcode_footer_legal(): string {
		if ( ! has_nav_menu( 'footer-legal' ) ) {
			return '<div class="flex items-center gap-5 font-body text-[16px] text-white/35">'
				. '<a href="/privacy-policy/" class="no-underline transition-colors duration-150 hover:text-white/70">Privacy</a>'
				. '<a href="/terms/" class="no-underline transition-colors duration-150 hover:text-white/70">Terms</a>'
				. '</div>';
		}

		return (string) wp_nav_menu( array(
			'theme_location'  => 'footer-legal',
			'container'       => 'div',
			'container_class' => 'flex items-center gap-5 font-body text-[16px] text-white/35',
			'echo'            => false,
			'fallback_cb'     => false,
			'items_wrap'      => '%3$s',
			'walker'          => new Grosharp_Footer_Legal_Walker(),
		) );
	}

	/* ── Mobile overlay ─────────────────────────────────────────────────── */

	/**
	 * Outputs the full-screen mobile menu panel via wp_footer.
	 *
	 * Must be outside the header element: backdrop-filter creates a new
	 * containing block in Chromium, which breaks position:fixed overlays.
	 */
	public function render_mobile_overlay(): void {
		$mobile_links = has_nav_menu( 'primary' )
			? (string) wp_nav_menu( array(
				'theme_location' => 'primary',
				'container'      => false,
				'echo'           => false,
				'fallback_cb'    => false,
				'items_wrap'     => '%3$s',
				'walker'         => new class extends Walker_Nav_Menu {
					public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ): void {
						$output .= sprintf(
							'<a href="%s" class="gs-mobile-nav-link">%s</a>',
							esc_url( $data_object->url ?? '#' ),
							esc_html( $data_object->title ?? '' )
						);
					}
					public function start_lvl( &$output, $depth = 0, $args = null ): void {}
					public function end_lvl( &$output, $depth = 0, $args = null ): void {}
					public function end_el( &$output, $data_object, $depth = 0, $args = null ): void {}
				},
			) )
			: '<a href="/" class="gs-mobile-nav-link">Home</a>'
				. '<a href="/services/" class="gs-mobile-nav-link">Services</a>'
				. '<a href="/case-studies/" class="gs-mobile-nav-link">Work</a>'
				. '<a href="/blog/" class="gs-mobile-nav-link">Blog</a>'
				. '<a href="/about/" class="gs-mobile-nav-link">About</a>';

		$gs      = get_option( 'grosharp_settings', array() );
		$cta_lbl = esc_html( $gs['cta_label'] ?? 'Start a Project' );
		$cta_url = esc_url( $gs['cta_url']   ?? '/contact/' );
		$brand   = $this->brand_markup( 28 );

		$close = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">'
			. '<path d="M4 4l12 12M16 4L4 16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
			. '</svg>';

		echo '<div id="gs-mobile-menu" class="gs-mobile-menu" role="dialog" aria-label="Mobile menu" aria-modal="true" aria-hidden="true">'
			. '<div class="gs-mobile-menu-panel">'

			// Top bar
			. '<div class="flex items-center justify-between px-6 py-4 border-b border-black/[0.07]">'
			. $brand
			. '<button id="gs-menu-close" '
			. 'class="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.09] text-[#0d0d12] transition-colors hover:bg-[#f4f3ff]" '
			. 'aria-label="Close menu">' . $close . '</button>'
			. '</div>'

			// Nav links
			. '<nav class="gs-mobile-menu-nav flex flex-col px-6 pt-6 pb-2" aria-label="Mobile navigation">'
			. $mobile_links
			. '</nav>'

			// CTA
			. '<div class="px-6 pt-6 pb-10">'
			. '<a href="' . $cta_url . '" '
			. 'class="flex w-full min-h-[52px] items-center justify-center rounded-full bg-[#654cff] font-body text-[16px] font-semibold text-white no-underline shadow-[0_18px_48px_rgba(101,76,255,0.38)] transition-opacity duration-200 hover:opacity-90">'
			. $cta_lbl
			. '</a>'
			. '</div>'

			. '</div>'
			. '</div>';
	}

	/**
	 * Mark CPT archive/single menu items as current when WordPress misses them.
	 *
	 * WordPress doesn't auto-set current-menu-item on custom post type pages
	 * unless the menu item links to the archive and the CPT has has_archive set.
	 * This filter catches grosharp_service and grosharp_project CPTs.
	 *
	 * @param \WP_Post[] $items  Nav menu item objects.
	 * @param \stdClass  $args   wp_nav_menu() args.
	 * @return \WP_Post[]
	 */
	public function mark_cpt_current( array $items, $args ): array {
		if ( ! is_singular() && ! is_post_type_archive() ) {
			return $items;
		}

		$post_type = get_post_type();

		/* Map CPT slug → URL patterns that should be considered "current" */
		$cpt_map = array(
			'grosharp_service' => array( '/services/', '/grosharp_service/' ),
			'grosharp_project' => array( '/case-studies/', '/work/', '/grosharp_project/' ),
		);

		$match_urls = array();
		if ( $post_type && isset( $cpt_map[ $post_type ] ) ) {
			$match_urls = $cpt_map[ $post_type ];
		}

		/* Also match when viewing an archive of these CPTs */
		if ( is_post_type_archive( array_keys( $cpt_map ) ) ) {
			$queried = get_queried_object();
			if ( $queried && isset( $cpt_map[ $queried->name ] ) ) {
				$match_urls = $cpt_map[ $queried->name ];
			}
		}

		if ( empty( $match_urls ) ) {
			return $items;
		}

		foreach ( $items as $item ) {
			if ( empty( $item->url ) ) {
				continue;
			}
			$item_path = wp_parse_url( $item->url, PHP_URL_PATH ) ?? '';
			foreach ( $match_urls as $pattern ) {
				if ( rtrim( $item_path, '/' ) === rtrim( $pattern, '/' ) ) {
					$item->current               = true;
					$item->current_item_ancestor = true;
					break;
				}
			}
		}

		return $items;
	}

	/* ── Private helpers ────────────────────────────────────────────────── */

	/**
	 * Shared brand markup (logo image or site-title text).
	 *
	 * @param int $max_height Logo image max-height in px.
	 * @return string
	 */
	private function brand_markup( int $max_height = 32 ): string {
		$logo_id  = (int) get_theme_mod( 'custom_logo' );
		$home_url = esc_url( home_url( '/' ) );

		if ( $logo_id ) {
			$img = wp_get_attachment_image(
				$logo_id,
				'full',
				false,
				array(
					'style' => "max-height:{$max_height}px;width:auto;display:block;",
					'alt'   => esc_attr( get_bloginfo( 'name' ) ),
				)
			);

			return sprintf(
				'<a href="%s" class="inline-flex items-center no-underline" rel="home">%s</a>',
				$home_url,
				$img
			);
		}

		return sprintf(
			'<a href="%s" class="font-heading text-[16px] font-black text-[#0d0d12] no-underline" rel="home">%s</a>',
			$home_url,
			esc_html( get_bloginfo( 'name' ) )
		);
	}

	/**
	 * Static fallback primary nav links.
	 *
	 * @return string
	 */
	private function static_primary_links(): string {
		$cls = 'font-body text-[15px] font-semibold text-brand-dark no-underline transition-colors duration-150 hover:text-brand-primary px-3 py-1.5';
		$links = array(
			'/'             => 'Home',
			'/services/'    => 'Services',
			'/case-studies/' => 'Work',
			'/blog/'        => 'Blog',
			'/about/'       => 'About',
		);

		$out = '';
		foreach ( $links as $url => $label ) {
			$out .= sprintf( '<a href="%s" class="%s">%s</a>', esc_url( $url ), $cls, $label );
		}

		return $out;
	}

	/**
	 * Static fallback footer nav links.
	 *
	 * @return string
	 */
	private function static_footer_links(): string {
		$cls = 'font-heading text-[17px] font-semibold text-white/55 no-underline transition-colors duration-150 hover:text-white';
		$links = array(
			'/'             => 'Home',
			'/services/'    => 'Services',
			'/case-studies/' => 'Work',
			'/about/'       => 'About',
			'/blog/'        => 'Blog',
			'/contact/'     => 'Contact',
		);

		$out = '';
		foreach ( $links as $url => $label ) {
			$out .= sprintf( '<a href="%s" class="%s">%s</a>', esc_url( $url ), $cls, $label );
		}

		return $out;
	}
}
