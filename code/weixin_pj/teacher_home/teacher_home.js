/**
 * Created by Administrator on 2018/1/8.
 */
define([C.CLF("avalon.js"),
        'jquery',
        C.Co2("weixin_pj", "teacher_home", "css!"),
        C.Co2("weixin_pj", "teacher_home", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui",
        "highcharts",
        "highcharts_more",
        C.CM("notice_module_wx"),
        C.CM("bottom_tab")
    ],
    function (avalon,jquery, css, html,x,data_center,weui,highcharts,highcharts_more,notice_module_wx,tb) {
        //新增记录 审核情况 日常表现(指标)
        var add_record = api.api + "GrowthRecordBag/home_page_statistics";
        //使用状态
        var use_state = api.api + "base/user_stat/sys_active_cnt";
        //待处理任务
        var pending_url = api.growth + "pendingItems";
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "teacher_home",
                //登陆者信息
                login_info:{},
                is_tab:1,
                date_list:[],
                activity_list:[],
                everyday_list:[],
                pending_list:[],
                is_app:is_app,
                date:[],
                login:[],
                visit:[],
                active:"",
                init: function () {
                    this.init_swipper();
                    this.login_info = cloud.user_user();
                    $.closePicker();
                    ajax_post(add_record,{},this);
                    ajax_post(use_state,{},this)
                },
                init_swipper:function () {
                    $(".swiper-container").swiper({
                        loop: true,
                        autoplay: 3000
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd){
                        case add_record:
                            this.date_list = data.data.statistics_new_record.date_list;
                            this.activity_list = data.data.statistics_new_record.activity_list;
                            this.everyday_list = data.data.statistics_new_record.everyday_list;
                            this.add_charts();
                            break;
                        case use_state:
                            this.date = data.data.date;
                            this.login = data.data.login;
                            this.visit = data.data.visit;
                            this.active = data.data.active;
                            this.use_charts();
                            break;
                        case pending_url:
                            this.pending_list = data.data;
                            this.pending_list = [
                                {"mod":"教师评","count":47,"href":"#teacher_evaluation_list","title":"待评价","type":"1"},
                                {"mod":"成就奖励","count":1,"href":"#achieveCheck","title":"待审核","type":"1"},
                                {"mod":"艺术活动","count":3,"href":"#artactivityCheck","title":"待审核","type":"1"},
                                {"mod":"研究性学习","count":3,"href":"#study_check_list","title":"待审核","type":"1"},
                                {"mod":"身心健康","count":3,"href":"#healthActivityCheck","title":"待审核","type":"1"},
                                {"mod":"教师评","count":47,"href":"#teacher_evaluation_list","title":"待评价","type":"1"},
                                {"mod":"成就奖励","count":1,"href":"#achieveCheck","title":"待审核","type":"1"},
                                {"mod":"艺术活动","count":3,"href":"#artactivityCheck","title":"待审核","type":"1"},
                                {"mod":"研究性学习","count":3,"href":"#study_check_list","title":"待审核","type":"1"},
                                {"mod":"身心健康","count":3,"href":"#healthActivityCheck","title":"待审核","type":"1"}
                                ];
                            break;
                    }
                },
                add_charts:function () {
                    var chart = Highcharts.chart('container_add', {
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
                            text: ''
                        },
                        // subtitle: {
                        //     text: '数据来源: WorldClimate.com'
                        // },
                        legend: {
                            align: "right", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 //间隔Y轴的间隔
                        },
                        xAxis: {
                            categories: this.date_list
                        },
                        yAxis: {
                            title: {
                                style: {
                                    color: '#5f5f5f',
                                },
                                text: '',
                                align: 'high',
                                offset: 10,
                                rotation: 0,
                                y: -25,
                                // verticalAlign:top,
                            },
                            labels: {
                                formatter: function () {
                                    return this.value ;
                                }
                            }
                        },
                        tooltip: {
                            crosshairs: true,
                            shared: true
                        },
                        // plotOptions: {
                        //     spline: {
                        //         marker: {
                        //             radius: 4,
                        //             lineColor: '#666666',
                        //             lineWidth: 1
                        //         }
                        //     }
                        // },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 4,  //曲线点半径，默认是4
                                    symbol: 'circle' //曲线点类型："circle", "square", "diamond", "triangle","triangle-down"，默认是"circle"
                                }
                            }
                        },


                        series: [{
                            name: '日常表现',
                            marker: {
                                fillColor:"#fdd158",

                            },
                            color:'#fdd158',
                            lineColor:"#fdd158",
                            data: this.everyday_list
                        }, {
                            name: '活动',
                            marker: {
                                fillColor:"#0090ff"
                            },
                            color:'#0090ff',
                            lineColor:"#0090ff",
                            data:this.activity_list
                        }]
                    });
                },
                use_charts:function () {
                    var chart = Highcharts.chart('container_use', {
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
                            text: ''
                        },
                        // subtitle: {
                        //     text: '数据来源: WorldClimate.com'
                        // },
                        legend: {
                            align: "right", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 //间隔Y轴的间隔
                        },
                        xAxis: {
                            categories: this.date
                        },
                        yAxis: {
                            title: {
                                style: {
                                    color: '#5f5f5f',
                                },
                                text: '',
                                align: 'high',
                                offset: 10,
                                rotation: 0,
                                y: -25,
                                // verticalAlign:top,
                            },
                            labels: {
                                formatter: function () {
                                    return this.value ;
                                }
                            }
                        },
                        tooltip: {
                            crosshairs: true,
                            shared: true
                        },
                        // plotOptions: {
                        //     spline: {
                        //         marker: {
                        //             radius: 4,
                        //             lineColor: '#666666',
                        //             lineWidth: 1
                        //         }
                        //     }
                        // },
                        plotOptions: {
                            series: {
                                marker: {
                                    radius: 4,  //曲线点半径，默认是4
                                    symbol: 'circle' //曲线点类型："circle", "square", "diamond", "triangle","triangle-down"，默认是"circle"
                                }
                            }
                        },


                        series: [{
                            name: '登录人数',
                            marker: {
                                fillColor:"#6ee59e"
                            },
                            color:"#6ee59e",
                            lineColor:"#6ee59e",
                            data: this.login
                        }, {
                            name: '访问量',
                            marker: {
                                fillColor:"#ff7e00"
                            },
                            color:"#ff7e00",
                            lineColor:"#ff7e00",
                            data: this.visit
                        }]
                    });
                    ajax_post(pending_url,{},this)
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