define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("evaluation_material","teacher_evaluation/add_content/add_content","css!"),
        C.Co("evaluation_material","teacher_evaluation/add_content/add_content","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM("page_title")],
    function($,avalon,layer,css, html, x, data_center,page_title) {
        //一级指标查询
        var api_index_check=api.api+ "Indexmaintain/indexmaintain_findByIndexName";
        //添加
        var api_add_plan_subject=api.api+"Indexmaintain/indexmaintain_addPlanSubject";
        var api_add_plan_subject_leader = api.api+"Indexmaintain/add_county_plan_subject";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "add_programme",
                url:"",
                type:"",
                is_init: false,
                is_show:false,
                //一级指标
                first_info:"",
                first_index_arr:"",
                //二级指标
                second_index_arr:'',
                second_info:"",
                //评价项
                item_arr:"",
                flag_index:"",
                response_data:{
                    //一级指标
                    first_index_form:{
                        // //单位ID
                        // index_workid:"",
                        //级别
                        index_rank:1
                    },
                    //二级指标
                    second_index_form:{
                        //一级ID
                        index_parentid:"",
                        // //单位ID
                        // index_workid:"",
                        //级别
                        index_rank:2
                    },
                    //评价内容
                    third_index_form:{
                        //父集指标id（如存在父级指标就传入父级指标id,当查询指标是三级指标是 这就是一级指标id）
                        index_parentid:'',
                        //二级ID
                        index_secondaryid:'',
                        // //单位ID
                        // index_workid:"",
                        //级别
                        index_rank:3,
                        index_isoption:"",
                        index_apply:"",
                        index_grade:""
                    }
                },
                add_data:{
                    fk_plan_id:"",
                    sub_subject:[],
                    sub_subjectid:[]
                },
                //复选框
                allchecked: false,
                is_checked:"",
                checkAll: function (e) {
                    var checked = e.target.checked;
                    vm.item_arr.forEach(function (el) {
                        el.is_checked = checked;
                    });
                },
                highest_level:"",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        self.highest_level = data.data.highest_level;
                        // self.response_data.first_index_form.index_workid=Number(tUserData.fk_school_id);
                        // self.response_data.second_index_form.index_workid=Number(tUserData.fk_school_id);
                        // self.response_data.third_index_form.index_workid=Number(tUserData.fk_school_id);
                        self.get_first_index();
                    });
                    self.is_init = true;
                },
                back:function () {
                    history.go(-1);
                },
                //从上一个页面获取参数
                get_id:function () {
                    //  this.response_data.third_index_form.index_apply=data_center.get_key("plan_subject");
                    if(data_center.get_key("plan_subject") == '全部'){
                        this.response_data.third_index_form.index_apply = '自评,组评,班评';
                    }else{
                        this.response_data.third_index_form.index_apply=data_center.get_key("plan_subject");
                    }
                    this.response_data.third_index_form.index_grade = data_center.get_key("grade");
                    this.add_data.fk_plan_id=data_center.get_key("get_id");
                    var get_plan_type=data_center.get_key("get_plan_type");
                    if(get_plan_type==1){//A B C
                        this.response_data.third_index_form.index_isoption=1;
                    }else{
                        this.response_data.third_index_form.index_isoption=2;
                    }
                },
                //获取一级指标
                get_first_index:function () {
                    this.flag_index=1;
                    ajax_post(api_index_check, this.response_data.first_index_form, this);
                },
                //获取二级指标
                first_index_click:function () {
                    this.checkbox_arr=[];
                    var first_index_info=this.first_info;
                    this.response_data.third_index_form.index_secondaryid = '';
                    if(first_index_info!=0){
                        this.flag_index=2;
                        this.response_data.second_index_form.index_parentid = parseInt(first_index_info.split("|")[0]);
                        this.response_data.third_index_form.index_parentid = parseInt(first_index_info.split("|")[0]);
                        ajax_post(api_index_check, this.response_data.second_index_form, this);
                    }else{
                        this.response_data.third_index_form.index_parentid = '';
                        this.second_index_arr=[];
                        this.item_arr=[];
                        this.is_show=false;
                        this.third_index_query();
                    }
                },
                //获取评价项
                second_index_click:function () {
                    this.checkbox_arr=[];
                    var second_index_info=this.second_info;
                    if(second_index_info!=0){
                        this.flag_index=3;
                        this.response_data.third_index_form.index_secondaryid = parseInt(second_index_info.split("|")[0]);
                        ajax_post(api_index_check, this.response_data.third_index_form, this);
                    }else{
                        this.response_data.third_index_form.index_secondaryid = '';
                        this.item_arr=[];
                        this.is_show=false;
                        this.third_index_query();
                    }
                },
                //获取三级指标
                third_index_query: function(){
                    this.flag_index = 3;
                    ajax_post(api_index_check, this.response_data.third_index_form, this);
                },
                //添加方案
                checkbox_arr:[],
                //全选
                check_all:function(){
                    //获取所有checkbox元素
                    var ary = $('.checkper');
                    //判断全选是否选中
                    if($('#checkAll').is(':checked')){//选中  is(':checked')----所有版本:true/false
                        var num_ary = [];
                        for(var i=0;i<ary.length;i++){
                            // 设置元素为选中状态
                            ary[i].checked = true;
                            num_ary.push(ary[i].value);
                        }
                        this.checkbox_arr = num_ary;
                    }else{//未选中
                        for(var i=0;i<ary.length;i++){
                            // 设置元素为未选中状态
                            ary[i].checked = false;
                        }
                        this.checkbox_arr = [];
                    }
                },
                save_click:function () {
                    this.add_data.sub_subjectid=[];
                    this.add_data.sub_subject=[];
                    var get_info=this.checkbox_arr;
                    for(var i=0;i<get_info.length;i++){
                        this.add_data.sub_subjectid.push(get_info[i].split("|")[0]);
                        this.add_data.sub_subject.push(get_info[i].split("|")[1])
                    }
                    if(this.add_data.sub_subjectid.length==0 || this.add_data.sub_subject==0){
                        toastr.warning('没有内容可添加')
                    }else{
                        if(this.highest_level == 2 || this.highest_level == 3){//市级 or 区县

                            ajax_post(api_add_plan_subject_leader,this.add_data,this)

                        }else{
                            ajax_post(api_add_plan_subject,this.add_data,this)
                        }
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取指标
                            case api_index_check:
                                this.complete_index_check(data);
                                break;
                            //添加
                            case  api_add_plan_subject:
                                this.complete_add_plan_subject(data);
                                break;
                                //市，区 添加
                            case api_add_plan_subject_leader:
                                this.complete_add_plan_subject(data);
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //指标联动查询结果处理
                complete_index_check:function(data){
                    if(this.flag_index==1){
                        this.first_index_arr=data.data;
                        this.third_index_query();
                    }else if( this.flag_index==2){
                        this.second_index_arr=data.data;
                        this.third_index_query();
                    }else if(this.flag_index==3){
                        if(data.data.length>0){
                            this.item_arr= sort_by(data.data, ["+index_parentid","+index_secondaryid"]);
                            this.is_show=true;
                        }else{
                            this.item_arr = [];
                            toastr.error("暂无数据");
                            this.is_show=false;
                        }

                    }
                },
                complete_add_plan_subject:function (data) {
                    toastr.success("添加成功");
                    window.location="#content_maintenance";
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