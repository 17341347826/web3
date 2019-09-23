/**
 * Created by uptang on 2017/7/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "stu_term_evaluation/stu_term_evaluation", "css!"),
        C.Co("weixin_pj", "stu_term_evaluation/stu_term_evaluation", "html!"),
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
        //评语查询
        var semester_get = api.api + "everyday/get_remarl";
        //获取当前时间
        var current_sys_time_api = api.api + "base/baseUser/current_time";
        //获取可评价时间段
        var time_slot_api = api.api + "everyday/get_module_switch";
        var avalon_define = function () {
            var table = avalon.define({
                $id: "stu_term_evaluation",
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
                        semester:semester
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
                        //年级id
                        var grade_id = tUserData.fk_grade_id;
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
                                            semester:Number(value.id)
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
                                                table.semester = ret_ary
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