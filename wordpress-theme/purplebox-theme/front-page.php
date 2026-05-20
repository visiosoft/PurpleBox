<?php
get_header();
?>

<?php if (!function_exists('purplebox_render_static_section') || !purplebox_render_static_section('index')) : ?>

<section class="page-hero">
    <div class="container">
        <h1>Premium Self-Storage in Al Quoz, Dubai</h1>
        <p>Climate-controlled units from closet to villa size. Flexible monthly terms, no long contracts, no hidden fees.</p>
        <div class="hero-btns mt-24">
            <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20a%20storage%20quote." class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">Book Now</a>
            <a href="<?php echo esc_url(home_url('/pricing')); ?>" class="btn btn-outline btn-lg">Unit Sizes &amp; Prices</a>
        </div>
    </div>
</section>

<section class="section">
    <div class="container">
        <p class="label mb-8">Why choose PurpleBox</p>
        <h2 class="mb-24">Storage that feels premium and easy</h2>
        <div class="grid-3">
            <div class="card">
                <h3 class="mb-8">Climate-Controlled</h3>
                <p>AC + humidity control protects furniture, documents, clothes, and electronics.</p>
            </div>
            <div class="card">
                <h3 class="mb-8">24/7 Secure Access</h3>
                <p>Access your unit whenever you need with CCTV and controlled entry points.</p>
            </div>
            <div class="card">
                <h3 class="mb-8">Flexible Monthly Terms</h3>
                <p>No long-term lock-ins. Continue month-to-month after your first month.</p>
            </div>
        </div>
    </div>
</section>

<section class="section" style="background:var(--cream);">
    <div class="container text-center">
        <h2 class="mb-16">Ready to free up your space?</h2>
        <p class="mb-24">Reserve online or WhatsApp us for a fast recommendation.</p>
        <div class="flex gap-12" style="justify-content:center;flex-wrap:wrap;">
            <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20to%20reserve%20a%20unit." class="btn btn-primary btn-lg" target="_blank" rel="noopener noreferrer">Book Now</a>
            <a href="https://wa.me/971542249946" class="btn btn-wa btn-lg" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
        </div>
    </div>
</section>

<?php endif; ?>

<?php
get_footer();
