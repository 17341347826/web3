define(["jquery", C.CLF('avalon.js'), "layer",
        C.Co("weixin_pj", "teacher_content_list/teacher_content_list", "css!"),
        C.Co("weixin_pj", "teacher_content_list/teacher_content_list", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),"jquery-weui"
    ],
    function ($, avalon, layer, css, html, x, data_center, weui) {
        //获取项目内容
        var api_get_content_list = api.api + "Indexmaintain/indexmaintain_findByPlanSubject";
        //获取学生
        var api_get_student = api.api + "base/baseUser/studentlist.action";
        //获取已评学生
        var api_get_complete_student = api.api + "Indexmaintain/indexmaintain_findbyevaluaterecord";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "teacher_content_list",
                student_arr: [],
                class_is_show: false,
                table_show: false,
                color_green: {color: 'green'},
                color_red: {color: 'red'},
                grade_list: [],
                class_list: [],
                get_grade_id: "",
                get_class_id: "",
                school_id: "",
                type: "",
                pj_proid: "",
                pro_plan_id: "",
                contentList: [],
                teacher_guid: "",
                pro_end_time: "",
                pro_start_time: "",
                semester_id: "",
                get_info: function () {
                    this.pj_proid = Number(pmx.id);
                    this.get_grade_id = Number(pmx.grade_id);
                    this.get_class_id = Number(pmx.class_id);
                    this.school_id = pmx.school_id;
                    this.pro_plan_id = Number(pmx.pro_plan_id);
                    this.teacher_guid = pmx.guid;
                    this.pro_start_time = pmx.pro_start_time;
                    this.pro_end_time = pmx.pro_end_time;
                    this.semester_id = pmx.semester_id;
                    ajax_post(api_get_content_list, {id: this.pro_plan_id, plan_level: Number(pmx.plan_level)}, this);
                    // ajax_post(api_get_student,{fk_school_id:this.get_school_id,grade_id:this.get_grade_id,fk_class_id:this.get_class_id},this)
                },
                evaluate_click: function (el) {
                    var value_list = '';
                    if(this.contentList[0].value_list.length > 0){//选项打分
                        value_list = JSON.stringify(el.value_list);
                        window.location = "#project_wx_radio?&grade_id=" + this.get_grade_id +
                            "&class_id=" + this.get_class_id +
                            "&pj_proid=" + this.pj_proid +
                            "&sub_subjectid=" + el.sub_subjectid +
                            "&school_id=" + this.school_id +
                            "&teacher_guid=" + this.teacher_guid +
                            "&every_value=" + el.index_value +
                            "&pro_plan_id=" + this.pro_plan_id +
                            "&id=" + el.fk_index_id +
                            "&semester_id=" + this.semester_id +
                            "&index_secondaryid=" + el.index_secondaryid +
                            "&pro_end_time=" + this.pro_end_time +
                            "&pro_start_time=" + this.pro_start_time +
                            "&sub_subject=" + el.sub_subject+
                            "&plan_level=" + pmx.plan_level+
                            "&value_list=" + value_list;
                    }else{
                        window.location = "#teacher_content_fill?&grade_id=" + this.get_grade_id +
                            "&class_id=" + this.get_class_id +
                            "&pj_proid=" + this.pj_proid +
                            "&sub_subjectid=" + el.sub_subjectid +
                            "&school_id=" + this.school_id +
                            "&teacher_guid=" + this.teacher_guid +
                            "&every_value=" + el.index_value +
                            "&pro_plan_id=" + this.pro_plan_id +
                            "&id=" + el.fk_index_id +
                            "&semester_id=" + this.semester_id +
                            "&index_secondaryid=" + el.index_secondaryid +
                            "&pro_end_time=" + this.pro_end_time +
                            "&pro_start_time=" + this.pro_start_time +
                            "&sub_subject=" + el.sub_subject+
                            "&plan_level=" + pmx.plan_level;
                    }

                    // if (this.contentList[0].value_list.length > 0) {//选项打分
                    //     window.location = "#teacher_content_fill?&grade_id=" + this.get_grade_id +
                    //         "&class_id=" + this.get_class_id +
                    //         "&pj_proid=" + this.pj_proid +
                    //         "&sub_subjectid=" + el.sub_subjectid +
                    //         "&school_id=" + this.school_id +
                    //         "&teacher_guid=" + this.teacher_guid +
                    //         "&every_value=" + el.index_value +
                    //         "&pro_plan_id=" + this.pro_plan_id +
                    //         "&id=" + el.fk_index_id +
                    //         "&pro_end_time=" + this.pro_end_time +
                    //         "&pro_start_time=" + this.pro_start_time +
                    //         "&sub_subject=" + el.sub_subject +
                    //         "&plan_level=" + pmx.plan_level;
                    // } else {//直接打分
                    //     window.location = "#teacher_content_fill?&grade_id=" + this.get_grade_id +
                    //         "&class_id=" + this.get_class_id +
                    //         "&pj_proid=" + this.pj_proid +
                    //         "&sub_subjectid=" + el.sub_subjectid +
                    //         "&school_id=" + this.school_id +
                    //         "&teacher_guid=" + this.teacher_guid +
                    //         "&every_value=" + el.index_value +
                    //         "&pro_plan_id=" + this.pro_plan_id +
                    //         "&id=" + el.fk_index_id +
                    //         "&semester_id=" + this.semester_id +
                    //         "&index_secondaryid=" + el.index_secondaryid +
                    //         "&pro_end_time=" + this.pro_end_time +
                    //         "&pro_start_time=" + this.pro_start_time +
                    //         "&sub_subject=" + el.sub_subject+
                    //         "&plan_level=" + pmx.plan_level;
                    // }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取项目内容
                            case api_get_content_list:
                                this.complete_get_content_list(data);
                                break;
                            //获取学生
                            case api_get_student:
                                this.complete_get_student(data);
                                break;
                            //获取已评学生
                            case api_get_complete_student:
                                this.complete_get_complete_student(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                complete_get_content_list: function (data) {
                    this.contentList = data.data;
                },
                complete_get_student: function (data) {
                    if (data.data.list.length > 0) {
                        this.table_show = true;
                        this.student_arr = data.data.list;
                        ajax_post(api_get_complete_student, {
                            pj_name_guid: this.teacher_guid,
                            pj_proid: this.pj_proid
                        }, this);
                    } else {
                        $.alert("暂无该班级学生数据");
                        this.table_show = false;
                    }
                },
                complete_get_complete_student: function (data) {
                    var complete_student = data.data;
                    var index_ = {}
                    for (var i = 0; i < complete_student.length; i++) {
                        index_[complete_student[i].pj_cover_name_guid] = 1
                    }
                    for (var i = 0; i < this.student_arr.length; i++) {
                        if (index_.hasOwnProperty(this.student_arr[i].guid)) {
                            this.student_arr[i].status = "已评价"
                        } else {
                            this.student_arr[i].status = "未评价"
                        }
                    }
                }
            });
            vm.$watch('onReady', function () {
                this.get_info();

            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });