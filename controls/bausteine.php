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

        if(empty(trim(strip_tags($attributes['bausteine'],array('<img>', '<figure>'))))){
            return false;
        }

		?>
		<style>
            .baustein-gallery{
                margin: 0;
            }
            .baustein-gallery-header{
                display:grid;
                grid-template-columns: 60px auto;
                grid-auto-rows: minmax(40px, auto);
                margin: 20px 0 10px;
            }

            .baustein-gallery-header svg{
                margin-bottom: -24px;
            }
            .baustein-gallery .block-title{
                font-weight: normal;
                font-size: 30px;
                margin: 0;
            }

            .baustein-gallery .card-title{
                margin: 0;
                font-size: 24px;
            }
            .baustein-gallery-grid{
                display:grid;
                grid-gap: 10px;
                grid-template-columns: repeat(3, 1fr);
                grid-auto-rows: minmax(40px, auto);
                margin: 0;

            }
            .baustein-footer{
                text-align: right;
            }
            .scaled .baustein-gallery-grid{
                /*grid-template-columns: repeat(6, 1fr);*/
                width: 100%;
            }
            .scaled .baustein-gallery-grid p{
                font-size: 0px;
                line-height: 0px;
                transition: all .5s linear;
            }

            .scaled.baustein-gallery .card-title{
                font-size: 20px;
                transition: all .5s linear;
            }

            .scaled .baustein-card{
                transition: all .5s linear;
                /*height: 50px;*/
                overflow: hidden;
            }
            .scaled .baustein-footer{
                display: none;
                transition: all .5s linear;
            }
            div.selected-card{
                border:1px solid orangered;
                background: #fff;
            }

            .baustein-gallery .showroom-wrapper{
                border-right: 5px;
                margin-top: 10px;
                position: static;
            }

            .baustein-gallery .showroom{
                position: relative;
            }
		</style>

		<div class="baustein-gallery" data-block="<?php echo $attributes['blockId'] ?>">
            <div class="baustein-gallery-header">
                <h3 class="block-title"><?php echo $attributes['sammlung'];?></h3>
            </div>
			<div class="baustein-gallery-grid">
				<?php echo $attributes['bausteine'];?>
			</div>
            <div class="showroom-wrapper">
                    <div class="showroom"></div>
            </div>
		</div>
        <script>
            jQuery(document).ready(($)=>{

                const icon = $('<div class="bausteine-icon"><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 24 24" width="40px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M3,3v8h8V3H3z M9,9H5V5h4V9z M3,13v8h8v-8H3z M9,19H5v-4h4V19z M13,3v8h8V3H13z M19,9h-4V5h4V9z M13,13v8h8v-8H13z M19,19h-4v-4h4V19z"/></g></g></g></svg></div>');
                $('.baustein-gallery-header').prepend(icon);

                $('.showroom').slideUp();

                $('.baustein-card').on('click', (e)=>{

                    if($(e.target).hasClass('baustein-card')){
                        card = $(e.target);
                    }else{
                        card = $(e.target).closest('.baustein-card');
                    }

                    if(card.hasClass('selected-card')){
                        $('.baustein-card').removeClass('selected-card');
                        $('.showroom').slideUp();
                        setTimeout(()=>{  $('.baustein-gallery').removeClass('scaled');},500);

                    }else{
                        $('.baustein-card').removeClass('selected-card');
                        card.addClass('selected-card');
                        let gallery =  card.closest('.baustein-gallery');
                        gallery.addClass('scaled');
                        let showroom = gallery.find('.showroom') ;
                        showroom.html(card.find('.baustein-inner-content').html());
                        showroom.find('.baustein-article').show();
                        showroom.slideDown();

                        //von rechts einfliegen
                        let h = showroom.height()+'px';
                        showroom.css({'min-height':h});
                        showroom.find('.baustein-article').css({'position':'absolute','left':'300px', 'opacity':0});
                        showroom.find('.baustein-article').animate({'left':'1px','opacity':1},300,()=>{
                            showroom.find('.baustein-article').css({'position':'relative'});
                            showroom.css({'min-height':'unset'});
                        });

                    }


                })
                $(document).mouseup(function(e)
                {
                    var container = $(".baustein-gallery");

                    // if the target of the click isn't the container nor a descendant of the container
                    if (!container.is(e.target) && container.has(e.target).length === 0)
                    {
                        $('.baustein-gallery').removeClass('scaled');
                        $('.baustein-card').removeClass('selected-card');
                        $('.showroom').slideUp();

                    }

                });
            });
        </script>
        <?php

	}
}
class baustein {

	static public function frontend_output($attributes) {
        if(empty($attributes['titel']) || empty($attributes['content']) && empty($attributes['kurzbeschreibung']) ){
            return false;
        }
		//var_dump($attributes);
		?>
        <style>
            .baustein-card{
                display: flex;
                border: 1px solid #aaa;
                border-radius: 5px;
                padding: 10px;
                flex-direction: column;
                height: 100%;
                justify-content: space-between;
                box-shadow: 1px 1px 3px #999;
                transition: all .3s linear;
            }
            .baustein-card:hover{
                border: 1px solid orange;
                background: lavenderblush;
                box-shadow: 1px 1px 5px red;
            }
            .baustein-article{
                margin: 1px;
                border: 1px solid orangered;
                border-radius: 5px;
                padding: 10px;
                background: #fff;
                box-shadow: 1px 1px 5px #555555;
                width: 100%;
            }
            .baustein-card p{
                transition: all .3s linear;
            }
            .baustein-article-header{
                display:grid;
                grid-template-columns: 60px auto;
                grid-auto-rows: minmax(24px, auto);
                margin: 0px;
                border-bottom: 1px solid #ddd;
            }
            .baustein-article-header .block-title{
                font-size: 24px;
            }
            .baustein-article-header .baustein-icon{
                width: 30px;
                margin-top: 3px;
            }
            .baustein-article-header .baustein-icon svg {
                width: 100%;
                height: auto;
            }
            .baustein-inner-content{
                display: none;
            }
            .strong{
                font-weight: bold;
            }
            @media only screen and (max-width: 700px) {
                .baustein-card :not(:first-child) {
                    display: none;
                }
                .baustein-gallery-grid{
                    grid-template-columns: repeat(2, 1fr);
                }
                .baustein-card .card-title{
                    font-size: 18px;
                }
                .scaled.baustein-gallery .card-title{
                    font-size: 13px;
                }
            }
        </style>
        <div class="baustein-card <?php echo $attributes['post_id']?'post':'';?>" id="bcard-<?php echo $attributes['blockId'] ?>" data-block="<?php echo $attributes['blockId'] ?>">
            <div class="card-title"><?php echo $attributes['titel'];?></div>
            <p><?php echo $attributes['kurzbeschreibung'];?></p>
            <div class="baustein-inner-content">
                <div class="baustein-article">
                    <div class="baustein-article-header">
                        <div class="baustein-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-9v-6h9v6z" /></svg>
                        </div>
                        <h4 class="block-title"><?php echo $attributes['titel'];?></h4>
                    </div>
                    <p class="strong"><?php echo $attributes['kurzbeschreibung'];?></p>
                    <?php echo $attributes['content'];?>
                </div>
            </div>
            <div>

            </div>
            <div class="baustein-footer">
                <?php echo $attributes['post_id']?'Material':'Inhaltsbaustein' ?>
            </div>
        </div>
		<?php
		return true;
	}

}
