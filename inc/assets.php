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
			'grosharp-fonts',
			'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap',
			array(),
			null
		);

		wp_enqueue_style(
			'grosharp-style',
			GROSHARP_THEME_URI . '/assets/build/css/app.css',
			array(),
			grosharp_asset_version( 'assets/build/css/app.css' )
		);

		wp_enqueue_style(
			'lenis',
			'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.css',
			array(),
			'1.1.20'
		);

		wp_enqueue_script(
			'lenis',
			'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js',
			array(),
			'1.1.20',
			true
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
			array( 'lenis', 'gsap', 'gsap-scrolltrigger' ),
			grosharp_asset_version( 'assets/build/js/app.js' ),
			true
		);
	}
);

add_action(
	'enqueue_block_editor_assets',
	function () {
		wp_enqueue_style(
			'grosharp-fonts-editor',
			'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,600;1,700&family=Inter:wght@400;500;600;700&display=swap',
			array(),
			null
		);

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

