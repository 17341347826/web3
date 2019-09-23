define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_target_school/daily_target_school', 'html!'),
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
        var grade_ids = [];
        var msg_api = api.api + "GrowthRecordBag/every_day_goal_and_plan_completion";
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
        }
        var avalon_define = function () {
            var ori_grade_list = [];
            var vm = avalon.define({
                $id: "daily_target_school",
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
                    school_name: '',//学校名称,
                    fk_grade_id:'',
                    fk_class_id:''
                },
                //年级班级列表
                grade_class_list: [],
                //班级列表
                class_list: [],
                //学校id
                school_id: '',
                all_grades: [],
                all_classes: [],
                extend: {
                    fk_semester_id: ''
                },
                to_page:function (url) {
                    sessionStorage.setItem("semester", this.semester);
                    sessionStorage.setItem("fk_grade_id", this.school_p.fk_grade_id);
                    window.location.href = '#'+url;
                },
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.get_data();
                },
                //年级列表中年级下拉列表改变
                sel_grade: function (el, index) {
                    this.school_p.fk_grade_id = el.value;
                    this.deal_data(this.filter_school(this.order_by_grade),this.filter_class(this.order_by_class))
                },

                //年级列表
                order_by_grade: [],
                //班级列表
                order_by_class: [],
                //
                grade_all: [],
                //用户等级
                user_level:'',
                filters_undefined:filter_undefined,
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
                    this.get_data();
                    // this.get_school_tbale_list();
                },
                get_data: function () {
                    this.extend.fk_semester_id = Number(this.semester.split('|')[0]);
                    ajax_post(msg_api, this.extend.$model, this);
                },
                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    ori_grade_list = cloud.grade_list();
                    this.grade_all = abstract(ori_grade_list, "grade_id");
                    this.grade_list = any_2_select(ori_grade_list, {name: "grade_name", value: ["grade_id"]});
                    var is_teacher = cloud.is_teacher()
                    if(is_teacher){
                        var new_grade = cloud.auto_grade_list();
                        this.grade_list = any_2_select(new_grade, {name: "grade_name", value: ["grade_id"]});
                    }
                    grade_ids = [];
                    for(var i=0;i<this.grade_list.length;i++){
                        grade_ids.push(Number(this.grade_list[i].value))
                    }
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    });

                    this.grade_class_list = ori_grade_list;
                    this.user_level = cloud.user_level()
                },
                filter_school: make_filter(function (line) {
                    if (
                        (vm.school_p.fk_grade_id == line.grade_id || vm.school_p.fk_grade_id == "")
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
                filter_class: make_filter(function (line) {
                    if (
                        (vm.school_p.fk_grade_id == line.fk_nj_id || vm.school_p.fk_grade_id == "")  &&
                        (line.fk_xx_id == vm.school_p.fk_school_id || vm.school_p.fk_school_id == "")  &&
                        (line.xxmc.indexOf(vm.school_p.school_name) >= 0) &&
                        (vm.school_p.fk_class_id == line.fk_bj_id || vm.school_p.fk_class_id == "")
                    ) {
                        return true;
                    }
                    return false;
                }),
                row_length: 0,

                //处理数据
                deal_data: function (grades, classes) {
                    // this.order_by_grade = grades;
                    // this.order_by_class = classes;
                    if (grades.length > 0) {
                        this.draw_bar('tubiao_1', grades,'grade');
                    }
                    if (classes.length > 0) {
                        this.draw_bar('tubiao_2', classes,'class');
                    }
                },
                //画柱状图
                draw_bar: function (div_id, table_data,type) {
                    var table_list_length = table_data.length;
                    var yAxis_arr = [];
                    var series_arr = [];
                    for (var i = table_list_length-1; i > -1; i--) {
                        var grade_name = '';
                        var class_name = '';
                        if(type=='grade'){
                            grade_name = table_data[i].grade_name;
                            class_name = table_data[i].class_name;
                        }
                        if(type=='class'){
                            grade_name = table_data[i].njmc;
                            class_name = table_data[i].bjmc;
                        }
                        var str = '';
                        if(grade_name){
                            str += grade_name;
                        }
                        if(class_name){
                            str+=class_name;
                        }
                        yAxis_arr.push(str);
                        var new_wcl = 0;
                        if(type=='grade'){
                            new_wcl = table_data[i].school_cnt.pjdf
                        }
                        if(type=='class'){
                            new_wcl = Number(table_data[i].school_class_cnt.pjdf);
                        }
                        if(!new_wcl)
                            new_wcl = 0;
                        new_wcl = new_wcl.toFixed(2);
                        series_arr.push(new_wcl);
                    }
                    this.draw_bar_img(div_id,series_arr,yAxis_arr)
                },
                draw_bar_img:function (div_id,series_arr,yAxis_arr) {
                    ES.set_class_img_height(series_arr,div_id);7
                    var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];
                    var myChart = echarts.init(document.getElementById(div_id));
                    var option = {
                        title: {
                            text: ''
                        },
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'value',
                            boundaryGap: [0, 0.01],
                            show:false
                        },
                        yAxis: {
                            type: 'category',
                            data: yAxis_arr
                        },

                        series: [
                            {
                                type: 'bar',
                                data: series_arr,
                                barWidth: 20,
                                itemStyle: {
                                    normal: {
                                        color: function (params) {
                                            return color_arr[params.dataIndex % 5]
                                        },
                                        label:{
                                            show:true,
                                            position:'insideLeft',
                                            formatter:function (params) {
                                                return params.data;
                                            }
                                        }
                                    }
                                }
                            }

                        ]
                    };
                    myChart.setOption(option);
                    myChart.resize();
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
                //数据重组
                data_reorganization:function (arr) {
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
                deal_msg:function (data) {
                    // data.data = null;
                    if (!data.data)
                        return;
                    if (data.data.school_cnt) {
                        var student_school = cloud.student_count_in_semester({
                            dj: 4,
                            fk_xq_id: this.semester.split('|')[0]
                        });
                        student_school = merge_table(student_school, ["grade_id"], data.data.school_cnt, ["fk_grade_id"], "school_cnt");
                        sort_by(student_school, ["+grade_name"]);
                        var new_arr = [];
                        for(var k=0;k<student_school.length;k++){
                            if(grade_ids.indexOf(student_school[k].grade_id)!=-1){
                                new_arr.push(student_school[k])
                            }
                        }
                        this.all_grades = new_arr;
                        this.order_by_grade = new_arr;
                    }
                    if (data.data.school_class_cnt) {
                        var class_count = [];
                        class_load_count = 0;
                        var school_class_cnt = data.data.school_class_cnt;
                        this.grade_list.forEach(function (each) {
                            if(each.value=='')
                                return;
                            cloud.sem_class_list({fk_nj_id: each.value, fk_xq_id: Number(vm.semester.split('|')[0])},
                                function (url, arg, data) {
                                    class_load_count++;
                                    class_count = class_count.concat(data.list);
                                    if(class_load_count==vm.grade_list.length-1){
                                        class_count = merge_table(class_count, ["fk_nj_id","fk_bj_id"], school_class_cnt, ["grade_id","class_id"], "school_class_cnt",0);
                                        sort_by(class_count, ["+njmc","+bjmc"]);
                                        vm.all_classes = class_count;
                                        vm.order_by_class = class_count;
                                        vm.deal_data(vm.filter_school(vm.order_by_grade),vm.filter_class(vm.order_by_class))
                                    }
                                });
                        })

                    }

                }

            });
            vm.$watch('onReady', function () {
                let semester = sessionStorage.getItem("semester");
                let fk_grade_id = sessionStorage.getItem("fk_grade_id");
                if (semester) {
                    this.semester = semester;
                    this.get_data();
                }
                if (fk_grade_id) {
                    this.school_p.fk_grade_id = fk_grade_id;
                }
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