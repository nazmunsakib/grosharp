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
require_once GROSHARP_THEME_DIR . '/inc/menus.php';

