define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("self_evaluation_management", "goals_and_plans/goals_and_plans_teacher_fill/goals_and_plans_teacher_fill", "css!"),
        C.Co("self_evaluation_management", "goals_and_plans/goals_and_plans_teacher_fill/goals_and_plans_teacher_fill", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),C.CM('three_menu_module')
    ],
    function($, avalon, layer,css,html, x,data_center,three_menu_module ) {
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
        //老师提交实现情况
        var api_add_situation=api.growth+"targetplan_updateTargetplan";
        //获取所有班级信息
        var api_get_all_grade = api.api + "base/class/school_class.action";
        //获取学年学期
        var api_sem = api.user + 'semester/grade_semester_mapping';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "goals_and_plans_teacher_fill",
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
                fk_semester:"",
                tar_schoolyear:"",//八年级
                tar_semester:"",//上期
                // fk_semester:"七年级上",
                // tar_schoolyear:"七年级",//八年级
                // tar_semester:"上",//上期
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
                //判断校管理员是否是班主任：只有班主任才能编辑:true-是，false-不是
                is_headmaster:false,
                //班主任所教课程
                lead_class_list:[],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        self.lead_class_list = userData.lead_class_list;
                        var highest_level = data.data.highest_level;
                        if(highest_level == 4){//校领导
                            ajax_post(api_get_all_grade,{school_id:userData.fk_school_id},self);
                        }else if(highest_level == 6){
                            var lead_class_list = userData.lead_class_list;
                            self.grade_list = lead_class_list;
                            self.fk_grade_id = self.grade_list[0].grade_id;
                            self.fk_grade_name=self.grade_list[0].grade_name;
                            self.class_list = lead_class_list[0].class_list;
                            self.fk_class_id = self.class_list[0].class_id;
                            //判断老师能否编辑当前班级
                            if(lead_class_list.length>0 && lead_class_list[0].class_list[0].class_id == self.fk_class_id){
                                self.is_headmaster = true;
                            }else{
                                self.is_headmaster = false;
                            }
                            ajax_post(api_sem,{grade_id:self.fk_grade_id},self);
                            // ajax_post(api_get_module_time,{module_type:"6",grade_id:self.fk_grade_id},self);
                        }
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取所有年级
                            case api_get_all_grade:
                                this.complete_get_all_grade(data);
                                break;
                            //    获取学年学期
                            case api_sem:
                                this.complete_get_sem(data);
                                break;
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

                                }else{
                                    this.yearSemester = data.data[0].yearSemester;

                                }
                                ajax_post(api_teacher_check,
                                    {classID:this.fk_class_id,
                                        gradeID:this.fk_grade_id,
                                        tar_schoolyear:this.tar_schoolyear,
                                        tar_semester:this.tar_semester
                                    },this);
                                break;
                            //查询的当前所选年级的详情
                            case api_teacher_check:
                                this.complete_teacher_check(data);
                                break;
                            //老师填写实现情况
                            case api_add_situation:
                                layer.closeAll();
                                toastr.success('保存成功');
                                ajax_post(api_teacher_check,
                                    {classID:this.fk_class_id,
                                        gradeID:this.fk_grade_id,
                                        tar_schoolyear:this.tar_schoolyear,
                                        tar_semester:this.tar_semester
                                    },this);
                                break;

                        }
                    }
                },
                complete_get_all_grade:function (data) {
                    this.grade_list = data.data;
                    this.fk_grade_id = this.grade_list[0].grade_id;
                    this.fk_grade_name=this.grade_list[0].grade_name;
                    this.class_list = this.grade_list[0].class_list;
                    this.fk_class_id = this.class_list[0].class_id;
                    //判断管理者能否编辑当前班级学生
                    if(this.lead_class_list.length>0 && this.lead_class_list[0].class_list[0].class_id == this.fk_class_id){
                        this.is_headmaster = true;
                    }else{
                        this.is_headmaster = false;
                    }
                    ajax_post(api_sem,{grade_id:self.fk_grade_id},self);
                    // ajax_post(api_get_module_time,{module_type:"6",grade_id:this.fk_grade_id},this);
                },
                //学年学期集合
                sem_list:[],
                //获取学年学期
                complete_get_sem:function(data){
                    this.sem_list = data.data.list.reverse();
                    this.fk_semester = this.sem_list[0].remark;
                    this.tar_schoolyear = this.fk_semester.substr(0,3);
                    this.tar_semester = this.fk_semester.substr(3,2);
                    ajax_post(api_get_module_time,{module_type:"6",grade_id:this.fk_grade_id},this);
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
                    //判断管理者能否编辑当前班级学生
                    if(this.lead_class_list.length>0 && this.lead_class_list[0].class_list[0].class_id == this.fk_class_id){
                        this.is_headmaster = true;
                    }else{
                        this.is_headmaster = false;
                    }
                    ajax_post(api_get_all_stu,{fk_class_id:this.fk_class_id},this);
                },
                classChange:function () {
                    ajax_post(api_get_all_stu,{fk_class_id:this.fk_class_id},this);
                    //判断管理者能否编辑当前班级学生
                    if(this.lead_class_list.length>0 && this.lead_class_list[0].class_list[0].class_id == this.fk_class_id){
                        this.is_headmaster = true;
                    }else{
                        this.is_headmaster = false;
                    }
                },
                semesterChange:function () {
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
                        all_stu[i].score = "";
                    }
                    for(var i=0;i<complete_stu_length;i++){
                        for(var j=0;j<all_stu_length;j++){
                            if(all_stu[j].guid == complete_stu[i].tar_ownerid){
                                all_stu[j].tar_situation = complete_stu[i].tar_situation;
                                all_stu[j].tar_targetplan = complete_stu[i].tar_targetplan;
                                all_stu[j].id = complete_stu[i].id;
                                if(complete_stu[i].hasOwnProperty('score')){
                                    all_stu[j].score = complete_stu[i].score;
                                }
                            }
                        }
                    }
                    this.student_list = all_stu;
                    // console.log(this.student_list);
                },
                //编辑
                module_name:"",
                module_score:1,
                module_id:"",
                module_tar_situation:"",
                module_info:'',
                edit_btn:function (el) {
                    this.module_name=el.name;
                    this.module_id=el.id;
                    if(el.score === '' || el.score == 1){
                        this.module_score = 1;
                        this.module_tar_situation = '好';
                        this.module_info = "1|好";
                        // this.module_info = "1+'|'+'好'";
                    }else if(el.score == 0.5){
                        this.module_score = 0.5;
                        this.module_tar_situation = '一般';
                        this.module_info = "0.5|一般";
                        // this.module_info = "0.5+'|'+'一般'";
                    }else if(el.score == 0){
                        this.module_score = 0;
                        this.module_tar_situation = '未完成';
                        this.module_info = "0|未完成";
                        // this.module_info = "0+'|'+'未完成'";
                    }
                    // if(el.tar_situation==undefined){
                    //     this.module_tar_situation='';
                    // }else{
                    //     this.module_tar_situation=el.tar_situation;
                    //
                    // }
                    layer.open({
                        type: 1,
                        skin: 'layui-layer-demo', //样式类名
                        area: ['500px', '230px'], //宽高
                        closeBtn: 1, //不显示关闭按钮
                        anim: 2,
                        shadeClose: false, //开启遮罩关闭
                        content: $("#content_div")
                    });
                },
                //评价内容切换
                module_change:function(){
                    var info = this.module_info;
                    this.module_score = info.split('|')[0];
                    this.module_tar_situation = info.split('|')[1];
                },
                cancel:function () {
                    layer.closeAll();
                },
                add:function () {
                    if($.trim(this.module_tar_situation)==''){
                        toastr.warning('实现情况不能为空哦')
                    }else{
                        ajax_post(api_add_situation,
                            {module_type:6,id:this.module_id,score:this.module_score,tar_situation:this.module_tar_situation,gradeID:vm.fk_grade_id
                        },this)
                    }
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




