/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'archives/growth_archives/growth_archives','html!'),
        C.Co('weixin_pj', 'archives/growth_archives/growth_archives','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper',C.CLF('base64.js')
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper,bs64) {
        //获取成长档案袋图片
        var api_archives_img = api.api + 'GrowthRecordBag/wx_growth_file_get_img';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "growth_archives",
                //请求图片
                url_img: url_img,
                //图片
                img_src:'',
                init:function(){
                    var token = sessionStorage.getItem('token');
                    var f_url = 'pj.xtyun.net/Growth/index.html#file_details?guid=' +pmx.guid;
                    var url = bs64.encoder(f_url);
                    var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                    var con = '档案加载中...';
                    var newwindow = window.open(dz,"_blank");
                    newwindow.document.write(con);
                },

                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                        if (is_suc) {
                            switch (cmd) {
                                // //学生列表
                                // case api_archives_img:
                                //     this.complete_archives_img(data);
                                //     break;
                            }
                        } else {
                            $.alert(msg);
                        }
                    },
                // complete_archives_img:function(data){
                //     // this.img_src = 'http://pj.xtyun.net/Growth'+ data.data.imgPath;
                //     if(data.data){
                //         this.img_src = window.location.origin + '/Growth' + data.data.imgPath;
                //     }
                // },
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