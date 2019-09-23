define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('evaluation_analysis', 'region_analysis_wd/region_analysis_wd', 'html!'),
        C.Co('evaluation_analysis', 'region_analysis_wd/region_analysis_wd', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        "highcharts",
        "echarts",
        C.CM("three_menu_module")
    ],
    function ($, avalon, layer, html, css, data_center, select_assembly, highcharts, echarts,three_menu_module) {

        var avalon_define = function (arg) {
            var echart = undefined;
            var sta_type = arg.sta_type;
            var vm = avalon.define({
                $id: "region_analysis_wd",
                html_display:sta_type,
                //学年学期列表
                semester_list: [],
                //年级列表
                grade_list: [],
                //学年学期下拉列表上是否显示初始值
                is_init_sel: true,
                city: "",
                grade_name: "",
                semester_name: "",
                //学年学期下拉列表选择的数据
                semester: '',
                //年级下拉列表选择数据
                gradeId: '',
                qy_hd_data: [],
                qy_zhpj_data: [],
                // select 选择的条件
                sel_change_semester: function (el) {
                    this.semester = el.value
                    this.semester_name = el.name
                    // this.query()

                },
                to_page:function (url) {
                    window.location.href = '#' + url;
                },
                sel_change_grade: function (el) {
                    this.gradeId = el.value
                    this.grade_name = el.name;
                    this.query()

                },
                init: function () {
                    if (this.is_init_sel && this.semester_list.length > 0) {
                        this.semester = this.semester_list[0].value;
                        this.semester_name = this.semester_list[0].name;
                    }
                    if (this.is_init_sel && this.grade_list.length > 0) {
                        this.gradeId = this.grade_list[0].value;
                        this.grade_name = this.grade_list[0].name;
                    }
                    this.query()

                },
                init_data: function () {
                    this.city = D("user.user.city");
                    this.semester_list = sort_by(cloud.semester_all_list(), ["-name"]);
                    this.grade_list = sort_by(cloud.grade_all_list(), ["+name"]);
                    console.log('111');
                },
                draw_line: function (echarts, div_id, type, data_arr) {
                    if (!data_arr || data_arr.length == 0)
                        return;

                    // 数据转换
                    var uni = unique_obj(data_arr, ["zb_mc"]);
                    sort_by(uni, ["zb_mc"])
                    var uni_sub = unique_obj(data_arr, ["qysx"]);
                    var full_table = [];

                    // 枚举所有指标+区域
                    uni.forEach(function (data) {
                        uni_sub.forEach(function (sb) {
                            full_table.push({
                                zb_mc: data.zb_mc,
                                qysx: sb.qysx,
                                detail: {rs: 0, zb_pjf: 0, zb_mc: data.zb_mc, qyxs: sb.qysx}
                            });
                        });
                    });

                    // 实际的数据与枚举的数据合并
                    merge_table(full_table, ["zb_mc", "qysx"], data_arr, ["zb_mc", "qysx"], "detail");

                    // 转换为echart支持的数据，根据区域数进行数组切片
                    var sources = array_2_data_source(full_table, uni_sub.length, "detail.rs", "zb_mc");

                    // 图表头
                    var full_region_list = ["区域"].concat(abstract(uni_sub, ["qysx"]));
                    echart  = echarts.init(document.getElementById(div_id));
                    var series = new Array(uni_sub.length).fill({type: 'bar'});

                    option = {
                        legend: {},
                        tooltip: {},
                        dataset: {
                            source: [
                                full_region_list,
                            ].concat(sources)
                        },
                        xAxis: {type: 'category'},
                        yAxis: {},
                        series: series
                    };

                    echart .setOption(option);
                },
                query: function () {
                    var self = this;
                    if(echart )echart.clear();
                    cloud.xqpj_qy_wd({
                        fk_grade_id: Number(vm.gradeId),
                        fk_semester_id: Number(vm.semester.split("|")[0]),
                        sta_mode: 5,
                        sta_type: Number(sta_type)
                    }, function (url, arg, data) {
                        self.qy_hd_data = data;
                        if (data.length == 0)
                            return;
                        if (!data.qysx_list) {
                            toastr.warning('请设置区域')
                            return;
                        }

                        data.qysx = data.qysx_list;
                        vm.draw_line(echarts, 'ra2', 'pj', data.qysx)
                    })
                },
            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/evaluation_analysis/e_a_charts.js'], function () {
                    vm.init();
                })
            });
            vm.init_data();
            return vm;
        };
        return {
            repaint:true,
            view: html,
            define: avalon_define
        }
    });