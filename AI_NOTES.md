# Grosharp Theme Notes

## Responsibility
The theme owns the site's visual structure:
- `style.css` theme header
- `functions.php` theme setup
- `theme.json` design tokens and block presets
- Tailwind setup and compiled CSS
- templates and template parts
- global layout, header, footer, navigation, and front-end styling
- GSAP animation initialization for frontend interactions
- block style variations and CSS that make plugin blocks match the brand

## Do Not Put Here
- Custom post type registration
- Taxonomy registration
- Business logic that should survive theme changes
- Gutenberg block registration, unless it is a theme-only style variation

## Design Direction
Use a Draftr-inspired agency landing-page structure:
- Header with logo, navigation, and CTA
- Hero with badge, large headline, supporting copy, CTA group, and rich visual/product mockup area
- Client/social proof row
- Services/features grid
- Process/workflow section
- Case studies
- Testimonials
- Packages or engagement models
- Final CTA
- Footer with useful navigation

## Required Template Direction
The site should support:
- Home
- About
- Contact
- Services archive
- Service detail
- Case studies / projects archive
- Project detail
- Blog index
- Blog detail
- Default page
- 404

## Styling Direction
- Use Tailwind CSS as the main styling system.
- Use global CSS variables for brand values from plugin settings.
- Keep plugin block appearance consistent by styling agreed block classes in the theme.
- Do not rely on block-level style controls for the final design.

## Current Scaffold
- `style.css`, `functions.php`, `theme.json`, and `index.php` exist.
- `inc/setup.php` handles theme support and menus.
- `inc/assets.php` enqueues compiled CSS, editor CSS, GSAP, ScrollTrigger, and theme scripts.
- `inc/settings-css.php` reads future `grosharp_settings` options and outputs CSS variables.
- Tailwind source lives in `assets/src/css`.
- Compiled placeholder CSS lives in `assets/build/css`.
- Frontend/editor JS lives in `assets/src/js` with placeholder builds in `assets/build/js`.
- Block templates exist for home, page, blog, services, projects/case studies, search, single posts, and 404.

## Current Header/Hero Direction
- Header uses a floating rounded glass/pill style inspired by the provided Draftr screenshot.
- Homepage now starts with the `grosharp/hero` custom block.
- Hero style uses centered badge, massive 90px desktop headline, supporting copy, purple CTA, soft lavender background, and layered visual cards.
- Header and Hero styling should be expressed with Tailwind utility classes in markup, not raw custom CSS selectors.
- The Hero "Growth Dashboard" area should be an image slot, controlled by the block's image URL/alt fields.
- Keep future hero refinements agency-specific, focused on development, design, and marketing services.
- Current typography direction: heading `Inter Display`, body `Switzer`.
