define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "plan_wx_student/plan_wx_student", "css!"),
        C.Co("weixin_pj", "plan_wx_student/plan_wx_student", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui) {
        // //获取学年学期
        var api_get_semester_name= api.api+"base/semester/used_list.action";
        //获取年级班级
        var api_send_token=api.PCPlayer+"baseUser/sessionuser.action";
        //查询
        var api_find_target_plan=api.growth+"targetplan_findTargetplan";
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "plan_wx_student",
                start_time:"",
                end_time:"",
                time:[],
                tar_targetplan:"",
                //身份判断
                user_type:'',
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
                    "tar_situation": "",
                     "semester_id":"",
                },"七年级下":{
                    "tar_targetplan": "",
                    "tar_situation": "",
                     "semester_id":"",
                },"八年级上":{
                    "tar_targetplan": "",
                    "tar_situation": "",
                     "semester_id":"",
                },"八年级下":{
                    "tar_targetplan": "",
                    "tar_situation": "",
                    "semester_id":"",
                },"九年级上":{
                    "tar_targetplan": "",
                    "tar_situation": "",
                    "semester_id":"",
                },"九年级下":{
                    "tar_targetplan": "",
                    "tar_situation": "",
                     "semester_id":"",
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
                        $.alert(msg)
                    }
                },
                complete_send_token:function (data) {
                    var userData = JSON.parse(data.data["user"]);
                    //0：管理员；1：教师；2：学生；3：家长
                    this.user_type = data.data.user_type;
                    if(this.user_type == 2){
                        this.data.quest_form.tar_ownerid=userData.guid;
                        this.data.quest_form.tar_year=Number(userData.grade_name.substr(1,4));
                        var grade_id = userData.fk_grade_id;
                    }else if(this.user_type == 3){
                        var stu = userData.student;
                        this.data.quest_form.tar_ownerid=stu.guid;
                        this.data.quest_form.tar_year=Number(stu.grade_name.substr(1,4));
                        var grade_id = stu.fk_grade_id;
                    }
                    ajax_post(api_get_module_time,{module_type:"5",grade_id:grade_id},this);
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
                        if(this.user_type != 3){
                            this.yearSemester=respond_data[0].yearSemester;//七年级下期
                            this.data.form.tar_schoolyear=respond_data[0].yearSemester.substr(0,3);//七年级
                            this.data.form.tar_semester=respond_data[0].yearSemester.substr(3,2);//下
                        }
                        // var info=respond_data;
                        // for(var x = 0; x < info.length; x++ ){
                        //     this.getInfo[info[x]["yearSemester"]] = info[x];
                        // }
                        var info=respond_data.splice(1,respond_data.length-1);
                        if(info.length == 0){//当前还没有填写目标计划
                            var sem_id = respond_data[0].semester_id;
                            var sem_name = respond_data[0].yearSemester;
                            this.getInfo[sem_name].semester_id = sem_id;
                            this.getInfo[sem_name].tar_targetplan =  respond_data[0].tar_targetplan;
                            this.getInfo[sem_name].tar_situation =  respond_data[0].tar_situation;
                        }else{
                            for(var x = 0; x < info.length; x++ ){
                                this.getInfo[info[x]["yearSemester"]] = info[x];
                            }
                        }
                        this.local_ary = this.getInfo.$model;
                    }else{
                        this.yearSemester=data.data;//八年级上期
                        this.data.form.tar_schoolyear= this.yearSemester.substr(0,3);//八年级
                        this.data.form.tar_semester= this.yearSemester.substr(3,2);//上期
                        this.local_ary = this.getInfo.$model;
                    }
                    console.log(this.local_ary);
                },
                complete_update_target_plan:function (data) {
                    layer.closeAll();
                    $.alert("修改成功");
                    ajax_post(api_find_target_plan, this.data.quest_form, this);

                },
                complete_add_target_plan:function (data) {
                    layer.closeAll();
                    $.alert("添加成功");
                    ajax_post(api_find_target_plan, this.data.quest_form, this);

                },
                login_name:"",
                login_code:"",
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var data_x = JSON.parse(data.data['user']);
                        //0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        if(user_type == 2){//学生
                            self.login_name = data_x.name;
                            self.login_code = data_x.code;
                            self.data.quest_form.gradeID = data_x.fk_grade_id;
                            self.gradeID = data_x.fk_grade_id;
                            self.data.quest_form.gradeID=data_x.fk_grade_id;
                        }else if(user_type == 3){//家长
                            var stu = data_x.student;
                            self.login_name = stu.name;
                            self.login_code = stu.code;
                            self.data.quest_form.gradeID = stu.fk_grade_id;
                            self.gradeID = stu.fk_grade_id;
                            self.data.quest_form.gradeID = stu.fk_grade_id;
                        }
                    });
                    self.is_init = true;
                },
                edit:function (key,el) {
                    el = JSON.stringify(el);
                    window.location = "#plan_wx_student_edit?key=" +key +"&login_name="+this.login_name+"&login_code="+this.login_code+"&gradeID="+this.gradeID+"&el="+el;

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




