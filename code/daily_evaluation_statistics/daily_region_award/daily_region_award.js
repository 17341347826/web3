define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_region_award/daily_region_award', 'html!'),
        C.Co('daily_evaluation_statistics', 'daily_portrait_target/daily_portrait_target', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.growth + "award_winning_situation_sta_analysis_qyfx";
        var user = {};
        var avalon_define = function () {

            var vm = avalon.define({
                $id: "daily_portrait_award",
                //@value(el, "findtype4.count", 0))
                value: value,
                html_display:1,
                //@count(@school_process_list, el.schoolname)
                count: count,
                is_init_sel: true,
                area_list: [],
                semester_list: [],
                grade_list: [],
                school_list: [],
                extend: {
                    fk_grade_id: '',
                    fk_semester_id: '',
                },
                semester: "",//接口参数 学期
                grade_all: [],//接口参数 年级
                //市参数

                user_level: '',
                current_grade: '',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.extend.fk_semester_id = this.semester.split('|')[0];
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
                //等级，维度，要素切换
                presentation_change:function (num) {
                    var dis = num;
                    switch (dis){
                        case 1:
                            break;
                        case 2:
                            this.to_page('daily_region_ana?sta_type=2&module_type=3');
                            break;
                        case 3:
                            this.to_page('daily_region_ana?sta_type=3&module_type=3');
                            break;
                        default:
                            break;
                    }
                },
                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
                //班级数组
                order_by_class: [],
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
                    if (is_city_leader) {
                        this.area_list = cloud.sel_area_list();
                    }

                },
                filter_undefined: filter_undefined,
                city_p: {
                    semester: "",//学期
                    grade_ids: [],//年级
                    semester_id: ''
                },
                //区参数
                area_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    semester_id: ''
                },
                //学校参数
                school_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: '',//学校名称
                    semester_id: ''
                },
                default_area: '请选择区县',

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
                to_page: function (url) {
                    window.location.href = '#' + url;
                },

                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length - 1; i > -1; i--) {
                        var name = data[i].qysx;
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.push(name);
                        }
                        var y_name = '';
                        var sczb = 0;

                        if (type == 'city') {
                            y_name = cloud.user_city();
                            sczb = Number(data[i].pjdf);
                        }
                        if (type == 'district') {
                            y_name = data[i].district_name;
                            sczb = Number(data[i].pjdf);
                        }
                        if (type == 'school') {
                            y_name = data[i].school_name;
                            sczb = Number(data[i].detail.pjdf);
                        }
                        if (type == 'class') {
                            y_name = data[i].grade_name + data[i].class_name
                            sczb = Number(data[i].detail.pjdf);
                        }
                        if (!sczb)
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
                    if (legend_arr.length > 0)
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
                                            return params.data;
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
                deal_cnt: function (cnt) {
                    for (var i = 0; i < cnt.length; i++) {
                        cnt[i].cjjb_arr = cnt[i].cjjb.split(',');
                        if (cnt[i].cjjb_arr[cnt[i].cjjb_arr.length - 1] == '')
                            cnt[i].cjjb_arr.pop();
                        cnt[i].rjjl_arr = cnt[i].rjjl.split(',');
                        if (cnt[i].rjjl_arr[cnt[i].rjjl_arr.length - 1] == '')
                            cnt[i].rjjl_arr.pop();
                    }

                    var arr = []
                    for (var i = 0; i < cnt.length; i++) {
                        for (var j = 0; j < cnt[i].cjjb_arr.length; j++) {
                            var jbmc = cnt[i].cjjb_arr[j];
                            if (arr.indexOf(jbmc) == -1) {
                                arr.push(jbmc);
                            }
                        }
                    }
                    for (var i = 0; i < cnt.length; i++) {
                        if (cnt[i].cjjb_arr.length < arr.length) {
                            var sub_list = cnt[i].cjjb_arr;
                            for (var k = 0; k < arr.length; k++) {
                                var key = arr[k];
                                if (!sub_list[k] || sub_list[k] != key) {
                                    cnt[i].cjjb_arr.splice(k, 0, key)
                                    cnt[i].rjjl_arr.splice(k, 0, 0)
                                }
                            }
                        }
                    }
                    return cnt;
                },
                //处理获取的页面数据
                deal_msg: function (data) {
                    if (!data.data)
                        return;
                    if (data.data.city_cnt) {
                        var city_cnt = this.deal_cnt(data.data.city_cnt)
                        this.city_process_list = city_cnt;
                        var is_city_leader = cloud.is_city_leader();
                        if (is_city_leader)
                            this.deal_data(this.filter_city(this.city_process_list), 'city', 'tubiao_1');
                    }
                    if (data.data.district_cnt) {
                        var district_cnt = this.deal_cnt(data.data.district_cnt)
                        sort_by(district_cnt, ['+district_name', '+qysx'])
                        if (district_cnt.length > 0)
                            vm.area_p.district_name = district_cnt[0].district_name;
                        this.default_area = vm.area_p.district_name;

                        this.area_process_list = district_cnt;
                        if (this.user_level < 4)
                            this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    }
                    if (data.data.school_cnt) {
                        var school_cnt = this.deal_cnt(data.data.school_cnt)
                        var arr = [];
                        for (var i = 0; i < school_cnt.length; i++) {
                            var semester_name = school_cnt[i].semester_name;
                            if (arr.indexOf(semester_name) == -1) {
                                arr.push(semester_name)
                            }
                        }
                        var new_cnt = DailyAnaly.complate_data(school_cnt, ['district_name', 'fk_grade_id', 'grade_name', 'school_name'], 'qysx', arr, 0);
                        sort_by(new_cnt, ['+district_name', '+school_name', '+qysx'])
                        this.school_process_list = new_cnt;
                        if (new_cnt.length > 0 && this.user_level < 4)
                            vm.school_p.district_name = new_cnt[0].district_name;
                        this.defalut_area_school = this.school_p.district_name;
                        this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                    }
                    if (data.data.school_class_cnt) {
                        var school_class_cnt = this.deal_cnt(data.data.school_class_cnt);
                        var arr = [];
                        for (var i = 0; i < school_class_cnt.length; i++) {
                            var semester_name = school_class_cnt[i].semester_name;
                            if (arr.indexOf(semester_name) == -1) {
                                arr.push(semester_name)
                            }
                        }
                        var new_cnt = DailyAnaly.complate_data(school_class_cnt, ['fk_grade_id', 'grade_name', 'fk_class_id', 'class_name'], 'qysx', arr, 0);


                        sort_by(new_cnt, ['+fk_grade_id', '+fk_class_id', '+qysx',])
                        this.order_by_class = new_cnt;
                        this.deal_data(this.order_by_class, 'class', 'tubiao_4')
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
