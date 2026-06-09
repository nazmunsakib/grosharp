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
		'primary_color' => '#2563EB',
		'accent_color'  => '#22C55E',
		'dark_color'    => '#0B1020',
		'ink_color'     => '#111827',
		'muted_color'   => '#6B7280',
		'surface_color' => '#FFFFFF',
		'soft_color'    => '#F5F7FB',
		'heading_font'  => 'Inter Display',
		'body_font'     => 'Switzer',
	);

	$settings = get_option( 'grosharp_settings', array() );

	return wp_parse_args( is_array( $settings ) ? $settings : array(), $defaults );
}

add_action(
	'wp_head',
	function () {
		$settings = grosharp_get_brand_settings();
		?>
		<style id="grosharp-settings-css">
			:root {
				--grosharp-primary: <?php echo esc_html( sanitize_hex_color( $settings['primary_color'] ) ?: '#2563EB' ); ?>;
				--grosharp-accent: <?php echo esc_html( sanitize_hex_color( $settings['accent_color'] ) ?: '#22C55E' ); ?>;
				--grosharp-dark: <?php echo esc_html( sanitize_hex_color( $settings['dark_color'] ) ?: '#0B1020' ); ?>;
				--grosharp-ink: <?php echo esc_html( sanitize_hex_color( $settings['ink_color'] ) ?: '#111827' ); ?>;
				--grosharp-muted: <?php echo esc_html( sanitize_hex_color( $settings['muted_color'] ) ?: '#6B7280' ); ?>;
				--grosharp-surface: <?php echo esc_html( sanitize_hex_color( $settings['surface_color'] ) ?: '#FFFFFF' ); ?>;
				--grosharp-soft: <?php echo esc_html( sanitize_hex_color( $settings['soft_color'] ) ?: '#F5F7FB' ); ?>;
				--grosharp-font-heading: <?php echo esc_html( $settings['heading_font'] ); ?>, ui-sans-serif, system-ui, sans-serif;
				--grosharp-font-body: <?php echo esc_html( $settings['body_font'] ); ?>, ui-sans-serif, system-ui, sans-serif;
			}
		</style>
		<?php
	}
);
