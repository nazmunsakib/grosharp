<?php
/**
 * Rank Math SEO — Grosharp integration hooks.
 *
 * Runs only when Rank Math is active. Handles:
 *  - CPT sitemap inclusion (grosharp_service, grosharp_project)
 *  - Default schema type per CPT (Service, Article)
 *  - Breadcrumb label customization for CPT archives
 *  - OG image fallback: use logo when no featured image is set
 *  - Disable Rank Math's own FAQ schema (ours in faq/render.php is richer)
 *  - Register CPT titles pattern and SEO defaults
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* Only register hooks when Rank Math is actually loaded. */
add_action( 'plugins_loaded', static function () {

	if ( ! defined( 'RANK_MATH_VERSION' ) ) {
		return;
	}

	/* ── 1. Ensure CPTs are included in Rank Math's XML sitemap ─────────── */
	/*
	 * Rank Math respects WordPress's `public` flag, but also requires CPTs
	 * to be enabled in Rank Math > Titles & Meta > {Post Type} > "Include in Sitemap".
	 * We can't force that setting via code, BUT we can ensure the sitemap
	 * generation doesn't skip them by filtering the sitemap post types list.
	 */
	add_filter( 'rank_math/sitemap/post_type', static function ( bool $include, string $post_type ): bool {
		if ( in_array( $post_type, array( 'grosharp_service', 'grosharp_project' ), true ) ) {
			return true;
		}
		return $include;
	}, 10, 2 );

	/* ── 2. Default schema type for our CPTs ────────────────────────────── */
	/*
	 * Rank Math's "Schema" metabox defaults to "Article" for custom post types.
	 * We set a better default for each CPT. Editors can still override per post.
	 */
	add_filter( 'rank_math/schema/default_type', static function ( string $type ): string {
		$post_type = get_post_type();
		if ( 'grosharp_service' === $post_type ) {
			return 'service';        // Maps to Rank Math's Service schema
		}
		if ( 'grosharp_project' === $post_type ) {
			return 'article';        // Case studies are treated as articles
		}
		return $type;
	} );

	/* ── 3. Breadcrumb labels for CPT archives ──────────────────────────── */
	add_filter( 'rank_math/breadcrumb/args', static function ( array $args ): array {
		/* Customize the "Home" crumb label to the company name */
		$settings = get_option( 'grosharp_settings', array() );
		$name     = sanitize_text_field( $settings['company_name'] ?? get_bloginfo( 'name' ) );
		if ( $name ) {
			$args['home_label'] = $name;
		}
		return $args;
	} );

	/* ── 4. OG image fallback: use logo when no featured image ──────────── */
	/*
	 * When a service or project post has no featured image, fall back to the
	 * brand logo so social shares always have an image.
	 */
	add_filter( 'rank_math/opengraph/image', static function ( string $image ): string {
		if ( $image ) {
			return $image; // Already set — don't override.
		}
		$settings = get_option( 'grosharp_settings', array() );
		$logo_id  = absint( $settings['logo_id'] ?? 0 );
		if ( $logo_id ) {
			$src = wp_get_attachment_image_src( $logo_id, 'grosharp-og' );
			if ( $src ) {
				return $src[0];
			}
		}
		return $image;
	} );

	/* ── 5. Stop Rank Math outputting its own FAQ schema ────────────────── */
	/*
	 * Our faq/render.php outputs a richer FAQPage schema with the actual block
	 * data. Rank Math's auto-detected FAQ schema targets core/faq blocks only
	 * and won't find our custom grosharp/faq block, so this is a no-op safety
	 * measure to avoid any future duplicate if Rank Math is updated.
	 */
	add_filter( 'rank_math/schema/faq/items', static function ( array $items ): array {
		/*
		 * Return empty array only if we are on a page that contains our
		 * custom FAQ block — our block already outputs the schema itself.
		 */
		if ( is_singular() && has_block( 'grosharp/faq' ) ) {
			return array();
		}
		return $items;
	} );

	/* ── 6. Rank Math title patterns for CPTs ───────────────────────────── */
	/*
	 * Sets the default title format for CPTs so Rank Math displays the
	 * right title in search results out of the box (editor can override).
	 * Format: {Post Title} {page} %sep% {Site Title}
	 */
	add_filter( 'rank_math/settings/title', static function ( array $titles ): array {
		if ( empty( $titles['pt_grosharp_service_title'] ) ) {
			$titles['pt_grosharp_service_title'] = '%title% %sep% %sitename%';
		}
		if ( empty( $titles['pt_grosharp_service_archive_title'] ) ) {
			$titles['pt_grosharp_service_archive_title'] = 'Our Services %sep% %sitename%';
		}
		if ( empty( $titles['pt_grosharp_project_title'] ) ) {
			$titles['pt_grosharp_project_title'] = '%title% Case Study %sep% %sitename%';
		}
		if ( empty( $titles['pt_grosharp_project_archive_title'] ) ) {
			$titles['pt_grosharp_project_archive_title'] = 'Case Studies %sep% %sitename%';
		}
		return $titles;
	} );

} );
