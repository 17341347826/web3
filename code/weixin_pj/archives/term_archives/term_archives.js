/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co('weixin_pj', 'archives/term_archives/term_archives','html!'),
        C.Co('weixin_pj', 'archives/term_archives/term_archives','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper'
    ],
    function ($,avalon, html,css, data_center,weui,swiper) {
        var avalon_define = function () {
            // alert('ready');
            var vm = avalon.define({
                $id: "term_archives",
                //图片
                img_src:'',
                init:function(){
                    var ary = JSON.parse(sessionStorage.getItem('src'));
                    this.img_src = ary.jk+'?token='+ary.token+'&url='+ary.url;
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {

                        }
                    } else {
                        $.alert(msg);
                    }
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