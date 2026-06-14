<?php
/**
 * CSS variables sourced from global Grosharp settings.
 *
 * The grosharp-core plugin will own the React settings page and save the
 * `grosharp_settings` option. The theme consumes those settings here.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

function grosharp_get_brand_settings(): array {
	$defaults = array(
		'primary_color' => '#654cff',
		'accent_color'  => '#C9A96E',
		'dark_color'    => '#09090F',
		'ink_color'     => '#111827',
		'muted_color'   => '#6B7280',
		'surface_color' => '#FFFFFF',
		'soft_color'    => '#F4F3FF',
		'heading_font'  => 'Plus Jakarta Sans',
		'body_font'     => 'DM Sans',
	);

	$settings = get_option( 'grosharp_settings', array() );

	return wp_parse_args( is_array( $settings ) ? $settings : array(), $defaults );
}

function grosharp_settings_css_block(): string {
	$settings = grosharp_get_brand_settings();
	ob_start();
	?>
	:root {
		--grosharp-primary: <?php echo esc_html( sanitize_hex_color( $settings['primary_color'] ) ?: '#2563EB' ); ?>;
		--grosharp-accent: <?php echo esc_html( sanitize_hex_color( $settings['accent_color'] ) ?: '#22C55E' ); ?>;
		--grosharp-dark: <?php echo esc_html( sanitize_hex_color( $settings['dark_color'] ) ?: '#0B1020' ); ?>;
		--grosharp-ink: <?php echo esc_html( sanitize_hex_color( $settings['ink_color'] ) ?: '#111827' ); ?>;
		--grosharp-muted: <?php echo esc_html( sanitize_hex_color( $settings['muted_color'] ) ?: '#6B7280' ); ?>;
		--grosharp-surface: <?php echo esc_html( sanitize_hex_color( $settings['surface_color'] ) ?: '#FFFFFF' ); ?>;
		--grosharp-soft: <?php echo esc_html( sanitize_hex_color( $settings['soft_color'] ) ?: '#F5F7FB' ); ?>;
		/* Brand violet — used throughout blocks and UI accents; hardcoded to match block markup */
		--grosharp-violet: #654cff;
		--grosharp-violet-soft: rgba(101, 76, 255, 0.08);
		--grosharp-violet-glow: rgba(101, 76, 255, 0.35);
		--grosharp-font-heading: <?php echo esc_html( $settings['heading_font'] ); ?>, ui-sans-serif, system-ui, sans-serif;
		--grosharp-font-body: <?php echo esc_html( $settings['body_font'] ); ?>, ui-sans-serif, system-ui, sans-serif;
	}
	<?php
	return (string) ob_get_clean();
}

add_action(
	'wp_head',
	function () {
		echo '<style id="grosharp-settings-css">' . grosharp_settings_css_block() . '</style>';
	}
);

add_action(
	'admin_head',
	function () {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}
		$screen = get_current_screen();
		if ( ! $screen || ! $screen->is_block_editor() ) {
			return;
		}
		echo '<style id="grosharp-editor-settings-css">' . grosharp_settings_css_block() . '</style>';
	}
);
