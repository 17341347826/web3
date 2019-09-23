define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'daily_award_school/daily_award_school', 'html!'),
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
        var msg_api = api.api + "GrowthRecordBag/award_winning_situation_sta_analysis";
        var avalon_define = function () {
            var ori_grade_list = [];
            var vm = avalon.define({
                $id: "daily_award_school",
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
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value;
                    this.get_data();
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
                    this.school_p.fk_grade_id = el.value;
                    this.deal_data(this.filter_school(this.order_by_grade),this.filter_class(this.order_by_class))

                },
                html_display:1,
                //维度，要素，综合等级切换
                presentation_change:function (num) {
                    var dis = num;
                    switch (dis){
                        case 1:
                            break;
                        case 2:
                            this.to_page("#daily_comprehensive_practice_wd?sta_type=2&module_type=3&page=school");
                            break;
                        case 3:
                            this.to_page("#daily_comprehensive_practice_wd?sta_type=3&module_type=3&page=school");
                            break;
                        default:
                            break;
                    }
                },

                //年级列表
                order_by_grade: [],
                //班级列表
                order_by_class: [],
                //
                grade_all: [],
                //用户等级
                user_level:'',
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
                filters_undefined:filter_undefined,

                init_data: function () {
                    this.semester_list = cloud.semester_all_list();
                    ori_grade_list = cloud.grade_list();
                    var is_teacher = cloud.is_teacher()
                    if(is_teacher){
                        ori_grade_list = cloud.auto_grade_list();
                    }
                    this.grade_list = any_2_select(ori_grade_list, {name: "grade_name", value: ["grade_id"]});
                    grade_ids = [];
                    for(var i=0;i<this.grade_list.length;i++){
                        grade_ids.push(Number(this.grade_list[i].value))
                    }
                    this.grade_list.unshift({
                        name:'全部',
                        value:''
                    })
                    this.grade_all = abstract(ori_grade_list, "grade_id");
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
                        var grade_name = ''
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
                            new_wcl = Number(table_data[i].school_cnt.pj_df);
                        }
                        if(type=='class'){
                            new_wcl = Number(table_data[i].school_class_cnt.pj_df);
                        }
                        if(!new_wcl)
                            new_wcl = 0;
                        new_wcl = new_wcl.toFixed(2);
                        series_arr.push(new_wcl);
                    }
                    this.draw_bar_img(div_id,series_arr,yAxis_arr)
                },
                to_page:function (url) {
                    window.location.href = '#'+url;
                },
                draw_bar_img:function (div_id,series_arr,yAxis_arr) {
                    ES.set_class_img_height(series_arr,div_id);
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
                deal_cnt: function (cnt) {
                    var arr = []
                    for (var i = 0; i < cnt.length; i++) {
                        for (var j = 0; j < cnt[i].sub_list.length; j++) {
                            sort_by(cnt[i].sub_list, ['+jbmc'])
                            var jbmc = cnt[i].sub_list[j].jbmc;
                            if (arr.indexOf(jbmc) == -1) {
                                arr.push(jbmc);
                            }
                        }
                    }
                    arr.sort();
                    for (var i = 0; i < cnt.length; i++) {
                        cnt[i].sub_list = sort_by(cnt[i].sub_list,'jbmc');
                        if (cnt[i].sub_list.length < arr.length) {
                            var sub_list = cnt[i].sub_list;
                            for (var k = 0; k < arr.length; k++) {
                                var key = arr[k];
                                var obj = {
                                    jbmc: key,
                                    rj_cl: 0
                                }
                                if (!sub_list[k] || sub_list[k].jbmc != key) {
                                    cnt[i].sub_list.splice(k, 0, obj)
                                }
                            }
                        }
                    }
                    return cnt;
                },
                get_default: function (c_data) {
                    var obj = [];
                    for (var key in c_data) {
                        obj[key] = 0;
                        if (key == 'sub_list') {
                            obj[key] = [];
                            for (var i = 0; i < c_data[key].length; i++) {
                                var jbmc = c_data[key][i].jbmc;
                                var sub_obj = {};
                                sub_obj.jbmc = jbmc;
                                sub_obj.rj_cl = 0;
                                obj[key].push(sub_obj);
                            }
                        }
                    }
                    return obj;
                },
                get_title_arr:function (data) {
                    var title_arr = [];
                    for(var i=0;i<data.length;i++){
                        if(data[i].detail.sub_list!=0&&data[i].detail.sub_list.length>0){
                            title_arr = data[i].detail.sub_list;
                            break;
                        }
                    }
                    return title_arr;
                },
                deal_msg:function (data) {
                    if (!data.data)
                        return;
                    if (data.data.school_cnt) {
                        if(data.data.school_cnt.length==0){
                            this.order_by_grade = [];
                            this.all_grades = [];
                            return;
                        }
                        var school_cnt = this.deal_cnt(data.data.school_cnt);
                        var obj = this.get_default(school_cnt[0]);
                        var student_school = cloud.student_count_in_semester({
                            dj: 4,
                            fk_xq_id: this.semester.split('|')[0]
                        });
                        student_school = merge_table(student_school, ["grade_id"], data.data.school_cnt, ["fk_grade_id"], "school_cnt",obj);
                        sort_by(student_school, ["+grade_name"]);
                        var new_arr = [];
                        for(var k=0;k<student_school.length;k++){
                            if(grade_ids.indexOf(student_school[k].grade_id)!=-1){
                                new_arr.push(student_school[k])
                            }
                        }
                        this.order_by_grade = new_arr;
                        this.all_grades = new_arr;
                    }
                    if (data.data.school_class_cnt) {
                        var class_count = [];
                        class_load_count = 0;

                        var school_class_cnt = this.deal_cnt(data.data.school_class_cnt);
                        var school_obj = this.get_default(school_cnt[0]);

                        this.grade_list.forEach(function (each) {
                            if(each.value=='')
                                return;
                            cloud.sem_class_list({fk_nj_id: each.value, fk_xq_id: Number(vm.semester.split('|')[0])},
                                function (url, arg, data) {
                                    class_load_count++;
                                    class_count = class_count.concat(data.list);
                                    if(class_load_count==vm.grade_list.length-1){
                                        class_count = merge_table(class_count, ["fk_nj_id","fk_bj_id"], school_class_cnt, ["fk_grade_id","fk_class_id"], "school_class_cnt",school_obj);
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