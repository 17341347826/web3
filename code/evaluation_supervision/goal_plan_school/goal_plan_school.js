define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'goal_plan_school/goal_plan_school', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var goal_api = api.api + "GrowthRecordBag/targetplan_input_progress";
        var order_by_class = [];
        var grade_list = [];
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "plan_realization_progress",
                //@value(el, "findtype4.count", 0))
                value: value,
                //@count(@school_process_list, el.schoolname)
                count: count,
                semester_list: [],
                grade_list: [],
                semester: "",//学期
                school_list: [],
                //年级班级列表
                grade_class_list: [],
                //班级列表
                class_list: [],
                //学校id
                school_id: '',
                all_grades: [],
                all_classes: [],
                //年级列表
                order_by_grade: [],
                //班级列表
                order_by_class: [],
                current_class_id:'',
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.grade_list = cloud.grade_all_list();
                    grade_list = cloud.grade_list({school_id:this.user.fk_school_id});

                    for (var i = 0; i < this.grade_list.length; i++) {
                        var grade_id = this.grade_list[i].value;
                        this.grade_ids.push(grade_id);
                    }
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    })
                    this.grade_class_list = grade_list;
                    this.class_list = []
                    this.get_school_tbale_list();
                },
                //班级列表中年级下拉列表改变
                sel_change_grade: function (el,index) {
                    //根据年级改变班级跟着改变
                    this.grade_ids = [];
                    vm.p_school.fk_class_id = '';
                    if(el.value==''){
                        vm.p_school.fk_grade_id = '';
                        this.class_list = [];
                    }
                    var class_list = [];
                    for(var i=0;i<this.grade_class_list.length;i++){
                        if(this.grade_class_list[i].grade_id==el.value){
                            class_list = this.grade_class_list[i].class_list;
                            vm.p_school.fk_grade_id = this.grade_class_list[i].grade_id;
                            break;
                        }
                    }
                    this.order_by_class = this.filter_class(order_by_class);
                    this.deal_data(this.order_by_grade, this.order_by_class);
                    this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]})
                    vm.p_school.fk_class_id = "";
                },

                //班级下拉列表改变
                sel_class: function (el) {
                    this.current_class_id = el.value;
                    vm.p_school.fk_class_id = this.current_class_id;
                    this.order_by_class = this.filter_class(order_by_class);
                    this.deal_data(this.order_by_grade, this.order_by_class)
                },
                user_level: '',
                grade_ids: [],
                filter_undefined: filter_undefined,
                init: function () {
                    if (this.semester_list.length > 0) {
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
                    this.user_level = cloud.user_level();
                    this.get_school_tbale_list();
                },
                user:{},
                init_data: function () {
                    this.user = cloud.user_user();
                    this.semester_list = cloud.semester_all_list();
                    this.grade_list = cloud.grade_all_list();
                    grade_list = cloud.grade_list({school_id:this.user.fk_school_id});

                    for (var i = 0; i < this.grade_list.length; i++) {
                        var grade_id = this.grade_list[i].value;
                        this.grade_ids.push(grade_id);
                    }
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    })
                    this.grade_class_list = grade_list;

                },
                row_length: 0,
                p_school: {
                    district: "",//区县
                    fk_school_id: "",//学下id
                    fk_grade_id: "",//年级
                    fk_class_id: "", //班级id
                    level: 4,
                    school_name: ''//学校名称
                },

                //获取学校进度数据
                get_school_tbale_list: function () {
                    var semester_id = this.semester.split('|')[0];
                    layer.load(1, {shade:[0.3,'#121212']});
                    ajax_post(goal_api, {
                        fk_semester_id: Number(semester_id)
                    }, this)
                },
                //通过学校id搜索
                search_by_school_id: function () {
                    this.school_p.school = $("#func_list").val();
                    this.get_school_tbale_list();
                },
                deal_goal_data: function (data) {
                    layer.closeAll();
                    if (!data.data)
                        return;
                    if (data.data.school_cnt){
                        var student_school = cloud.student_count_in_semester({
                            dj: 4,
                            fk_xq_id: this.semester.split('|')[0]
                        });
                        student_school = merge_table(student_school, ["grade_id"], data.data.school_cnt, ["fk_grade_id"], "school_cnt");
                        sort_by(student_school, ["+grade_name"]);
                        this.order_by_grade = student_school;
                    }
                    if(data.data.school_class_cnt){
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

                                        class_count = merge_table(class_count, ["fk_bj_id"], school_class_cnt, ["fk_class_id"], "school_class_cnt", 0);
                                        sort_by(class_count, ["+njmc","+bjmc"]);

                                        order_by_class = JSON.parse(JSON.stringify(class_count))
                                        vm.order_by_class = class_count;
                                        vm.deal_data(vm.order_by_grade, class_count);
                                    }
                                });
                        })
                    }

                    vm.p_school.fk_grade_id  = "";
                    vm.p_school.fk_class_id = "";
                    data_center.scope("gps_grade", function (p) {
                        p.head_value = '请选择年级';
                    });
                    this.deal_data(this.order_by_grade, this.order_by_class);
                },
                //处理数据
                deal_data: function (grades, classes) {
                    this.order_by_grade = grades;
                    this.order_by_class = classes;
                    this.ring_diagram('tubiao_1', this.order_by_grade);
                    this.draw_bar('tubiao_2', this.filter_class(this.order_by_class));
                },

                filter_class: make_filter(function (line) {
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
                        var wcl = series_arr[i].school_cnt.wcl;
                        if(!wcl)
                            wcl = 0;
                        var completion_rate = parseFloat(wcl);
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
                //画柱状图
                draw_bar: function (div_id, table_data) {
                    var table_list_length = table_data.length;
                    var yAxis_arr = [];
                    var series_arr = [];
                    for (var i = table_list_length-1; i > -1; i--) {
                        var name = table_data[i].njmc + table_data[i].bjmc;
                        yAxis_arr.push(name);
                        var new_wcl = parseFloat(table_data[i].school_class_cnt.wcl);
                        if(!new_wcl)
                            new_wcl = 0;
                        series_arr.push(new_wcl);
                    }
                    ES.draw_bar(div_id,echarts,series_arr,yAxis_arr);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case goal_api:
                                this.deal_goal_data(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                        toastr.error(msg);
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