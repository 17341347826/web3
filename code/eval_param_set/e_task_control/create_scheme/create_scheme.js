/**
 * Created by Administrator on 2018/5/31.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        "date_zh",
        C.Co('eval_param_set', 'e_task_control/create_scheme/create_scheme', 'html!'),
        C.Co('eval_param_set', 'e_task_control/create_scheme/create_scheme', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        C.CMF("router.js"),C.CM('page_title'),C.CM("table")
    ],
    function ($,avalon, layer,date_zh, html, css, data_center, select_assembly, x,page_title,tab) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //添加方案
        var api_add_plan=api.api+"Indexmaintain/add_county_plan";
        //查询参考方案
        var api_get_refer=api.api+"Indexmaintain/indexmaintain_findByRefer";
        //查询方案内容
        var api_get_plan_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //获取学校类别
        var api_get_school_type = api.api+"base/schoolproperty/dept_sp";
        var avalon_define = function(pxm) {
            var vm = avalon.define({
                $id: "create_scheme",
                url:"",
                type:"",
                num:"",
                first_table_list:[],
                second_table_list:[],
                second_table_list_value_list:[],
                plan_content:"",
                //学校信息
                school_info:"",
                //年级信息
                grade_info:"",
                //方案类型
                plan_type:"",
                //查询参考方案
                reference_scheme_arr:"",
                //点击获得参考方案
                reference_arr:"",
                //学校数组
                school_list:[],
                // 请求参数
                request_data: {
                    plan_check_state:2,//1:待审核 2:审核通过 3:审核不通过
                    plan_grade:"",
                    plan_gradeid:"",//number
                    plan_name:"",
                    //参考方案
                    plan_refer:"",
                    plan_referid:"",//number
                    //方案适用学校类别(必填)
                    plan_school_type:"",
                    //方案适用学校类别id
                    plan_school_typeid:"",//number
                    plan_subject:"1",//4:全部 1学生自评  2学生互评  3教师评价
                    plan_subjectid:"1",//评价主体id(必填)
                    //1:启用 2:停用
                    plan_use_state:"",//number
                    //方案类型
                    plan_type:""//number 1:选项 2:直接打分
                },
                request_save_plan:{
                    fk_plan_id:"",
                    sub_subject:[],
                    sub_subjectid:[]
                },
                response_data:{
                    //适用年级
                    grade_arr:""
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                    });
                    self.is_init = true;
                    ajax_post(api_get_school_type,{},self);
                },
                get_grade:function () {
                    ajax_post(api_get_grade,{status:"1"},this);
                },
                //方案类型
                type_click:function () {
                    this.request_data.plan_type=this.plan_type;
                    var grade_info=this.grade_info;
                    var plan_type=this.plan_type;
                    var grade = grade_info.split("|")[0];
                    var plan_subject_id = Number(grade_info.split("|")[1]);
                    if(grade_info.length!=0 &&plan_subject_id!=0 && grade_info!="请选择" && plan_type!=0 && this.school_info!=0){
                        ajax_post(api_get_refer,{plan_gradeid:plan_subject_id,plan_subjectid:this.request_data.plan_subjectid,plan_type:this.request_data.plan_type,plan_school_typeid:this.request_data.plan_school_typeid},this);
                    }
                },
                //适用年级
                get_apply_grade:function () {
                    var plan_subject=this.request_data.plan_subject;

                        var grade_info=this.grade_info;
                        var plan_type=this.plan_type;
                        grade = Number(grade_info.split("|")[1]);
                        if(plan_subject.length!=0 && plan_subject!="请选择" && grade_info!="请选择" && plan_type!=0 && this.school_info!=0){
                            ajax_post(api_get_refer,
                                {plan_gradeid:grade,
                                    plan_subjectid:this.request_data.plan_subjectid,
                                    plan_type:this.request_data.plan_type,
                                    plan_school_typeid:this.request_data.plan_school_typeid
                                },this);


                    }
                },
                // 适用评价主体
                get_apply_subject:function () {
                    var plan_subject_id=this.request_data.plan_subjectid;
                    if(plan_subject_id == 1){
                        this.request_data.plan_subject ='学生自评';
                    }else if(plan_subject_id == 2){
                        this.request_data.plan_subject ='学生互评';
                    }else if(plan_subject_id == 3){
                        this.request_data.plan_subject ='教师评价';
                    }else if(plan_subject_id == 4){
                        this.request_data.plan_subject ='全部';
                    }

                    var grade_info=this.grade_info;
                    var plan_type=this.plan_type;
                    grade = Number(grade_info.split("|")[1]);
                    if(grade_info.length!=0 &&plan_subject_id!=0 && grade_info!="请选择" && plan_type!=0  && this.school_info!=0){
                        ajax_post(api_get_refer,{plan_gradeid:grade,plan_subjectid:this.request_data.plan_subjectid,plan_type:this.request_data.plan_type,plan_school_typeid:this.request_data.plan_school_typeid},this);
                    }
                },

                //参考方案
                get_reference_scheme:function () {
                    var reference=this.reference_arr;
                    if(reference==0){
                        this.num=3;
                    }else{
                        this.request_data.plan_refer= reference.split("|")[0];
                        this.request_data.plan_referid= Number(reference.split("|")[1]);
                        var id=Number(reference.split("|")[1]);
                        var plan_level=Number(reference.split("|")[2]);
                        this.request_save_plan.fk_plan_id=id;
                        ajax_post(api_get_plan_content,{id:id,plan_level:plan_level},this);
                    }

                },
                //选择学校类别
                school_change:function () {
                    var get_school = this.school_info;
                    if(get_school == 0){
                        this.request_data.plan_school_typeid = 0;
                        toastr.warning('请选择学校类别');
                        return;
                    }else{
                        this.request_data.plan_school_typeid = Number(get_school.split("|")[0]);
                        this.request_data.plan_school_type = get_school.split("|")[1];
                        var grade_info=this.grade_info;
                        var plan_type=this.plan_type;
                        grade = Number(grade_info.split("|")[1]);
                        var plan_subject_id=this.request_data.plan_subjectid;
                        if(grade_info.length!=0 &&plan_subject_id!=0 && grade_info!="请选择" && plan_type!=0  && this.school_info!=0){
                            ajax_post(api_get_refer,{plan_gradeid:grade,plan_subjectid:this.request_data.plan_subjectid,plan_type:this.request_data.plan_type,plan_school_typeid:this.request_data.plan_school_typeid},this);
                        }
                    }
                },
                //取消
                cancel_click:function () {
                    // window.location="#item_programme_management";
                    window.location="#city_management_create_scheme_list";
                },
                //添加
                add_click:function () {
                    if($.trim(this.request_data.plan_name)==''){
                        this.request_data.plan_school_typeid = 0;
                        toastr.warning('请填写方案名称');
                        return;
                    }
                    else if(this.grade_info=="请选择" || this.grade_info==""){
                        toastr.warning('请选择适用年级');
                        return;

                    }else if(this.plan_type=='' || this.plan_type=='请选择'){
                        toastr.warning('请选择方案类型');
                        return;
                    }

                    else if(this.request_data.plan_use_state==''){
                        toastr.warning('请选择一种使用状态');
                        return;
                    }
                    else{
                        var grade=this.grade_info;
                        this.request_data.plan_grade=grade.split("|")[0];
                        this.request_data.plan_gradeid=Number(grade.split("|")[1]);
                        ajax_post(api_add_plan,this.request_data,this);

                    }

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //添加
                            case api_add_plan:
                                this.complete_add_plan(data);
                                break;
                            //查询参考方案
                            case api_get_refer:
                                this.complete_get_refer(data);
                                break;
                            //查询方案内容
                            case api_get_plan_content:
                                this.complete_get_plan_content(data);
                                break;
                            //获取学校类型
                            case api_get_school_type:
                                this.complete_get_school_type(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_grade:function (data) {
                    this.response_data.grade_arr=data.data;
                },
                complete_get_refer:function (data) {
                    this.reference_scheme_arr=data.data;
                },
                complete_add_plan:function (data) {
                    window.location="#city_management_create_scheme_list";
                },
                line:function (idx) {
                    return this.second_table_list_value_list[idx];
                },
                complete_get_plan_content:function (data) {
                    if(data.data!=null){
                        /*获取方案内容*/
                        for(var i=0;i<data.data.length;i++){
                            this.request_save_plan.sub_subject.push(data.data[i].sub_subject);
                            this.request_save_plan.sub_subjectid.push(data.data[i].sub_subjectid.toString());
                        }
                        var val_arr=data.data[0].value_list;
                        if(val_arr.length==0){//value_list==[];
                            this.num=1;
                            this.first_table_list=data.data;
                        }else{
                            this.num=2;
                            this.second_table_list=data.data;
                        }
                    }

                },
                complete_get_school_type:function (data) {
                    var dataList = data.data.list;
                    // dataList.push({id:0,property_name:'全部'});
                    this.school_list = data.data.list;
                }
            });
            vm.$watch('onReady', function() {
                vm.cb();
                vm.get_grade();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });