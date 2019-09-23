/**
 * Created by Administrator on 2018/5/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor', 'teacher_review_progress/teacher_review_progress', 'html!'),
        C.Co('evaluation_condition_monitor', 'teacher_review_progress/teacher_review_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module"),
        C.CM("select_assembly")
    ],
    function ($, avalon, layer, html, css, data_center, three_menu_module, select_assembly) {

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "rp",
                //学年学期数组
                semester_arr: [],
                //年级数组
                grade_arr: [],
                //班级数组
                class_arr: [],
                is_init_sel: true,
                current_semester: "",
                current_grade: "",
                current_class: "",
                par: {
                    fk_class_id: "",
                    fk_grade_id: "",
                    fk_school_id: "",
                    fk_semester_id: "",
                    semester_start_date: ""
                },
                result: [],
                class_overall_audit_list: [],
                reconsider_audit_List: [],
                upload_material_audit_list: [],
                default_class:'请选择班级',
                init: function () {
                    var self = this;
                    var highest_level = cloud.user_level();

                    if (highest_level == 6) {
                        this.grade_arr = cloud.auto_grade_list();
                        this.class_arr = this.grade_arr[0].class_list;
                        for (var i = 0; i < this.grade_arr.length; i++) {
                            this.grade_arr[i]['value'] = this.grade_arr[i].grade_id;
                            this.grade_arr[i]['name'] = this.grade_arr[i].grade_name;
                            for (var j = 0; j < this.grade_arr[i].class_list.length; j++) {
                                this.grade_arr[i].class_list[j]['value'] = this.grade_arr[i].class_list[j].class_id;
                                this.grade_arr[i].class_list[j]['name'] = this.grade_arr[i].class_list[j].class_name
                            }
                        }
                    } else {
                        this.grade_arr = cloud.grade_all_list();
                        this.class_arr = cloud.class_all_list({fk_grade_id: this.grade_arr[0].value});
                    }
                    this.current_grade = this.grade_arr[0];
                    var semester_full = cloud.grade_semester_list({grade_id: Number(this.current_grade.grade_id)});
                    this.semester_arr = any_2_select(semester_full, {
                        name: "semester_name",
                        value: ["id", "start_date", "end_date"]
                    });
                    this.current_semester = this.semester_arr[0];

                    this.current_class = this.class_arr[0];
                    this.par.fk_class_id = this.current_class.value;
                    this.par.fk_grade_id = this.current_grade.value;
                    this.par.fk_semester_id = this.current_semester.value.split("|")[0];
                    this.par.fk_school_id = cloud.user_user().fk_school_id;
                    this.par.semester_start_date = time_2_str(this.current_semester.value.split("|")[1]);

                    cloud.pj_shfy_process(this.par, function (url, ars, data, is_suc, msg) {
                        if (!is_suc) {
                            toastr.error(msg);
                            return 0;
                        };
                        self.class_overall_audit_list = data.class_overall_audit_list;
                        self.reconsider_audit_List = data.reconsider_audit_List;
                        self.upload_material_audit_list = data.upload_material_audit_list;
                    });
                },
                //-----------学期，年级，班级选择----------------------
                semester_sel: function (el) {
                    var self = this;
                    this.par.semester_start_date = time_2_str(el.value.split("|")[1]);
                    this.par.fk_semester_id = el.value.split("|")[0];
                    cloud.pj_shfy_process(self.par, function (url, ars, data, is_suc, msg) {
                        if (!is_suc) {
                            toastr.error(msg);
                            return 0;
                        }
                        ;
                        if (data != null) {
                            self.class_overall_audit_list = data.class_overall_audit_list;
                            self.reconsider_audit_List = data.reconsider_audit_List;
                            self.upload_material_audit_list = data.upload_material_audit_list;
                        } else {
                            self.class_overall_audit_list = [];
                            self.reconsider_audit_List = [];
                            self.upload_material_audit_list = [];
                        }

                    });
                },
                grade_sel: function (el) {
                    var self = this;
                    this.current_grade = el;
                    this.par.fk_grade_id = el.value;
                    this.class_arr = el.class_list;
                    this.par.fk_class_id = this.class_arr[0].value;
                    this.default_class = this.class_arr[0].name;
                    cloud.pj_shfy_process(self.par, function (url, ars, data, is_suc, msg) {
                        if (!is_suc) {
                            toastr.error(msg);
                            return 0;
                        };
                        if (data != null) {
                            self.class_overall_audit_list = data.class_overall_audit_list;
                            self.reconsider_audit_List = data.reconsider_audit_List;
                            self.upload_material_audit_list = data.upload_material_audit_list;
                        } else {
                            self.class_overall_audit_list = [];
                            self.reconsider_audit_List = [];
                            self.upload_material_audit_list = [];
                        }
                    });
                },
                class_sel: function (el) {
                    var self = this;
                    this.par.fk_class_id = el.value;
                    cloud.pj_shfy_process(self.par, function (url, ars, data, is_suc, msg) {
                        if (!is_suc) {
                            toastr.error(msg);
                            return 0;
                        };
                        if (data != null) {
                            self.class_overall_audit_list = data.class_overall_audit_list;
                            self.reconsider_audit_List = data.reconsider_audit_List;
                            self.upload_material_audit_list = data.upload_material_audit_list;
                        } else {
                            self.class_overall_audit_list = [];
                            self.reconsider_audit_List = [];
                            self.upload_material_audit_list = [];
                        }

                    });
                },
                //-------------------------

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
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
