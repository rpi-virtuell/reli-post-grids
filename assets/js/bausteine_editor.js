/**
 * @author Joachim happel
 */


const bausteine = {

    sortable:{
        nested: false,
        vertical: false,
        //handle: ".post-card-handle",

        onDragStart: function ($item, container, _super) {
            const $ = jQuery;

            $(".baustein-gallery-grid .baustein-card").off('click',bausteine.onCardClick);
            //$("button.addbaustein").remove();


            document.getSelection().removeAllRanges();
            _super($item, container);

        },
        onDrop: function ($item, container, _super) {
            var innerBlocks = [], innerBlockIds=[];
            //console.log($item.parent().find('li'));
            $item.parent().find('li').each(function (index) {
                console.log(this.id.replace('bcard-', ''))
                innerBlockIds.push(this.id.replace('bcard-', ''))
            });
            console.log('innerBlockIds',innerBlockIds);
            for (const id of innerBlockIds) {
               innerBlocks.push(wp.data.select('core/block-editor').getBlock(id));
            }
            console.log('innerBlocks',innerBlocks);

            let bausteineClientId =  wp.data.select('core/block-editor').getBlockHierarchyRootClientId(innerBlockIds[0]);
            console.log('bausteineClientId',bausteineClientId);
            wp.data.dispatch('core/block-editor').replaceInnerBlocks(bausteineClientId, innerBlocks,true);
            bausteine.displayCards(bausteineClientId);

            _super($item, container);
        }
    },

    onCardClick:function (e){
        const $ = jQuery;
        let bcard;

        //sicher stellen dass di karte gemeint ist  und nicht der Titel, etc...
        if($(e.target).hasClass('baustein-card')) {
            bcard = $(e.target);
        }else{
            bcard = $(e.target).closest('.baustein-card');
        }
        bcard.id = bcard.attr('id');

        console.log(bcard.hasClass('selected'));

        let clientId = bcard.id.replace('bcard-', '');
        let bausteineClientId =  wp.data.select('core/block-editor').getBlockHierarchyRootClientId(clientId);


        if(bcard.hasClass('selected')){
            // card ist just activ we need toogle off
            bcard.removeClass('selected');
            $(bcard.id.replace('bcard-','#block-')).slideUp();
            location.hash = '#block-'+ bausteineClientId;
            return;
        }


        //console.log('bausteineClientId', bausteineClientId);
        let bausteinId = bcard.id.replace('bcard-', '#block-');

        let wpblock = $('#block-'+ bausteineClientId);

        if(wpblock){
            wpblock.find('.baustein-card').removeClass('selected');
            wpblock.find('.wp-block-lazyblock-baustein').parent().slideUp();
            bcard.addClass('selected');
            $(bausteinId).slideDown();
            location.hash = '#block-'+ clientId;
        }


    },
    displayCards: function (clientId){
        const $ = jQuery;
        let block = $('#block-' + clientId);

        block.find(' .baustein-gallery').remove();

        var target = block.find('.lzb-content-controls div').first();

        target.addClass('bausteine-header');

        var icon = $('<div class="bausteine-icon"><svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 24 24" width="40px" fill="#000000"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M3,3v8h8V3H3z M9,9H5V5h4V9z M3,13v8h8v-8H3z M9,19H5v-4h4V19z M13,3v8h8V3H13z M19,9h-4V5h4V9z M13,13v8h8v-8H13z M19,19h-4v-4h4V19z"/></g></g></g></svg></div>');
        $('.bausteine-icon').remove();
        target.prepend(icon);


        var gallery = $(
            '<div style="width: 100%">' +
                '<div class="baustein-gallery">' +
                    '<ul class="baustein-gallery-grid">' +
                    '</ul>' +
                '</div>' +
            '</div>');

        gallery.insertAfter(target);



        let bricks = wp.data.select( 'core/editor' ).getBlock(clientId).innerBlocks;
        let i =0;
        for (const brick of bricks) {
            let imgurl;
            block.find(".baustein-gallery-grid").append(jQuery('' +
                '<li class="baustein-card" id="bcard-'+brick.clientId+'" data-order="'+i+'" style="/*background-image: url('+imgurl+')*/">' +
                '<h4>' + brick.attributes.titel + '</h4>' +
                '<p>' + brick.attributes.kurzbeschreibung + '</p>' +
                '</li>'
            ));
        }


        $('<div class="addbaustein-wrapper"><button class="addbaustein" id="addcard-'+clientId+'">+</button></div>')
            .insertAfter(block.find(".baustein-gallery-grid"));

        block.find(".baustein-gallery-grid .baustein-card").off('click touchstart',bausteine.onCardClick);
        block.find(".baustein-gallery-grid .baustein-card").on('click touchstart',bausteine.onCardClick);
        block.find(".addbaustein").off('click touchstart',bausteine.onAddButtonClick);
        block.find(".addbaustein").on('click touchstart',bausteine.onAddButtonClick);

        if (! $( "body" ).hasClass("wp-is-mobile")){
            block.find(".baustein-gallery-grid").sortable(bausteine.sortable);
        }

    },
    onAddButtonClick: function(e){
        let clientId = e.target.id.replace('addcard-','');
        let block =  wp.data.select('core/editor').getBlock(clientId);
        const newBlock = wp.blocks.createBlock( "lazyblock/baustein", {
            titel: 'Neuer Baustein',
        });
        let blocks = block.innerBlocks;
        blocks.push(newBlock);
        wp.data.dispatch('core/block-editor').replaceInnerBlocks(block.clientId,blocks,true );
    }


}

wp.domReady( () => {

    const {
        select,
        subscribe
    } = wp.data;

    const $ = jQuery;

    const getBlockList = () => select( 'core/editor' ).getBlocks();
    blockList = getBlockList();
    subscribe( (e) => {
        const newBlockList = getBlockList();
        const blockListChanged = newBlockList !== blockList;
        blockList = newBlockList;
        if ( blockListChanged ) {
             //listener
            let curr_block = select( 'core/editor' ).getSelectedBlock();
            if(curr_block != null && curr_block.name.indexOf('lazyblock/')===0){
                console.log('blockListChanged',e ,curr_block);
                curr_block.blockId = curr_block.attributes.blockId;
                curr_block.block = curr_block.name;
                //wp.hooks.doAction('lzb.components.PreviewServerCallback.onChange',curr_block);
                if(curr_block.name =='lazyblock/bausteine'){
                    bausteine.displayCards(curr_block.clientId);
                }else if(curr_block.name =='lazyblock/baustein'){
                    parentClientId = wp.data.select('core/block-editor').getBlockHierarchyRootClientId(curr_block.clientId);
                    bausteine.displayCards(parentClientId);
                }


            }

        }

    } );
    for (const type of wp.blocks.getBlockTypes()) {
        if (type.name == 'lazyblock/bausteine'){
            type.supports.inserter = false;
        }
    }

});

wp.hooks.addFilter('blocks.registerBlockType', 'bausteine', function (type, attr) {
    if (type.name == 'lazyblock/bausteine'){
        type.supports.inserter = false;
    }
    return type;
});

wp.hooks.addAction( 'lzb.components.PreviewServerCallback.onBeforeChange', 'bausteine', function ( props ) {
    //console.log( props );

} );

wp.hooks.addAction('lzb.components.PreviewServerCallback.onChange', 'baustein', function (props) {

    console.log('onChange: '+ props.block);

    const $ = jQuery;

    if ('lazyblock/baustein' == props.block || 'lazyblock/bausteine' == props.block) {

        let clientId=null;
        let children = [];

        for (const block of wp.data.select('core/block-editor').getBlocks()) {

            if (block.name != 'lazyblock/bausteine'){
                continue
            }

            for(baustein of block.innerBlocks){
                //console.log('innerblock',baustein.attributes.blockId);
                children.push({blockId:baustein.attributes.blockId, child:baustein.clientId, parent:block.clientId});
            }

            if (block.attributes.blockId == props.attributes.blockId) {
                clientId = block.clientId;
                break;
            }

        }
        //baustein event
        if(clientId === null){
            //console.log('children', children);
            for (const child of children) {
                if(child.blockId == props.attributes.blockId){
                    clientId = child.parent;
                }
            }
        }


        if(!clientId){
            //console.log('keine clientId', props);
            return;
        }


        if (props.block == 'lazyblock/baustein'){

            $('#block-' + clientId +'  input[type=text]').on("focusout", function (e) {
               // wp.hooks.doAction('lzb.components.PreviewServerCallback.onChange' ,props);
            })


        }

        // window.__Bausteinsammlung_clientId = clientId;
        // window.__props = props;

        $('.wp-block-lazyblock-bausteine').parent().ready(($)=>{
                let blockList = wp.data.select( 'core/editor' ).getBlocks();

                console.log(blockList);
                for (const block of blockList) {

                    if(block.name == 'lazyblock/bausteine')
                    {
                        console.log(block.clientId);
                        bausteine.displayCards(block.clientId);

                        $(".baustein-gallery-grid .baustein-card").off('click touchstart',bausteine.onCardClick);
                        $(".baustein-gallery-grid .baustein-card").on('click touchstart',bausteine.onCardClick);
                        $('.addbaustein').off('click touchstart',bausteine.onAddButtonClick);
                        $('.addbaustein').on('click touchstart',bausteine.onAddButtonClick);

                        if (! $( "body" ).hasClass("wp-is-mobile")){
                            $(".baustein-gallery-grid").sortable(bausteine.sortable);
                        }
                    }
                }

                $('.wp-block-lazyblock-baustein').parent().hide();
            //});

        });


    }


});

