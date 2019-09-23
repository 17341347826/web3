/**
 * Created by Administrator on 2018/3/6.
 */
define([
        "jquery",C.CLF('avalon.js'),'layer',
        C.Co('user','leader_club_detail/leader_club_detail','html!'),
        C.Co('user','leader_club_detail/leader_club_detail','css!'),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($,avalon,layer,html,css, x, data_center,three_menu_module){
        //统计数据进度
        var api_get_count=api.growth+'communityManagement_details';
        var avalon_define=function(pmx){
            var vm=avalon.define({
                $id:'leader_club_detail',
                //社团
                club_data:[],
                cd:function(){
                    var self=this;
                    data_center.uin(function(data){
                        var cArr = [];
                        var highest_level = data.data.highest_level;
                        var tUserData = JSON.parse(data.data["user"]);
                        //进度
                        ajax_post(api_get_count,{id:pmx.id.toString()},self);
                    })
                },
                on_request_complete:function(cmd, status, data, is_suc, msg){
                    if(is_suc){
                        switch(cmd){
                            case api_get_count:
                                this.complete_get_count(data);
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                complete_get_count:function(data){
                    this.club_data=data.data.list;
                },
            });
            vm.$watch('onReady',function(){
                this.cd();
            });
            return vm;
        }
        return{
            view:html,
            define:avalon_define
        }
    }
)