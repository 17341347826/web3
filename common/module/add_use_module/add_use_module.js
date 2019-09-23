/**
 * 新增记录
 */
define(['jquery',
        C.CLF('avalon.js'),"layer",
        C.CM("add_use_module", "html!"),
        C.CM("home_chart", "css!"),
        "highcharts","highcharts_more",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,home_chart,highcharts, highcharts_more,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-add-use-module', {
            template: html,
            defaults: {
                change_tab_num:1,
                /*==================================新增记录====================================*/
                //新增记录 审核情况 日常表现(指标)
                add_record:api.api + "GrowthRecordBag/home_page_statistics",
                date_list:[],
                activity_list:[],
                everyday_list:[],
                /*===================================使用状态============================================*/
                //使用状态
                use_state:api.api + "base/user_stat/sys_active_cnt",
                date:[],
                login:[],
                visit:[],
                active:"",
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.add_record:
                                this.date_list = data.data.statistics_new_record.date_list;
                                this.activity_list = data.data.statistics_new_record.activity_list;
                                this.everyday_list = data.data.statistics_new_record.everyday_list;
                                this.charts();
                                break;
                            case this.use_state:
                                this.date = data.data.date;
                                this.login = data.data.login;
                                this.visit = data.data.visit;
                                this.active = data.data.active;
                                this.charts_x();
                                break;
                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                charts:function () {
                    var chart = Highcharts.chart('container', {
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
                charts_x:function () {
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

                change_tab:function (index) {
                    this.date_list = [];
                    this.activity_list = [];
                    this.everyday_list = [];
                    this.date = [];
                    this.login = [];
                    this.visit = [];
                    this.active = '';
                    this.change_tab_num = index;
                    if(index == 1){
                        this.onReady();
                    }else{
                        ajax_post(this.use_state,{},this)
                    }

                },
                onReady: function () {
                    ajax_post(this.add_record,{},this);
                }
            }
        });
    });
