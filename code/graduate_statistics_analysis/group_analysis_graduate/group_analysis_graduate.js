define([
        C.CLF('avalon.js'),
        'layer',
        C.Co('graduate_statistics_analysis', 'group_analysis_graduate/group_analysis_graduate', 'html!'),
        C.Co('graduate_statistics_analysis', 'regional_analysis_graduate/regional_analysis_graduate', 'css!'),
        C.Co('graduate_statistics_analysis', 'group_analysis_graduate/group_analysis_graduate', 'css!'),
        C.CMF("data_center.js"),
        C.CM("select_assembly"),
        'echarts',
        "select2",
        C.CM("three_menu_module")
    ],
    function (avalon, layer, html, css, css2,data_center, select_assembly, echarts, select2, three_menu_module) {
        var msg_api = api.api + "GrowthRecordBag/group_analysis_graduation";

        var avalon_define = function () {

            var vm = avalon.define({
                $id: "group_analysis_graduate",
                fk_grade_id:'',
                grade_name:'',
                city_name:'',
                district_name:'',
                school_name:'',
                grade_list:'',
                init: function () {
                    this.get_data()
                },
                get_data:function () {
                    ajax_post(msg_api,{
                        fk_grade_id:Number(this.fk_grade_id),
                    },this)
                },
                //初始前期数据
                init_data: function () {
                    // this.grade_list = cloud.grade_list_graduation();
                    this.grade_list = sort_by(cloud.grade_all_list(),['+name']);
                    if(this.grade_list.length>0){
                        this.fk_grade_id = this.grade_list[0].value;
                        this.grade_name = this.grade_list[0].name;
                    }
                    var user = cloud.user_user();
                    this.city_name = user.city;
                    if(cloud.user_level() >2){
                        this.district_name = user.district;
                    }
                    if(cloud.user_level() >3){
                        this.school_name = user.school_name;
                    }
                    // this.init();
                },
                sel_change_grade:function (el,index) {
                    this.fk_grade_id = el.value;
                    this.grade_name = el.name;
                    this.get_data();
                },

                //页面切换
                gra_change:function(num){
                    if(num == 2){//群体分析-指标维度分析-毕业评价分析-评价维度
                        window.location = '#group_index_graduate_d';
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
                            data: obj.x_axis
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series:series_arr
                    };

                    myChart.setOption(option);
                    myChart.resize();
                },
                is_empty_sex:false,
                is_empty_zsqk:false,
                //处理获取的页面数据
                deal_msg: function (data) {
                    if (!data.data)
                        return;
                    this.is_empty_sex = false;
                    this.is_empty_zsqk = false;
                    var sex_length = data.data.sex.length;
                    var zsqk_length = data.data.zsqk.length;
                    if(sex_length==0)
                        this.is_empty_sex = true;
                    if(zsqk_length==0)
                        this.is_empty_zsqk = true;
                    if(sex_length!=0){
                        var legend_arr = [];
                        var rank_obj = {}
                        var x_axis = [];
                        for(var i=0;i<sex_length;i++){
                            var sex = data.data.sex[i].sex;
                            if(legend_arr.indexOf(sex)==-1){
                                legend_arr.push(sex)
                            }
                            var rank = data.data.sex[i].dj;
                            if(x_axis.indexOf(rank)==-1){
                                x_axis.push(rank);
                            }
                            if(!rank_obj.hasOwnProperty(sex)){
                                rank_obj[sex] = [];
                            }
                            rank_obj[sex].push(data.data.sex[i].bl);
                        }
                        var obj = {
                            "legend_arr":legend_arr,
                            "rank_obj":rank_obj,
                            "x_axis":x_axis,
                            "div":'img-sex'
                        }
                        this.draw_img(obj);
                    }
                    if(zsqk_length!=0){
                        var legend_arr2 = [];
                        var rank_obj2 = {}
                        var x_axis2 = [];
                        for(var i=0;i<zsqk_length;i++){
                            var zsqk = data.data.zsqk[i].zsqk;
                            if(legend_arr2.indexOf(zsqk)==-1){
                                legend_arr2.push(zsqk)
                            }
                            var dj = data.data.zsqk[i].dj;
                            if(x_axis2.indexOf(dj)==-1){
                                x_axis2.push(dj);
                            }
                            if(!rank_obj2.hasOwnProperty(zsqk)){
                                rank_obj2[zsqk] = [];
                            }
                            rank_obj2[zsqk].push(data.data.zsqk[i].bl);
                        }
                        var obj2 = {
                            "legend_arr":legend_arr2,
                            "rank_obj":rank_obj2,
                            "x_axis":x_axis2,
                            "div":'img-zs'
                        }
                        this.draw_img(obj2);
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
