/**
 * Created by Administrator on 2018/6/25.
 */
define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'term_new_result/term_new_result','html!'),
        C.Co('eval_param_set', 'term_new_result/term_new_result','css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon,layer, html,css, data_center,select_assembly,three_menu_module) {
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "term_new_result",
                data:{
                    ca_end_semester:"",
                    ca_endtime:"2018-4-03",
                    ca_grade:"",
                    ca_gradeid:"",
                    ca_name:"初2017级七年级(上)学生综合素质评价",
                    ca_remark:"2017-2018学年上",
                    ca_semester:"",
                    ca_start_semester:"",
                    ca_starttime:"2017-9-01",
                    semester_id:"",
                    list:[]
                },
                statistics_data:{
                    arr_school_id:"",
                    city:"",
                    end_time:"",
                    fk_grade_id:"",//number
                    fk_unit_id:"",//规则创建者的单位id number
                    grade_no:"",//实际年级7 7初一 8初二 9初三 number
                    project_id:"",//number
                    semester_id:"",
                    start_time:""
                },
                work_id:"",
                grade_list:[],
                sem_list:[],
                init: function () {
                    var login_level = cloud.user_level();
                    this.user_level = login_level;
                    this.statistics_data.city = cloud.user_city();
                    this.statistics_data.fk_unit_id = cloud.user_school_id();
                    var dataList = [];
                    if(login_level == 4){
                        var school_name = cloud.user_school();
                        var school_id = cloud.user_school_id();
                        this.work_id = school_id;
                        this.statistics_data.arr_school_id = school_id + '';
                        this.data.list = [
                            {school_id:school_id,school_name:school_name}
                        ];
                        var auto_grade_list = cloud.auto_grade_list();
                        dataList = any_2_select(auto_grade_list, {name: "grade_name", value: ["grade_id","remark"]});
                    }else{
                        var list = cloud.school_list();
                        var length = list.length;
                        var str = '';
                        for(var i = 0; i < length; i++){
                            var obj = {school_id:"",school_name:""};
                            obj.school_id = list[i].id;
                            str +=  list[i].id + ',';
                            obj.school_name = list[i].schoolname;
                            vm.data.list.push(obj);
                        }
                        str = str.substring(0,str.length-1);
                        this.statistics_data.arr_school_id = str;
                        dataList = cloud.grade_all_list_remark();
                    }
                    this.grade_list = dataList;
                    this.data.ca_grade = this.grade_list[0].name;
                    var g_value = this.grade_list[0].value;
                    this.data.ca_gradeid = g_value.split("|")[0];
                    this.statistics_data.fk_grade_id = g_value.split("|")[0];
                    var remark = g_value.split("|")[1];
                    this.re_remark(remark);
                    var semester = cloud.grade_semester_list({grade_id:vm.data.ca_gradeid});
                    this.sem_list = any_2_select(semester, {name: "semester_name", value: ["start_date","end_date","id"]});
                    this.data.ca_semester = this.sem_list[0].name;
                    var date = this.sem_list[0].value;
                    this.data.semester_id = date.split("|")[2];
                    this.statistics_data.semester_id = date.split("|")[2];
                    var s_date = date.split("|")[0];
                    var e_date = date.split("|")[1];
                    this.data.ca_start_semester = time_2_str(s_date);
                    this.data.ca_end_semester = time_2_str(e_date);
                    // this.data.ca_starttime = time_2_str(s_date);
                    // this.data.ca_endtime = time_2_str(e_date);
                    this.statistics_data.start_time = time_2_str(s_date);
                    this.statistics_data.end_time = time_2_str(e_date);
                },
                re_remark:function (remark) {
                    switch (remark){
                        case '九年级':
                            vm.statistics_data.grade_no = 9;
                            break;
                        case '八年级':
                            vm.statistics_data.grade_no = 8;
                            break;
                        case '七年级':
                            vm.statistics_data.grade_no = 7;
                            break;
                    }
                },
                data_arr:[],
                click:function () {
                    cloud.add_count_analysis(this.data.$model,function (url, ars, data) {
                        vm.statistics_data.project_id = data;
                    });
                    // cloud.check_pro({ca_gradeid:Number(vm.statistics_data.fk_grade_id),ca_workid:vm.work_id,ca_state:'',offset:0,rows:999},function (url, ars, data) {
                    //     var dataList = data.list;
                    //     var obj = {
                    //         ca_semester:vm.data.ca_semester,
                    //         ca_grade:vm.data.ca_grade,
                    //         ca_start_semester:vm.data.ca_start_semester,
                    //         ca_end_semester:vm.data.ca_end_semester
                    //     };
                    //     dataList.unshift(obj);
                    //     vm.data_arr = dataList;
                    // })
                },
                start:function () {
                    //unit_lv  统计时采用的规则创建人单位等级 1省 2 市 3 区 4 学校
                    cloud.edit_project_control({city:vm.statistics_data.city,fk_grade_id:Number(vm.statistics_data.fk_grade_id),fk_unit_id:vm.work_id,unit_lv:4},function (url, ars, data) {
                        cloud.score_statistics(vm.statistics_data.$model,function (url, ars, data) {
                        })

                    });

                },
                change_grade:function (el) {
                    this.data.ca_grade = el.name;
                    var g_value = el.value;
                    this.data.ca_gradeid = g_value.split("|")[0];
                    this.statistics_data.fk_grade_id = g_value.split("|")[0];
                    var remark = g_value.split("|")[1];
                    this.re_remark(remark);
                },
                change_sem:function (el) {
                    var value = el.value;
                    var s_date = value.split("|")[0];
                    var e_date = value.split("|")[1];
                    this.data.semester_id = value.split("|")[2];
                    this.statistics_data.semester_id =this.data.semester_id;
                    this.data.ca_start_semester = time_2_str(s_date);
                    this.data.ca_end_semester = time_2_str(e_date);
                    // this.data.ca_starttime = time_2_str(s_date);
                    // this.data.ca_endtime = time_2_str(e_date);
                    this.statistics_data.start_time = time_2_str(s_date);
                    this.statistics_data.end_time = time_2_str(e_date);
                }
            });
            vm.$watch('onReady', function(){
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });