/**
 * Created by Administrator on 2018/5/29.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'e_task_control/eval_check_details/eval_check_details','html!'),
        C.Co('eval_param_set', 'e_task_control/eval_check_details/eval_check_details','css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function (avalon,layer, html,css, data_center,three_menu_module) {

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "eval-check-details",
                init:function () {

                },
                cb: function () {

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {

                }

            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });