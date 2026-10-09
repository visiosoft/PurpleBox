<?php
// Fallback template for routes not served from /static-pages.
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-SWD86TM761"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-SWD86TM761');
</script>

    <link rel="icon" type="image/png" href="http://purplebox.ae/wp-content/uploads/2026/06/favicon.png" />
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <?php wp_head(); ?>
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "yuzxdljgn6");
</script>
</head>
<body <?php body_class(); ?>>
<main style="max-width: 900px; margin: 48px auto; padding: 0 16px; font-family: Arial, sans-serif; line-height: 1.6;">
<?php if (have_posts()) : ?>
    <?php while (have_posts()) : the_post(); ?>
        <article>
            <h1><?php the_title(); ?></h1>
            <div><?php the_content(); ?></div>
        </article>
    <?php endwhile; ?>
<?php else : ?>
    <?php status_header(404); ?>
    <h1>Page Not Found</h1>
    <p>This page could not be found.</p>
    <p><a href="<?php echo esc_url(home_url('/')); ?>">Return to home page</a></p>
<?php endif; ?>
</main>
<?php wp_footer(); ?>
</body>
</html>
