/**
 * Created by uptang on 2017/6/5.
 */
define([
        "jquery",'layer',
        C.CLF('avalon.js'),
        C.Co("daily_performance", "publicity/public_statistical_results/public_statistical_results", "css!"),
        C.Co("daily_performance", "publicity/public_statistical_results/public_statistical_results", "html!"),
        C.CM("table"),
        C.CMF("data_center.js"), "PCAS",C.CM('three_menu_module'),
        C.CMF('partial_loading/loading.js'),],
    function ($, layer,avalon,css, html, table, data_center, PCAS,three_menu_module,pl) {
        //审核公式管控-查询
        var api_query_pub = api.api+'GrowthRecordBag/publicity_audit_query';
        //校级公示-年级、班级
        var api_grade_class = api.user+'class/school_class.action';
        //年级公示-班级
        var api_get_class = api.user+'class/findClassSimple.action';
        //查询项目
        var api_get_project=api.api+"Indexmaintain/find_project_by_state";
        //获取表头
        var api_get_table_head=api.api+"Indexmaintain/get_yjzb_title";
        //获取数据
        // var api_get_info=api.api+"Indexmaintain/indexmaintain_releaseResult";
        //获取数据
        var api_get_info=api.api+"Indexmaintain/page_semester_result";
        //提异议
        var api_add_objection=api.api+"Indexmaintain/indexmaintain_addObjection";
        //判断后台班级名称是否返回'班'
        avalon.filters.class_ban = function(name){
            if(name.indexOf("班") != -1)
                return name;
            else
                return name+'班'
        };
        var content_pl = undefined;
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "public_statistical_results",
                //身份判断
                user_type:'',
                //公示管控范围:0-未设置、不公示；1-全校可见；2-本年级可见；3-本班可见
                pub_range:0,
                //年级可操作学年学期
                semester_list:[],
                teach_class_list:[],
                project_obj:[],
                class_list:[],
                //学籍号
                stu_num:'',
                //学生姓名
                stu_name:'',
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

                form:{
                    city:"",
                    classId:'',
                    district:"",
                    gradeId:'',
                    rows:9999,
                    offset:0,
                    schoolId:"",
                    semesterId:"",
                    state:2,//1:未发布，2：发布（公示），3：待审核，4：二次公示，5：归档
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
                //初始化
                init:function(){
                    content_pl = new pl();
                    content_pl.init({
                       target:'#content-pl',
                       type:1
                    });
                    content_pl.start();
                    //公式管控
                    ajax_post(api_query_pub,{},this);
                },
                cb: function() {
                    var self = this;
                    //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                    var pub_range = self.pub_range;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data["user"]);
                        var user_type=data.data.user_type;
                        self.user_type = user_type;
                        self.form.city = userData.city;
                        self.form.district = userData.district;
                        //提异议者的姓名
                        self.add_objection.name1=userData.name;
                        //提异议者的编号
                        self.add_objection.nameId1=userData.guid;
                        var fk_school_id=userData.fk_school_id;
                        self.form.schoolId = fk_school_id;
                        if(user_type == 1){//教师
                            if(pub_range == 1){//全校可见
                                ajax_post(api_grade_class,{school_id:self.form.schoolId},self);
                            }else if(pub_range == 2){//本年级可见
                                var t_grade = userData.teach_class_list;
                                var l_grade = userData.lead_class_list;
                                for(var i=0;i<l_grade.length;i++){
                                    var has = false;
                                    var g_id = l_grade[i].grade_id;
                                    for(var j=0;j<t_grade.length;j++){
                                        var id = t_grade[j].grade_id;
                                        var obj = {};
                                        if(g_id == id){
                                            has = true;
                                            break;
                                        }
                                    }
                                    if(has == false){
                                        t_grade.push(l_grade[i]);
                                    }
                                }
                                self.teach_class_list = t_grade;
                                var grade_id = self.teach_class_list[0].grade_id;
                                self.semester_list = cloud.grade_semester_mapping_list({grade_id:grade_id});
                                self.form.semesterId = self.semester_list[0].id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{
                                    fk_school_id:self.form.schoolId,
                                    fk_grade_id:grade_id
                                },self);
                            }else if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                var t_grade = userData.teach_class_list;
                                var l_grade = userData.lead_class_list;
                                for(var i=0;i<l_grade.length;i++){
                                    var has = false;
                                    var g_id = l_grade[i].grade_id;
                                    for(var j=0;j<t_grade.length;j++){
                                        var id = t_grade[j].grade_id;
                                        var obj = {};
                                        if(g_id == id){
                                            has = true;
                                            break;
                                        }
                                    }
                                    if(has == false){
                                        t_grade.push(l_grade[i]);
                                    }
                                }
                                self.teach_class_list = t_grade;
                                self.class_list = self.teach_class_list[0].class_list;
                            }
                        }else if(user_type==2){//学生
                            //提异议者的年级编号
                            self.add_objection.gradeId=userData.fk_grade_id;
                            //提异议者的班级编号
                            self.add_objection.classId=userData.fk_class_id;
                            if(pub_range == 1){//全校可见
                                ajax_post(api_grade_class,{school_id:self.form.schoolId},self);
                            }else if(pub_range == 2){//本年级可见
                                //年级
                                var gb = {
                                    grade_id:userData.fk_grade_id,
                                    grade_name:userData.grade_name
                                };
                                self.teach_class_list.push(gb);
                                var grade_id = self.teach_class_list[0].grade_id;
                                self.semester_list = cloud.grade_semester_mapping_list({grade_id:grade_id});
                                self.form.semesterId = self.semester_list[0].id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{
                                    fk_school_id:self.form.schoolId,
                                    fk_grade_id:grade_id
                                },self);
                            }else if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id:userData.fk_grade_id,
                                    grade_name:userData.grade_name
                                };
                                self.teach_class_list.push(gb);
                                //班级
                                var obj={
                                    class_id:userData.fk_class_id,
                                    class_name:userData.class_name
                                };
                                self.class_list.push(obj);
                                self.semester_list = cloud.grade_semester_mapping_list({grade_id:userData.fk_grade_id});
                                self.form.semesterId = self.semester_list[0].id;
                            }
                        }else if(user_type == 3){//家长
                            //子女基本信息
                            var stuInfo = userData.student;
                            self.form.city = stuInfo.city;
                            self.form.district = stuInfo.district;
                            //提异议者的姓名
                            self.add_objection.name1=stuInfo.name;
                            //提异议者的编号
                            self.add_objection.nameId1=stuInfo.guid;
                            var fk_school_id=stuInfo.fk_school_id;
                            self.form.schoolId=fk_school_id;
                            if(pub_range == 1){//全校可见
                                ajax_post(api_grade_class,{school_id:self.form.schoolId},self);
                            }else if(pub_range == 2){//本年级可见
                                //年级
                                var gb = {
                                    grade_id:stuInfo.fk_grade_id,
                                    grade_name:stuInfo.grade_name
                                };
                                self.teach_class_list.push(gb);
                                var grade_id = self.teach_class_list[0].grade_id;
                                self.semester_list = cloud.grade_semester_mapping_list({grade_id:grade_id});
                                self.form.semesterId = self.semester_list[0].id;
                                //获取指定学校年级的班级集合
                                ajax_post(api_get_class,{
                                    fk_school_id:self.form.schoolId,
                                    fk_grade_id:grade_id
                                },self);
                            }else if(pub_range == 3 || pub_range == 0) {//本班可见、不公式、未设置
                                //年级
                                var gb = {
                                    grade_id:stuInfo.fk_grade_id,
                                    grade_name:stuInfo.grade_name
                                };
                                self.teach_class_list.push(gb);
                                //班级
                                var obj={
                                    class_id:stuInfo.fk_class_id,
                                    class_name:stuInfo.class_name
                                };
                                self.class_list.push(obj);
                                self.semester_list = cloud.grade_semester_mapping_list({grade_id:stuInfo.fk_grade_id});
                                self.form.semesterId = self.semester_list[0].id;
                            }
                        }

                    });
                },

                //切换年级
                gradeChange:function () {
                    var get_grade_id=Number(this.grade_info.split('|')[0]);
                    this.form.gradeId=get_grade_id;
                    this.semester_list = cloud.grade_semester_mapping_list({grade_id:get_grade_id});
                    this.form.semesterId = this.semester_list[0].id;
                    this.add_objection.gradeId2=get_grade_id;
                    this.get_project_info_name=this.grade_info.split('|')[1];
                    this.get_grade_info_name = this.grade_info.split('|')[1];
                    var pub_range = this.pub_range;
                    if(pub_range == 2){//年级公示
                        var school_id = this.form.schoolId;
                        //获取指定学校年级的班级集合
                        ajax_post(api_get_class,{fk_school_id:school_id,fk_grade_id:get_grade_id},this);
                        return;
                    }
                    var lead_class_length=this.teach_class_list.length;
                    for(var i=0;i<lead_class_length;i++){
                        if(get_grade_id==this.teach_class_list[i].grade_id){
                            this.class_list=this.teach_class_list[i].class_list;
                            this.form.classId=this.teach_class_list[i].class_list[0].class_id;
                            this.add_objection.classId2=this.teach_class_list[i].class_list[0].class_id;
                        }
                    }
                    this.query_column()
                },

                //班级
                classChange:function () {
                    this.form.classId=Number(this.class_id);
                    this.add_objection.classId2=this.form.classId;
                    this.query_column()
                },
                //查看评价表头
                query_column:function () {
                    var form = {"city":"成都市","district":"","fk_bj_id":"","fk_nj_id":37,"fk_xx_id":"","fk_xq_id":7};
                    if(this.user_type == '3'){
                        form.city = cloud.parent_stu().city;
                        form.district = cloud.parent_stu().district;
                        form.fk_xx_id = cloud.parent_stu().fk_school_id;
                    }else{
                        form.city = cloud.user_city();
                        form.district = cloud.user_district();
                        form.fk_xx_id = cloud.user_school_id();
                    }
                    form.fk_bj_id = this.form.classId;
                    form.fk_nj_id = this.form.gradeId;
                    // /**
                    //  * 由于后台原因，暂时怕屏蔽
                    //  * */
                    // cloud.semester_current({}, function (url, ars, data) {
                    //     form.fk_xq_id = data.id;
                    //     ajax_post(api_get_table_head,form, vm);
                    // });
                    form.fk_xq_id = this.form.semesterId;
                    ajax_post(api_get_table_head,form, vm);
                },

                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //公示审核管控
                            case api_query_pub:
                                this.complete_query_pub(data);
                                $(".ui-loading").css("display","none");
                                break;
                            // 校级公示-年级班级
                            case api_grade_class:
                                this.complete_grade_class(data);
                                break;
                            //    年级公示-班级
                            case api_get_class:
                                this.complete_get_class(data);
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
                                $(".ui-loading").css("display","none");
                                break;
                            //提异议
                            case api_add_objection:
                                toastr.success("提交异议成功");
                                break;
                        }
                    } else {
                        content_pl.stop();
                        toastr.error(msg);
                    }
                },
                //公示审核管控
                complete_query_pub:function(data){
                    var self = this;
                    var list = data.data;
                    if(list != null && list.length>0){
                        //mkid（模块id）：1.日常表现2.综合实践活动3.成就奖励4.学业成绩5.体质健康测评6.标志性卡7.学期评价8.毕业评价
                        //gsfw（公示范围）：0.不公示1.全校可见2.本年级可见3.本班可见
                        //sfsh（是否审核）：0否1是2学生录入教师审3教师录入评价小组审
                        //xsqr（学生确认）：0否1是
                        for(var i=0;i<list.length;i++){
                            var mkid = list[i].mkid;
                            if(mkid == 7){
                                self.pub_range = list[i].gsfw;
                                break;
                            }
                        }
                    }
                    self.cb();
                },
                // 校级公示-年级班级
                complete_grade_class:function (data) {
                    this.teach_class_list=data.data;
                    this.form.gradeId=this.teach_class_list[0].grade_id;
                    this.semester_list = cloud.grade_semester_mapping_list({grade_id:this.form.gradeId});
                    this.form.semesterId = this.semester_list[0].id;
                    this.add_objection.gradeId2=this.teach_class_list[0].grade_id;
                    this.get_grade_info_name=this.teach_class_list[0].grade_name;
                    this.class_list=this.teach_class_list[0].class_list;
                    this.form.classId=this.class_list[0].class_id;
                    this.add_objection.classId2=this.class_list[0].class_id;
                    this.query_column();
                },
                //年级公示-班级
                complete_get_class:function(data){
                    var list = data.data;
                    this.class_list = list;
                    this.form.gradeId=this.teach_class_list[0].grade_id;
                    this.add_objection.gradeId2=this.teach_class_list[0].grade_id;
                    this.get_grade_info_name=this.teach_class_list[0].grade_name;
                    this.form.classId=this.class_list[0].id;
                    this.add_objection.classId2=this.class_list[0].id;
                    this.query_column();
                },
                complete_get_project:function (data) {
                    var dataList=data.data;
                    if(dataList.length==0){
                        this.project_obj=[{ca_name:"暂无项目"}];
                        this.show_level=false;
                        this.table_show=false;
                        this.p_show = true;
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
                        ajax_post(api_get_table_head,{subjectId:this.project_id},this);
                    }
                },
                //获取表头
                complete_get_table_head:function (data) {
                    var dataL = data.data;
                    dataL = [{signName1:'思想品德'},{signName1:'学业水平'},{signName1:'身心健康'},{signName1:'艺术素养'},{signName1:'社会实践'}];
                    var arr = ['加分项','综合分值','综合评价'];
                    for(var i =0 ;i<arr.length;i++){
                        var add_={};
                        add_.signName1 = arr[i];
                        dataL.push(add_)
                    }
                    this.get_thead=dataL;
                    //获取数据
                    // this.form.semesterId = 4;
                    this.list_info();
                },
                list_info:function(){
                    content_pl.start();
                    this.form.stu_num = this.stu_num.trim();
                    this.form.stu_name = this.stu_name.trim();
                    ajax_post(api_get_info,this.form,this);
                },

                //得到数据
                complete_get_info:function (data) {
                    if(data.data != null && data.data != [] && data.data != undefined && data.data.count>0 && data.data.list.length>0){
                        var dataList=data.data.list;
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
                    content_pl.stop();
                },
                //提出异议
                dissentClick: function(el) {
                    var self=this;
                    this.add_objection.subjectId = Number(el.subjectId);
                    this.add_objection.name2=el.studentName;
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
                vm.init();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });