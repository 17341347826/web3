define(["jquery",C.CLF('avalon.js'),'layer',"date_zh",
        C.Co("evaluation_material/stu_evaluation","evaluation","css!"),
        C.Co("evaluation_material/stu_evaluation","teacher_add_evaluation/teacher_add_evaluation","css!"),
        C.Co("evaluation_material/stu_evaluation","teacher_add_evaluation/teacher_add_evaluation","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM("table")],
    function($,avalon, layer, date_zh,css,css1, html, x, data_center,page_title,tab) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //是否可以创建项目
        var api_is_add_obj=api.api+"Indexmaintain/indexmaintain_findbyevaluateprodates";
        //添加评价项目
        var api_add_plan=api.api+"Indexmaintain/indexmaintain_addEvaluatePro";
        //查询参考方案
        var api_get_refer=api.api+"Indexmaintain/indexmaintain_findByRefer";
        //修改-查询
        var api_check_item=api.api+"Indexmaintain/indexmaintain_findByEvaluateProInfo";
        //提交修改评价项目
        var api_save_update=api.api+"Indexmaintain/indexmaintain_updateEvaluatePro";
        //添加模块时间
        var api_save_module = api.api+'everyday/save_module_switch';
        var avalon_define = function(pxm) {
            var vm = avalon.define({
                $id: "teacher_add",
                url:"",
                id:"",
                type:"",
                num:"",
                first_table_list:[],
                second_table_list:[],
                second_table_list_value_list:[],
                //年级信息
                grade_info:"",
                //方案类型
                plan_type:"",
                //查询参考方案
                reference_scheme_arr:"",
                //点击获得参考方案
                reference_arr:"",
                // 请求参数
                request_data: {
                    id:"",
                    pro_name:"",
                    //(1:省2:市3:区县4:校)
                    pro_rank:4,
                    pro_grade:"",
                    pro_gradeid:"",
                    pro_plan:"",
                    pro_plan_id:"",
                    pro_start_time:"",
                    pro_end_time:"",
                    pro_type:3,
                    plan_level:"",//方案级别（1:上级 2:校级
                    evaluate_mode:""//1 按学生评价 2 按考查项评价
                },
                is_add_data:{
                    pro_end_time:"",
                    pro_gradeid:"",
                    pro_start_time:"",
                    pro_type:3,
                    pro_workid:""
                },
                response_data:{
                    //适用年级
                    grade_arr:""
                },
                //防止重复提交问题:true-首次提交，false-重复提交，不能点击
                btn_had:true,
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                        var dataList=JSON.parse(data.data['user']);
                        self.is_add_data.pro_workid=Number(dataList.fk_school_id);
                    });
                    self.is_init = true;
                },
                //年级转换
                grade_remark:function(name){
                    if(name == '七年级') return '7';
                    if(name == '八年级') return '8';
                    if(name == '九年级') return '9';
                },
                //修改项目
                get_id:function () {
                    this.id=pxm.get_teacher_id;
                    this.request_data.id=pxm.get_teacher_id;
                },
                check_item:function () {
                    ajax_post(api_check_item,{id:this.id},this);
                },
                get_grade:function () {
                    ajax_post(api_get_grade,{status:"1"},this);
                },
                //方案类型
                type_click:function () {
                    this.request_data.plan_type=this.plan_type;
                },
                //应用年级
                get_apply_grade:function () {
                    var grade=this.grade_info;
                    var plan_grade=grade.split("|")[0];
                    var id = this.grade_remark(grade.split('|')[0]);
                    ajax_post(api_get_refer,{plan_grade:id,plan_subject:"教师评价"},this);
                },
                //选用方案
                get_reference_scheme:function () {
                    var reference=this.reference_arr;
                    this.request_data.pro_plan= reference.split("|")[0];
                    this.request_data.pro_plan_id= Number(reference.split("|")[1]);
                    this.request_data.plan_level= Number(reference.split("|")[2]);
                },
                //开始时间
                get_start_date:function () {

                    $('#start_time_input')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            if(vm.request_data.pro_end_time != '' && vm.request_data.pro_end_time == e.currentTarget.value){
                                toastr.warning('开始时间需要小于结束时间');
                                vm.request_data.pro_start_time = '';
                                vm.is_add_data.pro_start_time= '';
                            }else{
                                vm.request_data.pro_start_time = e.currentTarget.value;
                                vm.is_add_data.pro_start_time = e.currentTarget.value;
                            }
                        });
                    if(vm.request_data.pro_end_time!=''){
                        $('#start_time_input').datetimepicker('setEndDate', vm.request_data.pro_end_time);
                    }
                },
                //结束时间
                get_end_date:function () {
                    $('#end_time_input')
                        .datetimepicker()
                        .on('changeDate', function(e){
                            if(vm.request_data.pro_start_time != '' && vm.request_data.pro_start_time == e.currentTarget.value){
                                toastr.warning('结束时间需要大于结束开始时间');
                                vm.request_data.pro_end_time = '';
                                vm.is_add_data.pro_end_time= '';
                            }else{
                                vm.request_data.pro_end_time = e.currentTarget.value;
                                vm.is_add_data.pro_end_time = e.currentTarget.value;
                            }
                        });
                    if( vm.request_data.pro_start_time!=''){
                        $('#end_time_input').datetimepicker('setStartDate',  vm.request_data.pro_start_time);
                    }
                },
                // //取消
                // cancel_click:function () {
                //     window.location="#teacher_evaluation";
                // },
                //取消
                cancel_click:function(){
                    this.request_data.pro_name='';
                    this.grade_info='';
                    this.request_data.pro_start_time='';
                    this.request_data.pro_end_time='';
                    this.reference_arr='';
                    window.location = '#teacher_evaluation?grade_id='+pxm.grade_id+'&is_switch='+pxm.is_switch+
                    '&module_type='+pxm.module_type;
                },
                //添加
                add_click:function () {
                    var grade=this.grade_info;
                    if(this.reference_arr.length==0){
                        toastr.warning("请选择方案");
                    }else if(this.request_data.pro_start_time==''){
                        toastr.warning("请选择开始时间");
                    }else if(this.request_data.pro_end_time==''){
                        toastr.warning("请选择结束时间");
                    }else if(this.request_data.evaluate_mode == 0){
                        toastr.warning('请选择评价类型')
                    }
                    else{
                        this.request_data.pro_grade=grade.split("|")[0];
                        this.is_add_data.pro_gradeid=Number(grade.split("|")[1]);
                        this.request_data.pro_gradeid=Number(grade.split("|")[1]);
                        if(this.id){//修改
                            if(this.btn_had){
                                ajax_post(api_save_update,this.request_data,this);
                                this.btn_had = false;
                                //模块时间
                                // ajax_post(api_save_module,{
                                //     end_time:this.request_data.pro_end_time,
                                //     grade_id:pxm.grade_id,
                                //     is_switch:pxm.is_switch,
                                //     module_type:pxm.module_type,
                                //     start_time:this.request_data.pro_start_time,
                                // },this);
                            }
                        }else{
                            ajax_post(api_is_add_obj,this.is_add_data,this);
                            //模块时间
                            // ajax_post(api_save_module,{
                            //     end_time:this.is_add_data.pro_end_time,
                            //     grade_id:pxm.grade_id,
                            //     is_switch:pxm.is_switch,
                            //     module_type:pxm.module_type,
                            //     start_time:this.is_add_data.pro_start_time,
                            // },this);
                        }

                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //是否可以添加
                            case api_is_add_obj:
                                this.complete_is_add_obj(data);
                                break;
                            //添加
                            case api_add_plan:
                                this.complete_add_plan(data);
                                break;
                            //查询参考方案
                            case api_get_refer:
                                this.complete_get_refer(data);
                                break;
                            //修改-查询
                            case api_check_item:
                                this.complete_check_item(data);
                                break;
                            //提交修改
                            case api_save_update:
                                this.complete_save_update(data);
                                break;
                        //        模块时间
                            case api_save_module:
                                break;
                        }
                    } else {
                        if(cmd == api_add_plan || cmd == api_save_update){
                            this.btn_had = true;
                        }
                        toastr.error(msg)
                    }
                },
                //年级名称
                grade_name:'',
                complete_get_grade:function (data) {
                    this.response_data.grade_arr=data.data;
                    var grade_id = pxm.grade_id;
                    for(var i=0;i<data.data.length;i++){
                        var id = data.data[i].id;
                        if(id == grade_id){
                            this.grade_info = data.data[i].remark+'|'+data.data[i].id;
                            this.grade_name = data.data[i].remark;
                        }
                    }
                    var grade=this.grade_info;
                    var plan_grade_id=grade.split("|")[1];
                    var id = this.grade_remark(grade.split('|')[0]);
                    ajax_post(api_get_refer,{plan_gradeid:id,plan_subjectid:3,plan_check_state:2},this);
                },
                complete_get_refer:function (data) {
                    this.reference_scheme_arr=data.data;
                    if (vm.id) { /*有id是修改*/
                        vm.check_item();
                    }
                },
                complete_is_add_obj:function (data) {
                    if(data.data.state==0){
                        if(this.btn_had){
                            ajax_post(api_add_plan,this.request_data,this);
                            this.btn_had = false;
                        }
                    }else{
                        toastr.warning("不能创建该项目,因为当前时间段已有同类型项目")
                    }
                },
                complete_add_plan:function (data) {
                    window.location="#teacher_evaluation?grade_id="+pxm.grade_id+'&is_switch='+pxm.is_switch+
                    '&module_type='+pxm.module_type;
                },
                complete_save_update:function (data) {
                    window.location="#teacher_evaluation?grade_id="+pxm.grade_id+'&is_switch='+pxm.is_switch+
                        '&module_type='+pxm.module_type;
                },
                complete_check_item:function (data) {
                    this.request_data.pro_name=data.data.pro_name;
                    this.request_data.pro_rank=data.data.pro_rank;
                    //适用年级
                    this.grade_info=data.data.pro_grade+'|'+data.data.pro_gradeid;
                    //评价方案
                    this.request_data.evaluate_mode = data.data.evaluate_mode;
                    //选用方案
                    this.reference_arr=data.data.pro_plan+'|'+data.data.pro_plan_id + '|' + data.data.plan_level;
                    this.request_data.pro_plan=data.data.pro_plan;
                    this.request_data.pro_plan_id=data.data.pro_plan_id;

                    this.request_data.pro_end_time=data.data.pro_end_time;
                    this.request_data.pro_start_time=data.data.pro_start_time;

                    this.is_add_data.pro_end_time=data.data.pro_end_time;
                    this.is_add_data.pro_start_time=data.data.pro_start_time;




                }

            });
            vm.$watch('onReady', function() {
                this.cb();
                this.get_grade();
                this.get_id();
                $('#end_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
                $('#start_time_input').datetimepicker({
                    format: 'yyyy-mm-dd hh:ii',
                    language:  'zh-CN'
                });
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });