/**
 * Created by Administrator on 2018/6/7.
 */
define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("self_evaluation_management","self_evaluation/student_fill_in_self/student_fill_in_self","css!"),
        C.Co("self_evaluation_management","self_evaluation/student_fill_in_self/student_fill_in_self","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM('page_title')
    ],
    function($,avalon, layer,css, html, x, data_center,page_title) {
        //查询是否已评
        var api_is_answer=api.api+"Indexmaintain/indexmaintain_findbyanswer";
        //查询方案内容
        var api_get_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //保存分值
        var api_save_score=api.api+"Indexmaintain/indexmaintain_addEvaluateAnswer";
        //查询分值的最大值
        var api_index_max = api.api+"Indexmaintain/get_idex_stu_hd_num";

        //查询自评（目前只与直接打分做了关联）
        var api_my_record = api.api + 'Indexmaintain/indexmaintain_findbyanswerInfo';
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "student_fill_in_self",
                type:"",
                get_title:"",
                name:"",
                code:"",
                stu_grade:"",
                stu_class:"",
                get_pro_plan_id:"",
                num:"",
                table_list:[],
                second_table_list:[],
                choice_arr:"",
                response_data:{
                    pro_gradeid:"",
                    //1:学生自评2:学生互评3:教师评价4:家长评价
                    pro_type:1,
                    pro_workid:""
                },
                is_answer_data:{
                    ev_proid:"",
                    ev_studentNum:""
                },
                //选项打分
                request_select_data:{
                    //选项
                    ev_index_options:[],
                    //直接打分分值
                    ev_index_valueArr:[],
                    //选项分值
                    ev_index_valuesArr:[],
                    //考察项id
                    ev_indexids:[],
                    //评价项目id
                    ev_proid:"",
                    plan_level:""
                },
                //直接打分
                request_direct_data:{
                    //选项
                    ev_index_options:[],
                    //直接打分分值
                    ev_index_valueArr:[],
                    //选项分值
                    ev_index_valuesArr:[],
                    //考察项id
                    ev_indexids:[],
                    //评价项目id
                    ev_proid:"",
                    plan_level:""
                },
                index_max:{
                    fk_class_id:"",
                    fk_school_id:"",
                    fk_semester_id:"",
                    owner:''
                },
                plan_levelL:"",
                //自评信息
                my_record:[],
                //重复提交问题：true-能够点击，false-不能点击
                btn_has:true,
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                        var dataList=JSON.parse(data.data["user"]);
                        self.stu_grade=dataList.grade_name;
                        self.stu_class=dataList.class_name+"班";
                        self.response_data.pro_gradeid=dataList.fk_grade_id;
                        self.response_data.pro_workid=dataList.fk_school_id;
                        self.index_max.fk_class_id = dataList.fk_class_id;
                        self.index_max.fk_school_id=dataList.fk_school_id;
                        self.index_max.owner=dataList.guid;
                    });
                    self.is_init = true;
                    self.get_info();
                },
                //查询自评
                get_my_record:function(){
                    ajax_post(api_my_record,{
                        ev_proid:Number(pmx.id),
                        ev_student_guid:this.index_max.owner,
                    },this);
                },
                //从上一个页面获取数据信息
                get_info:function () {
                    this.is_answer_data.ev_proid=Number(pmx.id);
                    this.request_direct_data.ev_proid=Number(pmx.id);
                    this.request_select_data.ev_proid=Number(pmx.id);
                    this.is_answer_data.ev_studentNum=pmx.stu_num;
                    this.get_pro_plan_id=Number(pmx.pro_plan_id);
                    this.plan_level = Number(pmx.plan_level);
                    this.request_select_data.plan_level = Number(pmx.plan_level);
                    this.request_direct_data.plan_level = Number(pmx.plan_level);
                    this.name=pmx.name;
                    this.code=pmx.stu_num;
                    this.get_title=pmx.pro_name;
                    this.index_max.fk_semester_id = Number(pmx.semester_id);
                    ajax_post(api_is_answer,this.is_answer_data,this);
                },
                on_black: function () {
                    window.location="#student_add_evaluation_list";
                },
                //选项打分
                select_save_click:function () {
                    var self=this;
                    var ary_option = [], ary_score = [];
                    for( var i = 0; i < this.second_table_list.length; i++ ){
                        var value_list = this.second_table_list[i].value_list;
                        var data_id=this.second_table_list[i].sub_subjectid;
                        var select_no = Number(this.second_table_list[i].index_option_content);
                        self.request_select_data.ev_index_options.push(value_list[select_no].index_option);
                        self.request_select_data.ev_index_valuesArr.push(value_list[select_no].item_values.toString());
                        self.request_select_data.ev_indexids.push(data_id);

                    }
                    if(this.btn_has){
                        this.btn_has = false;
                        ajax_post(api_save_score,this.request_select_data,this);
                    }
                },
                //直接打分
                only_save_click:function () {
                    var a=0;
                    var self=this;
                    for(var i=0;i<this.table_list.length;i++){
                        if(this.table_list[i].value_list!=''){
                            a++;
                            var value_list=this.table_list[i].value_list;
                            var data_id=this.table_list[i].sub_subjectid;
                            self.request_direct_data.ev_index_valueArr.push(value_list);
                            self.request_direct_data.ev_indexids.push(data_id);
                        }else{
                            toastr.warning("第"+(i+1)+"项无分值");
                            return;
                        }
                    }
                    if(a==this.table_list.length){
                        if(this.btn_has){
                            this.btn_has = false;
                            ajax_post(api_save_score,this.request_direct_data,this);
                        }
                    }else{
                        toastr.warning('请填写完再提交')
                    }
                },
                val_change:function(el,idx){
                    // el.value_list=(Number((el.value_list=el.value_list.replace(/\D/g,''))==''?'0':value,10)
                    // console.log(el)
                    if(el.value_list=='') return;
                    if(parseFloat(el.value_list)<0){
                        this.table_list[idx].value_list = 0;
                        return;
                    }
                    if(parseFloat(el.value_list)>parseFloat(el.index_value)){
                        this.table_list[idx].value_list = el.index_value;
                        return;
                    }
                },
                inputBlur:function (el,idx) {
                    if($.trim(el.value_list)==''){
                        this.table_list[idx].value_list = '';
                        toastr.warning('分值不能为空');
                        return;
                    }
                    // var reg =/^[0-9]+([.]{1}[0-9]+){0,1}$/;
                    var reg=/^\d+(\.\d{1})?$/;
                    if(reg.test(el.value_list)){

                    }else{
                        this.table_list[idx].value_list = '';
                        toastr.warning('分值输入不正确');
                        return;
                    }
                    if(parseFloat(el.value_list)<0){
                        this.table_list[idx].value_list = 0;
                        return;
                    }
                    if(parseFloat(el.value_list)>parseFloat(el.index_value)){
                        this.table_list[idx].value_list = el.index_value;
                        return;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //是否评价
                            case api_is_answer:
                                this.complete_is_answer(data);
                                break;
                            //查询自评
                            case api_my_record:
                                this.complete_my_record(data);
                                break;
                            //获取方案内容
                            case api_get_content:
                                this.complete_get_content(data);
                                break;
                            case api_save_score:
                                this.complete_save_score(data);
                                break;
                            //查询最大分值
                            case api_index_max:
                                this.complete_index_max(data);
                                break;
                        }
                    } else {
                        if(this.cmd == api_save_score){
                            this.btn_has = true;
                        }
                        toastr.error(msg)
                    }
                },
                //是否评价
                complete_is_answer:function (data) {
                    //0未评
                    if(data.data.state==0){
                        ajax_post(api_get_content,{id:this.get_pro_plan_id,plan_level:this.plan_level},this);
                    }else{
                        // this.num=4;
                        //查询自评信息
                        this.get_my_record();
                    }

                },
                //查询自评信息
                complete_my_record:function(data){
                    this.my_record = data.data;
                    //查询评价项内容
                    ajax_post(api_get_content,{id:this.get_pro_plan_id,plan_level:this.plan_level},this);
                },
                copy_data:[],
                //查询评价项内容
                complete_get_content:function (data) {
                    if(data.data.length==0){
                        this.num=3;
                    }else{
                        if(data.data[0].value_list.length!=0){//选项打分
                            this.num=2;
                            this.second_table_list=data.data;
                        }else{//直接打分
                            // this.num=1;
                            this.copy_data=data.data;
                            ajax_post(api_index_max,this.index_max.$model,this);
                            // this.table_list=data.data;
                        }
                    }
                },
                complete_index_max:function (data) {
                    var guid = this.index_max.owner;
                    var table = [];
                    var list = JSON.parse(JSON.stringify(this.copy_data));
                    table = list;
                    for(var i = 0 ;i<list.length;i++){
                        if(table[i].index_secondaryid == 933 || table[i].index_secondaryid == 939 || table[i].index_secondaryid == 940 || table[i].index_secondaryid == 941 ||table[i].index_secondaryid == 942){
                            table[i].index_value = 5
                        }else if(data.data.hasOwnProperty(table[i].index_secondaryid)){//设置
                            if(!data.data[table[i].index_secondaryid][guid]){
                                table[i].index_value = 3
                            }
                        }else{
                            table[i].index_value = 3
                        }
                    }
                    this.num=1;
                    if(this.my_record.length == 0 || this.my_record == null){
                        this.table_list=table;
                        return;
                    }
                    //对已经评价的同学进行数据回显
                    var list = this.my_record;
                    for(var a=0;a<list.length;a++){
                        var subject_id = list[a].ev_indexid;
                        for(var b=0;b<table.length;b++){
                            if(subject_id == table[b].sub_subjectid){
                                table[b].value_list = list[a].ev_index_value;
                                break;
                            }
                        }
                    }
                    this.table_list = table;
                    // console.log(this.table_list);
                },
                complete_save_score:function () {
                    toastr.success("保存成功");
                    this.num=4;
                    window.location="#student_add_evaluation_list";
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
                // this.get_info();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });