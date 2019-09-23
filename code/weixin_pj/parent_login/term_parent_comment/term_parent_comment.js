/**
 * Created by uptang on 2017/7/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj/parent_login", "term_parent_comment/term_parent_comment", "css!"),
        C.Co("weixin_pj/parent_login", "term_parent_comment/term_parent_comment", "html!"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon,css, html, data_center,weui) {
        //获取的当前学年学期
        var api_current_semester = api.api+"base/semester/current_semester.action";
        //获取年级可操作学期
        var api_get_semester = api.api + "base/semester/grade_opt_semester";
        //评语提交
        var semester_sure = api.api + "everyday/remarl_my";
        //家长评语查询
        var semester_get = api.api + "everyday/get_remarl_by_student";
        //获取当前时间
        var current_sys_time_api = api.api + "base/baseUser/current_time";
        //获取可评价时间段
        var time_slot_api = api.api + "everyday/get_module_switch";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "term_parent_comment",
                semester: [],
                grade_id:"",
                //系统当前时间
                current_time: '',
                content:'',
                //当前学年学期的id
                current_se_id:"",
                semester_info:"",
                data_info:[],
                semester_name:"",
                semester_id:"",
                grade_num:"",
                //子女guid
                stu_guid:'',
                semesterChange: function () {
                    var get_semester = this.semester_info;
                    var semester_name = get_semester.split("|")[0];
                    this.semester_name = semester_name;
                    var grade = Number(semester_name.substr(0,4));
                    this.grade_num = grade;
                    var semester = Number(get_semester.split("|")[1]);
                    this.semester_id = semester;
                    ajax_post(semester_get, {
                        grade:grade,
                        semester:semester,
                        student_id:this.stu_guid
                    }, this)
                },

                init: function () {
                    ajax_post(api_current_semester,{},this);
                },
                complete_current_semester:function (data) {
                    this.current_se_id = data.data.id;
                    this.get_current_time();
                },
                menu_change:function () {
                    window.location.href = "#stu_graduation_evaluation"
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var user_type = data.data.user_type;
                        var stu = tUserData.student;
                        //子女guid
                        self.stu_guid = stu.guid;
                        //年级id
                        var grade_id = stu.fk_grade_id;
                        self.grade_id = grade_id;
                        //获取学年学期
                        ajax_post(api_get_semester, {grade_id: grade_id}, self);
                        self.init();
                    });
                },
                //获取系统当前时间
                get_current_time: function () {
                    ajax_post(current_sys_time_api, {}, this);
                },
                //处理系统当前时间
                deal_current_time: function (data) {
                    if (!data.data)
                        return;
                    this.current_time = data.data.current_time;
                    this.get_time_solt();
                },
                //获取时间段
                get_time_solt: function () {
                    ajax_post(time_slot_api, {
                        module_type:"1",
                        grade_id:table.grade_id
                    }, this)
                },
                is_fill:1,
                is_switch:"",
                deal_time_solt: function (data) {
                    if(!data.data)
                        return;
                    var start_time = data.data.start_time;
                    var end_time = data.data.end_time;
                    this.is_switch = data.data.is_switch;

                    start_time = this.parse_time(start_time);//模块开始时间
                    end_time = this.parse_time(end_time);//模块结束时间
                    var current_time = this.timestamp_to_time(this.current_time);
                    current_time = this.parse_time(current_time);
                    if (current_time > start_time && current_time < end_time && this.is_switch == true) {//可编辑
                        this.is_fill = 1;
                    }else{
                        this.is_fill = 2;
                    }

                },

                parse_time: function (time) {
                    var new_time = new Date(Date.parse(time));
                    return new_time;
                },
                timestamp_to_time: function (timestamp) {
                    var date = new Date(timestamp);
                    var vY = date.getFullYear() + '-';
                    var vM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                    var vD = date.getDate() + ' ';
                    var vh = date.getHours() + ':';
                    var vm = date.getMinutes() + ':';
                    var vs = date.getSeconds();
                    return vY + vM + vD + vh + vm + vs;
                },
                to_update:function () {
                    this.is_update = true;
                    this.content = this.data.content_my;
                },
                complete_semester_get:function (data) {
                    if(data.data){
                        if(!data.data.content_my){
                            data.data.content_my = '';
                        }
                        this.data_info = data.data;

                    }else{
                        this.data_info = {'content_my':''};
                    }
                },
                edit_btn:function (el) {
                    if(!el.content.content_my || el.content.content_my==null)
                        el.content.content_my = '';
                    var obj_post = {
                        "content_my":el.content.content_my,
                        "grade":Number(el.semester_name.substr(0,4)),
                        "semester_name":el.semester_name,
                        "semester":el.id,
                        "fk_semester_id":el.id,
                        "fk_grade_id":this.grade_id
                    };
                    var obj = {
                        'semester_name':el.semester_name,
                        'post_data':obj_post
                    }
                    data_center.set_key('stu_term_ev_update_data',JSON.stringify(obj));
                    window.location.href = "#modify_stu_term_ev"
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取的当前学年学期
                            case api_current_semester:
                                this.complete_current_semester(data);
                                break;
                            //获取服务器上当前时间
                            case current_sys_time_api:
                                this.deal_current_time(data);
                                break;
                            //获取模块时间
                            case time_slot_api:
                                this.deal_time_solt(data);
                                break;
                            case  api_get_semester:

                                var ret_ary = Array(data.data.list.length);
                                var current_len = 0;
                                data.data.list.forEach(function (value, index) {
                                    ajax_post(semester_get, {
                                        grade:Number(value.semester_name.substr(0,4)),
                                        semester:Number(value.id),
                                        student_id:table.stu_guid
                                    }, {on_request_complete:function (cmd, status, data, is_suc, msg) {
                                        var info = [];
                                        if(data.data){
                                            if(!data.data.content_my){
                                                data.data.content_my = '';
                                            }
                                            info = data.data;
                                        }else{
                                            info = {'content_my':''};
                                        }
                                        value.content = info;
                                        ret_ary[index] = value;
                                        if(++current_len >= ret_ary.length){
                                            table.semester = ret_ary;
                                            // console.log(table.semester);
                                        }
                                    }});
                                });
                                break;
                            case  semester_sure:
                                layer.closeAll();
                                break;
                            case  semester_get:
                                this.complete_semester_get(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }

                }
            });
            table.cds();
            return table;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
// /**
//  * Created by Administrator on 2018/9/7.
//  */
// define([
//         "jquery",
//         C.CLF('avalon.js'),
//         C.Co("weixin_pj/parent_login", "term_parent_comment/term_parent_comment", "css!"),
//         C.Co("weixin_pj/parent_login", "term_parent_comment/term_parent_comment", "html!"),
//         C.CMF("data_center.js"),
//         "jquery-weui"
//     ],
//     function ($, avalon,css, html, data_center,weui) {
//         //查询模块时间
//         var api_get_module_time=api.api+"everyday/get_module_switch";
//         //获取系统当前时间
//         var api_get_server_time=api.api+'base/baseUser/current_time';
//         //查询当前可用的学年学期
//         var api_semester_is_fill=api.api+"base/semester/grade_opt_semester";
//
//
//         //家长查询
//         var api_parent_check_list = api.api+"everyday/get_remarl_guardian";
//         //保存
//         var api_add_comment = api.api+"everyday/remarl_guardian";
//         var avalon_define = function() {
//             var vm = avalon.define({
//                 $id: "term_parent_comment",
//                 account:"",
//                 name:"",
//                 user_type:"",
//                 start_time:"",
//                 end_time:"",
//                 current_time:"",
//                 is_fill:"",
//                 time:[],
//                 semester_list:[],
//                 fk_school_id:"",
//                 fk_class_id:"",
//                 fk_grade_id:"",
//                 fk_grade_name:"",
//                 fk_semester:"",
//                 grade:"",
//                 semester:"",
//                 yearSemester:"",//当前可编辑的却年学期
//                 student_list:[],
//                 get_student:[],
//                 local_ary:{},
//                 is_switch:"",
//                 on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
//                     if (is_suc) {
//                         switch (cmd) {
//                             //查询当前可用的年级
//                             case api_semester_is_fill:
//                                 this.complete_semester_is_fill(data);
//                                 break;
//                             //查询模块时间
//                             case api_get_module_time:
//                                 if(data.data){
//                                     this.start_time=data.data.start_time;
//                                     this.end_time=data.data.end_time;
//                                     this.is_switch = data.data.is_switch;
//                                 }else{
//                                     this.is_fill=2;//只能查看
//                                 }
//                                 ajax_post(api_get_server_time,{},this);
//                                 break;
//                             //查询服务器当前时间
//                             case api_get_server_time:
//                                 this.get_server_time(data);
//                                 break;
//                             //家长查询
//                             case api_parent_check_list:
//                                 this.complete_parent_check_list(data);
//                                 break;
//                             //提交
//                             case api_add_comment:
//                                 location.reload();
//                                 break;
//
//                         }
//                     }
//                 },
//
//                 cb: function() {
//                     var self = this;
//                     data_center.uin(function(data) {
//                         var userData = JSON.parse(data.data['user']);
//                         var student = userData.student;
//                         self.fk_grade_id = student.fk_grade_id;
//                         self.guid = student.guid;
//                         self.account = student.account;
//                         self.name = student.name;
//                         //获取当前可用的学年学期
//                         ajax_post(api_semester_is_fill,{grade_id:self.fk_grade_id},self);
//                     });
//                 },
//                 semester_length:"",
//                 arr:{},
//                 obj_list:[],
//                 count:0,
//                 complete_semester_is_fill:function (data) {
//                     var dataList=data.data.list;
//                     var dataListLength=dataList.length;
//                     this.semester_list=dataList;
//                     this.semester_length=dataListLength;
//                     ajax_post(api_get_module_time,{module_type:"3"},this);
//                 },
//
//                 show_table:false,
//                 new_obj:[],
//                 complete_parent_check_list:function (data) {
//                     var obj_list = this.obj_list;
//                     for(var p in obj_list){
//                         if(obj_list[p] == null){
//                             obj_list[p] = {code:"",content_guardian:"",student_id:"",semester_name:"",semester_id:""};
//                             obj_list[p].code = this.account;
//                             obj_list[p].content_guardian = "";
//                             obj_list[p].student_id = this.guid;
//                             obj_list[p].semester_name = p;
//                             for(var i = 0;i<this.semester_list.length;i++){
//                                 if(p == this.semester_list[i].semester_name){
//                                     obj_list[p].semester_id = this.semester_list[i].id;
//                                 }
//                             }
//                         }else{
//                             obj_list[p]['semester_name'] = p;
//                             for(var i = 0;i<this.semester_list.length;i++){
//                                 if(p == this.semester_list[i].semester_name){
//                                     obj_list[p].semester_id = this.semester_list[i].id;
//                                 }
//                             }
//                         }
//                         this.new_obj.push(obj_list[p]);
//                     }
//                     this.show_table=true;
//                 },
//                 //当前服务器时间
//                 get_server_time:function (data) {
//                     var self = this;
//                     if(this.is_fill!=2){
//                         this.current_time=data.data.current_time;
//                         var current_time=$(".current_time").text();
//                         var currentDate=new Date(current_time.replace(/\-/g, "\/"));
//                         var start=new Date(this.start_time.replace(/\-/g, "\/"));
//                         var end=new Date(this.end_time.replace(/\-/g, "\/"));
//                         if(start<currentDate && currentDate<end && this.is_switch == true){//可编辑
//                             this.is_fill=1;
//                             var dataList=this.semester_list;
//                             var dataList_length=dataList.length;
//                             for(var i=0;i<dataList_length;i++){
//                                 var start_x=this.timeChuo(dataList[i].start_date);
//                                 var end_x=this.timeChuo(dataList[i].end_date);
//                                 var semester_start=new Date(start_x.replace(/\-/g, "\/"));
//                                 var semester_end=new Date(end_x.replace(/\-/g, "\/"));
//                                 if(semester_start<currentDate && currentDate<semester_end){
//                                     this.yearSemester=dataList[i].semester_name;
//                                 }
//                             }
//                         }else{
//                             this.is_fill=2;
//                         }
//                         this.semester_list.forEach(function(p1){
//                             var semester_index = p1.id;
//                             var semester_name = p1.semester_name;
//                             var semester = Number(semester_name.substr(0,4));
//                             var xself = self;
//                             var request_data = {
//                                 grade:semester,
//                                 semester:semester_index,
//                                 student_id:xself.guid,
//                                 on_request_complete: function(cmd, status, data, is_suc, msg) {
//                                     xself.count += 1;
//                                     // 对应每科的成绩情况
//                                     if (is_suc) {
//                                         xself.arr[semester_name] = data.data;
//                                         if( xself.count == xself.semester_list.length ){
//                                             xself.obj_list = xself.arr;
//                                             xself.complete_parent_check_list();
//
//                                         }
//                                     } else {
//                                         layer.msg(msg);
//                                     }
//
//                                 }
//                             };
//                             ajax_post(api_parent_check_list, request_data, request_data);
//                         })
//
//                     }
//                 },
//                 //编辑
//                 add_btn:function (el) {
//                     console.log(el);
//                     var self=this;
//                     var name = this.name;
//                     var fk_semester = el.semester_name;
//                     var grade = fk_semester.substr(0,4);
//                     var semester_index = fk_semester.substr(12,1);
//                     var semester="";
//                     if(semester_index=='上'){
//                         semester = 1;
//                     }else {
//                         semester = 2;
//                     }
//                     var guid = el.student_id;
//                     var code = el.code;
//                     var semester_name = el.semester_name;
//                     var fk_semester_id = el.semester_id;
//                     var title="请对"+"【"+name+"】"+"进行"+semester_name+"期的评价";
//                     var content_guardian=el.content_guardian;
//                     layer.prompt({title: title, formType: 2 ,value:content_guardian}, function(text, index){
//                         if($.trim(text)!=''){
//                             var value=text;
//                             ajax_post(api_add_comment,{
//                                 code:code,
//                                 content_guardian:value,
//                                 grade:grade,
//                                 semester:fk_semester_id,
//                                 student_id:guid,
//                                 fk_grade_id:self.fk_grade_id,
//                                 fk_semester_id:fk_semester_id,
//                                 semester_name:semester_name
//                             },self);
//                             layer.closeAll();
//                         }
//                     });
//                 },
//                 timeChuo:function(h){
//                     var timestamp3 = h/1000;
//                     var newDate = new Date();
//                     newDate.setTime(timestamp3 * 1000);
//                     Date.prototype.format = function(format) {
//                         var date = {
//                             "M+": this.getMonth() + 1,
//                             "d+": this.getDate(),
//                             "h+": this.getHours(),
//                             "m+": this.getMinutes(),
//                             "s+": this.getSeconds(),
//                             "q+": Math.floor((this.getMonth() + 3) / 3),
//                             "S+": this.getMilliseconds()
//                         };
//                         if (/(y+)/i.test(format)) {
//                             format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
//                         }
//                         for (var k in date) {
//                             if (new RegExp("(" + k + ")").test(format)) {
//                                 format = format.replace(RegExp.$1, RegExp.$1.length == 1
//                                     ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
//                             }
//                         }
//                         return format;
//                     };
//                     var getTimeIs=newDate.format('yyyy-MM-dd');
//                     return getTimeIs;
//                 }
//             });
//             vm.$watch("onReady", function() {
//                 $(".am-dimmer").css("display","none");
//                 vm.cb();
//
//             });
//
//             return vm;
//         };
//
//         return {
//             view: html,
//             define: avalon_define
//         }
//     });
//
//
//
//
