/**
 * @author Joachim happel
 */

const bausteine = {
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

        if(bcard.hasClass('selected')){
            // card ist just activ we need toogle off
            bcard.removeClass('selected');
            $(bcard.id.replace('bcard-','#block-')).hide();
            return;
        }


        //console.log('click',bcard);

        let clientId = bcard.id.replace('bcard-', '');
        let bausteineClientId =  wp.data.select('core/block-editor').getBlockHierarchyRootClientId(clientId);


        //console.log('bausteineClientId', bausteineClientId);
        let bausteinId = bcard.id.replace('bcard-', '#block-');

        let wpblock = $('#block-'+ bausteineClientId);

        //console.log('find', wpblock);


        if(wpblock){
            wpblock.find('.baustein-card').removeClass('selected');
            wpblock.find('.wp-block-lazyblock-baustein').parent().hide();
            bcard.addClass('selected');
            $(bausteinId).show();
        }


    },
    displayCards: function (clientId){
        const $ = jQuery;
        let block = $('#block-' + clientId);

        block.find(' .baustein-gallery').remove();

        var target = block.find('.lzb-content-controls div').first();

        var gallery = $(
            '<div style="width: 100%">' +
                '<div class="baustein-gallery">' +
                    '<ul class="baustein-gallery-grid">' +
                    '</ul>' +
                '</div>' +
            '</div>').insertAfter(target);



        let bricks = wp.data.select( 'core/editor' ).getBlock(clientId).innerBlocks;
        let i =0;
        for (const brick of bricks) {
            let imgurl;
            block.find(".baustein-gallery-grid").append(jQuery('' +
                '<div class="baustein-card" id="bcard-'+brick.clientId+'" data-order="'+i+'" style="/*background-image: url('+imgurl+')*/">' +
                '<h4>' + brick.attributes.titel + '</h4>' +
                '<p>' + brick.attributes.kurzbeschreibung + '</p>' +
                '</div>'
            ));
        }


        block.find(".baustein-gallery-grid").append(jQuery('' +
            '<button class="addbaustein">+</button>'
        ));

        block.find(".baustein-gallery-grid .baustein-card").off('click',bausteine.onCardClick);
        block.find(".baustein-gallery-grid .baustein-card").on('click',bausteine.onCardClick);
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


});

wp.hooks.addAction( 'lzb.components.PreviewServerCallback.onBeforeChange', 'my.custom.namespace', function ( props ) {
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

                        $(".baustein-gallery-grid .baustein-card").off('click',bausteine.onCardClick);
                        $(".baustein-gallery-grid .baustein-card").on('click',bausteine.onCardClick);

                    }
                }

                $('.wp-block-lazyblock-baustein').parent().hide();
            //});

        });


    }


});

