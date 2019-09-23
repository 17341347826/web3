/**
 * Created by Administrator on 2018/9/4.
 */
define([C.CLF("avalon.js"),
        'jquery',
        C.Co2("weixin_pj", "teacher_menu", "css!"),
        // C.Co("weixin_pj", "parent_login/parent_menu/parent_menu", "css!"),
        C.Co("weixin_pj", "parent_login/parent_menu/parent_menu", "html!"),
        C.CM("bottom_tab"),C.CLF('base64.js')
    ],
    function (avalon,$, css, html,tb,bs64) {

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "parent_menu",
                init: function () {

                },
                jump_page:function (url) {
                    window.location.href = "#"+url;
                },
                //档案打开新窗口
                new_open:function(num){
                    //目前为了过检查，临时屏蔽
                    // var stu_info = cloud.user_user().student;
                    // var token = sessionStorage.getItem('token');
                    // if(num == 1){//成长记录袋
                    //     var f_url = '/Growth/index.html#file_details?guid=' + stu_info.guid;
                    //     var url = bs64.encoder(f_url);
                    // }else if(num == 2){//学期评价档案
                    //     var f_url = '/Growth/index.html#evaluation_detail';
                    //     var url = bs64.encoder(f_url);
                    // }else if(num == 3){//毕业评价档案
                    //     var f_url = '/Growth/index.html#graduation_file';
                    //     var url = bs64.encoder(f_url);
                    // }
                    // var dz = window.location.origin + '/api/GrowthRecordBag/wx_growth_file_get_img?token='+token+'&url='+url;
                    // window.open(dz)

                    $.alert("该学生还未生成成长档案!");
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd){
                        default:
                            break;
                    }
                }
            });
            require(["jquery-weui"], function (j) {

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });