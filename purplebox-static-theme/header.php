<?php
if (!defined('ABSPATH')) {
    exit;
}

$cart_url = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/store.html');
$cart_count = 0;
if (function_exists('WC') && WC() && WC()->cart) {
    $cart_count = (int) WC()->cart->get_cart_contents_count();
}
$theme_uri = get_template_directory_uri();
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
  <link rel="icon" type="image/png" href="http://purplebox.ae/wp-content/uploads/2026/06/favicon.png" />
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<?php
// Standard PurpleBox nav (css/site-nav.css + js/site-nav.js); same markup as static-pages/*.html.
$pb_nav_links = [
    ['/index.html', 'Home'],
    ['/book-unit.html', 'Reserve Unit'],
    ['/store.html', 'Shop Now'],
    ['/packing-moving.html', 'Packing &amp; Moving'],
    ['/blog/', 'Blog'],
    ['/contact.html', 'Contact'],
];
// WordPress renders the blog (posts, archives, search) through this header.
$pb_nav_active = (is_home() || is_single() || is_archive() || is_search()) ? '/blog/' : '';
$pb_nav_render = function ($indent) use ($pb_nav_links, $pb_nav_active) {
    foreach ($pb_nav_links as $link) {
        $current = $link[0] === $pb_nav_active ? ' class="active" aria-current="page"' : '';
        echo $indent . '<a href="' . esc_url(home_url($link[0])) . '"' . $current . '>' . $link[1] . "</a>\n";
    }
};
?>
<nav class="pbnav" aria-label="Main">
  <div class="pbnav-card">
    <a href="<?php echo esc_url(home_url('/index.html')); ?>" class="pbnav-logo" aria-label="PurpleBox Storage home"><img src="<?php echo esc_url($theme_uri . '/images/logo-1.svg'); ?>" alt="PurpleBox Storage" class="no-lazyload skip-lazy" data-no-lazy="1" loading="eager" fetchpriority="high" width="402" height="130" /></a>
    <div class="pbnav-links">
<?php $pb_nav_render('      '); ?>
    </div>
    <div class="pbnav-actions">
      <a href="tel:+971542249946" class="pbnav-icon pbnav-phone" aria-label="Call +971 54 224 9946"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clip-rule="evenodd" /></svg></a>
      <a href="<?php echo esc_url($cart_url); ?>" class="pbnav-icon pbnav-cart" aria-label="Open cart">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="20" r="1.5"></circle><circle cx="17" cy="20" r="1.5"></circle><path d="M3 4h2l1.5 10h11l2-7H7"></path></svg>
        <span class="nav-cart-badge<?php echo $cart_count > 0 ? ' has-items' : ''; ?>" id="shopCartBadge"><?php echo (int) $cart_count; ?></span>
      </a>
      <a href="<?php echo esc_url(home_url('/index.html#leadForm')); ?>" class="pbnav-quote">Get a Quote
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
      <button type="button" class="pbnav-toggle" aria-label="Open menu" aria-controls="mobileMenu" aria-expanded="false"><svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true"><circle cx="3" cy="3" r="1.6" /><circle cx="9" cy="3" r="1.6" /><circle cx="15" cy="3" r="1.6" /><circle cx="3" cy="9" r="1.6" /><circle cx="9" cy="9" r="1.6" /><circle cx="15" cy="9" r="1.6" /><circle cx="3" cy="15" r="1.6" /><circle cx="9" cy="15" r="1.6" /><circle cx="15" cy="15" r="1.6" /></svg></button>
    </div>
  </div>
  <div class="pbnav-menu" id="mobileMenu">
    <a href="tel:+971542249946" class="pbnav-menu-phone"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clip-rule="evenodd" /></svg> +971 54 224 9946</a>
<?php $pb_nav_render('    '); ?>
    <a href="<?php echo esc_url(home_url('/index.html#leadForm')); ?>" class="pbnav-menu-quote">Get a Quote</a>
  </div>
</nav>
