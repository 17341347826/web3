/**
 * Created by Administrator on 2018/6/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_achievement_import/ecm_achievement_import', 'html!'),
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_achievement_import/ecm_achievement_import', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"), C.CMF("formatUtil.js"),
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module, formatUtil) {
        var grade_list = [];
        var semester_full = [];
        var avalon_define = function (args) {

            avalon.filters.code_format = function (str) {
                return '...' + str.substring(16);
            };
            var semester_full = [];
            var grade_list = [];
            var student_list = [];
            var health_list = [];
            var score_1000 = {};
            var score_10000 = {};
            var vm = avalon.define({
                $id: "ecm_achievement_import",
                // 体质测评项目
                health_project: {
                    "_id": "",
                    "check_status": -1,
                    "due_grade": "",
                    "end": "",
                    "fk_school_id": -1,
                    "for_id": "",
                    "for_name": "",
                    "grade_status": 0,
                    "join": "",
                    "last": "",
                    "name": "",
                    "phase": "1",
                    "process": "",
                    "solution": "",
                    "start": "",
                    "status": 0
                },
                is_init: true,
                current_sems_index: 0,
                grade_list: [],
                class_list: [],
                sem_list: [],
                student_list: [],
                headers: [],
                ysc: {
                    tzcp: 0,
                    yscp: 0,
                    cj: 0
                },
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                filter: {code: "", name: ""},
                form_list_score: {
                    _id: "",
                    fk_class_id: "",
                    fk_school_id: "",
                    province: "",
                    city: "",
                    district: "",
                    class_name: "",
                    grade_name: "",
                    phase: 0,
                    subject_id: 12,
                    year_start: "",
                    year_end: "",
                    subject_name: "体质测评",
                    semester_id: "",
                    fk_grade_id: "",
                },
                value_of:function (v) {
                    if(v == 1)
                        return "己录入"
                    return "未录入"
                },
                init: function () {
                    setTimeout(function (args) {
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        vm.form_list_score.province = cloud.user_province();
                        vm.form_list_score.city = cloud.user_city();
                        vm.form_list_score.district = cloud.user_district();
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);
                },
                change_grade: function (value, index) {
                    var grade_ls = grade_list;
                    var ori_class = grade_ls[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;
                    this.change_class(sel_class_ls[0], 0, false);

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    semester_full = sort_by(semester_full, ["-start_date"]);
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    this.change_sems(this.sem_list[0], 0);

                    // 查询参数
                    this.form_list_score.fk_class_id = sel_class_ls[0].value;

                    // 上传参数
                    this.form_list_score.fk_grade_id = value.value;
                    this.form_list_score.grade_name = value.name;
                    this.form_list_score.class_name = sel_class_ls[0].name;
                    this.form_list_score.semester_id = this.sem_list[0].value;
                    this.form_list_score.phase = (semester_full[0].semester_index - 1).toString();

                    // 修改对应显示信息
                    data_center.scope("score_proc_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    data_center.scope("score_proc_opt_class", function (p) {
                        p.head_value = ori_class[0].class_name;
                    });
                    data_center.scope("score_proc_opt_sem", function (p) {
                        p.head_value = semester_full[0].semester_name;
                    });
                },
                change_class: function (value, index, is_refresh) {
                    this.form_list_score.fk_class_id = value.value;
                    this.form_list_score.class_name = value.name;
                    if(is_refresh == undefined)
                        vm.query_score()
                },
                change_sems: function (value, index) {
                    // 查询学期下的体质测评
                    var due_grade = index;
                    this.current_sems_index = index;
                    this.form_list_score.semester_id = value.value;
                    this.form_list_score.phase = (semester_full[index].semester_index - 1).toString();

                    due_grade = 7 + Math.ceil((1+due_grade)/2) - 1;
                    //查询体质测评项目
                    // cloud.health_project_list({due_grade:due_grade.toString()}, function (url, args, data) {
                    //     if (data.length == 0) {
                    //         toastr.warning(value.name + "不存在体质测评项目");
                    //         vm.health_project.status == -1;
                    //
                    //     }else{
                    //         vm.form_list_score._id = data[0]._id;
                    //         vm.health_project = data[0];
                    //     }
                    //
                    //     vm.query_score();
                    // });
                    //查询三个成绩
                    vm.query_score();
                },
                line_offset:0,
                font_color:function (tl) {
                    if(tl == 0){
                        return "red"
                    }
                    return "#a2a2a2"

                },
                query_score: function () {

                    this.filter.code = "";
                    this.filter.name = "";
                    var count = 0;
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    student_list = cloud.class_members({fk_class_id: vm.form_list_score.fk_class_id});
                    //体质健康
                    cloud.new_health_list({
                        current_process:'',//当前进度（已提交 ，已修改，公示中，已归档）
                        fk_class_id:vm.form_list_score.fk_class_id,
                        fk_grade_id:vm.form_list_score.fk_grade_id,
                        fk_school_id:vm.form_list_score.fk_school_id,
                        flag_exempt:'',//标志免考 0 正常 1 免考(审核通过) 2待审核免考 3 审核不同
                        guid:'',
                        offset:0,
                        rows:9999,
                        semester_id:vm.form_list_score.semester_id,
                        code__icontains:'',//学籍号
                        name__icontains:'',//姓名
                    }, function (url, args, data, is_suc, msg) {
                        if (data.hasOwnProperty("list")) {
                            vm.ysc.tzcp = data.list.length;
                            merge_table(student_list, ["code"], data.list, ["code"], "tz", 0, 1);
                        }
                        count++;
                        if (count == 3) {
                            sort_by(student_list, ["+xy", "+tz", "+ys", "-name"]);
                            vm.line_offset = Math.ceil(student_list.length/2);
                            vm.student_list = student_list;
                            layer.close(index);
                        }
                    });

                    // if (vm.health_project.status != -1) {
                    //     cloud.ori_health_score_list(this.form_list_score.$model, function (url, args, data) {
                    //         if (data.hasOwnProperty("list")) {
                    //             vm.ysc.tzcp = data.list.length;
                    //             merge_table(student_list, ["code"], data.list, ["code"], "tz", 0, 1);
                    //         }
                    //         count++;
                    //         if (count == 3) {
                    //             sort_by(student_list, ["+xy", "+tz", "+ys", "-name"]);
                    //             vm.line_offset = Math.ceil(student_list.length/2);
                    //             vm.student_list = student_list;
                    //             layer.close(index);
                    //         }
                    //     });
                    // }else{
                    //     count = 1;
                    // }

                    // 国家课程
                    var fm_1000 = {};
                    fm_1000 = $.extend(fm_1000, this.form_list_score.$model);
                    fm_1000.subject_id = "1000";
                    cloud.ori_class_score(fm_1000, function (url, args, data) {
                        if (data.hasOwnProperty("list"))
                        {
                            vm.ysc.cj = data.list.length;
                            merge_table(student_list, ["code"], data.list, ["code"], "xy", 0, 1);

                        }
                        count++;
                        if (count == 3) {
                            sort_by(student_list, ["+xy", "+tz", "+ys", "-name"]);
                            vm.student_list = student_list;
                            vm.line_offset = Math.ceil(student_list.length/2);
                            layer.close(index);
                        }
                    });

                    // 艺术测评
                    var fm_10000 = {};
                    fm_10000 = $.extend(fm_10000, this.form_list_score.$model);
                    fm_10000.subject_id = "10000";
                    cloud.ori_class_score(fm_1000, function (url, args, data) {
                        if (data.hasOwnProperty("list")) {
                            vm.ysc.yscp = data.list.length;
                            merge_table(student_list, ["code"], data.list, ["code"], "ys", 0, 1);
                        };
                        count++;
                        if (count == 3) {
                            sort_by(student_list, ["+xy", "+tz", "+ys", "-name"]);
                            vm.line_offset = Math.ceil(student_list.length/2);
                            vm.student_list = student_list;
                            layer.close(index);
                        }
                    });

                },

            });
            vm.$watch("onReady", function () {
                $(".am-dimmer").css("display", "none");
                // this.cb();
            });
            vm.init()
            return vm;
        }


        return {
            view: html,
            define: avalon_define
        }
    });