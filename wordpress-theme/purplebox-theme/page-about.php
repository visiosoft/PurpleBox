<?php
get_header();
?>

<section class="page-hero">
  <div class="container">
    <nav class="breadcrumb"><a href="<?php echo esc_url(home_url('/')); ?>">Home</a><span>›</span> About</nav>
    <div class="grid-2" style="align-items:center;gap:28px;">
      <div>
        <h1>About PurpleBox</h1>
        <p style="margin:16px 0 28px;">We built PurpleBox because storage in Dubai felt hidden, complicated, or expensive. We wanted something premium that still feels easy.</p>
        <div class="hero-btns">
          <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20a%20quote." class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">Get a Quote</a>
          <a href="<?php echo esc_url(home_url('/contact')); ?>" class="btn btn-ghost btn-lg">Book a Visit</a>
        </div>
      </div>
      <div class="img-placeholder" style="min-height:300px;">Founder / facility photo</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <p class="label mb-8">Our philosophy</p>
    <h2 class="mb-24">Why self-storage done right</h2>
    <div class="grid-3">
      <div class="card"><h3 style="margin-bottom:8px;">Flexibility</h3><p>Month-to-month terms with no complicated lock-ins.</p></div>
      <div class="card"><h3 style="margin-bottom:8px;">Security</h3><p>Purpose-built facility with monitored access and CCTV.</p></div>
      <div class="card"><h3 style="margin-bottom:8px;">Service</h3><p>Pickup, packing, moving, and storage under one team.</p></div>
    </div>
  </div>
</section>

<section style="background:var(--purple);padding:48px 0;text-align:center;">
  <div class="container">
    <h2 style="color:white;margin-bottom:16px;">Start storing today</h2>
    <p style="color:rgba(255,255,255,.8);margin-bottom:28px;">Reserve online or WhatsApp us for a quick chat about your needs.</p>
    <div class="flex gap-12" style="justify-content:center;flex-wrap:wrap;">
      <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20to%20book%20storage." class="btn btn-lg" style="background:white;color:var(--purple);" target="_blank" rel="noopener noreferrer">Book Now</a>
      <a href="https://wa.me/971542249946" class="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
    </div>
  </div>
</section>

<?php
get_footer();
