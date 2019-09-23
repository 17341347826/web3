/**
 * Created by Administrator on 2018/6/9.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_total_progress/ecm_total_progress', 'html!'),
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_total_progress/ecm_total_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, three_menu_module) {
        var avalon_define = function () {
            //获取总进度
            var api_total_progress = api.api + 'GrowthRecordBag/total_input_progress_2';
            var ori_grade_list = [];
            var vm = avalon.define({
                $id: "ecm_total_progress",
                type: "",
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //班级列表
                class_list: [],
                progress_list: [],
                default_class:'请选择班级',
                extend: {
                    end_date: '',
                    fk_class_id: '',
                    fk_grade_id: '',
                    fk_school_id: '',
                    fk_semester_id: '',
                    start_date: ''
                },
                init: function () {
                    ori_grade_list = cloud.auto_grade_list({});
                    this.grade_list = any_2_select(ori_grade_list, {name: "grade_name", value: ["grade_id"]});
                    this.extend.fk_grade_id = this.grade_list[0].value;
                    this.extend.fk_school_id = cloud.user_school_id();
                    this.deal_grade_class(0);
                    var semester_full = cloud.grade_semester_list({grade_id: Number(this.extend.fk_grade_id)});
                    semester_full = sort_by(semester_full, ["-start_date"]);
                    this.semester_list = any_2_select(semester_full, {name: "semester_name", value: ["id","start_date","end_date"]});
                    var first_semester = this.semester_list[0].value;
                    this.deal_semester(first_semester);
                    this.get_progress();
                },
                get_progress: function () {
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(api_total_progress,{
                        fk_bj_id:Number(this.extend.fk_class_id),
                        fk_nj_id:Number(this.extend.fk_grade_id),
                        fk_xq_id:Number(this.extend.fk_semester_id),
                        user_level:cloud.user_level(),
                    },this);
                },
                deal_semester: function (semester) {
                    var arr = semester.split('|');
                    this.extend.fk_semester_id = Number(arr[0]);
                    this.extend.start_date = time_2_str(arr[1]);
                    this.extend.end_date = time_2_str(arr[2]);
                },
                deal_grade_class: function (index) {
                    var class_list = ori_grade_list[index].class_list;
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]});
                    this.extend.fk_class_id = this.class_list[0].value;
                    this.default_class = this.class_list[0].name;
                },
                semester_change: function (el, index) {
                    this.deal_semester(el.value);
                    this.get_progress();
                },
                grade_change: function (el, index) {
                    this.extend.fk_grade_id = el.value;
                    this.deal_grade_class(index);
                    this.get_progress();
                },
                class_change: function (el, index) {
                    this.extend.fk_class_id = el.value;
                    this.get_progress();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_total_progress:
                                this.complete_total_progress(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                    if (cmd == api_total_progress) {
                        layer.closeAll();
                    }
                },
                complete_total_progress:function(data){
                    if (!data.data)
                        return;
                    this.progress_list = data.data;
                },
            });

            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });