/**
 * Created by Administrator on 2018/6/11.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_desc_assessment/ecm_desc_assessment','html!'),
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_desc_assessment/ecm_desc_assessment','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"), C.CMF("formatUtil.js"),
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module, formatUtil) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "ecm_desc_assessment",
                 type:"",
                 head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                //学年学期列表
                sem_list:[],
                //年级列表
                grade_list:[],
                //班级列表
                class_list:[],
                student_list:[],
                filter: {code: "", name: ""},
                form_list: {
                    fk_class_id: 0,
                    fk_grade_id: 0,
                    fk_school_id: 0,
                    fk_semester_id:0,
                },
                process:[],
               font_color:function (tl) {
                    if(tl == '未上传'){
                        return "red"
                    }
                    return "black"

                },
                line_offset:0,
                init:function () {
                     setTimeout(function (args) {
                        // -> 不同的身份，获取的班级，年级列表不一样
                        grade_list = cloud.auto_grade_list({});
                        vm.form_list.fk_school_id = cloud.user_school_id();
                        vm.grade_list = any_2_select(grade_list, {name:"grade_name", value:["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                    }, 0);

                },
                change_grade: function (value, index) {

                    var ori_class = grade_list[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;


                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    semester_full = sort_by(semester_full, ["-start_date"]);
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});

                    // 查询参数
                    this.form_list.fk_class_id = Number(sel_class_ls[0].value);
                    this.form_list.fk_grade_id = Number(value.value);

                    //this.change_sems(this.sem_list[0], 0);
                    this.change_class(sel_class_ls[0], 0);
                    // 修改对应显示信息
                    data_center.scope("ecm_daily_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    data_center.scope("ecm_daily_opt_class", function (p) {
                        p.head_value = ori_class[0].class_name;
                    });
                    data_center.scope("ecm_daily_opt_sem", function (p) {
                        p.head_value = semester_full[0].semester_name;
                    });
                },
                change_class: function (value, index) {
                    this.form_list.fk_class_id = Number(value.value);
                    this.change_sems(this.sem_list[0], 0);
                },
                change_sems: function (value, index) {
                    // 查询学期下的体质测评
                    var due_grade = index;
                    this.form_list.fk_semester_id = Number(value.value);
                    //this.form_list.semester_id = "2";
                    this.current_sems_index = index;
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    cloud.class_process_ms(this.form_list.$model, function (url, args, data) {
                        vm.project_list = []
                        vm.student_list = []
                        vm.process = data.desc_eval_list;

                        var datail_list_sort = sort_by(data.desc_eval_detail_list, ["-zwms", "-txhp", "-jzjy", "-jsjy", "-xspy", "-jspy", "+xsxm"]);
                        vm.line_offset = Math.ceil(datail_list_sort.length/2);
                        vm.student_list = datail_list_sort ;
                        layer.close(index);
                    });
                },
                font_color:function (tl) {
                    if(tl == '未上传'){
                        return "red"
                    }
                    return "black"

                },

            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });