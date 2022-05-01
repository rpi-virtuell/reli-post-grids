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

/**
 * @TODO https://rudrastyh.com/wordpress/duplicate-post.html
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
	    add_action( 'enqueue_block_assets',array('rpi_Lzb_Plugin_Post_Selector', 'blockeditor_engueue' ));
		add_action( 'wp_ajax_filterposts', array( 'post_selector_thickbox_search_posts','ajax_search_posts' ));
		add_action( 'wp_ajax_getfilter', array( 'post_selector_thickbox_search_posts','ajax_getfilter' ));
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
        //include_once self::$plugin_path . '/controls/post-selector.php';
        include_once self::$plugin_path . '/controls/post_selector_thickbox_search_posts.php';
        include_once self::$plugin_path . '/controls/bausteine.php';


		//BugFu::log(WP_Block_Type_Registry::get_instance()->get_all_registered());

    }
	static function blockeditor_engueue(){

		if (!is_admin()) return;
		/*wp_enqueue_script(
			'template_handling',
			plugin_dir_url( __FILE__ ) . '/assets/js/template_handling_editor.js'
		);*/
		wp_enqueue_style(
			'modal-posts_style',
			plugin_dir_url( __FILE__ ) . '/assets/css/thickbox-content.css'
		);
		wp_enqueue_style(
			'bausteine_style',
			plugin_dir_url( __FILE__ ) . '/assets/css/bausteine.css'
		);
//		wp_enqueue_style(
//			'zebra_dialog_style',
//			plugin_dir_url( __FILE__ ) . '/assets/css/zebra_dialog/flat/zebra_dialog.min.css'
//		);

		wp_enqueue_script(
			'bausteine',
			plugin_dir_url( __FILE__ ) . '/assets/js/bausteine_editor.js'
		);
		wp_enqueue_script(
			'modal-posts_selector',
			plugin_dir_url( __FILE__ ) . '/assets/js/modal-posts-selector.js'
		);
		wp_enqueue_script(
			'jquery-sortable',
			plugin_dir_url( __FILE__ ) . '/assets/js/jquery-sortable.js'
		);
//		wp_enqueue_script(
//			'zebra_dialog',
//			plugin_dir_url( __FILE__ ) . '/assets/js/zebra_dialog.min.js'
//		);
	}
}

rpi_Lzb_Plugin_Post_Selector::init();
