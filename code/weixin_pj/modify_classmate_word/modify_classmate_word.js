/**
 * Created by Administrator on 2018/7/24.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co("weixin_pj", "modify_classmate_word/modify_classmate_word", "css!"),
        C.Co("weixin_pj", "modify_classmate_word/modify_classmate_word", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon, layer, css, html, x, data_center, weui) {

        //评语提交
        var api_remarl_add = api.api + "everyday/remarl_he";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "modify_classmate_word",
                data: {},
                init: function () {
                    var obj_str = data_center.get_key('update_classmate_data');
                    this.data = JSON.parse(obj_str);
                },
                //提交
                edit_btn: function () {
                    if(this.data.post_data.content==''){
                        $.alert('请填写评语');
                        return
                    }
                    ajax_post(api_remarl_add, this.data.post_data.$model, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //保存评论
                            case api_remarl_add:
                                $.toast("操作成功");
                                window.location = '#classmate_send_word';
                                break;
                        }
                    }
                },
            });

            vm.init();
            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });