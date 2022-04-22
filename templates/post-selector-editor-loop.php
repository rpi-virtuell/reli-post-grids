<?php
/**
 * template: content loop in block-editor post-selector block
 */
?>
<li id="drop-<?php the_ID();?>">
    <div class="post-card">
        <header>
            <div class="post-card-handle"><svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 0 14 24" width="12px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M5.54 8.46L2 12l3.54 3.54 1.76-1.77L5.54 12l1.76-1.77zm6.46 10l-1.77-1.76-1.77 1.76L12 22l3.54-3.54-1.77-1.76zm6.46-10l-1.76 1.77L18.46 12l-1.76 1.77 1.76 1.77L22 12zm-10-2.92l1.77 1.76L12 5.54l1.77 1.76 1.77-1.76L12 2z"/><circle cx="12" cy="12" r="3"/></svg></div>
            <h4 class="post-card-heading"><?php the_title();?></h4>
            <p class="meta">von <?php the_author();?> am <?php the_date()?></p>
        </header>
        <article>
		    <?php the_excerpt();?>
        </article>
        <div class="flex-height"></div>
        <footer>
	        <?php the_taxonomies( array(
		        'before' => '<div class="tax-link-wrap">',
		        'template' => '<span class="taxonomy-label">%s:</span> <span class="taxonomy-term-list">%l.</span>',
		        'term_template' => '<a href="###%1$s" rel="tag">%2$s</a>',
		        'sep' => '<br />',
		        'after' => '</div>',
	        ) ); ?>
            <a class="tool open" href="<?php the_permalink();?>"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#9999FF"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg></a>
            <a class="tool delete" href="#delete"><svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="#FF0000"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg></a>
        </footer>
        <div class="clear"></div>
    </div>
</li>
