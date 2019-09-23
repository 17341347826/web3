define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_supervision', 'description_progress_school/description_progress_school', 'html!'),
        C.Co('evaluation_supervision', 'd_e_progress/d_e_progress', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        C.CM("three_menu_module"),
        C.CMF("formatUtil.js")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module, formatUtil) {
        var grade_list = [];
        var all_class_data = [];
        var avalon_define = function () {
            var data_api = api.api+"GrowthRecordBag/desc_eval_input_progress";
            var vm = avalon.define({
                $id: "description_progress_school",
                area_list: [],
                semester_list: [],
                grade_list: [],
                grade_id: "",
                semester_id: "",
                district_name: "",
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                school_id: "",
                //当前选择的年级
                current_grade_name: '',
                //市级表格数据
                city_table_list: [],
                //显示的行数
                row_length: 0,
                //当前区县表格数据
                area_table_list: [],
                //当前学校表格数据
                old_school_table_list: [],
                school_table_list: [],
                class_table_list:[],
                //校级的区县
                school_level_area: '',
                //当前的学校id
                current_school_id: '',

                current_grade: "",
                current_area: "",
                // 校级查看
                current_school: "",
                current_school_dist: "",
                //用户等级
                user_level: '',
                p_school:{
                    fk_grade_id:'',
                    school_name:'',
                    fk_class_id:'',
                    fk_school_id:''
                },
                class_list:[],
                filter_undefined: filter_undefined,

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
                filter: function (el, data) {
                    if (data == "")
                        return true;
                    if (el.grade == data) return true;
                    return false;
                },

                init: function () {

                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.current_semester = this.semester_list[0];
                    }
                    this.get_data();
                },
                get_data:function () {
                  ajax_post(data_api,{fk_semester_id:Number(this.current_semester.value.split('|')[0])},this)
                },
                user:{},
                init_data: function () {
                    this.user = cloud.user_user();
                    this.semester_list = cloud.semester_all_list();
                    this.user_level = cloud.user_level();
                    this.grade_list = cloud.grade_all_list();
                    grade_list = cloud.grade_list({school_id:this.user.fk_school_id});

                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    this.grade_list.unshift(obj);
                },
                class_change:function (el,index) {
                    this.p_school.fk_class_id = el.value;
                    // this.class_table_list = this.filter_class(all_class_data);
                    this.draw_bar('tubiao_2', this.filter_class(this.class_table_list))
                },
                count: count,
                grade_change: function (el,index) {
                    if (el.name == '全部') {
                        this.current_grade = '';
                        this.class_list = [];
                    } else {
                        this.current_grade = el.name;
                    }
                    this.p_school.fk_grade_id = el.value;
                    this.p_school.fk_class_id = '';
                    if(el.value!=''){
                        var class_list = [];
                        for(var i=0;i<grade_list.length;i++){
                            if(grade_list[i].grade_id==el.value){
                                class_list = grade_list[i].class_list;
                            }
                        }
                        this.class_list = any_2_select(class_list, {name: "class_name", value: ["class_id"]})
                    }
                    if(this.class_list.length!=0){
                        this.class_list.unshift({
                            name:'全部',
                            value:''
                        })
                    }

                    // this.class_table_list = this.filter_class(all_class_data);
                    this.draw_bar('tubiao_2', this.filter_class(this.class_table_list))

                },
                area_check: function (el) {
                    if (el.name == '全部') {
                        this.current_area = '';
                    } else {
                        this.current_area = el.name;
                    }
                    this.deal_data(this.filter_area(this.area_table_list), 'district', 'tubiao_2');
                },

                semester_change: function (el) {
                    this.current_semester = el;
                    this.p_school.fk_grade_id = '';
                    this.p_school.fk_class_id = '';
                    this.grade_list = cloud.grade_all_list();
                    grade_list = cloud.grade_list({school_id:this.user.fk_school_id});

                    var obj = {
                        name: '全部',
                        value: ''
                    };
                    this.grade_list.unshift(obj);
                    this.class_list = [];
                    this.get_data();
                },

                deal_data: function (data, type, div_id) {
                    var legend_arr = [];
                    var yAxis_arr = [];
                    var data_length = data.length;
                    var obj_legend = {}
                    for (var i = data_length - 1; i > -1; i--) {
                        var name = data[i].grade_name;
                        if (legend_arr.indexOf(name) == -1) {
                            legend_arr.unshift(name);
                        }
                        var y_name = '';
                        var sczb = 0;
                        if (type == 'district') {
                            y_name = data[i].district_name;
                            sczb = Number(data[i].wcl) ;
                        } else {
                            y_name = data[i].school_name;
                            sczb = Number(data[i].wcl);
                        }
                        if (yAxis_arr.indexOf(y_name) == -1) {
                            yAxis_arr.push(y_name);
                        }
                        if (!obj_legend[name]) {
                            obj_legend[name] = [];
                        }
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

                get_school_tbale_list:function (data) {
                    this.old_school_table_list = data;
                    this.school_table_list = data;
                    this.ring_diagram('tubiao_1',  this.school_table_list);
                },
                get_class_data:function (data) {
                    this.class_table_list = data;
                    all_class_data = JSON.parse(JSON.stringify(data));
                    this.draw_bar('tubiao_2', this.filter_class(this.class_table_list))
                },
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

                        var completion_rate = series_arr[i].school_cnt.wcl;
                        if(!completion_rate)
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
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case data_api:
                                if (!data.data)
                                    return;
                                if (data.data.school_cnt) {
                                    var student_school = cloud.student_count_in_semester({
                                        dj: 4,
                                        fk_xq_id: this.current_semester.value.split('|')[0]
                                    });
                                    student_school = merge_table(student_school, ["grade_id"], data.data.school_cnt, ["fk_grade_id"], "school_cnt");
                                    sort_by(student_school, ["+grade_name"]);
                                    this.get_school_tbale_list(student_school)
                                }
                                if(data.data.school_class_cnt){
                                    var class_count = [];
                                    class_load_count = 0;
                                    var school_class_cnt = data.data.school_class_cnt;
                                    this.grade_list.forEach(function (each) {
                                        if(each.value=='')
                                            return;
                                        cloud.sem_class_list({fk_nj_id: each.value, fk_xq_id: Number(vm.current_semester.value.split('|')[0])},
                                            function (url, arg, data) {
                                            class_load_count++;
                                            class_count = class_count.concat(data.list);
                                            if(class_load_count==vm.grade_list.length-1){

                                                class_count = merge_table(class_count, ["fk_bj_id"], school_class_cnt, ["fk_class_id"], "school_class_cnt", 0);
                                                sort_by(class_count, ["+njmc","+bjmc"]);
                                                vm.get_class_data(class_count)
                                            }
                                        });
                                    })


                                }
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