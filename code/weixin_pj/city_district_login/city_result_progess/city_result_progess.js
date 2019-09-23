/**
 * Created by Administrator on 2018/9/11.
 */
define(['jquery',
        C.CLF("avalon.js"),
        C.Co("weixin_pj", "city_district_login/city_result_progess/city_result_progess", "css!"),
        C.Co("weixin_pj", "city_district_login/city_result_progess/city_result_progess", "html!"),
        C.CMF("data_center.js"),
        C.CMF("viewer/viewer.js"),'echarts', "select2", C.CMF("formatUtil.js")
    ],
    function ($, avalon, css, html, data_center, viewer,echarts,select2,formatUtil) {
        //过滤器
        avalon.filters.absNum = function (str) {
            return Math.abs(str);
        };
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "city_result_progess",
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
                city: "",//市
                //市参数
                city_p: {
                    grade_id: "",//年级
                },
                //区参数
                area_p: {
                    district: "",//区
                    grade_id: "",//年级
                },
                //学校参数
                school_p: {
                    district: "",//区
                    grade_id: "",//年级
                    school_id: "",//校
                    school_name: '',
                },
                user_level: '',
                filter_undefined:filter_undefined,
                // 学年学期切换
                sel_change_semester: function () {
                    // this.semester = el.value
                    this.get_area_tbale_list()
                    this.get_city_tbale_list()
                    this.get_school_tbale_list()
                },
                //年级id
                choose_grade:'',
                //年级切换
                sel_change_grade: function () {
                    var grade_id = this.choose_grade;
                    this.city_p.grade_id = grade_id
                    this.area_p.grade_id = grade_id
                    this.school_p.grade_id = grade_id;


                    // this.ring_diagram('tubiao_1',this.filter_city(this.city_process_list));
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')

                },
                //区县下面区县筛选
                area_area:'',
                sel_change_area: function () {
                    var name = this.area_area;
                    if (name == '全部') {
                        this.area_p.district = '';
                    } else {
                        this.area_p.district = name;
                    }
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                },
                search: function () {

                    // this.school_process_list = this.filter_old_school(this.old_school_table_list)
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                //学校区县筛选
                school_area:'',
                sel_change_area_2: function () {
                    var name = this.school_area;
                    this.school_p.school_name = '';
                    if (name == '全部') {
                        this.school_p.district = '';
                    } else {
                        this.school_p.district = name;
                    }
                    this.search();
                },
                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
                old_school_table_list: [],
                //初始数据
                init: function () {
                    $("#func_list").select2();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                    }
                    var self = this;
                    if (this.user_level < 3) {
                        this.get_city_tbale_list();
                        this.get_area_tbale_list();
                        this.get_school_tbale_list();
                        return
                    }

                    if (this.user_level == 3) {
                        var district = cloud.user_district();
                        cloud.area_jg_process({
                            semester: this.semester,
                            city: this.city,
                            district: district
                        }, function (data) {
                            var student_area = cloud.student_count_in_semester({
                                dj: 3,
                                fk_xq_id: self.semester.split('|')[0]
                            });
                            student_area = merge_table(student_area, ["district", "grade_id"], data, ["district", "grade_id"], "district_cnt", 0);
                            sort_by(student_area, ["+city", "+district", "+school_id", "+grade_name"]);
                            self.area_process_list = student_area
                            console.dir(student_area)
                            self.deal_data(student_area, 'district', 'tubiao_2');
                        })
                        cloud.school_jg_process({
                            semester: this.semester,
                            city: this.city,
                            district: district
                        }, function (data) {
                            var student = cloud.student_count_in_semester({
                                dj: 4,
                                fk_xq_id: self.semester.split('|')[0]
                            });
                            student = merge_table(student, ["school_id", "grade_id"], data, ["school_id", "grade_id"], "school_cnt", 0);
                            sort_by(student, ["+city", "+district", "+school_id", "+grade_name"]);
                            self.school_process_list = student;
                            self.old_school_table_list = student;
                            console.dir(student)
                            self.deal_data(student, 'school', 'tubiao_3')
                        })
                        return
                    }
                    var school_id = cloud.user_school_id();
                    cloud.school_jg_process({
                        semester: this.semester,
                        city: this.city,
                        district: district,
                        school_id: school_id
                    }, function (data) {
                        var student = cloud.student_count_in_semester({
                            dj: 4,
                            fk_xq_id: self.semester.split('|')[0]
                        });
                        student = merge_table(student, ["school_id", "grade_id"], data, ["school_id", "grade_id"], "school_cnt", 0);
                        sort_by(student, ["+city", "+district", "+school_id", "+grade_name"]);
                        self.school_process_list = student;
                        self.old_school_table_list = student;
                        console.dir(student)
                        self.deal_data(student, 'school', 'tubiao_3')
                    })

                },
                //初始前期数据
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                    this.city = D("user.user.city");
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
                        vm.city_p.grade_id == line.grade_id || vm.city_p.grade_id == ""
                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_id == line.grade_id || vm.area_p.grade_id == "")
                        &&
                        (line.district == vm.area_p.district || vm.area_p.district == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_id == line.grade_id || vm.school_p.grade_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")
                        &&
                        (line.district == vm.school_p.district || vm.school_p.district == "")
                        &&
                        (line.school_id == vm.school_p.school_id || vm.school_p.school_id == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_id == line.grade_id || vm.school_p.grade_id == "")
                        &&
                        (line.district == vm.school_p.district || vm.school_p.district == "")
                        &&
                        (line.school_id == vm.school_p.school_id || vm.school_p.school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,
                //获取市进度数据
                get_city_tbale_list: function () {
                    var self = this
                    cloud.city_jg_process({semester: this.semester, city: this.city}, function (data) {
                        var student_city = cloud.student_count_in_semester({
                            dj: 2,
                            fk_xq_id: self.semester.split('|')[0]
                        });
                        student_city = merge_table(student_city, ["grade_id"], data, ["grade_id"], "city_cnt", 0);
                        sort_by(student_city, ["+city", "+district", "+school_id", "+grade_name"]);
                        self.city_process_list = student_city;
                        console.log(self.city_process_list);
                        ES.completion_rate(self.city_process_list);
                        self.row_length = self.city_process_list.length
                        // self.ring_diagram('tubiao_1',self.city_process_list);
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

                        var completion_rate = series_arr[i].city_cnt.wcl;
                        if(!completion_rate)
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
                //获取区县进度数据
                get_area_tbale_list: function () {
                    var self = this;
                    cloud.area_jg_process({semester: this.semester, city: this.city}, function (data) {
                        var student_area = cloud.student_count_in_semester({
                            dj: 3,
                            fk_xq_id: self.semester.split('|')[0]
                        });
                        student_area = merge_table(student_area, ["district", "grade_id"], data, ["district", "grade_id"], "district_cnt", 0);
                        sort_by(student_area, ["+city", "+district", "+school_id", "+grade_name"]);
                        self.area_process_list = student_area
                        // console.dir(student_area)
                        self.deal_data(student_area, 'district', 'tubiao_2');
                    })
                },

                //获取学校进度数据
                get_school_tbale_list: function () {
                    var self = this;
                    cloud.school_jg_process({semester: this.semester, city: this.city}, function (data) {
                        var student = cloud.student_count_in_semester({
                            dj: 4,
                            fk_xq_id: self.semester.split('|')[0]
                        });
                        student = merge_table(student, ["school_id", "grade_id"], data, ["school_id", "grade_id"], "school_cnt", 0);
                        sort_by(student, ["+city", "+district", "+school_id", "+grade_name"]);
                        self.school_process_list = student;
                        self.old_school_table_list = student;
                        // console.dir(student)
                        self.deal_data(student, 'school', 'tubiao_3')
                    })
                },
                search_by_school_id: function () {
                    this.school_p.fk_school_id = $("#func_list").val();
                    this.get_school_tbale_list();
                },
                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length - 1; i > -1; i--) {
                        var name = data[i].grade_name;
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
                            sczb = Number(data[i].school_cnt.wcl);
                        }
                        if(!sczb)
                            sczb = 0;
                        if (yAxis_arr.indexOf(y_name) == -1) {
                            yAxis_arr.push(y_name);
                        }
                        if (!obj_legend[name]) {
                            obj_legend[name] = [];
                        }
                        obj_legend[name].push(sczb.toFixed(2))
                    }
                    var series_arr = [];
                    for(var k=0;k<legend_arr.length;k++){
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
                    // ES.bar_for_progress(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                },

            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_supervision/e_s_public.js'], function () {
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
