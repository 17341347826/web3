/**
 * Created by Administrator on 2018/1/8.
 */
define([C.CLF("avalon.js"),
        'jquery',
        C.Co2("weixin_pj", "student_home", "css!"),
        C.Co2("weixin_pj", "student_home", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui",
        "highcharts",
        "highcharts_more",
        //当前学期评级进度情况
        // C.CM("term_evaluate_situation_wx"),
        //通知管理
        C.CM("notice_module_wx"),
        C.CM("bottom_tab"),
    ],
    // function (avalon,jquery, css, html,x,data_center,weui,highcharts,highcharts_more,term_evaluate_situation_wx,bt) {
    function (avalon,jquery, css, html,x,data_center,weui,highcharts,highcharts_more,notice_module_wx,bt) {
        //获取学年学期
        var url = api.api + "base/semester/current_semester.action";
        //活动表现
        var url_activity = api.api + "GrowthRecordBag/first_index_activity_count";
        //待处理任务
        var pending_url = api.growth + "pendingItems";
        //新增记录 审核情况 日常表现(指标)
        var add_record = api.api + "GrowthRecordBag/home_page_statistics";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "student_home",
                //登陆者信息
                login_info:{},
                data:{
                    fk_grade_id:"",
                    fk_class_id:"",
                    guid:"",
                    fk_semester_id:""
                },
                index_list:[],
                personal_list:[],
                class_list:[],
                max_list:[],
                pending_list:[],
                is_tab:1,
                good_list:[],
                bad_list:[],
                no_good_bad:0,
                init: function () {
                    // ajax_post(pending_url,{},this);
                    this.init_swipper();
                    $.closePicker();
                    this.login_info = cloud.user_user();
                },
                init_swipper:function () {
                    $(".swiper-container").swiper({
                        loop: true,
                        autoplay: 3000
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case pending_url:
                                this.pending_list = data.data;
                                // this.pending_list = [
                                //     {"mod":"教师评","count":47,"href":"#teacher_evaluation_list","title":"待评价","type":"1"},
                                //     {"mod":"成就奖励","count":1,"href":"#achieveCheck","title":"待审核","type":"1"},
                                //     {"mod":"艺术活动","count":3,"href":"#artactivityCheck","title":"待审核","type":"1"},
                                //     {"mod":"研究性学习","count":3,"href":"#study_check_list","title":"待审核","type":"1"},
                                //     {"mod":"身心健康","count":3,"href":"#healthActivityCheck","title":"待审核","type":"1"},
                                //     {"mod":"教师评","count":47,"href":"#teacher_evaluation_list","title":"待评价","type":"1"},
                                //     {"mod":"成就奖励","count":1,"href":"#achieveCheck","title":"待审核","type":"1"},
                                //     {"mod":"艺术活动","count":3,"href":"#artactivityCheck","title":"待审核","type":"1"},
                                //     {"mod":"研究性学习","count":3,"href":"#study_check_list","title":"待审核","type":"1"},
                                //     {"mod":"身心健康","count":3,"href":"#healthActivityCheck","title":"待审核","type":"1"}
                                //     ]
                                ajax_post(url,{},this);
                                break;
                            case url:
                                this.data.fk_semester_id = Number(data.data.id);
                                this.cb();
                                break;
                            case url_activity:
                                this.index_list = data.data.index;
                                this.personal_list = data.data.list[0].data;
                                this.class_list = data.data.list[1].data;
                                this.max_list = data.data.list[2].data;
                                this.charts();
                                break;
                            case add_record:
                                if(data.data.statistics_everyday){
                                    if(data.data.statistics_everyday.good_list){
                                        this.good_list = data.data.statistics_everyday.good_list;
                                        // this.good_list = [
                                        //     {item:'很好很好很好很好1'},
                                        //     {item:'很好很好很好很好2'},
                                        //     {item:'很好很好很好很好3'},
                                        //     {item:'很好很好很好很好4'}
                                        // ];
                                    }
                                    if(data.data.statistics_everyday.bad_list){
                                        this.bad_list = data.data.statistics_everyday.bad_list;
                                        // this.bad_list = [
                                        //     {item:'不很好很好很好很好1'},
                                        //     {item:'不很好很好很好很好2'},
                                        //     {item:'不很好很好很好很好3'},
                                        //     {item:'不很好很好很好很好4'}
                                        // ]
                                    }

                                }else{
                                    this.no_good_bad = 1;
                                }
                                break;
                        }
                    }else{
                        $.alert(msg);
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var user_type = Number(data.data.user_type);
                        switch (user_type) {
                            case 2://学生
                                self.data.fk_class_id = tUserData.fk_class_id;
                                self.data.fk_grade_id = tUserData.fk_grade_id;
                                self.data.guid = tUserData.guid;
                                break;
                            case 3://家长
                                self.data.fk_class_id = tUserData.student.fk_class_id;
                                self.data.fk_grade_id = tUserData.student.fk_grade_id;
                                self.data.guid = tUserData.student.guid;
                                break;
                        };
                        ajax_post(url_activity,self.data,self);
                    });
                },
                charts:function () {
                    var chart = Highcharts.chart('container_performance', {
                        //去掉logo
                        credits: {
                            enabled: false
                        },
                        //去掉打印按钮
                        exporting: {
                            enabled: false
                        },
                        chart: {
                            type: 'spline'
                        },
                        title: {
                            text: '',
                            x: -80
                        },
                        pane: {
                            size: '90%'
                        },
                        xAxis: {
                            categories: this.index_list,
                            tickmarkPlacement: 'on',
                            lineWidth: 0
                        },
                        yAxis: {
                            title: {
                                text: ''
                            },
                            gridLineInterpolation: 'polygon',
                            lineWidth: 0,
                            min: 0

                        },
                        tooltip: {
                            shared: true,
                            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y}</b><br/>'
                        },
                        legend: {
                            align: "center", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 //间隔Y轴的间隔
                        },
                        series: [{
                            name: '个人记录数',
                            marker: {
                                fillColor:"#ffd040"
                            },
                            lineColor:"#ffd040",
                            data: this.personal_list,
                            pointPlacement: 'on'
                        }, {
                            name: '班级平均记录数',
                            marker: {
                                fillColor:"#d040ff"
                            },
                            lineColor:"#d040ff",
                            data: this.class_list,
                            pointPlacement: 'on'
                        }, {
                            name: '最高记录数',
                            marker: {
                                fillColor:"#ff4095"
                            },
                            lineColor:"#ff4095",
                            data: this.max_list,
                            pointPlacement: 'on'
                        }]
                    });
                    ajax_post(add_record,{},this);
                },
                change_tab:function (num) {
                    this.is_tab = num;
                }
            });

            require(["jquery-weui"], function (j) {
                require(['swiper', 'city_picker'], function (a, b) {
                    vm.init();
                })
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });