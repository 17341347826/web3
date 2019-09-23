/**
 * Created by Administrator on 2018/9/12.
 */
define([C.CLF("avalon.js"),
        'jquery',
        C.Co("weixin_pj", "school_login/school_home/school_home", "css!"),
        C.Co("weixin_pj", "school_login/school_home/school_home", "html!"),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "jquery-weui",
        "highcharts",
        "highcharts_more",
        C.CM("bottom_tab")
    ],
    function (avalon,jquery, css, html,x,data_center,weui,highcharts,highcharts_more,tb) {
        //新增记录 审核情况 日常表现(指标)
        var add_record = api.api + "GrowthRecordBag/home_page_statistics";
        //使用状态
        var use_state = api.api + "base/user_stat/sys_active_cnt";
        //通知公告:获取最新的一条通知
        var new_notice = api.api + 'Indexmaintain/indexmaintain_selNewNoticeInfo';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "school_home",
                is_tab:1,
                //登陆者信息
                login_info:{},
                //新增记录 审核情况 日常表现(指标)
                date_list:[],
                activity_list:[],
                everyday_list:[],
                pending_list:[],
                //通知数据
                notice_data:[],
                is_app:is_app,
                //使用状态
                date:[],
                login:[],
                visit:[],
                active:"",
                init: function () {
                    this.init_swipper();
                    $.closePicker();
                    this.cd();
                },
                cd:function(){
                    var self = this;
                    data_center.uin(function(data){
                        var tUser = JSON.parse(data.data.user);
                        self.login_info = tUser;
                        var userType = data.data.user_type;
                        //通知公告
                        ajax_post(new_notice,{userType:userType},self);
                        //新增记录
                        ajax_post(add_record,{},self);
                        //使用状态
                        ajax_post(use_state,{},self);
                    });
                },
                init_swipper:function () {
                    $(".swiper-container").swiper({
                        loop: true,
                        autoplay: 3000
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd){
                        //新增记录
                        case add_record:
                            this.date_list = data.data.statistics_new_record.date_list;
                            this.activity_list = data.data.statistics_new_record.activity_list;
                            this.everyday_list = data.data.statistics_new_record.everyday_list;
                            this.add_charts();
                            break;
                        //使用状态
                        case use_state:
                            this.date = data.data.date;
                            this.login = data.data.login;
                            this.visit = data.data.visit;
                            this.active = data.data.active;
                            this.use_charts();
                            break;
                        //最新通知
                        case new_notice:
                            if(data.data){
                                this.notice_data = data.data;
                            }else{
                                this.notice_data = {title:"暂无最新数据"};
                            }
                            break;
                    }
                },
                //新增记录
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
                //使用状态
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
                },

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