/**
 * @author Joachim happel
 */

wp.hooks.addFilter('blocks.getBlockAttributes', 'namespace', function (block, attr) {

    //console.log('blocks.getBlockAttributes', attr);


    return block;
});

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


wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange', 'post-selector', function (props) {
    if (props.block != 'lazyblock/post-selector') {
        return;
    }
    var clientId = null;
    jQuery.each(wp.data.select('core/block-editor').getBlocks(), function (i) {
        if (this.attributes.blockId == props.blockId) {
            clientId = this.clientId;
        }
    })

    console.log('onChange', props.block, clientId);


    jQuery(function () {
        //remove dublette forms
        jQuery(document).on('thickbox:removed', function () {
            console.log('thickbox:removed');
            jQuery('#search-filter-modal #search-filter-form').each(function (i) {
                if (i > 0) {
                    jQuery(this).remove();
                }
            })
            jQuery("#search-filter-results li").remove();
        });

        if (jQuery("#TB_ajaxContent").length > 0)
            jQuery("#modal-window-select-posts li").remove();

        jQuery(".post-card .tool.delete").on('click', function (e) {
            var parent = jQuery(e.target).closest('li');
            var collection = [];
            parent.parent().find('li').each(function (index) {
                if (this.id != parent[0].id) {
                    collection.push(this.id.replace('drop-', ''))
                }
            });
            var blockId = wp.data.select('core/block-editor').getSelectedBlockClientId();
            wp.data.dispatch('core/block-editor').updateBlockAttributes(blockId, {'collection': collection.join(',')});
        });

        jQuery("ul.sortable").sortable({
            nested: false,
            vertical: false,
            handle: ".post-card-handle",
            onMousedown: function ($item, _super, event) {
                document.getSelection().removeAllRanges();
                if (window.__Post_Selector.isSelected) {
                    return _super($item, _super, event);
                } else {
                    return false;
                }
            },
            onDrop: function ($item, container, _super) {
                var collection = [];
                $item.parent().find('li').each(function (index) {
                    collection.push(this.id.replace('drop-', ''))
                });
                var blockId = wp.data.select('core/block-editor').getSelectedBlockClientId();
                wp.data.dispatch('core/block-editor').updateBlockAttributes(blockId, {'collection': collection.join(',')});
                _super($item, container);
            }
        });
    });
});
wp.hooks.addAction('lzb.components.PreviewServerCallback.onBeforeChange', 'post-selector', function (props) {
    if (props.block != 'lazyblock/post-selector') {
        return;
    }
    var clientId = null;
    jQuery.each(wp.data.select('core/block-editor').getBlocks(), function (i) {
        if (this.attributes.blockId == props.blockId) {
            clientId = this.clientId;
        }
    })

    console.log('onBeforeChange', props.block, clientId);
});

wp.hooks.addFilter('lzb.editor.control.render', 'post-selector', function (render, controlData, blockData) {

    if (blockData.name != 'lazyblock/post-selector') {
        return render;
    }

    console.log('render', blockData.name);


    //console.log('render.post-selector', controlData );

    //Variablen für Consolen befehle
    window.__Post_Selector = blockData;
    window.__Post_Selector.control = controlData;
    window.__Post_Selector.render = render;


    //----


    window.open_selector = function () {
        tb_show('Inhalte wählen', '#TB_inline?width=1000&inlineId=search-filter-modal');
        init_selector_form();
        jQuery('#search-filter-form').submit();
        jQuery('#TB_window').css({'max-height': jQuery(window).height(), 'overflow': 'auto'});


    };

    window.init_selector_form = function () {

        jQuery('#search-filter-form').on('submit', function (e) {

            e.preventDefault(); // avoid to execute the actual submit of the form.
            var form = jQuery(this);
            let block = wp.data.select('core/block-editor').getSelectedBlock();
            jQuery.post(
                ajaxurl, {
                    action: 'filterposts',
                    collection: block.attributes.collection,
                    data: form.serializeArray()
                },
                function (response) {

                    //ajyx response in results div einfügen
                    jQuery('#search-filter-results').html(response);

                    //wenn Beitragstitel in der Thickbox angeklickt wird
                    jQuery('.selectable-post').on('click', function (e) {

                        //id des angeklickten Artikels ermitteln
                        var id = e.target.id;

                        //als markiert kennzeichen
                        jQuery(e.target).addClass('selected-post');
                        jQuery(e.target).removeClass('selectable-post');

                        var id_exists = false;

                        //block.attributes.collection im ausgewählter Block aktualisieren
                        block = wp.data.select('core/block-editor').getSelectedBlock();

                        //eingabefeld bereinigen
                        var data_string = block.attributes.collection;
                        data_string = data_string.replace(' ', '');
                        data_string = data_string.replace(';', ',');
                        var data = data_string.split(',');

                        var data_update = new Array();
                        for (const dataid of data) {
                            if (dataid != '') {
                                data_update.push(dataid);
                                if (id == dataid) {
                                    id_exists = true;
                                }
                            }
                        }

                        //id zu der collection im Attributes Objekt des Blockobjekts einfügen
                        if (!id_exists) {

                            data_update.push(id);
                            data_string = data_update.join(',');

                            var blockId = wp.data.select('core/block-editor').getSelectedBlockClientId();
                            wp.data.dispatch('core/block-editor').updateBlockAttributes(blockId, {'collection': data_string});

                        }

                        //zurückspringen zur setzen Blockauswahl (keine Ahnung ob das nötig ist)
                        wp.data.select('core/editor').getBlockSelectionStart();

                    });
                }
            );
            return false;
        });

        /*Falls der nur eigene Inhalte durch suchen geändert wird Formular abschicken*/
        jQuery('#search-filter-only-my').on('change', function (e) {
            jQuery(e.target).closest('form').submit();
        });
        jQuery('#quick-material').on('submit', function (e) {
            e.preventDefault(); // avoid to execute the actual submit of the form.
            var form = jQuery(this);
            let block = wp.data.select('core/block-editor').getSelectedBlock();
            jQuery.post(
                ajaxurl, {
                    action: 'filterposts',
                    collection: block.attributes.collection,
                    data: form.serializeArray()
                },
                function (response) {

                }
            )
        });
    }


    return render;
});

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
