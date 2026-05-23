<?php
if (!defined('ABSPATH')) {
    exit;
}

$html_file = __DIR__ . '/reserve-step-3.html';
if (!file_exists($html_file)) {
    status_header(404);
    echo 'Reserve page not found.';
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
