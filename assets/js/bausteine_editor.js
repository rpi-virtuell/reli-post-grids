/**
 * @author Joachim happel
 */

wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange','bausteine', function (props) {

   // console.log('bausteine.onChange: ', props);
    //  bausteine.onChange(props);
});


(function($) {

    wp.domReady(()=>{

        //kürzt die schreibweisen:


        const {
            select,                 //statt: www.data.select(...) jetzt nur: select(...)
            subscribe,              //...
            dispatch
        } = wp.data;


        const bausteine = {

            plugins :{},

            bausteinTypes: [],
            moreLabel: 'mehr erfahren',

            //blocktypes festlegen, die auf Veränderungen überwacht werden sollen.
            watchBlocks: ['lazyblock/reli-bausteine', 'lazyblock/reli-baustein'],

            init: function () {
                bausteine.doBlockListObserve(bausteine.onChange);
                window.bausteine = bausteine;

                bausteine.bausteinTypes.push({
                    slug:'card',
                    label:'Inhaltsbaustein hinzufügen',
                    help:'Erzeugt ein neues Inhaltselement in diesem Block',
                    fn: bausteine.onAddButtonClick
                });
            },

            displayBlocks: function (){

                //plugin function#

                for (const curr_block   of wp.data.select('core/block-editor').getBlocks()) {

                    if (curr_block != null && bausteine.watchBlocks.includes(curr_block.name)) {
                        if (curr_block.name == 'lazyblock/reli-bausteine') {
//                            bausteine.displayCards(curr_block.clientId);
                        }
                    }

                }

            },

            displayCards: function (clientId) {

                //Kachelansicht aufbauen

                let block = $('#block-' + clientId);

                console.log('displayCards block',block);

                //Erstes EingabeControlFeld im Bausteine Block ermitteln
                let titleInputControl = block.find('.lzb-content-controls div').first();
                titleInputControl.addClass('bausteine-header');

                console.log('titleInputControl',titleInputControl);

                //falls vorhanden Block Icon löschen
                //block.find('.bausteine-icon').remove();
                //var icon = $('<div class="bausteine-icon"><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 24 24" width="40px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M3,3v8h8V3H3z M9,9H5V5h4V9z M3,13v8h8v-8H3z M9,19H5v-4h4V19z M13,3v8h8V3H13z M19,9h-4V5h4V9z M13,13v8h8v-8H13z M19,19h-4v-4h4V19z"/></g></g></g></svg></div>');
                //Block Icon vor Inputfeld einfügen
                //titleInputControl.prepend(icon);

                //falls bereits vorhanden galery löschen
                block.find(' .baustein-gallery').remove();
                block.find(' .bausteine-leitfrage').remove();
                block.find(' .baustein-helper').remove();

                var bausteinHelper = $('<div id="baustein-helper-block-aa4cb23d-d28c-4d11-b593-7b6cec9d9ec9" class="baustein-helper" data-slug="aktion" title="Weitergehende Hilfen"><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg></div>');

                var questionMark = bausteinHelper.insertAfter(titleInputControl.find('input').parent().parent());
                questionMark.on('click', e=>open('/baustein-block'));

                $('<span class="components-base-control__label bausteine-leitfrage">' +
                    '<details>'+
                    '<summary>Gib diesem Block eine passende Überschrift und füge alle benötigten Elemente ein. Mehr ..</summary>'+
                    'Statt "Bausteine" kannst du diesem Block die Überschrift "Schatztruhe", "Wochenplan", "Spiele", "Rezepte" oder einfach nur "Elemente" geben.<br> ' +
                    'Klick danach auf das <span style="color:#fff;background: #000">&nbsp;+&nbsp;</span>, ' +
                    'um ein Element hinzuzufügen. Für jedes neue Element entsteht eine Kachel, hinter der sich ein Teil deines Materials verbirgt ' +
                    'und die erst angezeigt wird, wenn du die Kachel anklickst. ' +
                    'Benenne bei jedem Element den Titel passend z.B.: "Mazenbäckerei". Jedes Element hat ' +
                    'eine Kurzbeschreibung (z.B.: "Brot ohne Sauerteig backen für das Pessachfest") und darunter Platz für den eigentlichen Inhalt: ' +
                    'Füge dort deine Idee und zugeörige Anleitungen gerne auch mit Bildern und Videos ein.' +
                    '</details>'+
                    '</span>').insertAfter(titleInputControl.find('input').parent().parent().parent());

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
                    .filter( innerblock => innerblock.name == 'lazyblock/reli-baustein' );
                let i = 0;
                for (const brick of bricks) {
                    let imgurl, title = brick.attributes.titel;

                    if(!title){
                        title = 'Baustein #'
                    }

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
                    block.find('.wp-block-lazyblock-reli-baustein').slideUp();
                }


                $('<div id="dialog-'+clientId+'" class="addbaustein-inserter" onclick="jQuery(this).hide();">' +
                    '<div class="addbaustein-inserter-header">' +
                    '<div>Inhaltsbaustein hinzufügen <span>(Neue Kachel)</span></div>'+
                    '</div>' +
                    '<div class="addbaustein-inserter-content">' +
                    '</div>' +
                    '</div>')
                    .insertAfter(block.find(".baustein-gallery-grid"));

                for (const type of bausteine.bausteinTypes) {

                    let id = 'add'+type.slug+'-'+clientId;

                    $('#dialog-'+clientId+' .addbaustein-inserter-content')
                        .append('<button title="'+type.help+'" id="'+id+'" data-client="'+clientId+'">'+type.label+'</button>');
                    $('#'+id).off('click touchstart',type.fn);
                    $('#'+id).on('click touchstart',type.fn);
                }


                //Insertbutton, um per Klick einen weiteren Bauststein zu Beisteine hinzuzufügen
                $('<div class="addbaustein-wrapper"><button id="btn-'+clientId+'" class="baustein-inserter" title="Element hinzufügen">' +
                    '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><path d="M18 11.2h-5.2V6h-1.6v5.2H6v1.6h5.2V18h1.6v-5.2H18z"></path></svg>'+
                    '</button></div>')
                    .insertAfter(block.find(".baustein-gallery-grid"));


                // show a dialog box when clicking on an element
                $('.baustein-inserter').on('click', function(e) {

                    const select_src = $('#dialog-'+clientId);
                    const btn = $('#btn-'+clientId);

                    select_src.toggle();

                    select_src.offset({top: btn.offset().top - select_src.height() - 10 });

                    if ($(window).width() < ( btn.offset().left + select_src.width() ) )
                    {
                        select_src.offset( {left: (btn.offset().left - select_src.width())  + 30 });
                    }else{
                        select_src.offset( {left: (btn.offset().left - 5) });
                    }


                });


                //Trigger initialisieren
                block.find(".baustein-gallery-grid .baustein-card").off('click', bausteine.onCardClick);
                block.find(".baustein-gallery-grid .baustein-card").on('click', bausteine.onCardClick);
                block.find(".baustein-gallery-grid .baustein-card h4").off('click', bausteine.onCardDblClick);
                block.find(".baustein-gallery-grid .baustein-card h4").on('click', bausteine.onCardDblClick);
                //block.find(".addbaustein").off('click touchstart', bausteine.onAddButtonClick);
                //block.find(".addbaustein").on('click touchstart', bausteine.onAddButtonClick);
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
                        if(innerBlock != null && innerBlock.name=="lazyblock/reli-baustein"){
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
                let clientId  = $(e.target).attr("data-client");
                bausteine.createBaustein(clientId)
            },

            createBaustein: function(parentId,title = '',description = '', post_id = null){


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

                const newBlock = wp.blocks.createBlock("lazyblock/reli-baustein", {
                        'titel': title,
                        'kurzbeschreibung':description,
                        'post_id':post_id
                    }
                );

                parentblock.innerBlocks.forEach((b)=>{$('#block-'+b.clientId).slideUp();});

                let blocks = (parentblock.innerBlocks)?parentblock.innerBlocks:[];
                blocks.push(newBlock);
                dispatch('core/block-editor').replaceInnerBlocks(parentblock.clientId, blocks, true);
                dispatch('core/block-editor').replaceInnerBlocks(newBlock.clientId,[paragraph], true);


                $('#block-'+parentId+' .lzb-content-controls > div:first-child .components-text-control__input').focus();



                //wp.data.select('core/editor').getBlockSelectionStart();
            },

            onCardDblClick: function (e) {
                if ($(e.target).hasClass('baustein-card')) {
                    bcard = $(e.target);
                } else {
                    bcard = $(e.target).closest('.baustein-card');
                }
                let block = bcard.attr('id').replace('bcard-', '#block-');
                setTimeout(()=>{
                    $(block+' .lzb-content-controls > div:first-child .components-text-control__input').focus();
                },110);
            },
            onCardClick: function (e) {

                let bcard;

                console.log('e.target',e.target);

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
                    $(bcard.id.replace('bcard-', '#block-')).slideUp();9
                    //location.hash = '#block-'+ bausteineClientId;
                    return;
                }


                //console.log('bausteineClientId', bausteineClientId);
                let bausteinId = bcard.id.replace('bcard-', '#block-');

                let wpblock = $('#block-' + bausteineClientId);

                if (wpblock) {
                    wpblock.find('.baustein-card').removeClass('selected');
                    wpblock.find('.wp-block-lazyblock-reli-baustein').slideUp();
                    bcard.addClass('selected');
                    $(bausteinId).slideDown();

                    console.log('wpblock',bausteinId, wpblock);
                    //location.hash = '#block-'+ clientId;
                }



            },
            doBlockListObserve: function (fn) {

                //wp.domReady(() => {
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
                                let parents = getBlockList().filter(block=>block.name=='lazyblock/reli-bausteine');
                                for (const child of parents){
                                    console.log('build baustein');
                                    fn(child);
                                }
                            }
                        }
                    });

               // });
            },

            onChange: function (props) {

                let curr_block = null
                //aktuellen Block (curr_block) ermitteln
                if (props) {

                    if ('lazyblock/reli-bausteine' == props.block) {

                        // 1. ClientId des Bausteine Blocks übermitteln, dessen props hier übermittelt wurden
                        let clientId = null;

                        for (const block of select('core/block-editor').getBlocks()
                            .filter( b => b.name == 'lazyblock/reli-bausteine' ))
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
                    if (curr_block.name == 'lazyblock/reli-bausteine') {
                        bausteine.displayCards(curr_block.clientId);
                    } else if (curr_block.name == 'lazyblock/reli-baustein') {
                        //parent ermitteln
                        let parentClientId = select('core/block-editor').getBlockHierarchyRootClientId(curr_block.clientId);
                        bausteine.displayCards(parentClientId);
                    }

                }


            }

        }
        window.bausteine = bausteine;
        bausteine.init();

    });

    //dynamisch Eigenschaften der Blocktypen neu setzen
    wp.hooks.addFilter('editor.BlockEdit', 'namespace', function (fn) {
        wp.blocks.getBlockTypes().forEach(function (blockType) {

            if(blockType.name=='lazyblock/reli-baustein'){
                blockType.parent=['lazyblock/reli-bausteine'];
                blockType.allowedBlocks=['core/paragraph','core/list'];
               // blockType.attributes.lock = {'insert':true, 'move': true};
                blockType.attributes.lock = {'move': true};
            }

            if(blockType.name=='lazyblock/reli-bausteine'){
                console.log('changeBlockType',blockType)
                blockType.attributes.allowedBlocks=['lazyblock/reli-baustein'];

            }


        });
        return fn
    });




    wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange','bausteine', function (props) {

        console.log('bausteine.onChange: ', props.block);
        bausteine.onChange(props);


        for(var name in bausteine.plugins){
           bausteine.plugins[name].init();
        }

    });



})(jQuery);

