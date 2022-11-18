<?php
/**
 * Plugin Name:  Lazy Blocks: Post Selector Control
 * Description:  Select WP Posts and put them into a grid
 * Plugin URI:   PLUGIN_URL
 * Version:      0.2.0
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
	    self::addblocks();

	    // WP Core Thickbox im Frontend aktivieren, nutzbar machen
	    function add_thickbox_script_and_style(){
		    wp_enqueue_script('jquery');
		    wp_enqueue_script('thickbox',null,array('jquery'));
		    wp_enqueue_style('thickbox.css', '/'.WPINC.'/js/thickbox/thickbox.css', null, '1.0');
	    }
	    add_action('init','add_thickbox_script_and_style');




		/**
		 * TODO check $data before publish, send  infos to team, set post_status to new preview status
		 */
	    /*
		add_filter( 'wp_insert_post_data', function ($data, $postarr, $unsanitized_postarr){
			return $data;
	    },10,3 );
	    */
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
        include_once self::$plugin_path . '/controls/post_selector_thickbox_search_posts.php';
        include_once self::$plugin_path . '/controls/bausteine.php';


		//BugFu::log(WP_Block_Type_Registry::get_instance()->get_all_registered());

    }
	static function blockeditor_engueue(){

		if (!is_admin()) return;

		wp_enqueue_style(
			'modal-posts_style',
			plugin_dir_url( __FILE__ ) . '/assets/css/thickbox-content.css'
		);
		wp_enqueue_style(
			'bausteine_style',
			plugin_dir_url( __FILE__ ) . '/assets/css/bausteine.css'
		);

		wp_enqueue_script(
			'bausteine',
			plugin_dir_url( __FILE__ ) . '/assets/js/bausteine_editor.js',
			null,
			null,
			true
		);
		wp_enqueue_script(
			'modal-posts_selector',
			plugin_dir_url( __FILE__ ) . '/assets/js/modal-posts-selector.js',
			null,
			null,
			true
		);
		wp_enqueue_script(
			'jquery-sortable',
			plugin_dir_url( __FILE__ ) . '/assets/js/jquery-sortable.js'
		);

	}

	static function addblocks(){
		if ( function_exists( 'lazyblocks' ) ) :

			lazyblocks()->add_block( array(
				'id' => 799,
				'title' => 'Baustein',
				'icon' => '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/><g><path d="M19,5v14H5V5H19 M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3L19,3z"/></g><path d="M14,17H7v-2h7V17z M17,13H7v-2h10V13z M17,9H7V7h10V9z"/></g></svg>',
				'keywords' => array(
				),
				'slug' => 'lazyblock/reli-baustein',
				'description' => '',
				'category' => 'leitfragen',
				'category_label' => 'Leitfragen',
				'supports' => array(
					'customClassName' => true,
					'anchor' => false,
					'align' => array(
						0 => 'wide',
						1 => 'full',
					),
					'html' => false,
					'multiple' => true,
					'inserter' => false,
				),
				'ghostkit' => array(
					'supports' => array(
						'spacings' => false,
						'display' => false,
						'scrollReveal' => false,
						'frame' => false,
						'customCSS' => false,
					),
				),
				'controls' => array(
					'control_a588984bfe' => array(
						'type' => 'text',
						'name' => 'titel',
						'default' => '',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'content',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'placeholder' => 'Baustein #',
						'characters_limit' => '',
					),
					'control_3f2bf740e0' => array(
						'type' => 'text',
						'name' => 'kurzbeschreibung',
						'default' => '',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'content',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'placeholder' => 'Kurzbeschreibung',
						'characters_limit' => '',
					),
					'control_65a965452b' => array(
						'type' => 'image',
						'name' => 'thumbnail',
						'default' => '',
						'label' => 'Beitragsbild für den Baustein',
						'help' => '',
						'child_of' => '',
						'placement' => 'inspector',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'preview_size' => 'medium',
						'placeholder' => '',
						'characters_limit' => '',
					),
					'control_26aa5a43af' => array(
						'type' => 'inner_blocks',
						'name' => 'content',
						'default' => '',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'content',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'placeholder' => '',
						'characters_limit' => '',
					),
					'control_a77b0a42c9' => array(
						'type' => 'hidden',
						'name' => 'post_id',
						'default' => '',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'inspector',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'min' => '',
						'max' => '',
						'step' => '',
						'placeholder' => 'Post_ID eine Beitrags (automatisch)',
						'characters_limit' => '',

					),
				),
				'code' => array(
					'output_method' => 'php',
					'editor_html' => ' ',
					'editor_callback' => '',
					'editor_css' => '',
					'frontend_html' => '<?php baustein::frontend_output($attributes);',
					'frontend_callback' => '',
					'frontend_css' => '',
					'show_preview' => 'always',
					'single_output' => false,
				),
				'condition' => array(
				),
			) );

			lazyblocks()->add_block( array(
				'id' => 797,
				'title' => 'Bausteine',
				'icon' => '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M3,3v8h8V3H3z M9,9H5V5h4V9z M3,13v8h8v-8H3z M9,19H5v-4h4V19z M13,3v8h8V3H13z M19,9h-4V5h4V9z M13,13v8h8v-8H13z M19,19h-4v-4h4V19z"/></g></g></g></svg>',
				'keywords' => array(
				),
				'slug' => 'lazyblock/reli-bausteine',
				'description' => '',
				'category' => 'leitfragen',
				'category_label' => 'Leitfragen',
				'supports' => array(
					'customClassName' => true,
					'anchor' => false,
					'align' => array(
						0 => 'wide',
						1 => 'full',
					),
					'html' => false,
					'multiple' => false,
					'inserter' => true,
				),
				'ghostkit' => array(
					'supports' => array(
						'spacings' => false,
						'display' => false,
						'scrollReveal' => false,
						'frame' => false,
						'customCSS' => false,
					),
				),
				'controls' => array(
					'control_0c19e4441b' => array(
						'type' => 'text',
						'name' => 'sammlung',
						'default' => 'Sammlung',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'content',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'placeholder' => 'Bausteine',
						'characters_limit' => '',
					),
					'control_ca8a2e458f' => array(
						'type' => 'inner_blocks',
						'name' => 'bausteine',
						'default' => '',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'content',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'placeholder' => '',
						'characters_limit' => '',
					),
					'control_96083c441e' => array(
						'type' => 'range',
						'name' => 'columns',
						'default' => '3',
						'label' => 'Anzahl der Spalten',
						'help' => '',
						'child_of' => '',
						'placement' => 'inspector',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'min' => '1',
						'max' => '5',
						'step' => '1',
						'placeholder' => '',
						'characters_limit' => '',
					),
					'control_c119314698' => array(
						'type' => 'toggle',
						'name' => 'collaborative',
						'default' => '',
						'label' => 'Kollaborativ',
						'help' => 'Angemeldete Nutzerinnen zu der Sammlung eigene Ideen hinzufügen.',
						'child_of' => '',
						'placement' => 'inspector',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'checked' => 'false',
						'alongside_text' => '',
						'placeholder' => '',
						'characters_limit' => '',
					),
					'control_c11931469d' => array(
						'type' => 'hidden',
						'name' => 'template',
						'default' => '',
						'label' => '',
						'help' => '',
						'child_of' => '',
						'placement' => 'inspector',
						'width' => '100',
						'hide_if_not_selected' => 'false',
						'save_in_meta' => 'false',
						'save_in_meta_name' => '',
						'required' => 'false',
						'placeholder' => '',
						'characters_limit' => '',
					),
				),
				'code' => array(
					'output_method' => 'php',
					'editor_html' => '<?php   bausteine::editor_output();',
					'editor_callback' => '',
					'editor_css' => '',
					'frontend_html' => '<?php  bausteine::frontend_output($attributes);',
					'frontend_callback' => '',
					'frontend_css' => '',
					'show_preview' => 'always',
					'single_output' => false,
				),
				'condition' => array(
				),
			) );

		endif;
	}
}

rpi_Lzb_Plugin_Post_Selector::init();

