define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'achieve_introduct_progress/achieve_introduct_progress', 'html!'),
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
            var Screen = '';
            var vm = avalon.define({
                $id: "achieve_introduct_progress",
                //@value(el, "findtype4.count", 0))
                value: value,
                //@count(@school_process_list, el.schoolname)
                count: count,
                is_init_sel: true,
                orderList: [],
                area_list: [],
                semester_list: [],
                grade_list: [],
                school_list: [],

                semester: "",//学期
                city: "",//市
                p_city: {
                    district: "",//区县
                    fk_school_id: "",//学下id
                    fk_grade_id: "",//年级
                    fk_class_id: "", //班级id
                    level: 2,
                },
                p_district: {
                    district: "",//区县
                    fk_school_id: "",//学下id
                    fk_grade_id: "",//年级
                    fk_class_id: "", //班级id
                    level: 3,
                },
                p_school: {
                    district: "",//区县
                    fk_school_id: "",//学下id
                    fk_grade_id: "",//年级
                    fk_class_id: "", //班级id
                    level: 4,
                    school_name: ''//学校名称
                },
                //用户等级
                user_level: '',
                default_area: '',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    if (this.user_level < 3) {
                        this.get_city_tbale_list();
                    }
                    this.get_area_tbale_list();
                    setTimeout(function () {
                        vm.get_school_tbale_list();
                    },0)
                },
                sel_change_grade: function (el) {
                    this.p_city.fk_grade_id = el.value
                    this.p_district.fk_grade_id = el.value
                    this.p_school.fk_grade_id = el.value;
                    this.ring_diagram('tubiao_1', this.filter_city(this.city_process_list));
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')

                },
                sel_change_area: function (el) {
                    if (el.name == '全部') {
                        this.p_district.district = '';
                    } else {
                        this.p_district.district = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                },
                sel_change_area_2: function (el) {
                    this.p_school.school_name = '';
                    this.default_area = el.name;
                    this.school_data_deal(el.name);
                },

                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],

                init: function () {
                    $("#func_list").select2();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        var semester = this.semester_list[0].value;
                        this.semester = semester;
                    }
                    if (this.user_level < 3) {
                        this.get_city_tbale_list();
                    }
                    this.get_area_tbale_list();
                    setTimeout(function () {
                        vm.get_school_tbale_list();
                    },0)
                },
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                    var city = D("user.user.city");
                    this.city = city;
                    this.default_area = this.area_list[0].name
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
                filter_city: make_filter(function (line) {
                    if (
                        vm.p_city.fk_grade_id == line.grade_id || vm.p_city.fk_grade_id == ""

                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        ( vm.p_district.fk_grade_id == line.grade_id || vm.p_district.fk_grade_id == "")
                        &&
                        (line.district == vm.p_district.district || vm.p_district.district == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (vm.p_school.fk_grade_id == line.detail.grade_id || vm.p_school.fk_grade_id == "")
                        &&
                        (line.district == vm.p_school.district || vm.p_school.district == "")
                        &&
                        (line.school_id == vm.p_school.fk_school_id || vm.p_school.fk_school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.p_school.school_name) >= 0 || vm.p_school.school_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if (
                        (vm.p_school.fk_grade_id == line.grade_id || vm.p_school.fk_grade_id == "")
                        &&
                        (line.district == vm.p_school.district || vm.p_school.district == "")
                        &&
                        (line.school_id == vm.p_school.fk_school_id || vm.p_school.fk_school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.p_school.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,
                //获取市进度数据
                get_city_tbale_list: function () {
                    var self = this
                    cloud.cj_process_eva({
                        semester: this.semester,
                        city: this.city,
                        level: 2,
                        subject_id:'1000',
                    }, function (data) {

                        data = ES.completion_rate(data);
                        self.city_process_list = data
                        self.row_length = self.city_process_list.length
                        setTimeout(function () {
                            self.ring_diagram('tubiao_1', vm.filter_city(data));
                        },10)

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
                        var wcl = Number(series_arr[i].wcl) ;
                        var completion_rate = wcl;
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
                    myChart.resize()
                },
                //获取区县进度数据
                get_area_tbale_list: function () {
                    var self = this
                    cloud.cj_process_eva({
                        semester: this.semester,
                        city: this.city,
                        level: 3,
                        subject_id:'1000',
                    }, function (data) {
                        data = ES.completion_rate(data);
                        self.area_process_list = data;
                        self.deal_data(vm.filter_area(data), 'district', 'tubiao_2')
                    })
                },
                old_school_process_list: [],
                //获取学校进度数据
                get_school_tbale_list: function () {
                    cloud.cj_process_eva({semester: this.semester, city: this.city, level: 4,subject_id:'1000',}, function (data) {
                        var arr = [];
                        for(var i=0;i<data.length;i++){
                            if(arr.indexOf(data[i].grade_name)==-1){
                                arr.push(data[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(data, ['district', 'school_id', 'schoolname'], 'grade_name', arr, 0);
                        Screen.all_data = new_cnt;
                        vm.school_data_deal(vm.default_area);
                    })
                },
                school_data_deal:function(area){
                    Screen.screen(area, function (new_cnt) {
                        vm.old_school_table_list = new_cnt;
                        vm.school_process_list = new_cnt;
                        setTimeout(function () {
                            vm.deal_data(vm.filter_school(new_cnt), 'school', 'tubiao_3')
                        }, 100)
                    })
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
                        if(type=='school'){
                            name = data[i].status;
                        }

                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.unshift(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        if (type == 'district') {
                            y_name = data[i].district;
                            sczb = Number(data[i].wcl) ;
                        } else {
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].detail.wcl) ;
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
                    setTimeout(function () {
                        ES.bar_for_progress(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                    },10)

                },
                //通过学校id搜索
                search_by_school_id: function () {
                    this.p_school.fk_school_id = $("#func_list").val();
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