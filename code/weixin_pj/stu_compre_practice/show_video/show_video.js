/**
 * Created by Administrator on 2018/8/2.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'stu_compre_practice/show_video/show_video', 'html!'),
        C.Co('weixin_pj', 'stu_compre_practice/show_video/show_video', 'css!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon, layer, html, css, x, data_center, weui) {

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "show_video",
                src: '',
                init: function () {
                    this.src = sessionStorage.getItem('video_src');
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
