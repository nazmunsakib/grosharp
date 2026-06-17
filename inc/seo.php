<?php
/**
 * Grosharp SEO + GEO layer.
 *
 * When Rank Math is active it handles: meta description, canonical, Open Graph,
 * Twitter Card, robots, Organization, WebSite, BreadcrumbList, WebPage, Article.
 * We skip all of those and only output the schemas Rank Math doesn't cover:
 *   - ProfessionalService / LocalBusiness (home page)
 *   - Service with hasOfferCatalog from ACF (single service)
 *   - ItemList (services archive)
 *
 * When Rank Math is NOT active we output everything ourselves.
 *
 * FAQPage schema is output inline by faq/render.php (body placement is fine
 * — Google accepts JSON-LD anywhere in the document).
 *
 * @package Grosharp
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Grosharp_SEO
 */
final class Grosharp_SEO {

	/** @var array<string,mixed> Merged grosharp_settings + WP defaults */
	private array $s;

	/** @var string Site home URL with trailing slash */
	private string $home;

	/** @var bool True when Rank Math plugin is active */
	private bool $rm;

	public function __construct() {
		$saved      = get_option( 'grosharp_settings', array() );
		$this->s    = wp_parse_args( $saved, array(
			'company_name'     => get_bloginfo( 'name' ),
			'tagline'          => get_bloginfo( 'description' ),
			'email'            => '',
			'phone'            => '',
			'address'          => '',
			'working_hours'    => '',
			'logo_id'          => 0,
			'social_linkedin'  => '',
			'social_instagram' => '',
			'social_x'         => '',
			'social_dribbble'  => '',
			'social_whatsapp'  => '',
		) );
		$this->home = trailingslashit( home_url() );
		$this->rm   = defined( 'RANK_MATH_VERSION' );
	}

	/** Register wp_head hook. */
	public function register(): void {
		add_action( 'wp_head', array( $this, 'output' ), 2 );
	}

	/** Master output — called once per request on wp_head. */
	public function output(): void {
		/*
		 * When Rank Math is active it already outputs:
		 *   meta description, canonical, robots, Open Graph, Twitter Card,
		 *   Organization, WebSite, BreadcrumbList, WebPage, Article schemas.
		 * We only run those when Rank Math is NOT present.
		 */
		if ( ! $this->rm ) {
			$this->meta_tags();
			echo "\n";
			$this->schema_global();
		}

		/* These schemas are always output — Rank Math doesn't cover them. */
		$this->schema_custom();
	}

	/* ════════════════════════════════════════════════════════════════════════
	 * META TAGS  (only when Rank Math is not active)
	 * ════════════════════════════════════════════════════════════════════════ */

	private function meta_tags(): void {
		$description = $this->get_description();
		$canonical   = $this->get_canonical();
		$og_image    = $this->get_og_image();
		$og_type     = $this->get_og_type();
		$title       = $this->get_seo_title();

		/* Robots */
		if ( is_404() || is_search() || is_author() ) {
			echo '<meta name="robots" content="noindex, follow">' . "\n";
		} else {
			echo '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">' . "\n";
		}

		/* Meta description */
		if ( $description ) {
			echo '<meta name="description" content="' . esc_attr( $description ) . '">' . "\n";
		}

		/* Canonical */
		if ( $canonical ) {
			echo '<link rel="canonical" href="' . esc_url( $canonical ) . '">' . "\n";
		}

		/* Open Graph */
		echo '<meta property="og:site_name" content="' . esc_attr( $this->s['company_name'] ) . '">' . "\n";
		echo '<meta property="og:locale" content="en_US">' . "\n";
		echo '<meta property="og:type" content="' . esc_attr( $og_type ) . '">' . "\n";
		echo '<meta property="og:title" content="' . esc_attr( $title ) . '">' . "\n";
		if ( $description ) {
			echo '<meta property="og:description" content="' . esc_attr( $description ) . '">' . "\n";
		}
		if ( $canonical ) {
			echo '<meta property="og:url" content="' . esc_url( $canonical ) . '">' . "\n";
		}
		if ( $og_image ) {
			echo '<meta property="og:image" content="' . esc_url( $og_image['url'] ) . '">' . "\n";
			echo '<meta property="og:image:width" content="' . esc_attr( $og_image['width'] ) . '">' . "\n";
			echo '<meta property="og:image:height" content="' . esc_attr( $og_image['height'] ) . '">' . "\n";
			echo '<meta property="og:image:alt" content="' . esc_attr( $og_image['alt'] ) . '">' . "\n";
		}
		if ( is_singular( 'post' ) ) {
			echo '<meta property="article:published_time" content="' . esc_attr( get_the_date( 'c' ) ) . '">' . "\n";
			echo '<meta property="article:modified_time" content="' . esc_attr( get_the_modified_date( 'c' ) ) . '">' . "\n";
		}

		/* Twitter Card */
		echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
		echo '<meta name="twitter:title" content="' . esc_attr( $title ) . '">' . "\n";
		if ( $description ) {
			echo '<meta name="twitter:description" content="' . esc_attr( $description ) . '">' . "\n";
		}
		if ( $og_image ) {
			echo '<meta name="twitter:image" content="' . esc_url( $og_image['url'] ) . '">' . "\n";
			echo '<meta name="twitter:image:alt" content="' . esc_attr( $og_image['alt'] ) . '">' . "\n";
		}
	}

	/* ════════════════════════════════════════════════════════════════════════
	 * GLOBAL SCHEMA  (only when Rank Math is not active)
	 * ════════════════════════════════════════════════════════════════════════ */

	private function schema_global(): void {
		/* Organization */
		$org = array(
			'@type'       => 'Organization',
			'@id'         => $this->home . '#organization',
			'name'        => $this->s['company_name'],
			'url'         => $this->home,
			'description' => $this->s['tagline'],
			'logo'        => $this->get_logo_schema(),
		);
		if ( $this->s['email'] || $this->s['phone'] ) {
			$org['contactPoint'] = array(
				'@type'             => 'ContactPoint',
				'contactType'       => 'customer service',
				'availableLanguage' => 'English',
			);
			if ( $this->s['email'] ) {
				$org['contactPoint']['email'] = sanitize_email( $this->s['email'] );
			}
			if ( $this->s['phone'] ) {
				$org['contactPoint']['telephone'] = sanitize_text_field( $this->s['phone'] );
			}
		}
		if ( $this->s['address'] ) {
			$org['address'] = array(
				'@type'         => 'PostalAddress',
				'streetAddress' => sanitize_text_field( $this->s['address'] ),
			);
		}
		$same_as = array_values( array_filter( array(
			$this->s['social_linkedin'],
			$this->s['social_instagram'],
			$this->s['social_x'],
			$this->s['social_dribbble'],
		) ) );
		if ( $same_as ) {
			$org['sameAs'] = $same_as;
		}
		$this->output_schema( $org );

		/* WebSite + SearchAction */
		$this->output_schema( array(
			'@type'           => 'WebSite',
			'@id'             => $this->home . '#website',
			'url'             => $this->home,
			'name'            => $this->s['company_name'],
			'description'     => $this->s['tagline'],
			'publisher'       => array( '@id' => $this->home . '#organization' ),
			'potentialAction' => array(
				'@type'       => 'SearchAction',
				'target'      => array(
					'@type'       => 'EntryPoint',
					'urlTemplate' => $this->home . '?s={search_term_string}',
				),
				'query-input' => 'required name=search_term_string',
			),
		) );

		/* Breadcrumb + WebPage + Article for non-Rank Math fallback */
		if ( ! is_front_page() ) {
			$this->schema_breadcrumb();
		}
		if ( is_singular( 'post' ) ) {
			$this->schema_article();
		} elseif ( ! is_front_page() ) {
			$this->schema_webpage();
		}
	}

	/* ════════════════════════════════════════════════════════════════════════
	 * CUSTOM SCHEMAS  (always — Rank Math doesn't cover these)
	 * ════════════════════════════════════════════════════════════════════════ */

	private function schema_custom(): void {
		if ( is_front_page() ) {
			$this->schema_home();
		} elseif ( is_singular( 'grosharp_service' ) ) {
			$this->schema_service();
		} elseif ( is_post_type_archive( 'grosharp_service' ) ) {
			$this->schema_services_list();
		}
	}

	/* ── Home: ProfessionalService / LocalBusiness ──────────────────────── */
	private function schema_home(): void {
		$schema = array(
			'@type'       => array( 'ProfessionalService', 'LocalBusiness' ),
			'@id'         => $this->home . '#business',
			'name'        => $this->s['company_name'],
			'url'         => $this->home,
			'description' => $this->s['tagline'],
			'priceRange'  => '$$',
			'serviceType' => array(
				'UI/UX Design', 'Web Design', 'WordPress Development',
				'WooCommerce Development', 'Custom Plugin Development',
				'Ecommerce Solutions', 'Brand Identity', 'SEO',
				'Digital Marketing', 'Automation',
			),
			'knowsAbout'  => array(
				'WordPress', 'WooCommerce', 'Gutenberg', 'React', 'Next.js',
				'UI/UX Design', 'Brand Identity', 'SEO', 'Digital Marketing',
			),
			'logo'        => $this->get_logo_schema(),
			'parentOrganization' => array( '@id' => $this->home . '#organization' ),
			'areaServed'  => 'Worldwide',
		);
		if ( $this->s['email'] ) {
			$schema['email'] = sanitize_email( $this->s['email'] );
		}
		if ( $this->s['phone'] ) {
			$schema['telephone'] = sanitize_text_field( $this->s['phone'] );
		}
		if ( $this->s['address'] ) {
			$schema['address'] = array(
				'@type'         => 'PostalAddress',
				'streetAddress' => sanitize_text_field( $this->s['address'] ),
			);
		}
		if ( ! empty( $this->s['working_hours'] ) ) {
			$schema['openingHours'] = sanitize_text_field( $this->s['working_hours'] );
		}
		$same_as = array_values( array_filter( array(
			$this->s['social_linkedin'],
			$this->s['social_instagram'],
			$this->s['social_x'],
			$this->s['social_dribbble'],
		) ) );
		if ( $same_as ) {
			$schema['sameAs'] = $same_as;
		}
		$this->output_schema( $schema );
	}

	/* ── Single Service: Service schema with ACF features ──────────────── */
	private function schema_service(): void {
		$post_id   = get_queried_object_id();
		$title     = get_the_title( $post_id );
		$excerpt   = wp_strip_all_tags( get_the_excerpt( $post_id ) );
		$permalink = get_permalink( $post_id );
		$thumb_url = get_the_post_thumbnail_url( $post_id, 'grosharp-og' );

		$acf          = function_exists( 'get_field' );
		$features_raw = $acf
			? (string) get_field( 'service_key_features', $post_id )
			: (string) get_post_meta( $post_id, 'service_key_features', true );
		$features     = array_values( array_filter( array_map( 'trim', explode( "\n", $features_raw ) ) ) );

		$schema = array(
			'@type'       => 'Service',
			'@id'         => $permalink . '#service',
			'name'        => $title,
			'url'         => $permalink,
			'description' => $excerpt ?: $this->s['tagline'],
			'provider'    => array( '@id' => $this->home . '#organization' ),
			'serviceType' => $title,
			'areaServed'  => 'Worldwide',
		);
		if ( $features ) {
			$schema['hasOfferCatalog'] = array(
				'@type'           => 'OfferCatalog',
				'name'            => $title . ' — What\'s Included',
				'itemListElement' => array_map( static function ( $f ) {
					return array(
						'@type'        => 'Offer',
						'itemOffered'  => array( '@type' => 'Service', 'name' => $f ),
					);
				}, $features ),
			);
		}
		if ( $thumb_url ) {
			$schema['image'] = $thumb_url;
		}
		$this->output_schema( $schema );
	}

	/* ── Services archive: ItemList ─────────────────────────────────────── */
	private function schema_services_list(): void {
		$services = get_posts( array(
			'post_type'      => 'grosharp_service',
			'posts_per_page' => -1,
			'orderby'        => 'menu_order title',
			'order'          => 'ASC',
			'post_status'    => 'publish',
		) );
		if ( empty( $services ) ) {
			return;
		}
		$items = array();
		foreach ( $services as $i => $svc ) {
			$items[] = array(
				'@type'    => 'ListItem',
				'position' => $i + 1,
				'url'      => get_permalink( $svc->ID ),
				'name'     => get_the_title( $svc->ID ),
			);
		}
		$archive_url = get_post_type_archive_link( 'grosharp_service' );
		$this->output_schema( array(
			'@type'           => 'ItemList',
			'@id'             => $archive_url . '#list',
			'name'            => $this->s['company_name'] . ' — All Services',
			'description'     => 'Complete list of digital services offered by ' . $this->s['company_name'],
			'url'             => $archive_url,
			'numberOfItems'   => count( $items ),
			'itemListElement' => $items,
		) );
	}

	/* ════════════════════════════════════════════════════════════════════════
	 * FALLBACK SCHEMAS  (used only when Rank Math is NOT active)
	 * ════════════════════════════════════════════════════════════════════════ */

	private function schema_article(): void {
		$post_id   = get_queried_object_id();
		$post      = get_post( $post_id );
		$permalink = get_permalink( $post_id );
		$thumb_url = get_the_post_thumbnail_url( $post_id, 'grosharp-og' );
		$author    = get_the_author_meta( 'display_name', $post->post_author );

		$schema = array(
			'@type'           => 'BlogPosting',
			'@id'             => $permalink . '#article',
			'headline'        => get_the_title( $post_id ),
			'description'     => wp_strip_all_tags( get_the_excerpt( $post_id ) ),
			'url'             => $permalink,
			'datePublished'   => get_the_date( 'c', $post_id ),
			'dateModified'    => get_the_modified_date( 'c', $post_id ),
			'author'          => array( '@type' => 'Person', 'name' => $author ),
			'publisher'       => array( '@id' => $this->home . '#organization' ),
			'inLanguage'      => 'en-US',
		);
		if ( $thumb_url ) {
			$schema['image'] = array( '@type' => 'ImageObject', 'url' => $thumb_url );
		}
		$cats = get_the_category( $post_id );
		if ( $cats ) {
			$schema['articleSection'] = $cats[0]->name;
		}
		$this->output_schema( $schema );
	}

	private function schema_webpage(): void {
		$url  = is_singular() ? (string) get_permalink() : (string) $this->get_canonical();
		$type = 'WebPage';
		if ( is_page() ) {
			$slug = get_post_field( 'post_name', get_queried_object_id() );
			if ( in_array( $slug, array( 'about', 'about-us' ), true ) ) {
				$type = 'AboutPage';
			} elseif ( in_array( $slug, array( 'contact', 'contact-us' ), true ) ) {
				$type = 'ContactPage';
			}
		} elseif ( is_post_type_archive() ) {
			$type = 'CollectionPage';
		}
		$title   = is_singular() ? get_the_title() : (string) single_post_title( '', false );
		$excerpt = is_singular() ? wp_strip_all_tags( get_the_excerpt() ) : '';
		$schema  = array(
			'@type'     => $type,
			'@id'       => $url . '#webpage',
			'url'       => $url,
			'name'      => $title . ( $title ? ' — ' : '' ) . $this->s['company_name'],
			'isPartOf'  => array( '@id' => $this->home . '#website' ),
			'publisher' => array( '@id' => $this->home . '#organization' ),
		);
		if ( $excerpt ) {
			$schema['description'] = $excerpt;
		}
		$this->output_schema( $schema );
	}

	private function schema_breadcrumb(): void {
		$items = array();
		$pos   = 1;
		$items[] = array(
			'@type'    => 'ListItem',
			'position' => $pos++,
			'name'     => $this->s['company_name'],
			'item'     => $this->home,
		);
		if ( is_singular( 'grosharp_service' ) ) {
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => 'Services', 'item' => get_post_type_archive_link( 'grosharp_service' ) );
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title(), 'item' => get_permalink() );
		} elseif ( is_post_type_archive( 'grosharp_service' ) ) {
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => 'Services', 'item' => get_post_type_archive_link( 'grosharp_service' ) );
		} elseif ( is_singular( 'grosharp_project' ) ) {
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => 'Case Studies', 'item' => get_post_type_archive_link( 'grosharp_project' ) );
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title(), 'item' => get_permalink() );
		} elseif ( is_post_type_archive( 'grosharp_project' ) ) {
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => 'Case Studies', 'item' => get_post_type_archive_link( 'grosharp_project' ) );
		} elseif ( is_singular( 'post' ) ) {
			$cats = get_the_category();
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => $cats ? $cats[0]->name : 'Blog', 'item' => $cats ? get_category_link( $cats[0]->term_id ) : $this->home . 'blog/' );
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title(), 'item' => get_permalink() );
		} elseif ( is_singular() ) {
			$items[] = array( '@type' => 'ListItem', 'position' => $pos++, 'name' => get_the_title(), 'item' => get_permalink() );
		}
		if ( count( $items ) < 2 ) {
			return;
		}
		$this->output_schema( array(
			'@type'           => 'BreadcrumbList',
			'itemListElement' => $items,
		) );
	}

	/* ════════════════════════════════════════════════════════════════════════
	 * HELPERS
	 * ════════════════════════════════════════════════════════════════════════ */

	private function get_description(): string {
		if ( is_singular() ) {
			$excerpt = wp_strip_all_tags( get_the_excerpt() );
			if ( $excerpt ) {
				return wp_trim_words( $excerpt, 30 );
			}
		}
		if ( is_post_type_archive( 'grosharp_service' ) ) {
			return 'Explore all services offered by ' . $this->s['company_name'] . ': UI/UX design, WordPress development, WooCommerce, SEO, branding, and more.';
		}
		if ( is_post_type_archive( 'grosharp_project' ) ) {
			return 'View case studies and projects completed by ' . $this->s['company_name'] . '.';
		}
		return (string) $this->s['tagline'];
	}

	private function get_canonical(): string {
		if ( is_singular() ) {
			return (string) get_permalink();
		}
		if ( is_post_type_archive() ) {
			return (string) get_post_type_archive_link( get_queried_object()->name );
		}
		if ( is_front_page() ) {
			return $this->home;
		}
		return (string) get_pagenum_link( get_query_var( 'paged', 1 ), false );
	}

	private function get_og_type(): string {
		return is_singular( 'post' ) ? 'article' : 'website';
	}

	private function get_seo_title(): string {
		if ( is_singular() ) {
			return get_the_title() . ' — ' . $this->s['company_name'];
		}
		if ( is_front_page() ) {
			return $this->s['company_name'] . ' — ' . $this->s['tagline'];
		}
		if ( is_post_type_archive( 'grosharp_service' ) ) {
			return 'Services — ' . $this->s['company_name'];
		}
		if ( is_post_type_archive( 'grosharp_project' ) ) {
			return 'Case Studies — ' . $this->s['company_name'];
		}
		return get_bloginfo( 'name' );
	}

	/** @return array{url:string,width:int,height:int,alt:string}|null */
	private function get_og_image(): ?array {
		if ( is_singular() && has_post_thumbnail() ) {
			$id  = get_post_thumbnail_id();
			$src = wp_get_attachment_image_src( $id, 'grosharp-og' );
			if ( $src ) {
				return array(
					'url'    => $src[0],
					'width'  => $src[1],
					'height' => $src[2],
					'alt'    => (string) get_post_meta( $id, '_wp_attachment_image_alt', true ) ?: get_the_title(),
				);
			}
		}
		$logo_id = absint( $this->s['logo_id'] );
		if ( $logo_id ) {
			$src = wp_get_attachment_image_src( $logo_id, 'full' );
			if ( $src ) {
				return array( 'url' => $src[0], 'width' => $src[1], 'height' => $src[2], 'alt' => $this->s['company_name'] );
			}
		}
		return null;
	}

	private function get_logo_schema(): ?array {
		$logo_id = absint( $this->s['logo_id'] );
		if ( ! $logo_id ) {
			return null;
		}
		$src = wp_get_attachment_image_src( $logo_id, 'full' );
		if ( ! $src ) {
			return null;
		}
		return array(
			'@type'   => 'ImageObject',
			'@id'     => $this->home . '#logo',
			'url'     => $src[0],
			'width'   => $src[1],
			'height'  => $src[2],
			'caption' => $this->s['company_name'],
		);
	}

	private function output_schema( array $schema ): void {
		$payload = array_merge( array( '@context' => 'https://schema.org' ), $schema );
		echo '<script type="application/ld+json">' . "\n";
		echo wp_json_encode( $payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT );
		echo "\n" . '</script>' . "\n";
	}
}
