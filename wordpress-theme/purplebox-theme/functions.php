<?php
if (!defined('ABSPATH')) {
    exit;
}

function purplebox_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script'));
    add_theme_support('custom-logo', array(
        'height' => 60,
        'width' => 220,
        'flex-height' => true,
        'flex-width' => true,
    ));

    register_nav_menus(array(
        'primary' => __('Primary Menu', 'purplebox-theme'),
        'footer'  => __('Footer Menu', 'purplebox-theme'),
    ));
}
add_action('after_setup_theme', 'purplebox_theme_setup');

function purplebox_theme_scripts() {
    wp_enqueue_style(
        'purplebox-fonts',
        'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        array(),
        null
    );

    wp_enqueue_style(
        'purplebox-shared',
        get_template_directory_uri() . '/assets/css/shared.css',
        array('purplebox-fonts'),
        '1.0.0'
    );

    wp_enqueue_style(
        'purplebox-theme',
        get_template_directory_uri() . '/assets/css/theme.css',
        array('purplebox-shared'),
        '1.0.0'
    );

    wp_enqueue_script(
        'purplebox-theme-js',
        get_template_directory_uri() . '/assets/js/theme.js',
        array(),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'purplebox_theme_scripts');

function purplebox_get_static_file_path($slug) {
    $file_slug = ($slug === 'home' || $slug === '') ? 'index' : $slug;
    $path = get_template_directory() . '/static-html/' . $file_slug . '.html';
    return file_exists($path) ? $path : '';
}

function purplebox_transform_static_links($content) {
    $content = preg_replace_callback('/href="([a-zA-Z0-9\-]+)\.html"/', function ($matches) {
        $slug = sanitize_title($matches[1]);
        if ($slug === 'index') {
            return 'href="' . esc_url(home_url('/')) . '"';
        }
        return 'href="' . esc_url(home_url('/' . $slug . '/')) . '"';
    }, $content);

    $content = str_replace('href="#wa"', 'href="https://wa.me/971542249946" target="_blank" rel="noopener noreferrer"', $content);

    return $content;
}

function purplebox_get_static_body_content($slug) {
    $path = purplebox_get_static_file_path($slug);
    if (!$path) {
        return '';
    }

    $html = file_get_contents($path);
    if ($html === false) {
        return '';
    }

    if (preg_match('/<body[^>]*>([\s\S]*?)<\/body>/i', $html, $matches)) {
        $content = $matches[1];
    } else {
        $content = $html;
    }

    $patterns = array(
        '/<nav class="site-nav"[\s\S]*?<\/nav>/i',
        '/<div class="mobile-menu"[\s\S]*?<\/div>/i',
        '/<footer class="site-footer"[\s\S]*?<\/footer>/i',
        '/<a href="#wa" class="wa-float"[\s\S]*?<\/a>/i',
        '/<div class="mobile-cta"[\s\S]*?<\/div>/i',
        '/<script[\s\S]*?<\/script>/i',
    );

    $content = preg_replace($patterns, '', $content);
    $content = purplebox_transform_static_links($content);

    return trim($content);
}

function purplebox_render_static_section($slug) {
    $content = purplebox_get_static_body_content($slug);
    if ($content === '') {
        return false;
    }

    // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
    echo $content;
    return true;
}

function purplebox_create_default_pages() {
    $static_dir = get_template_directory() . '/static-html';
    if (!is_dir($static_dir)) {
        return;
    }

    $files = glob($static_dir . '/*.html');
    if (!$files) {
        return;
    }

    $template_map = array(
        'about'   => 'page-about.php',
        'contact' => 'page-contact.php',
        'pricing' => 'page-pricing.php',
    );

    $home_page_id = 0;

    foreach ($files as $file) {
        $slug = sanitize_title(basename($file, '.html'));

        if ($slug === 'index') {
            $page_slug = 'home';
            $title = 'Home';
        } else {
            $page_slug = $slug;
            $title = ucwords(str_replace('-', ' ', $slug));
        }

        $existing = get_page_by_path($page_slug, OBJECT, 'page');
        if ($existing) {
            $page_id = (int) $existing->ID;
        } else {
            $page_id = wp_insert_post(array(
                'post_type'    => 'page',
                'post_status'  => 'publish',
                'post_title'   => $title,
                'post_name'    => $page_slug,
                'post_content' => '',
            ));
        }

        if (!is_wp_error($page_id) && $page_id) {
            if (isset($template_map[$page_slug])) {
                update_post_meta($page_id, '_wp_page_template', $template_map[$page_slug]);
            } elseif ($page_slug !== 'home') {
                update_post_meta($page_id, '_wp_page_template', 'page-static.php');
            }
        }

        if ($page_slug === 'home' && !is_wp_error($page_id) && $page_id) {
            $home_page_id = (int) $page_id;
        }
    }

    if ($home_page_id > 0) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', $home_page_id);
    }
}
add_action('after_switch_theme', 'purplebox_create_default_pages');

function purplebox_maybe_bootstrap_pages() {
    if (get_option('purplebox_pages_bootstrapped') === 'yes') {
        return;
    }

    purplebox_create_default_pages();
    update_option('purplebox_pages_bootstrapped', 'yes');
}
add_action('init', 'purplebox_maybe_bootstrap_pages');
