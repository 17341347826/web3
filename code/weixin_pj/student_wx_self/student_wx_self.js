/**
 * Created by Administrator on 2018/6/7.
 */
define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("weixin_pj","student_wx_self/student_wx_self","css!"),
        C.Co("weixin_pj","student_wx_self/student_wx_self","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function($,avalon, layer,css, html, x, data_center,weui) {
        //查询是否已评
        var api_is_answer=api.api+"Indexmaintain/indexmaintain_findbyanswer";
        //查询自评（目前只与直接打分做了关联）
        var api_my_record = api.api + 'Indexmaintain/indexmaintain_findbyanswerInfo';
        //查询方案内容
        var api_get_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        //保存分值
        var api_save_score=api.api+"Indexmaintain/indexmaintain_addEvaluateAnswer";
        //查询分值的最大值
        var api_index_max = api.api+"Indexmaintain/get_idex_stu_hd_num";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "student_wx_self",
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
                index_max:{
                    fk_class_id:"",
                    fk_school_id:"",
                    fk_semester_id:"",
                    owner:''
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
                plan_levelL:"",
                //自评信息
                my_record:[],
                //是否可以点击（防止重复提交）：true-可以，false-不可以
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
                    });
                    self.is_init = true;
                    self.get_info();
                },
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

                    this.index_max.owner = pmx.guid;
                    this.index_max.fk_class_id = pmx.class_id;
                    this.index_max.fk_school_id = pmx.school_id;
                    this.index_max.fk_semester_id =pmx.semester_id;
                    ajax_post(api_is_answer,this.is_answer_data,this);
                    // ajax_post(api_get_content,{id:this.get_pro_plan_id,plan_level:this.plan_level},this);
                },
                //查询自评
                get_my_record:function(){
                    ajax_post(api_my_record,{
                        ev_proid:Number(pmx.id),
                        ev_student_guid:this.index_max.owner,
                    },this);
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
                    if(self.btn_has){
                        self.btn_has = false;
                        ajax_post(api_save_score,self.request_select_data,self);
                    }
                },
                save:function () {
                    if(this.num == 1){
                        this.only_save_click();
                    }else{
                        this.select_save_click();
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
                            $.alert("第"+(i+1)+"项无分值");
                            return;
                        }
                    }
                    if(a==this.table_list.length){
                        if(self.btn_has) {
                            self.btn_has = false;
                            ajax_post(api_save_score,self.request_direct_data,self);
                        }
                    }else{
                        $.alert('请填写完再提交')
                    }
                },
                inputBlur:function (el,idx) {

                    if($.trim(el.value_list)==''){
                        this.table_list[idx].value_list = '';
                        $.alert('分值不能为空');
                        return;
                    }
                    var reg=/^\d+(\.\d{1})?$/;
                    if(reg.test(el.value_list)){

                    }else{
                        this.table_list[idx].value_list = '';
                        $.alert('分值输入不正确');
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
                            //查询最大分值
                            case api_index_max:
                                this.complete_index_max(data);
                                break;
                            case api_save_score:
                                this.complete_save_score(data);
                                break;
                        }
                    } else {
                        if(cmd == api_save_score){
                            this.btn_has = true;
                        }
                        $.alert(msg)
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
                copy_list:[],
                complete_get_content:function (data) {
                    if(data.data.length==0){
                        this.num=3;
                    }else{
                        if(data.data[0].value_list.length!=0){//选项打分
                            this.num=2;
                            this.second_table_list=data.data;
                        }else{//直接打分
                            this.copy_list=data.data;
                            ajax_post(api_index_max,this.index_max.$model,this);
                        }
                    }
                },
                complete_index_max:function (data) {
                    var guid = this.index_max.owner;
                    var table = [];
                    var list = JSON.parse(JSON.stringify(this.copy_list));
                    table = list;
                    for(var i = 0 ;i<list.length;i++){
                        if(table[i].index_secondaryid == 933 || table[i].index_secondaryid == 939 ||
                            table[i].index_secondaryid == 940 || table[i].index_secondaryid == 941 ||
                            table[i].index_secondaryid == 942){
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
                },
                complete_save_score:function () {
                    window.history.back();
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });