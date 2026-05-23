<?php
// PurpleBox Static Theme - functions.php

/**
 * Resolve a request path into a static page slug.
 */
function purplebox_static_resolve_slug() {
    global $wp;

    $slug = '';
    if (isset($wp) && isset($wp->request)) {
        $slug = trim((string) $wp->request, '/');
    }

    if ($slug === '') {
        $slug = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
    }

    if ($slug === '' || $slug === 'index' || $slug === 'index.php') {
        return 'index';
    }

    if (substr($slug, -5) === '.html') {
        $slug = substr($slug, 0, -5);
    }

    return trim($slug, '/');
}

/**
 * Convert relative local asset paths to absolute theme URLs.
 */
function purplebox_static_rewrite_asset_urls($html) {
    $theme_uri = rtrim(get_template_directory_uri(), '/');

    // If you move uploads later, update this constant in wp-config.php.
    // Example: define('PURPLEBOX_STATIC_IMAGES_BASE_URL', 'https://example.com/wp-content/uploads/2026/05');
    $images_base_uri = defined('PURPLEBOX_STATIC_IMAGES_BASE_URL')
        ? rtrim((string) PURPLEBOX_STATIC_IMAGES_BASE_URL, '/')
        : 'https://baljobs.com/wp-content/uploads/2026/05';

    $html = preg_replace_callback(
        '/\b(href|src)=(["\'])(css|js|images|templates)\/([^"\']+)\2/i',
        function ($m) use ($theme_uri, $images_base_uri) {
            $base_uri = ($m[3] === 'images') ? $images_base_uri : ($theme_uri . '/' . $m[3]);
            return $m[1] . '=' . $m[2] . $base_uri . '/' . $m[4] . $m[2];
        },
        $html
    );

    // Fix inline CSS background URLs like: url('images/file.jpg')
    $html = preg_replace_callback(
        '/url\((\s*["\']?)(css|js|images|templates)\/([^\)"\']+)(["\']?\s*)\)/i',
        function ($m) use ($theme_uri, $images_base_uri) {
            $base_uri = ($m[2] === 'images') ? $images_base_uri : ($theme_uri . '/' . $m[2]);
            return 'url(' . $m[1] . $base_uri . '/' . $m[3] . $m[4] . ')';
        },
        $html
    );

    return $html;
}

/**
 * Inject static header/footer templates and remove JS template loader include.
 */
function purplebox_static_inject_layout_partials($html) {
    $header_file = get_template_directory() . '/templates/header.html';
    $footer_file = get_template_directory() . '/templates/footer.html';

    if (file_exists($header_file)) {
        $html = preg_replace(
            '/<div\s+data-site-header\s*><\/div>/i',
            file_get_contents($header_file),
            $html
        );
    }

    if (file_exists($footer_file)) {
        $html = preg_replace(
            '/<div\s+data-site-footer\s*><\/div>/i',
            file_get_contents($footer_file),
            $html
        );
    }

    $html = preg_replace(
        '/\s*<script\s+src=(["\'])templates\/layout-loader\.js\1><\/script>\s*/i',
        "\n",
        $html
    );

    return $html;
}

// Serve static pages from /static-pages/ for matching slugs.
add_filter('template_include', function ($template) {
    $slug = purplebox_static_resolve_slug();
    $static = get_template_directory() . '/static-pages/' . $slug . '.html';

    if (!file_exists($static)) {
        return $template;
    }

    $html = file_get_contents($static);
    if ($html === false) {
        return $template;
    }

    $html = purplebox_static_inject_layout_partials($html);
    $html = purplebox_static_rewrite_asset_urls($html);

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit;
});
