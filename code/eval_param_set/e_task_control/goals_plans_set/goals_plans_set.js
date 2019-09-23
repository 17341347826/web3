/**
 * Created by Administrator on 2018/6/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co('eval_param_set', 'e_task_control/goals_plans_set/goals_plans_set', 'html!'),
        C.Co('eval_param_set', 'e_task_control/goals_plans_set/goals_plans_set', 'css!'),
        C.CMF("data_center.js")
    ],
    function ($,avalon, layer,date_zh, html, css, data_center) {
        //获取年级
        var api_get_grade = api.api + "base/grade/findGrades.action";
        //查询单个模块时间
        var api_module_switch=api.api+'everyday/get_module_switch';
        //添加或者修改
        var api_add_or_update=api.api+"everyday/save_module_switch";
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "goals_plans_set",
                //年级列表
                grade_list: [],
                //添加/修改时间设置参数
                date_req:{
                    //年级id
                    grade_id:'',
                    //结束时间
                    end_time:'',
                    //是否启用	boolean	true 开启 (默认)false关闭
                    is_switch:'',
                    //模块类型	string	1自我描述,2同学寄语,3家长寄语,4教师寄语,5目标与计划,6实现情况,7民主评价-自评，8民主评价-互评
                    module_type:'',
                    //开始时间 2017-01-01 00:00:00
                    start_time:'',
                },
                //提交防止重复提交
                btn_has:true,
                init: function () {
                    this.get_grade();
                    if(pmx.is_switch==0){
                        this.date_req.is_switch  = false;
                    }else{
                        this.date_req.is_switch  = true;
                    }
                    this.date_req.module_type= Number(pmx.module_type);
                    this.date_req.start_time = pmx.start_time;
                    this.date_req.end_time   = pmx.end_time;
                    this.date_req.grade_id   = pmx.grade_id;
                },
                //获取年级数据
                get_grade: function () {
                    ajax_post(api_get_grade, {status: "1"}, this);
                },
                //开始时间
                update_start_time:function () {
                    $('#update-start-time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            vm.date_req.start_time = e.currentTarget.value;
                        });
                    $('#update-start-time').datetimepicker('setEndDate', vm.date_req.end_time);
                },
                //结束时间
                update_end_time:function () {
                    $('#update-end-time')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            vm.date_req.end_time = e.currentTarget.value;
                        });
                    $('#update-end-time').datetimepicker('setStartDate', vm.date_req.start_time);
                },
                //年级改变
                grade_change: function () {


                },
                //保存
                save_data:function(){
                    if(this.date_req.grade_id==''){
                        toastr.warning('请选择年级');
                        return;
                    }else if(this.date_req.start_time==''){
                        toastr.warning('请设置开始时间');
                        return;
                    }else if(this.date_req.end_time==''){
                        toastr.warning('请设置结束时间');
                        return;
                    }else if(this.btn_has){
                        // if(val==1){//新增
                        //     this.modal_data.is_switch = true;
                        //     this.index=1;
                        // }else{//修改
                        //     this.modal_data.is_switch = this.old_is_switch;
                        //     this.index=2
                        // }
                        this.btn_has = false;
                        ajax_post(api_add_or_update,this.date_req.$model,this);
                    }
                },
                //取消
                cancel_click:function(){
                    window.location='#task_control_list?grade_id='+this.date_req.grade_id;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                        // //        查询单个模块时间
                        //     case api_module_switch:
                        //         this.complete_module_switch(data);
                        //         break;
                        //        添加模块时间
                            case api_add_or_update:
                                this.complete_add_update(data);
                                break;
                        }
                    } else {
                        if(cmd == api_add_or_update){
                            this.btn_has = true;
                        }
                        toastr.error(msg)
                    }
                },
                complete_get_grade:function(data){
                    this.grade_list = data.data;
                    //查询单个模块时间
                    // ajax_post(api_module_switch,{module_type:5},this);
                },
                complete_add_update:function(data){
                    toastr.success('设置成功！');
                    window.location='#task_control_list?grade_id='+this.date_req.grade_id;
                },
            });
            vm.$watch('onReady', function () {
                this.init();
                $('#update-end-time').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language: 'zh-CN'
                });
                $('#update-start-time').datetimepicker({
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
