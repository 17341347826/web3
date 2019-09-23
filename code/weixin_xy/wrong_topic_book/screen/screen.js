/**
 * Created by Administrator on 2018/1/25.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_xy/wrong_topic_book", "screen/screen", "css!"),
        C.Co("weixin_xy/wrong_topic_book", "screen/screen", "html!"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, css, html, data_center) {

        var avalon_define = function (par) {
            var vm = avalon.define({
                $id: "screen",
                init: function () {

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }

                }

            });
            require(["jquery_weui"], function (j) {
                vm.init();
            });
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    });