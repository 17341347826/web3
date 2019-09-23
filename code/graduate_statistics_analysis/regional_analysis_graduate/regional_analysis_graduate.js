define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'regional_analysis_graduate/regional_analysis_graduate', 'html!'),
        C.Co('graduate_statistics_analysis', 'regional_analysis_graduate/regional_analysis_graduate', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/regional_analysis_graduation";

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "regional_analysis_graduate",
                fk_grade_id:'',
                grade_name:'',
                city_name:'',
                district_name:'',
                school_name:'',
                init: function () {
                    this.get_data()
                },
                get_data:function () {
                  ajax_post(msg_api,{
                      fk_grade_id:this.fk_grade_id
                  },this)
                },
                //初始前期数据
                init_data: function () {
                    this.grade_list = cloud.grade_all_list();
                    this.fk_grade_id = this.grade_list[0].value;
                    this.grade_name = this.grade_list[0].name;

                    var user = cloud.user_user();
                    this.city_name = user.city;
                    if(cloud.user_level() >2){
                        this.district_name = user.district;
                    }
                    if(cloud.user_level() >3){
                        this.school_name = user.school_name;
                    }
                },
                sel_change_grade:function (el,index) {
                    this.fk_grade_id = el.value;
                    this.grade_name = el.name;
                    this.get_data();
                },
                //页面切换
                gra_change:function(num){
                    if(num == 2){
                        window.location = '#region_index_graduate_d';
                    }
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
                draw_img:function (obj) {
                    var myChart = echarts.init(document.getElementById(obj.div));
                    myChart.clear()
                    var series_arr = [];
                    for(var i=0;i<obj.legend_arr.length;i++){
                        var key = obj.legend_arr[i];
                        var new_obj = {
                            name: key,
                            data: obj.rank_obj[key],
                            type: 'bar',
                            itemStyle: {
                                normal: {
                                    label: {
                                        show: true,
                                        position: 'top',
                                        textStyle: {
                                            color: 'green'
                                        }
                                    }
                                }
                            }
                        }
                        series_arr.push(new_obj)
                    }
                    var option = {
                        color: ['#fee02b', '#059fd6','red','green'],
                        legend: {
                            data:obj.legend_arr
                        },
                        xAxis: {
                            type: 'category',
                            data: obj.x_axis,
                            show:false
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series:series_arr
                    };

                    myChart.setOption(option);
                    myChart.resize();
                },
                is_empty_data:false,
                //处理获取的页面数据
                deal_msg: function (data) {
                    if (!data.data)
                        return;
                    this.is_empty_data = false;
                    var qysx_length = data.data.qysx.length;
                    if(qysx_length==0){
                        this.is_empty_data = true;
                        return;
                    }

                    var legend_arr = [];
                    var rank_obj = {};
                    var x_axis = [];
                    for(var i=0;i<qysx_length;i++){
                        var qysx = data.data.qysx[i].qysx;
                        if(legend_arr.indexOf(qysx)==-1){
                            legend_arr.push(qysx)
                        }
                        var rank = data.data.qysx[i].dj;
                        if(x_axis.indexOf(rank)==-1){
                            x_axis.push(rank);
                        }
                        if(!rank_obj.hasOwnProperty(qysx)){
                            rank_obj[qysx] = [];
                        }
                        rank_obj[qysx].push(data.data.qysx[i].bl);
                    }
                    var obj = {
                        "legend_arr":legend_arr,
                        "rank_obj":rank_obj,
                        "x_axis":x_axis,
                        "div":'img-bar'
                    }
                    this.draw_img(obj);
                    // this.draw_img2(obj);
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
