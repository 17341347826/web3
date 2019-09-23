define([
    C.CLF('avalon.js'),
    'layer',
    C.CBF('Growth/tpj_home','html!'),
    C.CMF("router.js")],function(avalon, layer, html, x) {
 
        var avalon_define = function() {
            var url_pendingItems=api.growth + "pendingItems";
            var vm = avalon.define({
                $id: "home",
                pendingItems_list:[],
                get_pending_items:function(){
                 ajax_post(url_pendingItems,{},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case url_pendingItems:
                                this.complete_get_pending_items(data);
                                break;
                        }
                    } else {
                       layer.msg(msg)
                    }
                },
                complete_get_pending_items:function(data){
                    this.pendingItems_list=data.data;
                },
                detail:function(url){
                    window.location.href = url;
                }
            });
            vm.$watch('onReady', function() {
               this.get_pending_items()
            })
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })