<?php
/*
Template Name: Blog Listing
*/

if (!defined('ABSPATH')) {
    exit;
}

$paged = max(1, (int) get_query_var('paged'));
$query = new WP_Query([
    'post_type' => 'post',
    'post_status' => 'publish',
    'paged' => $paged,
]);

get_header();
?>
<section class="pbx-blog-hero">
  <div class="pbx-blog-container pbx-blog-hero-inner">
    <p class="label mb-8">PurpleBox Journal</p>
    <h1>Storage tips, moving guides, and Dubai updates</h1>
    <p class="pbx-blog-intro">Fresh posts from our team. Publish from WordPress backend and every article appears here automatically.</p>
  </div>
</section>

<section class="section pbx-blog-shell">
  <div class="pbx-blog-container pbx-blog-layout">
    <main class="pbx-blog-list" aria-label="Blog posts">
      <?php if ($query->have_posts()) : ?>
        <div class="pbx-blog-grid">
          <?php while ($query->have_posts()) : $query->the_post(); ?>
            <article class="pbx-post-card">
              <a class="pbx-post-link" href="<?php the_permalink(); ?>" aria-label="Read <?php the_title_attribute(); ?>">
                <?php if (has_post_thumbnail()) : ?>
                  <div class="pbx-post-thumb"><?php the_post_thumbnail('large', ['loading' => 'lazy']); ?></div>
                <?php else : ?>
                  <div class="pbx-post-thumb pbx-post-thumb-fallback"><span>PurpleBox</span></div>
                <?php endif; ?>

                <div class="pbx-post-body">
                  <p class="pbx-post-meta">
                    <span><?php echo esc_html(get_the_date('d M Y')); ?></span>
                    <span aria-hidden="true">&middot;</span>
                    <span><?php echo esc_html(get_the_author()); ?></span>
                  </p>
                  <h2><?php the_title(); ?></h2>
                  <p class="pbx-post-excerpt"><?php echo esc_html(wp_trim_words(get_the_excerpt(), 24)); ?></p>
                  <span class="pbx-read-more">Read article</span>
                </div>
              </a>
            </article>
          <?php endwhile; ?>
        </div>

        <nav class="pbx-pagination" aria-label="Blog pagination">
          <?php
          echo paginate_links([
              'total' => (int) $query->max_num_pages,
              'current' => $paged,
              'mid_size' => 1,
              'prev_text' => 'Previous',
              'next_text' => 'Next',
          ]);
          ?>
        </nav>
      <?php else : ?>
        <article class="pbx-post-empty">
          <h2>No posts yet</h2>
          <p>Create your first post from WordPress admin and it will appear here.</p>
        </article>
      <?php endif; ?>
      <?php wp_reset_postdata(); ?>
    </main>

    <aside class="pbx-blog-aside" aria-label="Blog sidebar">
      <section class="pbx-side-card">
        <h3>Categories</h3>
        <ul>
          <?php wp_list_categories(['title_li' => '']); ?>
        </ul>
      </section>
    </aside>
  </div>
</section>
<?php
get_footer();
