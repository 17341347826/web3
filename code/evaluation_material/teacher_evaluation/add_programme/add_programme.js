define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("evaluation_material/stu_evaluation","evaluation","css!"),
        C.Co("evaluation_material/teacher_evaluation","add_programme/add_programme","css!"),
        C.Co("evaluation_material/teacher_evaluation","add_programme/add_programme","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("table"),
        C.CM("three_menu_module")
    ],
    function($,avalon, layer,css1,css2, html, x, data_center,tab,tmm) {
        //获取年级
        var api_get_grade=api.api+"base/grade/findGrades.action";
        //添加方案
        var api_add_plan=api.api+"Indexmaintain/indexmaintain_addPlan";
        //查询参考方案
        var api_get_refer=api.api+"Indexmaintain/indexmaintain_findByRefer";
        //查询方案内容
        var api_get_plan_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //保存方案内容
        var api_save_plan=api.api+"Indexmaintain/indexmaintain_addPlanSubject";
        var grade_map = {
            '一':1,
            '二':2,
            '三':3,
            '四':4,
            '五':5,
            '六':6,
            '七':7,
            '八':8,
            '九':9
        }
        var avalon_define = function(pxm) {
            var vm = avalon.define({
                $id: "add_programme",
                url:"",
                type:"",
                num:"",
                json:function (x) {
                    return JSON.stringify(x)
                },
                first_table_list:[],
                second_table_list:[],
                second_table_list_value_list:[],
                plan_content:"",
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
                    plan_state:'',//1:待审核 2:审核通过 3:审核不通过 4:手动提交进行审核的状态
                    plan_name:"",
                    plan_subject:"",
                    plan_gradeid:"",
                    plan_grade:"",
                    //1:启用 2:停用
                    plan_use_state:"",
                    //参考方案
                    plan_refer:"",
                    plan_referid:"",
                    //方案类型
                    plan_type:"",
                    plan_subjectid:""//number 1:学生自评 2:学生互评 3:教师评价 4:全部
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
                    // var plan_subject = pxm.plan_subject;
                    // this.request_data.plan_subjectid = Number(plan_subject);
                    // if(plan_subject == 1){
                    //     this.request_data.plan_subject = '学生自评';
                    // }else if(plan_subject == 2){
                    //     this.request_data.plan_subject = '学生互评';
                    // }else{
                    //     this.request_data.plan_subject = '教师评价';
                    // }
                    this.is_init = true;
                },
                get_grade:function () {
                    ajax_post(api_get_grade,{status:"1"},this);
                },
                grade_switch:function(grade_name){
                    var grade_num = grade_name.substr(0,1);
                    return grade_map[grade_num];
                },
                //方案类型
                type_click:function () {
                    this.request_data.plan_type=this.plan_type;
                    var grade_info=this.grade_info;
                    var plan_type=this.plan_type;
                    var grade_name = grade_info.split("|")[0];
                    var grade = this.grade_switch(grade_name);
                    var plan_subject_id = this.request_data.plan_subjectid;
                    if(grade_info.length!=0 &&plan_subject_id!=0 && grade_info!="请选择" && plan_type!=0){
                        ajax_post(api_get_refer,{plan_check_state:2,plan_gradeid:grade,plan_subjectid:this.request_data.plan_subjectid,plan_type:this.request_data.plan_type},this);
                    }
                },

                //适用评价主体
                get_apply_subject: function () {
                    var plan_subject_id = this.request_data.plan_subjectid;
                    if (plan_subject_id == 1) {
                        this.request_data.plan_subject = '学生自评';
                    } else if (plan_subject_id == 2) {
                        this.request_data.plan_subject = '学生互评';
                    } else if (plan_subject_id == 3) {
                        this.request_data.plan_subject = '教师评价';
                    } else if (plan_subject_id == 4) {
                        this.request_data.plan_subject = '全部';
                    }
                    var grade_info = this.grade_info;
                    var plan_type = this.plan_type;
                    var grade = this.grade_switch(grade_info.split(['|'])[0]);
                    if (grade_info.length != 0 && plan_subject_id != 0 && grade_info != "请选择" && plan_type != 0) {
                        ajax_post(api_get_refer,{
                            plan_check_state:2,
                            plan_gradeid:grade,
                            plan_subjectid:this.request_data.plan_subjectid,
                            plan_type:this.request_data.plan_type
                        },this);
                    }
                },
                //适用年级
                get_apply_grade:function () {
                    var plan_subject=this.request_data.plan_subjectid;
                    var grade_info=this.grade_info;
                    var plan_type=this.plan_type;
                    var grade_name = grade_info.split("|")[0];
                    var grade = this.grade_switch(grade_name);
                    if(plan_subject != '' && plan_subject!="请选择" && grade_info!="请选择" && plan_type!=0){
                        ajax_post(api_get_refer,{
                            plan_check_state:2,
                            plan_gradeid:grade,
                            plan_subjectid:this.request_data.plan_subjectid,
                            plan_type:this.request_data.plan_type
                        },this);
                    }
                },
                //适用评价主体
                sub_id:"",

                //参考方案
                get_reference_scheme:function () {
                    var reference=this.reference_arr;
                    if(reference==0){
                        this.request_data.plan_refer= '';
                        this.request_data.plan_referid= '';
                        this.num=3;
                    }else{
                        this.request_data.plan_refer= reference.split("|")[0];
                        this.request_data.plan_referid= reference.split("|")[1];
                        var id=Number(reference.split("|")[1]);
                        var plan_level=Number(reference.split("|")[2]);
                        this.request_save_plan.fk_plan_id=id;
                        ajax_post(api_get_plan_content,{id:id,plan_level:plan_level},this);
                    }

                },
                //取消
                cancel_click:function () {
                    window.location="#school_t_e_s_s?grade_id="+pxm.grade_id+ '&url_type='+pxm.plan_subject;
                },
                //添加
                add_click:function () {
                    this.plan_type = 2;
                    if($.trim(this.request_data.plan_name)==''){
                        toastr.warning('请填写方案名称');
                        return;
                    }else if(this.request_data.plan_subjectid=='请选择' || this.request_data.plan_subjectid==''){
                        toastr.warning('请选择适用评价主体');
                        return;
                    }else if(this.grade_info=="请选择" || this.grade_info==""){
                        toastr.warning('请选择适用年级');
                        return;

                    }else if(this.plan_type=='' || this.plan_type=='请选择'){
                        toastr.warning('请选择方案类型');
                        return;
                    }else if(this.request_data.plan_use_state==''){
                        toastr.warning('请选择一种使用状态');
                        return;
                    }
                    else{
                        var grade=this.grade_info;
                        this.request_data.plan_grade=grade.split("|")[0];

                        this.request_data.plan_gradeid=change_remark(this.request_data.plan_grade);
                        this.request_data.plan_state = 4;
                        // console.log(this.request_data)
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
                            //保存方案内容
                            case api_save_plan:
                                this.complete_save_plan(data);
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
                    this.request_save_plan.fk_plan_id=data.data;
                   ajax_post(api_save_plan,this.request_save_plan,this);
                },
                complete_save_plan:function (data) {
                    window.location="#school_t_e_s_s?url_type=" + this.request_data.plan_subjectid+"&grade_id="+pxm.grade_id+
                      '&url_type='+pxm.plan_subject;
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
                        var val_arr = [];
                        if(data.data.length>0){
                            val_arr = data.data[0].value_list;
                        }
                        if(val_arr.length==0){//value_list==[];
                            this.num=1;
                            this.first_table_list=data.data;
                        }else{
                            this.num=2;
                            this.second_table_list=data.data;
                        }
                    }

                }
            });
            vm.$watch('onReady', function() {
                this.cb();
                this.get_grade();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });