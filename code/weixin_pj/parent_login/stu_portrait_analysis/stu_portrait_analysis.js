define(['jquery',
        C.CLF('avalon.js'),
        C.Co("weixin_pj", "parent_login/stu_portrait_analysis/stu_portrait_analysis", "css!"),
        C.Co("weixin_pj", "parent_login/stu_portrait_analysis/stu_portrait_analysis", "html!"),
        C.CMF("data_center.js"),
        "highcharts", "highcharts_more","highcharts-zh_CN","jquery-weui",
    ],
    function ($,avalon,  css,html, data_center,highcharts,highcharts_more,highcharts_zh,weui) {

        var avalon_define = function () {
            var analysis_api = api.api + "GrowthRecordBag/personal_longitudinal_analysis";
            var vm = avalon.define({
                $id: "stu_portrait_analysis",
                extend: {
                    fk_class_id: '',
                    fk_grade_id: '',
                    guid: '',
                    fk_semester_id:'',
                },
                //登录学生姓名
                stu_name: '',
                zhsz_zs:0,
                semester_count:0,
                no_data:false,
                init: function () {
                    var user_type = cloud.user_type();
                    var student = {};
                    if(user_type == 2){//学生
                        student = cloud.user_user();
                    }else if(user_type == 3){//家长
                        student =  cloud.user_user().student;
                    }else {
                        var stu_str = data_center.get_key('analysis_stu');
                        student = JSON.parse(stu_str);
                    }
                    this.stu_name = student.name;
                    this.extend.fk_grade_id = student.fk_grade_id;
                    this.extend.fk_class_id = student.fk_class_id;
                    this.extend.guid = student.guid;
                    this.get_analysis();
                },
                get_analysis: function () {
                    // layer.load(1, {shade:[0.3,'#121212']});
                    this.no_data = false
                    ajax_post(analysis_api, this.extend.$model, this);
                    // this.deal_analysis();
                },
                deal_analysis: function (data) {
                    if (!data.data)
                        return;
                    //评价维度
                    var eval_dimen_list = data.data.eval_dimen_list;

                    this.zhsz_zs = data.data.zhsz_zs.toFixed(2);
                    if(!this.zhsz_zs){
                        this.zhsz_zs = 0;
                    }
                    if (eval_dimen_list.length > 0)
                        this.deal_dimen(eval_dimen_list);

                    var eval_ele_list = data.data.eval_ele_list;

                    if (eval_ele_list != undefined && eval_ele_list.length > 0)
                        this.deal_factor(eval_ele_list);

                    var syn_list = data.data.syn_list;
                    this.semester_count = syn_list.length;
                    if (syn_list.length > 0)
                        this.deal_comprehensive(syn_list);

                    var eval_dimen_xq_list = data.data.eval_dimen_xq_list;
                    if (eval_dimen_xq_list.length > 0)
                        this.dimen_compare(eval_dimen_xq_list);

                    var eval_ele_xq_list = data.data.eval_ele_xq_list;
                    if (eval_ele_xq_list.length > 0)
                        this.factor_compare(eval_ele_xq_list);


                },
                //处理评价维度蜘蛛图数据
                deal_dimen: function (eval_dimen_list) {
                    var dimen_series = [];
                    var dimen_categories = [];
                    var dimen_list_length = eval_dimen_list.length;

                    var class_obj = {
                        name: '班级',
                        data: [],
                        pointPlacement: 'on'
                    };
                    var person_obj = {
                        name: '个人',
                        data: [],
                        pointPlacement: 'on'
                    };
                    var grade_obj = {
                        name: '年级',
                        data: [],
                        pointPlacement: 'on'
                    };

                    for (var i = 0; i < dimen_list_length; i++) {
                        var mc = eval_dimen_list[i].zb_mc;
                        var bj_zs = eval_dimen_list[i].bj_zs;
                        var nj_zs = eval_dimen_list[i].nj_zs;
                        var gr_zs = eval_dimen_list[i].gr_zs;
                        dimen_categories.push(mc);
                        class_obj.data.push(Number(bj_zs));
                        person_obj.data.push(Number(gr_zs))
                        grade_obj.data.push(Number(nj_zs));
                    }
                    dimen_series.push(class_obj);
                    dimen_series.push(person_obj);
                    dimen_series.push(grade_obj);
                    this.spider('dimension-spider', dimen_categories, dimen_series);
                },
                //处理维度蜘蛛图
                deal_factor: function (eval_ele_list) {
                    var factor_series = [];
                    var factor_categories = [];
                    var ele_list_length = eval_ele_list.length;
                    var class_obj = {
                        name: '班级',
                        data: [],
                        pointPlacement: 'on'
                    };
                    var person_obj = {
                        name: '个人',
                        data: [],
                        pointPlacement: 'on'
                    };
                    var grade_obj = {
                        name: '年级',
                        data: [],
                        pointPlacement: 'on'
                    };
                    for (var i = 0; i < ele_list_length; i++) {
                        var mc = eval_ele_list[i].zb_mc;
                        factor_categories.push(mc);
                        var bj_zs = eval_ele_list[i].bj_zs;
                        var nj_zs = eval_ele_list[i].nj_zs;
                        var gr_zs = eval_ele_list[i].gr_zs;
                        class_obj.data.push(Number(bj_zs));
                        person_obj.data.push(Number(gr_zs))
                        grade_obj.data.push(Number(nj_zs));
                    }
                    factor_series.push(class_obj);
                    factor_series.push(person_obj);
                    factor_series.push(grade_obj);
                    this.spider('factor-spider', factor_categories, factor_series);
                },
                //处理综合素质发展指数的对比情况（综合）
                deal_comprehensive: function (syn_list) {
                    var syn_list_length = syn_list.length;
                    var series_arr = [];
                    var categories = [];
                    var obj = {
                        name: '对比情况（综合）',
                        data: []
                    }
                    for (var i = 0; i < syn_list_length; i++) {
                        var zs = syn_list[i].zs;
                        obj.data.push(Number(zs));
                        var xq_mc = syn_list[i].xq_mc;
                        categories.push(xq_mc);
                    }
                    series_arr.push(obj);
                    this.broken_line('compare1', '各学期综合素质发展指数的对比情况（综合）',
                        '指数', categories, series_arr);
                },
                //各学期综合素质发展指数的对比情况（评价维度）
                dimen_compare: function (eval_dimen_xq_list) {
                    var categories_arr = [];
                    var series_arr = [];
                    var dimen_length = eval_dimen_xq_list.length;
                    var obj = {};
                    for (var i = 0; i < dimen_length; i++) {
                        var yjzb_mc = eval_dimen_xq_list[i].yjzb_mc;
                        categories_arr.push(yjzb_mc);
                        var xq_mc = eval_dimen_xq_list[i].xq_mc;
                        if (!obj[xq_mc]) {
                            obj[xq_mc] = [];
                        }
                        var zs = eval_dimen_xq_list[i].zs;
                        obj[xq_mc].push(Number(zs))
                    }
                    for (var key in obj) {
                        var series_obj = {
                            name: key,
                            data: obj[key]
                        }
                        series_arr.push(series_obj);
                    }
                    this.bar_graph('dimension-compare',
                        '各学期综合素质发展指数的对比情况（评价维度）',
                        '发展指数', categories_arr, series_arr);
                },
                //各学期综合素质发展指数的对比情况（评价要素）
                factor_compare: function (eval_ele_xq_list) {
                    var categories_arr = [];
                    var series_arr = [];
                    var factor_length = eval_ele_xq_list.length;
                    var obj = {};
                    for (var i = 0; i < factor_length; i++) {
                        var ejzb_mc = eval_ele_xq_list[i].ejzb_mc;
                        categories_arr.push(ejzb_mc);
                        var xq_mc = eval_ele_xq_list[i].xq_mc;
                        if (!obj[xq_mc]) {
                            obj[xq_mc] = [];
                        }
                        var zs = eval_ele_xq_list[i].zs;
                        obj[xq_mc].push(Number(zs))
                    }
                    for (var key in obj) {
                        var series_obj = {
                            name: key,
                            data: obj[key]
                        }
                        series_arr.push(series_obj);
                    }
                    this.bar_graph('factor-compare',
                        '各学期综合素质发展指数的对比情况（评价要素）',
                        '发展指数', categories_arr, series_arr);
                },
                /**
                 *
                 * @param id 容器id
                 * @param categories_arr 横坐标显示项
                 * @param series_arr 数据存储
                 */
                spider: function (id, categories_arr, series_arr) {
                    var chart = Highcharts.chart(id, {
                        chart: {
                            polar: true,
                            type: 'line'
                        },
                        title: {
                            text: '',
                            x: -80
                        },
                        credits: {
                            enabled: false
                        },
                        pane: {
                            size: '80%'
                        },
                        xAxis: {
                            categories: categories_arr,
                            tickmarkPlacement: 'on',
                            lineWidth: 0
                        },
                        yAxis: {
                            gridLineInterpolation: 'polygon',
                            lineWidth: 0,
                            min: 0
                        },
                        tooltip: {
                            shared: true,
                            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}</b><br/>'
                        },
                        legend: {
                            align: 'center',
                            verticalAlign: 'top',
                            y: 70
                        },
                        series: series_arr
                    });
                },
                /**
                 *
                 * @param id 容器id
                 * @param title 折线图标题
                 * @param y_title y轴刻度名
                 * @param categories_arr 横坐标项
                 * @param series_arr 数据集合
                 */
                broken_line: function (id, title, y_title, categories_arr, series_arr) {
                    var chart = Highcharts.chart(id, {
                        chart: {
                            type: 'line'
                        },
                        title: {
                            text: title
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            categories: categories_arr
                        },
                        yAxis: {
                            title: {
                                text: y_title
                            }
                        },
                        plotOptions: {
                            line: {
                                dataLabels: {
                                    enabled: true
                                },
                                enableMouseTracking: false
                            }
                        },
                        series: series_arr
                    });
                },
                /**
                 *
                 * @param id 容器id
                 * @param title 标题
                 * @param y_title y轴刻度名
                 * @param categories_arr 横坐标项
                 * @param series_arr 数据集合
                 */
                bar_graph: function (id, title, y_title, categories_arr, series_arr) {
                    var chart = Highcharts.chart(id, {
                        chart: {
                            type: 'column'
                        },
                        title: {
                            text: title
                        },
                        credits: {
                            enabled: false
                        },

                        xAxis: {
                            categories: categories_arr,
                            crosshair: true
                        },
                        yAxis: {
                            min: 0,
                            title: {
                                text: y_title
                            }
                        },
                        plotOptions: {
                            column: {
                                borderWidth: 0
                            }
                        },
                        series: series_arr
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case analysis_api:
                                this.deal_analysis(data);
                                break;
                            default:
                                break;
                        }
                    } else {
                    }
                    if (cmd == analysis_api) {
                        this.no_data = true;
                    }
                }

            });
            require(['highcharts'], function () {
                require(['highcharts_more'], function () {
                    require(['highcharts-zh_CN'], function () {
                        vm.init();
                    })
                })
            });
            // vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
