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

    // Optional override in wp-config.php:
    // define('PURPLEBOX_STATIC_IMAGES_BASE_URL', 'https://your-site.com/wp-content/uploads/2026/05');
    $uploads = wp_upload_dir();
    $dynamic_images_base_uri = !empty($uploads['baseurl'])
        ? rtrim((string) $uploads['baseurl'], '/')
        : rtrim((string) content_url('uploads'), '/');

    $images_base_uri = 'https://baljobs.com/wp-content/uploads/2026/05';

    $image_ext_pattern = '/\.(png|jpe?g|webp|gif|svg|avif)(?:\?.*)?$/i';

    // Normalize image path (strip leading slash and lowercase for matching)
    $normalize_image_path = function($url) {
        $url = ltrim($url, '/');
        return $url;
    };

    $map_image_url = function ($url) use ($images_base_uri, $image_ext_pattern) {
        $clean_url = trim((string) $url);
        if ($clean_url === '') {
            return $clean_url;
        }

        // Always extract the filename from the path, regardless of domain or folder
        $path = parse_url($clean_url, PHP_URL_PATH);
        if (!is_string($path) || $path === '') {
            return $clean_url;
        }

        if (!preg_match($image_ext_pattern, $path)) {
            return $clean_url;
        }

        $basename = basename($path);
        return $images_base_uri . '/' . $basename;
    };

    $html = preg_replace_callback(
        '/\b(href|src)=(["\'])(css|js|images|templates)\/([^"\']+)\2/i',
        function ($m) use ($theme_uri, $images_base_uri) {
            $base_uri = ($m[3] === 'images') ? $images_base_uri : ($theme_uri . '/' . $m[3]);
            return $m[1] . '=' . $m[2] . $base_uri . '/' . $m[4] . $m[2];
        },
        $html
    );

    // Map any remaining image src/href (relative or absolute) by filename.
    $html = preg_replace_callback(
        '/\b(href|src)=(["\'])([^"\']+)\2/i',
        function ($m) use ($map_image_url) {
            $mapped = $map_image_url($m[3]);
            return $m[1] . '=' . $m[2] . $mapped . $m[2];
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

    // Map any remaining inline CSS image url(...) entries by filename.
    $html = preg_replace_callback(
        '/url\((\s*["\']?)([^\)"\']+)(["\']?\s*)\)/i',
        function ($m) use ($map_image_url) {
            $mapped = $map_image_url($m[2]);
            return 'url(' . $m[1] . $mapped . $m[3] . ')';
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

/**
 * Build store product objects from plugin-managed items.
 */
function purplebox_static_get_store_products() {
    $items = get_option('pbx_shop_items_data', []);

    if (!is_array($items)) {
        $items = [];
    }

    $products = [];

    foreach (array_values($items) as $index => $item) {
        if (!is_array($item)) {
            continue;
        }

        $name = isset($item['name']) ? sanitize_text_field((string) $item['name']) : '';
        if ($name === '') {
            continue;
        }

        $dimensions = isset($item['dimensions']) ? sanitize_text_field((string) $item['dimensions']) : '';
        $price_num = isset($item['price']) ? (float) $item['price'] : 0;
        $image = isset($item['image']) ? esc_url_raw((string) $item['image']) : '';

        $id_base = sanitize_title($name);
        $id = $id_base !== '' ? $id_base : ('item-' . ($index + 1));
        if (isset($products[$id])) {
            $id .= '-' . ($index + 1);
        }

        $products[$id] = [
            'id' => $id,
            'cat' => 'Boxes',
            'name' => $name,
            'spec' => $dimensions,
            'price' => 'AED ' . rtrim(rtrim(number_format($price_num, 2, '.', ''), '0'), '.'),
            'image' => $image,
        ];
    }

    if (empty($products)) {
        return [
            [
                'id' => 'large-box',
                'cat' => 'Boxes',
                'name' => 'Large Box',
                'spec' => '60 x 45 x 45 cm',
                'price' => 'AED 16',
                'image' => '',
            ],
        ];
    }

    return array_values($products);
}

/**
 * Replace hardcoded PRODUCTS array in store page with plugin data.
 */
function purplebox_static_inject_store_products($html) {
    if (!is_string($html) || strpos($html, 'var PRODUCTS = [') === false) {
        return $html;
    }

    $products_json = wp_json_encode(
        purplebox_static_get_store_products(),
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    if (!is_string($products_json) || $products_json === '') {
        return $html;
    }

    return preg_replace(
        '/var\s+PRODUCTS\s*=\s*\[[\s\S]*?\];/',
        'var PRODUCTS = ' . $products_json . ';',
        $html,
        1
    );
}

/**
 * Inject reservation lead AJAX config used by reserve-flow.js.
 */
function purplebox_static_inject_reservation_lead_config($html) {
    if (!is_string($html) || stripos($html, '</body>') === false) {
        return $html;
    }

    $config = [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('pbx_submit_reservation'),
        'submitUrl' => admin_url('admin-post.php'),
        'submitAction' => 'pbx_submit_reservation_form',
        'formNonce' => wp_create_nonce('pbx_submit_reservation_form'),
        'leadSubmitted' => isset($_GET['lead_submitted']) ? (string) wp_unslash($_GET['lead_submitted']) : '',
        'leadMessage' => isset($_GET['lead_message']) ? sanitize_text_field((string) wp_unslash($_GET['lead_message'])) : '',
    ];

    $script = '<script>window.PBXLeadConfig = ' . wp_json_encode(
        $config,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    ) . ';</script>';

    return str_ireplace('</body>', $script . "\n</body>", $html);
}

// Serve static pages from /static-pages/ for matching slugs.
add_filter('template_include', function ($template) {
    $slug = purplebox_static_resolve_slug();
    $static_php = get_template_directory() . '/static-pages/' . $slug . '.php';
    if (file_exists($static_php)) {
        return $static_php;
    }

    $static = get_template_directory() . '/static-pages/' . $slug . '.html';

    if (!file_exists($static)) {
        return $template;
    }

    $html = file_get_contents($static);
    if ($html === false) {
        return $template;
    }

    if ($slug === 'store') {
        $html = purplebox_static_inject_store_products($html);
    }

    if ($slug === 'reserve-step-3' || $slug === 'landing-local-storage-facility-in-dubai' || $slug === 'packing-moving') {
        $html = purplebox_static_inject_reservation_lead_config($html);
    }

    $html = purplebox_static_inject_layout_partials($html);
    $html = purplebox_static_rewrite_asset_urls($html);

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit;
});
