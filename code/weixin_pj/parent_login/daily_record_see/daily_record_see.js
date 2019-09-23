/**
 * Created by Administrator on 2018/9/6.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'parent_login/daily_record_see/daily_record_see','html!'),
        C.Co('weixin_pj', 'parent_login/daily_record_see/daily_record_see','css!'),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($,avalon,layer, html,css,x, data_center,weui) {
        //家长查看学生日常表现
        var list_api = api.api + "everyday/list_everyday";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "daily_record_see",
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
                    start_date:'',
                    end_date:'',
                    //得分类型:1加分2减分 8全部
                    mark_type:8,
                    //学生guid
                    guid:'',
                    status: 5,
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
                    this.get_semester_id(this.current_menu);
                    this.get_start_date(this.current_menu);
                    this.get_end_date(this.current_menu);
                    this.cd();
                    this.listen_scroll();
                },
                cd:function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUser = JSON.parse(data.data.user);
                        var stu = tUser.student;
                        self.extend.guid = stu.guid;
                    //    请求日常表现
                        self.get_data();
                    })
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
                //获取学年学期开始时间
                get_start_date:function(sem){
                    var start = sem.split('|')[1]
                    this.extend.start_date = this.timeChuo(start);
                },
                //获取学年学期结束时间
                get_end_date:function(sem){
                    var end = sem.split('|')[2]
                    this.extend.end_date = this.timeChuo(end);
                },
                //学年学期切换
                menu_jump:function () {
                    // this.current_menu = value;
                    this.get_semester_id(this.current_menu);
                    this.get_start_date(this.current_menu);
                    this.get_end_date(this.current_menu);
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
                //js把时间戳转为为普通日期格式
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    };
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
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