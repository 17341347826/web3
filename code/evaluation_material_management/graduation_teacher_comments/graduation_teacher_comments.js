/**
 * Created by Administrator on 2018/3/22.
 */
define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("evaluation_material_management", "graduation_teacher_comments/graduation_teacher_comments", "css!"),
        C.Co("evaluation_material_management", "graduation_teacher_comments/graduation_teacher_comments", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),
        C.CM("three_menu_module")
    ],
    function($, avalon, layer,css,html, x,data_center,three_menu_module) {
        //查询获取年级可操作学期
        var api_semester_is_fill=api.api+"base/semester/grade_opt_semester";
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        //列表查询学生
        // var api_get_all_stu=api.api+"base/baseUser/studentlist.action";
        //查询自评
        var api_query_remark=api.api+'Indexmaintain/query_bybg_remark';
        //添加、修改自评
        var api_add_remark=api.api+'Indexmaintain/add_or_update_bybg_remark';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "graduation_teacher_comments",
                //年级集合
                grade_list:[],
                grade_info:'',
                //班级集合
                class_list:[],
                class_info:'',
                //学年学期
                semester_list:[],
                seme_info:'',
                //模块时间
                module_start:'',
                module_end:'',
                //模块开关
                is_switch:"",
                //当前时间
                current_time:'',
                //当前可编辑的却年学期
                yearSemester:'',
                //查看、编辑
                is_fill:"",
                //学生列表
                // student_list:[],
                //数据集合
                data_list:[],
                //添加参数
                add_data:{
                    //班级id	number	必填
                    class_id:'',
                    //年级id	number	必填
                    grade_id:'',
                    //年级名字	string	必填
                    grade_name:'',
                    //身份	number	//1.学生2.老师
                    identity:2,
                    //学校id	number	必填
                    school_id:'',
                    //学生id	number	必填
                    stu_id:'',
                    //学生姓名	string	必填
                    stu_name:'',
                    //学生学号	string	必填
                    stu_num:'',
                    //学生自评内容	string	必填
                    stu_remark:'',
                    //老师id	number	必填
                    teacher_id:'',
                    //老师名字	string	必填
                    teacher_name:'',
                    //老师评价内容	string	必填
                    teacher_remark:'',
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        // //年级综合
                        // var t_grade=userData.teach_class_list;
                        // var l_grade=userData.lead_class_list;
                        // for(var i=0;i<l_grade.length;i++){
                        //     var has=false;
                        //     var id=l_grade[i].grade_id;
                        //     for(var j=0;j<t_grade.length;j++){
                        //         if(t_grade[j].grade_id==id){
                        //             has=true;
                        //             break;
                        //         }
                        //     }
                        //     if(has==false){
                        //         t_grade.push(l_grade[i]);
                        //     }
                        // }
                        // self.grade_list=t_grade;
                        self.grade_list = userData.lead_class_list;
                        self.class_list =  self.grade_list[0].class_list;
                        self.add_data.class_id=self.class_list[0].class_id;
                        self.add_data.grade_id=self.grade_list[0].grade_id;
                        self.add_data.grade_name=self.grade_list[0].grade_name;
                        self.add_data.school_id=userData.fk_school_id;
                        self.add_data.teacher_id=userData.user_id;
                        self.add_data.teacher_name=userData.name;
                        //获取当前可用的学年学期
                        ajax_post(api_semester_is_fill,{grade_id:self.add_data.grade_id},self);
                    });
                },
                //年级改变
                gradeChange:function(){
                    var grade_id=this.grade_info.split('|')[0];
                    this.add_data.grade_id=this.grade_info.split('|')[0];
                    this.add_data.grade_name=this.grade_info.split('|')[1];
                    var gradeList = this.grade_list;
                    var grade_list_length = this.grade_list.length;
                    for(var i=0;i<grade_list_length;i++){
                        if(grade_id == gradeList[i].grade_id){
                            this.class_list = gradeList[i].class_list;
                            this.add_data.class_id = gradeList[i].class_list[0].class_id;
                        }
                    }
                    //查询
                    ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                },
                //班级改变
                classChange:function(){
                    //查询
                    ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                },
                //学年学期
                semesterChange:function(){
                    // var semester = this.seme_info;
                    // var semester_name = semester.split("|")[0];
                    // var semester_index = Number(semester.split("|")[1]);
                    //查询
                    ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                },
                //编辑
                edit_btn:function(el){
                    console.log(el);
                    var self=this;
                    self.add_data.stu_id=el.stu_id;
                    self.add_data.stu_num=el.stu_num;
                    self.add_data.stu_name=el.stu_name;
                    var name=el.stu_name;
                    var semester_name=self.seme_info.split('|')[0];
                    var title="请对"+"【"+name+"】"+"进行"+semester_name+"期的评价";
                    // 对prompt赋初值
                    var value = el.teacher_remark;
                    layer.prompt({title: title,value:value,formType: 2}, function(text, index){
                        // text = el.teacher_remark;
                        if($.trim(text)!=''){
                            self.add_data.teacher_remark=text;
                            ajax_post(api_add_remark,self.add_data.$model,self);
                            layer.closeAll();
                        }
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取年级可操作学期
                            case api_semester_is_fill:
                                this.complete_semester_is_fill(data);
                                break;
                            //查询模块时间
                            case api_get_module_time:
                                this.complete_module_time(data);
                                break;
                            //查询服务器当前时间
                            case api_get_server_time:
                                this.complete_server_time(data);
                                break;
                            // //查询学生列表
                            // case api_get_all_stu:
                            //     this.complete_get_all_stu(data);
                            //     break;
                            //查询
                            case api_query_remark:
                                this.complete_query_remark(data);
                                break;
                            //添加
                            case api_add_remark:
                                this.complete_add_remark(data);
                                break;
                        }
                    }else {
                        toastr.error(msg);
                    }
                },
                //获取年级可操作学期
                complete_semester_is_fill:function (data) {
                    var dataList=data.data.list;
                    // this.semester_list=dataList;
                    // this.seme_info=dataList[0].semester_name+"|"+
                    //     dataList[0].semester_index+"|"+
                    //     dataList[0].end_date+"|"+
                    //     dataList[0].start_date;
                    if(dataList.length == 6){//可编辑
                        // this.is_fill =1;
                    }else{//不可编辑
                        this.is_fill = 2;
                    }
                    ajax_post(api_get_module_time,{module_type:"13",grade_id:this.add_data.grade_id},this);
                },
                //模块时间
                complete_module_time:function(data){
                    if(this.is_fill != 2){
                        if(data.data){
                            this.module_start=data.data.start_time;
                            this.module_end=data.data.end_time;
                            this.is_switch = data.data.is_switch;
                            // this.is_fill =1;
                        }else{
                            this.is_fill = 2;//只能查看
                        }
                    }
                    ajax_post(api_get_server_time,{},this);
                },
                //当前服务器时间
                complete_server_time:function (data) {
                    if(this.is_fill!=2){
                        this.current_time=data.data.current_time;
                        var current_time=$(".current_time").text();
                        var currentDate=new Date(current_time.replace(/\-/g, "\/"));
                        var start=new Date(this.module_start.replace(/\-/g, "\/"));
                        var end=new Date(this.module_end.replace(/\-/g, "\/"));
                        if(start<currentDate && currentDate<end && this.is_switch == true){//可编辑
                            this.is_fill = 1;
                            // var dataList=this.semester_list;
                            // var dataList_length=dataList.length;
                            // for(var i=0;i<dataList_length;i++){
                            //     var start_x=this.timeChuo(dataList[i].start_date);
                            //     var end_x=this.timeChuo(dataList[i].end_date);
                            //     var semester_start=new Date(start_x.replace(/\-/g, "\/"));
                            //     var semester_end=new Date(end_x.replace(/\-/g, "\/"));
                            //     if(semester_start<currentDate && currentDate<semester_end){
                            //         this.yearSemester=dataList[i].semester_name+"|"+
                            //             dataList[i].semester_index+"|"+
                            //             dataList[i].end_date+"|"+
                            //             dataList[i].start_date;
                            //     }
                            // }
                        }else{
                            this.is_fill = 2;
                        }
                        // //查询
                        // ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                    }
                    //查询
                    ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                },
                // //学生列表
                // check_btn:function () {
                //     ajax_post(api_get_all_stu,{fk_class_id:this.add_data.class_id,
                //         fk_grade_id:this.add_data.grade_id,
                //         fk_school_id:this.add_data.school_id},this);
                // },
                // //学生
                // complete_get_all_stu:function (data) {
                //     this.student_list=data.data.list;
                //     var length=this.student_list.length;
                //     for(var i=0;i<length;i++){
                //         this.student_list[i].status="";
                //         //教师评语
                //         this.student_list[i].content_teacher="";
                //     }
                //     //查询
                //     ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                // },
                //查询
                complete_query_remark:function(data){
                    // var stu=this.student_list;
                    // if(data.data!=[]){
                    //     var list=data.data.list;
                    //     for(var i=0;i<stu.length;i++){
                    //         for(var j=0;j<list.length;j++){
                    //
                    //         }
                    //     }
                    // }
                    this.data_list=data.data.list;
                },
                //添加
                complete_add_remark:function(data){
                    toastr.success('评语设置成功');
                    //查询
                    ajax_post(api_query_remark,{class_id:Number(this.add_data.class_id)},this);
                },
                //js把时间戳转为为普通日期格式
                timeChuo:function(h){
                    var timestamp3 = h/1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1
                                    ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    }
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                },
            });
            vm.cb();
            return vm;
        };

        return {
            view: html,
            define: avalon_define
        }
    });




