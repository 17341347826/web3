define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('all_index', 'test/test','html!'),
        C.Co('all_index', 'test/test','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("table")
    ],
    function (avalon,layer, html,css, data_center,select_assembly,table) {

        var avalon_define = function (args) {
            var vm = avalon.define({
                $id: "test",
                init:function () {
                    // this.grade_list = cloud.grade_all_list();
                },
                cb: function () {

                },

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