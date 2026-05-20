<?php
if (!defined('ABSPATH')) {
    exit;
}
?>
</main>

<footer class="site-footer">
    <div class="container">
        <div class="footer-grid">
            <div>
                <div class="footer-logo"><?php bloginfo('name'); ?></div>
                <p class="footer-tagline">Premium climate-controlled self-storage in Al Quoz 2, Dubai.</p>
                <div class="flex gap-12 mt-24" style="flex-wrap:wrap;">
                    <a href="https://wa.me/971542249946" class="btn btn-wa btn-sm" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
                    <a href="tel:+971542249946" class="btn btn-ghost btn-sm" style="color:#ccc;border-color:#444;">📞 Call</a>
                </div>
            </div>
            <div>
                <div class="footer-heading">Storage</div>
                <div class="footer-links">
                    <a href="<?php echo esc_url(home_url('/storage')); ?>">All storage types</a>
                    <a href="<?php echo esc_url(home_url('/pricing')); ?>">Unit Sizes &amp; Prices</a>
                    <a href="<?php echo esc_url(home_url('/size-guide')); ?>">Size Guide</a>
                </div>
            </div>
            <div>
                <div class="footer-heading">Services</div>
                <div class="footer-links">
                    <a href="<?php echo esc_url(home_url('/packing-moving')); ?>">Packing &amp; Moving</a>
                    <a href="<?php echo esc_url(home_url('/store')); ?>">Supplies Store</a>
                    <a href="<?php echo esc_url(home_url('/facility')); ?>">Our Facility</a>
                </div>
            </div>
            <div>
                <div class="footer-heading">Company</div>
                <div class="footer-links">
                    <a href="<?php echo esc_url(home_url('/about')); ?>">About Us</a>
                    <a href="<?php echo esc_url(home_url('/location')); ?>">Location</a>
                    <a href="<?php echo esc_url(home_url('/contact')); ?>">Contact</a>
                    <a href="<?php echo esc_url(home_url('/faq')); ?>">FAQ</a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div>&copy; <?php echo esc_html(date('Y')); ?> <?php bloginfo('name'); ?> · Al Quoz 2, Dubai, UAE</div>
            <div class="footer-bottom-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms</a>
            </div>
        </div>
    </div>
</footer>

<a href="https://wa.me/971542249946" class="wa-float" target="_blank" rel="noopener noreferrer">💬</a>

<div class="mobile-cta">
    <a href="https://wa.me/971542249946" class="btn btn-wa btn-full" target="_blank" rel="noopener noreferrer">💬 WhatsApp</a>
    <a href="https://wa.me/971542249946?text=Hi%20PurpleBox%2C%20I%20want%20to%20book%20a%20storage%20unit." class="btn btn-primary btn-full" target="_blank" rel="noopener noreferrer">Reserve</a>
</div>

<?php wp_footer(); ?>
</body>
</html>
