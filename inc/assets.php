<?php
/**
 * Theme assets.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function grosharp_asset_version( string $relative_path ): string {
	$path = GROSHARP_THEME_DIR . '/' . ltrim( $relative_path, '/' );

	return file_exists( $path ) ? (string) filemtime( $path ) : GROSHARP_THEME_VERSION;
}

add_action(
	'wp_enqueue_scripts',
	function () {
		wp_enqueue_style(
			'grosharp-style',
			GROSHARP_THEME_URI . '/assets/build/css/app.css',
			array(),
			grosharp_asset_version( 'assets/build/css/app.css' )
		);

		wp_enqueue_script(
			'gsap',
			'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
			array(),
			'3.12.5',
			true
		);

		wp_enqueue_script(
			'gsap-scrolltrigger',
			'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js',
			array( 'gsap' ),
			'3.12.5',
			true
		);

		wp_enqueue_script(
			'grosharp-app',
			GROSHARP_THEME_URI . '/assets/build/js/app.js',
			array( 'gsap', 'gsap-scrolltrigger' ),
			grosharp_asset_version( 'assets/build/js/app.js' ),
			true
		);
	}
);

add_action(
	'enqueue_block_editor_assets',
	function () {
		wp_enqueue_style(
			'grosharp-editor',
			GROSHARP_THEME_URI . '/assets/build/css/editor.css',
			array(),
			grosharp_asset_version( 'assets/build/css/editor.css' )
		);

		wp_enqueue_script(
			'grosharp-editor',
			GROSHARP_THEME_URI . '/assets/build/js/editor.js',
			array( 'wp-dom-ready' ),
			grosharp_asset_version( 'assets/build/js/editor.js' ),
			true
		);
	}
);

