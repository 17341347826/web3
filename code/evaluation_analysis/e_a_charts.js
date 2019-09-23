var EA = {
    draw_bar: function (echarts, div_id, type, data_arr) {
        //处理数据
        var myChart = echarts.init(document.getElementById(div_id));
        if (!data_arr || data_arr.length == 0)
            return;
        var legend = {
            data: [],
            x: 'center', // 'center' | 'left' | {number},
            y: 'bottom',// 'center' | 'bottom' | {number},
            icon: 'circle'
        };
        var title_name = '';
        var xAxis_data = [];
        var series_arr = [];

        if (type == 'sex') {
            legend.data = [];
            legend.data = ['男', '女'];
            title_name = '男、女学生比较';
            var obj_sex = {

            };
            for (var i = 0; i < data_arr.length; i++) {
                var dj = data_arr[i].dj;
                if (xAxis_data.indexOf(dj) == -1) {
                    xAxis_data.push(dj);
                }
                var obj = {};
                if (!obj.data) {
                    obj.data = [];
                }
                if (!obj_sex[data_arr[i].xb]) {
                    obj_sex[data_arr[i].xb] = {};
                }
                if (!obj_sex[data_arr[i].xb].data) {
                    obj_sex[data_arr[i].xb].data = [];
                }
                obj_sex[data_arr[i].xb].data.push(Number(data_arr[i].bfb));
                var xb = data_arr[i].xb;
                if (xb == 1) {
                    obj_sex[data_arr[i].xb].name = '男';
                } else {
                    obj_sex[data_arr[i].xb].name = '女';
                }

                obj_sex[data_arr[i].xb].type = 'bar';
            }
            for (var key in obj_sex) {
                obj_sex[key].itemStyle = {
                    normal: {
                        label:{
                            show:true,
                            position:'top',
                            color:'black',
                            formatter:function (params) {
                                return params.data +'%';
                            }
                        }
                    }
                }
                series_arr.push(obj_sex[key]);
            }
        }
        if (type == 'js') {
            title_name = '寄宿、走读学生比较';
            var obj_js = {};
            legend.data = [];
            for (var i = 0; i < data_arr.length; i++) {
                var zsqk = data_arr[i].zsqk;
                if (legend.data.indexOf(zsqk) == -1) {
                    legend.data.push(zsqk);
                }
                if (xAxis_data.indexOf(data_arr[i].dj) == -1) {
                    xAxis_data.push(data_arr[i].dj);
                }
                if (!obj_js[zsqk]) {
                    obj_js[zsqk] = {};
                }
                if (!obj_js[zsqk].data) {
                    obj_js[zsqk].data = [];
                }
                obj_js[zsqk].data.push(Number(data_arr[i].bfb));
                obj_js[zsqk].name = data_arr[i].zsqk;
                obj_js[zsqk].type = 'bar';
            }
            for (var key in obj_js) {
                obj_js[key].itemStyle = {
                    normal: {
                        label:{
                            show:true,
                            position:'top',
                            color:'black',
                            formatter:function (params) {
                                return params.data;
                            }
                        }
                    }
                }
                series_arr.push(obj_js[key]);
            }
        }
        if (type == 'pj') {
            title_name = '学生综合素质评价';
            var obj_pj = {};
            legend.data = [];
            for (var i = 0; i < data_arr.length; i++) {
                var qy = data_arr[i].qy;
                if (legend.data.indexOf(qy) == -1) {
                    legend.data.push(qy);
                }
                if (xAxis_data.indexOf(data_arr[i].dj) == -1) {
                    xAxis_data.push(data_arr[i].dj);
                }
                if (!obj_pj[qy]) {
                    obj_pj[qy] = {};
                }
                if (!obj_pj[qy].data) {
                    obj_pj[qy].data = [];
                }
                obj_pj[qy].data.push(Number(data_arr[i].bfb));
                obj_pj[qy].name = data_arr[i].qy;
                obj_pj[qy].type = 'bar';
            }
            for (var key in obj_pj) {
                obj_pj[key].itemStyle = {
                    normal: {
                        label:{
                            show:true,
                            position:'top',
                            color:'black',
                            formatter:function (params) {
                                return params.data;
                            }
                        }
                    }
                }
                series_arr.push(obj_pj[key]);
            }
        }
        var option = {
            title: {
                text: title_name,
                x: 'center',
                y: 'top',
                textStyle: {
                    color: '#777777'
                }
            },
            color: ['#fee02b', '#059fd6','red','green'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                show: false
            },
            legend: legend,
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center'
            },
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    axisTick: {show: false},
                    data: xAxis_data
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        show: true,
                        interval: 'auto',
                        formatter: '{value} %'
                    },
                    show: true
                }
            ],
            series: series_arr
        };
        myChart.setOption(option);

        //----------------------------------


    },
    draw_line:function (echarts, div_id, type, data_arr) {
        if(!data_arr || data_arr.length==0)
            return;
        var myChart = echarts.init(document.getElementById(div_id));
        var qy_arr = [];
        var series_data = [];
        for(var i=0;i<data_arr.length;i++){
            var qysx = data_arr[i].qysx;
            qy_arr.push(qysx);
            var rjsl = data_arr[i].rjsl;
            series_data.push(rjsl);
        }
        var option = {
            xAxis: {
                type: 'category',
                data: qy_arr
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: series_data,
                type: 'line',
                smooth: true
            }]
        };
        myChart.setOption(option);

    }
}