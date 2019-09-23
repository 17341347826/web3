define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("self_evaluation_management", "goals_and_plans/goals_and_plans_student_fill/goals_and_plans_student_fill", "css!"),
        C.Co("self_evaluation_management", "goals_and_plans/goals_and_plans_student_fill/goals_and_plans_student_fill", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js")
    ],
    function($, avalon, layer,css,html, x,data_center ) {
        // //获取学年学期
        var api_get_semester_name= api.api+"base/semester/used_list.action";
        //获取年级班级
        var api_send_token=api.PCPlayer+"baseUser/sessionuser.action";
        //添加
        var api_add_target_plan=api.growth+"targetplan_addTargetplan";
        //查询
        var api_find_target_plan=api.growth+"targetplan_findTargetplan";
        //修改
        var api_update_target_plan=api.growth+"targetplan_updateTargetplan";
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "goals_and_plans_student_fill",
                user_type:"",
                start_time:"",
                end_time:"",
                time:[],
                tar_targetplan:"",
                data:{
                    form:{
                        tar_schoolyear:"",//学年 2017
                        tar_semester:"",//学期 上 or 下
                        tar_situation:"",//结果
                        tar_targetplan:""//计划
                    },
                    quest_form:{
                        tar_ownerid:"",
                        tar_year:"",//初2016级
                        gradeID:''//年级id
                    }

                },
                gradeID:"",
                json:function (x) {
                    return JSON.stringify(x)
                },
                getInfo:{"七年级上":{
                    "tar_targetplan": "",
                    "tar_situation": ""
                },"七年级下":{
                    "tar_targetplan": "",
                    "tar_situation": ""
                },"八年级上":{
                    "tar_targetplan": "",
                    "tar_situation": ""
                },"八年级下":{
                    "tar_targetplan": "",
                    "tar_situation": ""
                },"九年级上":{
                    "tar_targetplan": "",
                    "tar_situation": ""
                },"九年级下":{
                    "tar_targetplan": "",
                    "tar_situation": ""
                }},
                local_ary:{},
                yearSemester:"",
                // 数据接口
                get_all_info:function () {
                    //获取年级班级
                    ajax_post(api_send_token, {}, this);
                },
                is_switch:"",
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_send_token:
                                this.complete_send_token(data);
                                break;
                            //模块时间
                            case api_get_module_time:
                                this.complete_module_time(data);
                                break;
                            //    系统当前时间
                            case api_get_server_time:
                                this.get_server_time(data);
                                break;
                            case api_get_semester_name:
                                this.complete_get_semester_name(data);
                                break;
                            case api_find_target_plan:
                                this.complete_find_target_plan(data);
                                break;
                            case api_update_target_plan:
                                this.complete_update_target_plan(data);
                                break;
                            case api_add_target_plan:
                                this.complete_add_target_plan(data);
                                break;
                        }
                    }else{
                        toastr.error(msg)
                    }
                },
                complete_send_token:function (data) {
                    var userData = JSON.parse(data.data["user"]);
                    this.user_type=data.data.user_type;
                    this.data.quest_form.tar_ownerid=userData.guid;
                    this.data.quest_form.tar_year=Number(userData.grade_name.substr(1,4));
                    ajax_post(api_get_module_time,{module_type:"5",grade_id:userData.fk_grade_id},this);
                },
                //模块时间
                complete_module_time:function(data){
                    ajax_post(api_get_server_time,{},this);
                    if(data.data == null || data.data == undefined)
                        return;
                    this.start_time=data.data.start_time;
                    this.end_time=data.data.end_time;
                    this.is_switch = data.data.is_switch;
                },
                index:"",
                current_time:"",
                get_server_time:function (data) {
                    this.current_time=data.data.current_time;
                    var current_time=$(".current_time").text();
                    var currentDate=new Date(current_time.replace(/\-/g, "\/"));
                    var start=new Date(this.start_time.replace(/\-/g, "\/"));
                    var end=new Date(this.end_time.replace(/\-/g, "\/"));
                    if(start<currentDate && currentDate<end && this.is_switch == true){//可编辑
                        this.index=1;
                    }else{
                        this.index=2;
                    }
                    ajax_post(api_find_target_plan, this.data.quest_form, this);
                },
                complete_find_target_plan:function (data) {
                    var get_type=typeof data.data;
                    if(get_type=='object'){
                        respond_data=data.data;
                        this.yearSemester=respond_data[0].yearSemester;//七年级下期
                        this.data.form.tar_schoolyear=respond_data[0].yearSemester.substr(0,3);//七年级
                        this.data.form.tar_semester=respond_data[0].yearSemester.substr(3,2);//下
                        var info=respond_data.splice(1,respond_data.length-1);
                        for(var x = 0; x < info.length; x++ ){
                            this.getInfo[info[x]["yearSemester"]] = info[x];
                        }
                        this.local_ary = this.getInfo.$model;
                    }else{
                        this.yearSemester=data.data;//八年级上期
                        this.data.form.tar_schoolyear= this.yearSemester.substr(0,3);//八年级
                        this.data.form.tar_semester= this.yearSemester.substr(3,2);//上期
                        this.local_ary = this.getInfo.$model;
                    }
                },
                complete_update_target_plan:function (data) {
                    layer.closeAll();
                    toastr.success("修改成功");
                    ajax_post(api_find_target_plan, this.data.quest_form, this);

                },
                complete_add_target_plan:function (data) {
                    layer.closeAll();
                    toastr.success("添加成功");
                    ajax_post(api_find_target_plan, this.data.quest_form, this);
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var data_x = JSON.parse(data.data['user']);
                        self.data.quest_form.gradeID = data_x.fk_grade_id;
                        self.gradeID = data_x.fk_grade_id;
                        var tUser=JSON.parse(data.data.user);
                        self.data.quest_form.gradeID=tUser.fk_grade_id;
                    });
                    self.is_init = true;
                },
                edit:function ($idx,el) {
                    var tar_schoolyear = $idx.substr(0,3);
                    var tar_semester = $idx.substr(3,2);
                    var self=this;
                    var tar_targetplan=el.tar_targetplan;
                    if(tar_targetplan==''){//添加
                        layer.prompt(
                            {title: '请对本学期制定一个目标',
                                formType: 2,
                                yes: function(index, layero){
                                    var val = layero.find(".layui-layer-input").val();
                                    if($.trim(val)==''){
                                        toastr.warning('目标不能为空');
                                    }else{
                                        var semester = cloud.grade_semester_mapping_list({grade_id:vm.gradeID});
                                        var semester_id = '';
                                        for(var k=0;k<semester.length;k++){
                                            if(semester[k].remark==$idx){
                                                semester_id = semester[k].id;
                                                break;
                                            }
                                        }
                                        el.tar_targetplan=val;
                                        ajax_post(api_add_target_plan,
                                            {tar_targetplan:el.tar_targetplan,
                                                tar_schoolyear:tar_schoolyear,
                                                tar_semester:tar_semester,
                                                gradeID:vm.gradeID,
                                                semester_id:semester_id
                                            },
                                            self);
                                    }
                                }

                            }
                        );
                    }else{
                        layer.prompt(
                            {title: '请对本学期制定一个目标',
                                formType: 2,
                                value:tar_targetplan,
                                yes: function(index, layero){
                                   var val = layero.find(".layui-layer-input").val();
                                   if($.trim(val)==''){
                                       toastr.warning('目标不能为空');
                                   }else{
                                       el.tar_targetplan=val;
                                       ajax_post(api_update_target_plan,
                                           {tar_targetplan:el.tar_targetplan,
                                               gradeID:vm.gradeID,
                                               module_type:5,
                                               id:el.id},
                                           self);
                                   }
                                }
                            }
                        );

                    }

                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();
                this.get_all_info();
            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




