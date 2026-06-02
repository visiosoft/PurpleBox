<?php
/**
 * Plugin Name: PurpleBox Shop Items
 * Description: Manage PurpleBox shop items (image, title, dimensions, and AED price) from wp-admin and render them with a shortcode.
 * Version: 1.0.0
 * Author: PurpleBox
 */

if (!defined('ABSPATH')) {
    exit;
}

final class PurpleBox_Shop_Items_Plugin {
    private const OPTION_KEY = 'pbx_shop_items_data';
    private const NONCE_ACTION = 'pbx_save_shop_items';
    private const LEADS_TABLE = 'pbx_reservation_leads';
    private const LEAD_NONCE_ACTION = 'pbx_submit_reservation';
    private const LEAD_FORM_NONCE_ACTION = 'pbx_submit_reservation_form';

    public function __construct() {
        add_action('admin_menu', [$this, 'register_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_post_pbx_save_shop_items', [$this, 'handle_save']);
        add_action('plugins_loaded', [$this, 'maybe_upgrade_schema']);

        add_action('wp_ajax_pbx_submit_reservation', [$this, 'handle_reservation_submission']);
        add_action('wp_ajax_nopriv_pbx_submit_reservation', [$this, 'handle_reservation_submission']);
        add_action('admin_post_pbx_submit_reservation_form', [$this, 'handle_reservation_form_submission']);
        add_action('admin_post_nopriv_pbx_submit_reservation_form', [$this, 'handle_reservation_form_submission']);

        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_assets']);
        add_shortcode('purplebox_shop_items', [$this, 'render_shortcode']);

        register_activation_hook(__FILE__, [$this, 'activate']);
    }

    public function activate(): void {
        $this->create_leads_table();
        $this->setup_roles();

        $existing = get_option(self::OPTION_KEY, null);
        if (null === $existing) {
            $default_items = [
                [
                    'image' => '',
                    'name' => 'Large Box',
                    'dimensions' => '60 x 45 x 45 cm',
                    'price' => '16',
                ],
            ];
            add_option(self::OPTION_KEY, $default_items);
        }
    }

    private function setup_roles(): void {
        $required_caps = [
            'pbx_manage_shop' => true,
            'read'            => true,
            'upload_files'    => true,
            'edit_posts'      => true,
        ];

        // Remove and recreate to ensure caps are up to date
        remove_role('purplebox_admin');
        add_role('purplebox_admin', 'PurpleBox Admin', $required_caps);

        // Also ensure the role object has all caps (belt and suspenders)
        $pbx_role = get_role('purplebox_admin');
        if ($pbx_role) {
            foreach ($required_caps as $cap => $grant) {
                $pbx_role->add_cap($cap, $grant);
            }
        }

        // Grant pbx_manage_shop to existing administrators so they keep access
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap('pbx_manage_shop');
        }

        update_option('pbx_roles_version', '2');
    }

    public function maybe_upgrade_schema(): void {
        $this->create_leads_table();

        // Always re-run role setup until version matches
        if (get_option('pbx_roles_version', '0') !== '2') {
            $this->setup_roles();
        }
    }

    public function register_admin_menu(): void {
        add_menu_page(
            'PurpleBox Shop Items',
            'PurpleBox Shop',
            'pbx_manage_shop',
            'pbx-shop-items',
            [$this, 'render_admin_page'],
            'dashicons-products',
            56
        );

        add_submenu_page(
            'pbx-shop-items',
            'PurpleBox Daily Leads',
            'Daily Leads',
            'pbx_manage_shop',
            'pbx-daily-leads',
            [$this, 'render_leads_admin_page']
        );

        add_submenu_page(
            'pbx-shop-items',
            'PurpleBox Storage Leads',
            'Storage Leads',
            'pbx_manage_shop',
            'pbx-storage-leads',
            [$this, 'render_storage_leads_admin_page']
        );

        add_submenu_page(
            'pbx-shop-items',
            'PurpleBox Packing Leads',
            'Packing & Moving Leads',
            'pbx_manage_shop',
            'pbx-packing-leads',
            [$this, 'render_packing_leads_admin_page']
        );
    }

    public function enqueue_admin_assets(string $hook): void {
        if ('toplevel_page_pbx-shop-items' !== $hook) {
            return;
        }

        wp_enqueue_style(
            'pbx-shop-admin',
            plugin_dir_url(__FILE__) . 'assets/admin.css',
            [],
            '1.0.0'
        );

        wp_enqueue_script(
            'pbx-shop-admin',
            plugin_dir_url(__FILE__) . 'assets/admin.js',
            [],
            '1.0.0',
            true
        );
    }

    public function enqueue_public_assets(): void {
        wp_enqueue_style(
            'pbx-shop-public',
            plugin_dir_url(__FILE__) . 'assets/public.css',
            [],
            '1.0.0'
        );

        wp_enqueue_script(
            'pbx-shop-public',
            plugin_dir_url(__FILE__) . 'assets/public.js',
            [],
            '1.0.0',
            true
        );
    }

    public function render_admin_page(): void {
        if (!current_user_can('pbx_manage_shop')) {
            return;
        }

        $items = $this->get_items();
        ?>
        <div class="wrap pbx-wrap">
            <h1>PurpleBox Shop Items</h1>
            <p>Add and update shop products from here. Use image URL or WordPress media URL.</p>

            <?php if (!empty($_GET['updated'])) : ?>
                <div class="notice notice-success is-dismissible">
                    <p>Shop items updated successfully.</p>
                </div>
            <?php endif; ?>

            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <input type="hidden" name="action" value="pbx_save_shop_items" />
                <?php wp_nonce_field(self::NONCE_ACTION, 'pbx_nonce'); ?>

                <div id="pbx-items-list" class="pbx-items-list">
                    <?php foreach ($items as $index => $item) : ?>
                        <div class="pbx-item-row" data-index="<?php echo esc_attr((string) $index); ?>">
                            <h3>Item <span class="pbx-item-number"><?php echo esc_html((string) ($index + 1)); ?></span></h3>
                            <div class="pbx-grid">
                                <label>
                                    Image URL
                                    <input type="url" name="items[<?php echo esc_attr((string) $index); ?>][image]" value="<?php echo esc_attr($item['image']); ?>" placeholder="https://example.com/item.webp" />
                                </label>
                                <label>
                                    Item Name
                                    <input type="text" name="items[<?php echo esc_attr((string) $index); ?>][name]" value="<?php echo esc_attr($item['name']); ?>" placeholder="Large Box" required />
                                </label>
                                <label>
                                    Dimensions
                                    <input type="text" name="items[<?php echo esc_attr((string) $index); ?>][dimensions]" value="<?php echo esc_attr($item['dimensions']); ?>" placeholder="60 x 45 x 45 cm" required />
                                </label>
                                <label>
                                    Price (AED)
                                    <input type="number" name="items[<?php echo esc_attr((string) $index); ?>][price]" value="<?php echo esc_attr($item['price']); ?>" min="0" step="0.01" placeholder="16" required />
                                </label>
                            </div>
                            <button type="button" class="button button-link-delete pbx-remove-item">Remove item</button>
                        </div>
                    <?php endforeach; ?>
                </div>

                <p>
                    <button type="button" class="button" id="pbx-add-item">Add Item</button>
                </p>

                <?php submit_button('Save Shop Items'); ?>
            </form>
        </div>

        <template id="pbx-item-template">
            <div class="pbx-item-row" data-index="__INDEX__">
                <h3>Item <span class="pbx-item-number">__NUMBER__</span></h3>
                <div class="pbx-grid">
                    <label>
                        Image URL
                        <input type="url" name="items[__INDEX__][image]" value="" placeholder="https://example.com/item.webp" />
                    </label>
                    <label>
                        Item Name
                        <input type="text" name="items[__INDEX__][name]" value="" placeholder="Large Box" required />
                    </label>
                    <label>
                        Dimensions
                        <input type="text" name="items[__INDEX__][dimensions]" value="" placeholder="60 x 45 x 45 cm" required />
                    </label>
                    <label>
                        Price (AED)
                        <input type="number" name="items[__INDEX__][price]" value="" min="0" step="0.01" placeholder="16" required />
                    </label>
                </div>
                <button type="button" class="button button-link-delete pbx-remove-item">Remove item</button>
            </div>
        </template>
        <?php
    }

    public function handle_save(): void {
        if (!current_user_can('pbx_manage_shop')) {
            wp_die('Unauthorized request.');
        }

        check_admin_referer(self::NONCE_ACTION, 'pbx_nonce');

        $raw_items = isset($_POST['items']) && is_array($_POST['items']) ? wp_unslash($_POST['items']) : [];
        $clean_items = [];

        foreach ($raw_items as $item) {
            if (!is_array($item)) {
                continue;
            }

            $name = isset($item['name']) ? sanitize_text_field((string) $item['name']) : '';
            $dimensions = isset($item['dimensions']) ? sanitize_text_field((string) $item['dimensions']) : '';
            $price = isset($item['price']) ? (string) floatval($item['price']) : '';
            $image = isset($item['image']) ? esc_url_raw((string) $item['image']) : '';

            if ('' === $name) {
                continue;
            }

            $clean_items[] = [
                'image' => $image,
                'name' => $name,
                'dimensions' => $dimensions,
                'price' => $price,
            ];
        }

        update_option(self::OPTION_KEY, $clean_items);

        wp_safe_redirect(
            add_query_arg(
                [
                    'page' => 'pbx-shop-items',
                    'updated' => 1,
                ],
                admin_url('admin.php')
            )
        );
        exit;
    }

    public function handle_reservation_submission(): void {
        $nonce = isset($_POST['nonce']) ? sanitize_text_field((string) wp_unslash($_POST['nonce'])) : '';
        if ($nonce !== '' && !wp_verify_nonce($nonce, self::LEAD_NONCE_ACTION)) {
            // Nonce can be stale on cached public pages. Continue with payload validation.
            // We still keep strict field sanitization and required-field checks below.
        }

        $result = $this->save_reservation_lead_from_request();

        if (!$result['success']) {
            wp_send_json_error(['message' => $result['message']], (int) $result['status']);
        }

        wp_send_json_success(['message' => 'Lead captured successfully.']);
    }

    public function handle_reservation_form_submission(): void {
        $nonce = isset($_POST['pbx_lead_nonce']) ? sanitize_text_field((string) wp_unslash($_POST['pbx_lead_nonce'])) : '';

        if (!wp_verify_nonce($nonce, self::LEAD_FORM_NONCE_ACTION)) {
            $this->redirect_after_form_submission(false, 'Invalid request. Please refresh and try again.');
        }

        $result = $this->save_reservation_lead_from_request();

        if (!$result['success']) {
            $this->redirect_after_form_submission(false, $result['message']);
        }

        $this->redirect_after_form_submission(true, 'Thank you. Your reservation was submitted successfully. You will be contacted shortly.');
    }

    private function save_reservation_lead_from_request(): array {
        $full_name = isset($_POST['full_name']) ? sanitize_text_field((string) wp_unslash($_POST['full_name'])) : '';
        $mobile = isset($_POST['mobile']) ? sanitize_text_field((string) wp_unslash($_POST['mobile'])) : '';
        $email = isset($_POST['email']) ? sanitize_email((string) wp_unslash($_POST['email'])) : '';
        $emirate = isset($_POST['emirate']) ? sanitize_text_field((string) wp_unslash($_POST['emirate'])) : '';
        $storing_for = isset($_POST['storing_for']) ? sanitize_text_field((string) wp_unslash($_POST['storing_for'])) : '';
        $move_in_date = isset($_POST['move_in_date']) ? sanitize_text_field((string) wp_unslash($_POST['move_in_date'])) : '';
        $unit_size = isset($_POST['unit_size']) ? sanitize_text_field((string) wp_unslash($_POST['unit_size'])) : '';
        $unit_label = isset($_POST['unit_label']) ? sanitize_text_field((string) wp_unslash($_POST['unit_label'])) : '';
        $monthly_rent = isset($_POST['monthly_rent']) ? (float) wp_unslash($_POST['monthly_rent']) : 0;
        $promo_code = isset($_POST['promo_code']) ? sanitize_text_field((string) wp_unslash($_POST['promo_code'])) : '';
        $supplies_total = isset($_POST['supplies_total']) ? (float) wp_unslash($_POST['supplies_total']) : 0;
        $due_today = isset($_POST['due_today']) ? (float) wp_unslash($_POST['due_today']) : 0;
        $supplies_text = isset($_POST['supplies_text']) ? sanitize_textarea_field((string) wp_unslash($_POST['supplies_text'])) : '';
        $summary_text = isset($_POST['summary_text']) ? sanitize_textarea_field((string) wp_unslash($_POST['summary_text'])) : '';
        $source_page_raw = isset($_POST['source_page']) ? esc_url_raw((string) wp_unslash($_POST['source_page'])) : '';
        $source_page = $this->limit_string($source_page_raw, 1900);
        $source_page_name_raw = isset($_POST['source_page_name']) ? sanitize_text_field((string) wp_unslash($_POST['source_page_name'])) : '';
        $source_page_name = $this->limit_string($source_page_name_raw, 190);

        if ($source_page_name === '') {
            $source_page_name = 'Reservation Lead';
        }

        if ($full_name === '' || $mobile === '') {
            return [
                'success' => false,
                'status' => 422,
                'message' => 'Name and mobile are required.',
            ];
        }

        global $wpdb;

        // Ensure table exists and structure is up to date before inserting.
        $this->create_leads_table();

        $all_values = [
            'created_at' => current_time('mysql'),
            'full_name' => $full_name,
            'mobile' => $mobile,
            'email' => $email,
            'emirate' => $emirate,
            'storing_for' => $storing_for,
            'move_in_date' => $move_in_date,
            'unit_size' => $unit_size,
            'unit_label' => $unit_label,
            'monthly_rent' => $monthly_rent,
            'promo_code' => $promo_code,
            'supplies_total' => $supplies_total,
            'due_today' => $due_today,
            'supplies_text' => $supplies_text,
            'summary_text' => $summary_text,
            'source_page' => $source_page,
            'source_page_name' => $source_page_name,
            'ip_address' => isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field((string) $_SERVER['REMOTE_ADDR']) : '',
            'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field((string) $_SERVER['HTTP_USER_AGENT']) : '',
        ];

        $format_map = [
            'created_at' => '%s',
            'full_name' => '%s',
            'mobile' => '%s',
            'email' => '%s',
            'emirate' => '%s',
            'storing_for' => '%s',
            'move_in_date' => '%s',
            'unit_size' => '%s',
            'unit_label' => '%s',
            'monthly_rent' => '%f',
            'promo_code' => '%s',
            'supplies_total' => '%f',
            'due_today' => '%f',
            'supplies_text' => '%s',
            'summary_text' => '%s',
            'source_page' => '%s',
            'source_page_name' => '%s',
            'ip_address' => '%s',
            'user_agent' => '%s',
        ];

        $existing_columns = $this->get_leads_table_columns();
        if (empty($existing_columns)) {
            return [
                'success' => false,
                'status' => 500,
                'message' => 'Leads table is not available.',
            ];
        }

        $insert_values = [];
        $insert_formats = [];

        foreach ($all_values as $column => $value) {
            if (!in_array($column, $existing_columns, true)) {
                continue;
            }
            $insert_values[$column] = $value;
            $insert_formats[] = $format_map[$column];
        }

        if (empty($insert_values)) {
            return [
                'success' => false,
                'status' => 500,
                'message' => 'Leads table columns are not compatible.',
            ];
        }

        $inserted = $wpdb->insert(
            $this->get_leads_table_name(),
            $insert_values,
            $insert_formats
        );

        if (!$inserted) {
            return [
                'success' => false,
                'status' => 500,
                'message' => 'Failed to store lead. ' . (string) $wpdb->last_error,
            ];
        }

        $subject = 'New lead - ' . $source_page_name . ' - ' . ($unit_size !== '' ? $unit_size : 'Unknown Unit');
        $body_lines = [
            'New lead received',
            '',
            'Page: ' . $source_page_name,
            'Name: ' . $full_name,
            'Mobile: ' . $mobile,
            'Email: ' . $email,
            'Emirate: ' . $emirate,
            'Storing for: ' . $storing_for,
            'Move-in date: ' . $move_in_date,
            'Unit size: ' . $unit_size,
            'Unit label: ' . $unit_label,
            'Monthly rent: AED ' . number_format($monthly_rent, 2),
            'Promo code: ' . $promo_code,
            'Supplies total: AED ' . number_format($supplies_total, 2),
            'Due today: AED ' . number_format($due_today, 2),
            '',
            'Supplies:',
            $supplies_text !== '' ? $supplies_text : 'No supplies selected',
            '',
            'Summary:',
            $summary_text,
            '',
            'Source page: ' . $source_page,
            'IP: ' . (isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field((string) $_SERVER['REMOTE_ADDR']) : ''),
            'User Agent: ' . (isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field((string) $_SERVER['HTTP_USER_AGENT']) : ''),
        ];

        wp_mail(['contact@purplebox.ae', 'zakistan@yopmail.com'], $subject, implode("\n", $body_lines));

        return [
            'success' => true,
            'status' => 200,
            'message' => 'Lead captured successfully.',
        ];
    }

    private function redirect_after_form_submission(bool $success, string $message): void {
        $source_page = isset($_POST['source_page']) ? esc_url_raw((string) wp_unslash($_POST['source_page'])) : '';
        $fallback = home_url('/reserve-step-3/');
        $target = $source_page !== '' ? $source_page : $fallback;

        $target = remove_query_arg(['lead_submitted', 'lead_message'], $target);

        $target = add_query_arg(
            [
                'lead_submitted' => $success ? '1' : '0',
                'lead_message' => $message,
            ],
            $target
        );

        wp_safe_redirect($target);
        exit;
    }

    public function render_leads_admin_page(): void {
        $this->render_filtered_leads_admin_page(
            'PurpleBox Daily Leads',
            'All leads captured from reservation and inquiry forms.',
            []
        );
    }

    public function render_storage_leads_admin_page(): void {
        $this->render_filtered_leads_admin_page(
            'PurpleBox Storage Leads',
            'Storage leads from reserve flow and local storage landing page.',
            ['Reserve Step 3', 'Landing - Local Storage Dubai']
        );
    }

    public function render_packing_leads_admin_page(): void {
        $this->render_filtered_leads_admin_page(
            'PurpleBox Packing & Moving Leads',
            'Packing and moving quote leads.',
            ['Packing & Moving Quote']
        );
    }

    private function render_filtered_leads_admin_page(string $title, string $description, array $sourceNames): void {
        if (!current_user_can('pbx_manage_shop')) {
            return;
        }

        global $wpdb;

        $selected_date = isset($_GET['lead_date']) ? sanitize_text_field((string) wp_unslash($_GET['lead_date'])) : current_time('Y-m-d');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $selected_date)) {
            $selected_date = current_time('Y-m-d');
        }

        $start = $selected_date . ' 00:00:00';
        $end = $selected_date . ' 23:59:59';

        $table = $this->get_leads_table_name();
        $sql = "SELECT * FROM {$table} WHERE created_at BETWEEN %s AND %s";
        $args = [$start, $end];

        if (!empty($sourceNames)) {
            $placeholders = implode(', ', array_fill(0, count($sourceNames), '%s'));
            $sql .= " AND source_page_name IN ({$placeholders})";
            foreach ($sourceNames as $sourceName) {
                $args[] = $sourceName;
            }
        }

        $sql .= ' ORDER BY created_at DESC';
        $sql = $wpdb->prepare($sql, ...$args);

        $leads = $wpdb->get_results($sql, ARRAY_A);
        ?>
        <div class="wrap">
            <h1><?php echo esc_html($title); ?></h1>
            <p><?php echo esc_html($description); ?></p>

            <form method="get" style="margin:16px 0 18px;display:flex;align-items:center;gap:10px;">
                <input type="hidden" name="page" value="pbx-daily-leads" />
                <label for="lead_date"><strong>Date</strong></label>
                <input type="date" id="lead_date" name="lead_date" value="<?php echo esc_attr($selected_date); ?>" />
                <button type="submit" class="button button-primary">Filter</button>
            </form>

            <p><strong>Total leads:</strong> <?php echo esc_html((string) count($leads)); ?></p>

            <?php if (empty($leads)) : ?>
                <p>No leads found for this date.</p>
            <?php else : ?>
                <div style="overflow:auto;max-width:100%;">
                    <table class="widefat striped">
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Page</th>
                                <th>Name</th>
                                <th>Mobile</th>
                                <th>Email</th>
                                <th>Unit</th>
                                <th>Move-in</th>
                                <th>Due Today</th>
                                <th>Supplies</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($leads as $lead) : ?>
                                <tr>
                                    <td><?php echo esc_html((string) $lead['created_at']); ?></td>
                                    <td><?php echo esc_html(isset($lead['source_page_name']) ? (string) $lead['source_page_name'] : 'Reservation Lead'); ?></td>
                                    <td><?php echo esc_html((string) $lead['full_name']); ?></td>
                                    <td><?php echo esc_html((string) $lead['mobile']); ?></td>
                                    <td><?php echo esc_html((string) $lead['email']); ?></td>
                                    <td><?php echo esc_html((string) $lead['unit_size']); ?></td>
                                    <td><?php echo esc_html((string) $lead['move_in_date']); ?></td>
                                    <td><?php echo esc_html('AED ' . number_format((float) $lead['due_today'], 2)); ?></td>
                                    <td><pre style="white-space:pre-wrap;margin:0;font-family:inherit;"><?php echo esc_html((string) $lead['supplies_text']); ?></pre></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }

    public function render_shortcode(array $atts = []): string {
        $items = $this->get_items();

        if (empty($items)) {
            return '<p>No shop items available yet.</p>';
        }

        ob_start();
        ?>
        <div class="pbx-shop-shortcode">
            <div class="shop-grid">
            <?php foreach ($items as $item) :
                $item_id = sanitize_title((string) $item['name']);
                $price = 'AED ' . preg_replace('/[^0-9.]/', '', (string) $item['price']);
                ?>
                <article class="shop-card" data-id="<?php echo esc_attr($item_id); ?>">
                    <div class="shop-media">
                        <?php if (!empty($item['image'])) : ?>
                            <img src="<?php echo esc_url($item['image']); ?>" alt="<?php echo esc_attr($item['name']); ?>" loading="lazy" />
                            <span class="shop-media-label">Boxes</span>
                        <?php else : ?>
                            Boxes
                        <?php endif; ?>
                    </div>
                    <h3 class="shop-title"><?php echo esc_html($item['name']); ?></h3>
                    <p class="shop-spec"><?php echo esc_html($item['dimensions']); ?></p>
                    <p class="shop-price"><?php echo esc_html($price); ?></p>
                    <div class="shop-actions">
                        <select class="shop-qty" data-qty-id="<?php echo esc_attr($item_id); ?>">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                        <button type="button" class="shop-add" data-add-id="<?php echo esc_attr($item_id); ?>">Add to cart</button>
                    </div>
                </article>
            <?php endforeach; ?>
            </div>
        </div>
        <?php
        return (string) ob_get_clean();
    }

    private function get_items(): array {
        $items = get_option(self::OPTION_KEY, []);

        if (!is_array($items)) {
            return [];
        }

        return array_values(array_filter($items, static function ($item): bool {
            return is_array($item) && !empty($item['name']);
        }));
    }

    private function get_leads_table_name(): string {
        global $wpdb;
        return $wpdb->prefix . self::LEADS_TABLE;
    }

    private function create_leads_table(): void {
        global $wpdb;

        $table = $this->get_leads_table_name();
        $charset_collate = $wpdb->get_charset_collate();

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
            created_at DATETIME NOT NULL,
            full_name VARCHAR(190) NOT NULL,
            mobile VARCHAR(100) NOT NULL,
            email VARCHAR(190) NOT NULL,
            emirate VARCHAR(100) NOT NULL,
            storing_for VARCHAR(100) NOT NULL,
            move_in_date VARCHAR(50) NOT NULL,
            unit_size VARCHAR(190) NOT NULL,
            unit_label VARCHAR(190) NOT NULL,
            monthly_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
            promo_code VARCHAR(100) NOT NULL,
            supplies_total DECIMAL(10,2) NOT NULL DEFAULT 0,
            due_today DECIMAL(10,2) NOT NULL DEFAULT 0,
            supplies_text TEXT NOT NULL,
            summary_text LONGTEXT NOT NULL,
            source_page TEXT NOT NULL,
            source_page_name VARCHAR(190) NOT NULL DEFAULT 'Reservation Lead',
            ip_address VARCHAR(100) NOT NULL,
            user_agent VARCHAR(255) NOT NULL,
            PRIMARY KEY  (id),
            KEY created_at (created_at),
            KEY mobile (mobile)
        ) {$charset_collate};";

        dbDelta($sql);
    }

    private function get_leads_table_columns(): array {
        global $wpdb;

        $table = $this->get_leads_table_name();
        $columns = $wpdb->get_col("SHOW COLUMNS FROM {$table}");

        if (!is_array($columns)) {
            return [];
        }

        return array_map('strval', $columns);
    }

    private function limit_string(string $value, int $maxLength): string {
        if ($maxLength <= 0) {
            return '';
        }

        if (function_exists('mb_substr')) {
            return mb_substr($value, 0, $maxLength, 'UTF-8');
        }

        return substr($value, 0, $maxLength);
    }
}

new PurpleBox_Shop_Items_Plugin();
