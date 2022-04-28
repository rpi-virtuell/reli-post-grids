<?php
/**
 * template: content loop in modal window
 */
$data = new stdClass();
$data->title = get_the_title() ;
$data->description = get_the_excerpt();
$data->thumbnail = get_the_post_thumbnail_url() ;
$data->author = get_the_author() ;
$data->link = get_the_permalink() ;
$data->post_id = get_the_ID() ;
$data_string = base64_encode(json_encode($data));

?>
<li id="selectable-post-<?php the_ID();?>" class="post-article">
    <header>
        <p class="entry-header">
            <a class="<?php echo $selected;?>" id="<?php the_ID();?>" href="#" data='<?php echo $data_string;?>'>
				<?php the_title();?>
            </a>
        </p>
        <p class="meta">von <?php the_author_link();?> - <?php the_date()?></p>
    </header>
    <article>
		<?php the_excerpt();?>
    </article>
    <div class="flex-height"></div>
    <footer>
        <div>
			<?php the_taxonomies();?>
        </div>
    </footer>
</li>
