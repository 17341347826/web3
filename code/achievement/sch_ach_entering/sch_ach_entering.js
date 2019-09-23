var VM = undefined;
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('achievement', 'sch_ach_entering/sch_ach_entering', 'html!'),
        C.Co('achievement', 'sch_ach_entering/sch_ach_entering', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "select2",
        C.CMF("formatUtil.js")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, select2, formatUtil) {

        var avalon_define = function (args) {
            var subject_id = args.sid;
            if (subject_id == undefined) {
                subject_id = "1000";
            }
            var semester_full = [];
            var student_list = [];
            var grade_list = [];
            var form = {
                fk_class_id: "",
                fk_grade_id: "",
                fk_school_id: "",
                phase: "",
                semester_id: "",
                subject_id: subject_id,
                province: "",
                city: "",
                district: "",
                class_name: "",
                grade_name: "",
            };
            form = $.extend(form, args);
            var province = "", class_name = "";
            var vm = avalon.define({
                $id: "sch_ach_entering",
                filter: {code: "", name: ""},
                subject_id: subject_id,
                form_list_score: form,
                current_student_pos: -1,
                headers: [],
                score_list:[],
                grade_list: [],
                class_list: [],
                strTime: '',
                sem_list: [],
                is_disable_input:false,
                count: act_count,
                // 当前编辑的学生成绩对象
                score_set:[],
                head_value: {grade: "请选择年级", class: "请选择班级", semester: "请选择学期"},
                init: function () {
                    setTimeout(function () {
                        vm.form_list_score.fk_school_id = String(cloud.user_depart_id());
                        grade_list = cloud.auto_grade_list({});
                        vm.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        //参数赋值
                        if(args && vm.first_enter){
                            var grade_index = vm.get_ary_index(vm.grade_list,'value',args.fk_grade_id);
                            vm.change_grade(vm.grade_list[grade_index], grade_index);
                        }else{
                            vm.change_grade(vm.grade_list[0], 0);
                        }
                        // vm.query_score();
                        //初始化学籍号和姓名模糊查询
                        $("#code_select").select2();
                        $("#name_select").select2();
                        $("#code_select").on("select2:select", vm.student_code_change);
                        $("#name_select").on("select2:select", vm.student_name_change)
                    }, 0);
                },
                inputLimits:function (e) {
                    e.currentTarget.value=e.currentTarget.value.replace(/^[0]+[0-9]*$/gi,"");
                    var limitNum = e.currentTarget.value.replace(/[^0-9.]+/g, "");
                    if(limitNum>=0&&limitNum<=100){
                        e.currentTarget.value = limitNum;
                    }else{
                        e.currentTarget.value = 100;
                    }
                },
                //根据值，查询在当前数组中的序号
                get_ary_index:function(ary,name,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(ary[i][name] == value){
                            return i;
                        }
                    }
                },
                change_grade: function (value, index) {
                    this.form_list_score.fk_grade_id = value.value;
                    var grade_ls = grade_list;
                    //清空班级列表和表头数据
                    student_list = [];
                    vm.headers = [];
                    // 获取班级列表
                    var ori_class = grade_ls[index].class_list;
                    var sel_class_ls = any_2_select(ori_class, {name: "class_name", value: ["class_id"]});
                    this.class_list = sel_class_ls;
                    // this.change_class(sel_class_ls[0], 0);

                    // 获取年级的学期列表
                    semester_full = cloud.grade_semester_list({grade_id: Number(value.value)});
                    this.sem_list = any_2_select(semester_full, {name: "semester_name", value: ["id"]});
                    // this.change_sems(this.sem_list[0], 0);
                    // 查询参数
                    //如果是修改，需要做数据回显
                    if(args && this.first_enter){
                        this.form_list_score.fk_class_id = args.fk_class_id;
                        this.form_list_score.class_name = args.class_name;
                        this.form_list_score.semester_id = args.semester_id;
                        this.form_list_score.phase = args.phase;
                    }else{
                        this.form_list_score.fk_class_id = sel_class_ls[0].value;
                        this.form_list_score.class_name = sel_class_ls[0].name;
                        this.form_list_score.semester_id = this.sem_list[0].value;
                        this.form_list_score.phase = (semester_full[0].semester_index - 1).toString();
                    }
                    // 修改对应显示信息
                    data_center.scope("score_edit_opt_grade", function (p) {
                        p.head_value =  vm.form_list_score.grade_name;
                    });
                    data_center.scope("score_edit_opt_class", function (p) {
                        p.head_value = vm.form_list_score.class_name;
                    });
                    if(this.first_enter){
                        data_center.scope("score_edit_opt_sem", function (p) {
                            p.head_value = args.sem_name;
                        });
                    }else{
                        data_center.scope("score_edit_opt_sem", function (p) {
                            p.head_value = semester_full[0].semester_name;
                        });
                    }
                    //请求数据
                    vm.query_score();
                },
                change_class: function (value, index) {
                    student_list = [];
                    vm.headers = [];
                    this.form_list_score.fk_class_id = value.value;
                    this.form_list_score.class_name = value.name;
                    this.query_score();
                },
                change_sems: function (value, index) {
                    this.form_list_score.semester_id = value.value;
                    this.form_list_score.phase = (semester_full[index].semester_index - 1).toString();
                    this.query_score();
                },
                student_code_change: function (e) {
                    const index = Number(e.target.value)
                    $("#name_select").val([index]).trigger("change");
                    var fm = JSON.parse(JSON.stringify(student_list[index]));
                    fm = $.extend(fm, fm.score);
                    this.score_set = [];
                    vm.is_disable_input = fm.hasOwnProperty("current_process")&&fm.current_process!="";
                    this.score_set.push(fm);
                    return true;
                },

                student_name_change: function (e) {
                    const index = Number(e.target.value);
                    $("#code_select").val([index]).trigger("change");
                    var fm = JSON.parse(JSON.stringify(student_list[index]));
                    fm = $.extend(fm, fm.score);
                    this.score_set = [];
                    vm.is_disable_input = fm.hasOwnProperty("current_process")&&fm.current_process!="";
                    this.score_set.push(fm);
                    return true;
                },
                //頁面首次：
                first_enter:true,
                //查询成绩
                query_score: function () {
                    this.filter.code = "";
                    this.filter.name = "";
                    cloud.class_score(this.form_list_score.$model, function (data, headers) {
                        vm.headers = headers;
                        student_list = data;
                        vm.score_list = [];
                        vm.score_list = student_list;
                        //判断是否刷新和首次进入
                        if(!vm.first_enter) return;
                        //判断是否编辑点击进去的
                        var xy_stu_code = sessionStorage.getItem('xy_stu_code');
                        if(xy_stu_code){
                            vm.first_enter = false;
                            var stu_name = xy_stu_code.split('|')[1];
                            var stu_guid =  xy_stu_code.split('|')[2];
                            var idx_code = vm.get_code_index(vm.score_list,'guid',stu_guid);
                            var stu_idx = idx_code.idx;
                            var stu_code =idx_code.code;
                            // $("#name_select").select2("val", xy_stu_code);
                            // $("#code_select").select2("val", xy_stu_code);
                            $("#select2-code_select-container").text(stu_code);
                            $('#select2-name_select-container').text(stu_name);
                            vm.current_student_pos = Number(stu_idx);
                            var fm = JSON.parse(JSON.stringify(student_list[vm.current_student_pos]));
                            fm = $.extend(fm, fm.score);
                            delete fm.score;
                            vm.score_set = [];
                            vm.is_disable_input = fm.hasOwnProperty("current_process")&&fm.current_process!="";
                            vm.score_set.push(fm);
                        }
                    });
                },
                //编辑进来的要去查询guid在当前成绩列表的序号和学籍号
                get_code_index:function(ary,name,value){
                    for(var i=0,len=ary.length;i<len;i++){
                        if(ary[i][name] == value){
                            return {idx:i,code:ary[i].code};
                        }
                    }
                },
                //取消
                back:function () {
                    window.history.back(-1);
                },
                save_score: function () {
                    var form = this.score_set.$model[0];
                    form.phase = this.form_list_score.phase;
                    form.semester_id = this.form_list_score.semester_id;
                    form.subject_id = this.form_list_score.subject_id;
                    form.grade_name = this.form_list_score.grade_name;
                    form.district = cloud.user_district();
                    form.province = cloud.user_province();
                    form.city = cloud.user_city();
                    form.class_name = this.form_list_score.class_name;
                    for(var i=0,len=this.headers.length;i<len;i++){
                        var col_name = this.headers[i].alias;
                        //nor-分数，pass-合格、不合格，ABCD-等级
                        var col_type = this.headers[i].score_type;
                        if(form[col_name].value === ''){
                            form[col_name] = {};
                        }
                        if(col_type == 'nor'){
                            // if(form[col_name].value==''){
                            //     toastr.info('请填入成绩');
                            //     return
                            // }
                            if(form[col_name].value<0 && form[col_name].value != ''){
                                toastr.info('成绩不能为负数');
                                return;
                            }
                            if(subject_id == '10000'){//艺术测评
                                if(form[col_name].value>110  && form[col_name].value != ''){
                                    toastr.info('成绩不能大于110');
                                    return;
                                }
                            }else{//学业成绩
                                if(form[col_name].value>100  && form[col_name].value != ''){
                                    toastr.info('成绩不能大于100');
                                    return;
                                }
                            }
                        }
                    }
                    cloud.save_score_xy(form, function (url, args, data, is_suc, msg) {
                        if(is_suc){
                            toastr.success('数据录入成功');
                            window.history.back(-1);
                        }else {
                            toastr.error(msg);
                        }
                    });
                }
            });

            VM = vm;

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