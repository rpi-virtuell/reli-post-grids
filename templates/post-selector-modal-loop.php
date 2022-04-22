<?php
/**
 * template: content loop in modal window
 */

?>
<li id="selectable-post-<?php the_ID();?>" class="post-article">
    <header>
        <p class="entry-header">
            <a class="<?php echo $selected;?>" id="<?php the_ID();?>" href="#">
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
