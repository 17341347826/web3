/**
 * 审核情况
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("audit_chart_module", "html!"),
        C.CM("home_chart", "css!"),
        "highcharts","highcharts_more",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,home_chart,highcharts, highcharts_more,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-audit-chart-module', {
            template: html,
            defaults: {
                //新增记录 审核情况 日常表现(指标)
                add_record:api.api + "GrowthRecordBag/home_page_statistics",
                /*审核完成比率*/
                check_finish:[],
                /*审核通过比率*/
                pass_check:[],
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.add_record:
                                var statistics_audit_status = data.data.statistics_audit_status;
                                var audit_not_finish = statistics_audit_status.audit_not_finish;//审核未完成率
                                var audit_pass = statistics_audit_status.audit_pass;//审核通过率
                                var audit_not_pass = statistics_audit_status.audit_not_pass;//审核不通过率
                                var audit_finish = statistics_audit_status.audit_finish;//审核完成率
                                /*审核完成比率*/
                                var arr_x = ['完成率'];
                                var arr_y = ['未完成率'];
                                arr_x.push(audit_finish);
                                arr_y.push(audit_not_finish);
                                this.check_finish.push(arr_x);
                                this.check_finish.push(arr_y);
                                /*审核通过比率*/
                                var new_arr_x = ['通过率'];
                                var new_arr_y = ['未通过率'];
                                new_arr_x.push(audit_pass);
                                new_arr_y.push(audit_not_pass);
                                this.pass_check.push(new_arr_x);
                                this.pass_check.push(new_arr_y);
                                this.charts();
                                break;
                        }
                    }else{
                        layer.msg(msg);
                    }
                },
                charts:function () {
                    var chart = Highcharts.chart('audit_chart_x', {
                        //去掉logo
                        credits: {
                            enabled: false
                        },
                        //去掉打印按钮
                        exporting: {
                            enabled: false
                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            headerFormat: '{series.name}<br>',
                            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>'
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,  // 可以被选择
                                cursor: 'pointer',       // 鼠标样式
                                dataLabels: {
                                    enabled: true,//是否直接呈现数据 也就是外围显示数据与否
                                    distance:-30,
                                    format: '{point.percentage:.1f} %',
                                    style: {
                                        color: 'black'
                                    }
                                },
                                showInLegend: true
                            }

                        },
                        legend: {//控制图例显示位置
                            layout: 'horizontal',
                            align: 'left',
                            verticalAlign: 'top',
                            borderWidth: 0
                        },


                        series: [{
                            type: 'pie',
                            name: '审核完成比率',
                            size:'90%',
                            data: this.check_finish,
                            colors:['#00cdb7','#ffc600']
                        }]
                    });
                    this.charts_x();
                },
                charts_x:function () {
                    var chart = Highcharts.chart('audit_chart_y', {
                        //去掉logo
                        credits: {
                            enabled: false
                        },
                        //去掉打印按钮
                        exporting: {
                            enabled: false
                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            headerFormat: '{series.name}<br>',
                            pointFormat: '{point.name}: <b>{point.percentage:.1f}%</b>',
                        },
                        plotOptions: {
                            pie: {
                                allowPointSelect: true,  // 可以被选择
                                cursor: 'pointer',       // 鼠标样式
                                dataLabels: {
                                    enabled: true,//是否直接呈现数据 也就是外围显示数据与否
                                    distance:-30,
                                    format: '{point.percentage:.1f} %',
                                    style: {
                                        color: 'black'
                                    }
                                },
                                showInLegend: true
                            }
                        },
                        legend: {//控制图例显示位置
                            layout: 'horizontal',
                            align: 'left',
                            verticalAlign: 'top',
                            borderWidth: 0
                        },
                        series: [{
                            type: 'pie',
                            name: '审核通过比率',
                            size:'90%',
                            data: this.pass_check,
                            colors:['#2ecf94','#1e88e5'],
                        }]
                    });
                },
                onReady: function () {
                    ajax_post(this.add_record,{},this);

                }
            }
        });
    });
