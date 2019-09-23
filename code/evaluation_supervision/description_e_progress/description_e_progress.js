define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'description_e_progress/description_e_progress', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module, formatUtil) {

        var avalon_define = function () {
            var data_api = api.api + "GrowthRecordBag/desc_eval_input_progress";
            var Screen = '';
            var vm = avalon.define({
                $id: "description_e_progress",
                area_list: [],
                semester_list: [],
                grade_list: [],
                grade_id: "",
                semester_id: "",
                district_name: "",
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                school_id: "",
                //当前选择的年级
                current_grade_name: '',
                //市级表格数据
                city_table_list: [],
                //显示的行数
                row_length: 0,
                //当前区县表格数据
                area_table_list: [],
                //当前学校表格数据
                old_school_table_list: [],
                school_table_list: [],
                //校级的区县
                school_level_area: '',
                //当前的学校id
                current_school_id: '',

                current_grade: "",
                current_area: "",
                // 校级查看
                current_school: "",
                current_school_dist: "",
                //用户等级
                user_level: '',
                default_area: '',
                filter_city: make_filter(function (line) {
                    if (line.grade_name == vm.current_grade || vm.current_grade == "")
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (line.grade_name == vm.current_grade || vm.current_grade == "") &&
                        (line.district == vm.current_area || vm.current_area == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (line.status == vm.current_grade || vm.current_grade == "") &&
                        (line.district == vm.current_school_dist || vm.current_school_dist == "")
                        &&
                        (line.schoolname.indexOf(vm.current_school) >= 0 || vm.current_school == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if (
                        (line.grade_name == vm.current_grade || vm.current_grade == "") &&
                        (line.district == vm.current_school_dist || vm.current_school_dist == "") &&
                        (line.schoolname.indexOf(vm.current_school) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter: function (el, data) {
                    if (data == "")
                        return true;
                    if (el.grade == data) return true;
                    return false;
                },
                filter_undefined: filter_undefined,
                init: function () {

                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.current_semester = this.semester_list[0];
                    }
                    this.get_data();
                },
                get_data: function () {
                    ajax_post(data_api, {fk_semester_id: Number(this.current_semester.value.split('|')[0])}, this)
                },
                user: {},
                init_data: function () {
                    this.user = cloud.user_user();
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

                count: count,
                grade_change: function (el) {
                    if (el.name == '全部') {
                        this.current_grade = '';
                    } else {
                        this.current_grade = el.name;
                    }

                    var city_list = this.filter_city(this.city_table_list);
                    this.ring_diagram('tubiao_1', city_list);

                    var bar_data = this.filter_area(this.area_table_list);
                    this.deal_data(bar_data, 'district', 'tubiao_2');

                    this.deal_data(this.filter_school(this.school_table_list), 'school', 'tubiao_3')
                },
                area_check: function (el) {
                    if (el.name == '全部') {
                        this.current_area = '';
                    } else {
                        this.current_area = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_table_list), 'district', 'tubiao_2');
                },
                school_area_check: function (el) {
                    this.current_school = '';
                    this.default_area = el.name;
                    this.school_data_deal(el.name)

                },
                semester_change: function (el) {
                    this.current_semester = el;
                    this.get_data();
                },
                search: function () {
                    this.deal_data(this.filter_school(this.school_table_list), 'school', 'tubiao_3')
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
                    setTimeout(function () {
                        ES.bar_for_progress(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                    },0)

                },
                get_city_tbale_list: function (data) {
                    this.city_table_list = data;
                    this.row_length = this.city_table_list.length;
                    setTimeout(function () {
                        vm.ring_diagram('tubiao_1', vm.filter_city(data));
                    },0)
                },
                get_area_tbale_list: function (data) {
                    this.area_table_list = data;
                    this.deal_data(vm.filter_area(data), 'district', 'tubiao_2');
                },
                get_school_tbale_list: function (data) {
                    this.old_school_table_list = data;
                    this.school_table_list = data;
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
                        if (!completion_rate)
                            completion_rate = 0;
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
                school_data_deal: function (area) {
                    Screen.screen(area, function (new_cnt) {
                        vm.old_school_table_list = new_cnt;
                        vm.school_table_list = new_cnt;
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
                                        fk_xq_id: this.current_semester.value.split('|')[0]
                                    });
                                    student_city = merge_table(student_city, ["grade_id"], data.data.city_cnt, ["fk_grade_id"], "city_cnt", 0);
                                    sort_by(student_city, ["+city", "+district", "+school_id", "+grade_name"]);
                                    this.get_city_tbale_list(student_city);
                                }
                                if (data.data.district_cnt) {
                                    var student_area = cloud.student_count_in_semester({
                                        dj: 3,
                                        fk_xq_id: this.current_semester.value.split('|')[0]
                                    });
                                    student_area = merge_table(student_area, ["district", "grade_id"], data.data.district_cnt, ["district_name", "fk_grade_id"], "district_cnt", 0);
                                    sort_by(student_area, ["+city", "+district", "+school_id", "+grade_name"]);
                                    this.get_area_tbale_list(student_area);
                                }
                                if (data.data.school_cnt) {
                                    var student = cloud.student_count_in_semester({
                                        dj: 4,
                                        fk_xq_id: this.current_semester.value.split('|')[0]
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