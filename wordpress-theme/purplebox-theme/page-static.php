<?php
/*
Template Name: Static Imported Page
*/

get_header();

if (have_posts()) {
    while (have_posts()) {
        the_post();
        $slug = get_post_field('post_name', get_the_ID());
        if (!function_exists('purplebox_render_static_section') || !purplebox_render_static_section($slug)) {
            echo '<section class="section"><div class="container prose">';
            the_content();
            echo '</div></section>';
        }
    }
}

get_footer();
