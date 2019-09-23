/**
 * Created by Administrator on 2018/6/9.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_daily_perform/ecm_daily_perform','html!'),
        C.Co('evaluation_condition_monitor', 'entry_progress/ecm_daily_perform/ecm_daily_perform','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module"), C.CMF("formatUtil.js"),
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module, formatUtil) {
        var grade_list= [];
        var semester_full = [];
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "ecm_daily_perform",
                type:"",
                 head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                //学年学期列表
                sem_list:[],
                //年级列表
                line_offset:0,
                grade_list:[],
                //班级列表
                class_list:[],
                student_list:[],
                filter: {code: "", name: ""},
                form_list: {
                    semester_id: "",
                    class_id: "",
                    grade_id: "",
                },
                // process:{rjscs: "0.00", yscrs: 0, bjrs: 0, wscrs: 0, scxszb: 0, sczs: 0},
                process:{},
                init:function () {
                     setTimeout(function (args) {
                        // -> 不同的身份，获取的班级，年级列表不一样
                        grade_list = cloud.auto_grade_list({});
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
                    this.form_list.class_id = sel_class_ls[0].value;
                    this.form_list.grade_id = value.value;

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
                    this.form_list.class_id = value.value;
                    this.change_sems(this.sem_list[0], 0);
                },
                change_sems: function (value, index) {
                    // 查询学期下的体质测评
                    var due_grade = index;
                    this.form_list.semester_id = value.value;
                    //this.form_list.semester_id = "2";
                    this.current_sems_index = index;
                    var index = layer.load(1, {shade:[0.3,'#121212']});
                    // cloud.class_process_rc(this.form_list.$model, function (url, args, data) {
                    //     vm.process = data[0];
                    // });
                    // cloud.class_process_detail_rc(this.form_list.$model, function (url, args, data) {
                    //     vm.line_offset = Math.ceil(data.length/2);
                    //     vm.student_list = data;
                    //     layer.close(index);
                    // });
                    cloud.class_rcbx_input_progress({
                        fk_bj_id:Number(this.form_list.class_id),
                        fk_nj_id:Number(this.form_list.grade_id),
                        fk_xq_id:Number(this.form_list.semester_id),
                        fk_xx_id:Number(cloud.user_depart_id()),
                        qxmc:cloud.user_district(),
                        szmc:cloud.user_city(),
                        user_level:cloud.user_level(),
                    },function(url, args, data,is_suc,msg){
                        layer.close(index);
                        if(!is_suc){
                            toast.error(msg);
                            return;
                        }
                        vm.process = data.class_cnt;
                        vm.line_offset = Math.ceil(data.rcbx_detail.length/2);
                        vm.student_list = data.rcbx_detail;
                    })
                }
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