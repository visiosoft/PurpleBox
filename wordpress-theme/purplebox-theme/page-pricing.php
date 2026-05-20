<?php
get_header();
?>

<section class="page-hero">
  <div class="container">
    <nav class="breadcrumb"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a><span>›</span> Pricing</nav>
    <h1>Storage prices in Dubai</h1>
    <p>Transparent monthly rates with no setup fees and flexible terms.</p>
    <div class="hero-btns mt-24">
      <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20pricing%20details." class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">Book Now</a>
      <a href="<?php echo esc_url(home_url('/size-guide')); ?>" class="btn btn-outline btn-lg">Size Guide</a>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <p class="label mb-8">Sizes & starting prices</p>
    <h2 class="mb-8">Choose your unit size</h2>
    <p class="mb-24 text-muted">Starting prices shown. Final rate depends on term length and VAT applies.</p>
    <div class="grid-5" style="gap:16px;">
      <div class="card" style="text-align:center;"><h3>5×5</h3><p>Small closet</p><p><strong>from AED ___</strong></p></div>
      <div class="card" style="text-align:center;"><h3>5×10</h3><p>Studio worth</p><p><strong>from AED ___</strong></p></div>
      <div class="card" style="text-align:center;border-color:var(--purple);"><h3>10×10</h3><p>Most popular</p><p><strong>from AED ___</strong></p></div>
      <div class="card" style="text-align:center;"><h3>10×15</h3><p>3BR / villa</p><p><strong>from AED ___</strong></p></div>
      <div class="card" style="text-align:center;"><h3>10×20</h3><p>Large villa</p><p><strong>from AED ___</strong></p></div>
    </div>
  </div>
</section>

<section style="background:var(--purple);padding:72px 0;text-align:center;">
  <div class="container">
    <h2 style="color:white;margin-bottom:16px;">Need help choosing size?</h2>
    <p style="color:rgba(255,255,255,.8);margin-bottom:28px;">Send photos on WhatsApp and get a quick recommendation.</p>
    <a href="https://wa.me/971542249946" class="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer">💬 WhatsApp Us</a>
  </div>
</section>

<?php
get_footer();
