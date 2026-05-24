<?php
if (!defined('ABSPATH')) {
    exit;
}

$html_candidates = [
    __DIR__ . '/reserve-step-3.html',
    get_template_directory() . '/static-pages/reserve-step-3.html',
    ABSPATH . 'reserve-step-3.html',
];

$html_file = '';
foreach ($html_candidates as $candidate) {
    if (is_string($candidate) && $candidate !== '' && file_exists($candidate)) {
        $html_file = $candidate;
        break;
    }
}

if ($html_file === '') {
    wp_safe_redirect(home_url('/reserve-step-2.html'));
    exit;
}

$html = file_get_contents($html_file);
if (!is_string($html) || $html === '') {
    status_header(500);
    echo 'Unable to load reserve page.';
    exit;
}

$html = purplebox_static_inject_layout_partials($html);
$html = purplebox_static_inject_reservation_lead_config($html);
$html = purplebox_static_rewrite_asset_urls($html);

status_header(200);
header('Content-Type: text/html; charset=UTF-8');
echo $html;
exit;
