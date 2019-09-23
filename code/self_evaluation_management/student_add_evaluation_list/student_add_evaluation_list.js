define(["jquery",C.CLF('avalon.js'),"layer",
        C.Co("self_evaluation_management","student_add_evaluation_list/student_add_evaluation_list","css!"),
        C.Co("self_evaluation_management","student_add_evaluation_list/student_add_evaluation_list","html!"),
        C.CMF("router.js"),C.CMF("data_center.js"),
        C.CM('three_menu_module')
    ],
    function($,avalon, layer, css,html, x, data_center,three_menu_module) {
        //查询模块时间
        var api_get_module_time=api.api+"everyday/get_module_switch";
        //查询所有项目
        var api_get_time_plan=api.api+"Indexmaintain/indexmaintain_findByEvaluatePro";
        //获取系统当前时间
        var api_get_server_time=api.user+'baseUser/current_time';
        //获取当前学年学期id
        // var api_get_semester = api.api+"base/semester/appoint_date_part";
        var api_get_semester = api.api+"base/semester/current_semester.action";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "student_add_evaluation_list",
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
                el_pro_plan_id:"",
                el_pro_end_time:"",
                el_pro_start_time:"",
                el_id:"",
                el_pro_name:"",
                plan_level:"",
                evaluate_go:function (el) {
                    this.el_pro_plan_id = el.pro_plan_id;
                    this.el_pro_end_time = el.pro_end_time;
                    this.el_pro_start_time = el.pro_start_time;
                    this.el_id = el.id;
                    this.el_pro_name = el.pro_name;
                    this.plan_level = el.plan_level;
                    // ajax_post(api_get_semester,{end_date:el.pro_end_time,start_date:el.pro_start_time},this);
                    ajax_post(api_get_semester,{},this);

                    // window.location="#student_fill_in_self?id="+el.id+
                    //     "&pro_plan_id="+el.pro_plan_id+
                    //     "&stu_num="+this.stu_num+"&name="+this.name+"&pro_name="+el.pro_name+"&plan_level="+el.plan_level;
                },
                disabled_tips:function () {
                  toastr.info('当前时间不可录入')
                },
                complete_get_semester:function (data) {
                    //1 按学生评价 2 按考查项评价
                    window.location="#student_fill_in_self?id="+this.el_id+
                        "&pro_plan_id="+this.el_pro_plan_id+
                        "&stu_num="+this.stu_num+"&name="+this.name+"&pro_name="+this.el_pro_name+ "&semester_id=" + data.data.id+"&plan_level="+this.plan_level;
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
                        toastr.error(msg)
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
                            pro_state:2},this);
                    }
                },
                complete_get_time_plan:function (data) {
                    if(data.data.length==0){
                        this.table_show=false;
                        toastr.error("暂时还没有项目")
                    }else{
                        this.project_arr=data.data.list;
                        ajax_post(api_get_server_time,{},this);
                    }
                },
                complete_get_server_time:function (data) {
                    var server_time=data.data.current_time;
                    var server_time_new=this.timeChuo(server_time);
                    var get_server_time = new Date(server_time_new.replace("-", "/").replace("-", "/"));//2017-11-2
                    // console.log(get_server_time);

                    for(var i=0;i<this.project_arr.length;i++){
                        if(new Date(this.project_arr[i].pro_start_time.replace("-", "/").replace("-", "/"))<get_server_time &&
                            get_server_time<new Date(this.project_arr[i].pro_end_time.replace("-", "/").replace("-", "/"))
                        ){
                            this.project_arr[i].is_time=1//1在时间段内
                        }else{
                            this.project_arr[i].is_time=2//2不在时间段内
                        }
                    }
                    this.table_show=true;

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
                }

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