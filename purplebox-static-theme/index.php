<?php
// Required fallback template for WordPress theme validation.
// Static page rendering is handled in functions.php via template_include.

status_header(404);
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<main style="max-width: 780px; margin: 80px auto; padding: 0 16px; font-family: Arial, sans-serif; line-height: 1.6;">
    <h1>Page Not Found</h1>
    <p>This theme serves static files from the static-pages folder.</p>
    <p><a href="<?php echo esc_url(home_url('/')); ?>">Return to home page</a></p>
</main>
<?php wp_footer(); ?>
</body>
</html>
