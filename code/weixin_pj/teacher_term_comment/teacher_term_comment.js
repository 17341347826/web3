/**
 * Created by Administrator on 2018/7/24.
 */
define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "teacher_term_comment/teacher_term_comment", "css!"),
        C.Co("weixin_pj", "teacher_term_comment/teacher_term_comment", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui ) {
        //查询模块时间
        var api_get_module_time = api.api + "everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time = api.api + 'base/baseUser/current_time';
        //列表查询学生
        var api_get_all_stu = api.api + "base/baseUser/studentlist.action";
        //查询当前可用的学年学期
        var api_semester_is_fill = api.api + "base/semester/grade_opt_semester";
        //评语状态
        var teacher_comment_list = api.api + "everyday/get_list_remarl";
        // //提交评语
        // var api_add_comment_teacher = api.api + "everyday/remarl_teacher";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "teacher_term_comment",
                user_type: "",
                start_time: "",
                end_time: "",
                current_time: "",
                is_fill: "",
                time: [],
                grade_list: [],
                class_list: [],
                semester_list: [],
                fk_school_id: "",
                fk_class_id: "",
                fk_grade_id: "",
                fk_grade_name: "",
                fk_semester: "",
                grade: "",
                semester: "",
                yearSemester: "",//当前可编辑的却年学期
                student_list: [],
                get_student: [],
                local_ary: {},
                is_switch: "",
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询当前可用的年级
                            case api_semester_is_fill:
                                this.complete_semester_is_fill(data);
                                break;
                            //查询模块时间
                            case api_get_module_time:
                                if (data.data) {
                                    this.start_time = data.data.start_time;
                                    this.end_time = data.data.end_time;
                                    this.is_switch = data.data.is_switch;
                                } else {
                                    this.is_fill = 2;//只能查看
                                }
                                ajax_post(api_get_server_time, {}, this);
                                break;
                            //查询服务器当前时间
                            case api_get_server_time:
                                this.get_server_time(data);
                                break;
                            //查询学生列表
                            case api_get_all_stu:
                                this.complete_get_all_stu(data);
                                break;
                            //查询已评论
                            case teacher_comment_list:
                                this.complete_teacher_comment_list(data);
                                break;
                            // //保存评论
                            // case api_add_comment_teacher:
                            //     this.check_btn();
                            //     break;
                        }
                    }
                },

                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userData = JSON.parse(data.data['user']);
                        var lead_class_list = userData.lead_class_list;
                        self.grade_list = lead_class_list;
                        self.fk_grade_id = self.grade_list[0].grade_id;
                        self.fk_grade_name = self.grade_list[0].grade_name;
                        self.class_list = lead_class_list[0].class_list;
                        self.fk_class_id = self.class_list[0].class_id;
                        self.fk_school_id = userData.fk_school_id;
                        //获取当前可用的学年学期
                        ajax_post(api_semester_is_fill, {grade_id: self.fk_grade_id}, self);
                    });
                },
                gradeChange: function () {
                    var grade_id = this.fk_grade_id;
                    var gradeList = this.grade_list;
                    var grade_list_length = this.grade_list.length;
                    for (var i = 0; i < grade_list_length; i++) {
                        if (grade_id == gradeList[i].grade_id) {
                            this.class_list = gradeList[i].class_list;
                            this.fk_class_id = gradeList[i].class_list[0].class_id;
                        }
                    }
                    this.check_btn();
                },
                classChange: function () {
                    this.check_btn();
                },
                semesterChange: function () {
                    var semester = this.fk_semester;
                    var semester_name = semester.split("|")[0];
                    this.grade = Number(semester_name.substr(0, 4));
                    var semester_id = Number(semester.split("|")[1]);
                    this.semester = semester_id;
                    this.check_btn();
                },
                //学生接口
                check_btn: function () {
                    ajax_post(api_get_all_stu, {
                        fk_class_id: this.fk_class_id,
                        fk_grade_id: this.fk_grade_id,
                        fk_school_id: this.fk_school_id
                    }, this);
                },
                complete_semester_is_fill: function (data) {
                    var dataList = data.data.list;
                    this.semester_list = dataList;
                    this.fk_semester = dataList[0].semester_name + "|" +
                        dataList[0].id + "|" +
                        dataList[0].end_date + "|" +
                        dataList[0].start_date;
                    this.grade = Number(dataList[0].semester_name.substr(0, 4));
                    this.semester = dataList[0].id;
                    ajax_post(api_get_module_time, {module_type: "4", grade_id: this.fk_grade_id}, this);
                },

                //当前服务器时间
                get_server_time: function (data) {
                    if (this.is_fill != 2) {
                        this.current_time = data.data.current_time;
                        var current_time = $(".current_time").text();
                        var currentDate = new Date(current_time.replace(/\-/g, "\/"));
                        var start = new Date(this.start_time.replace(/\-/g, "\/"));
                        var end = new Date(this.end_time.replace(/\-/g, "\/"));
                        if (start < currentDate && currentDate < end) {//可编辑
                            this.is_fill = 1;
                            var dataList = this.semester_list;
                            var dataList_length = dataList.length;
                            for (var i = 0; i < dataList_length; i++) {
                                var start_x = this.timeChuo(dataList[i].start_date);
                                var end_x = this.timeChuo(dataList[i].end_date);
                                var semester_start = new Date(start_x.replace(/\-/g, "\/"));
                                var semester_end = new Date(end_x.replace(/\-/g, "\/"));
                                if (semester_start < currentDate && currentDate < semester_end && this.is_switch == true) {
                                    this.yearSemester = dataList[i].semester_name + "|" +
                                        dataList[i].id + "|" +
                                        dataList[i].end_date + "|" +
                                        dataList[i].start_date;
                                }
                            }
                        } else {
                            this.is_fill = 2;
                        }
                    }
                    this.check_btn();
                },
                complete_get_all_stu: function (data) {
                    this.get_student = data.data.list;
                    var length = this.get_student.length;
                    for (var i = 0; i < length; i++) {
                        this.get_student[i].status = "";
                        //教师评语
                        this.get_student[i].content_teacher = "";
                        //自我评语
                        this.get_student[i].content_my = "";

                    }
                    ajax_post(teacher_comment_list,
                        {
                            fk_class_id: this.fk_class_id,
                            fk_grade_id: this.fk_grade_id,
                            fk_school_id: this.fk_school_id,
                            grade: this.grade,
                            semester: this.semester
                        }, this);
                },
                //查询已评并组合数据
                complete_teacher_comment_list: function (data) {
                    var dataList = data.data.list;
                    // console.log(JSON.stringify(dataList))
                    var dataList_length = dataList.length;
                    var all_stu = this.get_student;
                    var all_stu_length = all_stu.length;
                    if (dataList_length == 0) {
                        //按姓名排序
                        sort_by(this.get_student, ["+name"]);
                        this.student_list = this.get_student;
                    } else {
                        for (var i = 0; i < dataList_length; i++) {
                            for (var j = 0; j < all_stu_length; j++) {
                                if (all_stu[j].guid == dataList[i].student_id) {
                                    all_stu[j].content_teacher = dataList[i].content_teacher;
                                    all_stu[j].content_my = dataList[i].content_my;
                                }
                            }
                        }
                        //按姓名排序
                        sort_by(all_stu, ["+name"]);
                        //按填填写状态排序，未填写的在前面
                        sort_by(all_stu, ["+content_teacher"]);
                        this.student_list = all_stu;
                    }
                },
                //菜单改变
                menu_change:function(){
                    window.location = '#teacher_graduation_comment';
                },
                //编辑
                edit_btn: function (el) {
                    var fk_semester = this.fk_semester;
                    var fk_semester_id = fk_semester.split("|")[1];
                    var semester_name = fk_semester.split("|")[0];
                    var value = JSON.stringify(el);
                    window.location = '#teacher_term_comment_edit?el='+value+'&grade='+this.grade+
                    '&fk_semester_id='+fk_semester_id+'&semester_name='+semester_name+'&semester='+
                        this.semester+'&fk_grade_id='+this.fk_grade_id;
                    // var self = this;
                    // var name = el.name;
                    // var class_id = el.fk_class_id;
                    // var grade_id = el.fk_grade_id;
                    // var school_id = el.fk_school_id;
                    // var student_id = el.guid;
                    // var code = el.code;
                    // var fk_semester = this.fk_semester;
                    // var semester_name = fk_semester.split("|")[0];
                    // var title = "请对" + "【" + name + "】" + "进行" + semester_name + "期的评价";
                    // var content_teacher = el.content_teacher;
                    // $.prompt({
                    //         title:title
                    //     }, function (text) {
                    //
                    // }, function () {
                    //     $.closePrompt(); //关闭对话框
                    // });
                    // $("#weui-prompt-input").remove(); //去除原始输入框
                    // $(".weui-dialog__bd").append('<textarea class="weui_input weui-prompt-input" id="weui-prompt-input" value=""></textarea>');
                    // layer.prompt({title: title, formType: 2, value: content_teacher}, function (text, index) {
                    //     if ($.trim(text) != '') {
                    //         var value = text;
                    //         ajax_post(api_add_comment_teacher, {
                    //             fk_nj_id: self.fk_grade_id,
                    //             list: [{
                    //                 content_teacher: value,
                    //                 fk_class_id: class_id,
                    //                 fk_grade_id: grade_id,
                    //                 fk_school_id: school_id,
                    //                 grade: self.grade,
                    //                 semester: self.semester,
                    //                 student_id: student_id,
                    //                 fk_semester_id: fk_semester.split("|")[1],
                    //                 semester_name: fk_semester.split("|")[0],
                    //                 code: code
                    //             }]
                    //         }, self);
                    //         layer.closeAll();
                    //     }
                    // });
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
                    };
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();

            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




