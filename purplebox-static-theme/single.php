<?php
if (!defined('ABSPATH')) {
    exit;
}

get_header();
?>
<section class="pbx-blog-hero pbx-blog-hero-single">
  <div class="pbx-blog-container pbx-blog-hero-inner">
    <p class="label mb-8">PurpleBox Journal</p>
    <h1><?php the_title(); ?></h1>
    <p class="pbx-blog-intro">
      <span><?php echo esc_html(get_the_date('d M Y')); ?></span>
      <span aria-hidden="true">&middot;</span>
      <span><?php echo esc_html(get_the_author()); ?></span>
    </p>
  </div>
</section>

<section class="section pbx-single-shell">
  <div class="pbx-blog-container pbx-single-layout">
    <main class="pbx-single-main" aria-label="Blog article">
      <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
        <article class="pbx-single-article">
          <?php if (has_post_thumbnail()) : ?>
            <div class="pbx-single-thumb"><?php the_post_thumbnail('full', ['loading' => 'lazy']); ?></div>
          <?php endif; ?>

          <div class="pbx-single-content">
            <?php the_content(); ?>
          </div>

          <footer class="pbx-single-footer">
            <div class="pbx-single-cats">
              <?php the_category(' '); ?>
            </div>
            <a class="btn btn-primary" href="<?php echo esc_url(get_permalink(get_option('page_for_posts')) ?: home_url('/blog/')); ?>">Back to Blog</a>
          </footer>
        </article>
      <?php endwhile; endif; ?>
    </main>

    <aside class="pbx-blog-aside" aria-label="Article sidebar">
      <section class="pbx-side-card">
        <h3>Recent Posts</h3>
        <ul>
          <?php
          wp_list_posts([
              'numberposts' => 6,
              'post_status' => 'publish',
              'post_type' => 'post',
              'title_li' => '',
          ]);
          ?>
        </ul>
      </section>
    </aside>
  </div>
</section>
<?php
get_footer();
