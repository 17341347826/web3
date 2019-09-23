define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_region_target/daily_region_target', 'html!'),
        C.Co('daily_evaluation_statistics', 'daily_portrait_target/daily_portrait_target', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.growth + "every_day_goal_and_plan_completion_qyfx";
        var user = {};


        var avalon_define = function () {

            var vm = avalon.define({
                $id: "daily_target",
                //@value(el, "findtype4.count", 0))
                value: value,
                //@count(@school_process_list, el.schoolname)
                count: count,
                is_init_sel: true,
                area_list: [],
                semester_list: [],
                grade_list: [],
                school_list: [],
                extend: {
                    fk_grade_id: '',
                    fk_semester_id:'',
                },
                semester: "",//接口参数 学期
                grade_all: [],//接口参数 年级
                //市参数

                user_level: '',
                current_grade:'',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.extend.fk_semester_id  =  this.semester.split('|')[0];
                    this.get_data();
                },
                sel_change_grade: function (el) {
                    this.current_grade = el.value;
                    this.get_data();
                },
                sel_change_area: function (el) {
                    if (el.value == '') {
                        this.area_p.district_name = ''
                    } else {
                        this.area_p.district_name = el.name;
                    }
                    this.default_area = el.name;
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                },
                sel_change_area_2: function (el) {
                    this.school_p.school_name = '';
                    if (el.value == '') {
                        this.school_p.district_name = ''
                    } else {
                        this.school_p.district_name = el.name;
                    }
                    this.search();
                },
                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
                //班级数组
                order_by_class:[],
                //初始数据
                init: function () {
                    this.get_data();
                },
                search: function () {
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                //初始前期数据
                init_data: function () {
                    user = cloud.user_user();
                    this.grade_list = cloud.grade_all_list();
                    this.current_grade = this.grade_list[0].value;

                    this.user_level = cloud.user_level();
                    this.semester_list = cloud.semester_all_list();
                    this.extend.fk_semester_id = this.semester_list[0].value.split('|')[0];
                    var is_city_leader = cloud.is_city_leader()
                    if(is_city_leader){
                        this.area_list = cloud.sel_area_list();
                    }

                },
                filter_undefined:filter_undefined,
                city_p: {
                    semester: "",//学期
                    grade_ids: [],//年级
                    semester_id:''
                },
                //区参数
                area_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    semester_id:''
                },
                //学校参数
                school_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: '',//学校名称
                    semester_id:''
                },
                default_area:'请选择区县',

                //页面数据过滤
                filter_city: make_filter(function (line) {
                    if (vm.city_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.city_p.grade_ids.length == 0)
                        return true;
                    return false;
                }),
                filter_area: make_filter(function (line) {
                    if (
                        (vm.area_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.area_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.area_p.district_name || vm.area_p.district_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district_name == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_name.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")

                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_class: make_filter(function (line) {
                    if (
                        (line.semester_id == vm.school_p.semester_id || vm.school_p.semester_id == "")
                    ) {
                        return true;
                    }
                    return false;
                }),

                row_length: 0,
                //获取市进度数据
                get_data: function () {
                    this.extend.fk_grade_id = this.current_grade;
                    ajax_post(msg_api, this.extend.$model, this);
                },
                to_page:function (url) {
                    window.location.href = '#'+url;
                },

                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length-1; i >-1; i--) {
                        var name = data[i].qysx;
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.push(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        y_name = data[i].semester_name;

                        if(type=='city'){
                            y_name = cloud.user_city();
                        }
                        if(type=='district'){
                            y_name = data[i].district_name;
                        }
                        if(type=='school'){
                            y_name = data[i].school_name;
                        }
                        if(type=='class'){
                            y_name = data[i].grade_name+data[i].class_name
                        }
                        sczb = Number(data[i].pjdf);
                        if(!sczb)
                            sczb = 0;
                        sczb = sczb.toFixed(2)
                        if (yAxis_arr.indexOf(y_name) == -1) {
                            yAxis_arr.push(y_name);
                        }
                        if (!obj_legend[name]) {
                            obj_legend[name] = [];
                        }
                        obj_legend[name].push(sczb)
                    }
                    var series_arr = [];
                    if(legend_arr.length>0)
                        legend_arr.reverse();

                    for (var key in legend_arr) {
                        var obj_series = {
                            name: legend_arr[key],
                            type: 'bar',
                            data: obj_legend[legend_arr[key]],
                            barWidth: 20,
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'insideLeft',
                                        formatter: function (params) {
                                            return params.data ;
                                        }
                                    }
                                }
                            }
                        }
                        series_arr.push(obj_series);
                    }
                    DailyAnaly.draw_bar(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                },

                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取方案内容
                            case msg_api:
                                this.deal_msg(data)
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                //处理获取的页面数据
                deal_msg: function (data) {
                    if (!data.data)
                        return;
                    if (data.data.city_cnt) {
                        this.city_process_list = data.data.city_cnt;
                        var is_city_leader = cloud.is_city_leader();
                        if (is_city_leader)
                            this.deal_data(this.filter_city(this.city_process_list), 'city', 'tubiao_1');
                    }
                    if (data.data.district_cnt) {
                        var district_cnt = data.data.district_cnt;
                        sort_by(district_cnt,['+district_name','+qysx'])
                        this.area_list = this.area_list;
                        if(district_cnt.length>0)
                            vm.area_p.district_name = district_cnt[0].district_name;
                            this.default_area = vm.area_p.district_name;

                        this.area_process_list = district_cnt;
                        // var obj ={};
                        // for(var i=0;i<vm.area_list.length;i++){
                        //     if(district_cnt[0].district_name==vm.area_list[i].name){
                        //         obj.name = district_cnt[0].district_name;
                        //         obj.value = vm.area_list[i].value;
                        //         vm.default_area = obj.name;
                        //         break;
                        //     }
                        // }

                        // this.sel_change_area(obj)
                        if(this.user_level<4)
                            this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    }
                    if (data.data.school_cnt) {
                        var school_cnt = data.data.school_cnt;
                        sort_by(school_cnt,['+district_name','+school_name','+semester_name'])
                        this.school_process_list = school_cnt;
                        this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                    }
                    if(data.data.school_class_cnt){
                        var school_class_cnt = data.data.school_class_cnt;
                        sort_by(school_class_cnt,['+district_name','+school_name','+grade_id','+class_id','+semester_name',])
                        this.order_by_class = school_class_cnt;
                        this.deal_data(this.filter_class(this.order_by_class), 'class', 'tubiao_4')
                    }
                }

            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/daily_evaluation_statistics/daily_analy.js'], function () {
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
