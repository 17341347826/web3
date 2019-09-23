define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("weixin_pj","evaluate_wx_self/evaluate_wx_self","css!"),
        C.Co("weixin_pj","evaluate_wx_self/evaluate_wx_self","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),
        "jquery-weui"
    ],
    function($,avalon, layer, css,html, x, data_center,weui) {
        //查询所有项目
        var api_get_time_plan=api.api+"Indexmaintain/indexmaintain_findByEvaluatePro";
        //查询是否已评
        var api_is_answer=api.api+"Indexmaintain/indexmaintain_findbyanswer";
        //获取系统当前时间
        var api_get_server_time=api.user+'baseUser/current_time';
        //获取当前学年学期id
        // var api_get_semester = api.api+"base/semester/appoint_date_part";
        var api_get_semester = api.api+"base/semester/current_semester.action";

        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "evaluate_wx_self",
                student_arr:[],
                table_show:false,
                project_arr:[],
                color_green:{color: 'green'},
                color_red:{color: 'red'},
                grade_list:[],
                class_list:[],
                get_grade_id:"",
                get_class_id:"",
                school_id:"",
                type:"",
                stu_num:"",
                pj_proid:"",
                name:"",
                //开关：自评是否开启、
                is_switch:false,
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var cArr = [];
                        var userType = data.data.user_type;
                        var tUserData = JSON.parse(data.data["user"]);
                        cArr = tUserData.lead_class_list;
                        self.get_grade_id=Number(tUserData.fk_grade_id);
                        self.get_class_id=Number(tUserData.fk_class_id);
                        self.get_school_id=(tUserData.fk_school_id) ;
                        self.stu_num=tUserData.account;
                        self.name=tUserData.name;
                        self.guid = tUserData.guid;
                        ajax_post(api_get_module_time,{
                            grade_id:self.get_grade_id,
                            module_type:"7",
                        },self);
                    })

                },
                //选择年级
                gradeChange:function (data) {
                    for(var i=0;i<this.grade_list.length;i++){
                        if(this.get_grade_id==this.grade_list[i].grade_id){
                            this.class_list=this.grade_list[i].class_list;
                        }
                    }
                    this.class_id=this.class_list[0].class_id;
                    ajax_post(api_get_time_plan,{pro_gradeid:this.get_grade_id,pro_type:1,pro_workid:this.get_school_id,pro_state:2},this);

                },
                //获取班级
                classChange:function () {
                    ajax_post(api_get_time_plan,{pro_gradeid:this.get_grade_id,pro_type:1,pro_workid:this.get_school_id,pro_state:2},this);
                },
                el:"",
                evaluate_go:function (el) {
                    this.el = el;
                    // ajax_post(api_get_semester,{end_date:el.pro_end_time,start_date:el.pro_start_time},this);
                    ajax_post(api_get_semester,{},this);
                },
                complete_get_semester:function (data) {
                    var el = this.el;
                    window.location="#student_wx_self?id="+el.id+
                        "&pro_plan_id="+el.pro_plan_id+
                        "&stu_num="+this.stu_num+"&name="+this.name+"&pro_name="+el.pro_name+"&plan_level="+el.plan_level+ "&semester_id="
                        + data.data.id +"&guid="+this.guid+"&class_id="+this.get_class_id+"&school_id="+this.get_school_id

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
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
                            //获取学年学期
                            case api_get_semester:
                                this.complete_get_semester(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                //模块时间
                complete_module_time:function(data){
                    if(data.data){
                        this.is_switch = data.data.is_switch;
                        ajax_post(api_get_time_plan,{
                            pro_gradeid:this.get_grade_id,
                            pro_type:1,
                            pro_workid:this.get_school_id,
                            pro_state:2
                        },this);
                    }
                },
                complete_get_time_plan:function (data) {
                    if(data.data.length==0){
                        this.table_show=false;
                        $.alert("暂时还没有项目")
                    }else{
                        var dataList = data.data.list;
                        this.project_arr = dataList;
                        ajax_post(api_get_server_time,{},this);
                    }
                },
                project_arr_x:[],
                com_data:[],
                complete_get_server_time:function (data) {
                    var pro_data = this.project_arr.$model;
                    var pro_length = pro_data.length;
                    var server_time=data.data.current_time;
                    var server_time_new=this.timeChuo(server_time);
                    var get_server_time = new Date(server_time_new.replace("-", "/").replace("-", "/"));//2017-11-2
                    for(var i=0;i<pro_length;i++){
                        if(new Date(pro_data[i].pro_start_time.replace("-", "/").replace("-", "/"))<get_server_time &&
                            get_server_time<new Date(pro_data[i].pro_end_time.replace("-", "/").replace("-", "/"))
                        ){
                            pro_data[i].is_time='进行中'//1在时间段内
                        }else{
                            pro_data[i].is_time='不在时间段内'//2不在时间段内
                        }
                        // if(new Date(pro_data[i].pro_start_time.replace("-", "/").replace("-", "/"))<get_server_time &&
                        //     get_server_time<new Date(pro_data[i].pro_end_time.replace("-", "/").replace("-", "/"))
                        // ){
                        //     pro_data[i]['is_time']='进行中'//1在时间段内
                        // }
                        // // else if(new Date(this.project_arr[i].pro_start_time.replace("-", "/").replace("-", "/")) > get_server_time){
                        // //     pro_data[i]['is_time']='不行'//2未开始
                        // // }
                        // else{
                        //     pro_data[i]['is_time']='不行'//2未开始
                        // }
                    }

                    var count = 0;
                    pro_data.forEach(function(p1){
                        var request_data = {
                            ev_proid:p1.id,
                            ev_studentNum:vm.stu_num,
                            on_request_complete: function(cmd, status, data, is_suc, msg) {
                                count += 1;
                                if (is_suc) {
                                    pro_data[count-1]['is_complete'] = data.data.state;
                                    if(count == pro_data.length){
                                        vm.project_arr_x = pro_data;
                                        console.log(vm.project_arr_x)
                                    }
                                } else {
                                    $.alert(msg);
                                }

                            }
                        };
                        ajax_post(api_is_answer, request_data, request_data);
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
                    }
                    var getTimeIs=newDate.format('yyyy-MM-dd hh:mm:ss');
                    return getTimeIs;
                },

            });
            vm.$watch('onReady', function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });