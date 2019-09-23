define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'plan_realization_progress/plan_realization_progress', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module, formatUtil) {

        var avalon_define = function () {
            var data_api = api.api + "GrowthRecordBag/targetplan_input_progress";
            var Screen;
            var vm = avalon.define({
                $id: "plan_realization_progress",
                //@value(el, "findtype4.count", 0))
                value: value,
                //@count(@school_process_list, el.schoolname)
                count: count,
                is_init_sel: true,
                area_list: [],
                semester_list: [],
                grade_list: [],

                semester: "",//学期
                //市目标计划进度参数
                city_p: {
                    grade: "",//年级
                },
                //区目标计划进度参数
                area_p: {
                    grade: "",//年级
                    area: "",//区县
                },
                //学校目标计划进度参数
                school_p: {
                    grade: "",//年级
                    grade_name:'',
                    area: "",//区县
                    school: "",//学校
                    school_name: ''//学校名字
                },
                school_list: [],
                user_level: '',
                //当前登录的用户
                user: {},
                default_area:'',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.get_data();
                },
                sel_change_grade: function (el) {
                    this.city_p.grade = el.value
                    this.area_p.grade = el.value
                    this.school_p.grade = el.value;
                    if(el.value==''){
                        this.school_p.grade_name = '';
                    }else {
                        this.school_p.grade_name = el.name;
                    }
                    this.school_p.grade_name = el.name;
                    this.ring_diagram('tubiao_1',this.filter_city(this.city_process_list));
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                sel_change_area: function (el) {
                    if (el.name == '全部') {
                        this.area_p.area = '';
                    } else {
                        this.area_p.area = el.name;
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
                init: function () {
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                    }
                    this.get_data();
                },
                filter_undefined:filter_undefined,
                get_data: function () {
                    ajax_post(data_api, {
                        fk_semester_id: Number(this.semester.split('|')[0])
                    }, this)
                },
                init_data: function () {
                    this.user = cloud.user_user();
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                    this.default_area = this.area_list[0].name;
                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    if (this.grade_list.length == 0)
                        this.grade_list = [];
                    if (this.area_list.length == 0)
                        this.area_list = [];

                    this.grade_list.unshift(obj);
                    this.area_list.unshift(obj);
                },
                //页面数据过滤
                filter_city: make_filter(function (line) {
                    if (
                        vm.city_p.grade == line.grade_id || vm.city_p.grade == ""
                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade == line.grade_id || vm.area_p.grade == "")
                        &&
                        (line.district == vm.area_p.area || vm.area_p.area == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (line.status == vm.school_p.grade_name || vm.school_p.grade == "") &&
                        (line.district == vm.school_p.area || vm.school_p.area == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade == line.grade_id || vm.school_p.grade == "")
                        &&
                        (line.district == vm.school_p.area || vm.school_p.area == "")
                        &&
                        (line.school_id == vm.school_p.school || vm.school_p.school == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,
                //获取市进度数据
                get_city_tbale_list: function (data) {

                    this.city_process_list = data
                    this.row_length = this.city_process_list.length
                    setTimeout(function () {
                        vm.ring_diagram('tubiao_1', vm.filter_city(vm.city_process_list));
                    },0)

                },
                //获取区县进度数据
                get_area_tbale_list: function (data) {

                    this.area_process_list = data;
                    this.deal_data(vm.filter_area(data), 'district', 'tubiao_2');
                },
                get_school_tbale_list: function (data) {

                    this.school_process_list = data;
                    this.old_school_proces_list = data;
                    this.deal_data(vm.filter_school(data), 'school', 'tubiao_3')
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

                        var completion_rate = series_arr[i].city_cnt.wcl;
                        if(!completion_rate){
                            completion_rate = 0;
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
                search: function () {
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length - 1; i > -1; i--) {
                        var name = data[i].grade_name;
                        if(type=='school')
                            name = data[i].status;
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.unshift(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        if (type == 'district') {
                            y_name = data[i].district;
                            sczb = Number(data[i].district_cnt.wcl);
                        } else {
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].detail.school_cnt.wcl);
                        }
                        if(!sczb){
                            sczb = 0;
                        }
                        if (yAxis_arr.indexOf(y_name) == -1) {
                            yAxis_arr.push(y_name);
                        }
                        if (!obj_legend[name]) {
                            obj_legend[name] = [];
                        }
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
                    setTimeout(function () {
                        ES.bar_for_progress(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                    },10)

                },
                old_school_proces_list: [],
                school_data_deal: function (area) {
                    Screen.screen(area, function (new_cnt) {
                        vm.old_school_proces_list = new_cnt;
                        vm.school_process_list = new_cnt;
                        setTimeout(function () {
                            vm.deal_data(vm.filter_school(new_cnt), 'school', 'tubiao_3')
                        }, 100)
                    })
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case data_api:
                                if (!data.data)
                                    return;
                                if (data.data.city_cnt) {
                                    var student_city = cloud.student_count_in_semester({
                                        dj: 2,
                                        fk_xq_id: this.semester.split('|')[0]
                                    });
                                    student_city = merge_table(student_city, ["grade_id"], data.data.city_cnt, ["fk_grade_id"], "city_cnt", 0);
                                    sort_by(student_city, ["+city", "+district", "+school_id", "+grade_name"]);
                                    this.get_city_tbale_list(student_city);
                                }
                                if (data.data.district_cnt) {
                                    var student_area = cloud.student_count_in_semester({
                                        dj: 3,
                                        fk_xq_id: this.semester.split('|')[0]
                                    });
                                    student_area = merge_table(student_area, ["district", "grade_id"], data.data.district_cnt, ["district_name", "fk_grade_id"], "district_cnt", 0);
                                    sort_by(student_area, ["+city", "+district", "+school_id", "+grade_name"]);
                                    this.get_area_tbale_list(student_area);
                                }
                                if (data.data.school_cnt) {
                                    var student = cloud.student_count_in_semester({
                                        dj: 4,
                                        fk_xq_id: this.semester.split('|')[0]
                                    });
                                    student = merge_table(student, ["school_id", "grade_id"], data.data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt", 0);
                                    var arr = [];
                                    for(var i=0;i<student.length;i++){
                                        if(arr.indexOf(student[i].grade_name)==-1){
                                            arr.push(student[i].grade_name)
                                        }
                                    }
                                    var new_cnt = complate_data(student, ['district', 'school_id', 'schoolname'], 'grade_name', arr, 0);
                                    Screen.all_data = new_cnt;
                                    vm.school_data_deal(vm.default_area);
                                }
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
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