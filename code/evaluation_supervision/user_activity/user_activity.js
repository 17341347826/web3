define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'user_activity/user_activity', 'html!'),
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
                data_city: [],
                data_area: [],
                data_school: [],
                //用户等级
                user_level: '',
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
                        (line.detail.grade == vm.current_grade || vm.current_grade == "") &&
                        (line.district == vm.current_school_dist || vm.current_school_dist == "")
                        &&
                        (line.school.indexOf(vm.current_school) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
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
                    this.user_level = cloud.user_level();
                    var obj = {
                        name: '请选择年级',
                        value: ''
                    };
                    var area_obj = {
                        name:'请选择区县',
                        value:''
                    };
                    this.grade_list.unshift(obj);
                    if (this.user_level < 4) {
                        this.area_list = cloud.sel_area_list();
                        this.area_list.unshift(area_obj);
                    }
                },

                filter: function (el, data) {
                    if (data == "")
                        return true;
                    if (el.grade == data) return true;
                    return false;
                },
                old_data_school: [],
                cb: function () {
                    var self = this;
                    cloud.city_yfhy_process({}, function (url, args, data) {
                        data.list = sort_by(data.list, ['+city', '+grade']);
                        self.data_city = data;
                        self.row_length = self.data_city.length;
                    });
                    cloud.area_yfhy_process({}, function (url, args, data) {
                        data.list = sort_by(data.list, ['+city', '+district', '+grade'])

                        self.data_area = data;
                        // self.get_school_count(self.data_area.list,'district', 'tubiao_2');
                        self.deal_data(self.data_area.list, 'district', 'tubiao_2');
                    });
                    cloud.school_yfhy_process({}, function (url, args, data) {
                        var data_list = data.list;
                        var arr = [];
                        for (var i = 0; i < data_list.length; i++) {
                            if (arr.indexOf(data_list[i].grade) == -1) {
                                arr.push(data_list[i].grade)
                            }
                        }
                        var new_cnt = complate_data(data_list, ['district', 'school'], 'grade', arr, 0);
                        data.list = sort_by(new_cnt, ['+district', '+school', '+status'])
                        self.data_school = data;
                        self.old_data_school = data;
                        // self.get_school_count(self.data_school.list,'school', 'tubiao_3');
                        self.deal_data(self.data_school.list, 'school', 'tubiao_3');
                    });
                },
                deal_data: function (data, type, div_id) {
                    var yAxis_arr = [];
                    var today_obj = {};
                    var seven_logins_obj = {};
                    var seven_visit_obj = {};
                    for (var i = 0; i < data.length; i++) {
                        var school_name = data[i][type];
                        if (yAxis_arr.indexOf(school_name) == -1) {
                            yAxis_arr.push(school_name);
                        }
                        var obj_key = school_name;
                        if (!today_obj[obj_key]) {
                            today_obj[obj_key] = 0;
                        }
                        if (!seven_logins_obj[obj_key]) {
                            seven_logins_obj[obj_key] = 0;
                        }
                        if (!seven_visit_obj[obj_key]) {
                            seven_visit_obj[obj_key] = 0;
                        }
                        var to_day_num = Number(data[i].tch_login) + Number(data[i].stu_login) + Number(data[i].par_login);
                        var seven_login_num = Number(data[i].tch_logins) + Number(data[i].stu_logins) + Number(data[i].par_logins);
                        var seven_visit_num = Number(data[i].tch_visits) + Number(data[i].stu_visits) + Number(data[i].par_visits);
                        if (type == 'school') {
                            to_day_num = Number(data[i].detail.tch_login) + Number(data[i].detail.stu_login) + Number(data[i].detail.par_login);
                            seven_login_num = Number(data[i].detail.tch_logins) + Number(data[i].detail.stu_logins) + Number(data[i].detail.par_logins);
                            seven_visit_num = Number(data[i].detail.tch_visits) + Number(data[i].detail.stu_visits) + Number(data[i].detail.par_visits);
                        }
                        today_obj[obj_key] += to_day_num;
                        seven_logins_obj[obj_key] += seven_login_num;
                        seven_visit_obj[obj_key] += seven_visit_num;
                    }
                    var today_arr = [];
                    var seven_login_arr = [];
                    var seven_visit_arr = [];
                    for (var key in today_obj) {
                        today_arr.push(today_obj[key])
                    }
                    for (var key in seven_logins_obj) {
                        seven_login_arr.push(seven_logins_obj[key])
                    }
                    for (var key in seven_visit_obj) {
                        seven_visit_arr.push(seven_visit_obj[key])
                    }
                    var seriesLabel = {
                        normal: {
                            show: true,
                            textBorderColor: '#333',
                            textBorderWidth: 2
                        }
                    }
                    var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];

                    var option = {
                        title: {
                            text: ''
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        legend: {
                            data: ['今日登陆', '七日登陆', '七日访问'],
                            selected: {
                                '今日登录': false,
                                '七日登录': false,
                                '七日访问量': false
                            }

                        },
                        grid: {
                            left: 100
                        },
                        xAxis: {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value}'
                            },
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
                                    if (value.length > 4) {
                                        return value.substring(0, 4) + "...";
                                    } else {
                                        return value;
                                    }
                                }
                            }
                        },
                        series: [
                            {
                                name: '今日登陆',
                                type: 'bar',
                                label: seriesLabel,
                                data: today_arr,
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
                                },
                                barWidth: 30
                            },
                            {
                                name: '七日登陆',
                                type: 'bar',
                                label: seriesLabel,
                                data: seven_login_arr,
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
                                },
                                barWidth: 30
                            },
                            {
                                name: '七日访问',
                                type: 'bar',
                                label: seriesLabel,
                                data: seven_visit_arr,
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
                                },
                                barWidth: 30
                            }
                        ]
                    };
                    if(vm.current_grade==''){
                        vm.get_school_count(yAxis_arr.length,vm.grade_list.length,div_id)
                    }else {
                        vm.get_school_count(yAxis_arr.length,1,div_id)
                    }
                    var myChart = echarts.init(document.getElementById(div_id));

                    option.legend.selected['今日登陆'] = true;
                    option.legend.selected['七日登陆'] = false;
                    option.legend.selected['七日访问'] = false;
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
                get_school_count: function (count1,count2, div_id) {
                    // var table_length = data.length;
                    // var count = 1;
                    // for (var i = 0; i < table_length; i++) {
                    //     if (i > 0 && data[i][type] != data[i - 1][type]) {
                    //         count++;
                    //     }
                    // }
                    var tubiao = document.getElementById(div_id);
                    tubiao.style.height = count1*count2*40 + 110 + 'px';

                },
                //下拉选择获取的数据
                grade_check: function (el) {
                    if (el.value == '') {
                        this.current_grade = '';
                    } else {
                        this.current_grade = el.name;
                    }
                    // this.get_school_count(this.filter_area(this.data_area.list),'district', 'tubiao_2');
                    this.deal_data(this.filter_area(this.data_area.list), 'district', 'tubiao_2');

                    var arr = this.filter_school(this.data_school.list);
                    // this.get_school_count(arr,'school', 'tubiao_3');
                    this.deal_data(arr, 'school', 'tubiao_3')
                },
                area_check: function (el) {
                    if (el.value == '') {
                        this.current_area = '';
                    } else {
                        this.current_area = el.name;
                    }
                    var data_arr = this.filter_area(this.data_area.list)
                    // this.get_school_count(data_arr, 'district','tubiao_2');
                    this.deal_data(data_arr, 'district', 'tubiao_2');
                },
                school_area_check: function (el) {
                    this.current_school = '';
                    if (el.value == '') {
                        this.current_school_dist = '';
                    } else {
                        this.current_school_dist = el.name;
                    }
                    this.search();
                },
                search: function () {
                    // this.data_school.list = this.filter_old_school(this.old_data_school.list)
                    var arr = this.filter_school(this.data_school.list);
                    // this.get_school_count(arr,'school', 'tubiao_3');
                    this.deal_data(arr, 'school', 'tubiao_3')
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
