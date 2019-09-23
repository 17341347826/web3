/**
 * Created by uptang on 2017/9/4.
 */

define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("user", "mocha_itom/mocha_itom", "css!"),
        C.Co("user", "mocha_itom/mocha_itom", "html!"),
        "layer",
        C.CM("table"),
        C.CMF("data_center.js"),
        C.CM('three_menu_module')],
    function ($, avalon, css, html, layer, table, data_center,three_menu_module) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "mocha_itom",
                init: function () {
                },
                //版本管理
                version_management:function(){
                    // window.open('http://pj.xtyun.net:38038/harbor/sign-in?redirect_url=%2Fharbor%2Flogs');
                    window.open('http://183.223.236.40:52193/harbor/sign-in');
                },
                //版本发布
                version_release:function(){
                    // window.open('http://182.140.223.186:19011/update_manage/login');
                    window.open(location.origin+'/update_manage/login');
                },
                //菜单管理
                menu_management:function(){
                    // window.open('http://182.140.223.186/ops/index.html#menu');
                    window.open(location.origin+'/ops/index.html#menu');
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
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