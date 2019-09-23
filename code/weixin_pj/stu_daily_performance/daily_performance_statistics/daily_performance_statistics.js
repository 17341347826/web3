/**
 * Created by Administrator on 2018/7/31.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj/stu_daily_performance", "daily_performance_statistics/daily_performance_statistics", "css!"),
        C.Co("weixin_pj/stu_daily_performance", "daily_performance_statistics/daily_performance_statistics", "html!"),
        C.CMF("data_center.js"), "jquery-weui","PCAS"
    ],
    function ($, avalon, css, html, data_center, weui,PCAS) {
        //获取学年学期集合
        var api_get_semester = api.PCPlayer + "semester/used_list.action";
        //查询学期的周次
        var api_get_selWeekNum = api.api + "everyday/selWeekNum";
        //统计 / 查询学生周次表现列表(微信端)
        var api_get_addEveryDay=api.api+"everyday/addEveryDay";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "daily_performance_statistics",
                //身份
                user_type:'',
                //学生guid
                stu_guid:'',
                //学生姓名
                stu_name:'',
                //学年学期集合
                semesterAry: [],
                //查询学期的参数-学期的编号
                semester: '',
                //查询学期的周次返回集合
                selWeekNum_list: [],
                //周次的value--开始日期和结束日期
                selWeek_date:'',
                //周次列表返回数据
                addEveryDay_list:'',
                week_start:'',
                week_end:'',
                //合成数组
                newAry:[],
                //合成数组临时数据
                e:'',
                //菜单改变
                menu_change:function(){
                    if(this.user_type == 2){//学生
                        window.location = '#daily_performance_check';
                    }else if(this.user_type == 3){//家长
                        window.location = '#daily_record_see'
                    }
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        //0：管理员；1：教师；2：学生；3：家长
                        var user_type = data.data.user_type;
                        self.user_type = user_type;
                        if(user_type == 2){//学生
                            //获取学生guid
                            self.stu_guid=tUserData.guid;
                            //获取学生姓名
                            self.stu_name=tUserData.name;
                        }else if(user_type == 3){
                            var stu = tUserData.student;
                            //获取学生guid
                            self.stu_guid=stu.guid;
                            //获取学生姓名
                            self.stu_name=stu.name;
                        }
                        //获取学年学期
                        self.get_semester();
                    });
                },
                //获取当前时间--结束日期
                getEnd_time:function(){
                    var mydate = new Date();
                    var str = "" + mydate.getFullYear() + "-";
                    str += (mydate.getMonth()+1) + "-";
                    str += mydate.getDate()+ " ";
                    str += mydate.getHours()+ ":";       //获取当前小时数(0-23)
                    str += mydate.getMinutes()+ ":";     //获取当前分钟数(0-59)
                    str += mydate.getSeconds()+ ".0";
                    return str;
                },
                //学年学期请求
                get_semester: function () {
                    ajax_post(api_get_semester, {status: 1}, this);
                },
                //周次请求
                get_week:function(){
                    ajax_post(api_get_selWeekNum, {
                        semester: this.semester
                    }, this);
                },
                //周次列表请求
                get_addEveryDay:function(){
                    ajax_post(api_get_addEveryDay,{guid:this.stu_guid,semester:this.semester},this);
                },
                //学年学期的改变
                semesterChange: function () {
                    this.selWeekNum_list=[];
                    this.semester =JSON.parse(this.semester);
                    this.get_week();
                    // this.get_addEveryDay();
                    // this.composeAry();
                },
                //合成新数组
                composeAry:function(){
                    var self=this;
                    self.newAry=[];
                    if(self.addEveryDay_list.length==0){//判断没有亮点与不足
                        for(var i=0;i<self.selWeekNum_list.length;i++) {
                            //一学期还没有完
                            if(self.selWeekNum_list[i].endTime>self.getEnd_time() && self.selWeekNum_list[i+1].endTime<self.getEnd_time()) {
                                self.e=i+1;
                            }
                            //一学期已经完了
                            if(self.selWeekNum_list[0].endTime<self.getEnd_time()) {
                                self.e=0;
                            }
                            //为每一学期添加数据
                            if(self.selWeekNum_list[i].endTime<self.getEnd_time()){
                                if(self.newAry[i-self.e]==undefined){
                                    self.newAry.push({"endTime":self.selWeekNum_list[i].endTime,
                                        "guid":self.stu_guid,"praiseCount":0,"remindCount":0,
                                        "semester":self.selWeekNum_list[i].semester,
                                        "startTime":self.selWeekNum_list[i].startTime,
                                        "weekNum":self.selWeekNum_list[i].weekNum});
                                }
                            }
                        }
                    }else{
                        for(var i=0;i<self.selWeekNum_list.length;i++) {
                            for (var j = 0; j < self.addEveryDay_list.length; j++) {
                                if(self.selWeekNum_list[i].weekNum==self.addEveryDay_list[j].weekNum){
                                    self.newAry.push(self.addEveryDay_list[j]);
                                }else{
                                    //一学期还没有完
                                    if(self.selWeekNum_list[i].endTime>self.getEnd_time() && self.selWeekNum_list[i+1].endTime<self.getEnd_time()) {
                                        self.e=i+1;
                                        // console.log(self.selWeekNum_list[9].endTime);
                                        // console.log(self.selWeekNum_list[10].endTime);
                                        // console.log(self.getEnd_time());
                                    }
                                    //一学期已经完了
                                    if(self.selWeekNum_list[0].endTime<self.getEnd_time()) {
                                        self.e=0;
                                    }
                                    //为每一学期添加数据
                                    if(self.selWeekNum_list[i].endTime<self.getEnd_time()){
                                        // console.log(i);
                                        // console.log(self.e);
                                        if(self.newAry[i-self.e]==undefined){
                                            if(self.selWeekNum_list[i].weekNum>self.addEveryDay_list[j].weekNum || self.selWeekNum_list[i].weekNum<self.addEveryDay_list[self.addEveryDay_list.length-1].weekNum){
                                                self.newAry.push({"endTime":self.selWeekNum_list[i].endTime,
                                                    "guid":self.stu_guid,"praiseCount":0,"remindCount":0,
                                                    "semester":self.selWeekNum_list[i].semester,
                                                    "startTime":self.selWeekNum_list[i].startTime,
                                                    "weekNum":self.selWeekNum_list[i].weekNum});
                                            }
                                        }
                                    }

                                }

                            }
                        }
                    }
                },
                //页面跳转
                get_detail:function(el){
                    console.log(el);
                    //周次名称
                    var week_name = el.weekNum;
                    //每周开始时间
                    this.week_start=el.startTime.substr(0,19);
                    //每周结束时间
                    this.week_end=el.endTime.substr(0,19);
                    //    传递参数
                    data_center.set_key('week_start',this.week_start);
                    data_center.set_key("week_end", this.week_end);
                    window.location="#daily_performance_gb?week_name="+week_name;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //获取学年学期
                            case  api_get_semester:
                                this.semester =JSON.parse(data.data[0].id);
                                this.semesterAry=data.data;
                                //默认第一次周次
                                this.get_week();
                                // this.get_addEveryDay();
                                break;
                            // 学期周次请求
                            case api_get_selWeekNum:
                                this.complete_get_selWeekNum(data);
                                break;
                            //        周次列表请求
                            case api_get_addEveryDay:
                                this.addEveryDay_list=data.data;
                                this.composeAry();
                                break;

                        }
                    } else {
                        $.alert(msg);
                    }
                },
                complete_get_selWeekNum:function(data){
                    var self=this;
                    var d = new Date();
                    var time_str = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();//2017-11-2
                    var d1 = new Date(time_str.replace(/\-/g, "\/"));//2017-11-2
                    if(data.data.length > 0 && data.data!=null){
                        for(var i=0;i<data.data.length;i++){
                            if(d1>new Date(data.data[i].endTime.replace(/\-/g, "\/"))){
                                self.selWeekNum_list.push(data.data[i])
                            }
                        }
                        // this.selWeekNum_list=data.data;
                        // console.log(this.selWeekNum_list);
                        // this.extend.weekNum=this.week_arr[0].weekNum;
                        // this.extend.startTime=this.week_arr[0].startTime;
                        // this.extend.endTime=this.week_arr[0].endTime;
                        self.selWeek_date=data.data[0].startTime+'|'+data.data[0].endTime;
                        self.get_addEveryDay();
                        // this.composeAry();
                    }else{
                        $.alert('该学期暂无周次');
                    }
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