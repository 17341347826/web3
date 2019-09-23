/**
 * Created by Administrator on 2018/3/7.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("user","sign_switch/sign_switch",'css!'),
        C.Co("user","sign_switch/sign_switch",'html!'),
        C.CMF("router.js"),C.CM('three_menu_module'),
        "layer"
    ],
    function(avalon,$,css,html, x,three_menu_module, layer) {
        //保存是否需要学生确认设置
        var api_regist_set=api.user+"par_regist_set/save";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "sign_switch",
                //单选：0-否；1-是
                radio_type:1,
                radio_check:function(e){
                    this.radio_type=e;
                },
                save_click:function () {
                    //0-否；1-是
                    ajax_post(api_regist_set,{need_sure:this.radio_type},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_regist_set:
                               if(status=='200'){
                                   toastr.success("开关设置成功");
                               }
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
            });
           /* vm.$watch('onReady', function() {

            })*/
        }
        return {
            view: html,
            define: avalon_define
        }
    })