(function($) {

    //kürzt die schreibweisen:

    const {
        select,                 //statt: www.data.select(...) jetzt nur: select(...)
        subscribe,              //...
        dispatch
    } = wp.data;

    const getBlocks = select('core/block-editor').getBlocks;
    const getBlock = select('core/block-editor').getBlock;
    const getSelectedBlock = select('core/block-editor').getSelectedBlock;
    const updateBlockAttributes = dispatch('core/block-editor').updateBlockAttributes;
    const updateInnerBlocks = dispatch('core/block-editor').replaceInnerBlocks;

    const modal = {

        collection: [],
        block: null,
        curr_block_clientId: null,

        init: function (){

            $(document).on('thickbox:removed', modal.onClose);

            const newType = {
                slug:'post',
                label:'Material',
                help: 'existierender Beitrag',
                fn : bausteine.plugins.modal.open
            };
            if(bausteine.bausteinTypes.filter(t=> t.slug == newType.slug).length === 0){
                bausteine.bausteinTypes.push(newType);
            }

        },

        open: function (e){
            modal.curr_block_clientId  = $(e.target).attr("data-client");
            $('.wp-block-lazyblock-reli-baustein').parent().slideUp();
            modal.displayModalSearch();
            if(typeof tb_show == "function")
                tb_show('Inhalte wählen', '#TB_inline?width=1000&inlineId=search-filter-modal');

        },

        onClose: function (){

        },
        onSearch:function (e){
            e.preventDefault(); // avoid to execute the actual submit of the form.
            modal.block = getBlock(modal.curr_block_clientId);

            if(!modal.block){
                modal.block = getSelectedBlock();
            }
            modal.collection = modal.get_selected_posts_in_bausteine(modal.block.clientId);
            var form = $(this);

            $.post(
                ajaxurl, {
                    'action': 'filterposts',
                    'collection': modal.collection,
                    'data': form.serializeArray()
                },
                function (response) {


                    //ajyx response in results div einfügen
                    $('#search-filter-results').html(response);


                    //wenn Beitragstitel in der Thickbox angeklickt wird
                    $('.selectable-post').off('click', modal.onPostSelect);
                    $('.selectable-post').on('click', modal.onPostSelect);
                }
            );
        },

        onPostSelect: function (e){
            //id des angeklickten Artikels ermitteln
            const post_id = e.target.id;


            //als markiert kennzeichen
            $(e.target).addClass('selected-post');
            $(e.target).removeClass('selectable-post');

            var id_exists = false;
            let data = modal.collection.split(',');
            let data_update = [];
            for (const dataid of data) {
                if (dataid != '') {
                    data_update.push(dataid);
                    if (post_id == dataid) {
                        id_exists = true;
                    }
                }
            }

            //id zu der collection im Attributes Objekt des Blockobjekts einfügen
            if (!id_exists) {

                console.log($(e.target).attr('data'));

                //use of btoa / atob for encode / decode base 64 strings
                console.log(
                    atob( $(e.target).attr('data') )
                );

                let data = JSON.parse(atob($(e.target).attr('data')));

                console.log('Daten für neuen Baustein: ', data);

                bausteine.createBaustein(
                    modal.block.clientId,
                    data.title,
                    data.description,
                    data.post_id
                );
            }
        },

        displayModalSearch: function (){
            $.get(
                ajaxurl, {
                    'action': 'getfilter'
                },
                function (response) {
                    let filterbar = response;
                    console.log(filterbar);
                    console.log( $('#TB_ajaxContent'));
                    $('#TB_ajaxContent').html(filterbar);
                    //$('#TB_ajaxContent').append(filterbar);


                    $('#search-filter-form').off('submit', modal.onSearch);
                    $('#search-filter-form').on('submit', modal.onSearch);

                    $('#search-filter-form').submit();

                }

            );



        },

        get_selected_posts_in_bausteine : function (clientId,as_arr = false){

            const parent = getBlock(clientId);
            let  collection = [];

            for (const child of parent.innerBlocks) {
                if (post_id = child.attributes.post_id) {
                    if(as_arr){
                        collection.push({
                            'postId': post_id,
                            'clientId': child.clientId,
                            'parentId': clientId
                        });
                    }else{
                        collection.push(post_id);
                    }
                }
            }
            if(!as_arr){
                return collection.join(',');
            }
            return collection;
        },




    };

    window.bausteine.plugins.modal = modal;


})(jQuery);
