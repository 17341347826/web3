/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'person_center/hot_issues/hot_issues','html!'),
        C.Co('weixin_pj', 'person_center/hot_issues/hot_issues','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper'
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "hot_issues",
                init:function(){

                },
            //    页面切换
                menu_change:function(){
                    window.location = '#give_feedback';
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