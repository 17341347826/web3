/**
 * Created by Administrator on 2018/6/15.
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.Co("self_evaluation_management","by_self_comment/by_self_comment","css!"),
        C.Co("self_evaluation_management","by_self_comment/by_self_comment","html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        'layer'
    ],
    function($, avalon,css,html, x, data_center,layer) {
        //查询获取年级可操作学期-- 判断当前学生能否进行评语(如果当前学生毕业了，是判断不了的)
        var api_semester_is_fill=api.api+"base/semester/grade_opt_semester";
        //查询模块时间
        var api_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_server_time=api.api+'base/baseUser/current_time';
        //查询自评
        var api_query_remark=api.api+'Indexmaintain/query_bybg_remark';
        //添加、修改自评
        var api_add_remark=api.api+'Indexmaintain/add_or_update_bybg_remark';
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "by_self_comment",
                //当前学年学期
                current_sem:{},
                //学生guid
                stu_guid:'',
                //学生学籍号
                stu_code:'',
                //判断当前时间是否可以编写
                read_type:true,
                //模块开始时间
                module_start:'',
                //模块结束时间
                module_end:'',
                //模块开关
                is_switch:'',
                //当前时间
                current_time:'',
                //添加参数
                add_data:{
                    //班级id	number	必填
                    class_id:'',
                    //年级id	number	必填
                    grade_id:'',
                    //年级名字	string	必填
                    grade_name:'',
                    //学校id	number	必填
                    school_id:'',
                    //身份	number	//1.学生2.老师
                    identity:1,
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
                        var tUserData = JSON.parse(data.data["user"]);
                        var fk_school_id = tUserData.fk_school_id;
                        // var id=tUserData.guid;
                        // var code=tUserData.code;
                        self.stu_guid = tUserData.guid;
                        self.stu_code = tUserData.code;
                        self.add_data.class_id = tUserData.fk_class_id;
                        self.add_data.grade_id = tUserData.fk_grade_id;
                        self.add_data.grade_name = tUserData.grade_name;
                        self.add_data.school_id = tUserData.fk_school_id;
                        self.add_data.stu_id = tUserData.guid;
                        self.add_data.stu_name = tUserData.name;
                        self.add_data.stu_num = tUserData.code;
                        //学年学期评语
                        // ajax_post(api_semester_is_fill,{grade_id:self.add_data.grade_id},self);
                        //学生当前学年学期
                        self.current_sem = JSON.parse(data.data["semester"]);
                        var remark =self.current_sem.remark;
                        if(remark == '九年级下'){//可编辑
                            //模块时间
                            ajax_post(api_module_time,{module_type:"12",grade_id:self.add_data.grade_id},self);
                        }else{//不可编辑
                            self.read_type = false;
                            toastr.info('评价未开始')
                        }
                    });
                },
                //保存
                save:function(){
                    //先判断当前是否可编辑
                    if(this.read_type == false){
                        toastr.info('评价未开始')
                        return;
                    }
                    if(this.add_data.stu_remark == ''){
                        toastr.warning('请填写自我描述');
                    }else if(this.add_data.stu_remark.length>800){
                        toastr.warning('自我描述内容不超过800字');
                    }else{
                        ajax_post(api_add_remark,this.add_data.$model,this);
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    var file = $("#file-uploading");
                    if (is_suc) {
                        switch (cmd) {
                            // //查询当前年级可操作的学年学期
                            // case api_semester_is_fill:
                            //     this.complete_get_semester(data);
                            //     break;
                            //模块时间
                            case api_module_time:
                                this.complete_module_time(data);
                                break;
                            //    当前时间
                            case api_server_time:
                                this.complete_server_time(data);
                                break;
                            //查询
                            case api_query_remark:
                                this.complete_query_remark(data);
                                break;
                            //添加
                            case api_add_remark:
                                this.complete_add_remark(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //学年学期
                // complete_get_semester:function(data){
                //     var dataList = data.data.list;
                //     if(dataList.length == 6){//可编辑
                //         // this.read_type = true;
                //     }else{//不可编辑
                //         this.read_type = false;
                //     }
                //     //模块时间
                //     ajax_post(api_module_time,{module_type:"12",grade_id:this.add_data.grade_id},this);
                // },
                //模块时间
                complete_module_time:function(data){
                    if(this.read_type){
                        if(data.data){
                            this.module_start=data.data.start_time;
                            this.module_end=data.data.end_time;
                            this.is_switch = data.data.is_switch;
                            // this.read_type = true;
                        }else{
                            this.read_type = false;//只读
                        }
                    }
                    ajax_post(api_server_time,{},this);
                },
                //当前时间
                complete_server_time:function(data){
                    if(this.read_type){
                        this.current_time=data.data.current_time;
                        var current_time=$(".current_time").text();
                        var current=new Date(current_time.replace(/\-/g, "\/"));
                        var start=new Date(this.module_start.replace(/\-/g, "\/"));
                        var end=new Date(this.module_end.replace(/\-/g, "\/"));
                        if(current >= start && current <= end && this.is_switch == true){
                            this.read_type = true;
                        }else{
                            this.read_type = false;
                        }
                    }
                    //查询
                    ajax_post(api_query_remark,{stu_id:this.stu_guid,stu_num:this.stu_code},this);
                },
                //查询
                complete_query_remark:function(data){
                    if(data.data.list.length==0)
                        return;
                    this.add_data.stu_remark=data.data.list[0].stu_remark;
                },
                //添加、修改评语
                complete_add_remark:function(data){
                    toastr.success('评语设置成功');
                    //查询
                    ajax_post(api_query_remark,{stu_id:this.add_data.stu_id,stu_num:this.add_data.stu_num},this);
                },
            });
            vm.cb();
            return vm;
        }

        return {
            view: html,
            define: avalon_define
        }
    })