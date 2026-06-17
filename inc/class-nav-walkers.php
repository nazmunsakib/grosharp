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
 * Desktop primary navigation walker — premium split mega menu.
 *
 * AUTO MODE (Services mega menu)
 * ───────────────────────────────
 * When a top-level item links to the grosharp_service CPT archive (or has the
 * CSS class `gs-services-mega`), the panel is built automatically from all
 * published grosharp_service posts — no manual child items needed.
 * Data per service: title, excerpt (→ preview blurb), featured image (→ preview
 * image), permalink. Add services in Posts → Services; add excerpt in the
 * Excerpt field; set a featured image for the thumbnail.
 *
 * MANUAL MODE (any other dropdown)
 * ──────────────────────────────────
 * Any top-level item with standard WordPress child menu items (dragged under it
 * in Appearance → Menus) renders as a dropdown with the same split layout.
 * Description field (Screen Options → Description) provides the preview blurb.
 * Featured image of the linked post provides the preview image.
 */
class Grosharp_Primary_Nav_Walker extends Walker_Nav_Menu {

	/** @var bool Whether the current depth-0 item opened a dropdown panel. */
	private bool $in_dropdown = false;

	/** @var bool True when the current dropdown was auto-built from CPT data (Services mega). */
	private bool $is_auto = false;

	/** @var bool True when the current dropdown is a plain simple list (non-Services). */
	private bool $is_simple = false;

	/** @var int Counter for unique panel / preview IDs. */
	private int $dropdown_index = 0;

	/** @var int Counter for manual child items within the current dropdown. */
	private int $child_index = 0;

	/** @var string Buffer for right-column preview panes (unused in simple mode). */
	private string $preview_buffer = '';

	/* ── Shared SVG assets ─────────────────────────────────────────────── */

	private function arrow_svg(): string {
		return '<svg class="gs-mega-nav-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">'
			. '<path d="M2.5 7h9M8 3.5L11.5 7 8 10.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>'
			. '</svg>';
	}

	private function placeholder_img(): string {
		return '<div class="gs-mega-preview-placeholder">'
			. '<svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">'
			. '<rect width="56" height="56" rx="16" fill="rgba(101,76,255,0.1)"/>'
			. '<path d="M14 42l10-13 7 9 6-7 9 11H14z" fill="#654cff" opacity="0.35"/>'
			. '<circle cx="36" cy="20" r="5" fill="#654cff" opacity="0.5"/>'
			. '</svg>'
			. '</div>';
	}

	/* ── Auto-build: query CPT and return complete card-grid panel HTML ── */

	/**
	 * Build the services mega menu panel from live CPT data.
	 *
	 * Layout: header strip (label + "View all") + 3-column card grid.
	 * Split layout: left column = service list, right column = preview pane per service.
	 * Hovering a left item (JS activateItem) swaps the visible right pane.
	 * Each preview pane: linked thumbnail, linked title, detail text, "Explore Service" CTA.
	 *
	 * @param string $label        Section label shown above the left list.
	 * @param string $view_all_url "All Services" link in the left header.
	 * @param int    $index        Walker dropdown counter (for unique IDs).
	 * @return string Complete panel HTML, or '' when no services are published.
	 */
	private function build_services_panel( string $label, string $view_all_url, int $index ): string {
		$services = get_posts( array(
			'post_type'      => 'grosharp_service',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'menu_order',
			'order'          => 'ASC',
			'no_found_rows'  => true,
		) );

		if ( empty( $services ) ) {
			return '';
		}

		$acf       = function_exists( 'get_field' );
		$nav_items = '';
		$panes     = '';

		foreach ( $services as $i => $service ) {
			$svc_url   = (string) get_permalink( $service->ID );
			$svc_title = $service->post_title;
			$img_url   = (string) get_the_post_thumbnail_url( $service->ID, 'large' );

			/* Detail text: ACF service_detail_text → excerpt → trimmed content */
			$detail = $acf
				? (string) get_field( 'service_detail_text', $service->ID )
				: (string) get_post_meta( $service->ID, 'service_detail_text', true );
			if ( ! $detail ) {
				$detail = trim( $service->post_excerpt );
			}
			if ( ! $detail && $service->post_content ) {
				$detail = wp_trim_words( wp_strip_all_tags( $service->post_content ), 16 );
			}

			/* ── Left nav item ── */
			$active_nav = 0 === $i ? ' is-active' : '';
			$nav_items .= '<a href="' . esc_url( $svc_url ) . '" class="gs-mega-nav-item' . $active_nav . '"'
				. ' data-index="' . $i . '" role="tab" aria-selected="' . ( 0 === $i ? 'true' : 'false' ) . '">'
				. '<span class="gs-mega-nav-dot"></span>'
				. '<span class="gs-mega-nav-title">' . esc_html( $svc_title ) . '</span>'
				. '<span class="gs-mega-nav-arrow" aria-hidden="true">→</span>'
				. '</a>';

			/* ── Right preview pane ── */
			$thumb_inner = $img_url
				? '<img src="' . esc_url( $img_url ) . '" alt="' . esc_attr( $svc_title ) . '" loading="lazy" />'
				: $this->placeholder_img();

			$active_pane = 0 === $i ? ' is-active' : '';
			$hidden_attr = 0 === $i ? 'false' : 'true';

			$panes .= '<div class="gs-mega-preview-pane' . $active_pane . '" data-index="' . $i . '" aria-hidden="' . $hidden_attr . '">';

			/* Linked thumbnail */
			$panes .= '<a href="' . esc_url( $svc_url ) . '" class="gs-mega-preview-img" tabindex="-1" aria-hidden="true">'
				. '<div class="gs-mega-preview-img-inner">' . $thumb_inner . '</div>'
				. '</a>';

			/* Text area */
			$panes .= '<div class="gs-mega-preview-body">';
			$panes .= '<p class="gs-mega-preview-tag">' . esc_html__( 'Service', 'grosharp' ) . '</p>';
			$panes .= '<a href="' . esc_url( $svc_url ) . '" class="gs-mega-preview-title">'
				. esc_html( $svc_title ) . '</a>';
			if ( $detail ) {
				$panes .= '<p class="gs-mega-preview-desc">' . esc_html( $detail ) . '</p>';
			}
			$panes .= '<a href="' . esc_url( $svc_url ) . '" class="gs-mega-explore">'
				. esc_html__( 'Explore Service', 'grosharp' )
				. ' <span aria-hidden="true">→</span></a>';
			$panes .= '</div>'; /* /gs-mega-preview-body */

			$panes .= '</div>'; /* /gs-mega-preview-pane */
		}

		/* ── Panel shell ── */
		$panel  = '<div class="gs-mega-panel" id="gs-mega-panel-' . $index . '" role="region" aria-hidden="true">';
		$panel .= '<div class="gs-mega-split">';

		/* Left column */
		$panel .= '<div class="gs-mega-nav" role="tablist">';
		$panel .= '<div class="gs-mega-nav-head">'
			. '<p class="gs-mega-label">' . esc_html( $label ) . '</p>'
			. '<a href="' . esc_url( $view_all_url ) . '" class="gs-mega-all">'
			. esc_html__( 'All Services', 'grosharp' )
			. ' <span aria-hidden="true">→</span></a>'
			. '</div>';
		$panel .= $nav_items;
		$panel .= '</div>'; /* /gs-mega-nav */

		/* Right column */
		$panel .= '<div class="gs-mega-preview">' . $panes . '</div>';

		$panel .= '</div>'; /* /gs-mega-split */
		$panel .= '</div>'; /* /gs-mega-panel */

		return $panel;
	}

	/* ── Walker callbacks ──────────────────────────────────────────────── */

	public function start_el( &$output, $data_object, $depth = 0, $args = null, $current_object_id = 0 ): void {
		$url          = $data_object->url ?? '#';
		$title        = $data_object->title ?? '';
		$classes      = (array) ( $data_object->classes ?? array() );
		$has_children = in_array( 'menu-item-has-children', $classes, true );
		$is_current   = ! empty( $data_object->current ) || ! empty( $data_object->current_item_ancestor );

		/* ── Depth 0 — top-level nav items ─────────────────────────── */
		if ( $depth === 0 ) {
			$color = $is_current ? 'text-[#654cff]' : 'text-brand-dark hover:text-brand-primary';

			/* Detect Services auto-mode: matches CPT archive URL or custom class */
			$archive_link = (string) get_post_type_archive_link( 'grosharp_service' );
			$item_path    = rtrim( wp_parse_url( $url, PHP_URL_PATH ) ?? '', '/' );
			$archive_path = $archive_link
				? rtrim( wp_parse_url( $archive_link, PHP_URL_PATH ) ?? '/services', '/' )
				: '/services';
			$is_auto_svc  = ( $item_path === $archive_path )
				|| in_array( 'gs-services-mega', $classes, true );

			if ( $is_auto_svc ) {
				/* ── AUTO MODE: build panel directly from CPT ─── */
				$this->dropdown_index++;
				$panel_html = $this->build_services_panel( $title, $url, $this->dropdown_index );

				if ( $panel_html ) {
					$panel_id = 'gs-mega-panel-' . $this->dropdown_index;
					$chevron  = '<svg class="gs-dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">'
						. '<path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
						. '</svg>';

					$output .= '<div class="gs-dropdown-item">';
					$output .= sprintf(
						'<button class="gs-dropdown-trigger font-body text-[15px] font-semibold %s px-3 py-1.5 flex items-center gap-1.5" '
						. 'aria-expanded="false" aria-controls="%s" aria-haspopup="true">%s%s</button>',
						esc_attr( $color ),
						esc_attr( $panel_id ),
						esc_html( $title ),
						$chevron
					);
					$output .= $panel_html;

					$this->in_dropdown = true;
					$this->is_auto     = true;
				} else {
					/* No services published yet — render as a plain link */
					$this->in_dropdown = false;
					$this->is_auto     = false;
					$output .= sprintf(
						'<a href="%s" class="font-body text-[15px] font-semibold %s no-underline transition-colors duration-150 px-3 py-1.5">%s</a>',
						esc_url( $url ),
						esc_attr( $color ),
						esc_html( $title )
					);
				}

			} elseif ( $has_children ) {
				/* ── MANUAL MODE: plain simple dropdown list ─── */
				$this->in_dropdown    = true;
				$this->is_auto        = false;
				$this->is_simple      = true;
				$this->dropdown_index++;
				$this->child_index    = 0;
				$this->preview_buffer = '';
				$panel_id             = 'gs-simple-drop-' . $this->dropdown_index;

				$chevron = '<svg class="gs-dropdown-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">'
					. '<path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>'
					. '</svg>';

				$output .= '<div class="gs-simple-item">';
				$output .= sprintf(
					'<button class="gs-dropdown-trigger font-body text-[15px] font-semibold %s px-3 py-1.5 flex items-center gap-1.5" '
					. 'aria-expanded="false" aria-controls="%s" aria-haspopup="true">%s%s</button>',
					esc_attr( $color ),
					esc_attr( $panel_id ),
					esc_html( $title ),
					$chevron
				);

				$output .= '<div class="gs-simple-dropdown" id="' . esc_attr( $panel_id ) . '" role="menu" aria-hidden="true">';
				$output .= '<ul class="gs-simple-dropdown-list">';

			} else {
				/* ── Plain link ──────────────────────────────── */
				$this->in_dropdown = false;
				$this->is_auto     = false;
				$output .= sprintf(
					'<a href="%s" class="font-body text-[15px] font-semibold %s no-underline transition-colors duration-150 px-3 py-1.5">%s</a>',
					esc_url( $url ),
					esc_attr( $color ),
					esc_html( $title )
				);
			}

		/* ── Depth 1 ────────────────────────────────────────────────── */
		} elseif ( $depth === 1 ) {

			/* Auto mode (Services mega): CPT panel already fully built — skip */
			if ( $this->is_auto ) {
				return;
			}

			/* Simple mode: plain linked list item */
			$is_current_child = ! empty( $data_object->current );
			$link_class       = 'gs-simple-dropdown-link' . ( $is_current_child ? ' is-active' : '' );

			$output .= '<li role="none">';
			$output .= sprintf(
				'<a href="%s" class="%s" role="menuitem">%s</a>',
				esc_url( $url ),
				esc_attr( $link_class ),
				esc_html( $title )
			);
			$output .= '</li>';

			$this->child_index++;
		}
	}

	/** start_lvl: nav items stream inline — nothing needed here. */
	public function start_lvl( &$output, $depth = 0, $args = null ): void {}

	/**
	 * end_lvl at depth=0:
	 * - Auto mode  : panel already fully built inline — nothing to close here.
	 * - Simple mode: close </ul></div> for the simple dropdown list.
	 */
	public function end_lvl( &$output, $depth = 0, $args = null ): void {
		if ( $depth !== 0 ) {
			return;
		}

		if ( $this->is_simple ) {
			$output .= '</ul>';           /* /gs-simple-dropdown-list */
			$output .= '</div>';          /* /gs-simple-dropdown */
		}
		/* Auto mode: panel HTML was already closed inside build_services_panel() */
	}

	/** end_el at depth=0: close the correct wrapper element. */
	public function end_el( &$output, $data_object, $depth = 0, $args = null ): void {
		if ( $depth === 0 && $this->in_dropdown ) {
			$output .= '</div>'; /* /gs-dropdown-item OR /gs-simple-item */
			$this->in_dropdown = false;
			$this->is_auto     = false;
			$this->is_simple   = false;
		}
	}
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
