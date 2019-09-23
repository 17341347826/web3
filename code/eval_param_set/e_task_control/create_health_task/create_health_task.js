/**
 * Created by Administrator on 2018/6/1.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co('eval_param_set', 'e_task_control/create_health_task/create_health_task', 'html!'),
        C.Co('eval_param_set', 'e_task_control/create_health_task/create_health_task', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CM("three_menu_module")
    ],
    function ($,avalon, layer,date_zh, html, css, data_center, select_assembly,three_menu_module) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询方案
        var api_get_project_list=api.api+"score/list_solu";
        //创建
        var api_save_health_project_new=api.api+"score/health_project_add";
        var avalon_define = function (pxm) {
            var vm = avalon.define({
                $id: "create_health_task",
                grade_arr:[],
                grade_name:"",
                solution_arr:[],
                solution_id:"",
                grade_pmx:{
                    "一年级":{id:1},
                    "二年级":{id:2},
                    "三年级":{id:3},
                    "四年级":{id:4},
                    "五年级":{id:5},
                    "六年级":{id:6},
                    "七年级":{id:7},
                    "八年级":{id:8},
                    "九年级":{id:9},
                    "高一":{id:10},
                    "高二":{id:11},
                    "高三":{id:12}
                },
                form: {
                    name:"",
                    // 开始时间
                    start:"",
                    // 结束时间
                    end:"",
                    // 适用年级
                    due_grade: "",
                    sole:"",
                },
                project_data:{
                    //年级
                    due_grade:""
                },
                add_data: {
                    //项目名
                    name:"",
                    // 开始时间
                    start:"",
                    // 结束时间
                    end:"",
                    // 适用年级
                    due_grade: "",
                    // 解决方案ID
                    solution:""
                },
                //获取年级
                get_grade:function () {
                    ajax_post(api_get_grade,{status:"1"},this);
                },
                get_grade_id:function () {
                    var grade_name=this.grade_name;
                    if(grade_name==0){
                        toastr.warning("请选择年级");
                    }else{
                        this.project_data.due_grade=this.grade_pmx[grade_name].id.toString();
                        this.add_data.due_grade=this.grade_pmx[grade_name].id.toString();
                        ajax_post(api_get_project_list,this.project_data,this);
                    }
                },
                //开始时间
                get_start_date:function () {
                    $('#start_time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            vm.add_data.start = e.currentTarget.value;
                        });
                },
                //结束时间
                get_end_date:function () {
                    $('#end_time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            vm.add_data.end = e.currentTarget.value;
                        });
                },
                //保存
                save_click:function () {
                    if(!$.trim(this.add_data.due_grade)){
                        toastr.warning("适用年级不能为空")
                        return false;
                    }
                    if(!$.trim(this.add_data.name)){
                        toastr.warning("项目名称不能为空")
                        return false;
                    }
                    if(!$.trim(this.add_data.solution)){
                        toastr.warning("方案不能为空")
                        return false;
                    }
                    if(!$.trim(this.add_data.start)){
                        toastr.warning("开始时间不能为空")
                        return false;
                    }
                    if(!$.trim(this.add_data.end)){
                        toastr.warning("结束时间不能为空")
                        return false;
                    }
                    ajax_post(api_save_health_project_new,this.add_data,this);
                },
                //取消
                cancel_btn:function(){
                    history.go(-1);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.grade_arr=data.data;
                                break;
                            //获取方案
                            case api_get_project_list:
                                this.solution_arr=data.data;
                                break;
                            //添加
                            case api_save_health_project_new:
                                this.complete_save_health_project_new(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_save_health_project_new:function (data) {
                    toastr.success("添加成功");
                    window.setTimeout(function () {
                        window.location="#health_project_mana";
                    },3000)
                }
            });
            vm.$watch('onReady', function () {
                this.get_grade();
                $('#end_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
                $('#start_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
            });
            // vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
