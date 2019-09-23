/**
 * Created by uptang on 2017/7/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "stu_term_evaluation/stu_term_evaluation", "css!"),
        C.Co("weixin_pj", "modify_stu_term_ev/modify_stu_term_ev", "html!"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon,css, html, data_center,weui) {

        //评语提交
        var remarl_my_api = api.api + "everyday/remarl_my";

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "modify_stu_term_ev",
                data:{},
                init:function () {
                  var obj_str = data_center.get_key('stu_term_ev_update_data');
                  this.data = JSON.parse(obj_str);
                },
                submit_data:function () {
                    if(this.data.post_data.content_my==''){
                        $.alert('请填写评语')
                        return;
                    }
                  ajax_post(remarl_my_api,this.data.post_data.$model,this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case remarl_my_api:
                                $.toast("操作成功");
                                window.location.href = "#stu_term_evaluation";
                                break;
                            default:
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }

                }
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });