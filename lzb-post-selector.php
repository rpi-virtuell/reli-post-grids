<?php
/**
 * Plugin Name:  Lazy Blocks: Post Selector Control
 * Description:  Select WP Posts and put them into a grid
 * Plugin URI:   PLUGIN_URL
 * Version:      1.0.0
 * Author:       rpi-virtuell
 * Author URI:   https://rpi-virtuell.de
 * License:      GPLv2 or later
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:  lzb-post-selector
 *
 * @package lzb-post-selector
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * rpi_Lzb_Plugin_Post_Selector Class
 */
class rpi_Lzb_Plugin_Post_Selector {

    /**
     * Plugin Path.
     *
     * @var string
     */
    public static $plugin_path;

    /**
     * Plugin URL.
     *
     * @var string
     */
    public static $plugin_url;

    /**
     * rpi_Lzb_Plugin_Post_Selector constructor.
     */
    public function __construct() {
	    add_thickbox();
    }

    /**
     * Init.
     */
    public static function init() {
        add_action( 'init', array( 'rpi_Lzb_Plugin_Post_Selector', 'plugins_loaded' ), 11 );
	    add_action( 'enqueue_block_assets',array('rpi_Lzb_Plugin_Post_Selector','blockeditor_js'));
		add_action( 'wp_ajax_filterposts', array( 'post_selector_thickbox_search_posts','ajax_handle' ));
		add_filter( 'the_title', function($title){
			$title = $title?$title:'ohne Titel';
			return $title;
		} );
	    //bausteine::init();
    }

    /**
     * Init of LazyBlocks available.
     */
    public static function plugins_loaded() {
        if ( ! class_exists( 'LazyBlocks' ) ) {
            return;
        }

        self::$plugin_path = plugin_dir_path( __FILE__ );
        self::$plugin_url  = plugin_dir_url( __FILE__ );

        // Translations.
	    load_plugin_textdomain( 'lzb-post-selector', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );

        // Include control.
        include_once self::$plugin_path . '/controls/post-selector.php';
        include_once self::$plugin_path . '/controls/post_selector_thickbox_search_posts.php';
        include_once self::$plugin_path . '/controls/bausteine.php';


    }
	static function blockeditor_js(){

		if (!is_admin()) return;
		wp_enqueue_script(
			'template_handling',
			plugin_dir_url( __FILE__ ) . '/assets/js/template_handling_editor.js'
		);
		wp_enqueue_script(
			'post-selector-js',
			plugin_dir_url( __FILE__ ) . '/assets/js/posts_selector_editor.js'
		);
		wp_enqueue_script(
			'bausteine',
			plugin_dir_url( __FILE__ ) . '/assets/js/bausteine_editor.js'
		);
		wp_enqueue_script(
			'jquery-sortable',
			plugin_dir_url( __FILE__ ) . '/assets/js/jquery-sortable.js'
		);

	}
}

rpi_Lzb_Plugin_Post_Selector::init();
