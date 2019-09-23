define(["jquery",C.CLF('avalon.js'),'layer',
        C.Co("evaluation_material","teacher_evaluation/programme_audit_detail/programme_audit_detail","css!"),
        C.Co("evaluation_material","teacher_evaluation/programme_audit_detail/programme_audit_detail","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('page_title')],
    function($,avalon, layer,css, html, x, data_center,page_title) {
        //查询方案内容
        // var api_get_plan_content=api.api+"Indexmaintain/indexmaintain_findByPlanSubject";
        var api_get_plan_content= api.api+'Indexmaintain/indexmaintain_list_plan_subject';
        //审核
        var api_check=api.api+"Indexmaintain/update_plan_check_state";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "programme_audit_detail",
                pro_group_type:"",//随机1 or 手动分组2
                id:"",
                type:"",
                get_group:"",
                get_title:"",
                get_pro_type:"",
                num:"",
                is_show:false,
                is_show_click:true,
                first_table_list:[],
                second_table_list:[],
                second_table_list_value_list:[],
                pro_gradeid:"",
                quest_data:{
                    check_not_pass_desc:"",//审核不通过原因
                    id:"",//方案id(必填)
                    plan_check_state:"",//方案审核状态(必填) 1:待审核 2:审核通过 3:审核不通过
                    plan_use_state:"",//方案使用状态
                    plan_level:'',
                },
                get_id:function () {
                    this.quest_data.plan_level = pmx.plan_level;
                    this.id = Number(pmx.plan_id);
                    this.quest_data.id = this.id;
                    ajax_post(api_get_plan_content,{fk_plan_id:this.id},this);
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var dataList=JSON.parse(data.data['user']);
                    });
                },
                //通过
                pass_click:function(){
                    this.quest_data.plan_check_state = 2;
                    ajax_post(api_check,this.quest_data,this);
                },
                //不通过
                not_pass_click:function(){
                    var self=this;
                    layer.prompt({title: '请输入不通过理由', formType: 2}, function(text, index){
                        if($.trim(text) != ''){
                            self.quest_data.check_not_pass_desc = text;
                            self.quest_data.plan_check_state = 3;
                            ajax_post(api_check,self.quest_data,self);
                            layer.close(index);
                            toastr.info("正在提交中");
                        }else{
                            toastr.warning("必须填写理由");
                        }

                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询方案内容
                            case api_get_plan_content:
                                this.complete_get_plan_content(data);
                                break;
                            //审核
                            case api_check:
                                this.complete_check_pass(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_plan_content:function (data) {
                    if(data.data.length==0){
                        this.num=3;
                    }
                    var is_who=data.data[0].sub_subject_data.index_isoption;
                    if(is_who==2){//直接打分
                        this.num=1;
                        this.first_table_list=data.data;
                    }else{//选项打分
                        this.num=2;
                        this.second_table_list=data.data;
                        console.log(this.second_table_list)
                    }
                },
                complete_check_pass:function (data) {
                    window.location="#programme_audit_list";
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