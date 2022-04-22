/**
 * @author Joachim happel
 */

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

