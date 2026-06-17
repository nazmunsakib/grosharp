<?php
/**
 * Grosharp theme bootstrap.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'GROSHARP_THEME_VERSION', '0.1.0' );
define( 'GROSHARP_THEME_DIR', get_template_directory() );
define( 'GROSHARP_THEME_URI', get_template_directory_uri() );

require_once GROSHARP_THEME_DIR . '/inc/setup.php';
require_once GROSHARP_THEME_DIR . '/inc/assets.php';
require_once GROSHARP_THEME_DIR . '/inc/settings-css.php';
require_once GROSHARP_THEME_DIR . '/inc/class-nav-walkers.php';
require_once GROSHARP_THEME_DIR . '/inc/class-menus.php';
require_once GROSHARP_THEME_DIR . '/inc/class-shortcodes.php';

( new Grosharp_Menus() )->register();
( new Grosharp_Shortcodes() )->register();

/* ── ACF local JSON — save + load from theme/acf-json/ ─────────────────── */
add_filter( 'acf/settings/save_json', static function () {
	return get_stylesheet_directory() . '/acf-json';
} );

add_filter( 'acf/settings/load_json', static function ( array $paths ) {
	// Remove the ACF default path, add ours.
	unset( $paths[0] );
	$paths[] = get_stylesheet_directory() . '/acf-json';
	return $paths;
} );

/* ── ONE-TIME: reset saved FSE templates so theme files take over ────────── */
add_action( 'init', static function () {
	if ( get_option( 'grosharp_templates_reset_v4' ) ) return;
	global $wpdb;
	$ids = $wpdb->get_col(
		"SELECT ID FROM {$wpdb->posts}
		 WHERE post_type = 'wp_template'
		   AND post_name IN ('single','home','archive','page-contact','404')
		   AND post_status != 'auto-draft'"
	);
	foreach ( $ids as $id ) {
		wp_delete_post( (int) $id, true );
	}
	update_option( 'grosharp_templates_reset_v4', 1 );
} );

/* ── Auto-add IDs to headings for TOC anchor links ──────────────────────── */
add_filter( 'the_content', static function ( string $content ): string {
	if ( ! is_singular( 'post' ) ) {
		return $content;
	}
	$used = array();
	return preg_replace_callback(
		'/<(h[23])([^>]*)>(.*?)<\/\1>/is',
		static function ( array $m ) use ( &$used ): string {
			[ , $tag, $attrs, $inner ] = $m;
			/* Skip if already has an id */
			if ( preg_match( '/\bid=["\']/', $attrs ) ) {
				return $m[0];
			}
			$base  = sanitize_title( wp_strip_all_tags( $inner ) );
			$id    = $base;
			$count = 1;
			while ( in_array( $id, $used, true ) ) {
				$id = $base . '-' . $count++;
			}
			$used[] = $id;
			return "<{$tag}{$attrs} id=\"{$id}\">{$inner}</{$tag}>";
		},
		$content
	);
} );

