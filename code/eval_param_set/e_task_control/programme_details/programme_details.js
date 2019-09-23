/**
 * Created by Administrator on 2018/5/29.
 */
define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('eval_param_set', 'e_task_control/programme_details/programme_details','html!'),
        C.Co('eval_param_set', 'e_task_control/programme_details/programme_details','css!'),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")

    ],
    function( avalon,layer,html,css, data_center,three_menu_module) {
        //校管理查询具体内容
        var api_get_plan=api.api+"Indexmaintain/indexmaintain_list_plan_subject";
        //市区县查看具体内容
        var api_get_plan_leader = api.api + "Indexmaintain/find_county_plan_subject_list";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "programme-details",
                id:"",
                num:"",
                grade:"",
                plan_subject:"",
                get_plan_type:"",
                sub_subjectids:"",
                first_table_list:"",
                highest_level:"",
                get_plan_refer:"",
                get_plan_founder:"",
                get_plan_name:"",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var dataList = JSON.parse(data.data['user']);
                        self.highest_level = data.data.highest_level;
                        var name = dataList.name;
                        self.grade=pmx.grade;
                        self.plan_subject=pmx.plan_subject;
                        self.id=Number(pmx.id);
                        self.get_plan_type=pmx.plan_type;
                        self.get_plan_founder=pmx.plan_founder;
                        self.get_plan_name=pmx.plan_name;
                        if(name != self.get_plan_founder){
                            ajax_post(api_get_plan_leader,{fk_plan_id:self.id},self);

                        }else{
                            ajax_post(api_get_plan,{fk_plan_id:self.id},self);

                        }
                    });

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询
                            case api_get_plan:
                                this.complete_get_plan(data);
                                break;
                            //查询
                            case api_get_plan_leader:
                                this.complete_get_plan(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_plan:function (data) {
                    this.first_table_list=data.data;
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