/**
 * 异议情况
 */
define(['jquery',
        C.CLF('avalon.js'),'layer',
        C.CM("dissenting_situation_module", "html!"),
        C.CM("home_chart", "css!"),
        "highcharts","highcharts_more",
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,home_chart,highcharts, highcharts_more,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-dissent-chart-module', {
            template: html,
            defaults: {
                //获取学年学期
                url:api.api + "base/semester/current_semester.action",
                url_dissent:api.api +"GrowthRecordBag/dissent_statis_count",
                data:{
                    district:"",
                    fk_class_id:"",
                    fk_school_id:"",
                    fk_semester_id:"",
                    semester_start_date:""
                },
                //异议产生
                dissent_start:[],
                //异议核查完成率
                dissent_check:[],
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.url:
                                this.data.fk_semester_id = Number(data.data.id);
                                var start_date = data.data.start_date;
                                this.data.semester_start_date= this.timeChuo(start_date);
                                this.cb();
                                break;
                            case this.url_dissent:
                                var btcyys = data.data.btcyys;//被提出的异议数
                                var yhcyys = data.data.yhcyys;//已核查异议数
                                var zjls = data.data.zjls;//总记录数
                                var zyys = data.data.zyys;//总异议数
                                var is_dissent = 0;
                                var is_check = 0;
                                if(zyys == 0){
                                    is_check = 0;
                                }else{
                                    is_check = yhcyys/zyys;
                                }
                                if(zjls == 0){
                                    is_dissent = 0;
                                }else{
                                    is_dissent = btcyys/zjls;
                                }
                                /*异议产生率*/
                                var arr_x = ['有异议'];
                                var arr_y = ['无异议'];
                                arr_x.push(is_dissent);
                                arr_y.push(1-is_dissent);
                                this.dissent_start.push(arr_x);
                                this.dissent_start.push(arr_y);
                                /*异议核查完成率*/
                                var new_arr_x = ['审核完成率'];
                                var new_arr_y = ['审核未完成率'];
                                new_arr_x.push(is_check);
                                new_arr_y.push(1-is_check);
                                this.dissent_check.push(new_arr_x);
                                this.dissent_check.push(new_arr_y);
                                this.charts();
                                break;

                        }
                    }else{
                        toastr.error(msg);
                    }
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var tUserData = JSON.parse(data.data["user"]);
                        var highest_level = Number(data.data.highest_level);
                        //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师 7个体
                        switch (highest_level) {
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
                        ajax_post(self.url_dissent,self.data,self);
                    });
                },
                charts:function () {
                    var chart = Highcharts.chart('dissent_chart_x', {
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
                            name: '异议产生率',
                            size:'90%',
                            data: this.dissent_start,
                            colors:['#ffbe23','#9fd1c1']
                        }]
                    });
                    this.charts_x();
                },
                charts_x:function () {
                    var chart = Highcharts.chart('dissent_chart_y', {
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
                            name: '异议核查完成率',
                            size:'90%',
                            data: this.dissent_check,
                            colors:['#f29d23','#4498b4'],
                        }]
                    });
                },
                get_info:function () {
                    this.charts();
                },
                onReady: function () {
                    ajax_post(this.url,{},this);
                },
                timeChuo: function(h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function(format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                                    date[k] : ("00" + date[k]).substr(("" + date[k]).length));
                            }
                        }
                        return format;
                    }
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                }
            }
        });
    });
