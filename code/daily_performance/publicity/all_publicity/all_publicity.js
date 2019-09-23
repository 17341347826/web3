/**
 * Created by Administrator on 2018/6/9.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_performance', 'publicity/all_publicity/all_publicity','html!'),
        C.Co('daily_performance', 'publicity/all_publicity/all_publicity','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        //公示汇总
        var api_get_list = api.api + "score/count_publicity";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "all_publicity",
                name_code:"",
                dataList:[],
                //判断数据加载中还是暂无数据:false-数据加载中，true-数据接口返回成功
                data_had:false,
                level:"",
                head_value:{
                    grade:"",
                    class:""
                },
                data:{
                    fk_school_id:"",
                    fk_grade_id:"",
                    fk_class_id:"",
                    stu_name:"",
                    stu_code:""
                },
                request_data:{
                    fk_class_id:"",
                    student_name__icontains:"",
                    student_num__icontains:""
                },
                all_grade:[],
                grade_list:[],
                class_list:[],
                init:function () {
                    var login_level = cloud.user_level();
                    this.level = login_level;
                    this.data.fk_school_id = cloud.user_school_id();
                    var grade_all_list = [];
                    var class_ = [];
                    if(login_level == 6){//教师
                        this.all_grade = cloud.lead_class_list();
                        grade_all_list = cloud.lead_class_list();
                        class_ = this.all_grade[0].class_list;
                        this.class_x(class_);
                        grade_all_list = any_2_select(grade_all_list, {name: "grade_name", value: ["grade_id"]});
                        this.grade_list = grade_all_list;
                        this.head_value.grade = this.grade_list[0].name;
                        this.data.fk_grade_id = this.grade_list[0].value;
                    }else if(login_level == 7){//学生
                        this.data.grade_id = cloud.user_grade_id();
                        this.data.fk_class_id = cloud.user_class_id();
                        this.check();
                    }else if(login_level == 4){
                        this.all_grade = cloud.auto_grade_list();
                        grade_all_list = cloud.auto_grade_list();
                        grade_all_list = any_2_select(grade_all_list, {name: "grade_name", value: ["grade_id"]});
                        this.grade_list = grade_all_list;
                        this.head_value.grade = this.grade_list[0].name;
                        class_ = this.all_grade[0].class_list;
                        this.class_x(class_);
                    }
                },
                check:function () {
                    this.request_data.fk_class_id = this.data.fk_class_id;
                    this.request_data.student_name__icontains = this.data.stu_name;
                    this.request_data.student_num__icontains = this.data.stu_code;
                    layer.load(1, {shade:[0.3,'#121212']});
                    this.data_had = false;
                    ajax_post(api_get_list,this.request_data.$model,this);
                },
                class_x:function (arr) {
                    this.class_list = [];
                    var te_class = arr;
                    for(var i = 0; i < te_class.length; i++){
                        var obj = {name:"",value:""};
                        obj.value = te_class[i].class_id;
                        obj.name = te_class[i].class_name;
                        this.class_list.push(obj);
                    }
                    this.head_value.class = this.class_list[0].name;
                    this.data.fk_class_id = this.class_list[0].value;
                    this.check();
                },
                change_grade:function (el) {
                    this.data.fk_grade_id = Number(el.value);
                    if(this.level != 7 ){//教师
                        var grade = this.all_grade.$model;
                        var length = grade.length;
                        if(length > 1){
                            for(var i = 0; i < length; i++){
                                if(this.data.fk_grade_id == grade[i].grade_id){
                                    var class_x = grade[i].class_list;
                                }
                            }
                            this.class_x(class_x);
                        }

                    }
                },
                change_class:function (el) {
                    this.data.fk_class_id = Number(el.value);
                    this.check();
                },
                refresh_data:function () {
                    var value = this.name_code;
                    var han = /^[\u4e00-\u9fa5]+$/;
                    if (han.test(value)) {
                        this.data.stu_name = value;
                    }else{
                        this.data.stu_code = value;
                    }
                    this.check();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_list:
                                this.complete_get_list(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_list:function (data) {
                    this.data_had = true;
                    layer.closeAll();
                    this.dataList = data.data;
                }
            });
            vm.$watch('onReady', function () {
                vm.init();
            });

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });