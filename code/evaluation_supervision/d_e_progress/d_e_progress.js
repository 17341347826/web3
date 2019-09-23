define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module, ava) {
        avalon.filters.my_fixed = function (value) {
            return value.toFixed(2);
        };
        var avalon_define = function () {
            var loading_index = 0;
            var class_list = [];
            var class_table_list = [];
            var vm = avalon.define({
                $id: "d_e_progress",
                //区县下拉列表
                area_list: [],
                //学年学期列表
                semester_list: [],
                //学校列表
                school_list: [],
                //年级列表
                grade_list: [],
                //用户等级
                user_level: '',
                //用户类型
                user_type: '',
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,

                //学年学期下拉列表选择的数据
                current_semester: '',
                //市级表格数据
                city_table_list: [],
                //当前选择的年级
                current_grade_name: '',
                //当前年级id
                current_grade_id: '',
                //显示的行数
                row_length: 0,
                //当前区县
                current_area: '',
                //当前区县表格数据
                area_table_list: [],
                //第一次获取的区县数据
                first_area_data: [],
                //当前的学校id
                current_school_id: '',
                //当前学校名称
                school_name: '',
                //当前学校表格数据
                school_table_list: [],
                //校级的区县
                school_level_area: '',
                //第一次获取的学校列表数据
                first_school_data: [],
                //班级列表数据
                class_table_list: [],
                //班级下拉列表
                class_list: [],

                init: function () {
                    loading_index = layer.load(1, {shade:[0.3,'#121212']});
                    $("#func_list").select2();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.current_semester = this.semester_list[0];
                    }
                    if (this.user_level < 3)
                        this.get_city_table_list();

                    if (this.user_level < 4)
                        this.get_area_table_list();

                    if (this.user_level < 5)
                        this.get_school_table_list();

                    if (this.user_level > 3) {
                        this.get_class_list();
                        if (this.current_grade_id != "") {
                            class_list = cloud.find_class_simple({fk_grade_id: this.current_grade_id});
                            this.class_list.pushArray(any_2_select(class_list, {name: "class_name", value: ["id"]}));
                        }

                    }
                },
                init_data: function () {
                    this.user_type = cloud.user_type();
                    this.user_level = cloud.user_level();
                    this.semester_list = cloud.semester_all_list();
                    this.area_list = cloud.sel_area_list();
                    var grade_list = cloud.grade_all_list();
                    var grade_obj = {
                        name: '全部',
                        value: ''
                    }
                    grade_list.unshift(grade_obj);
                    this.grade_list = grade_list;

                    if (this.grade_list.length == 0)
                        this.grade_list = [];
                    if (this.area_list.length == 0)
                        this.area_list = [];


                    this.area_list.unshift(grade_obj);


                },
                //获取全市表格数据
                get_city_table_list: function () {
                    var self = this;
                    cloud.city_process_pj({semester: this.current_semester.value}, function (data) {

                        layer.close(loading_index);
                        data = ES.completion_rate(data);
                        self.city_table_list = data;
                        vm.row_length = self.city_table_list.length;
                        vm.ring_diagram('tubiao_1', vm.filter_city(data));
                    });
                },
                city_p: {
                    grade_ids: [],//年级
                },
                area_p: {
                    grade_id: "",//年级
                    district: "",//区县
                },
                p_school: {
                    district: "",//区县
                    fk_school_id: "",//学下id
                    fk_grade_id: "",//年级
                    fk_class_id: "", //班级id
                    grade_name:'',
                    level: 4,
                    school_name: ''//学校名称
                },
                filter_city: make_filter(function (line) {
                    if (
                        vm.city_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.city_p.grade_ids.length == 0
                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (line.district == vm.area_p.district || vm.area_p.district == "")&&
                        (vm.area_p.grade_id == line.grade_id || vm.area_p.grade_id == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (line.district == vm.p_school.district || vm.p_school.district == "")
                        &&
                        (line.schoolname.indexOf(vm.p_school.school_name) >= 0 || vm.p_school.school_name == "")&&
                        (line.status == vm.p_school.grade_name || vm.p_school.grade_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_class:make_filter(function (line) {
                    if (
                        (vm.p_school.fk_grade_id == line.fk_nj_id || vm.p_school.fk_grade_id == "")  &&
                        (line.fk_xx_id == vm.p_school.fk_school_id || vm.p_school.fk_school_id == "")  &&
                        (line.xxmc.indexOf(vm.p_school.school_name) >= 0) &&
                        (vm.p_school.fk_class_id == line.fk_bj_id || vm.p_school.fk_class_id == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
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

                        var completion_rate = series_arr[i].wcl;
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
                count: count,
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
                            sczb = Number(data[i].wcl);
                        } else {
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].wcl);
                        }
                        if(type=='school'){
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].detail.wcl);
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
                //获取区县级表格数据
                get_area_table_list: function () {
                    var self = this;
                    cloud.area_process_pj({
                        semester: this.current_semester.value,
                        city: self.current_area
                    }, function (data) {

                        layer.close(loading_index);
                        sort_by(data, ["+district"]);
                        self.area_table_list = data;
                        self.first_area_data = JSON.parse(JSON.stringify(data));
                        self.deal_data(vm.filter_area(data), 'district', 'tubiao_2');
                    })
                },
                //获取校级表格数据
                get_school_table_list: function () {
                    var self = this;
                    cloud.school_process_pj({
                        semester: this.current_semester.value,
                        city: self.school_level_area,
                        schoolid: self.current_school_id
                    }, function (data) {

                        var arr = [];
                        for(var i=0;i<data.length;i++){
                            if(arr.indexOf(data[i].grade_name)==-1){
                                arr.push(data[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(data,['district','school_id','schoolname'],'grade_name',arr,0);
                        sort_by(new_cnt, ["+schoolname","+status"]);
                        self.school_table_list = new_cnt;
                        self.first_school_data = new_cnt;
                        layer.close(loading_index);
                        if (data.length == 0)
                            return;
                        if (self.user_level != 4) {
                            self.deal_data(vm.filter_school(new_cnt), 'school', 'tubiao_3')
                            return;
                        }
                        document.getElementById('tubiao_3').style.height = 200 + 'px';
                        self.draw_circle('tubiao_3', vm.filter_school(data));

                    })
                },
                draw_circle: function (div_id, series_arr) {
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
                        var completion_rate = series_arr[i].wcl;
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
                get_class_list: function () {
                    var school_id = cloud.user_school_id();
                    var self = this;
                    cloud.class_process_pj({
                        grade_id: this.current_grade_id,
                        school_id: school_id,
                        semester: this.current_semester.value
                    }, function (data) {
                        layer.close(loading_index);
                        sort_by(data, ["+njmc", "+bjmc"]);
                        self.class_table_list = data;
                        class_table_list = JSON.parse(JSON.stringify(data));

                        self.draw_bar('tubiao_4', vm.filter_class(data));
                    })
                },
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
                    ES.draw_bar(div_id, echarts, series_arr, yAxis_arr)
                },
                //班级改变
                class_change: function (el) {
                    if (el.value != "")
                        this.class_table_list = base_filter(class_table_list, "fk_bj_id", el.value);
                    else
                        this.class_table_list = class_table_list;

                    this.draw_bar('tubiao_4', this.class_table_list);
                },
                //学年学期下拉选择获取的数据
                semester_change: function (el) {
                    this.current_semester = el;
                    if (this.user_level < 3)
                        this.get_city_table_list();
                    if (this.user_level < 4)
                        this.get_area_table_list();
                    if (this.user_level < 5)
                        this.get_school_table_list();
                },
                //年级下拉列表获取数据
                grade_change: function (el) {
                    this.current_grade_name = el.name;
                    this.current_grade_id = el.value;
                    this.area_p.grade_id = el.value;
                    var arr = new Array();
                    var is_school_user = cloud.is_school_user();
                    if (el.value == '') {
                        this.city_p.grade_ids = [];
                        this.p_school.grade_name = '';
                        this.class_list = [];
                        this.row_length = this.city_table_list.length;
                        if (is_school_user) {
                            this.get_class_list();
                        }
                        this.deal_canvas(el);
                        return;
                    }
                    arr.push(el.value);
                    this.city_p.grade_ids = arr;
                    this.p_school.grade_name = el.name;
                    this.row_length = 1;

                    if (is_school_user) {
                        this.get_class_list();
                        class_list = cloud.find_class_simple({fk_grade_id: this.current_grade_id});
                        this.class_list = [{name: "全部", value: ""}]
                        this.class_list.pushArray(any_2_select(class_list, {name: "class_name", value: ["id"]}));
                        this.draw_circle('tubiao_3', this.school_table_list);
                    }
                    this.deal_canvas(el);


                },

                grade_change_class: function (el, index) {
                    this.class_list = [];
                    this.current_grade_id = el.value;
                    this.get_class_list();
                    var class_list = cloud.find_class_simple({fk_grade_id: this.current_grade_id});

                    class_list = any_2_select(class_list, {name: "class_name", value: ["id"]})
                    this.class_list = class_list;
                    this.class_list.unshift({
                        name: '全部',
                        value: ''
                    })
                },
                deal_canvas: function (el) {
                    var city_list = [];
                    for (var i = 0; i < this.city_table_list.length; i++) {
                        if (el.value == this.city_table_list[i].grade_id) {
                            city_list.push(this.city_table_list[i])
                        }
                    }
                    if (el.value == '') {
                        city_list = this.city_table_list;
                    }
                    vm.ring_diagram('tubiao_1', city_list);

                    var bar_data = [];
                    for (var i = 0; i < this.first_area_data.length; i++) {
                        if (el.value == this.first_area_data[i].grade_id) {
                            bar_data.push(this.first_area_data[i])
                        }
                    }
                    if (el.value == '') {
                        bar_data = this.first_area_data;
                    }
                    this.deal_data(bar_data, 'district', 'tubiao_2');

                    if (this.user_level != 4) {
                        this.deal_data(this.filter_school(this.school_table_list), 'school', 'tubiao_3')
                    }
                },
                //区县下拉列表改变
                area_change: function (el) {
                    if(el.value==''){
                        this.area_p.district = '';
                    }else {
                        this.area_p.district = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_table_list), 'district', 'tubiao_2');
                },
                search: function () {
                    this.school_table_list = this.filter_old_school(this.first_school_data);
                    if (this.user_level != 4) {
                        this.deal_data(this.school_table_list, 'school', 'tubiao_3')
                        return;
                    }
                    document.getElementById('tubiao_3').style.height = 200 + 'px';
                    this.draw_circle('tubiao_3', this.school_table_list);
                },

                //校级下拉列表改变
                school_level_select: function (el) {
                    this.school_name = '';
                    if(el.value==''){
                        this.school_level_area = '';
                        vm.p_school.district = '';
                    }else {
                        this.school_level_area = el.name;
                        vm.p_school.district = el.name;
                    }

                    if (this.user_level != 4) {
                        this.deal_data(this.filter_school(this.school_table_list), 'school', 'tubiao_3')
                        return;
                    }
                    document.getElementById('tubiao_3').style.height = 200 + 'px';
                    this.draw_circle('tubiao_3', this.filter_school(this.school_table_list));
                },

                filter_old_school: make_filter(function (line) {
                    if (
                        (line.district == vm.school_level_area || vm.school_level_area == "")
                        &&
                        (line.schoolname.indexOf(vm.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                })
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
