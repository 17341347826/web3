define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co("evaluation_material/stu_evaluation","evaluation","css!"),
        C.Co("evaluation_material/teacher_evaluation","school_detail/school_detail","css!"),
        C.Co("evaluation_material/teacher_evaluation","school_detail/school_detail","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function( $,avalon,layer,css1,css2, html, x, data_center,tmm) {
        //校管理查询具体内容
        var api_get_plan=api.api+"Indexmaintain/indexmaintain_list_plan_subject";
        //市区县查看具体内容
        var api_get_plan_leader = api.api + "Indexmaintain/find_county_plan_subject_list";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "table",
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
                        var plan_level = pmx.plan_level;
                        if(plan_level == 2){
                            ajax_post(api_get_plan,{fk_plan_id:self.id},self);
                        }else{
                            ajax_post(api_get_plan_leader,{fk_plan_id:self.id},self);
                        }
                    });
                },
                back:function () {
                    window.history.go(-1);
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
                    if(data.data.length==0){
                        this.num=3;
                    }else{
                        this.num=1;
                        this.first_table_list=data.data;
                    }
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