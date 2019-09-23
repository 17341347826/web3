/**
 * Created by Administrator on 2018/6/21.
 */
define([
        "jquery",
        C.CLF('avalon.js'),"date_zh",
        C.Co("eval_param_set", "e_task_control/health_project_edit/health_project_edit", "css!"),
        C.Co("eval_param_set", "e_task_control/health_project_edit/health_project_edit", "html!"),
        C.CMF("data_center.js"),"layer"],
    function ($, avalon,date_zh, css, html, data_center,layer) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //查询方案
        var api_get_project_list=api.api+"score/list_solu";
        //创建
        var api_save_health_project_new=api.api+"score/health_project_edit";
        // 查看详情
        var api_detail = api.api + "score/health_project_detail"

        var avalon_define = function (pms) {
            var new_health_item = avalon.define({
                $id: "health_project_edit",
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
                grade_map_pmx:{
                    "1":"一年级",
                    "2":"二年级",
                    "3":"三年级",
                    "4":"四年级",
                    "5":"五年级",
                    "6":"六年级",
                    "7":"七年级",
                    "8":"八年级",
                    "9":"九年级",
                    "10":"高一",
                    "11":"高二",
                    "12":"高三",

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
                temp:{},
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
                init:function(){
                    ajax_post(api_detail, pms, this)
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
                            new_health_item.add_data.start = e.currentTarget.value;
                        });
                },
                //结束时间
                get_end_date:function () {
                    $('#end_time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            new_health_item.add_data.end = e.currentTarget.value;
                        });
                },
                get_detail_conplete:function(data){
                    this.add_data=data.data;
                    this.temp = data.data
                    this.project_data.due_grade=data.data.due_grade;
                    ajax_post(api_get_project_list,this.project_data,this);


                },
                //取消
                cancel_btn:function(){
                    window.location="#health_project_mana"
                },
                save_click:function () {
                    if(!$.trim(this.add_data.name)){
                        toastr.warning("项目名称不能为空")
                        return false;
                    }
                    if(!$.trim(this.add_data.due_grade)){
                        toastr.warning("适用年级不能为空")
                        return false;
                    }
                    if(!$.trim(this.add_data.solution._id)){
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
                    ajax_post(api_save_health_project_new,{"_id":this.add_data._id,"name":this.add_data.name,"due_grade":this.add_data.due_grade,
                        "solution":this.add_data.solution._id,
                        "start":this.add_data.start,
                        "end":this.add_data.end},this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_detail:
                                this.get_detail_conplete(data)
                                break;
                            //获取年级
                            case api_get_grade:
                                this.grade_arr=data.data;
                                break;
                            //获取方案
                            case api_get_project_list:
                            {
                                this.solution_arr=data.data;
                                this.add_data = this.temp.$model;
                                this.grade_name = this.grade_map_pmx[this.add_data.due_grade]
                            }


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
            new_health_item.$watch('onReady', function() {
                this.get_grade();
                $('#start_time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
                $('#end_time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
            });
            new_health_item.init()
            return new_health_item;
        };
        return {
            view: html,
            define: avalon_define
        }
    });