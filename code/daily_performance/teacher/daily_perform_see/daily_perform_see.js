/**
 * Created by Administrator on 2018/6/6.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance', 'teacher/daily_perform_see/daily_perform_see', 'html!'),
        C.Co('daily_performance', 'teacher/daily_perform_see/daily_perform_see', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        //审核公式管控-查询
        var api_query_pub = api.api + 'GrowthRecordBag/publicity_audit_query';
        //教师查看日常表现
        var list_api = api.api + "everyday/list_create_everyday";
        //班干部查看日常表现
        var create_everyday_api = api.api + "everyday/get_list_my_create_everyday";
        // // 删除数据
        var api_delete_by_id = api.api + "everyday/delete_everyday";
        //过滤器：判断加减分
        avalon.filters.addSubType = function(str){
            //得分类型	number	1加分2减分
            if(str == 1 || str == '1'){
                return '';
            }else if(str == 2 || str == '2'){
                return '-';
            }
        };
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "daily_perform_see",
                html_display: 1,
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                //学年学期列表
                semester_list: [],
                semester_name: "",
                //年级列表和班级列表
                user_info: [],
                //需要传参
                extend: {
                    code: '',
                    name: "",
                    fk_semester_id: "",
                    status: 1,
                    fk_class_id: "",
                    offset: 0,
                    rows: 15,
                    founder: '',
                    fk_school_id: ""
                },
                list: [],
                district_name: "",
                //前一次请求的滚动条高度
                old_scroll_top: '',
                url_img: url_img,
                user_photo: cloud.user_photo,
                current_menu: '',
                user_level: '',
                init: function () {
                    this.district_name = D("user.user.district")
                    this.semester_list = cloud.semester_all_list();
                    var semester_obj = {
                        name: '全部',
                        value: ''
                    };
                    this.semester_list.unshift(semester_obj);
                    this.current_menu = this.semester_list[1].value;
                    this.user_level = cloud.user_level();
                    var user = cloud.user_user();
                    if (this.user_level == 4) {
                        this.extend.fk_school_id = cloud.user_school_id();
                    } else {
                        this.extend.founder = user.guid;

                    }
                    var remark_obj = JSON.parse(sessionStorage.getItem('remark_obj'));
                    if (remark_obj) {
                        if (Number(remark_obj.fk_semester_id) == '') {
                            this.extend.fk_semester_id = '';
                        } else {
                            this.extend.fk_semester_id = Number(remark_obj.fk_semester_id);
                        }
                        if (remark_obj.semester_name == '') {
                            this.semester_head = '';
                        } else {
                            this.semester_head = remark_obj.semester_name;
                        }
                        this.extend.status = remark_obj.status;
                    } else {
                        this.extend.fk_semester_id = '';
                        this.semester_head = '';
                        this.extend.status = 1;
                    }
                    if (this.user_level == 7) {
                        this.extend.fk_class_id = user.fk_class_id;
                        this.get_data();
                        return;
                    }
                    this.user_info = cloud.auto_grade_list();
                    if (this.user_info.length == 0) {
                        layer.alert('您暂无执教年级数据');
                        return;
                    }
                    this.deal_grade_class(this.user_info);
                    this.listen_scroll();
                },
                uninit: function () {
                    $(window).unbind('scroll');
                },
                update_data: function (el) {
                    data_center.set_key("my_add_list", el.id);
                    if (this.user_level == 6) {
                        window.location = "#dpe?params_type=" + 2 + "&my_add_list=" + el.id + '&status=' + 1;
                        return
                    }
                    window.location = "#dpe?params_type=" + 2 + "&my_add_list=" + el.id + '&status=' + 2;


                },
                delete_data: function (el) {
                    var self = this;
                    var id = el.id;
                    layer.confirm('你确定要删除吗？', {
                        btn: ['确定', '取消'] //按钮
                    }, function () {
                        //删除
                        toastr.info('正在删除中', {icon: 1});
                        ajax_post(api_delete_by_id, {id: id}, self);
                    });
                },
                listen_scroll: function () {
                    var self = this;
                    var range = 100;
                    $(window).scroll(function () {
                        var srollPos = $(window).scrollTop();    //滚动条距顶部距离(页面超出窗口的高度)
                        totalheight = parseFloat($(window).height()) + parseFloat(srollPos);
                        if (($(document).height() - range) <= totalheight) {
                            if (self.list.length < self.extend.rows)
                                return;
                            self.extend.rows += 15;
                            self.old_scroll_top = $(document).height() - range;
                            self.get_data();
                        }
                    })
                },
                get_data: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    if (this.user_level == 7) {
                        ajax_post(create_everyday_api, this.extend.$model, this);
                        return;
                    }
                    ajax_post(list_api, this.extend.$model, this)
                },
                deal_grade_class: function (user_info) {
                    this.grade_list = [];
                    for (var i = 0; i < user_info.length; i++) {
                        var obj = {
                            name: '',
                            value: ''
                        };
                        obj.name = user_info[i].grade_name;
                        obj.value = user_info[i].grade_id;
                        this.grade_list.push(obj)
                    }
                    this.get_class(user_info[0]);
                },
                get_class: function (grade) {
                    var class_list = grade.class_list;
                    var class_length = class_list.length;
                    this.class_list = [];
                    for (var i = 0; i < class_length; i++) {
                        var class_obj = {};
                        class_obj.name = class_list[i].class_name;
                        class_obj.value = class_list[i].class_id;
                        this.class_list.push(class_obj)
                    }
                    this.extend.fk_class_id = this.class_list[0].value;
                    this.get_data();
                },
                add_daily: function () {
                    //查询公示审核管控
                    ajax_post(api_query_pub, {}, this);
                },
                //年级筛选
                sel_grade: function (el) {
                    var id = el.value;
                    for (var i = 0; i < this.user_info.length; i++) {
                        if (this.user_info[i].grade_id == id) {
                            this.get_class(this.user_info[i]);
                        }
                    }
                },
                //班级筛选
                sel_class: function (el) {
                    this.extend.fk_class_id = el.value;
                    this.get_data();
                },
                //学期筛选
                sel_semester: function (el) {
                    this.extend.fk_semester_id = el.value.split('|')[0];
                    this.semester_name = el.name;
                    this.get_data();
                },
                //菜单跳转
                menu_jump: function (value) {
                    this.current_menu = value;
                    this.extend.fk_semester_id = value.split('|')[0];
                    ajax_post(list_api, this.extend.$model, this);
                    var sign = '.s' + value.split('|')[0];
                    if (!$(sign) || !$(sign).eq(0) || !$(sign).eq(0).position())
                        return;
                    var top1 = $(sign).eq(0).position().top;
                    var top2 = $("#top").position().top;
                    var top = top1 - top2 - 136;
                    $('body,html').animate({scrollTop: top}, 500);
                },
                search: function () {
                    this.get_data();
                },
                change_status: function (statu) {
                    this.extend.status = statu;
                    if(statu == 5){
                        this.extend.founder = null;
                    }
                    this.get_data();
                },
                suffix_video: ['mp4', 'wmv', 'avi', 'rmvb', 'aiff', '3gp', 'mkv', 'flv'],
                suffix_img: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                break;
                            case list_api:
                                this.deal_list(data);
                                break;
                            case create_everyday_api:
                                this.deal_list(data);
                                break;
                            case api_delete_by_id:
                                toastr.success('成功删除');
                                this.get_data();
                                break;
                            default:
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                deal_list: function (data) {
                    if (!data || !data.data || !data.data.list)
                        return;
                    var list = data.data.list;
                    var list_length = list.length;
                    var token = sessionStorage.getItem("token");
                    for (var i = 0; i < list_length; i++) {
                        if (!list[i].attachment || list[i].attachment == null)
                            continue;
                        var fjdz = JSON.parse(list[i].attachment);
                        list[i].img_arr = [];
                        list[i].video_arr = [];
                        list[i].file_arr = [];
                        for (var j = 0; j < fjdz.length; j++) {
                            var file_name = '';
                            if (fjdz[j].hasOwnProperty('name')) {
                                file_name = fjdz[j].name;
                            }
                            else {
                                file_name = fjdz[j].inner_name;
                            }
                            fjdz[j].down_href = api.api + 'file/download_file?img=' + fjdz[j].guid + "&token=" + token;
                            var suffix_index = file_name.lastIndexOf('.');
                            var suffix = file_name.substr(suffix_index + 1);
                            suffix = suffix.toLowerCase();
                            if (vm.suffix_video.indexOf(suffix) != -1) {//视频
                                list[i].video_arr.push(fjdz[j]);
                                continue;
                            }
                            if (vm.suffix_img.indexOf(suffix) != -1) {
                                list[i].img_arr.push(fjdz[j]);
                                continue;
                            }
                            list[i].file_arr.push(fjdz[j]);
                        }
                    }
                    ready_photo(data.data.list, 'guid');

                    this.list = list;
                    layer.closeAll();
                    if (this.old_scroll_top > 0) {
                        $(window).scrollTop(this.old_scroll_top);
                    }
                },
                //公示审核管控
                complete_query_pub: function (data) {
                    var type = false;
                    var list = data.data;
                    if (list != null && list.length > 0) {
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for (var i = 0; i < list.length; i++) {
                            var mkid = list[i].mkid;
                            if (mkid == 1) {
                                type = true;
                                break;
                            }
                        }
                    }
                    if (type == true) {
                        data_center.set_key("params_type", 1);
                        data_center.remove_key("params_type");
                        data_center.remove_key("my_add_list");
                        if (this.user_level == 6) {
                            window.location = "#dpe?status=" + 1;
                        }
                        window.location = "#dpe?status=" + 2;
                    } else {
                        layer.alert('市管理员公示审核管控还未设置', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    }
                }
            });
            vm.$watch("html_display", function () {
                if (vm.html_display == 2) {
                    var obj = {};
                    obj.status = this.extend.status;
                    obj.fk_semester_id = this.extend.fk_semester_id;
                    obj.semester_name = this.semester_name;
                    sessionStorage.setItem('remark_obj', JSON.stringify(obj));
                    window.location = '#daily_perform_see_list';
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