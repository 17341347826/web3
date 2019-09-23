/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("eval_param_set", "e_task_control/health_item_edit/health_item_edit", "css!"),
        C.Co("eval_param_set", "e_task_control/health_item_edit/health_item_edit", "html!"),
        C.CMF("data_center.js"),"layer"],
    function ($, avalon, css, html, data_center,layer) {

        var url_health_item_edit = api.api + "score/update_health_item";
        var url_health_item_detail = api.api + "score/get_health_item";
        var avalon_define = function (params) {
            var vm = avalon.define({
                $id: "health_item_edit",
                form_list: [],
                current_create_index: -1,
                init: function () {

                    ajax_post(url_health_item_detail, params, this)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case url_health_item_detail: {
                                this.form_list.push(data.data);
                                break
                            }
                            case url_health_item_edit:{
                                window.location.href = "#health_item_mana";
                                break;
                            }
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                analyze_item: function () {
                    form_data_commit(url_analyze_excel, "form_rule", this);
                },
                del_strand: function (x, y) {
                    this.form_list[x].strand.splice(y, 1)
                },
                del_ext: function (x, y) {
                    this.form_list[x].ext.splice(y, 1)
                },
                //取消
                cancle: function (x) {
                    window.location.href = "#health_item_mana";
                },
                save_as: function (ip, data) {
                    this.current_create_index = ip;
                    ajax_post(url_health_item_edit, data.$model, this)
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