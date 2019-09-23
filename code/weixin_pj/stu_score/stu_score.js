define(["jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "stu_score/stu_score", "css!"),
        C.Co("weixin_pj", "stu_score/stu_score", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function ($, avalon, css, html, x, data_center,weui) {
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //查询所有项目
        var api_get_time_plan = api.api + "Indexmaintain/indexmaintain_findByEvaluatePro";
        //获取系统当前时间
        var api_get_server_time = api.user + 'baseUser/current_time';

        //查询手动分组：根据身份返回分组信息判断能否进入下一个页面
        var api_get_stu = api.api+"Indexmaintain/indexmaintain_findstudentgroupid";
        avalon.filters.eva_state = function (state) {
            if(state==1){
                return '进行中';
            }
            return '已完成';
        }
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "stu_score",
                student_arr: [],
                table_show: false,
                project_arr: [],
                color_green: {color: 'green'},
                color_red: {color: 'red'},
                grade_list: [],
                class_list: [],
                get_grade_id: "",
                get_class_id: "",
                school_id: "",
                type: "",
                stu_guid: "",
                pj_proid: "",
                now_semester:'',
                user:{},
                //开关：组评是否开启、
                is_switch:false,
                cb: function () {
                    var user = cloud.user_user();
                    this.user = user;
                    this.get_grade_id = Number(user.fk_grade_id);
                    this.get_class_id = Number(user.fk_class_id);
                    this.get_school_id = Number(user.fk_school_id);
                    this.stu_guid = Number(user.guid);
                    cloud.semester_current({},function (url,args,data) {
                        vm.now_semester = data;
                    });
                    //组评模块开关是否开启
                    ajax_post(api_get_module_time,{
                        grade_id:this.get_grade_id,
                        module_type:"8",
                    },this);

                },
                //选择年级
                gradeChange: function (data) {
                    for (var i = 0; i < this.grade_list.length; i++) {
                        if (this.get_grade_id == this.grade_list[i].grade_id) {
                            this.class_list = this.grade_list[i].class_list;
                        }
                    }
                    this.class_id = this.class_list[0].class_id;
                    ajax_post(api_get_time_plan, {
                        pro_gradeid: this.get_grade_id,
                        pro_type: 2,
                        pro_workid: this.get_school_id,
                        pro_state: 2
                    }, this);

                },
                //获取班级
                classChange: function () {
                    ajax_post(api_get_time_plan, {
                        pro_gradeid: this.get_grade_id,
                        pro_type: 2,
                        pro_workid: this.get_school_id,
                        pro_state: 2
                    }, this);
                },
                evaluate_go: function (el) {
                    var obj = {
                        "id":el.id,
                        "guid":this.stu_guid,
                        "grade_id":this.get_grade_id,
                        "class_id":this.get_class_id,
                        "school_id":this.get_school_id,
                        "pro_plan_id":el.pro_plan_id,
                        "pro_group_type":el.pro_group_type,
                        "pro_name":el.pro_name,
                        "plan_level":el.plan_level,
                        "fk_semester_id":this.now_semester.id
                    }

                    data_center.set_key('to_stu_score_list',JSON.stringify(obj));
                    // 调用分组信息
                    ajax_post(api_get_stu,{
                        pj_proid:this.project_arr[0].id,
                        classid:this.get_class_id,
                    },this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //查询模块时间
                            case api_get_module_time:
                                this.complete_module_time(data);
                                break;
                            //获取项目id
                            case api_get_time_plan:
                                this.complete_get_time_plan(data);
                                break;
                            //获取系统当前时间
                            case api_get_server_time:
                                this.complete_get_server_time(data);
                                break;
                            //获取分组信息
                            case api_get_stu:
                                this.complete_get_stu(data);
                                break;
                        }
                    } else {
                        $.alert(msg);
                    }
                },
                //模块时间
                complete_module_time:function(data){
                    if(data.data){
                        this.is_switch = data.data.is_switch;
                        //查询项目
                        ajax_post(api_get_time_plan, {
                            pro_gradeid: this.get_grade_id,
                            pro_type: 2,
                            pro_workid: this.get_school_id,
                            pro_state: 2
                        }, this);
                    }
                },
                complete_get_time_plan: function (data) {
                    if (data.data.length == 0) {
                        this.table_show = false;
                        $.alert("暂时还没有项目");
                    } else {
                        for(var i=0;i<data.data.list.length;i++){
                            data.data.list[i].is_time = '';
                        }
                        this.project_arr = data.data.list;
                        ajax_post(api_get_server_time, {}, this);
                    }
                },
                complete_get_server_time: function (data) {
                    var server_time = data.data.current_time;
                    var server_time_new = this.timeChuo(server_time);
                    var get_server_time = new Date(server_time_new.replace("-", "/").replace("-", "/"));//2017-11-2

                    for (var i = 0; i < this.project_arr.length; i++) {
                        if (new Date(this.project_arr[i].pro_start_time.replace("-", "/").replace("-", "/")) < get_server_time &&
                            get_server_time < new Date(this.project_arr[i].pro_end_time.replace("-", "/").replace("-", "/"))
                        ) {
                            this.project_arr[i].is_time = 1//1在时间段内
                        } else {
                            this.project_arr[i].is_time = 2//2不在时间段内
                        }
                    }
                    this.table_show = true;

                },
                //获取分组信息
                complete_get_stu:function(data){
                    if(!data.data || data.data == null || data.data == undefined){
                        toastr.info('当前班级存在非本班学生,请联系班主任');
                        return;
                    }
                    window.location = "#stu_score_list"
                },
                timeChuo: function (h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function (format) {
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
                    var getTimeIs = newDate.format('yyyy-MM-dd hh:mm:ss');
                    return getTimeIs;
                }

            });
            vm.$watch('onReady', function () {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });