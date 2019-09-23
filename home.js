define([
        C.CLF('avalon.js'),
        'layer',
        C.CBF('Growth/home', 'html!'),
        C.CBF('Growth/home', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts'
    ],
    function (avalon,layer, html,css, data_center,select_assembly,echarts) {

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "home",
                cb:function () {},
                on_request_complete: function (cmd, status, data, is_suc, msg) {

                }
            });
            vm.$watch('onReady', function () {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });