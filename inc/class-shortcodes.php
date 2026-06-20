<?php
/**
 * Grosharp_Shortcodes
 *
 * Registers settings-driven shortcodes whose content comes from
 * grosharp_settings or WordPress theme mods — not from WP nav menus.
 *
 * Shortcodes:
 *   [grosharp_site_branding]       — logo or site-title link
 *   [grosharp_header_cta]          — header CTA button
 *   [grosharp_footer_tagline_cta]  — footer brand-column tagline + CTA
 *   [grosharp_footer_social]       — footer social icon links
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings-driven shortcodes for the Grosharp theme.
 */
final class Grosharp_Shortcodes {

	/**
	 * Social channel definitions: settings key → label + SVG icon.
	 *
	 * @var array<string, array{label: string, svg: string}>
	 */
	private const SOCIAL_CHANNELS = array(
		'social_linkedin'  => array(
			'label' => 'LinkedIn',
			'svg'   => '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
		),
		'social_x'        => array(
			'label' => 'X',
			'svg'   => '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.632 5.904-5.632z"/></svg>',
		),
		'social_instagram' => array(
			'label' => 'Instagram',
			'svg'   => '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
		),
		'social_dribbble'  => array(
			'label' => 'Dribbble',
			'svg'   => '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 6.628 5.374 12 12 12 6.628 0 12-5.372 12-12 0-6.627-5.372-12-12-12zm7.92 5.292a10.12 10.12 0 0 1 2.314 5.948c-.338-.067-3.733-.757-7.15-.327-.079-.185-.154-.375-.236-.562-.221-.517-.46-1.033-.704-1.536 3.776-1.539 5.498-3.754 5.776-3.523zM12 1.889a10.11 10.11 0 0 1 6.854 2.657c-.236.238-1.784 2.307-5.435 3.671C11.557 5.783 9.773 3.645 9.474 3.28A10.16 10.16 0 0 1 12 1.889zM7.505 4.039c.289.35 2.038 2.5 3.916 5.81-4.935 1.313-9.294 1.285-9.762 1.279a10.157 10.157 0 0 1 5.846-7.089zM1.867 12.02v-.263c.455.01 5.576.074 10.835-1.504.302.591.59 1.19.855 1.794-4.662 1.311-7.102 4.895-7.288 5.176A10.116 10.116 0 0 1 1.867 12.02zm10.134 10.093a10.124 10.124 0 0 1-6.235-2.142c.154-.266 2.014-3.523 7.122-5.113l.031-.01a35.7 35.7 0 0 1 1.845 6.548 10.129 10.129 0 0 1-2.763.717zm4.7-1.246a37.44 37.44 0 0 0-1.713-6.18c3.201-.51 6.001.327 6.35.435a10.154 10.154 0 0 1-4.637 5.745z"/></svg>',
		),
		'social_whatsapp'  => array(
			'label' => 'WhatsApp',
			'svg'   => '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.1 1.523 5.824L.057 23.7a.5.5 0 0 0 .623.602l6.044-1.588A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.9a9.855 9.855 0 0 1-5.023-1.373l-.36-.214-3.733.98.998-3.642-.235-.374A9.857 9.857 0 0 1 2.1 12C2.1 6.533 6.533 2.1 12 2.1c5.468 0 9.9 4.432 9.9 9.9 0 5.467-4.432 9.9-9.9 9.9z"/></svg>',
		),
	);

	/**
	 * Register hooks.
	 */
	public function register(): void {
		add_action( 'init', array( $this, 'register_shortcodes' ) );
	}

	/* ── Shortcode registration ─────────────────────────────────────────── */

	/**
	 * Register all settings-driven shortcodes.
	 */
	public function register_shortcodes(): void {
		add_shortcode( 'grosharp_site_branding',      array( $this, 'shortcode_site_branding' ) );
		add_shortcode( 'grosharp_header_cta',         array( $this, 'shortcode_header_cta' ) );
		add_shortcode( 'grosharp_footer_tagline_cta', array( $this, 'shortcode_footer_tagline_cta' ) );
		add_shortcode( 'grosharp_footer_social',      array( $this, 'shortcode_footer_social' ) );
		add_shortcode( 'grosharp_copyright',          array( $this, 'shortcode_copyright' ) );
	}

	/* ── Shortcode callbacks ────────────────────────────────────────────── */

	/**
	 * [grosharp_site_branding]
	 *
	 * Outputs the site logo when set; falls back to the site title as styled text.
	 *
	 * @return string
	 */
	public function shortcode_site_branding(): string {
		$logo_id  = (int) get_theme_mod( 'custom_logo' );
		$home_url = esc_url( home_url( '/' ) );

		if ( $logo_id ) {
			$img = wp_get_attachment_image(
				$logo_id,
				'full',
				false,
				array(
					'class' => 'grosharp-site-logo',
					'style' => 'max-height:32px;width:auto;display:block;',
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
			'<a href="%s" class="font-heading text-[16px] font-black text-brand-dark no-underline" rel="home">%s</a>',
			$home_url,
			esc_html( get_bloginfo( 'name' ) )
		);
	}

	/**
	 * [grosharp_header_cta]
	 *
	 * Header CTA button — label and URL from grosharp_settings.
	 *
	 * @return string
	 */
	public function shortcode_header_cta(): string {
		$gs    = $this->settings();
		$label = esc_html( $gs['cta_label'] ?? 'Start a Project' );
		$url   = esc_url( $gs['cta_url']   ?? '/contact/' );

		return sprintf(
			'<div class="hidden md:flex">'
			. '<a href="%s" class="gs-header-cta inline-flex min-h-[45px] items-center rounded-full px-5 font-body text-[14px] font-semibold text-white no-underline transition-all duration-200">%s</a>'
			. '</div>',
			$url,
			$label
		);
	}

	/**
	 * [grosharp_footer_tagline_cta]
	 *
	 * Footer brand-column tagline paragraph and CTA button from grosharp_settings.
	 *
	 * @return string
	 */
	public function shortcode_footer_tagline_cta(): string {
		$gs    = $this->settings();
		$text  = esc_html( $gs['footer_text'] ?? 'Development, design, and marketing for brands that want sharper digital growth.' );
		$label = esc_html( $gs['cta_label']   ?? 'Start a Project' );
		$url   = esc_url( $gs['cta_url']      ?? '/contact/' );

		return sprintf(
			'<p class="max-w-[400px] font-body text-base leading-relaxed text-white/50">%s</p>'
			. '<a href="%s" class="gs-btn-brand mt-9 inline-flex min-h-[52px] items-center rounded-full px-8 font-body text-[16px] font-semibold no-underline transition-all duration-200 hover:-translate-y-0.5">%s</a>',
			$text,
			$url,
			$label
		);
	}

	/**
	 * [grosharp_footer_social]
	 *
	 * Footer social icon links. Only renders icons whose URL is saved in grosharp_settings.
	 *
	 * @return string
	 */
	public function shortcode_footer_social(): string {
		$gs      = $this->settings();
		$out     = '<div class="flex items-center gap-4">';
		$has_any = false;

		foreach ( self::SOCIAL_CHANNELS as $key => $channel ) {
			$url = esc_url( $gs[ $key ] ?? '' );
			if ( ! $url ) {
				continue;
			}
			$has_any = true;
			$out    .= sprintf(
				'<a href="%s" aria-label="%s" target="_blank" rel="noopener noreferrer" '
				. 'class="text-white/35 no-underline transition-colors duration-150 hover:text-white">%s</a>',
				$url,
				esc_attr( $channel['label'] ),
				$channel['svg']
			);
		}

		$out .= '</div>';

		return $has_any ? $out : '';
	}

	/**
	 * [grosharp_copyright]
	 *
	 * Dynamic copyright line: © {year} {company_name}. All rights reserved.
	 * Year is always current; company name falls back to the site title.
	 *
	 * @return string
	 */
	public function shortcode_copyright(): string {
		$gs   = $this->settings();
		$name = esc_html( $gs['company_name'] ?? get_bloginfo( 'name' ) );
		$year = date( 'Y' ); // phpcs:ignore WordPress.DateTime.RestrictedFunctions.date_date

		return sprintf(
			'<p class="m-0 font-body text-[16px] text-white/35">&copy; %s %s. All rights reserved.</p>',
			esc_html( $year ),
			$name
		);
	}

	/* ── Private helpers ────────────────────────────────────────────────── */

	/**
	 * Returns the grosharp_settings option array (cached for the request).
	 *
	 * @return array<string, mixed>
	 */
	private function settings(): array {
		static $cache = null;

		if ( null === $cache ) {
			$cache = (array) get_option( 'grosharp_settings', array() );
		}

		return $cache;
	}
}
