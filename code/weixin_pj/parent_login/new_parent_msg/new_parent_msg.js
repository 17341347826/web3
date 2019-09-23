/**
 * Created by Administrator on 2018/9/5.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj/parent_login", "new_parent_msg/new_parent_msg", "css!"),
        C.Co("weixin_pj/parent_login", "new_parent_msg/new_parent_msg", "html!"),
        C.CMF("data_center.js"), "jquery-weui"
    ],
    function ($, avalon, css, html, data_center, weui) {
        //获取年级可操作学期
        var api_get_semester = api.api + "base/semester/grade_opt_semester";
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //获取系统当前时间
        var api_get_server_time=api.api+'base/baseUser/current_time';
        //评语提交
        var remarl_guardian = api.api + "everyday/remarl_guardian";
        //评语查询
        var semester_get = api.api + "everyday/get_remarl_guardian";
        var avalon_define = function () {
            var vm = avalon.define({
                $id:"new_parent_msg",
                //学年学期集合
                semesterAry: [],
                //当前选中学年学期信息
                semester:'',
                //当前选中学年学期名字
                semester_name:'',
                //选中学年学期开始时间
                start_time:'',
                //选中学年学期结束时间
                end_time:'',
                //获取系统当前时间
                server_time:'',
                //获取模块开始时间
                module_start_time:'',
                //获取模块结束时间
                module_end_time:'',
                //模块是否是启用的
                is_switch:false,
                //评语内容
                remarl_content:'',
                //返回多个学期评语数组
                local_ary:[],
                //提交评语请求数据
                remarl:{
                    //	学生学籍号
                    code:'',
                    //家长评内容
                    content_guardian:'',
                    //学年	string	2017
                    grade:'',
                    //学期 1上学期2下学期	number
                    semester:'',
                    //子女学生的guid	number
                    student_id:'',
                    //学校id
                    fk_school_id:'',
                    //年级id
                    fk_grade_id:'',
                    //    班级id
                    fk_class_id:'',
                    //    年级名称
                    grade_name:'',
                    //    学校名称
                    school_name:'',
                    //    班级名称
                    class_name:'',
                    //    学年学期名称
                    semester_name:'',
                },
                //评语查看
                get_remarl:{
                    //学年（必填）	number	2017
                    grade:'',
                    //学期（必填）	number	1上学期2下学期
                    semester:'',
                    //学生guid	number
                    student_id:''
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var stu=tUserData.student;
                        // console.log(stu);
                        //获取子女年级
                        var grade_name=stu.grade_name;
                        // console.log(grade_name);
                        //获取子女年级id
                        var grade_id=stu.fk_grade_id;
                        // console.log(grade_id);
                        //学籍号
                        self.remarl.code=stu.code;
                        //子女guid
                        self.remarl.student_id=stu.guid;
                        self.get_remarl.student_id=stu.guid;
                        //学校id
                        self.remarl.fk_school_id=stu.fk_school_id;
                        //年级id
                        self.remarl.fk_grade_id  =stu.fk_grade_id;
                        //    班级id
                        self.remarl.fk_class_id =stu.fk_class_id;
                        //    年级名称
                        self.remarl.grade_name  =stu.grade_name;
                        //    学校名称
                        self.remarl.school_name =stu.school_name;
                        //    班级名称
                        self.remarl.class_name   =stu.class_name;
                    });
                    //获取系统当前时间
                    ajax_post(api_get_server_time,{},self);
                },
                //页面跳转评价/修改
                edit_btn:function(el){
                    this.remarl.semester = el.id;
                    this.remarl.grade =  Number(el.semester_name.substr(0,4));
                    this.remarl.semester_name = el.semester_name;
                    this.remarl.content_guardian = el.content.content_guardian;
                    window.sessionStorage.setItem('remarl_req',JSON.stringify(this.remarl.$model));
                    window.location.href = '#parent_msg_fill';
                },
                //确定
                save_btn:function(){
                    if ($.trim(this.remarl.content_guardian) != "") {
                        var self=this;
                        //学年学期开始时间--转换成北京标准时间
                        var start_time=new Date(self.timeChuo(self.start_time).replace(/\-/g, "\/"));
                        //学年学期结束时间
                        var end_time=new Date(self.timeChuo(self.end_time).replace(/\-/g, "\/"));
                        //系统时间
                        var server_time=new Date(self.server_time.replace(/\-/g, "\/"));
                        //模块开始时间
                        var module_start=new Date(self.module_start_time.replace(/\-/g, "\/"));
                        //模块结束时间
                        var module_end=new Date(self.module_end_time.replace(/\-/g, "\/"));
                        // console.log(start_time);
                        // console.log(end_time);
                        // console.log(server_time);
                        // console.log(module_start);
                        // console.log(module_end);
                        $.confirm({
                            title: '标题',
                            text: '是否提交评语',
                            onOK: function () {
                                if(start_time<server_time && server_time<end_time){
                                    if(module_start<server_time && server_time<module_end){
                                        // self.remarl_content=self.remarl.content_guardian;
                                        ajax_post(remarl_guardian,self.remarl.$model,self);
                                    }else{
                                        $.alert({
                                            title: '标题',
                                            text: '不在评语时间内',
                                            onOK: function () {
                                                //点击确认
                                            }
                                        });
                                    }
                                }else{
                                    $.alert({
                                        title: '标题',
                                        text: '不在当前学年学期评语时间内',
                                        onOK: function () {
                                            //点击确认
                                        }
                                    });
                                }
                            },
                            onCancel: function () {
                            }
                        });
                    }else{
                        $.alert({
                            title: '标题',
                            text: '评语不能为空',
                            onOK: function () {
                                //点击确认
                            }
                        });
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取系统当前时间
                            case api_get_server_time:
                                this.complete_server_time(data);
                                break;
                            //获取学年学期
                            case  api_get_semester:
                                this.complete_semester(data);
                                break;
                            //查询模块时间
                            case api_get_module_time:
                                this.complete_module_time(data);
                                break;
                            // //查询评语
                            // case semester_get:
                            //     this.complete_get_remarl(data);
                            //     break;
                            //评语提交
                            case remarl_guardian:
                                //查询评语
                                ajax_post(semester_get,this.get_remarl.$model,this);
                                break;
                        }
                    }
                },
                complete_server_time:function (data) {
                    this.server_time=this.timeChuo(data.data.current_time);
                    //查询模块时间
                    ajax_post(api_get_module_time,{module_type:"3",grade_id:this.remarl.fk_grade_id},this);
                },
                //模块时间
                complete_module_time:function(data){
                    this.module_start_time = '';
                    this.module_end_time = '';
                    this.is_switch = false;
                    //获取学年学期
                    ajax_post(api_get_semester, {grade_id: this.remarl.fk_grade_id}, this);
                    if(data.data == null || data.data == [])
                        return;
                    this.module_start_time=data.data.start_time;
                    this.module_end_time=data.data.end_time;
                    this.is_switch = data.data.is_switch;
                },
                complete_semester:function(data){
                    //获取学年学期集合
                    this.semesterAry=data.data.list;
                    //循环调用评语查询
                    var ret_ary = Array(data.data.list.length);
                    var current_len = 0;
                    data.data.list.forEach(function (value, index) {
                        vm.get_remarl.grade = Number(value.semester_name.substr(0,4));
                        // vm.get_remarl.semester = Number(value.semester_index);
                        vm.get_remarl.semester = Number(value.id);
                        ajax_post(semester_get, vm.get_remarl.$model, {
                            on_request_complete:function (cmd, status, data, is_suc, msg) {
                                var info = [];
                                if(data.data){
                                    if(!data.data.content_guardian){
                                        data.data.content_guardian = '';
                                    }
                                    info = data.data;
                                }else{
                                    info = {'content_guardian':''};
                                }
                                value.content = info;
                                //判断当前时间能否填写评语
                                value.is_fill = vm.remark_fill_time(value.start_date,value.end_date,vm.server_time,vm.module_start_time,vm.module_end_time,vm.is_switch);
                                ret_ary[index] = value;
                                if(++current_len >= ret_ary.length){
                                    vm.local_ary = ret_ary
                                    console.log(vm.local_ary);
                                }
                            }});
                    });
                },
                /**
                 * 根据时间判断能否填写评语
                 * sem_start:学期开始时间；sem_end：学期结束时间；serve_time-当前服务器时间；
                 * module_start：模块开始时间；module_end：模块结束时间；
                 * is_switch:开关（false-关闭，true-开启）
                 */
                remark_fill_time:function(sem_start,sem_end,server_time,module_start,module_end,is_switch){
                    if(is_switch == false || module_start == ''){
                        return false;
                    }
                    //学年学期开始时间--转换成北京标准时间
                    var sem_start_z = new Date(this.timeChuo(sem_start).replace(/\-/g, "\/"));
                    //学年学期结束时间
                    var sem_end_z = new Date(this.timeChuo(sem_end).replace(/\-/g, "\/"));
                    //系统时间
                    var server_time_z = new Date(server_time.replace(/\-/g, "\/"));
                    //模块开始时间
                    var module_start_z = new Date(module_start.replace(/\-/g, "\/"));
                    //模块结束时间
                    var module_end_z = new Date(module_end.replace(/\-/g, "\/"));
                    // console.log(this.timeChuo(sem_start));
                    // console.log(this.timeChuo(sem_end));
                    // console.log(server_time);
                    // console.log(module_start);
                    // console.log(module_end);
                    // console.log('///////');
                    if((sem_start_z<server_time_z && server_time_z<sem_end_z)
                        && (module_start_z < server_time_z && server_time_z < module_end_z)) {
                        return true;
                    }else{
                        return false;
                    }
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
            vm.cds();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });