<?php
/**
 * Post_Selector Control.
 *
 * @package lzb-post-aselector
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'rpi_Lzb_Control_Post_Selector' ) ) :
    /**
     * rpi_Lzb_Control_Post_Selector class.
     *
     * LazyBlocks_Control - https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php
     */
    class rpi_Lzb_Control_Post_Selector extends LazyBlocks_Control {
        /**
         * Constructor
         */
        public function __construct() {

            // Control unique name.
            $this->name = 'Post_Selector';

            // Control icon SVG.
            // You may use these icons https://material.io/resources/icons/?icon=accessibility&style=outline .
            $this->icon = '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M3,3v8h8V3H3z M9,9H5V5h4V9z M3,13v8h8v-8H3z M9,19H5v-4h4V19z M13,3v8h8V3H13z M19,9h-4V5h4V9z M13,13v8h8v-8H13z M19,19h-4v-4h4V19z"/></g></g></g></svg>';

            // Control value type [string, number, boolean].
            $this->type = 'string';

            // Control label.
            $this->label = __( 'Post Selector', 'lzb-post-selector' );

            // Category name [basic, content, choice, advanced, layout]
            // How to add custom category - https://lazyblocks.com/documentation/php-filters/lzb-controls-categories/
            $this->category = 'content';


            // Add/remove some options from control settings.
            // More options see in https://github.com/nk-o/lazy-blocks/blob/master/src/controls/_base/index.php .
            $this->restrictions = array(
                'default_settings' => false,
                'help_settings'    => false,
            );

            // Optional additional attributes, that will be saved in control data.
            $this->attributes = array(
                'post_selector_custom_attribute' => 'default_value',
            );
	        add_filter( 'kadence_blocks_design_library_enabled', '__return_false' );

	        add_action('init', function() {
		        remove_theme_support('core-block-patterns');
	        });

            parent::__construct();
        }

        /**
         * Register control assets.
         */
        public function register_assets() {
            wp_register_script(
                'rpi-lzb-control-Post_Selector',
	            rpi_Lzb_Plugin_Post_Selector::$plugin_url . 'assets/js/post-selector.min.js',
                array( 'wp-blocks', 'wp-i18n', 'wp-element', 'wp-components' ),
                '1.0.0',
                true
            );
            wp_register_style(
                'rpi-lzb-control-Post_Selector',
	            rpi_Lzb_Plugin_Post_Selector::$plugin_url . 'assets/css/post-selector.min.css',
                array(),
                '1.0.0'

            );
        }

        /**
         * Enqueue control scripts.
         *
         * @return array script dependencies.
         */
        public function get_script_depends() {
            return array( 'rpi-lzb-control-Post_Selector' );
        }

        /**
         * Enqueue control styles.
         *
         * @return array style dependencies.
         */
        public function get_style_depends() {
            return array( 'rpi-lzb-control-Post_Selector' );
        }

		/**
         * displays the block content in the editor
         * is uses in lazy block php editor output
         * the block prepare modal window (thickbox) to search and select posts, which will shown as grid inside of the the block-content
         * @todo export lazy_block and integrate it into this class
         */
	    static function editor_output($attributes){

            //filters to select posts into block displayed in modal box
		    post_selector_thickbox_search_posts::the_input_filter();

			//block content
		    self::the_block_content($attributes);

	    }

	    static function frontend_output($attributes){
            ?>
            <style>
                .lzb-selector{
                    margin: 0 10px;
                }
                .sortable{
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-gap: 10px;
                    grid-auto-rows: minmax(50px, auto);
                    padding: 0;
                }
                .sortable li{
                    list-style: none;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 0 10px 5px;
                }
                .sortable li h4{
                    font-weight: normal;
                }
            </style>
            <?php
		    //block content
		    self::the_block_content($attributes, false);

	    }

	    /**
	     * displays posts from the $attributes['collection'] which contains an array of the selected post id's
	     *
	     * @param $attributes
	     *
	     * @return void
	     */
	    static function the_block_content($attributes,$is_editor = true){
            ?>
            <style>
                .sortable, .wp-block.is-selected .buttons,
                .block-editor-block-list__block.is-selected .buttons{
                    grid-template-columns: repeat(<?php echo $attributes['columns'];?>, 1fr);
                }
            </style>
		    <div class="lzb-selector">
                <?php if(!$is_editor):?>
                    <h3 class="lzb-selector-heading"><?php echo $attributes['title'];?></h3>
                <?php endif;?>
			    <ul class="sortable">


                    <?php

                    $args = array(
	                    'post_type' => 'post',
	                    'post__in'      => explode (',',$attributes['collection'])
                    );

                    $query = new WP_Query( $args );

                    $output = $is_editor?'editor':'frontend';

                    if ($query->have_posts()) {
	                    while ($query->have_posts()) {
		                    $query->the_post();
		                    if ($template = locate_template("post-selector-$output-loop.php"))
			                    load_template($template);
		                    else
			                    load_template(dirname(__DIR__ ) . "/templates/post-selector-$output-loop.php", false);
	                    }
                    } else {
	                    echo 'Noch keine inhalte';
                    }
				    ?>
			    </ul>
                <?php if($is_editor):?>
                <div class="tool">
                    <ul class="buttons">
                        <li>
                            <a id="card-selector" href="javascript:open_selector()" class="button">Weitere Inhalte hinzufügen</a>
                        </li>
                    </ul>
                </div>
                <?php endif;?>
		    </div>

		    <?php
	    }



    }

    // Init.
    new rpi_Lzb_Control_Post_Selector();
endif;
