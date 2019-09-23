/**
 * Created by Administrator on 2018/6/9.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'progress_wx_total/progress_wx_total', 'html!'),
        C.Co('weixin_pj', 'progress_wx_total/progress_wx_total', 'css!'),
        C.CMF("data_center.js"),
        C.CM("app_select_assembly")
    ],
    function ($, avalon, layer, html, css, data_center, app_select_assembly, three_menu_module) {
        var avalon_define = function () {
            var progress_api = api.api + "GrowthRecordBag/total_input_progress_2";
            var ori_grade_list = [];
            var semester_full = [];
            var vm = avalon.define({
                $id: "ecm_total_progress",
                type: "",
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                student_count: 0,
                progress_list: [],
                extend: {
                    fk_bj_id: '',
                    fk_nj_id: '',
                    fk_xq_id: '',
                    user_level:cloud.user_level(),
                },
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
                init: function () {
                    ori_grade_list = cloud.auto_grade_list({});
                    this.grade_list = any_2_select(ori_grade_list, {name: "grade_name", value: ["grade_id"]});
                    this.extend.fk_nj_id = this.grade_list[0].value;
                    this.extend.fk_school_id = cloud.user_school_id();

                    this.form_list_score.fk_school_id = String(cloud.user_depart_id());
                    this.form_list_score.province = cloud.user_province();
                    this.form_list_score.city = cloud.user_city();
                    this.form_list_score.district = cloud.user_district();

                    this.deal_grade_class(0);
                    semester_full = cloud.grade_semester_list({grade_id: Number(this.extend.fk_nj_id)});
                    semester_full = sort_by(semester_full, ["-start_date"])
                    this.semester_list = any_2_select(semester_full, {
                        name: "semester_name",
                        value: ["id", "start_date", "end_date"]
                    });
                    this.semester_change(this.semester_list[0], 0)
                },
                ysc: {
                    tzcp: 0,
                    yscp: 0,
                    cj: 0
                },
                query_score: function () {


                    var count = 0;
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    //以前体质测评流程
                    // if (vm.health_project.status != -1) {
                    //     cloud.ori_health_score_list(this.form_list_score.$model, function (url, args, data) {
                    //         if (data.hasOwnProperty("list")) {
                    //             vm.ysc.tzcp = data.list.length;
                    //         }
                    //         count++;
                    //         if (count == 3) {
                    //             layer.close(index);
                    //         }
                    //     });
                    // } else {
                    //     count = 1;
                    // }
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
                    }, function (url, args, data) {
                        if (data.hasOwnProperty("list")) {
                            vm.ysc.tzcp = data.list.length;
                        }
                        count++;
                        if (count == 3) {
                            layer.close(index);
                        }
                    });

                    // 国家课程
                    var fm_1000 = {};
                    fm_1000 = $.extend(fm_1000, this.form_list_score.$model);
                    fm_1000.subject_id = "1000";
                    fm_1000.subject_name = '体质测评';
                    cloud.ori_class_score(fm_1000, function (url, args, data) {
                        if (data.hasOwnProperty("list")) {
                            vm.ysc.cj = data.list.length;
                        }
                        count++;
                        if (count == 3) {
                            layer.close(index);
                        }
                    });

                    // 艺术测评
                    var fm_10000 = {};
                    fm_10000 = $.extend(fm_10000, this.form_list_score.$model);
                    fm_10000.subject_id = "10000";
                    fm_10000.subject_name = '艺术测评';
                    cloud.ori_class_score(fm_10000, function (url, args, data) {
                        if (data.hasOwnProperty("list")) {
                            vm.ysc.yscp = data.list.length;
                        };
                        count++;
                        if (count == 3) {
                            layer.close(index);
                        }
                    });

                },
                get_progress: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(progress_api, this.extend.$model, this)
                },
                deal_semester: function (semester) {
                    var arr = semester.split('|');
                    this.form_list_score.phase = (semester_full[0].semester_index - 1).toString();
                    this.extend.fk_xq_id = Number(arr[0]);
                    this.form_list_score.semester_id = arr[0];
                    this.extend.start_date = time_2_str(arr[1]);
                    this.extend.end_date = time_2_str(arr[2]);
                },
                deal_grade_class: function (index) {
                    var class_list = ori_grade_list[index].class_list;
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]});
                    this.form_list_score.class_name = this.class_list[0].name;
                    this.extend.fk_bj_id = this.class_list[0].value;
                    this.form_list_score.fk_class_id = this.class_list[0].value;
                    var student_list = cloud.class_members({fk_class_id:this.extend.fk_bj_id});
                    this.student_count = student_list.length;
                },
                semester_change: function (el, index) {
                    var due_grade = index;
                    this.current_sems_index = index;
                    this.form_list_score.semester_id = el.value.split("|")[0];
                    this.form_list_score.phase = (semester_full[index].semester_index - 1).toString();

                    due_grade = 7 + Math.ceil((1 + due_grade) / 2) - 1;
                    //目前不走以前的体质健康测评流程
                    // cloud.health_project_list({due_grade: due_grade.toString()}, function (url, args, data) {
                    //     console.assert(data.length <= 1, "快找产品，一学期出现两个评价项目啦")
                    //     if (data.length == 0) {
                    //         $.alert(value.name + "不存在体质测评项目");
                    //         vm.health_project.status == -1;
                    //
                    //     } else {
                    //         vm.form_list_score._id = data[0]._id;
                    //         vm.health_project = data[0];
                    //     }
                    //
                    //     vm.query_score();
                    // });
                    vm.query_score();
                    this.deal_semester(el.value);
                    this.get_progress();
                },
                grade_change: function (el, index) {
                    this.extend.fk_nj_id = el.value;

                    // 查询参数
                    this.form_list_score.fk_class_id = sel_class_ls[0].value;

                    // 上传参数
                    this.form_list_score.fk_grade_id = value.value;
                    this.form_list_score.grade_name = value.name;
                    this.form_list_score.semester_id = this.sem_list[0].value;


                    this.deal_grade_class(index);
                    this.get_progress();
                },
                class_change: function (el, index) {
                    this.extend.fk_bj_id = el.value;
                    this.form_list_score.fk_class_id = el.value;
                    this.form_list_score.class_name = el.name;
                    var student_list = cloud.class_members({fk_class_id: el.value});
                    this.student_count = student_list.length;
                    this.get_progress();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case progress_api:
                                if (!data.data)
                                    return;
                                this.progress_list = data.data;
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                    if (cmd == progress_api) {
                        layer.closeAll();
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