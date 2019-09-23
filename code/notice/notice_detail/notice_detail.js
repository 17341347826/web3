/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("teacher_development", "teacher_development_public/css/teacher_development_public", "css!"),
        C.Co("notice", "notice_detail/notice_detail", "css!"),
        C.Co("notice", "notice_detail/notice_detail", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CMF("formatUtil.js"),C.CM('page_title')],
    function ($, avalon, css1, css2, html, layer, table, data_center, formatUtil,page_title) {
        //获取修改详情
        var get_detail_api = api.api + "/Indexmaintain/indexmaintain_selByIdNewNoticeInfo";

        var avalon_define = function (par) {

            var vm = avalon.define({
                $id: "start",
                detail_message:'',
                // 列表表头名称
                init: function () {
                    ajax_post(get_detail_api, {id:par.id}, this)
                },


                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case get_detail_api:
                                this.detail_message = data.data;
                                break;

                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
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