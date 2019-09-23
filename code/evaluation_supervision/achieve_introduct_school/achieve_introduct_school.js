define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'achieve_introduct_school/achieve_introduct_school', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {

        avalon.filters.bai_fen_b = function (el) {
            return Number(el) * 100 + '%'
        };
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "achieve_introduct_progress",
                value: value,
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
                class_list: [],
                all_grades: [],
                all_classes: [],
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value
                    var grade_list = cloud.grade_list();
                    this.grade_list = cloud.grade_all_list();
                    this.grade_list.unshift({
                        name: '全部',
                        value: ''
                    })
                    this.grade_class_list = grade_list;
                    this.class_list = [];
                    this.get_school_tbale_list();
                },
                //年级列表中年级下拉列表改变
                sel_grade: function (el, index) {
                    var grade_length = this.all_grades.length;
                    var classes_length = this.all_classes.length;
                    var class_arr = [];
                    if (el.value == '') {
                        class_arr = this.all_classes;
                    } else {
                        for (var i = 0; i < classes_length; i++) {
                            if (this.all_classes[i].fk_nj_id == el.value) {
                                class_arr.push(this.all_classes[i]);
                            }
                        }
                    }

                    this.order_by_class = class_arr;
                    this.deal_data(this.order_by_class, 'class');

                    if (el.value == '') {
                        this.class_list = [];
                        return;
                    }
                    var class_list = [];
                    for(var i=0;i<this.grade_class_list.length;i++){
                        if(this.grade_class_list[i].grade_id==el.value){
                            class_list = this.grade_class_list[i].class_list;
                        }
                    }
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]})

                },
                //班级下拉列表改变
                sel_class: function (el) {
                    var order_class_length = this.all_classes.length;
                    this.order_by_class = [];
                    for (var i = 0; i < order_class_length; i++) {
                        if (this.all_classes[i].fk_bj_id == el.value) {
                            this.order_by_class.push(this.all_classes[i]);
                        }
                    }
                    this.deal_data(this.order_by_grade, 'grade');
                    this.deal_data(this.order_by_class, 'class');

                },
                //年级列表
                order_by_grade: [],
                //班级列表
                order_by_class: [],
                school_id: '',
                init: function () {
                    $("#func_list").select2();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        var semester = this.semester_list[0].value;
                        this.semester = semester;
                    }
                    this.school_id = cloud.user_school_id();
                    this.get_school_tbale_list();
                },
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    var grade_list = cloud.grade_list();
                    this.grade_list = cloud.grade_all_list();
                    this.grade_list.unshift({
                        name: '全部',
                        value: ''
                    })
                    this.grade_class_list = grade_list;
                },

                filter_school: make_filter(function (line) {
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

                //获取学校进度数据
                get_school_tbale_list: function () {
                    var self = this;
                    cloud.cj_process_eva({
                            semester: this.semester,
                            city: this.city,
                            level: 4,
                            fk_school_id: this.school_id.toString(),
                            subject_id:'1000',
                        },
                        function (grades) {
                            self.all_grades = grades;
                            self.deal_data(grades, 'grade')
                        }
                    )
                    cloud.class_cj_process_eva({
                            semester: this.semester,
                            city: this.city,
                            level: 5,
                            fk_school_id: this.school_id.toString(),
                            subject_id:'1000',
                        },
                        function (classes) {
                            self.all_classes = classes;
                            sort_by(self.all_classes, ["+njmc", "+bjmc"]);
                            self.deal_data(classes, 'class')
                        }
                    )

                },
                deal_data: function (data, type) {
                    if (type == 'grade') {
                        this.order_by_grade = data;
                        this.ring_diagram('tubiao_1', data);
                        return;
                    }
                    this.order_by_class = data;

                    this.draw_bar('tubiao_2', data);
                },
                //画柱状图
                draw_bar: function (div_id, table_data) {
                    var table_list_length = table_data.length;
                    var yAxis_arr = [];
                    var series_arr = [];
                    for (var i = table_list_length - 1; i > -1; i--) {
                        var str = table_data[i].njmc + table_data[i].bjmc
                        yAxis_arr.push(str);
                        var new_wcl = Number(table_data[i].wcl);
                        series_arr.push(new_wcl);
                    }
                    ES.draw_bar(div_id, echarts, series_arr, yAxis_arr);
                },
                //通过学校id搜索
                search_by_school_id: function () {
                    this.p_school.fk_school_id = $("#func_list").val();
                    this.get_school_tbale_list();
                },
                //画圆形图
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
                        var completion_rate = Number(series_arr[i].wcl);
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