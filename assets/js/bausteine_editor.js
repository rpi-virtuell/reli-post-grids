/**
 * @author Joachim happel
 */

wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange', 'bausteine', function (props) {

    if (props.block == 'lazyblock/bausteine') {

        console.log('onChange:lazyblock/bausteine');

        var clientId;

        for (const block of wp.data.select('core/block-editor').getBlocks()) {
            if (block.name != 'lazyblock/bausteine')
                continue;

            if (block.attributes.blockId == props.attributes.blockId) {

                console.log(block);


                props.attributes.clientId = block.clientId;

                break;
            }

        }

        window.__Bausteinsammlung_clientId = props.attributes.clientId;

        jQuery('#block-' + props.attributes.clientId + ' .addbaustein').ready(function ($) {

            var addbutton = jQuery('#block-' + props.attributes.clientId + ' .addbaustein').first();

            addbutton.parent().insertAfter(
                jQuery('#block-' + props.attributes.clientId).find('.components-base-control').first()
            );


            //einzelbausteine innerhalb der sammlung suchen und als Kacheln in der gallery adden
            var title, description;
            var bausteine = jQuery('#block-' + props.attributes.clientId + ' .wp-block-lazyblock-baustein');
            for (const baustein of bausteine) {
                let elems = $(baustein).find('.components-text-control__input');
                console.log(elems)
                title = elems[0].value;
                description = elems[1].value;
                jQuery('<div class="baustein-card"><h4>' + title + '</h4><p>' + description + '</p></div>').insertBefore(addbutton);
            }

        });
    }
});
