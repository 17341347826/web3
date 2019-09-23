define(['jquery',
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_result_management', 'graduation_results/graduation_results', 'html!'),
        C.Co('evaluation_result_management', 'graduation_results/graduation_results', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "echarts",
        C.CM("three_menu_module"),
        C.CMF("table/table.js"),
        "PCAS"
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module, table, PCAS) {
        //获取区县
        var api_get_area = api.api + "base/school/arealist.action";
        //获取学校
        var api_get_school = api.api + "base/school/schoolList.action";
        //获取学校下对应的年级
        var api_get_school_grade = api.api + "base/class/school_class.action";
        //查询等级设置个数
        var api_get_c_rank_count = api.api + "Indexmaintain/bypj_find_rank_set";
        //获取表头
        var api_get_table_head = api.api + "Indexmaintain/bybg_get_all_index_name";
        //获取数据
        var api_get_info = api.api + "Indexmaintain/bybg_operation_by_count_result_view";
        //获取图表显示数据
        var api_get_data = api.api + "GrowthRecordBag/by_evaluation_rank_situation";
        //导出
        var api_export_bybg = api.api + 'Indexmaintain/export_bybg_evaluate_result';

        var avalon_define = function () {
            var vm = avalon.define({
                $id: "graduation_results",
                exclude_rem: ["student_performance_score"],
                due_grade: "",
                p_show: false,
                highest_level: "",
                area_list: [],
                area: "",
                //年级
                school_list: [],
                schoolId: '',
                grade_list: [],
                class_list: [],
                //表头
                tbodyThead: [],
                data_list: [],
                //毕业数据
                get_info: [],
                school_id: "",
                is_init: false,
                class_id: '',
                //等级
                rank_count_arr: [],
                //学生学籍号
                student_num: '',
                //学生姓名
                student_name: '',
                form: {
                    //number	年级id
                    grade_id: '',
                    class_id: '',
                    //string	要筛选的评价等级A,B,C,D
                    rank: '',
                    //是否归档	number	1，已归档0，未归档
                    is_file: 1,
                    //是否发布	number	1，已发布，0未发布
                    is_publish: '',
                    //学生学号
                    stu_num: '',
                    //学生姓名
                    stu_name: '',
                    offset: 0,
                    rows: 10,
                    school_id: '',
                    district_id: ''
                },
                //分页
                // 数据总数
                count: "",
                /*总页数*/
                totalPage: "",
                // 计算分页
                totalPageArr: [],
                /*当前是第几页*/
                currentPage: 1,
                //跳转页码
                pageNo: "",
                //获取总页数+当前显示分页数组
                set_total_page: function (count) {
                    if (count == 0) {
                        this.totalPage = 1;
                        this.get_page_ary(this.currentPage, this.totalPage);
                    } else {
                        //向上取证
                        this.totalPage = Math.ceil(count / this.form.rows);
                        this.get_page_ary(this.currentPage, this.totalPage);
                    }
                },
                //计算分页数组(前提count>0)
                get_page_ary: function (c_page, t_page) {//当前页数，总页数
                    this.totalPageArr = [];
                    var p_ary = [];
                    if (t_page <= 5) {//总页数小于5
                        for (var i = 0; i < t_page; i++) {
                            p_ary[i] = i + 1;
                        }
                    } else if (c_page == 0 && t_page > 5) {
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = i + 1;
                        }
                    } else if (c_page + 2 >= t_page) {//
                        var base = t_page - 4;
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = base + i;
                        }
                    } else {//c_page+2<t_page
                        //显示的第一个页数
                        var base = Math.abs(c_page - 2) == 0 ? 1 : Math.abs(c_page - 2);
                        for (var i = 0; i < 5; i++) {
                            p_ary[i] = base + i;
                        }
                    }
                    this.totalPageArr = p_ary;
                },
                //当前页面跳转
                currentPageDate: function (num) {
                    this.currentPage = num;
                    this.form.offset = (num - 1) * this.form.rows;
                    this.is_change_rank = false;
                    //获取数据
                    ajax_post(api_get_info, this.form, this);
                },
                //序号改变
                set_index: function (idx, c_page) {
                    var index = idx + (c_page - 1) * this.form.rows;
                    return index;
                },
                //跳转操作
                pageNOSure: function (num) {
                    if (num < 1) {
                        layer.alert('请输入正确的页码', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    } else if (num > this.totalPage) {
                        layer.alert('超出总页数', {
                            closeBtn: 0
                            , anim: 4 //动画类型
                        });
                    } else {
                        this.currentPage = Math.ceil(num);
                        this.form.offset = (this.currentPage - 1) * this.form.rows;
                        //获取数据
                        this.is_change_rank = false;

                        ajax_post(api_get_info, this.form, this);
                    }
                },

                //分页
                //----------------------
                //用户等级
                user_level: '',
                //用户当前区县
                cur_area: '',
                //区县列表
                area_lists: [],
                //学校列表
                school_lists: [],
                //当前学校
                cur_school_id: '',
                //年级列表
                grade_lists: [],

                //班级列表
                class_lists: [],
                //当前班级
                cur_class_id: '',
                tubiao_data: [],
                //---------------------

                filter_school: function (data) {
                    var ret = [];
                    for (var x = 0; x < data.length; x++) {
                        if (data[x].value.indexOf(this.cur_area) >= 0) {
                            ret.push(data[x]);
                        }
                    }
                    return ret;
                },
                get_tubiao_data: function () {
                    ajax_post(api_get_data, {
                        class_id: this.cur_class_id,
                        grade_id: this.form.grade_id,
                        school_id: this.cur_school_id,
                        district_id: this.form.district_id
                    }, this);
                },
                get_data: function () {
                    ajax_post(api_get_c_rank_count, {c_gradeid: this.form.grade_id}, this);
                },
                cb: function () {
                    this.user_level = cloud.user_level();
                    if (this.user_level < 3) {
                        this.area_lists = cloud.area_list();
                    } else {
                        this.cur_area = cloud.user_district();
                    }
                    if (this.user_level >2) {
                        this.school_lists = this.filter_school(cloud.sel_school_list());
                    }
                    if(this.user_level>3){
                        this.cur_school_id = Number(cloud.user_school_id());
                    }
                    var grade_list = cloud.auto_grade_list();
                    this.grade_lists = sort_by(grade_list,['+grade_name']);
                    if (this.grade_lists.length == 0)
                        return;
                    this.form.grade_id = this.grade_lists[0].id;

                    var is_school_user =   cloud.is_school_user()
                    if(is_school_user){
                        this.class_lists = cloud.class_list({
                            fk_school_id: this.cur_school_id,
                            fk_grade_id: this.form.grade_id
                        });
                    }
                    this.get_tubiao_data();
                    this.get_data()

                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            //获取区县
                            case api_get_area:
                                this.complete_get_area(data);
                                break;
                            //获取学校
                            case api_get_school:
                                this.complete_get_school(data);
                                break;
                            //获取学校下对应的年级
                            case api_get_school_grade:
                                this.complete_get_school_grade(data);
                                break;
                            //获取图表数据
                            case api_get_data:
                                this.complete_api_get_data(data);
                                break;
                            //获取等级个数
                            case api_get_c_rank_count:
                                this.complete_get_c_rank_count(data);
                                break;
                            //获取表头
                            case api_get_table_head:
                                this.complete_get_table_head(data);
                                break;
                            //获取数据
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //获取区县
                complete_get_area: function (data) {
                    this.area_list = data.data.list;
                    this.area = this.area_list[0].schoolname;
                    //获取区县下对应的学校
                    ajax_post(api_get_school, {district: this.area}, this)

                },
                //获取区县对应的学校
                complete_get_school: function (data) {
                    this.school_list = data.data.list;
                    this.schoolId = this.school_list[0].id;
                    //请求年级
                    ajax_post(api_get_school_grade, {school_id: this.schoolId}, this)
                },
                //获取年级
                complete_get_school_grade: function (data) {
                    this.grade_list = data.data;
                    this.form.grade_id = this.grade_list[0].grade_id;
                    this.class_list = data.data[0].class_list;
                    // this.form.class_id=data.data[0].class_list[0].class_id;
                    //获取图表数据
                    ajax_post(api_get_data, {
                        class_id: this.form.class_id,
                        grade_id: this.form.grade_id,
                        school_id: this.schoolId
                    }, this);
                    //等级
                    ajax_post(api_get_c_rank_count, {c_gradeid: this.form.grade_id}, this);
                },
                //等级
                complete_get_c_rank_count: function (data) {
                    if (data.data && data.data.length != 0) {
                        this.rank_count_arr = data.data.list;
                    }
                    //表头
                    ajax_post(api_get_table_head, {
                        grade_id: this.form.grade_id,
                        school_id: this.schoolId,
                    }, this)
                },
                //获取图表数据
                complete_api_get_data: function (data) {
                    if (!data.data || !data.data.list || data.data.list.length == 0) {
                        this.tubiao_data = [];
                        this.get_info = [];
                        return;
                    }
                    this.tubiao_data = JSON.parse(JSON.stringify(data.data.list));
                    var tubiao_data = data.data.list.reverse();

                    var xAxis_arr = [];
                    var series_arr = [];
                    var all_count = 0;
                    for (var i = 0; i < tubiao_data.length; i++) {
                        all_count += tubiao_data[i].djrs;
                    }
                    for (var i = tubiao_data.length - 1; i > -1; i--) {
                        xAxis_arr.push(tubiao_data[i].dj);
                        var bfb = Number(tubiao_data[i].bfb);
                        bfb = bfb.toFixed(2)
                        series_arr.push(bfb)
                    }

                    this.draw_range_tubiao('range_tubiao', xAxis_arr, series_arr);
                },
                //画图标
                draw_range_tubiao: function (div_id, xAxis_arr, series_arr) {
                    var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];
                    var option = {
                        color: ['#3398DB'],
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                            }
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: xAxis_arr,
                                axisTick: {
                                    alignWithLabel: true
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                show: false
                            }
                        ],
                        series: [
                            {
                                name: '综合素质等级分布',
                                type: 'bar',
                                barWidth: '50%',
                                data: series_arr,
                                itemStyle: {
                                    normal: {
                                        label: {
                                            show: true,
                                            position: 'top',
                                            formatter: '{c}%'
                                        },
                                        color: function (params) {
                                            return color_arr[params.dataIndex % 5]
                                        }
                                    }
                                }
                            }
                        ]
                    };
                    var myChart = echarts.init(document.getElementById(div_id));
                    myChart.setOption(option);
                    myChart.resize();
                },
                //获取表头
                complete_get_table_head: function (data) {
                    if (!data.data || data.data.zb_name == '') {
                        this.get_info = [];
                        this.tbodyThead = [];
                        return;
                    }

                    this.tbodyThead = data.data.zb_name.split(',');
                    //结果查看
                    this.get_table_data();
                },
                //结果查看
                get_table_data: function () {
                    this.get_info = [];
                    //获取数据
                    this.is_change_rank = false;

                    ajax_post(api_get_info, this.form, this);
                },
                //得到数据
                complete_get_info: function (data) {
                    this.get_info = [];
                    this.get_info = [];
                    if(!data || !data.data || !data.data.list){
                        if(!this.is_change_rank)
                            this.tubiao_data = [];
                        toastr.warning(data.message)
                        return
                    }
                    if (data.data != null) {
                        var list = data.data.list;
                        var list_length = list.length;
                        for (var i = 0; i < list_length; i++) {
                            var index_value = [];
                            if (list[i].index_value == null || list[i].index_value == '') {
                                var table_title_length = this.tbodyThead.length;
                                for (var k = 0; k < table_title_length; k++) {
                                    var str = '';
                                    index_value.push(str);
                                }
                            } else {
                                index_value = list[i].index_value.split(',');
                                if (list[i].index_value[list[i].index_value.length - 1] == ",")
                                    index_value.pop();
                            }
                            list[i].values = index_value;
                        }
                        this.get_info = list;
                        this.count = data.data.count;
                        //获取总页数+当前显示分页数组
                        this.set_total_page(this.count);
                    }
                },
                //切换区县
                changeArea: function () {
                    this.form.offset = 0;
                    this.currentPage = 1;
                    this.cur_class_id = '';
                    this.form.class_id = '';
                    this.form.school_id = '';
                    this.cur_school_id = '';
                    this.district_id = this.cur_area;
                    var area = base_filter(cloud.area_list(), "district", this.district_id);
                    this.form.district_id = area[0].id;
                    this.school_lists = this.filter_school(cloud.sel_school_list());
                    // this.class_lists = cloud.class_list({
                    //     fk_school_id: this.cur_school_id,
                    //     fk_grade_id: this.form.grade_id
                    // });
                    this.form.rank = '';

                    this.get_tubiao_data();
                    this.get_data()
                },
                //切换学校
                changSchool: function () {
                    this.form.offset = 0;
                    this.currentPage = 1;
                    this.form.school_id = this.cur_school_id;
                    this.class_lists = cloud.class_list({
                        fk_school_id: this.cur_school_id,
                        fk_grade_id: this.form.grade_id
                    });
                    this.form.rank = '';
                    this.get_tubiao_data();
                    this.get_data()
                },
                //切换年级
                changGrade: function () {
                    this.tubiao_data = [];
                    this.get_info = [];
                    this.rank_count_arr = [];
                    this.form.offset = 0;
                    this.currentPage = 1;
                    if(this.cur_school_id!=''){
                        this.class_lists = cloud.class_list({
                            fk_school_id: this.cur_school_id,
                            fk_grade_id: this.form.grade_id
                        });
                        // this.get_tubiao_data();
                    }
                    this.get_tubiao_data();
                    this.get_data()
                },
                //切换班级
                changeClass: function () {
                    this.form.offset = 0;
                    this.currentPage = 1;
                    this.form.class_id = this.cur_class_id;
                    this.form.rank = '';
                    this.get_tubiao_data();
                    this.get_data()
                },
                is_change_rank:false,
                //切换等级
                rankChange: function () {
                    this.is_change_rank = true;
                    this.form.offset = 0;
                    this.currentPage = 1;
                    //等级
                    ajax_post(api_get_info, this.form, this);
                    //ajax_post(api_get_c_rank_count, {c_gradeid:this.form.grade_id}, this);
                },
                //模糊查询学籍号
                num_change: function () {
                    this.form.stu_num = '%' + this.student_num + '%';
                    if (!this.check_stu_code(this.student_num))
                        return;
                    //结果查看
                    this.get_table_data();
                },
                check_stu_code: function (code) {
                    var is_right_code = true;
                    var regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
                        regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;

                    if (regEn.test(code) || regCn.test(code)) {
                        toastr.warning('输入未校验');
                        is_right_code = false;
                    }
                    return is_right_code;
                },
                //模糊查询姓名
                name_change: function () {
                    this.form.stu_name = '%' + this.student_name + '%';
                    //结果查看
                    this.get_table_data();
                },
                //导出
                export: function () {
                    var token = sessionStorage.getItem('token');
                    var id = this.form.grade_id;
                    var class_id = this.form.class_id;

                    //http://127.0.0.1:8080/Indexmaintain/export_bybg_evaluate_result?
                    // grade_id=37&district_id=&school_id=&class_id=&rank=&token=f8e322b4d4474f6ba8ce35e20c35feb5
                    var url = api_export_bybg + '?grade_id=' + id + '&class_id=' + class_id + '&district_id=' + this.form.district_id + "&school_id=" + this.form.school_id + '&rank=' + this.form.rank + '&token=' + token;
                    window.open(url);
                },
                to_print: function () {
                    var post_obj = {
                        "grade_id": this.form.grade_id,
                        "class_id": this.form.class_id,
                        "rank": this.form.rank,
                        "is_file": 1,
                        "is_publish": '',
                        "stu_num": this.student_num,
                        "stu_name": this.student_name,
                        "offset": 0,
                        "rows": 99999,
                        "school_id": this.cur_school_id,
                        "district_id": this.form.district_id,
                        "current_page": 0
                    };
                    data_center.set_key('graduation_print_data', JSON.stringify(post_obj));
                    window.location = "#graduation_result_print"
                },
                //higchart
                get_charts_left: function (data) {
                    var self = this;
                    var series = [{
                        name: '综合素质等级分布',
                        colorByPoint: true,
                        data: data
                    }];
                    var categories = [{}];
                    this.charts(categories, series);
                },
                charts: function (categories, series) {

                    require(["highcharts_more"], function (highcharts_more) {

                        (function (b) {
                            "object" === typeof module && module.exports ? module.exports = b : b(Highcharts)
                        })(function (b) {
                            (function (a) {
                                a.createElement("link", {
                                    href: "https://fonts.googleapis.com/css?family\x3dSignika:400,700",
                                    rel: "stylesheet",
                                    type: "text/css"
                                }, null, document.getElementsByTagName("head")[0]);
                                a.wrap(a.Chart.prototype, "getContainer", function (a) {
                                    a.call(this);
                                    this.container.style.background = "url(http://www.highcharts.com/samples/graphics/sand.png)"
                                });
                                a.theme = {
                                    colors: "#ff6375 #0090ff #ffca63 #37ddbc #f45b5b #8085e9 #8d4654 #7798BF #aaeeee #ff0066 #eeaaee #55BF3B #DF5353  ".split(" "),
                                    chart: {backgroundColor: null, style: {fontFamily: "Signika, serif"}},
                                    title: {style: {color: "black", fontSize: "16px", fontWeight: "bold"}},
                                    subtitle: {style: {color: "black"}},
                                    tooltip: {borderWidth: 0},
                                    legend: {itemStyle: {fontWeight: "bold", fontSize: "13px"}},
                                    xAxis: {labels: {style: {color: "#6e6e70"}}},
                                    yAxis: {labels: {style: {color: "#6e6e70"}}},
                                    plotOptions: {
                                        series: {shadow: !0},
                                        candlestick: {lineColor: "#404048"},
                                        map: {shadow: !1}
                                    },
                                    navigator: {xAxis: {gridLineColor: "#D0D0D8"}},
                                    rangeSelector: {
                                        buttonTheme: {
                                            fill: "white", stroke: "#C0C0C8",
                                            "stroke-width": 1, states: {select: {fill: "#D0D0D8"}}
                                        }
                                    },
                                    scrollbar: {trackBorderColor: "#C0C0C8"},
                                    background2: "#E0E0E8"
                                };
                                a.setOptions(a.theme)
                            })(b)
                        });


                        Highcharts.chart('container', {
                            credits: {
                                text: '',
                            },
                            chart: {
                                type: 'column'
                            },
                            title: {
                                text: ''
                            },
                            subtitle: {
                                text: ''
                            },
                            xAxis: {
                                type: 'category'
                            },
                            yAxis: {
                                title: {
                                    text: ''
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y:.2f}%'
                                    }
                                }
                            },
                            tooltip: {
                                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> <br/>'
                            },
                            series: series,
                            drilldown: {
                                categories: categories
                            }
                        });
                    });

                },
            });
            vm.$watch('onReady', function () {
                vm.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define,
            repaint:true,
        }
    });