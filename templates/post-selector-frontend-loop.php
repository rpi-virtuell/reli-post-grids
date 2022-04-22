<?php
/**
 * template: content loop in post-selector block
 */
?>
<li id="drop-<?php the_ID();?>">
    <div class="post-card">
        <header>
            <h4 class="post-card-heading">
                <a href="<?php the_permalink();?>">
                    <?php the_title();?>
                </a>
            </h4>
            <p class="meta">von <?php the_author();?> am <?php the_date()?></p>
        </header>
        <article>
		    <?php the_excerpt();?>
        </article>
        <div class="flex-height"></div>
        <footer>
	        <?php the_taxonomies();?>
        </footer>
        <div class="clear"></div>
    </div>
</li>
