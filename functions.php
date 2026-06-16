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

