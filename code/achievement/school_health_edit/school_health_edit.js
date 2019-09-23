define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'school_health_edit/school_health_edit', 'html!'),
        C.Co('achievement', 'school_health_edit/school_health_edit', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "select2"
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, select2) {

        var avalon_define = function (args) {
            var grade_list= [];
            var semester_full = [];
            var form = {
                    fk_class_id: args.fk_class_id,
                    fk_school_id: args.fk_school_id,
                    _id:args._id
            };
            form = $.extend(form, args);
            var vm = avalon.define({
                $id: "school_health_edit",
                 // 体质测评项目
                health_project:{
                    "_id": "", "check_status": -1, "due_grade": "", "end": "", "fk_school_id": -1, "for_id": "", "for_name": "", "grade_status": 0, "join": "", "last": "", "name": "", "phase": "1", "process": "", "solution": "", "start": "", "status": 0
                },
                 is_init:true,
                current_sems_index:0,
                filter: {code: "", name: ""},
                form_list_score: form,
                current_student_pos: -1,
                headers: [],
                score_list: [],
                grade_list: [],
                class_list: [],
                sem_list: [],
                is_disable_input:false,
                // 当前编辑的学生成绩对象
                score: {
                    act_col_5: {rate: "", score: "", add: "", value: "", level: ""},
                    act_col_6: {rate: "", score: "", add: "", value: "", level: ""},
                    act_col_9: {rate: "", score: "", add: "", value: "", level: ""},
                    code:  "G513821200305149012",
                    col_1:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_2:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_3:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_4:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_5:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_6:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_7:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_8:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_9:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_10:   {rate: "", score: "", add: "", value: "", level: ""},
                    col_11: {rate: "", score: "", add: "", value: "", level: ""},
                    col_12:  {rate: "", score: "", add: "", value: "", level: ""},
                    col_13: {rate: "", score: "", add: "", value: "", level: ""},
                    col_14: {rate: "", score: "", add: "", value: "", level: ""},
                    col_15:  {rate: "", score: "", add: "", value: "", level: ""},
                    fk_class_id:  18,
                    fk_grade_id:   36,
                    fk_school_id: 2,
                    guid:  1937,
                    name: "",
                    sex: ""
                },
                 filter_sex:make_filter(function (line) {
                    if(line.for_sex == vm.score.sex)
                        return true;
                    return false;
                }),
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                change_grade: function (value, index) {

                    var ori_class = grade_list[index].class_list;

                    // 获取班级列表
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]})
                    this.class_list = sel_class_ls;
                    this.change_class(sel_class_ls[0], 0);

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});

                    sort_by(semester_full, ["+start_date"]);
                    // 两两合并
                    // semester_full = semester_full.filter(function(v,i){v.semester_name = v.semester_name .substr(0, v.semester_name .indexOf("(")); return i % 2 == 0;})
                    semester_full = semester_full.filter(function(v,i){v.semester_name = v.semester_name .substr(0, 11); return i % 2 == 0;})

                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    this.change_sems(this.sem_list[0], 0);

                    // 查询参数
                    this.form_list_score.fk_class_id = sel_class_ls[0].value;

                    // 修改对应显示信息
                    data_center.scope("score_edit_opt_grade", function (p) {
                        p.head_value = value.name;
                    });
                    data_center.scope("score_edit_opt_class", function (p) {
                        p.head_value = ori_class[0].class_name;
                    });
                    data_center.scope("score_edit_opt_sem", function (p) {
                        p.head_value = semester_full[0].semester_name;
                    });
                },
                change_class: function (value, index) {
                    this.form_list_score.fk_class_id = value.value;
                    this.query_score();
                },
                change_sems: function (value, index) {
                    // 查询学期下的体质测评
                    var due_grade = index;
                    this.current_sems_index = index;
                    cloud.health_project_list({due_grade:(7+due_grade).toString()}, function (url, args, data) {
                        console.assert(data.length <= 1, "快找产品，一学期出现两个评价项目啦")
                        if(data.length == 0){
                            toastr.warning(value.name+"不存在体质测评项目");

                            vm.health_project.status == -1;
                            return;
                        }

                        vm.form_list_score._id = data[0]._id;
                        vm.health_project = data[0];
                        if(vm.is_init){
                              vm.is_init = false;
                              vm.query_score();
                        }
                    });
                },
                query_score: function () {
                    this.filter.code = "";
                    this.filter.name = "";
                    if( vm.health_project.status == -1){
                        toastr.warning("该学期暂无项目");
                        return;
                    }

                    cloud.health_score_list(this.form_list_score.$model, function (data, headers) {
                        vm.headers = headers;
                        vm.score_list = [];
                        vm.score_list = data;
                    });
                },

                student_code_change: function (e) {
                    this.current_student_pos = Number(e.target.value);
                    if ($("#name_select").val() != e.target.value)
                        $("#name_select").select2("val", e.target.value)

                    if (this.current_student_pos == -1)
                        return;
                    var score_mod = vm.score_list[this.current_student_pos].$model;
                    vm.is_disable_input = score_mod.score.hasOwnProperty("current_process")&&score_mod.score.current_process!="";
                    vm.score = score_mod;
                    return true;
                },
                student_name_change: function (e) {
                    this.current_student_pos = Number(e.target.value);
                    if ($("#code_select").val() != e.target.value)
                        $("#code_select").select2("val", e.target.value)
                    if (this.current_student_pos == -1)
                        return;
                    var score_mod = vm.score_list[this.current_student_pos].$model;
                    vm.is_disable_input = score_mod.score.hasOwnProperty("current_process")&&score_mod.score.current_process!="";
                    vm.score = score_mod;
                    return true;
                },
                init: function () {
                    setTimeout(function (args) {
                        // -> 不同的身份，获取的班级，年级列表不一样
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name:"grade_name", value:["grade_id"]});
                        vm.change_grade(vm.grade_list[0], 0);
                        $("#code_select").select2();
                        $("#name_select").select2();
                        $("#code_select").on("select2:select", vm.student_code_change)
                        $("#name_select").on("select2:select", vm.student_name_change)
                    }, 0);
                },
                save_score: function () {

                    /**
                     * 'province', 'city', 'year_start', 'district', 'year_end', 'project'
                     */
                    var form = {};
                    form.fk_class_id = this.score.fk_class_id.toString();
                    form.fk_grade_id = this.score.fk_grade_id.toString();;
                    form.fk_school_id = this.score.fk_school_id.toString();;
                    form.city =  cloud.user_city();
                    form.guid = this.score.guid.toString();;
                    form.code = this.score.code;
                    form.province = cloud.user_province();
                    form.district = cloud.user_district();
                    form.project = this.form_list_score._id;
                    form.sex = this.score.sex.toString();;
                    form.year_start = time_2_str(semester_full[this.current_sems_index].start_date);
                    form.year_end = time_2_str(semester_full[this.current_sems_index].end_date);

                    for(var x = 0; x < this.headers.length; x++){
                        var for_sex= this.headers[x].for_sex;
                        var alias = this.headers[x].alias;
                        if(for_sex == this.score.sex){
                            if(this.score.score[alias].value<0){
                                toastr.error('成绩不能为负数')
                                return
                            }
                            form[alias]= this.score.score[alias].$model;
                        }
                    }

                    cloud.save_score_tz(form, function (url, args, data, is_suc, msg) {
                        if(is_suc){
                            toastr.success('保存成功')
                            window.location = "#school_health"
                        }else{
                            toastr.error(msg)
                        }

                    });
                },
                cancle:function () {
                    window.history.go(-1);
                }
            });


            vm.$watch('onReady', function () {
                vm.init();
            });
            //  vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });