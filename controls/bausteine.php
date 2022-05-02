<?php

class bausteine {

	static function init(){

    }


    static public function editor_output() {
        ?>

        <?php
	}
	static public function frontend_output($attributes) {
        //var_dump(htmlentities($attributes['bausteine']));die();
		?>
		<style>
            .baustein-gallery{
                margin: 0;
            }
            .baustein-gallery-grid{
                display:grid;
                grid-gap: 10px;
                grid-template-columns: repeat(3, 1fr);
                grid-auto-rows: minmax(40px, auto);
                margin: 0;
                transition: all .5s linear;

            }
            .baustein-gallery-grid h4{
                font-size: 24px;
                transition: all .5s linear;
            }
            .baustein-footer{
                text-align: right;
            }
            .scaled .baustein-gallery-grid{
                /*grid-template-columns: repeat(6, 1fr);*/
                width: 100%;
                transition: all .5s linear;
            }
            .scaled .baustein-gallery-grid p{
                display: none;
            }

            .scaled .baustein-gallery-grid h4{
                font-size: 20px;
                transition: all .5s linear;
            }
            .scaled .baustein-gallery-grid .baustein-card{
                overflow: hidden;
                transition: all .5s linear;
            }
            .scaled .baustein-footer{
                display: none;
            }
		</style>

		<div class="baustein-gallery" data-block="<?php echo $attributes['blockId'] ?>">
            <div class="baustein-gallery-header">
                <h3><?php echo $attributes['sammlung'];?></h3>
            </div>
			<div class="baustein-gallery-grid">
				<?php echo $attributes['bausteine'];?>
			</div>
            <div class="showroom"></div>
		</div>
        <script>
            jQuery(document).ready(($)=>{
                $('.showroom').slideUp();
                $('.baustein-card').on('click', (e)=>{
                    $('.showroom').fadeOut();
                    if($(e.target).hasClass('baustein-card')){
                        card = $(e.target);
                    }else{
                        card = $(e.target).closest('.baustein-card');
                    }
                    let gallery =  card.closest('.baustein-gallery');
                    gallery.addClass('scaled');
                    let showroom = gallery.find('.showroom') ;
                    console.log('showroom',showroom);
                    showroom.html(card.find('.baustein-inner-content').html());
                    setTimeout(()=>{showroom.slideDown();},500);
                    showroom.fadeIn();


                })
                $(document).mouseup(function(e)
                {
                    var container = $(".baustein-gallery");

                    // if the target of the click isn't the container nor a descendant of the container
                    if (!container.is(e.target) && container.has(e.target).length === 0)
                    {
                        $('.showroom').slideUp();
                        setTimeout(()=>{  $('.baustein-gallery').removeClass('scaled');},500);
                    }

                });
            });
        </script>
        <?php

	}
}
class baustein {

	static public function frontend_output($attributes) {
		//var_dump($attributes);
		?>
        <style>
            .baustein-card{
                display: flex;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 10px;
                flex-direction: column;
                height: 100%;
                justify-content: space-between;
            }
            .baustein-inner-content{
                display: none;
                position: absolute;
                background: aliceblue;

            }
        </style>
        <div class="baustein-card <?php echo $attributes['post_id']?'post':'';?>" id="bcard-<?php echo $attributes['blockId'] ?>" data-block="<?php echo $attributes['blockId'] ?>">
            <h4><?php echo $attributes['titel'];?></h4>
            <p><?php echo $attributes['kurzbeschreibung'];?></p>
            <div class="baustein-inner-content">
                <h4><?php echo $attributes['titel'];?></h4>
                <p><?php echo $attributes['kurzbeschreibung'];?></p>
                <?php echo $attributes['content'];?>
            </div>
            <div>

            </div>
            <div class="baustein-footer">
                <?php echo $attributes['post_id']?'Material':'Inhaltsbaustein' ?>
            </div>
        </div>
		<?php

	}
}
