<?php
get_header();
?>
<section class="section">
    <div class="container text-center">
        <h1>404</h1>
        <p>Page not found. Let us help you get back.</p>
        <a class="btn btn-primary" href="<?php echo esc_url(home_url('/')); ?>">Back to Home</a>
    </div>
</section>
<?php
get_footer();
