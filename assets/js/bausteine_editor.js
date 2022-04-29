/**
 * @author Joachim happel
 */

wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange','bausteine', function (props) {

   // console.log('bausteine.onChange: ', props);
    //  bausteine.onChange(props);
});


(function($) {

    //kürzt die schreibweisen:

    const {
        select,                 //statt: www.data.select(...) jetzt nur: select(...)
        subscribe,              //...
        dispatch
    } = wp.data;


    const bausteine = {

        moreLabel: 'mehr erfahren',

        //blocktypes festlegen, die auf Veränderungen überwacht werden sollen.
        watchBlocks: ['lazyblock/bausteine', 'lazyblock/baustein'],

        init: function () {

            bausteine.doBlockListObserve(bausteine.onChange);
            window._bausteine = bausteine;

        },

        displayCards: function (clientId) {

            //Kachelansicht aufbauen

            let block = $('#block-' + clientId);

            //Erstes EingabeControlFeld im Bausteine Block ermitteln
            let titleInputControl = block.find('.lzb-content-controls div').first();
            titleInputControl.addClass('bausteine-header');

            //falls vorhanden Block Icon löschen
            block.find('.bausteine-icon').remove();
            var icon = $('<div class="bausteine-icon"><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 24 24" width="40px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M3,3v8h8V3H3z M9,9H5V5h4V9z M3,13v8h8v-8H3z M9,19H5v-4h4V19z M13,3v8h8V3H13z M19,9h-4V5h4V9z M13,13v8h8v-8H13z M19,19h-4v-4h4V19z"/></g></g></g></svg></div>');
            //Block Icon vor Inputfeld einfügen
            titleInputControl.prepend(icon);

            //falls bereits vorhanden galery löschen
            block.find(' .baustein-gallery').remove();


            //Kalchel HTML-Container aufbauen
            var gallery = $(
                '<div style="width: 100%">' +
                '<div class="baustein-gallery">' +
                '<ul class="baustein-gallery-grid">' +
                '</ul>' +
                '</div>' +
                '</div>');
            //und unter dem EingabeControlFeld
            gallery.insertAfter(titleInputControl);


            //Kacheln aus den Blocks innerhalb der Bausteineblocks generieren und jeweils im ul.baustein-gallery-grid anhängen (append)
            let bricks = select('core/editor').getBlock(clientId).innerBlocks
                .filter( innerblock => innerblock.name == 'lazyblock/baustein' );
            let i = 0;
            for (const brick of bricks) {
                let imgurl, title = brick.attributes.titel;


                // if(brick.attributes.post_id){
                //     title = '<a href="/?p=' + brick.attributes.post_id + '" target = "_blank">'+ brick.attributes.titel + '</a>';
                // }

                block.find(".baustein-gallery-grid").append(jQuery('' +
                    '<li class="baustein-card" id="bcard-' + brick.clientId + '" data-order="' + i + '" style="/*background-image: url(' + imgurl + ')*/">' +
                    '<h4>' + title + '</h4>' +
                    '<p>' + brick.attributes.kurzbeschreibung + '</p>' +
                    '</li>'
                ));
            }
            //beim neu Laden der Seite ist kein Block activ ausgewählt
            if (select('core/block-editor').getSelectedBlock() === null) {
                //alle sichtbaren baustein blocks unsichtbar verstecken: slideup
                block.find('.wp-block-lazyblock-baustein').parent().slideUp();
            }


            //Insertbutton, um per Klick einen weiteren Bauststein zu Beisteine hinzuzufügen
            $('<div class="addbaustein-wrapper"><button class="addbaustein" id="addcard-' + clientId + '">+</button></div>')
                .insertAfter(block.find(".baustein-gallery-grid"));


            //Trigger initialisieren
            block.find(".baustein-gallery-grid .baustein-card").off('click', bausteine.onCardClick);
            block.find(".baustein-gallery-grid .baustein-card").on('click', bausteine.onCardClick);
            block.find(".baustein-gallery-grid .baustein-card h4").off('dblclick', bausteine.onCardDblClick);
            block.find(".baustein-gallery-grid .baustein-card h4").on('dblclick', bausteine.onCardDblClick);
            block.find(".addbaustein").off('click touchstart', bausteine.onAddButtonClick);
            block.find(".addbaustein").on('click touchstart', bausteine.onAddButtonClick);
            //sortable klappt nur im Sesktop Mode
            if (!$("body").hasClass("wp-is-mobile")) {
                block.find(".baustein-gallery-grid").sortable(bausteine.sortable);
            }
        },

        sortable: {
            nested: false,
            vertical: false,
            //handle: ".card-handle",

            onDragStart: function ($item, container, _super) {


                $(".baustein-gallery-grid .baustein-card").off('click', bausteine.onCardClick);
                //$("button.addbaustein").remove();


                document.getSelection().removeAllRanges();
                _super($item, container);

            },
            onDrop: function ($item, container, _super) {
                var innerBlocks = [], innerBlockIds = [];
                //console.log($item.parent().find('li'));
                $item.parent().find('li').each(function (index) {
                    console.log(this.id.replace('bcard-', ''))
                    innerBlockIds.push(this.id.replace('bcard-', ''))
                });
                console.log('innerBlockIds', innerBlockIds);
                for (const id of innerBlockIds) {
                    let innerBlock = select('core/block-editor').getBlock(id);
                    if(innerBlock != null && innerBlock.name=="lazyblock/baustein"){
                        innerBlocks.push(innerBlock);
                    }
                }
                console.log('innerBlocks', innerBlocks);
                let bausteineClientId = select('core/block-editor').getBlockHierarchyRootClientId(innerBlockIds[0]);
                console.log('bausteineClientId', bausteineClientId);
                dispatch('core/block-editor').replaceInnerBlocks(bausteineClientId, innerBlocks, true);
                bausteine.displayCards(bausteineClientId);
                _super($item, container);
            }
        },

        onAddButtonClick: function (e) {
            //Baustein Block zu Bausteine innerBlocks hinzufügen
            let clientId = e.target.id.replace('addcard-', '');
            bausteine.createBaustein(clientId)
        },

        createBaustein: function(parentId,title = 'Neuer Baustein',description = '', post_id = null){


            let parentblock = select('core/editor').getBlock(parentId);

            let content = '';
            if(post_id){
                content = '<a href="/?p='+post_id+'">'+bausteine.moreLabel+'</a>';
            }

            const paragraph = wp.blocks.createBlock(
                "core/paragraph",
                {
                    'placeholder': 'Ausführlicher Inhalt oder tippe / um einen Block einzufügen',
                    'content': content,
                },
            );

            const newBlock = wp.blocks.createBlock("lazyblock/baustein", {
                    'titel': title,
                    'kurzbeschreibung':description,
                    'post_id':post_id,
                }
            );



            let blocks = (parentblock.innerBlocks)?parentblock.innerBlocks:[];
            blocks.push(newBlock);
            dispatch('core/block-editor').replaceInnerBlocks(parentblock.clientId, blocks, true);
            dispatch('core/block-editor').replaceInnerBlocks(newBlock.clientId,[paragraph], true);

            //wp.data.select('core/editor').getBlockSelectionStart();
        },

        onCardDblClick: function (e) {
            if ($(e.target).hasClass('baustein-card')) {
                bcard = $(e.target);
            } else {
                bcard = $(e.target).closest('.baustein-card');
            }
            let block = bcard.attr('id').replace('bcard-', '#block-');
            $(block+' .lzb-content-controls > div:first-child .components-text-control__input').focus();
        },
        onCardClick: function (e) {

            let bcard;

            //sicher stellen dass di karte gemeint ist  und nicht der Titel, etc...
            if ($(e.target).hasClass('baustein-card')) {
                bcard = $(e.target);
            } else {
                bcard = $(e.target).closest('.baustein-card');
            }
            bcard.id = bcard.attr('id');

            console.log(bcard.hasClass('selected'));

            let clientId = bcard.id.replace('bcard-', '');
            let bausteineClientId = select('core/block-editor').getBlockHierarchyRootClientId(clientId);


            if (bcard.hasClass('selected')) {
                // card ist just activ we need toogle off
                bcard.removeClass('selected');
                $(bcard.id.replace('bcard-', '#block-')).slideUp();
                //location.hash = '#block-'+ bausteineClientId;
                return;
            }


            //console.log('bausteineClientId', bausteineClientId);
            let bausteinId = bcard.id.replace('bcard-', '#block-');

            let wpblock = $('#block-' + bausteineClientId);

            if (wpblock) {
                wpblock.find('.baustein-card').removeClass('selected');
                wpblock.find('.wp-block-lazyblock-baustein').parent().slideUp();
                bcard.addClass('selected');
                $(bausteinId).slideDown();
                //location.hash = '#block-'+ clientId;
            }


        },
        doBlockListObserve: function (fn) {

            wp.domReady(() => {
                /**
                 * create Observer
                 */
                    //watch the blocklists
                const getBlockList = () => select('core/editor').getBlocks();
                let blockList = getBlockList();

                subscribe(() => {

                    const newBlockList = getBlockList();
                    const blockListChanged = newBlockList !== blockList;
                    blockList = newBlockList;
                    if (blockListChanged) {
                        //do if blocks changing:
                        if(null !== select('core/editor').getSelectedBlock()){
                            fn();
                        }else{
                            console.log('build all bausteine');
                            let parents = getBlockList().filter(block=>block.name=='lazyblock/bausteine');
                            for (const child of parents){
                                console.log('build baustein');
                                fn(child);
                            }
                        }





                    }


                });

            });
        },

        onChange: function (props) {

            let curr_block = null
            //aktuellen Block (curr_block) ermitteln
            if (props) {

                if ('lazyblock/bausteine' == props.block) {

                    // 1. ClientId des Bausteine Blocks übermitteln, dessen props hier übermittelt wurden
                    let clientId = null;

                    for (const block of select('core/block-editor').getBlocks()
                        .filter( b => b.name == 'lazyblock/bausteine' ))
                    {

                        if (block.attributes.blockId == props.attributes.blockId) {
                            curr_block = block;
                            break;
                        }
                    }

                }
            } else {
                curr_block = select('core/editor').getSelectedBlock();
            }

            //Kacheansicht aktualisieren
            if (curr_block != null && bausteine.watchBlocks.includes(curr_block.name)) {
                console.log('blockListChanged', curr_block);
                if (curr_block.name == 'lazyblock/bausteine') {
                    bausteine.displayCards(curr_block.clientId);
                } else if (curr_block.name == 'lazyblock/baustein') {
                    //parent ermitteln
                    let parentClientId = select('core/block-editor').getBlockHierarchyRootClientId(curr_block.clientId);
                    bausteine.displayCards(parentClientId);
                }
            }
        }


    }
    bausteine.init();
    window.createNewBaustein =  bausteine.createBaustein;

    //dynamisch Eigenschaften der Blocktypen neu setzen
    wp.hooks.addFilter('editor.BlockEdit', 'namespace', function (fn) {
        wp.blocks.getBlockTypes().forEach(function (blockType) {

            if(blockType.name=='lazyblock/baustein'){
                blockType.parent=['lazyblock/bausteine'];
                blockType.allowedBlocks=['core/paragraph','core/list'];
               // blockType.attributes.lock = {'insert':true, 'move': true};
                blockType.attributes.lock = {'move': true};
            }

            if(blockType.name=='lazyblock/bausteine'){
                console.log('changeBlockType',blockType)
                blockType.attributes.allowedBlocks=['lazyblock/baustein'];
                blockType.parent=[];

            }

            // if(blockType.name=='core/paragraph'){
            //     blockType.attributes.placeholder= 'Ausführlicher Inhalt oder tippe / um einen Block einzufügen';
            //
            // }

        });
        return fn
    });



    wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange','bausteine', function (props) {

        console.log('bausteine.onChange: ', props.block);
        bausteine.onChange(props);

        window.tb_searchbox.init();

    });
})(jQuery);

