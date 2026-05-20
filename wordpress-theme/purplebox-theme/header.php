<?php
if (!defined('ABSPATH')) {
    exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<nav class="site-nav">
    <div class="nav-inner">
        <a href="<?php echo esc_url(home_url('/')); ?>" class="nav-logo">
            <?php
            if (has_custom_logo()) {
                the_custom_logo();
            } else {
                echo '<span style="font-weight:800;color:var(--purple);">' . esc_html(get_bloginfo('name')) . '</span>';
            }
            ?>
        </a>
        <div class="nav-phone"><span class="phone-icon">📞</span> +971 54 224 9946</div>
        <div class="nav-links">
            <a href="<?php echo esc_url(home_url('/storage')); ?>">Self Storage</a>
            <a href="<?php echo esc_url(home_url('/pricing')); ?>">Unit Sizes &amp; Prices</a>
            <a href="<?php echo esc_url(home_url('/facility')); ?>">Facility</a>
            <a href="<?php echo esc_url(home_url('/packing-moving')); ?>">Moving</a>
            <a href="<?php echo esc_url(home_url('/about')); ?>">About</a>
            <a href="<?php echo esc_url(home_url('/contact')); ?>">Contact Us</a>
        </div>
        <div class="nav-cta">
            <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20to%20book%20a%20storage%20unit." class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer">Book Now</a>
        </div>
        <div class="nav-hamburger" onclick="toggleMobileMenu()"><span></span><span></span><span></span></div>
    </div>
</nav>

<div class="mobile-menu" id="mobileMenu">
    <div class="mobile-phone">📞 +971 54 224 9946</div>
    <a href="<?php echo esc_url(home_url('/storage')); ?>">Self Storage</a>
    <a href="<?php echo esc_url(home_url('/pricing')); ?>">Unit Sizes &amp; Prices</a>
    <a href="<?php echo esc_url(home_url('/facility')); ?>">Facility</a>
    <a href="<?php echo esc_url(home_url('/packing-moving')); ?>">Moving</a>
    <a href="<?php echo esc_url(home_url('/about')); ?>">About</a>
    <a href="<?php echo esc_url(home_url('/contact')); ?>">Contact Us</a>
    <a href="<?php echo esc_url(home_url('/faq')); ?>">FAQ</a>
    <div class="mobile-menu-cta">
        <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20to%20book%20a%20storage%20unit." class="btn btn-primary btn-full" target="_blank" rel="noopener noreferrer">Book Now</a>
        <a href="https://wa.me/971542249946" class="btn btn-wa btn-full" target="_blank" rel="noopener noreferrer">💬 WhatsApp Us</a>
    </div>
</div>

<main class="site-main">
