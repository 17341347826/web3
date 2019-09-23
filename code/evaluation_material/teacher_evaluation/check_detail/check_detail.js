define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("evaluation_material","teacher_evaluation/check_detail/check_detail","css!"),
        C.Co("evaluation_material","teacher_evaluation/check_detail/check_detail","html!"),
        C.CMF("router.js"),C.CMF("data_center.js")],
    function($,avalon, layer,css, html, x, data_center) {
        //查询方案内容
        // var api_get_plan_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //校级的方案详情
        var api_get_plan_content= api.api+'Indexmaintain/indexmaintain_list_plan_subject';
        //市上or区县查看详情
        var api_get_plan_city = api.api+"Indexmaintain/find_county_plan_subject_list";
        //审核
        var api_check=api.api+"Indexmaintain/indexmaintain_updateEvaluateProState";
        //审核通过后进行初始化随机分配互评
        var api_distribution_student=api.api+"Indexmaintain/indexmaintain_getStudentInfo";
        // 保存时间
        var api_add_or_update=api.api+"everyday/save_module_switch";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "check_detail",
                pro_group_type:"",//随机1 or 手动分组2
                pro_info: '',
                id:"",
                type:"",
                get_group:"",
                get_title:"",
                get_pro_type:"",
                num:"",
                key:"",
                pro_start_time:'',
                module_type:'',
                pro_end_time:'',
                is_show:false,
                is_show_click:true,
                first_table_list:[],
                second_table_list:[],
                second_table_list_value_list:[],
                pro_gradeid:"",
                quest_data:{
                    pro_gradeid:"",
                    pro_workid:"",
                    id:""
                },
                get_id:function () {
                    var plan_level = data_center.get_key("get_plan_level");
                    var id=data_center.get_key("get_plan_id");
                    this.id=data_center.get_key("get_id");
                    this.get_title= data_center.get_key("get_pro_name");
                    var pro_type=data_center.get_key("get_pro_type");
                    this.pro_group_type= data_center.get_key("pro_group_type");
                    this.get_pro_type=Number(pro_type);
                    this.quest_data.id = Number(this.id);
                    this.quest_data.pro_gradeid=Number(data_center.get_key("get_grade_id"));
                    this.pro_start_time=data_center.get_key("pro_start_time");
                    this.pro_end_time=data_center.get_key("pro_end_time");





                    if(pro_type==1){
                        this.get_group="学生自评";
                        this.module_type="7";
                    }else if(pro_type==2){
                        this.get_group="学生互评";
                        this.module_type="8";
                    }else if(pro_type==3){
                        this.get_group="教师评价";
                        this.module_type="0";
                    }else if(pro_type==4){
                        this.get_group="家长评价";
                        this.module_type="0";
                    }
                    if(plan_level == 1){
                        ajax_post(api_get_plan_city,{fk_plan_id:id},this);
                    }else{
                        ajax_post(api_get_plan_content,{fk_plan_id:id},this);
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                       var dataList=JSON.parse(data.data['user']);
                       self.quest_data.pro_workid=dataList.fk_school_id;
                    });
                    self.is_init = true;
                },
                //通过
                pass_click:function(){
                    this.key=1;
                    this.is_show=true;
                    this.is_show_click=false;
                    ajax_post(api_add_or_update,{
                        end_time:this.pro_end_time,
                        grade_id:this.quest_data.pro_gradeid,
                        is_switch:true,
                        module_type:this.module_type,
                        start_time:this.pro_start_time,
                    },this);
                    ajax_post(api_check,{id:this.id,pro_state:2,pro_type:this.get_pro_type},this);

                },
                //不通过
                not_pass_click:function(){
                    this.key=2;
                    var self=this;
                    layer.prompt({title: '请输入不通过理由', formType: 2}, function(text, index){
                        ajax_post(api_check,{id:self.id,pro_not_pass:text,pro_state:3,pro_type:self.get_pro_type},self);
                        layer.close(index);
                        toastr.info("正在提交中");
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询方案内容
                            case api_get_plan_content:
                                this.complete_get_plan_content(data);
                                break;
                            case api_get_plan_city:
                                this.complete_get_plan_content(data);
                                break;
                            //审核
                            case api_check:
                                if(this.key==1){//通过
                                    this.complete_check_pass(data);
                                }else{//不通过
                                    this.complete_check_no_pass(data);
                                }
                                break;
                            //随机分配
                            case api_distribution_student:
                                this.complete_distribution_student(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_plan_content:function (data) {
                    if(data.data.length==0){
                        this.num=3;
                        return;
                    }
                    var is_who=data.data[0].sub_subject_data.index_isoption;
                    if(is_who==2){//直接打分
                        this.num=1;
                        this.first_table_list=data.data;
                    }else{//选项打分
                        this.num=2;
                        this.second_table_list=data.data;
                    }
                    // var val_arr=data.data[0].value_list;
                    // if(val_arr.length==0){//value_list==[];
                    //     this.num=1;
                    //     this.first_table_list=data.data;
                    // }else{
                    //     this.num=2;
                    //     this.second_table_list=data.data;
                    // }
                },
                complete_check_pass:function (data) {
                    if(this.get_pro_type==2 && this.pro_group_type == 1 ){
                        ajax_post(api_distribution_student,this.quest_data,this);
                    }else{
                        window.location="#check_list";
                    }
                },
                complete_distribution_student:function (data) {
                    this.is_show=false;
                    toastr.warning("互评人数初始化完成");
                    window.setTimeout(function () {
                        window.location="#check_list";
                    },3000)
                },
                complete_check_no_pass:function (data) {
                    window.location="#check_list";
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
                this.get_id();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });