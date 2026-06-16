<?php
/**
 * Navigation Walker classes.
 *
 * Custom Walker_Nav_Menu implementations that strip the default
 * <ul><li> wrappers and output plain <a> tags with Tailwind classes.
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Desktop primary navigation walker.
 *
 * Renders each menu item as a plain <a> styled for the header pill nav.
 */
class Grosharp_Primary_Nav_Walker extends Walker_Nav_Menu {

	/**
	 * @param string        $output
	 * @param \WP_Post      $data_object
	 * @param int           $depth
	 * @param \stdClass|null $args
	 * @param int           $current_object_id
	 */
	public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ): void {
		$output .= sprintf(
			'<a href="%s" class="font-body text-[15px] font-semibold text-brand-dark no-underline transition-colors duration-150 hover:text-brand-primary px-3 py-1.5">%s</a>',
			esc_url( $data_object->url ?? '#' ),
			esc_html( $data_object->title ?? '' )
		);
	}

	public function start_lvl( &$output, $depth = 0, $args = null ): void {}
	public function end_lvl( &$output, $depth = 0, $args = null ): void {}
	public function end_el( &$output, $data_object, $depth = 0, $args = null ): void {}
}

/**
 * Footer column navigation walker.
 *
 * Renders each menu item as a plain <a> for the dark footer column.
 */
class Grosharp_Footer_Nav_Walker extends Walker_Nav_Menu {

	/**
	 * @param string        $output
	 * @param \WP_Post      $data_object
	 * @param int           $depth
	 * @param \stdClass|null $args
	 * @param int           $current_object_id
	 */
	public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ): void {
		$output .= sprintf(
			'<a href="%s" class="font-heading text-[17px] font-semibold text-white/55 no-underline transition-colors duration-150 hover:text-white">%s</a>',
			esc_url( $data_object->url ?? '#' ),
			esc_html( $data_object->title ?? '' )
		);
	}

	public function start_lvl( &$output, $depth = 0, $args = null ): void {}
	public function end_lvl( &$output, $depth = 0, $args = null ): void {}
	public function end_el( &$output, $data_object, $depth = 0, $args = null ): void {}
}

/**
 * Footer legal bar walker.
 *
 * Renders each menu item as a plain <a> for the bottom legal strip.
 */
class Grosharp_Footer_Legal_Walker extends Walker_Nav_Menu {

	/**
	 * @param string        $output
	 * @param \WP_Post      $data_object
	 * @param int           $depth
	 * @param \stdClass|null $args
	 * @param int           $current_object_id
	 */
	public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ): void {
		$output .= sprintf(
			'<a href="%s" class="no-underline transition-colors duration-150 hover:text-white/70">%s</a>',
			esc_url( $data_object->url ?? '#' ),
			esc_html( $data_object->title ?? '' )
		);
	}

	public function start_lvl( &$output, $depth = 0, $args = null ): void {}
	public function end_lvl( &$output, $depth = 0, $args = null ): void {}
	public function end_el( &$output, $data_object, $depth = 0, $args = null ): void {}
}
