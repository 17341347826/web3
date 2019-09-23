/**
 * Created by Administrator on 2018/9/12.
 */
define([C.CLF("avalon.js"),
        'jquery',
        C.Co("weixin_pj", "school_login/school_menu/school_menu", "css!"),
        C.Co("weixin_pj", "school_login/school_menu/school_menu", "html!"),
        C.CM("bottom_tab")
    ],
    function (avalon,$, css, html,tb) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "school_menu",
                init: function () {

                },
                jump_page:function (url) {
                    window.location.href = "#"+url;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd){
                        default:
                            break;
                    }
                }
            });
            require(["jquery-weui"], function (j) {

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });