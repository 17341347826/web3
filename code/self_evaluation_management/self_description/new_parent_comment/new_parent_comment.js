define(['jquery',
        C.CLF('avalon.js'), 'layer',
        C.Co("self_evaluation_management", "self_description/new_parent_comment/new_parent_comment", "css!"),
        C.Co("self_evaluation_management", "self_description/new_parent_comment/new_parent_comment", "html!"),
        C.CMF("router.js"),C.CMF("data_center.js"), C.CM('three_menu_module')
    ],
    function($, avalon, layer,css,html, x,data_center,three_menu_module) {
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        //查询当前可用的学年学期
        var api_semester_is_fill=api.api+"base/semester/grade_opt_semester";


        //家长查询
        var api_parent_check_list = api.api+"everyday/get_remarl_guardian";
        //家长查询
        var get_remarl_guardian_list = api.api+"everyday/get_remarl_guardian_list";
        //保存
        var api_add_comment = api.api+"everyday/remarl_guardian";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "new_parent_comment",
                account:"",
                name:"",
                user_type:"",
                start_time:"",
                end_time:"",
                current_time:"",
                is_fill:"",
                time:[],
                semester_list:[],
                fk_school_id:"",
                fk_class_id:"",
                fk_grade_id:"",
                fk_grade_name:"",
                fk_semester:"",
                grade:"",
                semester:"",
                yearSemester:"",//当前可编辑的却年学期
                student_list:[],
                get_student:[],
                local_ary:{},
                is_switch:"",
                //防止重复提交:true-能点击提交，false-不能点击提交
                btn_had:true,
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (Number(status) !== 200) {
                        toastr.error(msg);
                        return;
                    }
                    if (is_suc) {
                        switch (cmd) {
                            //查询当前可用的年级
                            case api_semester_is_fill:
                                this.complete_semester_is_fill(data);
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
                            //家长查询
                            case api_parent_check_list:
                                this.complete_parent_check_list(data);
                                break;
                            //家长查询
                            case get_remarl_guardian_list:
                                this.complete_parent_check_list(data);
                                break;
                            //提交
                            case api_add_comment:
                                toastr.success('编辑成功');
                                location.reload();
                                break;
                        }
                    }
                },

                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var userData = JSON.parse(data.data['user']);
                        var student = userData.student;
                        self.fk_grade_id = student.fk_grade_id;
                        self.guid = student.guid;
                        self.account = student.account;
                        self.name = student.name;
                        //获取当前可用的学年学期
                        ajax_post(api_semester_is_fill,{grade_id:self.fk_grade_id},self);
                    });
                },
                semester_length:"",
                arr:{},
                obj_list:[],
                count:0,
                complete_semester_is_fill:function (data) {
                    var dataList=data.data.list;
                    var dataListLength=dataList.length;
                    this.semester_list=dataList;
                    this.semester_length=dataListLength;
                    ajax_post(api_get_module_time,{
                        grade_id:Number(this.fk_grade_id),
                        module_type:"3",
                    },this);
                },

                show_table:false,
                new_obj:[],
                complete_parent_check_list:function (data) {
                    let obj = this.semester_list;
                    for (let i = 0; i < obj.length; i++) {
                        for (let j = 0; j < data.data.length; j++) {
                            // if (obj[i].semester_index === data.data[j].fk_grade_id && Number(obj[i].xn.slice(0, 4)) === data.data[j].grade) {
                            //     obj[i].content_guardian = data.data[j].content_guardian;
                            //     obj[i].code = data.data[j].code;
                            //     obj[i].student_id = data.data[j].student_id;
                            // }
                            if (obj[i].id == data.data[j].semester) {
                                obj[i].content_guardian = data.data[j].content_guardian;
                                obj[i].code = data.data[j].code;
                                obj[i].student_id = data.data[j].student_id;
                            }
                        }
                    }
                    this.new_obj = obj;
                    // var obj_list = this.obj_list;
                    // for(var p in obj_list){
                    //     if(obj_list[p] == null){
                    //         obj_list[p] = {code:"",content_guardian:"",student_id:"",semester_name:"",semester_id:""};
                    //         obj_list[p].code = this.account;
                    //         obj_list[p].content_guardian = "";
                    //         obj_list[p].student_id = this.guid;
                    //         obj_list[p].semester_name = p;
                    //         for(var i = 0;i<this.semester_list.length;i++){
                    //             if(p == this.semester_list[i].semester_name){
                    //                 obj_list[p].semester_id = this.semester_list[i].id;
                    //             }
                    //         }
                    //     }else{
                    //         obj_list[p]['semester_name'] = p;
                    //         for(var i = 0;i<this.semester_list.length;i++){
                    //             if(p == this.semester_list[i].semester_name){
                    //                 obj_list[p].semester_id = this.semester_list[i].id;
                    //             }
                    //         }
                    //     }
                    //     this.new_obj.push(obj_list[p]);
                    // }
                    this.show_table=true;
                },
                //当前服务器时间
                get_server_time:function (data) {
                    var self = this;
                    if(this.is_fill!=2){
                        this.current_time=data.data.current_time;
                        var current_time=$(".current_time").text();
                        var currentDate=new Date(current_time.replace(/\-/g, "\/"));
                        var start=new Date(this.start_time.replace(/\-/g, "\/"));
                        var end=new Date(this.end_time.replace(/\-/g, "\/"));
                        if(start<currentDate && currentDate<end && this.is_switch == true){//可编辑
                            this.is_fill=1;
                            var dataList=this.semester_list;
                            var dataList_length=dataList.length;
                            for(var i=0;i<dataList_length;i++){
                                var start_x=this.timeChuo(dataList[i].start_date);
                                var end_x=this.timeChuo(dataList[i].end_date);
                                var semester_start=new Date(start_x.replace(/\-/g, "\/"));
                                var semester_end=new Date(end_x.replace(/\-/g, "\/"));
                                if(semester_start<currentDate && currentDate<semester_end){
                                    this.yearSemester=dataList[i].semester_name;
                                }
                            }
                        }else{
                            this.is_fill=2;
                        }
                        let query_obj = {
                            grade_list: [],
                            semester_list: [],
                            student_id:self.guid
                        };
                        for (let i = 0; i < this.semester_list.length; i++) {
                            if (query_obj.grade_list.indexOf(Number(this.semester_list[i].semester_name.substr(0,4))) == -1 ) {
                                query_obj.grade_list.push(Number(this.semester_list[i].semester_name.substr(0,4)))
                            }
                            if (query_obj.semester_list.indexOf(this.semester_list[i].id) == -1){
                                query_obj.semester_list.push(this.semester_list[i].id)
                            }
                        }
                        ajax_post(get_remarl_guardian_list, query_obj, self);

                        // this.semester_list.forEach(function(p1){
                        //     var semester_index = p1.id;
                        //     var semester_name = p1.semester_name;
                        //     var semester = Number(semester_name.substr(0,4));
                        //     var xself = self;
                        //     var request_data = {
                        //         grade:semester,
                        //         semester:semester_index,
                        //         student_id:xself.guid,
                        //         on_request_complete: function(cmd, status, data, is_suc, msg) {
                        //             xself.count += 1;
                        //             // 对应每科的成绩情况
                        //             if (is_suc) {
                        //                 xself.arr[semester_name] = data.data;
                        //                 if( xself.count == xself.semester_list.length ){
                        //                     xself.obj_list = xself.arr;
                        //                     xself.complete_parent_check_list();
                        //
                        //                 }
                        //             } else {
                        //                 layer.msg(msg);
                        //             }
                        //         }
                        //     };
                        //     ajax_post(api_parent_check_list, request_data, request_data);
                        // })

                    }
                },
                //编辑
                add_btn:function (el) {
                    var self=this;
                    self.btn_had = true;
                    var name = this.name;
                    var fk_semester = el.semester_name;
                    var grade = fk_semester.substr(0,4);
                    var semester_index = fk_semester.substr(12,1);
                    var semester="";
                    if(semester_index=='上'){
                        semester = 1;
                    }else {
                        semester = 2;
                    }
                    var stu_info = cloud.user_user().student;
                    var guid = stu_info.guid;
                    var code = stu_info.code;
                    var semester_name = el.semester_name;
                    var fk_semester_id = el.id;
                    var title="请对"+"【"+name+"】"+"进行"+semester_name+"期的评价";
                    var content_guardian=el.content_guardian;
                    layer.prompt({title: title, formType: 2 ,value:content_guardian}, function(text, index){
                        if($.trim(text)!=''){
                            var value=text;
                            if(self.btn_had){
                                ajax_post(api_add_comment,{
                                    code:code,
                                    content_guardian:value,
                                    grade:grade,
                                    semester:fk_semester_id,
                                    student_id:guid,
                                    fk_grade_id:self.fk_grade_id,
                                    fk_semester_id:fk_semester_id,
                                    semester_name:semester_name
                                },self);
                                self.btn_had = false;
                            }
                            layer.closeAll();
                        }
                    });
                },
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
                    };
                    var getTimeIs=newDate.format('yyyy-MM-dd');
                    return getTimeIs;
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




