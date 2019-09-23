define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("weixin_pj", "teacher_find_target/teacher_find_target", "css!"),
        C.Co("weixin_pj", "teacher_find_target/teacher_find_target", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), "jquery-weui"
    ],
    function($, avalon, layer,css,html, x,data_center,weui ) {
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        //列表查询学生
        var api_get_all_stu=api.api+"base/baseUser/studentlist.action";
        //查询当前可编辑的学年学期
        var api_semester_is_fill=api.growth+"targetplan_findTargetplan";
        //老师查看目标与计划
        var api_teacher_check=api.growth+"targetplan_findteacherTargetplan";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "teacher_find_target",
                is_semester:1,
                user_type:"",
                start_time:"",
                end_time:"",
                current_time:"",
                is_fill:"",
                time:[],
                grade_list:[],
                class_list:[],
                fk_class_id:"",
                fk_grade_id:"",
                fk_grade_name:"",
                fk_semester:"七年级上",
                tar_schoolyear:"七年级",//八年级
                tar_semester:"上",//上期
                yearSemester:"",//当前可编辑的年级
                student_list:[],
                data:{
                    form:{
                        tar_schoolyear:"",//学年 2017
                        tar_semester:"",//学期 上 or 下
                        // tar_situation:"",//结果
                        tar_targetplan:""//计划
                    },
                    quest_form:{
                        tar_ownerid:"",
                        tar_year:""//初2016级
                    }

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
                is_switch:"",
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询模块时间
                            case api_get_module_time:
                                if(data.data){
                                    this.start_time=data.data.start_time;
                                    this.end_time=data.data.end_time;
                                    this.is_switch = data.data.is_switch;
                                }else{
                                    this.is_fill=2;//只能查看
                                }
                                ajax_post(api_get_server_time,{},this);
                                break;
                            //查询服务器当前时间
                            case api_get_server_time:
                                this.get_server_time(data);
                                break;
                            //查询学生列表
                            case api_get_all_stu:
                                this.complete_get_all_stu(data);
                                break;
                            //查询当前可编辑的年级
                            case api_semester_is_fill:
                                if(typeof data.data=='string'){
                                    this.yearSemester = data.data;
                                    ajax_post(api_teacher_check,
                                        {classID:this.fk_class_id,
                                            gradeID:this.fk_grade_id,
                                            tar_schoolyear:this.tar_schoolyear,
                                            tar_semester:this.tar_semester
                                        },this);

                                }else{
                                    if(this.is_semester == 2){
                                        ajax_post(api_teacher_check,
                                            {classID:this.fk_class_id,
                                                gradeID:this.fk_grade_id,
                                                tar_schoolyear:this.tar_schoolyear,
                                                tar_semester:this.tar_semester
                                            },this);

                                    }else{
                                        this.yearSemester = data.data[0].yearSemester;
                                        this.fk_semester = this.yearSemester;
                                        var tar_schoolyear = this.fk_semester.substring(0,3);
                                        var tar_semester = this.fk_semester.substring(3,4);
                                        ajax_post(api_teacher_check,
                                            {classID:this.fk_class_id,
                                                gradeID:this.fk_grade_id,
                                                tar_schoolyear:tar_schoolyear,
                                                tar_semester:tar_semester
                                            },this);
                                    }

                                    break;

                                }
                                break;
                            //查询的当前所选年级的详情
                            case api_teacher_check:
                                this.complete_teacher_check(data);
                                break;

                        }
                    }
                },

                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        var lead_class_list = userData.lead_class_list;
                        // lead_class_list =
                        //     [
                        //         {"school_id":2,"school_name":"眉山市东坡区实验初级中学","grade_id":36,"grade_name":"初2015级",
                        //             "class_list":
                        //                 [
                        //                     {"class_id":23,"class_name":"006"},
                        //                     {"class_id":24,"class_name":"007"}
                        //                 ]
                        //         },
                        //         {"school_id":3,"school_name":"眉山市中学","grade_id":37,"grade_name":"初2017级",
                        //             "class_list":
                        //                 [
                        //                     {"class_id":26,"class_name":"26"},
                        //                     {"class_id":27,"class_name":"27"}
                        //                 ]
                        //         }
                        //     ];
                        self.grade_list = lead_class_list;
                        self.fk_grade_id = self.grade_list[0].grade_id;
                        self.fk_grade_name=self.grade_list[0].grade_name;
                        self.class_list = lead_class_list[0].class_list;
                        self.fk_class_id = self.class_list[0].class_id;
                        ajax_post(api_get_module_time,{module_type:"6",grade_id:self.fk_grade_id},self);
                    });
                },
                get_server_time:function (data) {
                    if(this.is_fill!=2){
                        this.current_time=data.data.current_time;
                        var current_time=$(".current_time").text();
                        var currentDate=new Date(current_time.replace(/\-/g, "\/"));
                        var start=new Date(this.start_time.replace(/\-/g, "\/"));
                        var end=new Date(this.end_time.replace(/\-/g, "\/"));
                        if(start<currentDate && currentDate<end && this.is_switch == true){//可编辑
                            this.is_fill=1;
                        }else{
                            this.is_fill=2;
                        }
                    }
                    ajax_post(api_get_all_stu,{fk_class_id:this.fk_class_id},this);

                },
                complete_get_all_stu:function (data) {
                    this.student_list=data.data.list;
                    var tar_year = this.fk_grade_name.substr(1,4);
                    var tar_ownerid = data.data.list[0].guid;
                    ajax_post(api_semester_is_fill,{tar_year:tar_year,tar_ownerid:tar_ownerid,gradeID:this.fk_grade_id},this);
                },
                gradeChange:function () {
                    var grade_id=this.fk_grade_id;
                    var gradeList = this.grade_list;
                    var grade_list_length = this.grade_list.length;
                    for(var i=0;i<grade_list_length;i++){
                        if(grade_id == gradeList[i].grade_id){
                            this.class_list = gradeList[i].class_list;
                            this.fk_class_id = gradeList[i].class_list[0].class_id;
                        }
                    }
                    ajax_post(api_get_all_stu,{fk_class_id:this.fk_class_id},this);


                },
                classChange:function () {
                    ajax_post(api_get_all_stu,{fk_class_id:this.fk_class_id},this);
                },
                semesterChange:function () {
                    this.is_semester = 2;
                    var fk_semester=this.fk_semester;
                    this.tar_schoolyear=fk_semester.substr(0,3);
                    this.tar_semester = fk_semester.substr(3,2);
                    ajax_post(api_get_all_stu,{fk_class_id:this.fk_class_id},this);
                },
                complete_teacher_check:function (data) {
                    var complete_stu=data.data;
                    var complete_stu_length=complete_stu.length;
                    var all_stu=this.student_list.$model;
                    var all_stu_length=all_stu.length;
                    for(var i=0;i<all_stu_length;i++){
                        all_stu[i].tar_situation = "";
                        all_stu[i].tar_targetplan = "";
                        all_stu[i].score = 666;
                        all_stu[i].has_plan = 2;//默认没有填写目标计划
                    }
                    for(var i=0;i<complete_stu_length;i++){
                        for(var j=0;j<all_stu_length;j++){
                            if(all_stu[j].guid == complete_stu[i].tar_ownerid){
                                if(complete_stu[i].tar_targetplan !=''){//填写了目标计划
                                    all_stu[j].has_plan = 1;
                                }
                                all_stu[j].tar_situation = complete_stu[i].tar_situation;
                                all_stu[j].tar_targetplan = complete_stu[i].tar_targetplan;
                                all_stu[j].id = complete_stu[i].id;
                                if(complete_stu[i].hasOwnProperty('score')){
                                    all_stu[j].score = complete_stu[i].score;
                                }
                            }

                        }
                    }
                    this.student_list = sort_by(all_stu,['+has_plan']);
                },
                edit_btn:function (el) {
                    var value = JSON.stringify(el);
                    window.location = "#teacher_find_target_edit?el=" + value +"&semester=" + this.yearSemester;
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                this.cb();

            });

            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




