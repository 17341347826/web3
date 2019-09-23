define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('daily_evaluation_statistics', 'attribution_relationship/attribution_relationship', 'html!'),
        C.Co('daily_evaluation_statistics', 'daily_portrait_target/daily_portrait_target', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',

        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, three_menu_module) {
        var relationship_api = api.api + "GrowthRecordBag/term_eval_attribution_analysis";
        var last_index = -1;
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "attribution_relationship",
                //年级学年学期id
                current_grade_id: '',
                current_semester_id: '',
                //下拉列表
                grade_list: [],
                //学年学期列表
                semester_list: [],

                //正比
                direct_ratio:[],
                //反比
                inverse_ratio:[],
                //显著
                remarkable:[],
                //不显著(无明显影响)
                not_significant:[],

                user_level:'',
                //初始数据
                init: function () {
                    this.get_data();
                },
                get_data: function () {
                    // this.current_grade_id = 3;
                    // this.current_semester_id = 2;
                    ajax_post(relationship_api, {
                        fk_grade_id: Number(this.current_grade_id),
                        fk_semester_id: Number(this.current_semester_id)
                    }, this)
                },
                //初始前期数据
                init_data: function () {
                    user = cloud.user_user();
                    this.user_level = cloud.user_level();
                    this.grade_list = cloud.grade_all_list();
                    this.current_grade_id = this.grade_list[0].value;
                    if(this.user_level==6){
                        var user = cloud.user_user();
                        var grade_list = user.lead_class_list;
                        this.grade_list = any_2_select(grade_list, {name: "grade_name", value: ["grade_id"]});
                        this.current_grade_id = this.grade_list[0].value;
                    }
                    this.semester_list = cloud.semester_all_list();
                    this.current_semester_id = this.semester_list[0].value.split('|')[0];
                },
                deal_relation_data: function (data) {
                    if (!data.xysp_list || data.xysp_list.length==0)
                        return;
                    var arr_x = [];
                    var xysp_list = data.xysp_list;
                    var xysp_list_length = xysp_list.length;
                    var x_axis_arr = [];
                    for (var i = 0; i < xysp_list_length; i++) {
                        if (arr_x.indexOf(xysp_list[i].fz_qj) == -1)
                            arr_x.push(xysp_list[i].fz_qj)
                        var num = xysp_list[i].fz_qj.split('-')[0];
                        if (x_axis_arr.indexOf(Number(num)) == -1)
                            x_axis_arr.push(Number(num));
                    }
                    x_axis_arr.sort();
                    x_axis_arr.push(Number(x_axis_arr[x_axis_arr.length-1])+1)
                    var new_cnt = DailyAnaly.complate_data(xysp_list, ['zb_id', 'zb_mc'], 'fz_qj', arr_x, 0);
                    sort_by(new_cnt, ['+zb_id', '+status'])
                    var legend_arr = [];
                    var ser_obj = {};
                    var colors = ['#43be7a', '#2cd0aa', '#d0cb2c', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0', '#2c4fd0', '#cd2cd0', '#82d02c', '#4e7c1c'];
                    var color_index = 0;
                    for (var j = 0; j < new_cnt.length; j++) {
                        if (legend_arr.indexOf(new_cnt[j].zb_mc) == -1)
                            legend_arr.push(new_cnt[j].zb_mc)
                        var zb_id = new_cnt[j].zb_id;
                        if (!ser_obj[zb_id]) {
                            ser_obj[zb_id] = {
                                name: new_cnt[j].zb_mc,
                                type: 'line',
                                smooth: true,
                                itemStyle: {
                                    normal: {
                                        lineStyle: {
                                            color: colors[color_index]
                                        }
                                    }
                                },
                                data: []
                            }
                            color_index++;
                        }
                        ser_obj[zb_id].data.push(new_cnt[j].detail.zb_pjf)
                    }
                    var data_arr = [];
                    var slope_obj = {};//斜率
                    Object.keys(ser_obj).forEach(function (key) {

                        ser_obj[key].data.push(ser_obj[key].data[ser_obj[key].data.length-1])
                        data_arr.push(ser_obj[key])
                        var sum = 0;
                        for(var i=0;i<ser_obj[key].data.length-1;i++){
                            sum+=ser_obj[key].data[i+1]-ser_obj[key].data[i]
                        }
                        slope_obj[key] = {
                            name:ser_obj[key].name,
                            sum:sum
                        }

                    });
                    var self = this;
                    Object.keys(slope_obj).forEach(function (key) {
                        if(slope_obj[key].sum>50)
                            self.direct_ratio.push(slope_obj[key].name)
                        if(Math.abs(slope_obj[key].sum)>70)
                            self.remarkable.push(slope_obj[key].name)
                        if(slope_obj[key].sum<-50)
                            self.inverse_ratio.push(slope_obj[key].name)
                        if(Math.abs(slope_obj[key].sum)<50)
                            self.not_significant.push(slope_obj[key].name)
                    })
                    this.draw_line(legend_arr, x_axis_arr, data_arr, 'relation_img');
                },

                draw_line: function (legend_arr, x_axis_arr, data_arr, div_id) {
                    last_index = data_arr[0].data.length-1;
                    var option = {
                        legend: {
                            data: legend_arr,
                            orient:'vertical',
                            right:'50px',
                            top:'30px'
                        },
                        grid: {
                            right: '300px'
                        },
                        tooltip: {
                            trigger: 'axis',
                            formatter: function (params, ticket, callback) {
                                var text = '';
                                for (var i = 0; i < params.length; i++) {
                                    if(params[i].dataIndex==last_index)
                                        break;
                                    text += params[i].seriesName+':'+params[i].axisValue + '-' + (Number(params[i].axisValue) + 1) + ',得分:' + params[i].value+';'+'<br/>';
                                }
                                return text;
                            }
                        },
                        // toolbox: {
                        //     feature: {
                        //         saveAsImage: {}
                        //     }
                        // },
                        xAxis: [
                            {
                                // boundaryGap: false,
                                type: 'category',
                                axisTick: {
                                    alignWithLabel: true
                                },
                                name: '学业水平得分',

                                data: x_axis_arr
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                name: '影响因素得分',
                                min: 0,
                                max: 100,
                                position: 'left',
                                axisLabel: {
                                    formatter: '{value} '
                                }
                            }
                        ],
                        series: data_arr
                    };
                    var myChart = echarts.init(document.getElementById(div_id));
                    myChart.clear();
                    myChart.setOption(option);
                    myChart.resize();
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case relationship_api:
                                if (!data.data)
                                    return;
                                this.deal_relation_data(data.data);
                                break;

                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                sel_change_grade: function (el) {
                    this.current_grade_id = el.value;
                    this.get_data();
                },
                sel_change_semester: function (el) {
                    this.current_semester_id = el.value.split('|')[0];
                    this.get_data();
                },

            });
            vm.$watch('onReady', function () {
                require(['/Growth/code/daily_evaluation_statistics/daily_analy.js'], function () {
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
