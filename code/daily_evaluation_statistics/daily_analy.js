/**
 * Created by Administrator on 2018/9/11.
 */
var DailyAnaly = {
    draw_bar:function (div_id,echarts,series_arr,yAxis_arr,legend_arr,user_level) {
        var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];
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
            legend: {
                data: legend_arr
            },
            color:color_arr,
            grid: {
                left: '3%',
                right: '4%',
                // bottom: '10%',
                top:'80px',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01],
                show:false,
                max:10
            },
            yAxis: {
                "show" : true,
                type: 'category',
                data: yAxis_arr,
                axisLabel: {
                    color: "#000",
                    margin: 20,
                    interval: 0,
                    formatter: function(value) {
                        if (value.length > 4) {
                            return value.substring(0, 4) + "...";
                        } else {
                            return value;
                        }
                    }
                },
                // "axisLine":{       //y轴
                //     "show":false
                // },
                // "axisTick":{       //y轴刻度线
                //     "show":false
                // },
                // "splitLine": {     //网格线
                //     "show": false
                // }
            },
            series: series_arr

        };
        this.set_more_bar_height(legend_arr.length,yAxis_arr.length,div_id,user_level);
        var myChart = echarts.init(document.getElementById(div_id));
        myChart.clear();
        myChart.setOption(option);
        myChart.resize();
    },
    set_more_bar_height:function (x,y,div_id,user_level) {
        var each_height = 45
        if(user_level>3)
            each_height = 60;
        var height = x*y*each_height+40+'px';
        var tubiao = document.getElementById(div_id);
        tubiao.style.height = height;
    },
    //合并数组数据
    complate_data: function (data, key_arr,key2,arr,def) {
        var data_list = abstract_obj(data,key_arr);
        var uni_data = unique_obj(data_list, key_arr);
        var fl = [];
        uni_data.forEach(function (data) {
            for(var i =0;i<arr.length;i++){
                var obj  = JSON.parse(JSON.stringify(data));
                obj.status = arr[i];
                fl.push(obj)
            }
        })
        var nk1 = key_arr.concat();
        var nk2 = key_arr.concat();
        nk1.push('status');
        nk2.push(key2)
        return merge_table(fl,nk1,data,nk2,'detail',def);
    }
}