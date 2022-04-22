/**
 * @author Joachim happel
 */


wp.hooks.addFilter('editor.BlockEdit', 'namespace', function (fn) {

    if (wp.data.select('core/editor').getCurrentPostType() != 'materialien') {
        return fn;
    }

    var allowedBlocks = [
        'core/paragraph',
        'core/image',
        'core/html',
        'core/freeform',
        'lazyblock/baustein',
        'lazyblock/bausteine',
        'lazyblock/alltagssituation-kinderfahrung',
        'lazyblock/methode',
        'lazyblock/anmoderation',
        'lazyblock/vorgehensweise',
        'lazyblock/vorueberlegungen',
        'lazyblock/erfahrungsbericht',
        'lazyblock/beispielhafte-vorgehensweise',
        'lazyblock/abstrakte-beschreibung-der-methode',
        'lazyblock/ausgangssituation',
        'lazyblock/vorbereitung',
    ];

    wp.blocks.getBlockTypes().forEach(function (blockType) {
        if (allowedBlocks.indexOf(blockType.name) === -1) {
            if(blockType.name.indexOf('lazyblock/') < 0){
                wp.blocks.unregisterBlockType(blockType.name);
            }
        }
    });

    const blocksAllowInserter = [
        'core/columns',
        'core/group',
        'kadence/tab',
        'kadence/row'
    ];
    var post_id = wp.data.select("core/editor").getCurrentPostId();
    var is_administrator = wp.data.select('core').canUser('create', 'users');

    jQuery(document).ready(function ($) {

        // hide insert buttons on start
        $('.block-editor-inserter').css({'visibility': 'hidden'});
        $('.edit-post-header-toolbar__inserter-toggle').prop("disabled", true);

        //deny delete on root blocks
        let blocks = wp.data.select('core/block-editor').getBlocks()
        for (block of blocks) {
            block.attributes.lock = {remove: true}
        }
        var is_administrator = wp.data.select('core').canUser('create', 'users', 1);


        $('.block-editor-block-list__layout').on('click', function (e) {

            //Fehlerhaft
            if (typeof is_administrator == 'undefined')
                is_administrator = wp.data.select('core').canUser('create', 'users');


            const types = wp.blocks.getBlockTypes();
            if (is_administrator && location.hash == '#admin') {

                console.log('is_administrator', is_administrator);
                $('.block-editor-inserter').css('visibility', 'visible');
                $('.edit-post-header-toolbar__inserter-toggle').prop("disabled", false)


                for (const blocktype of types) {
                    if (blocktype.supports) {

                        blocktype.supports.inserter = true;
                        delete blocktype.supports.innerBlocks;

                    }
                }

                let blocks = wp.data.select('core/block-editor').getBlocks()
                for (block of blocks) {
                    delete block.attributes.lock;
                    delete block.attributes.lock;

                    delete block.supports.innerBlocks;
                    delete block.supports.inserter
                }
                return;
            }

            /**
             * default lock all
             */

            for (const blocktype of types) {
                if (blocktype.supports) {
                    blocktype.supports.inserter = false;
                    blocktype.supports.innerBlocks = false;
                }
            }
            // hide insert buttons
            $('.block-editor-inserter').css({'visibility': 'hidden'});
            $('.edit-post-header-toolbar__inserter-toggle').prop("disabled", true)


            var curr_block = wp.data.select('core/block-editor').getSelectedBlock();

            if (curr_block != null && curr_block.clientId) {

                //oberstes Eltern-Element ermitteln.
                const parentClientId = wp.data.select('core/block-editor').getBlockHierarchyRootClientId(curr_block.clientId);
                if (parentClientId) {
                    curr_block = wp.data.select('core/block-editor').getBlock(parentClientId);
                }

                if (blocksAllowInserter.includes(curr_block.name) || curr_block.name.indexOf('lazyblock/') === 0) {

                    console.log('unlock inserter', curr_block.name)
                    // show insert buttons
                    $('.block-editor-inserter').css('visibility', 'visible');
                    $('.edit-post-header-toolbar__inserter-toggle').prop("disabled", false)

                    // inserter wieder aktiv setzen
                    for (const blocktype of types) {
                        if (blocktype.supports) {

                            blocktype.supports.inserter = true;
                            delete blocktype.supports.innerBlocks;

                        }
                    }
                } else {
                    console.log('lock inserter', curr_block.name);
                }

            }

        });

        /**
         * verhindern das ein Absatz auf der Obersten Dokumenteben gesetzt werden kann
         * mit Hilde eine Document Observers, der bei Veränderung des Doms feuert
         */
        is_administrator = wp.data.select('core').canUser('create', 'users');
        $('.block-editor-block-list__layout').bind("DOMSubtreeModified", function (e) {

            if(is_administrator && location.hash == '#admin') return;

            //root blocks überprüfen ob sie einen Absatz enthalten
            let blocks = wp.data.select('core/block-editor').getBlocks()
            for (const block of blocks) {
                console.log(block.name, block.name == 'core/paragraph', block.clientId);
                if (block.name == 'core/paragraph') {

                    // wenn der Absatz keinen parent hat, löschen
                    parentClientId = wp.data.select('core/block-editor').getBlockHierarchyRootClientId(block.clientId);
                    if (parentClientId == block.clientId) {
                        wp.data.dispatch('core/block-editor').removeBlock(block.clientId);
                        wp.data.select('core/editor').getBlockSelectionStart();
                    }


                }
            }
        });
    });


    return fn;
});

wp.hooks.addFilter('blocks.getBlockAttributes', 'namespace', function (block, attr) {

    //console.log('blocks.getBlockAttributes', attr);
    return block;
});
