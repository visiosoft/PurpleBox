<?php
// PurpleBox Static Theme - functions.php

/**
 * Resolve a request path into a static page slug.
 */
function purplebox_static_resolve_slug() {
    if (function_exists('get_query_var') && (int) get_query_var('purplebox_static_index') === 1) {
        return 'index';
    }

    if (function_exists('get_query_var') && (int) get_query_var('purplebox_static_reserve_step_3') === 1) {
        return 'reserve-step-3';
    }

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

    // Normalize a common typo seen in inbound links.
    if ($slug === 'reserve.-step-3') {
        $slug = 'reserve-step-3';
    }

    return trim($slug, '/');
}

/**
 * Register /index.html alias so it always resolves through WordPress.
 */
function purplebox_static_register_index_rewrite() {
    add_rewrite_rule('^index\.html?$', 'index.php?purplebox_static_index=1', 'top');
    add_rewrite_rule('^reserve-step-3\.html?$', 'index.php?purplebox_static_reserve_step_3=1', 'top');
    add_rewrite_rule('^reserve-step-3/?$', 'index.php?purplebox_static_reserve_step_3=1', 'top');
    add_rewrite_rule('^reserve\.\-step\-3/?$', 'index.php?purplebox_static_reserve_step_3=1', 'top');
}

/**
 * Allow custom query var used by index.html rewrite.
 */
function purplebox_static_register_query_vars($vars) {
    $vars[] = 'purplebox_static_index';
    $vars[] = 'purplebox_static_reserve_step_3';
    return $vars;
}

/**
 * Prevent WordPress canonical redirects from rewriting /index.html.
 */
function purplebox_static_preserve_index_html_canonical($redirect_url, $requested_url) {
    $path = parse_url((string) $requested_url, PHP_URL_PATH);
    if (is_string($path)) {
        $trimmed = strtolower(trim($path, '/'));
        if (
            $trimmed === 'index.html' ||
            $trimmed === 'index.php' ||
            $trimmed === 'reserve-step-3.html' ||
            $trimmed === 'reserve-step-3' ||
            $trimmed === 'reserve.-step-3'
        ) {
            return false;
        }
    }

    return $redirect_url;
}

/**
 * Ensure a Home page exists in wp-admin and assign it as the front page.
 */
function purplebox_static_setup_front_page_on_theme_switch() {
    $home_page = get_page_by_path('home', OBJECT, 'page');

    if (!$home_page) {
        $page_id = wp_insert_post([
            'post_type' => 'page',
            'post_status' => 'publish',
            'post_title' => 'Home',
            'post_name' => 'home',
            'post_content' => '',
        ]);

        if (!is_wp_error($page_id) && (int) $page_id > 0) {
            $home_page = get_post((int) $page_id);
        }
    }

    if ($home_page && isset($home_page->ID)) {
        update_option('show_on_front', 'page');
        update_option('page_on_front', (int) $home_page->ID);
    }

    flush_rewrite_rules(false);
}

/**
 * Backfill front-page setup for sites already using the theme.
 */
function purplebox_static_maybe_setup_front_page() {
    if (get_option('purplebox_static_front_page_initialized') === '1') {
        return;
    }

    purplebox_static_setup_front_page_on_theme_switch();
    update_option('purplebox_static_front_page_initialized', '1', false);
}

/**
 * Flush rewrite rules once for existing installs to activate /index.html alias.
 */
function purplebox_static_maybe_flush_rewrites() {
    if (get_option('purplebox_static_rewrites_initialized') === '1') {
        return;
    }

    flush_rewrite_rules(false);
    update_option('purplebox_static_rewrites_initialized', '1', false);
}

add_action('init', 'purplebox_static_register_index_rewrite', 9);
add_filter('query_vars', 'purplebox_static_register_query_vars');
add_filter('redirect_canonical', 'purplebox_static_preserve_index_html_canonical', 10, 2);
add_action('after_switch_theme', 'purplebox_static_setup_front_page_on_theme_switch');
add_action('init', 'purplebox_static_maybe_setup_front_page');
add_action('init', 'purplebox_static_maybe_flush_rewrites', 20);

/**
 * Enqueue shared assets for native WordPress templates (home/single/archive/page).
 */
function purplebox_static_enqueue_theme_assets() {
    $theme_uri = get_template_directory_uri();

    wp_enqueue_style(
        'purplebox-shared',
        $theme_uri . '/css/shared.css',
        [],
        '1.0.0'
    );

    wp_enqueue_style(
        'purplebox-layout-template',
        $theme_uri . '/css/layout-template.css',
        ['purplebox-shared'],
        '1.0.0'
    );

    wp_enqueue_style(
        'purplebox-theme',
        $theme_uri . '/style.css',
        ['purplebox-layout-template'],
        '1.0.0'
    );

    if (is_home() || is_single() || is_archive() || is_search() || is_page('blog') || is_page_template('template-blog.php')) {
        wp_enqueue_style(
            'purplebox-blog',
            $theme_uri . '/css/blog.css',
            ['purplebox-theme'],
            '1.0.0'
        );
    }

    wp_enqueue_script(
        'purplebox-layout-loader',
        $theme_uri . '/templates/layout-loader.js',
        [],
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'purplebox_static_enqueue_theme_assets');

/**
 * Ensure a Blog page exists and is configured as the posts page.
 */
function purplebox_static_maybe_setup_posts_page() {
    if (get_option('purplebox_static_posts_page_initialized') === '1') {
        return;
    }

    $posts_page_id = (int) get_option('page_for_posts');
    if ($posts_page_id > 0 && get_post_status($posts_page_id)) {
        update_option('purplebox_static_posts_page_initialized', '1', false);
        return;
    }

    $blog_page = get_page_by_path('blog', OBJECT, 'page');
    if (!$blog_page) {
        $blog_page_id = wp_insert_post([
            'post_type' => 'page',
            'post_status' => 'publish',
            'post_title' => 'Blog',
            'post_name' => 'blog',
            'post_content' => '',
        ]);

        if (!is_wp_error($blog_page_id) && (int) $blog_page_id > 0) {
            $blog_page = get_post((int) $blog_page_id);
        }
    }

    if ($blog_page && isset($blog_page->ID)) {
        update_option('page_for_posts', (int) $blog_page->ID);
    }

    update_option('purplebox_static_posts_page_initialized', '1', false);
}
add_action('init', 'purplebox_static_maybe_setup_posts_page', 21);

/**
 * Convert relative local asset paths to absolute theme URLs.
 */
function purplebox_static_rewrite_asset_urls($html) {
    $theme_uri = rtrim(get_template_directory_uri(), '/');
    $theme_dir = rtrim(get_template_directory(), '/\\');

    // Local theme images (images/...) are mapped to this uploads folder.
    // Keep it slash-trimmed so concatenation never creates double slashes.
    $images_base_uri = 'https://purplebox.ae/wp-content/uploads/2026/05';

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

        // Preserve absolute URLs (including existing wp-content uploads links)
        // so pages can intentionally point to different months/files.
        if (preg_match('/^(?:https?:)?\/\//i', $clean_url)) {
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

    $append_asset_version = function ($url, $group, $file) use ($theme_dir) {
        if (!is_string($url) || $url === '') {
            return $url;
        }

        $path = $theme_dir . DIRECTORY_SEPARATOR . $group . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $file);
        if (!file_exists($path)) {
            return $url;
        }

        $ver = (string) @filemtime($path);
        if ($ver === '' || $ver === false) {
            return $url;
        }

        return $url . (strpos($url, '?') !== false ? '&' : '?') . 'v=' . rawurlencode($ver);
    };

    $html = preg_replace_callback(
        '/\b(href|src)=(["\'])(css|js|images|templates)\/([^"\']+)\2/i',
        function ($m) use ($theme_uri, $images_base_uri, $append_asset_version) {
            $base_uri = ($m[3] === 'images') ? $images_base_uri : ($theme_uri . '/' . $m[3]);
            $asset_url = $base_uri . '/' . $m[4];

            if ($m[3] !== 'images') {
                $asset_url = $append_asset_version($asset_url, $m[3], $m[4]);
            }

            return $m[1] . '=' . $m[2] . $asset_url . $m[2];
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
        function ($m) use ($theme_uri, $images_base_uri, $append_asset_version) {
            $base_uri = ($m[2] === 'images') ? $images_base_uri : ($theme_uri . '/' . $m[2]);
            $asset_url = $base_uri . '/' . $m[3];

            if ($m[2] !== 'images') {
                $asset_url = $append_asset_version($asset_url, $m[2], $m[3]);
            }

            return 'url(' . $m[1] . $asset_url . $m[4] . ')';
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
    $header_file = dirname(get_template_directory()) . '/templates/header.html';
    $footer_file = get_template_directory() . '/templates/footer.html';

    if (file_exists($header_file)) {
        $header_html = file_get_contents($header_file);

        if (is_string($header_html) && class_exists('WooCommerce') && function_exists('WC')) {
            $cart_url = function_exists('wc_get_cart_url') ? wc_get_cart_url() : home_url('/');
            $cart_count = 0;
            if (WC()->cart) {
                $cart_count = (int) WC()->cart->get_cart_contents_count();
            }

            $header_html = preg_replace(
                '/(<a\s+href=")[^"]+("\s+class="nav-cart"[^>]*>)/i',
                '$1' . esc_url($cart_url) . '$2',
                $header_html,
                1
            );

            $badge_class = 'nav-cart-badge' . ($cart_count > 0 ? ' has-items' : '');
            $header_html = preg_replace(
                '/<span\s+class="nav-cart-badge(?:\s+has-items)?"\s+id="shopCartBadge">\d+<\/span>/i',
                '<span class="' . esc_attr($badge_class) . '" id="shopCartBadge">' . (string) $cart_count . '</span>',
                $header_html,
                1
            );
        }

        $html = preg_replace(
            '/<div\s+data-site-header\s*><\/div>/i',
            $header_html,
            $html
        );
    }

    if (file_exists($footer_file)) {
        $footer_html = file_get_contents($footer_file);
        $html = preg_replace(
            '/<div\s+data-site-footer\s*><\/div>/i',
            $footer_html,
            $html
        );

        $html = preg_replace(
            '/<footer\s+class="pbx-footer-shell"[\s\S]*?<\/footer>/i',
            $footer_html,
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
    if (class_exists('WooCommerce') && function_exists('wc_get_products')) {
        $woo_products = wc_get_products([
            'status' => 'publish',
            'limit' => -1,
            'orderby' => 'menu_order',
            'order' => 'ASC',
        ]);

        if (is_array($woo_products) && !empty($woo_products)) {
            $mapped = [];

            $map_category = static function ($raw) {
                $raw = strtolower((string) $raw);
                if ($raw === '') {
                    return 'Packing';
                }

                if (strpos($raw, 'lock') !== false || strpos($raw, 'seal') !== false || strpos($raw, 'security') !== false) {
                    return 'Locks';
                }

                if (strpos($raw, 'box') !== false || strpos($raw, 'carton') !== false) {
                    return 'Boxes';
                }

                if (strpos($raw, 'pack') !== false || strpos($raw, 'tape') !== false || strpos($raw, 'wrap') !== false || strpos($raw, 'supply') !== false) {
                    return 'Packing';
                }

                return 'Packing';
            };

            foreach ($woo_products as $product) {
                if (!is_a($product, 'WC_Product')) {
                    continue;
                }

                $id = (int) $product->get_id();
                $name = sanitize_text_field((string) $product->get_name());
                if ($id <= 0 || $name === '') {
                    continue;
                }

                $terms = get_the_terms($id, 'product_cat');
                $cat_raw = '';
                if (is_array($terms) && !empty($terms)) {
                    $first = reset($terms);
                    if ($first && isset($first->name)) {
                        $cat_raw = (string) $first->name;
                    }
                }

                $spec = wp_strip_all_tags((string) $product->get_short_description());
                if ($spec === '') {
                    $spec = wp_strip_all_tags((string) $product->get_description());
                }
                if ($spec === '') {
                    $spec = 'Premium packing supply';
                }
                if (mb_strlen($spec) > 72) {
                    $spec = mb_substr($spec, 0, 69) . '...';
                }

                $price = (float) $product->get_price();
                $regular = (float) $product->get_regular_price();

                $format = static function ($value) {
                    return 'AED ' . rtrim(rtrim(number_format((float) $value, 2, '.', ''), '0'), '.');
                };

                $price_text = $format($price > 0 ? $price : $regular);
                $was_text = '';
                if ($regular > 0 && $price > 0 && $regular > $price) {
                    $was_text = $format($regular);
                }

                $image = '';
                $image_id = (int) $product->get_image_id();
                if ($image_id > 0) {
                    $image = wp_get_attachment_image_url($image_id, 'medium');
                    $image = is_string($image) ? esc_url_raw($image) : '';
                }

                $mapped[] = [
                    'id' => 'wc-' . $id,
                    'cat' => $map_category($cat_raw),
                    'name' => $name,
                    'spec' => $spec,
                    'price' => $price_text,
                    'was' => $was_text,
                    'tag' => $product->is_on_sale() ? 'Sale' : '',
                    'image' => $image,
                ];
            }

            if (!empty($mapped)) {
                return $mapped;
            }
        }
    }

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
 * Build Pack Like a Pro products from WooCommerce when available.
 */
function purplebox_static_get_pack_pro_products() {
    if (!class_exists('WooCommerce') || !function_exists('wc_get_products')) {
        return [];
    }

    $products = wc_get_products([
        'status' => 'publish',
        'limit' => 16,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    if (!is_array($products) || empty($products)) {
        return [];
    }

    $result = [];

    $map_category = static function ($raw) {
        $raw = strtolower((string) $raw);
        if ($raw === '') {
            return 'Packing';
        }

        if (strpos($raw, 'lock') !== false || strpos($raw, 'seal') !== false || strpos($raw, 'security') !== false) {
            return 'Locks';
        }

        if (strpos($raw, 'box') !== false || strpos($raw, 'carton') !== false) {
            return 'Boxes';
        }

        if (strpos($raw, 'pack') !== false || strpos($raw, 'tape') !== false || strpos($raw, 'wrap') !== false || strpos($raw, 'supply') !== false) {
            return 'Packing';
        }

        return 'Packing';
    };

    foreach ($products as $product) {
        if (!is_a($product, 'WC_Product')) {
            continue;
        }

        $id = (int) $product->get_id();
        if ($id <= 0) {
            continue;
        }

        $name = sanitize_text_field((string) $product->get_name());
        if ($name === '') {
            continue;
        }

        $terms = get_the_terms($id, 'product_cat');
        $cat_raw = '';
        if (is_array($terms) && !empty($terms)) {
            $first = reset($terms);
            if ($first && isset($first->name)) {
                $cat_raw = (string) $first->name;
            }
        }

        $spec = wp_strip_all_tags((string) $product->get_short_description());
        if ($spec === '') {
            $spec = wp_strip_all_tags((string) $product->get_description());
        }
        if ($spec === '') {
            $spec = 'Premium packing supply';
        }
        if (mb_strlen($spec) > 72) {
            $spec = mb_substr($spec, 0, 69) . '...';
        }

        $price = (float) $product->get_price();
        $regular = (float) $product->get_regular_price();
        $currency = function_exists('get_woocommerce_currency_symbol')
            ? get_woocommerce_currency_symbol()
            : 'AED';

        $format_price = static function ($value, $currency_symbol) {
            $text = rtrim(rtrim(number_format((float) $value, 2, '.', ''), '0'), '.');
            return trim($currency_symbol . ' ' . $text);
        };

        $price_text = $format_price($price > 0 ? $price : $regular, $currency);
        $was_text = '';
        if ($regular > 0 && $price > 0 && $regular > $price) {
            $was_text = $format_price($regular, $currency);
        }

        $image = '';
        $image_id = (int) $product->get_image_id();
        if ($image_id > 0) {
            $image = wp_get_attachment_image_url($image_id, 'medium');
            $image = is_string($image) ? esc_url_raw($image) : '';
        }

        $cart_base_url = function_exists('wc_get_cart_url')
            ? wc_get_cart_url()
            : home_url('/');

        $result[] = [
            'id'            => 'wc-' . $id,
            'cat'           => $map_category($cat_raw),
            'name'          => $name,
            'spec'          => $spec,
            'price'         => $price_text,
            'priceNum'      => (float) ($price > 0 ? $price : $regular),
            'was'           => $was_text,
            'tag'           => $product->is_on_sale() ? 'Sale' : '',
            'image'         => $image,
            'product_url'   => esc_url_raw(get_permalink($id)),
            'add_to_cart_url' => esc_url_raw(add_query_arg(
                [
                    'add-to-cart' => (string) $id,
                    'quantity'    => '1',
                ],
                $cart_base_url
            )),
        ];
    }

    return $result;
}

/**
 * Inject Pack Like a Pro products into index script.
 */
function purplebox_static_inject_pack_products($html) {
    if (!is_string($html) || strpos($html, 'var PRODUCTS = [') === false) {
        return $html;
    }

    $woo_enabled = class_exists('WooCommerce') && function_exists('wc_get_products');
    $products = purplebox_static_get_pack_pro_products();

    // If WooCommerce is enabled, always override the static preload list.
    // This prevents old hardcoded items from appearing when Woo has zero products.
    if (!$woo_enabled && empty($products)) {
        return $html;
    }

    $products_json = wp_json_encode(
        is_array($products) ? $products : [],
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    if (!is_string($products_json) || $products_json === '') {
        return $html;
    }

    $html = preg_replace(
        '/var\s+PRODUCTS\s*=\s*\[[\s\S]*?\];/',
        'var PRODUCTS = ' . $products_json . ';',
        $html,
        1
    );

    if (class_exists('WooCommerce') && function_exists('wc_get_page_permalink')) {
        $shop_url = wc_get_page_permalink('shop');
        if (is_string($shop_url) && $shop_url !== '') {
            $config = [
                'shopUrl' => $shop_url,
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('pbx_store_cart'),
                'wooEnabled' => true,
            ];
            $config_script = '<script>window.PBXPackProConfig=' . wp_json_encode($config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ';</script>';
            $html = str_ireplace('</body>', $config_script . "\n</body>", $html);
        }
    }

    return $html;
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

/**
 * Inject store config required by Woo-synced cart UI.
 */
function purplebox_static_inject_store_config($html) {
    if (!is_string($html) || stripos($html, '</body>') === false) {
        return $html;
    }

    $config = [
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('pbx_store_cart'),
        'wooEnabled' => (bool) (class_exists('WooCommerce') && function_exists('WC')),
        'checkoutUrl' => function_exists('wc_get_checkout_url') ? wc_get_checkout_url() : home_url('/checkout/'),
    ];

    $script = '<script>window.PBXStoreConfig=' . wp_json_encode(
        $config,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    ) . ';</script>';

    return str_ireplace('</body>', $script . "\n</body>", $html);
}

/**
 * Ensure Woo cart object exists for frontend/AJAX operations.
 */
function purplebox_static_ensure_wc_cart() {
    if (!class_exists('WooCommerce') || !function_exists('WC')) {
        return false;
    }

    if (null === WC()->cart && function_exists('wc_load_cart')) {
        wc_load_cart();
    }

    return (WC()->cart instanceof WC_Cart);
}

/**
 * Normalize Woo cart data for store UI.
 */
function purplebox_static_get_wc_cart_payload() {
    if (!purplebox_static_ensure_wc_cart()) {
        return [
            'items' => [],
            'count' => 0,
            'subtotal_label' => 'AED 0',
            'subtotal_num' => 0,
        ];
    }

    $currency_symbol = function_exists('get_woocommerce_currency_symbol')
        ? (string) get_woocommerce_currency_symbol()
        : 'AED';

    $format_money = static function ($value) use ($currency_symbol) {
        $num = (float) $value;
        $text = rtrim(rtrim(number_format($num, 2, '.', ''), '0'), '.');
        return trim($currency_symbol . ' ' . $text);
    };

    $items = [];
    foreach (WC()->cart->get_cart() as $cart_key => $cart_item) {
        if (empty($cart_item['data']) || !is_a($cart_item['data'], 'WC_Product')) {
            continue;
        }

        $product = $cart_item['data'];
        $product_id = (int) $product->get_id();
        $qty = max(1, (int) $cart_item['quantity']);

        $terms = get_the_terms($product_id, 'product_cat');
        $cat = 'Product';
        if (is_array($terms) && !empty($terms)) {
            $first = reset($terms);
            if ($first && isset($first->name)) {
                $cat = sanitize_text_field((string) $first->name);
            }
        }

        $line_total_num = (float) $cart_item['line_total'];
        $unit_price_num = $qty > 0 ? ($line_total_num / $qty) : 0;

        $items[] = [
            'cart_key' => (string) $cart_key,
            'product_id' => $product_id,
            'name' => sanitize_text_field((string) $product->get_name()),
            'category' => $cat,
            'qty' => $qty,
            'price_num' => $unit_price_num,
            'price_label' => $format_money($unit_price_num),
            'line_total_num' => $line_total_num,
            'line_total_label' => $format_money($line_total_num),
        ];
    }

    $subtotal_num = (float) WC()->cart->get_subtotal();

    return [
        'items' => $items,
        'count' => (int) WC()->cart->get_cart_contents_count(),
        'subtotal_label' => $format_money($subtotal_num),
        'subtotal_num' => $subtotal_num,
    ];
}

function purplebox_static_ajax_store_cart_get() {
    wp_send_json_success(purplebox_static_get_wc_cart_payload());
}

function purplebox_static_ajax_store_cart_add() {
    check_ajax_referer('pbx_store_cart', 'nonce');

    if (!purplebox_static_ensure_wc_cart()) {
        wp_send_json_error(['message' => 'WooCommerce cart not available.']);
    }

    $product_id = isset($_POST['product_id']) ? (int) $_POST['product_id'] : 0;
    $qty = isset($_POST['qty']) ? max(1, (int) $_POST['qty']) : 1;

    if ($product_id <= 0) {
        wp_send_json_error(['message' => 'Invalid product.']);
    }

    $added = WC()->cart->add_to_cart($product_id, $qty);
    if (!$added) {
        wp_send_json_error(['message' => 'Unable to add product to cart.']);
    }

    wp_send_json_success(purplebox_static_get_wc_cart_payload());
}

function purplebox_static_ajax_store_cart_set_qty() {
    check_ajax_referer('pbx_store_cart', 'nonce');

    if (!purplebox_static_ensure_wc_cart()) {
        wp_send_json_error(['message' => 'WooCommerce cart not available.']);
    }

    $cart_key = isset($_POST['cart_key']) ? wc_clean((string) $_POST['cart_key']) : '';
    $qty = isset($_POST['qty']) ? max(0, (int) $_POST['qty']) : 0;

    if ($cart_key === '') {
        wp_send_json_error(['message' => 'Invalid cart key.']);
    }

    if ($qty <= 0) {
        WC()->cart->remove_cart_item($cart_key);
    } else {
        WC()->cart->set_quantity($cart_key, $qty, true);
    }

    wp_send_json_success(purplebox_static_get_wc_cart_payload());
}

function purplebox_static_ajax_store_cart_clear() {
    check_ajax_referer('pbx_store_cart', 'nonce');

    if (!purplebox_static_ensure_wc_cart()) {
        wp_send_json_error(['message' => 'WooCommerce cart not available.']);
    }

    WC()->cart->empty_cart();
    wp_send_json_success(purplebox_static_get_wc_cart_payload());
}

add_action('wp_ajax_pbx_store_cart_get', 'purplebox_static_ajax_store_cart_get');
add_action('wp_ajax_nopriv_pbx_store_cart_get', 'purplebox_static_ajax_store_cart_get');
add_action('wp_ajax_pbx_store_cart_add', 'purplebox_static_ajax_store_cart_add');
add_action('wp_ajax_nopriv_pbx_store_cart_add', 'purplebox_static_ajax_store_cart_add');
add_action('wp_ajax_pbx_store_cart_set_qty', 'purplebox_static_ajax_store_cart_set_qty');
add_action('wp_ajax_nopriv_pbx_store_cart_set_qty', 'purplebox_static_ajax_store_cart_set_qty');
add_action('wp_ajax_pbx_store_cart_clear', 'purplebox_static_ajax_store_cart_clear');
add_action('wp_ajax_nopriv_pbx_store_cart_clear', 'purplebox_static_ajax_store_cart_clear');

/**
 * ═══ PBX Analytics: Session Tracking ═══
 * Custom table to store behavioral tracking sessions from pbx-tracking.js
 */

// Create table on theme activation
function pbx_analytics_create_table() {
    global $wpdb;
    $table = $wpdb->prefix . 'pbx_sessions';
    $charset = $wpdb->get_charset_collate();
    $sql = "CREATE TABLE IF NOT EXISTS $table (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(120) NOT NULL,
        page_name VARCHAR(200) NOT NULL DEFAULT '',
        started_at BIGINT UNSIGNED NOT NULL DEFAULT 0,
        ip_address VARCHAR(45) NOT NULL DEFAULT '',
        user_agent VARCHAR(500) NOT NULL DEFAULT '',
        events LONGTEXT NOT NULL,
        total_time_sec INT UNSIGNED NOT NULL DEFAULT 0,
        engaged_time_sec INT UNSIGNED NOT NULL DEFAULT 0,
        max_scroll_pct TINYINT UNSIGNED NOT NULL DEFAULT 0,
        form_submitted TINYINT(1) NOT NULL DEFAULT 0,
        form_abandoned TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_id (session_id),
        INDEX idx_page_name (page_name),
        INDEX idx_created_at (created_at)
    ) $charset;";
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}
add_action('after_switch_theme', 'pbx_analytics_create_table');

// Ensure table exists for existing installs
function pbx_analytics_maybe_create_table() {
    if (get_option('pbx_analytics_table_version') === '1.0') return;
    pbx_analytics_create_table();
    update_option('pbx_analytics_table_version', '1.0', false);
}
add_action('init', 'pbx_analytics_maybe_create_table', 30);

// AJAX: Receive session data from frontend
function pbx_analytics_save_session() {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!is_array($data) || empty($data['session_id']) || empty($data['events'])) {
        wp_send_json_error(['message' => 'Invalid session data.']);
    }

    global $wpdb;
    $table = $wpdb->prefix . 'pbx_sessions';

    $session_id = sanitize_text_field($data['session_id']);
    $page_name = sanitize_text_field($data['page_name'] ?? '');
    $started_at = absint($data['started_at'] ?? 0);
    $events_json = wp_json_encode($data['events']);
    $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? '');
    $ua = sanitize_text_field(substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500));

    // Extract summary from session_end event
    $total_time = 0;
    $engaged_time = 0;
    $max_scroll = 0;
    $form_submitted = 0;
    $form_abandoned = 0;

    foreach ($data['events'] as $evt) {
        if (($evt['event'] ?? '') === 'lp_session_end') {
            $total_time = absint($evt['total_time_sec'] ?? 0);
            $engaged_time = absint($evt['engaged_time_sec'] ?? 0);
            $max_scroll = min(100, absint($evt['max_scroll_pct'] ?? 0));
            $form_submitted = !empty($evt['form_submitted']) ? 1 : 0;
            $form_abandoned = !empty($evt['form_abandoned']) ? 1 : 0;
        }
    }

    // Upsert: update if session_id exists, insert otherwise
    $existing = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM $table WHERE session_id = %s LIMIT 1",
        $session_id
    ));

    if ($existing) {
        $wpdb->update($table, [
            'events' => $events_json,
            'total_time_sec' => $total_time,
            'engaged_time_sec' => $engaged_time,
            'max_scroll_pct' => $max_scroll,
            'form_submitted' => $form_submitted,
            'form_abandoned' => $form_abandoned,
        ], ['id' => $existing]);
    } else {
        $wpdb->insert($table, [
            'session_id' => $session_id,
            'page_name' => $page_name,
            'started_at' => $started_at,
            'ip_address' => $ip,
            'user_agent' => $ua,
            'events' => $events_json,
            'total_time_sec' => $total_time,
            'engaged_time_sec' => $engaged_time,
            'max_scroll_pct' => $max_scroll,
            'form_submitted' => $form_submitted,
            'form_abandoned' => $form_abandoned,
        ]);
    }

    wp_send_json_success(['saved' => true]);
}
add_action('wp_ajax_pbx_analytics_save', 'pbx_analytics_save_session');
add_action('wp_ajax_nopriv_pbx_analytics_save', 'pbx_analytics_save_session');

// AJAX: Read sessions for dashboard
function pbx_analytics_get_sessions() {
    // Optional: restrict to admins only
    // if (!current_user_can('manage_options')) { wp_send_json_error(['message' => 'Unauthorized']); }

    global $wpdb;
    $table = $wpdb->prefix . 'pbx_sessions';

    $limit = min(200, absint($_GET['limit'] ?? 100));
    $page_filter = sanitize_text_field($_GET['page_name'] ?? '');
    $days = absint($_GET['days'] ?? 7);

    $where = $wpdb->prepare("WHERE created_at >= DATE_SUB(NOW(), INTERVAL %d DAY)", $days);
    if ($page_filter) {
        $where .= $wpdb->prepare(" AND page_name = %s", $page_filter);
    }

    $rows = $wpdb->get_results(
        "SELECT session_id, page_name, started_at, ip_address, user_agent, events,
                total_time_sec, engaged_time_sec, max_scroll_pct,
                form_submitted, form_abandoned, created_at
         FROM $table $where ORDER BY created_at DESC LIMIT $limit",
        ARRAY_A
    );

    if (!is_array($rows)) $rows = [];

    // Decode events JSON
    foreach ($rows as &$row) {
        $row['events'] = json_decode($row['events'], true) ?: [];
        $row['total_time_sec'] = (int) $row['total_time_sec'];
        $row['engaged_time_sec'] = (int) $row['engaged_time_sec'];
        $row['max_scroll_pct'] = (int) $row['max_scroll_pct'];
        $row['form_submitted'] = (bool) $row['form_submitted'];
        $row['form_abandoned'] = (bool) $row['form_abandoned'];
    }

    // Summary stats
    $stats = $wpdb->get_row(
        "SELECT COUNT(*) as total_sessions,
                ROUND(AVG(engaged_time_sec)) as avg_engaged,
                ROUND(AVG(max_scroll_pct)) as avg_scroll,
                SUM(form_submitted) as total_submits,
                SUM(form_abandoned) as total_abandoned
         FROM $table $where",
        ARRAY_A
    );

    wp_send_json_success([
        'sessions' => $rows,
        'stats' => $stats ?: [],
    ]);
}
add_action('wp_ajax_pbx_analytics_get', 'pbx_analytics_get_sessions');
add_action('wp_ajax_nopriv_pbx_analytics_get', 'pbx_analytics_get_sessions');

/**
 * Inject analytics endpoint config into pages that have tracking.
 */
function pbx_analytics_inject_config($html) {
    if (!is_string($html) || stripos($html, '</body>') === false) return $html;
    $config = [
        'saveUrl' => admin_url('admin-ajax.php') . '?action=pbx_analytics_save',
        'readUrl' => admin_url('admin-ajax.php') . '?action=pbx_analytics_get',
    ];
    $script = '<script>window.PBXAnalyticsConfig=' . wp_json_encode($config, JSON_UNESCAPED_SLASHES) . ';</script>';
    return str_ireplace('</body>', $script . "\n</body>", $html);
}

// Serve static pages from /static-pages/ for matching slugs.
add_filter('template_include', function ($template) {
    // Do not hijack WooCommerce routes; let Woo templates render normally.
    if (function_exists('is_woocommerce') && (
        is_woocommerce() ||
        is_cart() ||
        is_checkout() ||
        is_account_page() ||
        is_singular('product') ||
        is_product_category() ||
        is_product_tag()
    )) {
        return $template;
    }

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
        $html = purplebox_static_inject_store_config($html);
    }

    if ($slug === 'index' || $slug === 'product') {
        $html = purplebox_static_inject_pack_products($html);
    }

    if ($slug === 'index' || $slug === 'reserve-step-3' || $slug === 'landing-local-storage-facility-in-dubai' || $slug === 'packing-moving' || $slug === 'vehicle-storage-dubai') {
        $html = purplebox_static_inject_reservation_lead_config($html);
    }

    $html = purplebox_static_inject_layout_partials($html);
    $html = purplebox_static_rewrite_asset_urls($html);
    $html = pbx_analytics_inject_config($html);

    status_header(200);
    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit;
});
