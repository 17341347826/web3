/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",'layer',
        C.CLF('avalon.js'),
        C.Co("daily_performance", "publicity/two_publicity/two_publicity", "css!"),
        C.Co("daily_performance", "publicity/two_publicity/two_publicity", "html!"),
        C.CM("table"),
        C.CMF("data_center.js"),"PCAS"],
    function ($, layer,avalon,css, html, table, data_center, PCAS) {
        //获取年级
        var api_get_grade=api.PCPlayer+"class/school_class.action";
        //查询项目
        var api_get_project=api.api+"Indexmaintain/find_project_by_state";
        //获取表头
        var api_get_table_head=api.api+"Indexmaintain/indexmaintain_findTitle";
        //获取数据
        // var api_get_info=api.api+"Indexmaintain/indexmaintain_findtwopublicity";
        var api_get_info=api.api+"Indexmaintain/page_semester_result";
        //提异议
        var api_add_objection=api.api+"Indexmaintain/indexmaintain_addObjection";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "two_publicity",
                teach_class_list:[],
                project_obj:[],
                class_list:[],
                show_level:false,
                p_show:false,
                rank_count_arr:[],//等级个数
                //需要组合的数据
                get_thead:[],
                // student_obj:[],
                get_info:[],
                //组合完的数据
                tbodyThead:[],
                table_show:false,
                // form:{
                //     schoolId:2,
                //     gradeId:36,
                //     classId:32
                // },
                form:{
                    // classId:'',
                    // gradeId:'',
                    // schoolId:'',
                    // subjectId:""
                    // schoolId:"",
                    // subjectId:"",
                    city:"",
                    classId:"",
                    district:"",
                    gradeId:"",
                    offset:0,
                    rows:99999,
                    schoolId:"",
                    semesterId:"",
                    state:4,
                    studentName:"",
                    studentNum:""
                },
                add_objection:{
                    classId:"",//提异议者的班级编号
                    classId2:"",//被提议学生的班级编号
                    content:"",//异议内容
                    gradeId:"",//提异议者的年级编号
                    gradeId2:"",//被提异议学生的年级编号
                    name1:"",//提异议者的姓名
                    name2:"",//被提异议者的姓名
                    nameId1:"",//提异议者的编号
                    nameId2:"",//被提异议者的编号
                    subjectId:""//提异议的项目编号
                },
                start_time:"",
                end_time:"",
                project_id:"",
                class_id:"",
                //切换年级
                grade_info:"",
                get_grade_info_name:"",
                //切换项目
                project_info:"",
                get_project_info_name:"",
                semester:"",
                get_semester:function () {
                    cloud.semester_current({}, function (url, ars, data) {
                        vm.semester = data.id;
                        vm.cb();
                    });
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data["user"]);
                        var user_type=data.data.user_type;
                        self.form.city = cloud.user_city();
                        self.form.district = cloud.user_district();
                        self.form.semesterId = self.semester;
                        //提异议者的姓名
                        self.add_objection.name1=userData.name;
                        //提异议者的编号
                        self.add_objection.nameId1=userData.guid;
                        if(user_type==2){//学生
                            //提异议者的年级编号
                            self.add_objection.gradeId=userData.fk_grade_id;
                            //提异议者的班级编号
                            self.add_objection.classId=userData.fk_class_id;
                        }
                        var fk_school_id=userData.fk_school_id;
                        self.form.schoolId=fk_school_id;
                        ajax_post(api_get_grade,{school_id:fk_school_id},self);
                    });
                },
                //切换年级
                gradeChange:function () {
                    var get_grade_id=Number(this.grade_info.split('|')[0]);
                    // this.form.gradeId=get_grade_id;
                    this.add_objection.gradeId2=get_grade_id;
                    this.form.gradeId = get_grade_id;
                    this.get_project_info_name=this.grade_info.split('|')[1];
                    var lead_class_length=this.teach_class_list.length;
                    for(var i=0;i<lead_class_length;i++){
                        if(get_grade_id==this.teach_class_list[i].grade_id){
                            this.class_list=this.teach_class_list[i].class_list;
                            // this.form.classId=this.teach_class_list[i].class_list[0].class_id;
                            this.add_objection.classId2=this.teach_class_list[i].class_list[0].class_id;
                            this.form.classId = this.add_objection.classId2;
                        }
                    }
                    // this.form.gradeId=get_grade_id;
                    //获取项目
                    ajax_post(api_get_project,{ca_gradeid:this.add_objection.gradeId2.toString(),ca_workid:this.form.schoolId.toString(),state:4},this);

                },
                classChange:function () {
                    // this.form.classId=Number(this.class_id);
                    this.add_objection.classId2=this.form.classId;
                    ajax_post(api_get_project,{ca_gradeid:this.add_objection.gradeId2,ca_workid:this.form.schoolId.toString(),state:4},this);
                },
                //切换项目
                projectChange:function () {
                    this.get_project_info_name=this.project_info.split('|')[1];
                    this.project_id=Number(this.project_info.split('|')[0]);
                    this.form.subjectId=this.project_id;
                    this.add_objection.subjectId=this.project_id;
                    ajax_post(api_get_table_head,{subjectId:this.project_id,grade_id:this.add_objection.gradeId2,semester_id:this.semester},this);
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级
                            case api_get_grade:
                                this.complete_get_grade(data);
                                break;
                            //获取项目
                            case api_get_project:
                                this.complete_get_project(data);
                                break;
                            //获取表头
                            case api_get_table_head:
                                this.complete_get_table_head(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                            //提异议
                            case api_add_objection:
                                layer.msg("提交异议成功");
                                break;
                        }
                    } else {
                        layer.msg(msg);
                    }
                },
                complete_get_grade:function (data) {
                    this.teach_class_list=data.data;
                    // this.form.gradeId=this.teach_class_list[0].grade_id;
                    this.add_objection.gradeId2=this.teach_class_list[0].grade_id;
                    this.get_grade_info_name=this.teach_class_list[0].grade_name;
                    this.class_list=this.teach_class_list[0].class_list;
                    // this.form.classId=this.class_list[0].class_id;
                    this.add_objection.classId2=this.class_list[0].class_id;
                    this.form.classId = this.add_objection.classId2;
                    this.form.gradeId = this.add_objection.gradeId2;
                    ajax_post(api_get_project,{ca_gradeid:this.add_objection.gradeId2.toString(),ca_workid:this.form.schoolId.toString(),state:4},this);
                },
                complete_get_project:function (data) {
                    var dataList=data.data;
                    if(dataList.length==0){
                        this.project_obj=[{ca_name:"暂无项目"}];
                        this.show_level=false;
                        this.table_show=false;
                        this.p_show=true;
                    }else{
                        this.project_obj=dataList;
                        this.get_project_info_name=dataList[0].ca_name;
                        if(!this.project_id){
                            this.project_id=dataList[0].id;
                            this.form.subjectId=this.project_id;
                            this.add_objection.subjectId=this.project_id;
                        }
                        this.start_time=dataList[0].ca_starttime;
                        this.end_time=dataList[0].ca_endtime;
                        //获取表头
                        ajax_post(api_get_table_head,{subjectId:this.project_id,grade_id:this.add_objection.gradeId2,semester_id:this.semester},this);
                    }
                },
                //获取表头
                complete_get_table_head:function (data) {
                    var dataL = data.data;
                    var arr = ['加分项','综合分值','综合评价'];
                    for(var i =0 ;i<arr.length;i++){
                        var add_={};
                        add_.signName1 = arr[i];
                        dataL.push(add_)
                    }
                    this.get_thead=dataL;
                    //获取数据
                    ajax_post(api_get_info,this.form,this);
                },
                //得到数据
                complete_get_info:function (data) {
                    var dataList=data.data.list;
                    if(data.data.list.length>0){
                        for(var i=0;i<dataList.length;i++){
                            var scoreValue = dataList[i].scoreValue;//总分
                            var score_plus = dataList[i].score_plus;//加分
                            dataList[i].percentileOne+=','+score_plus+',';
                            dataList[i].percentileOne+=scoreValue;
                            dataList[i].percentileOne=dataList[i].percentileOne.split(',');
                        }
                        dataList.index_name=this.get_thead;
                        this.tbodyThead=dataList.index_name;
                        this.get_info=dataList;
                        this.table_show=true;
                        this.p_show=false;
                    }else{
                        this.table_show=false;
                        this.p_show=true;
                    }

                },
                //提出异议
                dissentClick: function(el) {
                    var self=this;
                    this.add_objection.name2=el.studentName;
                    this.add_objection.nameId2=el.studentNum;
                    this.add_objection.nameId2=el.studentId;
                    layer.prompt({title: '请填写异议', formType: 2}, function(text, index){
                        if($.trim(text)!=""){
                            self.add_objection.content=text;
                            ajax_post(api_add_objection,self.add_objection,self);
                        }
                        layer.close(index);
                    });
                }
            });
            vm.$watch("onReady", function() {
                $(".am-dimmer").css("display","none");
                vm.get_semester();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });