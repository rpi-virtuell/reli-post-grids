<?php

class post_selector_thickbox_search_posts {


	static function ajax_getfilter(){
        ob_start()
		?>
			<div id="search-filter-modal">
				<form id="search-filter-form">
                    <div class="filter-grid">
                        <div style="grid-column: 3 / span 2;text-align: right;">
                            <input id="search-filter-only-my" type="checkbox" name="my" value="1" checked>
                            <label for="search-filter-only-my">Nur in meinen Inhalten suchen</label>
                        </div>
                    </div>
					<div class="filter-grid">
                        <div class="filter-col">
                            <input class="search-filter" name="search" id="search-filter-searchfield" type="text" placeholder="Suchbegriff"/>
                        </div>
                        <div class="filter-col">
                            <select class="search-filter" name="taxonomy-category">
                                <option value="">Kategorie</option>
                                <?php self::the_tax_options('category');?>
                            </select>
                        </div>
                        <div class="filter-col">
                            <select class="search-filter" name="taxonomy-post_tag">
                                <option value="">Tags</option>
                                <?php self::the_tax_options('post_tag');?>
                            </select>
                        </div>
                        <div class="filter-col">
                            <input class="search-filter button" type="submit" value="Suchen">
                        </div>
					</div>
				</form>
				<ul id="search-filter-results" class="search-filter-results-grid"></ul>
			</div>

		<?php
        echo ob_get_clean();
        die();

	}

	static function the_tax_options($taxonomy){
		$terms = get_terms([
			'taxonomy' => $taxonomy,
			'hide_empty' => false,
		]);
		foreach ($terms as $term){
			?>
			<option value="<?php echo $term->term_id;?>"><?php echo $term->name;?></option>
			<?php
		}
	}


	/**
     * render postz  in the Thickbox
	 * @return html
	 */
	static function ajax_search_posts(){

        $post = isset($_POST['data'])?$_POST['data']:false;

        $collection = isset( $_POST['collection'] )?  $_POST['collection']: '';



		$collection = explode(',', $collection);

		if ($post){


			$tax_query = array(); $search = ''; $author = 0;

			foreach ($post as $data){

                //add taxonomies to $tax_query
                if(strpos($data['name'],'taxonomy-')===0){
	                $taxonomy = substr($data['name'],9);
                    if($data['value']){
	                    $tax_query[] = [
		                    'taxonomy' => $taxonomy,
		                    'field' => 'term_id',
		                    'terms' => $data['value'],
	                    ];
                    }

                }

	            //-------------------------

	            //search param
	            if($data['name']=='search')
                    $search = trim($data['value']);

                //only currnt users posts?
	            if($data['name']=='my')
		            $author =  get_current_user_id();


            }
			if(count($tax_query)>1){
				$tax_query['relation'] ='OR';
			}


	        $args=array(
		        'tax_query'=> $tax_query ,
		        'post_status'=>'publish',
		        'post_type'=>'post',
		        's'=>$search,
		        'author'=>$author
	        );

            //var_dump($args);
	        $query = new WP_Query($args);


	        // The Loop
	        if ($query->have_posts()) {
		        while ($query->have_posts()) {
			        $query->the_post();
                    $selected = in_array(get_the_ID(),$collection)?'selected-post':'selectable-post';
			        set_query_var( 'selected', $selected );
			        if ($template = locate_template('post-selector-modal-loop.php'))
				        load_template($template);
			        else
				        load_template(dirname(__DIR__) . '/templates/post-selector-modal-loop.php', false);
		        }
	        } else {
		        echo 'Keine Treffer';
	        }
	        // Restore original Post Data
	        wp_reset_postdata();
            die();
        }
	}

}
