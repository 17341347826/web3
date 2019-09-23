/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'archives/graduate_archives/graduate_archives','html!'),
        C.Co('weixin_pj', 'archives/graduate_archives/graduate_archives','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper'
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "graduate_archives",
                //请求图片
                url_img: url_img,
                //图片
                img_src:'',
                init:function(){
                    // var ary = JSON.parse(pmx.url);
                    // this.img_src = ary.jk+'?token='+ary.token+'&url='+ary.url;
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
            define: avalon_define,
            repaint:true,
        }
    });