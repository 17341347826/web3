/**
 * 使用状态
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("use_state_module", "html!"),
        C.CM("home_chart", "css!"),
        "highcharts","highcharts_more",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,home_chart,highcharts, highcharts_more,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-use-state', {
            template: html,
            defaults: {
                //使用状态
                use_state:api.api + "base/user_stat/sys_active_cnt",
                date:[],
                login:[],
                visit:[],
                active:"",
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.use_state:
                                this.date = data.data.date;
                                this.login = data.data.login;
                                this.visit = data.data.visit;
                                this.active = data.data.active;
                                this.charts();
                                break;
                        }

                    }else{
                        layer.msg(msg);
                    }
                },
                charts:function () {
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
                get_info:function () {
                    this.charts();
                },
                onReady: function () {
                    ajax_post(this.use_state,{},this)
                }
            }
        });
    });
