/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("notice", "message_center/message_center", "css!"),
        C.Co("notice", "message_center/message_center", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js"),C.CM('three_menu_module')],
    function ($, avalon, css, html, layer, data_center, formatUtil,three_menu_module) {
        var api_url = api.api + 'GrowthRecordBag/page_push_my_msg';

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "message_center",
                list:[],
                init:function () {
                    ajax_post(api_url,{offset:0,rows:99999},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //查询通知
                            case api_url:
                                this.list = data.data.list;
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                time_sub:function (x) {
                    var s = x.substring(0,10);
                    return s;
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