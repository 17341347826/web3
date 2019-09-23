/**
 * Created by uptang on 2017/7/7.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        C.Co("self_evaluation_management", "self_description/new_myself_comment/new_myself_comment", "css!"),
        C.Co("self_evaluation_management", "self_description/new_myself_comment/new_myself_comment", "html!"),
        "layer",
        C.CMF("data_center.js"),
        C.CM('three_menu_module')
    ],
    function ($, avalon,css, html, layer, data_center, three_menu_module) {
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
                $id: "table",
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
                //防止重复提交:true-能点击提交，false-不能点击提交
                btn_had:true,
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
                disabled_tips:function () {
                    toastr.info('当前时间不可录入')
                },
                //提交
                add_content: function (value) {
                    var self=this;
                    self.btn_had = true;
                    var val = '';
                    if(value.content != null){
                        val = value.content.content_my;
                    }else{
                        val = value.content;
                    }
                    layer.prompt(
                        {title: '请对本学期进行自我描述',
                            formType: 2,
                            value:val,
                            yes: function(index, layero){
                                var val = layero.find(".layui-layer-input").val();
                                if($.trim(val)==''){
                                    toastr.warning('自我描述不能为空');
                                }else{
                                    if(value.content != null){
                                        value.content.content_my = val;
                                    }else{

                                    }value.content = val;
                                    var content = val;
                                    if(self.btn_had){
                                        ajax_post(semester_sure,
                                            {
                                                content_my:content,
                                                grade:Number(value.semester_name.substr(0,4)),
                                                semester_name:value.semester_name,
                                                semester:value.id,
                                                fk_semester_id:value.id,
                                                fk_grade_id:self.grade_id
                                            },
                                            self);
                                        self.btn_had = false;
                                    }
                                }
                            }

                        }
                    );
                },
                init: function () {
                    ajax_post(api_current_semester,{},this);
                },
                complete_current_semester:function (data) {
                    this.current_se_id = data.data.id;
                    this.get_current_time();
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
                    // this.cds();

                },
                parse_time: function (time) {
                    //‘-’连接的日期字符串，则是只在chrome下可以正常工作，基于'/'格式的日期字符串，才是被各个浏览器所广泛支持
                    // var new_time = new Date(Date.parse(time));
                    var new_time = new Date(Date.parse(time.replace(/-/g,"/")));
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
                                              value.content = data.data;
                                              ret_ary[index] = value;
                                              if(++current_len >= ret_ary.length){
                                                table.semester = ret_ary;
                                                console.log(table.semester)
                                              }
                                        }});
                                });
                                break;
                            case  semester_sure:
                                layer.closeAll();
                                table.cds();
                                break;
                            case  semester_get:
                                this.complete_semester_get(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
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