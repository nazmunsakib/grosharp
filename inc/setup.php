<?php
/**
 * Theme setup.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

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
		add_editor_style( 'assets/build/css/editor.css' );

		register_nav_menus(
			array(
				'primary' => __( 'Primary Menu', 'grosharp' ),
				'footer'  => __( 'Footer Menu', 'grosharp' ),
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

