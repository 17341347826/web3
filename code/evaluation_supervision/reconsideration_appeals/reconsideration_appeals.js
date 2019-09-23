define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'reconsideration_appeals/reconsideration_appeals', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        avalon.filters.my_fixed = function (value) {
            return value.toFixed(2);
        };
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
                //市参数
                city_p: {
                    grade_id: "",//年级
                },
                //区参数
                area_p: {
                    district_name: "",//区
                    grade_id: "",//年级
                },
                //学校参数
                school_p: {
                    district_name: "",//区
                    grade_id: "",//年级
                    school_id: "",//校,
                    school_name: ''
                },
                user_level: '',
                default_area:'',
                filter_undefined:filter_undefined,
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    if (this.user_level < 3) {
                        this.get_area_tbale_list()
                    }
                    this.get_city_tbale_list()
                    setTimeout(function () {
                        vm.get_school_tbale_list()
                    },0)

                },
                sel_change_grade: function (el) {
                    var grade_id = el.value
                    this.city_p.grade_id = grade_id
                    this.area_p.grade_id = grade_id
                    this.school_p.grade_id = grade_id;
                    ES.ring_diagram('tubiao_1', echarts, this.filter_city(this.city_process_list));
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')

                },
                sel_change_area: function (el) {
                    if (el.name == '全部') {
                        this.area_p.district_name = '';
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
                    if (this.user_level < 3)
                        this.get_city_tbale_list();
                    this.get_area_tbale_list();
                    setTimeout(function () {
                        vm.get_school_tbale_list();
                    },0)

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
                        vm.city_p.grade_id == line.grade_id || vm.city_p.grade_id == ""
                    )
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_id == line.detail.grade_id || vm.area_p.grade_id == "")
                        &&
                        (line.district == vm.area_p.district_name || vm.area_p.district_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if ((vm.school_p.grade_id == line.detail.grade_id || vm.school_p.grade_id == "") &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_id == vm.school_p.school_id || vm.school_p.school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")

                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
                    if ((vm.school_p.grade_id == line.grade_id || vm.school_p.grade_id == "") &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "") &&
                        (line.schoolname.indexOf(vm.school_p.school_id) >= 0 || vm.school_p.school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                search: function () {
                    // this.school_process_list = this.filter_old_school(this.old_school_table_list)
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                row_length: 0,
                //获取市进度数据
                get_city_tbale_list: function () {
                    var self = this
                    cloud.city_sqfy_process({semester: this.semester}, function (data) {

                        self.city_process_list = data
                        self.row_length = self.city_process_list.length
                        ES.ring_diagram('tubiao_1', echarts, vm.filter_city(data));
                    })
                },
                //获取区县进度数据
                get_area_tbale_list: function () {
                    var self = this;
                    cloud.area_sqfy_process({semester: this.semester}, function (data) {
                       
                        var arr = [];
                        for(var i=0;i<data.length;i++){
                            if(arr.indexOf(data[i].grade_name)==-1){
                                arr.push(data[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(data,['city','district','school_id','schoolname'],'grade_name',arr,0);
                        new_cnt = ES.completion_rate(new_cnt);
                        self.area_process_list = new_cnt
                        self.deal_data(vm.filter_area(new_cnt), 'district', 'tubiao_2');

                    })
                },
                old_school_table_list: [],
                //获取学校进度数据
                get_school_tbale_list: function () {
                    var self = this;
                    cloud.school_sqfy_process({semester: this.semester}, function (data) {
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
                school_data_deal: function (area) {
                    Screen.screen(area, function (new_cnt) {
                        vm.school_process_list = new_cnt;
                        vm.old_school_table_list = new_cnt;
                        setTimeout(function () {
                            vm.deal_data(vm.filter_school(new_cnt), 'school', 'tubiao_3')
                        }, 100)
                    })
                },
                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length - 1; i > -1; i--) {
                        var name = data[i].status;
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.unshift(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        if (type == 'district') {
                            y_name = data[i].district;
                            sczb = Number(data[i].detail.data.wcl);
                        } else {
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].detail.data.wcl);
                        }
                        if (yAxis_arr.indexOf(y_name) == -1) {
                            yAxis_arr.push(y_name);
                        }
                        if (!obj_legend[name]) {
                            obj_legend[name] = [];
                        }
                        if(!sczb)
                            sczb = 0;
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
