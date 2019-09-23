define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'user_active_school/user_active_school', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("use_state_module"),
        C.CM("three_menu_module"),
        "highcharts"

    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, use_state_module, three_menu_module, highcharts) {

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "d_e_progress",
                is_init_sel: true,
                orderList: [],
                area_list: [],
                semester_list: [],
                grade_list: [],
                count: count,
                current_grade: "",
                current_area: "",
                // 校级查看
                current_school: "",
                current_school_dist: "",

                //校级数据
                data_school: [],
                //班级数据
                data_class: [],
                //用户等级
                user_level: '',
                //当前年级id
                grade_id: '',
                filter_city: make_filter(function (line) {
                    if (line.grade == vm.current_grade || vm.current_grade == "")
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (line.grade == vm.current_grade || vm.current_grade == "") &&
                        (line.district == vm.current_area || vm.current_area == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (line.grade == vm.current_grade || vm.current_grade == "") &&
                        (line.district == vm.current_school_dist || vm.current_school_dist == "") &&
                        (line.school.indexOf(vm.current_school) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                init: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.grade_id = this.grade_list[0].value;
                    this.user_level = cloud.user_level();
                },
                filter: function (el, data) {
                    if (data == "")
                        return true;
                    if (el.grade == data) return true;
                    return false;
                },
                cb: function () {
                    var self = this;
                    cloud.school_yfhy_process({}, function (url, args, data) {
                        sort_by(data.list, ["+grade"]);
                        self.data_school = data;
                    });
                    this.get_class_data();
                },
                get_class_data: function () {
                    var self = this;
                    cloud.class_yfhy_process({grade_id: Number(this.grade_id)}, function (url, args, data) {
                        sort_by(data.list, ["+grade","+class_name"]);

                        self.data_class = data;
                        if (data.list.length == 0)
                            return;
                        self.active_bar('tubiao_3', self.data_class);
                    })
                },
                set_class_img_height:function (count1,count2,div_id) {
                    var height = count1*count2*40+110+'px';

                    var tubiao = document.getElementById(div_id);
                    tubiao.style.height = height;
                },
                active_bar: function (div_id, table_data) {
                    var myChart = echarts.init(document.getElementById(div_id));
                    var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];

                    var yAxis_arr = [];
                    var legend_data = ['今日登录', '七日登录', '七日访问量'];
                    var data_login = [];
                    var data_logins = [];
                    var data_visits = [];
                    for (var i = 0; i<table_data.list.length; i++) {
                        var list = table_data.list;
                        var grade_name = list[i].grade;
                        var class_name = list[i].class_name;
                        if (yAxis_arr.indexOf(class_name) == -1) {
                            var str = grade_name +class_name;
                            yAxis_arr.push(str)
                        }
                        var login = Number(list[i].tch_login) + Number(list[i].stu_login) + Number(list[i].par_login);
                        var logins = Number(list[i].tch_logins) + Number(list[i].stu_logins) + Number(list[i].par_logins);
                        var visits = Number(list[i].tch_visits) + Number(list[i].stu_visits) + Number(list[i].par_visits);
                        data_login.push(Number(login));
                        data_logins.push(Number(logins));
                        data_visits.push(Number(visits));
                    }
                    var option = {

                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        legend: {
                            data: legend_data,
                            selected:{
                                '今日登录':true,
                                '七日登录':false,
                                '七日访问量':false
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'value',
                            boundaryGap: [0, 0.01],
                            show: false
                        },
                        yAxis: {
                            type: 'category',
                            inverse: true,
                            data: yAxis_arr,
                            axisLabel: {
                                color: "#000",
                                interval: 0,
                                formatter: function (value) {
                                    if (value.length > 6) {
                                        return value.substring(6) + "...";
                                    } else {
                                        return value;
                                    }
                                }
                            }
                        },
                        series: [
                            {
                                name: '今日登录',
                                type: 'bar',
                                data: data_login,
                                barWidth : 30,
                                itemStyle: {
                                    normal: {
                                        color: color_arr[0],
                                        label: {
                                            show: true,
                                            position: 'insideLeft',
                                            formatter: function (params) {
                                                return params.data;
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                name: '七日登录',
                                type: 'bar',
                                data: data_logins,
                                barWidth : 30,
                                itemStyle: {
                                    normal: {
                                        color: color_arr[1],
                                        label: {
                                            show: true,
                                            position: 'insideLeft',
                                            formatter: function (params) {
                                                return params.data;
                                            }
                                        }
                                    }
                                }
                            },
                            {
                                name: '七日访问量',
                                type: 'bar',
                                barWidth : 30,
                                data: data_visits,
                                itemStyle: {
                                    normal: {
                                        color: color_arr[2],
                                        label: {
                                            show: true,
                                            position: 'insideLeft',
                                            formatter: function (params) {
                                                return params.data;
                                            }
                                        }
                                    }
                                }
                            },
                        ]
                    };
                    vm.set_class_img_height(yAxis_arr.length,1,div_id)
                    myChart.clear();
                    myChart.setOption(option);
                    myChart.resize();
                    myChart.on('legendselectchanged',function (params) {
                        var name = params.name;
                        for(var key in option.legend.selected){
                            if(key==name){
                                option.legend.selected[key] = true;
                            }else {
                                option.legend.selected[key] = false;
                            }
                        }
                        myChart.setOption(option);
                        myChart.resize();

                    })
                },
                //下拉选择获取的数据
                grade_check: function (el) {
                    this.grade_id = el.value;
                    this.get_class_data();
                }
            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
                    vm.cb();
                })
            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
