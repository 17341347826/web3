/**
 * Created by Administrator on 2018/7/31.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'stu_daily_performance/daily_performance_check/daily_performance_check','html!'),
        C.Co('weixin_pj', 'stu_daily_performance/daily_performance_check/daily_performance_check','css!'),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($,avalon,layer, html,css,x, data_center,weui) {
        var list_api = api.api + "everyday/get_list_my_everyday";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "daily_performance_check",
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                //学年学期列表
                semester_list: [],
                //年级列表和班级列表
                user_info: [],
                //需要传参
                extend: {
                    code: '',
                    name:"",
                    fk_semester_id: "",
                    status: 5,
                    fk_class_id:"",
                    offset:0,
                    rows:15
                },
                list:[],
                district_name:"",
                //前一次请求的滚动条高度
                old_scroll_top: '',
                url_img: url_img,
                user_photo: cloud.user_photo,
                current_menu:'',
                //菜单改变
                menu_change:function(){
                    window.location = '#daily_performance_statistics';
                },
                init: function () {
                    this.district_name = D("user.user.district")
                    this.semester_list = cloud.semester_all_list();
                    console.log(this.semester_list);
                    this.current_menu = this.semester_list[0].value;
                    this.get_semester_id(this.current_menu)
                    this.get_data();
                    this.listen_scroll();
                },
                uninit:function () {
                    $(window).unbind ('scroll');
                },
                listen_scroll: function () {
                    var self = this;
                    var range = 100;
                    $(window).scroll(function () {
                        var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                        if(($(document).height()-range) <= totalheight ) {
                            if (self.list.length < self.extend.rows)
                                return;
                            self.extend.rows += 15;
                            self.old_scroll_top = $(document).height()-range;
                            self.get_data();
                        }
                    })
                },
                get_data: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(list_api, this.extend.$model, this)
                },
                get_semester_id:function (semester) {
                    this.extend.fk_semester_id = semester.split('|')[0];
                },
                //菜单跳转
                menu_jump:function () {
                    // this.current_menu = value;
                    this.get_semester_id(this.current_menu);
                    this.get_data();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case list_api:
                                var list = data.data.list;
                                for (var i = 0; i < list.length; i++) {
                                    if(list[i].attachment == ''){
                                        list[i].attachment = [];
                                    }else{
                                        list[i].attachment = JSON.parse(list[i].attachment);
                                    }
                                }
                                ready_photo(data.data.list,'guid');
                                this.list = list;
                                layer.closeAll();
                                if (this.old_scroll_top > 0) {
                                    $(window).scrollTop(this.old_scroll_top);
                                }
                                break;
                            default:
                                break;

                        }
                    } else {
                        $.alert(msg)
                    }
                },
            });

            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });