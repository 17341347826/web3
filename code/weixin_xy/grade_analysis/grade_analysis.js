/**
 * Created by uptang on 2017/5/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        C.Co("weixin_xy", "grade_analysis/grade_analysis", "css!"),
        C.Co("weixin_xy", "grade_analysis/grade_analysis", "html!")
    ],
    function ($, avalon, css, html) {
        avalon.filters.fil_grade = function (data) {
            if (!data || data == undefined || data == null || data == '') {
                data = '-'
            }
            return data;
        }

        var avalon_define = function (par) {
            var get_score_api = api.xy + "front/scoreAnalysis_scoreAnalysisByExamId.action";
            var vm = avalon.define({
                $id: "marks",
                project: {},
                //平均分集合
                average_grade: [],
                //科目名称集合（总分','语文','文数','英语','政治','历史','地理'）
                subject_name: [],
                //科目分数集合
                subject_score: [],
                //最高分集合
                max_grade_arr: [],
                //页面显示的分数列表
                score_list: [],
                init: function () {
                    this.project = JSON.parse(par.project);
                    this.get_score();
                },
                get_score: function () {
                    $.showLoading();
                    ajax_post(get_score_api, {exam_id: this.project.exam_id.toString()}, this)
                },
                deal_score: function (data) {
                    if (!data.data)
                        return;
                    var data_length = data.data.length;
                    var new_data = data.data;
                    this.average_grade = [];
                    this.subject_name = [];
                    this.score_list = [];
                    var rank = this.project.rank;
                    var avg_key = this.get_avg_key(rank);
                    var max_key = this.get_max_key(rank);
                    //需删除
                    // key='subject_school_avg';
                    //-----------------------------
                    for (var i = 0; i < data_length; i++) {
                        this.subject_name.push(new_data[i].subject_name);
                        //平均分
                        var average_grade = parseInt(new_data[i][avg_key]);
                        //最高分
                        var max_grade = parseInt(new_data[i][max_key]);
                        //我的位置
                        var subject_total = parseInt(new_data[i].subject_total_my);
                        //总分
                        var total = parseInt(new_data[i].subject_total_standard);
                        if (!new_data[i][avg_key]) {
                            average_grade = 0;
                        }
                        if (!new_data[i][max_key]) {
                            max_grade = 0;
                        }
                        if (!new_data[i].subject_total_my) {
                            subject_total = 0;
                        }
                        var avg_percent = this.get_percent(average_grade, total);
                        var sub_percent = this.get_percent(subject_total, total);
                        var max_percent = this.get_percent(max_grade, total);
                        this.average_grade.push(avg_percent);
                        this.subject_score.push(sub_percent);
                        this.max_grade_arr.push(max_percent);

                        if (new_data[i].subject_code == '') {
                            this.score_list.push(new_data[i])
                        }

                    }
                    for (var i = 0; i < data_length; i++) {
                        if (new_data[i].subject_code != '') {
                            this.score_list.push(new_data[i])
                        }
                    }
                    this.chart();
                },
                get_percent: function (grade, total) {
                    return parseFloat(grade / total);
                },
                chart: function () {
                    $('#container').highcharts({
                        chart: {
                            polar: true,
                            type: 'line'
                        },
                        title: {
                            text: '',
                            x: -80
                        },
                        pane: {
                            size: '84%'
                        },
                        credits: {
                            enabled: false
                        },
                        xAxis: {
                            categories: this.subject_name,
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
                            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:.f}%</b><br/>'
                        },
                        legend: {
                            align: 'center',
                            verticalAlign: 'bottom',
                            y: 0,
                            layout: 'horizontal'
                        },
                        series: [{
                            name: '平均分值',
                            data: this.average_grade,
                            pointPlacement: 'on'
                        }, {
                            name: '我的位置',
                            data: this.subject_score,
                            pointPlacement: 'on'
                        }, {
                            name: '最高分',
                            data: this.max_grade_arr,
                            pointPlacement: 'on'
                        },]
                    });
                },
                //获取平均分key值
                get_avg_key: function (rank) {
                    //1:省；2: 市；3: 区;4:校'：5.班
                    var key = '';
                    rank = parseInt(rank);
                    switch (rank) {
                        case 1:
                            key = '';
                            break;
                        case 2:
                            key = 'subject_city_avg';
                            break;
                        case 3:
                            key = '';
                            break;
                        case 4:
                            key = 'subject_school_avg';
                            break;
                        case 5:
                            key = 'subject_class_avg';
                            break;
                        default:
                            break;
                    }
                    return key;
                },
                //获取最大值key值
                get_max_key: function (rank) {
                    //1:省；2: 市；3: 区;4:校'：5.班
                    var key = '';
                    rank = parseInt(rank);
                    switch (rank) {
                        case 1:
                            key = '';
                            break;
                        case 2:
                            key = 'subject_city_max';
                            break;
                        case 3:
                            key = '';
                            break;
                        case 4:
                            key = 'subject_school_max';
                            break;
                        case 5:
                            key = 'subject_class_max';
                            break;
                        default:
                            break;
                    }
                    return key;
                },
                //项目查询
                projec_query: function () {
                    window.location = "#projec_query";
                },
                //跳转页面
                go_page:function (el,page) {
                    var exam_id = this.project.exam_id.toString();
                    var subject_code = el.subject_code.toString();
                    window.location = "#"+page+"?exam_id=" + exam_id + '&subject_code=' + subject_code;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if (status == 200) {
                        switch (cmd) {
                            case get_score_api:
                                this.deal_score(data);
                                break;
                            default:
                                break;

                        }
                    } else {

                    }
                    if (cmd == get_score_api) {
                        $.hideLoading();
                    }

                }
            });
            require(["jquery_weui",'highcharts'], function () {
                require(['highcharts-more'], function () {
                    require([ 'highcharts-zh_CN'], function () {
                        vm.init();
                    })
                })
            });

            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });