define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("self_evaluation_management", "self_description/new_teacher_comment/new_teacher_comment", "css!"),
        C.Co("self_evaluation_management", "self_description/new_teacher_comment/new_teacher_comment", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM('three_menu_module')
    ],
    function ($, avalon, layer, css, html, x, data_center, three_menu_module) {
        //查询模块时间
        var api_get_module_time = api.api + "everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time = api.api + 'base/baseUser/current_time';
        //列表查询学生
        // var api_get_all_stu = api.api + "base/baseUser/studentlist.action";
        var api_get_all_stu = api.api + "base/student/class_used_stu";
        //查询当前可用的学年学期
        var api_semester_is_fill = api.api + "base/semester/grade_opt_semester";
        //评语状态
        var teacher_comment_list = api.api + "everyday/get_list_remarl";
        //提交评语
        var api_add_comment_teacher = api.api + "everyday/remarl_teacher";
        //获取当前学年学期
        var api_current_semester = api.api + "base/semester/current_semester.action";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "new_teacher_comment",
                highest_level:"",
                current_se_id:"",//当前学年学期id
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
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                get_student: [],
                local_ary: {},
                is_switch: "",
                //当前身份是否是班主任：false-不是，true-是
                is_headmaster:false,
                //班主任所教课程
                lead_class_list:[],
                //防止重复提交:true-能点击提交，false-不能点击提交
                btn_had:true,
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //当前学年学期
                            case api_current_semester:
                                this.complete_current_semester(data);
                                break;
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
                            //保存评论
                            case api_add_comment_teacher:
                                this.check_btn();
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                current_sem:function () {
                    ajax_post(api_current_semester,{},this);
                },
                complete_current_semester:function (data) {
                    if(data.data){
                        this.current_se_id = data.data.id;
                    }

                    this.cb();
                },
                cb: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var userData = JSON.parse(data.data['user']);
                        var highest_level = data.data.highest_level;
                        self.highest_level = highest_level;
                        self.lead_class_list = userData.lead_class_list;
                        if(highest_level == 4){//校领导
                            self.grade_list = cloud.auto_grade_list({});
                        }else{//教师
                            var lead_class_list = userData.lead_class_list;
                            self.grade_list = lead_class_list;
                        }
                        self.fk_grade_id = self.grade_list[0].grade_id;
                        self.fk_grade_name = self.grade_list[0].grade_name;
                        self.class_list = self.grade_list[0].class_list;
                        self.fk_class_id = self.class_list[0].class_id;
                        self.fk_school_id = userData.fk_school_id;
                        //判断当前用户能否编辑当前班级
                        if(self.lead_class_list.length>0 && self.lead_class_list[0].class_list[0].class_id == self.fk_class_id){
                            self.is_headmaster = true;
                        }else{
                            self.is_headmaster = false;
                        }
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
                    //判断当前用户能否编辑当前班级
                    if(this.lead_class_list.length>0 && this.lead_class_list[0].class_list[0].class_id == this.fk_class_id){
                        this.is_headmaster = true;
                    }else{
                        this.is_headmaster = false;
                    }
                    this.check_btn();
                },
                classChange: function () {
                    //判断当前用户能否编辑当前班级
                    if(this.lead_class_list.length>0 && this.lead_class_list[0].class_list[0].class_id == this.fk_class_id){
                        this.is_headmaster = true;
                    }else{
                        this.is_headmaster = false;
                    }
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
                check_btn: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(api_get_all_stu, {
                        fk_class_id: this.fk_class_id,
                        // fk_grade_id: this.fk_grade_id,
                        // fk_school_id: this.fk_school_id
                    }, this);
                },
                complete_semester_is_fill: function (data) {
                    var dataList = data.data.list;
                    var dataLength = dataList.length;
                    for(var i = 0;i < dataLength; i++){
                        if(dataList[i].id == this.current_se_id){
                            this.fk_semester = dataList[i].semester_name + "|" +
                                dataList[i].id + "|" +
                                dataList[i].end_date + "|" +
                                dataList[i].start_date;
                            this.grade = Number(dataList[i].semester_name.substr(0, 4));
                            this.semester = dataList[i].id;
                        }
                    }
                    if(this.current_se_id==''){
                        var index = 0;
                        this.fk_semester = dataList[index].semester_name + "|" +
                            dataList[index].id + "|" +
                            dataList[index].end_date + "|" +
                            dataList[index].start_date;
                        this.grade = Number(dataList[index].semester_name.substr(0, 4));
                        this.semester = dataList[index].id;
                    }
                    this.semester_list = dataList;
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
                    var dataList_length = dataList.length;
                    var all_stu = this.get_student;
                    var all_stu_length = all_stu.length;
                    if (dataList_length == 0) {
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
                        this.student_list = all_stu;
                    }
                    this.data_had = true;
                    layer.closeAll();
                },
                //编辑
                edit_btn: function (el) {
                    var self = this;
                    self.btn_had = true;
                    var name = el.name;
                    var class_id = el.fk_class_id;
                    var grade_id = el.fk_grade_id;
                    var school_id = el.fk_school_id;
                    var student_id = el.guid;
                    var code = el.code;
                    var fk_semester = this.fk_semester;
                    var semester_name = fk_semester.split("|")[0];
                    var title = "请对" + "【" + name + "】" + "进行" + semester_name + "期的评价";
                    var content_teacher = el.content_teacher;
                    layer.prompt({title: title, formType: 2, value: content_teacher}, function (text, index) {
                        if ($.trim(text) != '') {
                            var value = text;
                            if(self.btn_had){
                                ajax_post(api_add_comment_teacher, {
                                    fk_nj_id: self.fk_grade_id,
                                    list: [{
                                        content_teacher: value,
                                        fk_class_id: class_id,
                                        fk_grade_id: grade_id,
                                        fk_school_id: school_id,
                                        grade: self.grade,
                                        semester: self.semester,
                                        student_id: student_id,
                                        fk_semester_id: fk_semester.split("|")[1],
                                        semester_name: fk_semester.split("|")[0],
                                        code: code
                                    }]
                                }, self);
                                self.btn_had = false;
                            }
                            layer.closeAll();
                        }
                    });
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
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                this.current_sem();

            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




