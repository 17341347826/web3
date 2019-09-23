/**
 * 部分加载转圈圈
 * Created by Administrator on 2018/5/24.
 */
define([
        C.CLF('avalon.js'),
        "amazeui",
        C.CM("partial_loading", "html!"),
        C.CMF("partial_loading/loading.js"),
        C.CMF("data_center.js")
    ],

    function(avalon, amazeui, html,bjz,data_center) {
        var HTTP_X = location.origin;
        var detail = avalon.component('ms-three-menu', {
            template: html,
            defaults: {
                onReady: function() {
                    var a = new Loading();
                    console.log(a);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {

                        }
                    }
                },
            }
        });

    });