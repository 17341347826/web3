define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_target/daily_target', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/every_day_goal_and_plan_completion";
        var user = {};
        var by = function(name){
            return function(o, p){
                var a, b;
                if (typeof o === "object" && typeof p === "object" && o && p) {
                    a = o[name];
                    b = p[name];
                    if (a === b) {
                        return 0;
                    }
                    if (typeof a === typeof b) {
                        return a < b ? -1 : 1;
                    }
                    return typeof a < typeof b ? -1 : 1;
                }
                else {
                    throw ("error");
                }
            }
        };

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
                    fk_semester_id: ''
                },
                semester: "",//接口参数 学期
                grade_all: [],//接口参数 年级
                //市参数
                city_p: {
                    semester: "",//学期
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
                    school_name: '',//学校名称
                },
                user_level: '',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.extend.fk_semester_id = this.semester.split('|')[0];
                    ajax_post(msg_api, this.extend.$model, this);
                },
                sel_change_grade: function (el) {
                    var arr = new Array();
                    if (el.value == '') {
                        this.city_p.grade_ids = '';
                        this.area_p.grade_ids = '';
                        this.school_p.grade_ids = '';
                        this.semester_list = cloud.semester_all_list();
                    } else {
                        arr.push(el.value)
                        this.city_p.grade_ids = arr;
                        this.area_p.grade_ids = arr;
                        this.school_p.grade_ids = arr;
                        var se_list = cloud.grade_semester_mapping_list({grade_id:el.value});
                        this.semester_list = any_2_select(se_list, {name: "semester_name", value: ["id"]});
                    }

                    if (this.user_level<3)
                        this.deal_data(this.filter_city(this.city_process_list), 'city', 'tubiao_1');
                    if (this.user_level<4)
                        this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                sel_change_area: function (el) {
                    if (el.name == '全部') {
                        this.area_p.district_name = ''
                    } else {
                        this.area_p.district_name = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_process_list), 'district', 'tubiao_2');
                },
                sel_change_area_2: function (el) {
                    this.school_p.school_name = '';
                    if (el.name == '全部') {
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
                //初始数据
                init: function () {
                    $("#func_list").select2();
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                    }
                    if (this.grade_list.length > 0) {//默认查询所有年级
                        var arr = new Array()
                        for (idx in this.grade_list) {
                            if (this.grade_list[idx].value == "")continue;
                            arr.push(Number(this.grade_list[idx].value));
                        }
                        this.grade_all = arr;
                    }
                    this.get_data();
                },
                search: function () {
                    // this.school_process_list = this.filter_old_school(this.old_school_process_list)
                    this.deal_data(this.filter_school(this.school_process_list), 'school', 'tubiao_3')
                },
                //初始前期数据
                init_data: function () {
                    user = cloud.user_user();
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    this.grade_list.unshift(obj);
                    this.area_list = cloud.sel_area_list();
                    this.user_level = cloud.user_level();
                },
                filter_undefined:filter_undefined,
                //页面数据过滤
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
                        (line.schoolname.indexOf(vm.school_p.fk_school_id) >= 0 || vm.school_p.fk_school_id == "")
                        &&
                        (line.schoolname.indexOf(vm.school_p.school_name) >= 0)
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,
                //获取市进度数据
                get_data: function () {
                    this.extend.fk_semester_id = this.semester.split('|')[0];
                    ajax_post(msg_api, this.extend.$model, this);
                },
                to_page:function (url) {
                    window.location.href = '#'+url;
                },
                old_school_process_list: [],

                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length-1; i >-1; i--) {
                        var name = data[i].grade_name;
                        if(type=='school')
                            name = data[i].status;
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.push(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        if (type == 'city') {
                            y_name = data[i].city;
                            sczb = Number(data[i].city_cnt.pjdf) ;
                        } else if (type == 'district') {
                            y_name = data[i].district;
                            sczb = Number(data[i].district_cnt.pjdf) ;
                        } else {
                            y_name = data[i].schoolname;
                            sczb = Number(data[i].detail.school_cnt.pjdf) ;
                        }
                        if(!sczb)
                            sczb = 0;
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
                    ES.draw_more_bar(div_id, echarts, series_arr, yAxis_arr, legend_arr);
                },
                search_by_school_id: function () {
                    this.school_p.fk_school_id = $("#func_list").val();
                    this.get_school_tbale_list();
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
                get_grade_name:function (arr) {
                    var city_length = arr.length;
                    var grade_list_length = this.grade_list.length;
                    for (var i = 0; i < city_length; i++) {
                        var grade_id = arr[i].grade_id;
                        arr[i].wwc = Number(arr[i].wwc).toFixed(2);
                        arr[i].jh = Number(arr[i].jh).toFixed(2);
                        arr[i].yb = Number(arr[i].yb).toFixed(2);
                        arr[i].pjdf = Number(arr[i].pjdf).toFixed(2);
                        for (var j = 0; j < grade_list_length; j++) {
                            if(grade_id==this.grade_list[j].value){
                                arr[i].grade_name = this.grade_list[j].name;
                                break;
                            }
                        }
                    }
                    return arr;
                },
                //处理获取的页面数据
                deal_msg: function (data) {
                    if (!data.data)
                        return;
                    if (data.data.city_cnt) {
                        // data.data.city_cnt = this.get_grade_name(data.data.city_cnt);
                        var student_city = cloud.student_count_in_semester({
                            dj: 2,
                            fk_xq_id: this.semester.split('|')[0]
                        });
                        setTimeout(function () {
                            student_city = merge_table(student_city, ["grade_id"], data.data.city_cnt, ["grade_id"], "city_cnt", 0);
                            sort_by(student_city, ["+city", "+district", "+school_id", "+grade_name"]);
                            vm.city_process_list = student_city;
                            var is_city_leader = cloud.is_city_leader();
                            if (is_city_leader)
                                vm.deal_data(vm.filter_city(vm.city_process_list), 'city', 'tubiao_1');
                        },0)

                    }
                    if (data.data.district_cnt) {
                        var student_area = cloud.student_count_in_semester({
                            dj: 3,
                            fk_xq_id: this.semester.split('|')[0]
                        });
                        setTimeout(function () {
                            student_area = merge_table(student_area, ["district", "grade_id"], data.data.district_cnt, ["district_name", "grade_id"], "district_cnt", 0);
                            sort_by(student_area, ["+city", "+district", "+school_id", "+grade_name"]);
                            vm.area_process_list = student_area;
                            if(vm.user_level<4)
                                vm.deal_data(vm.filter_area(vm.area_process_list), 'district', 'tubiao_2');
                        },0)

                    }
                    if (data.data.school_cnt) {
                        var student = cloud.student_count_in_semester({
                            dj: 4,
                            fk_xq_id: this.semester.split('|')[0]
                        });

                        student = merge_table(student, ["school_id", "grade_id"], data.data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt", 0);
                        var arr = [];
                        for(var i=0;i<student.length;i++){
                            if(arr.indexOf(student[i].grade_name)==-1){
                                arr.push(student[i].grade_name)
                            }
                        }
                        var new_cnt = complate_data(student,['district','school_id','schoolname'],'grade_name',arr,0);
                        setTimeout(function () {
                            sort_by(new_cnt, [ "+district", "+school_id", "+status"]);
                            vm.school_process_list = new_cnt;
                            vm.deal_data(vm.filter_school(vm.school_process_list), 'school', 'tubiao_3')
                        },0)

                    }
                }

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
