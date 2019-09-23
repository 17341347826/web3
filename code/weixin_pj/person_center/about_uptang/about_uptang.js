/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'person_center/about_uptang/about_uptang','html!'),
        C.Co('weixin_pj', 'person_center/about_uptang/about_uptang','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper'
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "about_uptang",
                init:function(){

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