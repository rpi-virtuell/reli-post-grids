<?php

class bausteine {

	static function init(){

		add_filter( 'lazyblock/bausteine/editor_output', array('bausteine', 'render_output'), 10, 3 );

	}
	static public function render_output($result, $attributes, $context ) {
		return '<p>Custom Paragraph</p>' . $result;
	}

	static public function editor_output() {
		?>
		<div id="baustein-gallery">
			<ul class="baustein-gallery-grid">
				<button class="addbaustein">+</button>
			</ul>
		</div>
		<?php
	}
	static public function frontend_output() {
		?>
		<style>
            .baustein-gallery-grid{
                display:grid;
                grid-gap: 10px;
                grid-template-columns: repeat(3, 1fr);
                grid-auto-rows: minmax(80px, auto);
            }
            .baustein-card{
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 10px;
            }
		</style>
		<div id="baustein-gallery">
			<ul class="baustein-gallery-grid">

			</ul>
		</div>
		<?php
	}
}
