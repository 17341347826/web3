define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'active_upload_school/active_upload_school', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module,formatUtil) {
        //自定义过滤器
        avalon.filters.absNum = function (str) {
            return Math.abs(str);
        };

        var avalon_define = function () {
            var ori_grade_list = [];
            var vm = avalon.define({
                $id: "act_upload_progress",
                //@value(el, "findtype4.count", 0))
                value: value,
                //@count(@school_process_list, el.schoolname)
                count: count,
                is_init_sel: true,
                orderList: [],
                area_list: [],
                semester_list: [],
                grade_list: [],
                semester: "",//学期
                grade_arr: [],//年级
                //市参数
                city_p: {
                    grade_ids: []//年级
                },
                //区参数
                area_p: {
                    grade_ids: [],//年级
                    district_name: ""//区县
                },
                //学校参数
                school_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: ''//学校名称
                },
                //年级班级列表
                grade_class_list: [],
                //班级列表
                class_list: [],
                //学校id
                school_id: '',
                all_grades: [],
                all_classes: [],
                filter_undefined:filter_undefined,
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value
                    this.grade_list = cloud.grade_all_list();
                    ori_grade_list = cloud.grade_list();
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    })
                    this.grade_all = abstract(ori_grade_list, "grade_id");
                    this.grade_class_list = ori_grade_list;
                    this.class_list = [];
                    this.get_school_tbale_list()
                },
                sel_change_grade: function (el, index) {
                    //根据年级改变班级跟着改变
                    var class_list = ori_grade_list[index].class_list;
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]})

                    //改变班级列表
                    var class_arr = base_filter(this.all_classes.$model, "fk_nj_id", el.value);

                    this.deal_data(this.order_by_grade, class_arr);
                },
                //年级列表中年级下拉列表改变
                sel_grade: function (el, index) {
                    var class_arr = [];
                    if(el.value==''){
                        class_arr = this.all_classes.$model;
                    }else {
                        class_arr = base_filter(this.all_classes.$model, "fk_nj_id", el.value);
                    }

                    this.order_by_class = class_arr;
                    this.deal_data(this.order_by_grade, this.order_by_class)


                    if(el.value==''){
                        this.class_list = [];
                        //改变班级列表
                        var classes_arr = this.all_classes.$model;
                        this.deal_data(this.order_by_grade, classes_arr);
                        return;
                    }
                    var class_list = [];
                    for(var i=0;i<ori_grade_list.length;i++){
                        if(ori_grade_list[i].grade_id==el.value){
                            class_list = ori_grade_list[i].class_list;
                        }
                    }
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]})
                    //改变班级列表
                    var classes_arr = base_filter(this.all_classes.$model, "fk_nj_id", el.value);
                    this.deal_data(this.order_by_grade, classes_arr);

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
                    this.deal_data(this.order_by_grade, this.order_by_class);

                },
                //年级列表
                order_by_grade: [],
                //班级列表
                order_by_class: [],
                //
                grade_all: [],
                init: function () {
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                    }
                    if (this.grade_list.length > 0) {
                        var arr = new Array()
                        for (idx in this.grade_list) {
                            arr.push(this.grade_list[idx].value)
                        }
                        this.grade_arr = arr
                    }
                    this.school_id = cloud.user_school_id();
                    this.get_school_tbale_list();
                },
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    ori_grade_list = cloud.grade_list();
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    })
                    this.grade_all = abstract(ori_grade_list, "grade_id");
                    this.grade_class_list = ori_grade_list;
                },
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_id == vm.school_p.fk_school_id || vm.school_p.fk_school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,

                //获取学校进度数据
                get_school_tbale_list: function () {
                    var self = this
                    cloud.class_hd_process({
                        semester: this.semester,
                        grade_ids: this.grade_all.$model,
                        level: 4,
                        fk_school_id: this.school_id
                    }, function (grades, classes) {

                        self.all_grades = grades;
                        self.all_classes = classes;
                        sort_by(self.all_classes, ["+njmc","+bjmc"]);
                        self.deal_data(grades, classes)
                    })
                },
                //处理数据
                deal_data: function (grades, classes) {
                    this.order_by_grade = grades;
                    this.order_by_class = classes;
                    if (grades.length > 0) {
                        this.ring_diagram('tubiao_1', echarts, grades, 'zb', 'school');
                    }
                    if (classes.length > 0) {
                        this.draw_bar('tubiao_2', classes);
                    }
                },
                //画柱状图
                draw_bar: function (div_id, table_data) {
                    var table_list_length = table_data.length;
                    var yAxis_arr = [];
                    var series_arr = [];
                    for (var i = table_list_length-1; i > -1; i--) {
                        var str = table_data[i].njmc + table_data[i].bjmc
                        yAxis_arr.push(str);
                        var new_wcl = Number(table_data[i].school_class_cnt.sczb) * 100;
                        series_arr.push(new_wcl);
                    }
                    ES.draw_bar(div_id,echarts,series_arr,yAxis_arr)
                },
                ring_diagram: function (div_id, echarts, series_arr, type, level) {
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

                    if (!series_arr) {
                        series_arr = [
                            {
                                name: 'Line 1',
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
                                            show: false
                                        },
                                        itemStyle: placeHolderStyle
                                    }
                                ]
                            },
                            {
                                name: 'Line 2',
                                type: 'pie',
                                clockWise: false,
                                radius: [40, 48],
                                center: ['50%', '50%'],
                                itemStyle: dataStyle,
                                hoverAnimation: false,
                                startAngle: 90,
                                data: [{
                                    value: 56.7,
                                    name: '初2018',
                                    itemStyle: {
                                        normal: {
                                            color: color[1]
                                        }
                                    }
                                },
                                    {
                                        value: 43.3,
                                        name: '',
                                        tooltip: {
                                            show: false
                                        },
                                        itemStyle: placeHolderStyle
                                    },
                                ]
                            },
                            {
                                name: 'Line 3',
                                type: 'pie',
                                clockWise: false,
                                radius: [50, 58],
                                center: ['50%', '50%'],
                                itemStyle: dataStyle,
                                hoverAnimation: false,
                                startAngle: 90,
                                data: [{
                                    value: 30,
                                    name: '初2019',
                                    itemStyle: {
                                        normal: {
                                            color: color[2]
                                        }
                                    }
                                },
                                    {
                                        value: 70,
                                        name: '',
                                        tooltip: {
                                            show: false
                                        },
                                        itemStyle: placeHolderStyle
                                    },
                                ]
                            }
                        ]
                    }

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

                        var completion_rate = Number(series_arr[i].school_cnt.sczb)*100;

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
                    myChart.resize();
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