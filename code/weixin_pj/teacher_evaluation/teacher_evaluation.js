define(["jquery",
        C.CLF('avalon.js'),
        "layer",
        C.Co("weixin_pj", "teacher_evaluation/teacher_evaluation", "css!"),
        C.Co("weixin_pj", "teacher_evaluation/teacher_evaluation", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")
    ],
    function ($, avalon, layer, css, html, x, data_center) {
        //查询模块时间
        var api_get_module_time = api.api + "everyday/get_module_switch";
        //查询所有项目
        var api_get_time_plan = api.api + "Indexmaintain/indexmaintain_findByEvaluatePro";
        //获取系统当前时间
        var api_get_server_time = api.user + 'baseUser/current_time';
        //获取当前学年学期id
        // var api_get_semester = api.api+"base/semester/appoint_date_part";
        var api_get_semester = api.api + "base/semester/current_semester.action";
        //查询班级人数(在籍学生)
        var api_class_stu = api.api + "base/student/class_used_stu";
        //查询已评人数
        var api_complete_stu = api.api + "GrowthRecordBag/evaluate_entry_democraticStu";
        var user_level = null
        var semester_id = null
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "teacher_evaluation",
                student_arr: [],
                table_show: false,
                project_arr: [],
                color_green: {color: 'green'},
                color_red: {color: 'red'},
                grade_list: [],
                class_list: [],
                get_grade_id: "",
                get_class_id: "",
                school_id: "",
                type: "",
                teacher_guid: "",
                pj_proid: "",
                //模块开关：自评是否开启、
                is_switch: false,
                stu_data: {
                    zrs: 0,
                    wscrs: 0,
                    yscrs: 0
                },
                cb: function () {
                    user_level = cloud.user_level()
                    cloud.semester_current();
                    cloud.semester_current({}, function (url, args, data) {
                        semester_id = data.id;
                        vm.get_session_data()
                    });
                },
                get_session_data: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        if (userType == "1") {//老师
                            self.grade_list = cArr;
                            self.get_grade_id = self.grade_list[0].grade_id;
                            self.class_list = self.grade_list[0].class_list;
                            self.get_class_id = self.grade_list[0].class_list[0].class_id;
                            self.get_school_id = Number(cArr[0].school_id);
                            self.teacher_guid = Number(tUserData.guid);
                            //查询模块时间
                            ajax_post(api_get_module_time, {
                                grade_id: self.get_grade_id,
                                module_type: "0",
                            }, self);
                        }
                    })
                },
                list_data: function () {
                    ajax_post(api_complete_stu, {
                        fk_bj_id: this.get_class_id,
                        fk_xq_id: semester_id,
                        user_level: user_level
                    }, this)
                },
                //选择年级
                gradeChange: function (data) {
                    for (var i = 0; i < this.grade_list.length; i++) {
                        if (this.get_grade_id == this.grade_list[i].grade_id) {
                            this.class_list = this.grade_list[i].class_list;
                        }
                    }
                    this.class_id = this.class_list[0].class_id;
                    ajax_post(api_get_time_plan, {
                        pro_gradeid: this.get_grade_id,
                        pro_type: 3,
                        pro_workid: this.get_school_id,
                        pro_state: 2
                    }, this);

                },
                //获取班级
                classChange: function () {
                    ajax_post(api_get_time_plan, {
                        pro_gradeid: this.get_grade_id,
                        pro_type: 3,
                        pro_workid: this.get_school_id,
                        pro_state: 2
                    }, this);
                },
                evaluate_mode: "",
                el_pro_plan_id: "",
                el_pro_end_time: "",
                el_pro_start_time: "",
                el_id: "",
                //	方案级别（1:上级 2:校级）
                plan_level: '',
                //录入
                evaluate_go: function (el) {
                    this.evaluate_mode = el.evaluate_mode;
                    this.el_pro_plan_id = el.pro_plan_id;
                    this.el_pro_end_time = el.pro_end_time;
                    this.el_pro_start_time = el.pro_start_time;
                    this.el_id = el.id;
                    this.plan_level = el.plan_level;
                    // ajax_post(api_get_semester,{end_date:el.pro_end_time,start_date:el.pro_start_time},this);
                    // ajax_post(api_get_semester, {}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询模块时间
                            case api_get_module_time:
                                this.complete_module_time(data);
                                break;
                            //获取项目id
                            case api_get_time_plan:
                                this.complete_get_time_plan(data);
                                break;
                            //获取系统当前时间
                            case api_get_server_time:
                                this.complete_get_server_time(data);
                                break;
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                            case api_class_stu:
                                this.complete_class_stu(data);
                                break;
                            case api_complete_stu:
                                this.complete_complete_stu(data);
                                break;
                        }
                        return
                    }
                    $.toast(msg, "forbidden");
                },
                //模块时间
                complete_module_time: function (data) {
                    if (data.data) {
                        this.is_switch = data.data.is_switch;
                        ajax_post(api_get_time_plan, {
                            pro_gradeid: this.get_grade_id,
                            pro_type: 3,
                            pro_workid: this.get_school_id,
                            pro_state: 2
                        }, this);
                    }
                },
                complete_get_semester: function (data) {
                    //1 按学生评价 2 按考查项评价
                    if (this.evaluate_mode == 1) {
                        window.location = "#teacher_pro_list?id=" + this.el_id +
                            "&guid=" + this.teacher_guid +
                            "&grade_id=" + this.get_grade_id +
                            "&class_id=" + this.get_class_id + "&school_id=" + this.get_school_id +
                            '&pro_plan_id=' + this.el_pro_plan_id + '&pro_end_time=' + this.el_pro_end_time +
                            '&pro_start_time=' + this.el_pro_start_time + "&semester_id=" + semester_id + "&plan_level=" + this.plan_level;

                    } else {
                        window.location = "#teacher_content_list?id=" + this.el_id +
                            "&guid=" + this.teacher_guid +
                            "&grade_id=" + this.get_grade_id +
                            "&class_id=" + this.get_class_id +
                            "&school_id=" + this.get_school_id +
                            '&pro_plan_id=' + this.el_pro_plan_id +
                            '&pro_end_time=' + this.el_pro_end_time +
                            '&pro_start_time=' + this.el_pro_start_time + "&semester_id=" + semester_id +
                            '&plan_level=' + this.plan_level;
                    }
                },
                default_pro: [],
                complete_get_time_plan: function (data) {
                    if (data.data.list.length == 0) {
                        this.table_show = false;
                        $.toast("暂时还没有项目", "forbidden");
                    } else {
                        this.project_arr = data.data.list;

                        ajax_post(api_get_server_time, {}, this);
                    }
                },
                complete_get_server_time: function (data) {
                    var server_time = data.data.current_time;
                    var server_time_new = timeChuo(server_time, true);
                    var get_server_time = new Date(server_time_new.replace("-", "/").replace("-", "/"));//2017-11-2
                    for (var i = 0; i < this.project_arr.length; i++) {
                        if (new Date(this.project_arr[i].pro_start_time.replace("-", "/").replace("-", "/")) < get_server_time &&
                            get_server_time < new Date(this.project_arr[i].pro_end_time.replace("-", "/").replace("-", "/"))
                        ) {
                            this.project_arr[i].is_time = '进行中'//1在时间段内
                        } else if (new Date(this.project_arr[i].pro_start_time.replace("-", "/").replace("-", "/")) > get_server_time) {
                            this.project_arr[i].is_time = '未开始'//2不在时间段内
                        } else {
                            this.project_arr[i].is_time = '评价已结束'
                        }
                        // if (new Date(this.project_arr[i].pro_start_time.replace("-", "/").replace("-", "/")) < get_server_time &&
                        //     get_server_time < new Date(this.project_arr[i].pro_end_time.replace("-", "/").replace("-", "/"))
                        // ) {
                        //     this.project_arr[i].is_time = 1//1在时间段内
                        // } else{
                        //     this.project_arr[i].is_time = 2//2不在时间段内
                        // }
                    }
                    this.default_pro = this.project_arr[0];
                    ajax_post(api_class_stu, {fk_class_id: this.get_class_id}, this);
                },
                get_num: function () {
                    ajax_post(api_complete_stu, {pj_name_guid: this.teacher_guid, pj_proid: this.default_pro.id}, this);
                },
                stu_count: "",
                complete_stu: "",
                complete_class_stu: function (data) {
                    this.stu_count = data.data.count;
                    this.list_data()
                    // this.get_num();
                },
                complete_complete_stu: function (data) {
                    for (var i = 0, len = data.data.length; i < len; i++) {
                        if (data.data[i].pjlx == '教师评') {
                            this.stu_data = data.data[i]
                        }
                    }
                },
                pro_id: "",
                projectChange: function () {
                    this.default_data = [];
                    var id = this.pro_id;
                    for (var i = 0; i < this.project_arr.length; i++) {
                        if (id == this.project_arr[i].id) {
                            this.default_pro = this.project_arr[i];
                        }
                    }
                    ajax_post(api_class_stu, {fk_class_id: this.get_class_id}, this);
                },
                timeChuo: function (h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function (format) {
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
                    }
                    var getTimeIs = newDate.format('yyyy-MM-dd hh:mm:ss');
                    return getTimeIs;
                },
                go_into: function () {
                    var el = this.default_pro;
                    this.evaluate_mode = el.evaluate_mode;
                    this.el_pro_plan_id = el.pro_plan_id;
                    this.el_pro_end_time = el.pro_end_time;
                    this.el_pro_start_time = el.pro_start_time;
                    this.el_id = el.id;
                    this.plan_level = el.plan_level;
                    // ajax_post(api_get_semester,{end_date:el.pro_end_time,start_date:el.pro_start_time},this);
                    ajax_post(api_get_semester, {}, this);
                }

            });
            vm.$watch('onReady', function () {
                vm.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });