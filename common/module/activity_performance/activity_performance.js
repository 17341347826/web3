/**
 * 活动表现
 */
define(['jquery',
        C.CLF('avalon.js'),
        C.CM("activity_performance", "html!"),
        C.CM("home_chart", "css!"),
        "highcharts","highcharts_more",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,html,home_chart,highcharts, highcharts_more,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-activity-performance', {
            template: html,
            defaults: {
                //获取学年学期
                url:api.api + "base/semester/current_semester.action",
                //活动表现
                url_activity:api.api + "GrowthRecordBag/first_index_activity_count",
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
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.url:
                                this.data.fk_semester_id = Number(data.data.id);
                                this.cb();
                                break;
                            case this.url_activity:
                                this.index_list = data.data.index;
                                this.personal_list = data.data.list[0].data;
                                this.class_list = data.data.list[1].data;
                                this.max_list = data.data.list[2].data;
                                this.charts();
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
                        ajax_post(self.url_activity,self.data,self);
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
                },
                onReady: function () {
                    ajax_post(this.url,{},this);
                }
            }
        });
    });
