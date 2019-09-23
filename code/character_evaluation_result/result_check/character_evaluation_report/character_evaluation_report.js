/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.CMF("formatUtil.js"),
        C.Co('character_evaluation_result/result_check', 'character_evaluation_report/character_evaluation_report', 'html!'),
        C.Co('growth', 'portfolio_assessment/evaluation_detail/evaluation_detail', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        "jquery_print"
    ],
    function ($, avalon, layer, __, html, css, data_center, select_assembly, three_menu_module, jquery_print) {
        //获取初2016年级是几年级
        var grade_class_api = api.api + "base/grade/findGrades.action";
        //导出
        var export_api = api.api + "Indexmaintain/export_semester_pdfzip";
        var avalon_define = function (args) {
            var guid = args.guid;
            var s = args.s;
            var e = args.e;
            var sms_id = args.smsid;
            var sid = args.sid;
            var current_semester = {};
            var vm = avalon.define({
                $id: "semester_archives",
                //年级
                grade_list: [],
                //区县
                area_list: [],
                // 学年学期列表-未处理的数据结构
                sems_list: [],
                //学年学期列表-处理过的数据结构
                semester_list: [],
                // 当前学期ID
                current_index: sms_id,
                fm: {
                    ui: {},// 用户基础信息
                    zhbx: {},//综合表现
                    wd: [],//维度列表
                    jy: {},//寄语
                    txjy: [],//同学寄语
                    pd: [],//品德发展
                    pd_list: [],// 品德发展活动列表
                    kc: {},//国家课程
                    ty: [],//体育
                    ys: {},//艺术
                    ys_list: [], //艺术活动列表
                    yj: [],//研究
                    yj_list: [],//研究详情
                    sxjk: [],//身心健康活动
                    sxjk_list: [],// 身心健康活动列表
                    yscp: {}, // 艺术测评
                    zpzy: [],// 作品作业
                    zpzy_list: [],// 作品作业详情
                    shsj: [],// 社会实践
                    shsj_list: [],// 社会实践列表
                    cjjy: [],//成就奖励
                },
                current_tg: '#cover',
                winHeight: 0,
                is_show: false,
                stu:{},
                student_head: function (a) {
                    var head = cloud.user_photo({guid: a});
                    if (head == "" || head == undefined)
                        return "common/images/file_detail/cover.png";
                    return avalon.filters.img(head);
                },
                url_img: url_img,
                local_set: "",
                login_guid: "",
                init: function () {
                    this.login_guid = cloud.user_guid();
                    var get_set = localStorage.getItem('is_set');
                    if (get_set == null) {
                        this.is_show_img = true;
                        this.is_which = 1;
                    } else {
                        var login_guid = get_set.split('|')[2];
                        if (login_guid == this.login_guid) {
                            var get_s = get_set.split('|')[0];
                            if (get_s == 1) {
                                this.is_show_img = true;
                            } else {
                                this.is_show_img = false;
                            }
                            this.is_which = get_set.split('|')[1];
                        } else {
                            this.is_show_img = true;
                            this.is_which = 1;
                        }
                    }
                    this.init_height();
                    var user_level = cloud.user_level();
                    // 权限判断
                    if (cloud.user_level() == 7 && guid == undefined) {
                        guid = cloud.user_guid();
                    }

                    if (cloud.is_student()) {
                        //需要让用户可以选择学期列表
                        var grade_id = cloud.user_grade_id();
                        var school_id = cloud.user_depart_id();
                        var sem_list = cloud.grade_semester_list({grade_id: grade_id});
                        sort_by(sem_list, ["+start_date"]);
                        var project_list = cloud.get_semeter_pj_project({
                            ca_gradeid: grade_id, ca_workid: school_id, state: 5
                        });
                        // 若无项目则不显示
                        vm.is_show = project_list.length != 0 ? true : false;
                        if (!vm.is_show) {
                            toastr.warning("未发现学期评价项目");
                        }

                        // 学期与项目关联
                        sem_list.forEach(function (value, index) {
                            var ss = time_2_str(value.start_date);
                            ss = ss.replace("-0", "-");
                            var pro = base_filter(project_list, "ca_start_semester", ss);
                            if (pro.length != 0) {
                                value.sid = pro[0].id;
                                value.s = pro[0].ca_start_semester;
                                value.e = pro[0].ca_end_semester;
                                value.has_project = true;
                            } else {
                                value.sid = -1;
                                value.has_project = false;
                                value.semester_name += "(无评价项目)";
                            }
                        });

                        if (sid == undefined || s == undefined || e == undefined) {
                            var pros = base_filter(sem_list, "has_project", true);
                            if (pros.length != 0) {
                                sid = pros[0].sid;
                                s = pros[0].s;
                                e = pros[0].e;
                                sms_id = pros[0].id;
                            } else {
                                vm.is_show = false;
                            }
                        }
                        vm.sems_list = sem_list;
                        this.semester_list = any_2_select(sem_list, {name: "semester_name", value: ["id"]})
                        if (s == undefined)
                            return;
                        //cloud.grade_all_list();
                    }

                    vm.current_tab = sms_id;

                    if (typeof(s) == "string") vm.is_show = true;
                    // 基础信息
                    var self = this;
                    cloud.get_stu_info({guid: guid}, function (url, args, data){
                        for (var key in data) {
                            if (data[key] == null) {
                                data[key] = '';
                            }
                        }
                        data.grade_name = '';
                        data.school_name = '';
                        self.stu = data;
                        cloud.get_stu_user_info({guid: guid}, function (url, args, school_data){
                            self.stu.grade_name = school_data.grade_name;
                            self.stu.school_name = school_data.school_name;
                            school_data = $.extend(school_data, data);
                            vm.fm.ui = school_data;
                        })
                    })
                    // cloud.get_stu_info({guid: guid}, function (url, args, data) {
                    //     vm.fm.ui = data;
                    //
                    // });

                    // 维度列表
                    cloud.bgc_wd_set({subjectId: sid}, function (url, args, data) {
                        vm.fm.wd = data;
                    });
                    // 寄语
                    cloud.bgc_jy_set({
                        grade: s.substr(0, 4),
                        semester: sms_id,
                        student_id: guid
                    }, function (url, args, data) {
                        vm.fm.jy = data;
                    });
                    // 评价等级
                    cloud.bgc_pjdj_set({studentId: Number(guid), subjectId: sid}, function (url, args, data) {
                        vm.fm.zhbx = data;

                    });
                    // 同学寄语
                    cloud.bgc_txjy_set({
                        grade: s.substr(0, 4),
                        semester: sms_id,
                        party_id: guid
                    }, function (url, args, data) {
                        vm.fm.txjy = data;
                    });
                    // 品德发展
                    cloud.bgc_pdfz_set({end_time: e, owner: Number(guid), start_time: s}, function (url, args, data) {
                        vm.fm.pd = data;
                    });
                    // 品德发展作品列表
                    cloud.bgc_pdfz_detail({
                        end_time: e,
                        owner: Number(guid),
                        start_time: s
                    }, function (url, args, data) {
                        vm.fm.pd_list = data;
                    });
                    // 国家课程
                    cloud.bgc_kc_set({
                        guid: Number(guid),
                        semester_id: sms_id,
                    }, function (url, args, data) {
                        vm.fm.kc = data;
                    });
                    // 获取学籍号
                    var student_code = cloud.get_stu_info_code({guid: guid});
                    var seg = s.split("-");
                    var year = seg[0];
                    var phase = seg[1] > 9 && seg[1] < 2 ? "0" : "1";
                    //  获取体育锻炼情况
                    cloud.bgc_ty_set({
                        code: student_code,
                        phase: phase,
                        year: year
                    }, function (url, args, data) {
                        vm.fm.ty = data;
                    });
                    // 获取研究性学习
                    cloud.bgc_yj_set({end_date: e, owner: Number(guid), start_date: s}, function (url, arg, data) {
                            vm.fm.yj = data;
                        }
                    );
                    // 研究性学习详情
                    cloud.bgc_yj_detail({end_date: e, owner: Number(guid), start_date: s}, function (url, arg, data) {
                        vm.fm.yj_list = data;
                    });
                    // 健康体育活动
                    cloud.bgc_sxjk_set({
                        hea_endDate: e,
                        hea_ownerid: Number(guid),
                        hea_startDate: s
                    }, function (url, arg, data) {
                        vm.fm.sxjk = data;
                    });
                    // 健康体育活动-详情
                    cloud.bgc_sxjk_detail({
                        hea_endDate: e,
                        hea_ownerid: Number(guid),
                        hea_startDate: s
                    }, function (url, arg, data) {

                        vm.fm.sxjk_list = data;
                    });
                    // 艺术测评
                    cloud.bgc_ys_set({
                        art_end_time: e,
                        art_start_time: s,
                        art_ownerid: guid
                    }, function (url, args, data) {
                        vm.fm.ys = data;
                    });
                    // 艺术测评详情
                    cloud.bgc_ys_detail({
                        art_end_time: e,
                        art_start_time: s,
                        art_ownerid: guid
                    }, function (url, args, data) {
                        vm.fm.ys_list = data;
                    });
                    // 艺术学习情况 -需求不清晰，暂时屏蔽
                    // cloud.bgc_yscp_set({join_start:s, join_end:e, guid:guid}, function (url, arg, data) {
                    //    vm.fm.yscp = data;
                    // });
                    // 作品作业
                    cloud.bgc_zpzy_set({end_date: e, owner: Number(guid), start_date: s}, function (url, arg, data) {
                        vm.fm.zpzy = data;
                    });
                    // 作品作业-详情
                    cloud.bgc_zpzy_detail({end_date: e, owner: Number(guid), start_date: s}, function (url, arg, data) {
                        vm.fm.zpzy_list = data;
                    });
                    // 社会实践-
                    cloud.bgc_shsj_set({owner: Number(guid), start_date: s, end_date: e}, function (url, args, data) {
                        vm.fm.shsj = data;
                    });
                    // 社会实践-详情
                    cloud.bgc_shsj_detail({
                        owner: Number(guid),
                        start_date: s,
                        end_date: e
                    }, function (url, args, data) {
                        vm.fm.shsj_list = data;
                    });
                    cloud.bgc_cjjy_set({
                        ach_end_dates: e,
                        ach_start_dates: s,
                        ach_ownerid: Number(guid)
                    }, function (url, arg, data) {
                        vm.fm.cjjy = data;
                        vm.do_data(vm.is_show_img, vm.is_which);
                    });
                },

                current_tab: '0',
                change_tab: function (index) {

                    if (this.sems_list[index].sid == -1) {
                        toastr.warning("该学期无评价项目")
                        return;
                    }
                    // this.current_tab = this.sems_list[idnex].id;
                    var c = this.sems_list[index];
                    current_semester = c;
                    s = c.s;
                    e = c.e;
                    sms_id = c.id;
                    sid = c.sid;
                    vm.init();
                    // location.href = "#evaluation_detail?guid=" +
                    //     guid +
                    //     "&s=" +
                    //     c.s +
                    //     "&e=" +
                    //     c.e +
                    //     "&sid=" +
                    //     c.sid +
                    //     "&smsid=" +
                    //     c.id;

                },


                //打印
                print: function () {
                    $("#print-container").print();
                },
                export_data: {},
                export: function () {
                    var export_data = data_center.get_key('export_data');
                    if (!export_data) {
                        export_data = {};
                        var user = cloud.user_user();
                        export_data.guid = user.guid;
                        if (!current_semester.hasOwnProperty('start_date')) {
                            layer.alert("请选择评价项目!");
                            return;
                        }
                        export_data.start_time = time_2_str(current_semester.start_date);
                        export_data.end_time = time_2_str(current_semester.end_date);
                        export_data.phase = current_semester.semester_index;
                        export_data.semester_id = current_semester.id;
                        export_data.project_id = current_semester.sid;
                        export_data.year = export_data.start_time.substr(0, 4);
                        export_data.school_id = user.fk_school_id;
                        export_data.district_id = user.district;
                        export_data.class_id = user.fk_class_id;
                        export_data.grade_id = user.fk_grade_id;
                        export_data.token = sessionStorage.getItem('token');
                        this.export_data = export_data;
                        this.grade_distinguish(this.export_data.grade_id);
                        return;
                    }

                    this.export_data = JSON.parse(export_data);
                    this.grade_distinguish(this.export_data.grade_id);

                },
                grade_distinguish: function (grade_id) {
                    ajax_post(grade_class_api, {id: grade_id.toString()}, this)
                },
                uninit: function () {
                    $(window).unbind('scroll');
                },
                listen_scroll: function () {
                    var self = this;
                    $(window).scroll(function () {
                        var scoll_top = $(window).scrollTop();
                        var $a = $('.file-munu a');
                        $($a).each(function () {
                            var click_href = $(this).attr('name');
                            var top1 = $(click_href).position().top;
                            var top2 = $("#cover").position().top;
                            var top = top1 - top2;
                            if (scoll_top > top) {
                                self.current_tg = click_href;
                            }
                        });

                    })
                },
                //初始化页面高度
                init_height: function () {
                    var winHeight = 0;
                    if (window.innerHeight)
                        winHeight = window.innerHeight;
                    else if ((document.body) && (document.body.clientHeight))
                        winHeight = document.body.clientHeight;
                    if (document.documentElement && document.documentElement.clientHeight)
                        winHeight = document.documentElement.clientHeight;
                    $('.file-munu').height(winHeight-147);
                    this.winHeight = winHeight;
                    var self = this;
                    $('.file-munu a').click(function () {
                        $(window).off("scroll");
                        var click_href = $(this).attr('name');
                        var top1 = $(click_href).position().top;
                        var top2 = $("#cover").position().top;
                        var top = top1 - top2;
                        self.current_tg = click_href;
                        $('html,body').animate({
                            scrollTop: top + 'px'
                        }, 1000);
                        setTimeout(self.listen_scroll, 1500)
                    });
                    this.listen_scroll()

                },
                get_remark: function (data) {
                    if (!data.data)
                        return;
                    var remark = data.data[0].remark;
                    var num_obj = {
                        '一年级': 1,
                        '二年级': 2,
                        '三年级': 3,
                        '四年级': 4,
                        '五年级': 5,
                        '六年级': 6,
                        '七年级': 7,
                        '八年级': 8,
                        '九年级': 9
                    }
                    this.export_data.due_grade = num_obj[remark];
                    var position = 1;
                    if (this.is_show_img == false) {
                        position = 0;
                    } else {
                        position = this.is_which;
                    }
                    var url = export_api + '?' +
                        'class_id=' + this.export_data.class_id +
                        '&district_id=' + this.export_data.district_id +
                        '&due_grade=' + this.export_data.due_grade +
                        '&end_time=' + this.export_data.end_time +
                        '&grade_id=' + this.export_data.grade_id +
                        '&phase=' + this.export_data.phase +
                        '&project_id=' + this.export_data.project_id +
                        '&school_id=' + this.export_data.school_id +
                        '&semester_id=' + this.export_data.semester_id +
                        '&start_time=' + this.export_data.start_time +
                        '&year=' + this.export_data.year +
                        '&token=' + this.export_data.token +
                        '&guid=' + this.export_data.guid +
                        '&position=' + position;
                    window.open(url);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case grade_class_api:
                                this.get_remark(data);
                                break;
                            case export_api:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                is_show_img: false,
                is_which: "",
                setting: function () {
                    layer.open({
                        type: 1,
                        content: $('#set')
                        , btn: ['确定', '取消']
                        , shadeClose: true
                        , resize: false
                        , yes: function (index, layero) {
                            var str = '';
                            if (vm.is_show_img == true && vm.is_which != '') {
                                str = '1|' + vm.is_which + '|' + vm.login_guid;

                            } else if (vm.is_show_img == false) {
                                vm.is_which = '';
                                str = '2|' + vm.is_which + '|' + vm.login_guid;
                            }
                            layer.closeAll();
                            localStorage.setItem('is_set', str);
                            vm.do_data(vm.is_show_img, vm.is_which);
                        }
                        , btn2: function (index, layero) {
                            layer.closeAll();
                        }
                    });
                },
                show_img_change: function () {
                    console.dir(this.is_show_img)
                },
                data_img: 0,
                //处理数据
                do_data: function (img, index) {
                    if (img == true) {//显示图片
                        if (index == 1) {//图片显示在材料详情
                            this.data_img = 0
                        } else {//图片显示在最后
                            this.data_img = 2
                        }
                    } else {
                        this.data_img = 1;//不显示图片
                    }
                    console.log(this.data_img)

                }
            });
            vm.$watch('onReady', function () {
                vm.init();
            });

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
