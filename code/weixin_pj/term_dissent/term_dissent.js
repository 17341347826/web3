/**
 * Created by Administrator on 2018/6/15.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co("weixin_pj","stu_term_evaluation/stu_term_evaluation","css!"),
        C.Co("weixin_pj","term_dissent/term_dissent","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"

    ],
    function($, avalon,css,html, x, data_center,weui) {
        //提异议
        var api_add_objection=api.api+"Indexmaintain/indexmaintain_addObjection";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "stu_graduation_evaluation",
                data:{},
                init:function () {
                    var obj_str = data_center.get_key('term_dissent_data');
                    this.data = JSON.parse(obj_str);
                },
                save:function () {
                    if(this.data.post_data.content==''){
                        $.alert('请输入异议！');
                        return
                    }
                    ajax_post(api_add_objection, this.data.post_data.$model, this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_add_objection:
                                $.toast("操作成功");
                                window.location = '#term_publicity';
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