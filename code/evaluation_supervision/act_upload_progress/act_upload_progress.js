define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'act_upload_progress/act_upload_progress', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module, formatUtil) {
        //自定义过滤器
        avalon.filters.absNum = function (str) {
            return Math.abs(str);
        };
        var avalon_define = function () {
            //筛选
            var Screen = undefined;
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
                    grade_ids: [],//年级
                },
                //区参数
                area_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                },
                //学校参数
                school_p: {
                    grade_ids: [],//年级
                    district_name: "",//区县
                    fk_school_id: "",//学校
                    school_name: ''//学校名称
                },
                //用户等级
                user_level: '',
                default_area: '',
                progress_data: '',
                listProgress: function (fk_semester_id) {
                    ajax_post(progress_api, {
                        fk_semester_id: fk_semester_id
                    }, this)
                },
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value
                    this.get_list()
                },
                sel_change_grade: function (el) {
                    var arr = new Array();
                    if (el.value == '') {
                        this.city_p.grade_ids = arr;
                        this.area_p.grade_ids = arr;
                        this.school_p.grade_ids = arr;
                    } else {
                        arr.push(el.value);
                        this.city_p.grade_ids = arr;
                        this.area_p.grade_ids = arr;
                        this.school_p.grade_ids = arr;
                    }
                    ES.ring_diagram('tubiao_1', echarts, this.filter_city(this.city_process_list), 'zb');
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                sel_change_area: function (el) {

                    if (el.value == '') {
                        this.area_p.district_name = '';
                    } else {
                        this.area_p.district_name = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                },
                sel_change_area_2: function (el) {
                    this.default_area = el.name;
                    this.school_data_deal(el.name);
                    this.school_p.school_name = '';
                },

                //市 渲染数据
                city_process_list: [],
                //区 渲染数据
                area_process_list: [],
                //县 渲染数据
                school_process_list: [],
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
                    this.get_list()
                },
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    if (this.grade_list.length == 0)
                        this.grade_list = [];
                    if (this.area_list.length == 0)
                        this.area_list = [];
                    this.default_area = this.area_list[0].name
                    this.grade_list.unshift(obj);
                    this.area_list.unshift(obj);

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
                        (vm.area_p.grade_ids.indexOf("" + line.grade_id) >= 0 || vm.area_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.area_p.district_name || vm.area_p.district_name == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.grade_ids.indexOf("" + line.detail.grade_id) >= 0 || vm.school_p.grade_ids.length == 0)
                        &&
                        (line.district == vm.school_p.district_name || vm.school_p.district_name == "")
                        &&
                        (line.school_id == vm.school_p.fk_school_id || vm.school_p.fk_school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0 || vm.school_p.school_name == "")

                    ) {
                        return true;
                    }
                    return false;
                }),
                filter_old_school: make_filter(function (line) {
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

                get_list: function () {
                    cloud.hd_process1({
                        semester: this.semester,
                        grade_ids: this.grade_all,
                        level: [2, 3, 4]
                    }, function (data) {
                        if (data.city&&data.city.length>0) {
                            var city_data = data.city;
                            var work = new Worker('/Growth/code/evaluation_supervision/input_work.js');
                            work.postMessage({
                                value:city_data,
                                type:'address'
                            })
                            work.onmessage = function (event) {
                                vm.city_process_list = event.data
                                vm.row_length = vm.city_process_list.length
                                ES.ring_diagram('tubiao_1', echarts, vm.filter_city(vm.city_process_list), 'zb');
                            }
                        }
                        if (data.area && data.area.length>0) {
                            var area_data = data.area;
                            var work = new Worker('/Growth/code/evaluation_supervision/input_work.js');
                            work.postMessage(
                                {
                                    value:area_data,
                                    type:'address'
                                }
                            )
                            work.onmessage = function (event) {
                                vm.area_process_list = event.data;
                                vm.deal_data(vm.filter_area(vm.area_process_list), 'district', 'tubiao_2');
                            }
                        }
                        if (data.school && data.school.length>0) {
                            var school_data = data.school
                            var arr = [];
                            for (var i = 0, len = school_data.length; i < len; i++) {
                                if (arr.indexOf(school_data[i].grade_name) == -1) {
                                    arr.push(school_data[i].grade_name)
                                }
                            }
                            var new_cnt = complate_data(school_data, ['district', 'school_id', 'schoolname'], 'grade_name', arr, 0);
                            Screen.all_data = new_cnt;
                            vm.school_data_deal(vm.default_area);
                        }
                    })
                },
                old_school_table_list: [],
                school_data_deal: function (area) {
                    Screen.screen(area, function (new_cnt) {
                        vm.old_school_table_list = new_cnt;
                        vm.school_process_list = new_cnt;
                        vm.deal_data(vm.filter_school(new_cnt), 'school', 'tubiao_3')
                    })
                },
                search: function () {
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                deal_data: function (data, type, div_id) {
                    var work = new Worker('/Growth/code/evaluation_supervision/input_work.js');
                    work.postMessage(
                        {
                            value:{
                                data:data,
                                type:type
                            },
                            type:'img_data'
                        }
                    )
                    work.onmessage = function (event) {
                        const work_data  = JSON.parse(event.data);
                        ES.bar_for_progress(div_id, echarts, work_data.series_arr, work_data.yAxis_arr, work_data.legend_arr);
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