/**
 * Created by Administrator on 2018/3/8.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "add_wx_material/add_wx_material", "css!"),
        C.Co("weixin_pj", "add_wx_material/add_wx_material", "html!"),
        C.CM("add_wx_practice_module"),
        C.CM("add_wx_achievement_module"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function($, avalon,css,html,add_wx_practice_module,add_wx_achievement_module, x,data_center,weui) {
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "add_wx_material",
                add_type:0,
                pmx:"",
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {

                    }else{
                        $.alert(msg);
                    }

                }
            });
            vm.$watch("onReady", function() {

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });




