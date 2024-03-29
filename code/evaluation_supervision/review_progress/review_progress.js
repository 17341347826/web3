define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'review_progress/review_progress', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {

        var avalon_define = function () {
            var Screen;
            var vm = avalon.define({
                $id: "d_e_progress",
                //@value(el, "findtype4.count", 0))
                value: value,
                //@count(@school_process_list, el.schoolname)
                count: count,
                is_init_sel: true,
                area_list: [],
                semester_list: [],
                grade_list: [],
                school_list: [],

                semester: "",//接口参数 学期
                grade_all: [],//接口参数 年级
                //市参数
                city_p: {
                    semester: "",//学期
                    grade_ids: [],//年级
                },
                //区参数
                area_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                },
                //学校参数
                school_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: '',//学校名称
                },
                user_level: '',
                default_area:'',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.list_data()

                },
                sel_change_grade: function (el) {
                    var arr = new Array();
                    if (el.value == '') {
                        this.city_p.grade_ids = [];
                        this.area_p.grade_ids = [];
                        this.school_p.grade_ids = [];
                    } else {
                        arr.push(el.value)
                        this.city_p.grade_ids = arr
                        this.area_p.grade_ids = arr
                        this.school_p.grade_ids = arr
                    }
                    vm.ring_diagram('tubiao_1', this.filter_city(this.city_process_list));
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')

                },

                sel_change_area: function (el) {
                    if (el.name == '全部') {
                        this.area_p.district_name = ''
                    } else {
                        this.area_p.district_name = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');

                },
                sel_change_area_2: function (el) {
                    this.school_p.school_name = '';
                    this.default_area = el.name;
                    this.school_data_deal(el.name)
                },
                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
                //初始数据
                init: function () {
                    $("#func_list").select2();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                    }
                    if (this.grade_list.length > 0) {//默认查询所有年级
                        var arr = new Array()
                        for (idx in this.grade_list) {
                            if (this.grade_list[idx].value == "") continue;
                            arr.push(Number(this.grade_list[idx].value));
                        }
                        this.grade_all = arr
                    }
                    this.list_data()
                },
                search: function () {
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                //初始前期数据
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                    this.default_area = this.area_list[0].name
                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    this.grade_list.unshift(obj);
                    this.area_list.unshift(obj);
                },
                //页面数据过滤
                filter_city: make_filter(function (line) {
                    if (
                        vm.city_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.city_p.grade_ids.length == 0
                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.area_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.area_p.district_name || vm.area_p.district_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.detail.grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")

                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.fk_school_id) >= 0 || vm.school_p.fk_school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_undefined: filter_undefined,
                row_length: 0,

                list_data: function () {
                    var level = [3,4]
                    if(this.user_level<3){
                        level = [2,3,4]
                    }
                    cloud.lr_dsh_process1({
                        semester: this.semester,
                        grade_ids: this.grade_all,
                        level: level
                    }, function (data) {
                        if (data.city && data.city.length > 0) {
                            var city_data = ES.completion_rate(data.city);
                            vm.city_process_list = city_data
                            vm.row_length = vm.city_process_list.length
                            setTimeout(function () {
                                vm.ring_diagram('tubiao_1', vm.filter_city(city_data));
                            },0)

                        }
                        if(data.area && data.area.length>0){
                            var area_data = ES.completion_rate(data.area);
                            vm.area_process_list = area_data;
                            setTimeout(function () {
                                vm.deal_data(vm.filter_city(area_data), 'district', 'tubiao_2');
                            },10)

                        }
                        if(data.school && data.school.length>0){
                            var arr = [];
                            var school_data = data.school;
                            for (var i = 0; i < school_data.length; i++) {
                                if (arr.indexOf(school_data[i].grade_name) == -1) {
                                    arr.push(school_data[i].grade_name)
                                }
                            }
                            var new_cnt = complate_data(school_data, ['district', 'school_id', 'schoolname'], 'grade_name', arr, 0);
                            Screen.all_data = new_cnt;
                            vm.school_data_deal(vm.default_area);
                        }
                    })
                },

                school_data_deal: function (area) {
                    Screen.screen(area, function (new_cnt) {
                        vm.school_process_list = new_cnt;
                        vm.old_school_process_list = new_cnt;
                        setTimeout(function () {
                            vm.deal_data(vm.filter_school(new_cnt), 'school', 'tubiao_3')
                        },0)
                    })
                },
                ring_diagram: function (div_id, series_arr) {
                    var myChart = echarts.init(document.getElementById(div_id));
                    var color = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];
                    var dataStyle = {
                        normal: {
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            },
                            shadowBlur: 40,
                            borderWidth: 2,
                            shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
                        }
                    };
                    var placeHolderStyle = {
                        normal: {
                            color: '#e1e2e4',
                            label: {
                                show: false
                            },
                            labelLine: {
                                show: false
                            }
                        },
                        emphasis: {
                            color: '#ffffff'
                        }
                    };
                    //------处理数据------------
                    var legend_data = [];

                    var series_length = series_arr.length;
                    var series = [];
                    for (var i = 0; i < series_length; i++) {
                        legend_data.push(series_arr[i].grade_name);
                        var series_obj = {
                            name: 'Line',
                            type: 'pie',
                            clockWise: false,
                            radius: [30, 38],
                            center: ['50%', '50%'],
                            itemStyle: dataStyle,
                            hoverAnimation: false,
                            startAngle: 90,
                            label: {
                                borderRadius: '10'
                            },
                            data: [
                                {
                                    value: 54.6,
                                    name: '初2017',
                                    itemStyle: {
                                        normal: {
                                            color: color[0]
                                        }
                                    }
                                },
                                {
                                    value: 45.4,
                                    name: '',
                                    tooltip: {
                                        show: true
                                    },
                                    itemStyle: placeHolderStyle
                                }
                            ]
                        };
                        var audit_finish_rate = series_arr[i].city_cnt.audit_finish_rate;
                        var completion_rate = 0;
                        if (!audit_finish_rate || audit_finish_rate == 0) {
                            completion_rate = 0;
                        } else {
                            completion_rate = series_arr[i].city_cnt.audit_finish_rate.split('%')[0];
                        }

                        series_obj.name = series_obj.name + (i + 1);
                        var radius_1 = 30 + i * 10;
                        var radius_2 = 38 + i * 10;
                        series_obj.radius = [radius_1, radius_2];
                        series_obj.data[0].value = completion_rate;
                        series_obj.data[0].name = legend_data[i];
                        series_obj.data[0].itemStyle.normal.color = color[i];
                        series_obj.data[1].value = 100 - completion_rate;
                        series_obj.data[1].name = legend_data[i] + '未评';
                        series.push(series_obj)
                    }
                    if (legend_data.length == 0) {
                        legend_data = ['初2017', '初2018', '初2019'];
                    }
                    //------------
                    var option = {
                        backgroundColor: '#ffffff',
                        title: {
                            x: 'center',
                            y: 'center',
                            textStyle: {
                                fontWeight: 'normal',
                                fontSize: 12,
                                color: "#000000"
                            }
                        },
                        tooltip: {
                            trigger: 'item',
                            show: true,
                            formatter: "{b} : <br/>{d}%",
                            backgroundColor: 'rgba(0,0,0,0.7)', // 背景
                            padding: [1, 1], //内边距
                            extraCssText: 'box-shadow: 0 0 3px rgba(255, 255, 255, 0.4);' //添加阴影
                        },
                        legend: {
                            top: '0',
                            x: 'center',
                            icon: 'circle',
                            itemGap: 8,
                            data: legend_data,
                            textStyle: {
                                color: '#fft'
                            }
                        },
                        series: series
                    };
                    myChart.clear();
                    myChart.setOption(option);
                },
                old_school_process_list: [],
                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length - 1; i > -1; i--) {
                        var name = data[i].grade_name;
                        if (type == 'school') {
                            name = data[i].status;
                        }
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.unshift(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        if (type == 'district') {
                            y_name = data[i].district;
                            sczb = Number(data[i].district_cnt.audited_records_num) / Number(data[i].district_cnt.total_records_num) * 100;
                            if (data[i].district_cnt.audited_records_num == 'undefined' || data[i].district_cnt.audited_records_num == 0) {
                                sczb = 0;
                            }
                        } else {
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].detail.school_cnt.audited_records_num) / Number(data[i].detail.school_cnt.total_records_num) * 100;
                            if (!data[i].detail.school_cnt.audited_records_num || data[i].detail.school_cnt.audited_records_num == 'undefined' ||
                                data[i].detail.school_cnt.audited_records_num == 0) {
                                sczb = 0;
                            }
                        }
                        if (yAxis_arr.indexOf(y_name) == -1) {
                            yAxis_arr.push(y_name);
                        }
                        if (!obj_legend[name]) {
                            obj_legend[name] = [];
                        }
                        if (!sczb)
                            sczb = 0;
                        obj_legend[name].push(sczb.toFixed(2))
                    }
                    var series_arr = [];
                    for (var k = 0; k < legend_arr.length; k++) {
                        var obj_series = {
                            name: legend_arr[k],
                            type: 'bar',
                            data: obj_legend[legend_arr[k]],
                            barWidth: 20,
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'insideLeft',
                                        formatter: function (params) {
                                            return params.data + '%';
                                        }
                                    }
                                }
                            }
                        }
                        series_arr.push(obj_series);
                    }
                    ES.bar_for_progress(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                },
                search_by_school_id: function () {
                    this.school_p.fk_school_id = $("#func_list").val();
                    this.get_school_tbale_list();
                }
            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
                    Screen = new deal_school_data()
                    vm.init();
                })
            });
            vm.init_data();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
