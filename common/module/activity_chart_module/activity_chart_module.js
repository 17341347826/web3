/**
 * 活跃度
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("activity_chart_module", "html!"),
        C.CM("home_chart", "css!"),
        C.CM("activity_chart_module", "css!"),
        "highcharts","highcharts_more",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,home_chart,css,highcharts, highcharts_more,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-activity-chart-module', {
            template: html,
            defaults: {
                //获取学年学期
                url:api.api + "base/semester/current_semester.action",
                //活动
                url_activity:api.api + "GrowthRecordBag/active_statis_activity_growth",
                //活跃度
                activity_everyday:api.api +"GrowthRecordBag/active_statis_everyday",
                data:{
                    city:"",
                    district:"",
                    fk_class_id:"",
                    fk_school_id:"",
                    fk_semester_id:""
                },
                everyday_week:[],
                everyday_month:[],
                everyday_semester:[],
                activity_week:[],
                activity_month:[],
                activity_semester:[],
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.url:
                                this.data.fk_semester_id = Number(data.data.id);
                                this.cb();
                                break;
                            case this.activity_everyday:
                                this.everyday_week.push(data.data.yu.min_num);
                                this.everyday_week.push(data.data.yu.avg_num);
                                this.everyday_week.push(data.data.yu.max_num);
                                this.everyday_month.push(data.data.ym.min_num);
                                this.everyday_month.push(data.data.ym.avg_num);
                                this.everyday_month.push(data.data.ym.max_num);
                                this.everyday_semester.push(data.data.xq.min_num);
                                this.everyday_semester.push(data.data.xq.avg_num);
                                this.everyday_semester.push(data.data.xq.max_num);
                                this.charts();
                                break;
                            case this.url_activity:
                                this.activity_week.push(data.data.yu.min_num);
                                this.activity_week.push(data.data.yu.avg_num);
                                this.activity_week.push(data.data.yu.max_num);
                                this.activity_month.push(data.data.ym.min_num);
                                this.activity_month.push(data.data.ym.avg_num);
                                this.activity_month.push(data.data.ym.max_num);
                                this.activity_semester.push(data.data.xq.min_num);
                                this.activity_semester.push(data.data.xq.avg_num);
                                this.activity_semester.push(data.data.xq.max_num);
                                this.charts_activity();
                                break;

                        }
                    }else{
                        layer.msg(msg);
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var highest_level = Number(data.data.highest_level);
                        //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师 7个体
                        switch (highest_level) {
                            case 1:
                                break;
                            case 2:
                                self.data.city = tUserData.city;//市州级
                                break;
                            case 3:
                                self.data.district = tUserData.district;//区县级
                                break;
                            case 4:
                                self.data.fk_school_id = tUserData.fk_school_id;//校级
                                break;
                            case 6://班主任或普通任课教师
                                self.data.fk_school_id = tUserData.fk_school_id;
                                self.data.fk_class_id = tUserData.lead_class_list[0].class_list[0].class_id;
                                break;
                        };
                        ajax_post(self.activity_everyday,self.data,self);
                    });
                },
                charts:function () {
                    var chart = Highcharts.chart('activity_chart_x',{
                        chart: {
                            type: 'column'
                        },
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
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            categories: ['最低','平均记录数','最高'],
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: '日常表现',
                                align: 'high',
                                offset: 10,
                                rotation: 0,
                                y: -25
                            }
                        },
                        legend: {
                            align: "right", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 //间隔Y轴的间隔
                        },
                        tooltip: {
                            // head + 每个 point + footer 拼接成完整的 table
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                borderWidth: 0
                            }
                        },
                        series: [{
                            name: '近一周',
                            color:"#7dd263",
                            data: this.everyday_week
                        }, {
                            name: '近一月',
                            color:"#f19133",
                            data: this.everyday_month
                        }, {
                            name: '本学期',
                            color:"#26bbc4",
                            data: this.everyday_semester
                        }]
                    });
                    ajax_post(this.url_activity,this.data,this);
                },
                charts_activity:function () {
                    var chart = Highcharts.chart('activity_chart_y',{
                        chart: {
                            type: 'column'
                        },
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
                        subtitle: {
                            text: ''
                        },
                        xAxis: {
                            categories: ['最低','平均记录数','最高'],
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: '活动记录',
                                align: 'high',
                                offset: -10,
                                rotation: 0,
                                y: -25
                            }
                        },
                        legend: {
                            align: "right", //程度标的目标地位
                            verticalAlign: "top", //垂直标的目标地位
                            x: 0, //间隔x轴的间隔
                            y: -5 //间隔Y轴的间隔
                        },
                        tooltip: {
                            // head + 每个 point + footer 拼接成完整的 table
                            headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                            '<td style="padding:0"><b>{point.y}</b></td></tr>',
                            footerFormat: '</table>',
                            shared: true,
                            useHTML: true
                        },
                        plotOptions: {
                            column: {
                                borderWidth: 0
                            }
                        },
                        series: [{
                            name: '近一周',
                            color:"#7cddaf",
                            data: this.activity_week//49.9指周最低 71.5指周平均记录数 106.4指周最高
                                                    // 下面同理(data里的数据是按照 '最低','平均记录数','最高'来排列的)
                        }, {
                            name: '近一月',
                            color:"#ff546c",
                            data: this.activity_month
                        }, {
                            name: '本学期',
                            color:"#54b5ff",
                            data: this.activity_semester
                        }]
                    });
                },
                onReady: function () {
                    ajax_post(this.url,{},this);
                }
            }
        });
    });
