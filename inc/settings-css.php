<?php
/**
 * CSS variables sourced from global Grosharp settings.
 *
 * The grosharp-core plugin owns the React settings page and saves the
 * `grosharp_settings` option. The theme consumes those settings here and
 * outputs them as :root CSS custom properties on every page.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Convert a hex color string to an rgba() CSS value.
 *
 * @param string $hex   e.g. '#654cff' or '654cff'
 * @param float  $alpha 0.0 – 1.0
 * @return string e.g. 'rgba(101,76,255,0.08)'
 */
function grosharp_hex_to_rgba( string $hex, float $alpha ): string {
	$hex = ltrim( $hex, '#' );

	if ( strlen( $hex ) === 3 ) {
		$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
	}

	if ( strlen( $hex ) !== 6 ) {
		return 'rgba(0,0,0,' . $alpha . ')';
	}

	$r = hexdec( substr( $hex, 0, 2 ) );
	$g = hexdec( substr( $hex, 2, 2 ) );
	$b = hexdec( substr( $hex, 4, 2 ) );

	return 'rgba(' . $r . ',' . $g . ',' . $b . ',' . $alpha . ')';
}

/**
 * Return the merged settings array with correct defaults.
 *
 * @return array<string, mixed>
 */
function grosharp_get_brand_settings(): array {
	$defaults = array(
		'primary_color'   => '#654cff',
		'secondary_color' => '#ff6b35',
		'accent_color'    => '#C9A96E',
		'dark_color'    => '#0d0d12',
		'ink_color'     => '#3a3a4c',
		'muted_color'   => '#5c5d6d',
		'subtle_color'  => '#9a9ab0',
		'surface_color' => '#FAFAF9',
		'soft_color'    => '#F4F3FF',
		'heading_font'  => 'Plus Jakarta Sans',
		'body_font'     => 'DM Sans',
	);

	$settings = get_option( 'grosharp_settings', array() );

	return wp_parse_args( is_array( $settings ) ? $settings : array(), $defaults );
}

/**
 * Build the :root CSS variables block from settings.
 *
 * @return string CSS block (without <style> tags).
 */
function grosharp_settings_css_block(): string {
	$s = grosharp_get_brand_settings();

	// Sanitize every color value, falling back to its default.
	$primary   = sanitize_hex_color( $s['primary_color'] )   ?: '#654cff';
	$secondary = sanitize_hex_color( $s['secondary_color'] ) ?: '#ff6b35';
	$accent    = sanitize_hex_color( $s['accent_color'] )    ?: '#C9A96E';
	$dark    = sanitize_hex_color( $s['dark_color'] )    ?: '#0d0d12';
	$ink     = sanitize_hex_color( $s['ink_color'] )     ?: '#3a3a4c';
	$muted   = sanitize_hex_color( $s['muted_color'] )   ?: '#5c5d6d';
	$subtle  = sanitize_hex_color( $s['subtle_color'] )  ?: '#9a9ab0';
	$surface = sanitize_hex_color( $s['surface_color'] ) ?: '#FAFAF9';
	$soft    = sanitize_hex_color( $s['soft_color'] )    ?: '#F4F3FF';

	// Pre-compute all rgba opacity variants for the primary/violet color.
	$v = static function ( float $a ) use ( $primary ): string {
		return grosharp_hex_to_rgba( $primary, $a );
	};

	// Pre-compute secondary opacity variants.
	$sec = static function ( float $a ) use ( $secondary ): string {
		return grosharp_hex_to_rgba( $secondary, $a );
	};

	// Pre-compute dark rgba variants.
	$d = static function ( float $a ) use ( $dark ): string {
		return grosharp_hex_to_rgba( $dark, $a );
	};

	ob_start();
	?>
:root {
	/* ── Core brand colors ──────────────────────────────────────────────── */
	--grosharp-primary:       <?php echo esc_html( $primary ); ?>;
	--grosharp-secondary:     <?php echo esc_html( $secondary ); ?>;
	--grosharp-accent:        <?php echo esc_html( $accent ); ?>;

	/* ── Secondary opacity ladder ────────────────────────────────────────── */
	--grosharp-secondary-10:  <?php echo esc_html( $sec( 0.10 ) ); ?>;
	--grosharp-secondary-15:  <?php echo esc_html( $sec( 0.15 ) ); ?>;
	--grosharp-secondary-20:  <?php echo esc_html( $sec( 0.20 ) ); ?>;
	--grosharp-secondary-38:  <?php echo esc_html( $sec( 0.38 ) ); ?>;
	--grosharp-secondary-50:  <?php echo esc_html( $sec( 0.50 ) ); ?>;
	--grosharp-dark:          <?php echo esc_html( $dark ); ?>;
	--grosharp-ink:           <?php echo esc_html( $ink ); ?>;
	--grosharp-muted:         <?php echo esc_html( $muted ); ?>;
	--grosharp-subtle:        <?php echo esc_html( $subtle ); ?>;
	--grosharp-surface:       <?php echo esc_html( $surface ); ?>;
	--grosharp-soft:          <?php echo esc_html( $soft ); ?>;

	/* ── Violet (= primary) — alias used throughout blocks ─────────────── */
	--grosharp-violet:        <?php echo esc_html( $primary ); ?>;

	/* ── Primary opacity ladder (used as bg/border/shadow tints) ────────── */
	--grosharp-violet-05:     <?php echo esc_html( $v( 0.05 ) ); ?>;
	--grosharp-violet-06:     <?php echo esc_html( $v( 0.06 ) ); ?>;
	--grosharp-violet-07:     <?php echo esc_html( $v( 0.07 ) ); ?>;
	--grosharp-violet-08:     <?php echo esc_html( $v( 0.08 ) ); ?>;
	--grosharp-violet-09:     <?php echo esc_html( $v( 0.09 ) ); ?>;
	--grosharp-violet-10:     <?php echo esc_html( $v( 0.10 ) ); ?>;
	--grosharp-violet-12:     <?php echo esc_html( $v( 0.12 ) ); ?>;
	--grosharp-violet-13:     <?php echo esc_html( $v( 0.13 ) ); ?>;
	--grosharp-violet-14:     <?php echo esc_html( $v( 0.14 ) ); ?>;
	--grosharp-violet-15:     <?php echo esc_html( $v( 0.15 ) ); ?>;
	--grosharp-violet-18:     <?php echo esc_html( $v( 0.18 ) ); ?>;
	--grosharp-violet-20:     <?php echo esc_html( $v( 0.20 ) ); ?>;
	--grosharp-violet-25:     <?php echo esc_html( $v( 0.25 ) ); ?>;
	--grosharp-violet-28:     <?php echo esc_html( $v( 0.28 ) ); ?>;
	--grosharp-violet-32:     <?php echo esc_html( $v( 0.32 ) ); ?>;
	--grosharp-violet-35:     <?php echo esc_html( $v( 0.35 ) ); ?>;
	--grosharp-violet-38:     <?php echo esc_html( $v( 0.38 ) ); ?>;
	--grosharp-violet-40:     <?php echo esc_html( $v( 0.40 ) ); ?>;
	--grosharp-violet-45:     <?php echo esc_html( $v( 0.45 ) ); ?>;
	--grosharp-violet-50:     <?php echo esc_html( $v( 0.50 ) ); ?>;
	--grosharp-violet-55:     <?php echo esc_html( $v( 0.55 ) ); ?>;
	--grosharp-violet-80:     <?php echo esc_html( $v( 0.80 ) ); ?>;

	/* ── Semantic aliases (Tailwind brand tokens reference these) ────────── */
	--grosharp-violet-soft:   <?php echo esc_html( $v( 0.08 ) ); ?>;
	--grosharp-violet-glow:   <?php echo esc_html( $v( 0.35 ) ); ?>;

	/* ── Dark opacity ladder ─────────────────────────────────────────────── */
	--grosharp-dark-08:       <?php echo esc_html( $d( 0.08 ) ); ?>;

	/* ── Typography ──────────────────────────────────────────────────────── */
	--grosharp-font-heading:  <?php echo esc_html( $s['heading_font'] ); ?>, ui-sans-serif, system-ui, sans-serif;
	--grosharp-font-body:     <?php echo esc_html( $s['body_font'] ); ?>, ui-sans-serif, system-ui, sans-serif;
}
	<?php
	return (string) ob_get_clean();
}

add_action(
	'wp_head',
	function () {
		echo '<style id="grosharp-settings-css">' . grosharp_settings_css_block() . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	},
	5
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
		echo '<style id="grosharp-editor-settings-css">' . grosharp_settings_css_block() . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	},
	5
);
