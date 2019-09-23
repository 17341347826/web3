/**
 * Created by Administrator on 2018/6/15.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co("weixin_pj","stu_term_evaluation/stu_term_evaluation","css!"),
        C.Co("weixin_pj","modify_stu_graduation_ev/modify_stu_graduation_ev","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function($, avalon,css,html, x, data_center,weui) {
        //添加、修改自评
        var api_add_remark=api.api+'Indexmaintain/add_or_update_bybg_remark';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "stu_graduation_evaluation",
                add_data:{},
                init:function () {
                    var obj_str = data_center.get_key('modify_stu_graduation_ev_data');
                    this.add_data = JSON.parse(obj_str);
                },
                save:function () {
                    ajax_post(api_add_remark, this.add_data.$model, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_add_remark:
                                $.toast("操作成功");
                                window.location = '#stu_graduation_evaluation';
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                }
            });
            vm.init();
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    })