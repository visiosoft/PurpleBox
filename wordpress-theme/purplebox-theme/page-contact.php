<?php
get_header();
?>

<section class="page-hero">
  <div class="container">
    <nav class="breadcrumb"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a><span>›</span> Contact</nav>
    <h1>Get in touch</h1>
    <p>The fastest way is WhatsApp. We typically reply within 30 minutes during working hours.</p>
    <div class="hero-btns mt-24">
      <a href="https://wa.me/971542249946" class="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer">💬 WhatsApp Us</a>
      <a href="tel:+971542249946" class="btn btn-outline btn-lg">📞 Call Now</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="grid-2" style="align-items:start;gap:28px;">
      <div class="card">
        <h2 style="margin-bottom:16px;">Contact channels</h2>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/971542249946" target="_blank" rel="noopener noreferrer">+971 54 224 9946</a></p>
        <p><strong>Phone:</strong> <a href="tel:+971542249946">+971 54 224 9946</a></p>
        <p><strong>Email:</strong> <a href="mailto:hello@purplebox.ae">hello@purplebox.ae</a></p>
        <p><strong>Location:</strong> Al Quoz 2, Dubai</p>
      </div>

      <div class="card">
        <h2 style="margin-bottom:18px;">Send us a message</h2>
        <?php while (have_posts()) : the_post(); ?>
          <?php the_content(); ?>
        <?php endwhile; ?>
      </div>
    </div>
  </div>
</section>

<?php
get_footer();
