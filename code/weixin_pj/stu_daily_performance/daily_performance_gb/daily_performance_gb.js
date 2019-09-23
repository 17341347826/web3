/**
 * Created by Administrator on 2018/7/31.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj/stu_daily_performance", "daily_performance_gb/daily_performance_gb", "css!"),
        C.Co("weixin_pj/stu_daily_performance", "daily_performance_gb/daily_performance_gb", "html!"),
        C.CMF("data_center.js"), 'layer'
    ],
    function ($, avalon, css, html, data_center, layer) {
        //查询学生日常表现亮点与不足
        var api_selWeekInfo=api.api+'everyday/selByIdweekInfo';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "daily_performance_gb",
                //身份
                user_type:'',
                stu_guid:'',
                //周次名称
                week_name:'',
                //周次--开始日期和结束日期
                selWeek_start:'',
                selWeek_end:'',
                //亮点返回集合
                goodList:'',
                //不足返回集合
                badList:'',
                show:true,
                //菜单改变
                menu_change:function(){
                    if(this.user_type == 2){//学生
                        window.location = '#daily_performance_check';
                    }else if(this.user_type == 3){//家长
                        window.location = '#daily_record_see'
                    }
                },
                init:function(){
                    this.week_name = pmx.week_name;
                    this.cds();
                },
                cds: function () {
                    var self = this;
                    data_center.uin(function (data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var user_type = data.data.user_type;
                        self.user_type = user_type;
                        if(user_type == 2){
                            //获取学生guid
                            self.stu_guid=tUserData.guid;
                        }else if(user_type == 3){
                            var stu = tUserData.student;
                            //获取学生guid
                            self.stu_guid=stu.guid;
                        }
                        //   接受周次开始时间和周次结束时间
                        self.selWeek_start=data_center.get_key("week_start");
                        self.selWeek_end=data_center.get_key("week_end");
                        //    亮点
                        self.get_selGood();
                    });
                },
                //学生日常表现亮点请求
                get_selGood:function(){
                    ajax_post(api_selWeekInfo,{guid:this.stu_guid,num:0,endTime:this.selWeek_end,
                        startTime:this.selWeek_start}, this);
                },
                //学生日常表现不足请求
                get_selBad:function(){
                    ajax_post(api_selWeekInfo,{guid:this.stu_guid,num:1,endTime:this.selWeek_end,
                        startTime:this.selWeek_start}, this);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            // 学生日常表现优点请求
                            case api_selWeekInfo:
                                this.complete_gb(data);
                                break;
                        }
                    } else {
                        $.alert(msg)
                    }
                },
                //返回数据操作
                complete_gb:function(data){
                    var self=this;
                    if(self.show==true){
                        self.goodList=data.data;
                        self.show=false;
                        self.get_selBad();
                    }else{
                        self.badList=data.data;
                    }
                }
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });