<?php
/**
 * Theme setup.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ── Disable WordPress emoji scripts + DNS prefetch ─────────────────────── */
remove_action( 'wp_head',             'print_emoji_detection_script', 7 );
remove_action( 'admin_print_scripts', 'print_emoji_detection_script'    );
remove_action( 'wp_print_styles',     'print_emoji_styles'              );
remove_action( 'admin_print_styles',  'print_emoji_styles'              );
remove_filter( 'the_content_feed',    'wp_staticize_emoji'              );
remove_filter( 'comment_text_rss',    'wp_staticize_emoji'              );
remove_filter( 'wp_mail',            'wp_staticize_emoji_for_email'    );
add_filter( 'emoji_svg_url', '__return_false' );
add_filter( 'wp_resource_hints', static function ( $hints, $relation_type ) {
	if ( 'dns-prefetch' === $relation_type ) {
		$hints = array_filter( $hints, static function ( $h ) {
			$url = is_array( $h ) ? ( $h['href'] ?? '' ) : $h;
			return strpos( $url, 'emoji' ) === false && strpos( $url, 's.w.org' ) === false;
		} );
	}
	return $hints;
}, 10, 2 );

add_action(
	'after_setup_theme',
	function () {
		load_theme_textdomain( 'grosharp', GROSHARP_THEME_DIR . '/languages' );

		add_theme_support( 'wp-block-styles' );
		add_theme_support( 'editor-styles' );
		add_theme_support( 'responsive-embeds' );
		add_theme_support( 'title-tag' );
		add_theme_support( 'post-thumbnails' );
		add_theme_support( 'custom-logo' );
		add_editor_style( 'assets/build/css/app.css' );
		add_editor_style( 'assets/build/css/editor.css' );

		register_nav_menus(
			array(
				'primary'      => __( 'Primary Menu', 'grosharp' ),
				'footer'       => __( 'Footer Menu', 'grosharp' ),
				'footer-legal' => __( 'Footer Legal Menu', 'grosharp' ),
			)
		);
	}
);

add_filter(
	'block_editor_settings_all',
	function ( $settings ) {
		$settings['alignWide'] = true;

		return $settings;
	}
);

