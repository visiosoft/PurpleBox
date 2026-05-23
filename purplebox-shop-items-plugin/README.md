PurpleBox Shop Items Plugin

What it does
- Adds a WordPress admin menu: PurpleBox Shop
- Lets you add/edit/remove shop items with:
  - Image URL
  - Item name
  - Dimensions
  - AED price
- Includes default item:
  - Large Box
  - 60 x 45 x 45 cm
  - AED 16
- Provides shortcode to render items on any page:
  [purplebox_shop_items]
- Shortcode output uses store-compatible classes:
  - shop-grid, shop-card, shop-media, shop-title, shop-spec, shop-price, shop-actions
- Add to cart buttons write to the same localStorage keys used by your existing store flow:
  - pbCartItems
  - pbCartCount
- Captures reservation leads from /reserve-step-3.html into database
- Sends lead notification email to contact@purplebox.ae
- Adds admin page for daily leads: PurpleBox Shop -> Daily Leads

Install
1. Copy folder purplebox-shop-items-plugin to your WordPress plugins directory:
   wp-content/plugins/purplebox-shop-items-plugin
2. Activate PurpleBox Shop Items from WordPress Admin > Plugins.

Use
1. Go to WordPress Admin > PurpleBox Shop.
2. Add or edit items.
3. Click Save Shop Items.
4. Add shortcode [purplebox_shop_items] to your Shop page content.
5. Check reservation leads in WordPress Admin -> PurpleBox Shop -> Daily Leads.

Email delivery (SMTP)
- The plugin sends emails via wp_mail() to contact@purplebox.ae.
- For reliable delivery, configure SMTP on your WordPress site (recommended).
- Required SMTP details:
  - SMTP host
  - SMTP port
  - Encryption (TLS or SSL)
  - SMTP username
  - SMTP password or app password
  - From email (preferably same domain as your site)
- Also configure DNS for better deliverability:
  - SPF
  - DKIM
  - DMARC
- Quick setup option: install an SMTP plugin (for example WP Mail SMTP) and test with its email test tool.

Files
- purplebox-shop-items-plugin.php
- assets/admin.js
- assets/admin.css
- assets/public.css
- assets/public.js
