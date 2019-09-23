/**
 * Created by Administrator on 2018/5/24.
 */
var ES = {
    //环形图
    /**
     *
     * @param div_id div元素的id
     * @param echarts 固定
     * @param series_arr 下拉列表数组数据
     */
    ring_diagram: function (div_id, echarts, series_arr, type, level) {
        var myChart = echarts.init(document.getElementById(div_id));
        var color = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];
        var dataStyle = {
            normal: {
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                },
                shadowBlur: 40,
                borderWidth: 2,
                shadowColor: 'rgba(0, 0, 0, 0)' //边框阴影
            }
        };
        var placeHolderStyle = {
            normal: {
                color: '#e1e2e4',
                label: {
                    show: false
                },
                labelLine: {
                    show: false
                }
            },
            emphasis: {
                color: '#ffffff'
            }
        };
        //------处理数据------------
        var legend_data = [];

        if (!series_arr) {
            series_arr = [
                {
                    name: 'Line 1',
                    type: 'pie',
                    clockWise: false,
                    radius: [30, 38],
                    center: ['50%', '50%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    startAngle: 90,
                    label: {
                        borderRadius: '10'
                    },
                    data: [
                        {
                            value: 54.6,
                            name: '初2017',
                            itemStyle: {
                                normal: {
                                    color: color[0]
                                }
                            }
                        },
                        {
                            value: 45.4,
                            name: '',
                            tooltip: {
                                show: false
                            },
                            itemStyle: placeHolderStyle
                        }
                    ]
                },
                {
                    name: 'Line 2',
                    type: 'pie',
                    clockWise: false,
                    radius: [40, 48],
                    center: ['50%', '50%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    startAngle: 90,
                    data: [{
                        value: 56.7,
                        name: '初2018',
                        itemStyle: {
                            normal: {
                                color: color[1]
                            }
                        }
                    },
                        {
                            value: 43.3,
                            name: '',
                            tooltip: {
                                show: false
                            },
                            itemStyle: placeHolderStyle
                        },
                    ]
                },
                {
                    name: 'Line 3',
                    type: 'pie',
                    clockWise: false,
                    radius: [50, 58],
                    center: ['50%', '50%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    startAngle: 90,
                    data: [{
                        value: 30,
                        name: '初2019',
                        itemStyle: {
                            normal: {
                                color: color[2]
                            }
                        }
                    },
                        {
                            value: 70,
                            name: '',
                            tooltip: {
                                show: false
                            },
                            itemStyle: placeHolderStyle
                        },
                    ]
                }
            ]
        }

        var series_length = series_arr.length;
        var series = [];
        for (var i = 0; i < series_length; i++) {
            legend_data.push(series_arr[i].grade_name);
            var series_obj = {
                name: 'Line',
                type: 'pie',
                clockWise: false,
                radius: [30, 38],
                center: ['50%', '50%'],
                itemStyle: dataStyle,
                hoverAnimation: false,
                startAngle: 90,
                label: {
                    borderRadius: '10'
                },
                data: [
                    {
                        value: 54.6,
                        name: '初2017',
                        itemStyle: {
                            normal: {
                                color: color[0]
                            }
                        }
                    },
                    {
                        value: 45.4,
                        name: '',
                        tooltip: {
                            show: true
                        },
                        itemStyle: placeHolderStyle
                    }
                ]
            };

            var completion_rate = 0;
            if (series_arr[i].completion_rate) {
                completion_rate = series_arr[i].completion_rate;
            } else if (series_arr[i].city_cnt) {
                if (series_arr[i].city_cnt.recorded_num) {
                    completion_rate = series_arr[i].city_cnt.recorded_num / series_arr[i].city_cnt.total_input_num * 100;
                } else {
                    completion_rate = series_arr[i].city_cnt.audited_records_num / series_arr[i].city_cnt.total_records_num * 100;
                }
                if (type == 'zb') {
                    completion_rate = Number(series_arr[i].city_cnt.sczb) * 100;
                }
            } else if (completion_rate == undefined || completion_rate == null) {
                completion_rate = series_arr[i].wcl;
            } else if (series_arr[i].data && series_arr[i].data.wcl) {
                completion_rate = Number(series_arr[i].data.wcl);
            }
            if (level == 'school' && type == 'zb') {
                completion_rate = Number(series_arr[i].school_cnt.sczb) * 100;
            }

            series_obj.name = series_obj.name + (i + 1);
            var radius_1 = 30 + i * 10;
            var radius_2 = 38 + i * 10;
            series_obj.radius = [radius_1, radius_2];
            series_obj.data[0].value = completion_rate;
            series_obj.data[0].name = legend_data[i];
            series_obj.data[0].itemStyle.normal.color = color[i];
            series_obj.data[1].value = 100 - completion_rate;
            series_obj.data[1].name = legend_data[i] + '未评';
            series.push(series_obj)
        }
        if (legend_data.length == 0) {
            legend_data = ['初2017', '初2018', '初2019'];
        }
        //------------
        var option = {
            backgroundColor: '#ffffff',
            title: {
                x: 'center',
                y: 'center',
                textStyle: {
                    fontWeight: 'normal',
                    fontSize: 12,
                    color: "#000000"
                }
            },
            tooltip: {
                trigger: 'item',
                show: true,
                formatter: "{b} : <br/>{d}%",
                backgroundColor: 'rgba(0,0,0,0.7)', // 背景
                padding: [1, 1], //内边距
                extraCssText: 'box-shadow: 0 0 3px rgba(255, 255, 255, 0.4);' //添加阴影
            },
            legend: {
                top: '0',
                x: 'center',
                icon: 'circle',
                itemGap: 8,
                data: legend_data,
                textStyle: {
                    color: '#fft'
                }
            },
            series: series
        };
        myChart.clear();
        myChart.setOption(option);
    },


    /**
     * 区县柱状图
     * @param div_id div元素的id
     * @param echarts  固定
     * @param table_data 下拉列表数组数据
     */
    bar_graph_area: function (div_id, echarts, table_data, type) {
        var myChart = echarts.init(document.getElementById(div_id));
        var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];

        var seriesLabel = {
            normal: {
                show: true,
                textBorderColor: '#666',
                textBorderWidth: 2,
                formatter: '{c}%'
            }
        };
        var legend_data = [];
        var yAxis_data = [];
        var table_data_length = table_data.length;
        var rich_obj = {
            value: {
                lineHeight: 30,
                align: 'center'
            }
        };
        var series_data_obj = {};
        for (var i = 0; i < table_data_length; i++) {
            var grade_name = table_data[i].grade_name;
            if (legend_data.indexOf(grade_name) == -1) {
                legend_data.push(grade_name);
            }
            if (!series_data_obj[grade_name]) {
                series_data_obj[grade_name] = [];
            }
            var wcl = 0;
            if (type == 'area') {
                if (table_data[i].district_cnt) {
                    wcl = table_data[i].district_cnt.audited_records_num / table_data[i].district_cnt.total_records_num * 100;
                    if (table_data[i].district_cnt.sczb != undefined || table_data[i].district_cnt.sczb != null) {
                        wcl = Number(table_data[i].district_cnt.sczb) * 100;
                    }
                } else if (table_data[i].data && table_data[i].data.wcl) {
                    wcl = Number(table_data[i].data.wcl);
                }

            } else if (type == 'school') {
                if (table_data[i].school_cnt) {
                    wcl = table_data[i].school_cnt.audited_records_num / table_data[i].school_cnt.total_records_num * 100;
                    if (table_data[i].school_cnt.sczb != undefined || table_data[i].school_cnt.sczb != null) {
                        wcl = Number(table_data[i].school_cnt.sczb) * 100;
                    }
                } else if (table_data[i].data && table_data[i].data.wcl) {
                    wcl = Number(table_data[i].data.wcl);
                }
            } else if (table_data[i].wcl) {
                wcl = table_data[i].wcl * 100;
            } else if (table_data[i].completion_rate != null && table_data[i].completion_rate != undefined) {
                wcl = table_data[i].completion_rate * 100;
            }
            wcl = wcl.toFixed(2);
            series_data_obj[grade_name].push(wcl);
            var district = table_data[i].district;
            if (yAxis_data.indexOf(district) == -1) {
                yAxis_data.push(district);
                rich_obj[district] = {
                    height: 40,
                    align: 'center'
                }
            }
        }
        var series_arr = [];
        var legend_length = legend_data.length;

        for (var i = 0; i < legend_length; i++) {
            var series_obj = {
                name: '',
                type: 'bar',
                data: [],
                label: seriesLabel,
                itemStyle: {
                    normal: {
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: color_arr[i]
                    }
                },
                barGap: "30%"
            }
            series_obj.name = legend_data[i];
            series_obj.data = series_data_obj[legend_data[i]];
            series_arr.push(series_obj);
        }


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
                icon: 'circle',
                data: legend_data
            },
            grid: {
                left: 60
            },
            toolbox: {
                show: true
            },
            xAxis: {
                type: 'value',
                name: '',
                axisLabel: {
                    formatter: '{value}'
                },
                show:false

            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: yAxis_data,
                axisLabel: {
                    margin: 20,
                    rich: rich_obj
                }
            },
            series: series_arr
        };
        myChart.setOption(option);

    },
    /**
     * 学校柱状图
     * @param div_id
     * @param echarts
     * @param table_data
     */
    bar_graph_school: function (div_id, echarts, table_data) {
        var myChart = echarts.init(document.getElementById(div_id));
        var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];
        var seriesLabel = {
            normal: {
                show: true,
                textBorderColor: '#666',
                textBorderWidth: 2,
                formatter: '{c}%'
            }
        };
        var legend_data = [];
        var yAxis_data = [];
        var table_data_length = table_data.length;
        var rich_obj = {
            value: {
                lineHeight: 30,
                align: 'center'
            }
        };
        var series_data_obj = {};
        for (var i = 0; i < table_data_length; i++) {
            var grade_name = table_data[i].grade_name;
            if (legend_data.indexOf(grade_name) == -1) {
                legend_data.push(grade_name);
            }
            var schoolname = table_data[i].schoolname;
            if (yAxis_data.indexOf(schoolname) == -1) {
                yAxis_data.push(schoolname);
                rich_obj[schoolname] = {
                    height: 40,
                    align: 'center'
                }
            }
            if (!series_data_obj[grade_name]) {
                series_data_obj[grade_name] = [];
            }
            series_data_obj[grade_name].push(table_data[i].wcl * 100);
        }
        var series_arr = [];
        var legend_length = legend_data.length;
        for (var i = 0; i < legend_length; i++) {
            var series_obj = {
                name: '',
                type: 'bar',
                data: [],
                label: seriesLabel,
                itemStyle: {
                    normal: {
                        //每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: color_arr[i]
                    }
                },
                barGap: "30%"
            }
            series_obj.name = legend_data[i];
            series_obj.data = series_data_obj[legend_data[i]];
            series_arr.push(series_obj);
        }


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
                icon: 'circle',
                data: legend_data
            },
            grid: {
                left: 60
            },
            toolbox: {
                show: true
            },
            xAxis: {
                type: 'value',
                name: '',
                axisLabel: {
                    formatter: '{value}'
                },
                show:false
            },
            yAxis: {
                type: 'category',
                inverse: true,
                data: yAxis_data,
                axisLabel: {
                    margin: 10,
                    rich: rich_obj
                },
                show:false
            },
            // grid: { // 控制图的大小，调整下面这些值就可以，
            //     x: 40,
            //     x2: 100,
            //     y2: 150,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
            // },
            series: series_arr
        };
        option.yAxis.axisLabel = {
            interval: 0,//标签设置为全部显示
            formatter: function (params) {
                var newParamsName = "";
                var paramsNameNumber = params.length;
                var provideNumber = 4;
                var rowNumber = Math.ceil(paramsNameNumber / provideNumber);
                if (paramsNameNumber > provideNumber) {
                    for (var p = 0; p < rowNumber; p++) {
                        var tempStr = "";
                        var start = p * provideNumber;
                        var end = start + provideNumber;
                        if (p == rowNumber - 1) {
                            tempStr = params.substring(start, paramsNameNumber);
                        } else {
                            tempStr = params.substring(start, end) + "\n";
                        }
                        newParamsName += tempStr;
                    }

                } else {
                    newParamsName = params;
                }
                return newParamsName;
            }
        }
        myChart.setOption(option);
    },
    active_bar: function (div_id, echarts, table_data) {
        var myChart = echarts.init(document.getElementById(div_id));
        var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];

        var yAxis_arr = [];
        for (var i = 0; i < table_data.list.length; i++) {
            var list = table_data.list;
            var district = list[i].district;
            if (yAxis_arr.indexOf(district) == -1) {
                yAxis_arr.push(list[i].district)
            }
        }

        var legend_data = ['今日登录', '七日登录', '总登录'];
        var data_login = [];
        var data_logins = [];
        var data_visits = [];
        for (var i = 0; i < table_data.rate.length; i++) {
            var rate = table_data.rate[i];
            var login = rate.login;
            var logins = rate.logins;
            var visits = rate.visits;
            data_login.push(Number(login));
            data_logins.push(Number(logins));
            data_visits.push(Number(visits));
        }

        var option = {

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: legend_data
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
                    name: '今日登录',
                    type: 'bar',
                    data: data_login,
                    itemStyle: {
                        normal: {
                            color: color_arr[0],
                            label: {
                                show: true,
                                position: 'insideBottomRight',
                                formatter: function (params) {
                                    return params.data;
                                }
                            }
                        }
                    }
                },
                {
                    name: '七日登录',
                    type: 'bar',
                    data: data_logins,
                    itemStyle: {
                        normal: {
                            color: color_arr[1],
                            label: {
                                show: true,
                                position: 'insideBottomRight',
                                formatter: function (params) {
                                    return params.data;
                                }
                            }
                        }
                    }
                },
                {
                    name: '总登录',
                    type: 'bar',
                    data: data_visits,
                    itemStyle: {
                        normal: {
                            color: color_arr[2],
                            label: {
                                show: true,
                                position: 'insideBottomRight',
                                formatter: function (params) {
                                    return params.data;
                                }
                            }
                        }
                    }
                },
            ]
        };
        myChart.setOption(option);
    },
    //完成率计算
    completion_rate: function (data) {
        var data_length = data.length;
        for (var i = 0; i < data_length; i++) {
            var user_count = data[i].used_count;
            //-------------自评-------------------
            if (data[i].findtype1) {
                var type1_count = data[i].findtype1.count;
                //未评
                data[i].findtype1.remainder = user_count - type1_count;
                //完成率
                var type1_completion_rate = (type1_count / user_count).toFixed(2);
                type1_completion_rate = type1_completion_rate * 100;
                data[i].findtype1.completion_rate = type1_completion_rate;
            }

            //-------------互评-----------------
            if (data[i].findtype2) {
                var type2_count = data[i].findtype2.count;
                data[i].findtype2.remainder = user_count - type2_count;
                var type2_completion_rate = (type2_count / user_count).toFixed(2);
                type2_completion_rate = type2_completion_rate * 100;
                data[i].findtype2.completion_rate = type2_completion_rate;
            }

            //--------------教师评------------
            if (data[i].findtype3) {
                var type3_count = data[i].findtype3.count;
                data[i].findtype3.remainder = user_count - type3_count;
                var type3_completion_rate = (type3_count / user_count).toFixed(2);
                type3_completion_rate = type3_completion_rate * 100;
                data[i].findtype3.completion_rate = type3_completion_rate;
            }
            if (!type1_count) {
                type1_count = 0;
            }
            if (!type2_count) {
                type2_count = 0;
            }
            if (!type3_count) {
                type3_count = 0;
            }
            var completion_rate = ((type1_count + type2_count + type3_count) / user_count).toFixed(2);
            completion_rate = completion_rate * 100;
            data[i].completion_rate = completion_rate;
        }
        return data;
    },


    get_count: function (data, div_id) {
        var table_length = data.length;

        var count = 1;
        for (var i = 0; i < table_length; i++) {
            if (i > 0 && data[i].district != data[i - 1].district) {
                count++;
            }
        }
        var tubiao = document.getElementById(div_id);
        tubiao.style.height = 130 * count + 80 + 'px';

    },
    //设置班级表格高度
    set_class_img_height:function (data,div_id) {
        var height = data.length*44+40+'px';
        var tubiao = document.getElementById(div_id);
        tubiao.style.height = height;
    },

    set_more_bar_height:function (series_arr,yAxis_arr,div_id) {
        var height = series_arr.length*yAxis_arr.length*44+40+'px';
        var tubiao = document.getElementById(div_id);
        tubiao.style.height = height;
    },
    bar_for_progress:function (div_id,echarts,series_arr,yAxis_arr,legend_arr) {
        var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];

        var option = {
            title: {
                text: ''
            },
            color:color_arr,
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params, ticket, callback) {
                    var str = params[0].name;
                    for(var i=0;i<params.length;i++){
                        str+="<br />"+params[i].seriesName+":"+params[i].value +'%';
                    }
                    return str;
                }
            },
            legend: {
                data: legend_arr
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
                show:false,
                max:100
            },
            yAxis: {
                type: 'category',
                data: yAxis_arr,
                axisLabel: {
                    color: "#000",
                    interval: 0,
                    formatter: function(value) {
                        if (value.length > 4) {
                            return value.substring(0, 4) + "...";
                        } else {
                            return value;
                        }
                    }
                }
            },
            series: series_arr

        };
        this.set_more_bar_height(series_arr,yAxis_arr,div_id);
        var myChart = echarts.init(document.getElementById(div_id));
        myChart.clear();
        myChart.setOption(option);
        myChart.resize();
    },
    //画多个柱状图
    draw_more_bar:function (div_id,echarts,series_arr,yAxis_arr,legend_arr) {
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
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 0.01],
                show:false,
                max:100
            },
            yAxis: {
                type: 'category',
                data: yAxis_arr,
                axisLabel: {
                    color: "#000",
                    interval: 0,
                    formatter: function(value) {
                        if (value.length > 4) {
                            return value.substring(0, 4) + "...";
                        } else {
                            return value;
                        }
                    }
                }
            },
            series: series_arr

        };
        this.set_more_bar_height(series_arr,yAxis_arr,div_id);
        var myChart = echarts.init(document.getElementById(div_id));
        myChart.clear();
        myChart.setOption(option);
        myChart.resize();
    },
    //单个柱状图
    draw_bar:function (div_id,echarts,series_arr,yAxis_arr) {
        this.set_class_img_height(series_arr,div_id);
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
                },
                formatter: function(params, ticket, callback) {
                    var str = '';
                    for(var i=params.length-1;i>-1;i--){
                        str=params[i].name+":"+params[i].value.toFixed(2) +'%';
                    }
                    return str;
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
                show:false,
                max:100
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
                                    return params.data.toFixed(2)+'%';
                                }
                            }
                        }
                    }
                }

            ]
        };
        myChart.setOption(option);
        myChart.resize();
    }
}

function deal_school_data() {
    this.all_data = '';
}

/**
 * 筛选数据(通过区县)
 */
deal_school_data.prototype.screen = function (area,callback) {
    var new_data = [];
    var data = this.all_data;
    if (area == '全部') {
        new_data = data;
    }else {
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].district == area) {
                new_data.push(data[i])
            }
        }
    }
    callback(new_data)
}
deal_school_data.prototype.filter_data = function (area,callback) {
    var new_data = [];
    var data = this.all_data;
    if (area == '全部') {
        new_data = data;
    }else {
        for (var i = 0, len = data.length; i < len; i++) {
            if (data[i].qxmc == area) {
                new_data.push(data[i])
            }
        }
    }
    callback(new_data)
}


