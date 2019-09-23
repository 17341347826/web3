/**
 * 是否获取下拉列表第一个值
 * @param is_first
 * @param arr
 * @returns {*}
 */
function get_first_select(is_first, arr) {
    if (is_first && arr) {
        return arr[0]
    }
}

//============================================================
/**
 * 画圆心图
 */
function draw_circle(echarts, div_id, list, key) {
    var myChart = echarts.init(document.getElementById(div_id));
    var legend_data = [];
    var series = [];
    for (var i = 0, len = list.length; i < len; i++) {
        var grade_name = list[i].njmc
        legend_data.push(grade_name)
        var series_obj = series_data(get_series(), i, grade_name, Number(list[i][key]))
        series.push(series_obj)
    }
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
}


function get_series() {
    var color = getColor()
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
    return series_obj;
}

function series_data(series_obj, index, name, rate) {
    var color = getColor()
    series_obj.name = series_obj.name + (index + 1);
    var radius_1 = 30 + index * 10;
    var radius_2 = 38 + index * 10;
    series_obj.radius = [radius_1, radius_2];
    series_obj.data[0].name = name;
    series_obj.data[0].value = rate;
    series_obj.data[0].itemStyle.normal.color = color[index];
    series_obj.data[1].value = 100 - rate;
    series_obj.data[1].name = name + '未评';
    return series_obj
}

//=====================================================================
function getColor() {
    return ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0']
}

/**
 * 获取画柱状图需要的数据
 * @param list
 * @param type
 * @returns {{yAxis_arr: Array, legend_arr: Array, series_arr: Array}}
 */
function bar_data(list, type, key) {
    var legend_arr = [];
    var yAxis_arr = [];
    var data_length = list.length;
    var obj_legend = {}
    for (var i = data_length - 1; i > -1; i--) {
        var name = list[i].njmc;
        if (legend_arr.indexOf(name) == -1) {
            legend_arr.unshift(name);
        }
        var y_name = '';
        if (type == 'area') {
            y_name = list[i].qxmc
        }
        if (type == 'school') {
            y_name = list[i].xxmc
        }
        if (yAxis_arr.indexOf(y_name) == -1) {
            yAxis_arr.push(y_name);
        }
        if (!obj_legend[name]) {
            obj_legend[name] = [];
        }
        obj_legend[name].push(list[i][key])
    }

    var series_arr = [];
    for (var k = 0; k < legend_arr.length; k++) {
        var obj_series = {
            name: legend_arr[k],
            type: 'bar',
            data: obj_legend[legend_arr[k]],
            barWidth: 20,
            barMaxWidth: 20,
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        position: 'insideLeft',
                        formatter: function (params) {
                            return params.data + '%';
                        }
                    }
                }
            }
        }
        series_arr.push(obj_series);
    }
    const result = {
        legend_arr: legend_arr,
        yAxis_arr: yAxis_arr,
        series_arr: series_arr
    }
    return result
}

//校级数据整合
function merge_school(list, grade_list, school_obj) {
    var grade_arr = [];
    var obj = {}
    for (var i = 0, len = list.length; i < len; i++) {
        if (grade_arr.indexOf(list[i].njmc) == -1) {
            grade_arr.push(list[i].njmc)
        }
        if (!obj[list[i].xxmc]) {
            obj[list[i].xxmc] = []
        }
        obj[list[i].xxmc].push(list[i])
    }
    for (var key in obj) {
        if (obj[key].length == grade_arr.length) continue;
        var grade_arr2 = [];
        for (var i = 0, len = obj[key].length; i < len; i++) {
            grade_arr2.push(obj[key][i].njmc);
        }
        for (var i = 0, len = grade_arr.length; i < len; i++) {
            if (grade_arr2.indexOf(grade_arr[i]) == -1) {
                var new_obj = JSON.parse(JSON.stringify(school_obj))
                new_obj.fk_nj_id = get_grade_id_by_name(grade_list, grade_arr[i]);
                new_obj.fk_xx_id = obj[key][0].fk_xx_id;
                new_obj.njmc = grade_arr[i];
                new_obj.qxmc = obj[key][0].qxmc;
                new_obj.szmc = obj[key][0].szmc;
                new_obj.xxmc = key;
                list.push(new_obj)
            }
        }
    }
    sort_by(list, ['+xxmc', '+fk_nj_id'])
    return list
}

/**
 * 通过年级名称获取年级id
 * @param grade_list
 * @param name
 * @returns {*}
 */
function get_grade_id_by_name(grade_list, name) {
    for (var i = 0, len = grade_list.length; i < len; i++) {
        if (grade_list[i].name == name) {
            return grade_list[i].value
        }
    }
}

/**
 * 画班级柱状图
 * @param echarts
 * @param list
 * @param key
 */
function draw_class_bar(echarts, list, key) {
    var table_list_length = list.length;
    var yAxis_arr = [];
    var series_arr = [];
    for (var i = table_list_length - 1; i > -1; i--) {
        var str = list[i].njmc + list[i].bjmc
        yAxis_arr.push(str);
        series_arr.push(Number(list[i][key]));
    }
    ES.draw_bar('tubiao_4', echarts, series_arr, yAxis_arr)
}

/**
 * 判断数组是否为空
 * @param arr
 * @returns {boolean}
 */
function is_empty(arr) {
    if (arr.length == 0) return true
    return false
}

function time_request() {
    const fresh_obj = {
        account: cloud.user_user().account,
        time: new Date().getTime()
    }
    const is_refresh = JSON.parse(sessionStorage.getItem('is_refresh'));
    if (!is_refresh) {
        sessionStorage.setItem('is_refresh', JSON.stringify(fresh_obj))
        return false
    }
    const old_time = is_refresh.time;
    const new_time = new Date().getTime();
    const time = (new_time - old_time) / (60 * 1000)
    const account = cloud.user_user().account;
    if (time < 5 && is_refresh.account==account) return true
    sessionStorage.setItem('is_refresh', JSON.stringify(fresh_obj))
    return false

}

function get_refresh_params(list, id) {
    const params = {
        fk_xq_id: '',
        semester_end_date: '',
        semester_start_date: ''
    }
    for (var i = 0, len = list.length; i < len; i++) {
        var arr = list[i].value.split('|');
        if (id == arr[0]) {
            params.fk_xq_id = arr[0];
            params.semester_start_date = time_2_str(arr[1])
            params.semester_end_date = time_2_str(arr[2])
            break
        }
    }
    return params
}


function bar_for_progress(div_id, echarts, series_arr, yAxis_arr, legend_arr) {
    var color_arr = ['#1e88e5', '#2ecf94', '#f17e2d', '#0bbcb7', '#1a9bfc', '#7049f0'];

    var option = {
        title: {
            text: ''
        },
        color: color_arr,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params, ticket, callback) {
                var str = params[0].name;
                for (var i = 0; i < params.length; i++) {
                    str += "<br />" + params[i].seriesName + ":" + params[i].value + '%';
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
            show: false,
            max: 100
        },
        yAxis: {
            type: 'category',
            data: yAxis_arr,
            axisLabel: {
                color: "#000",
                interval: 0,
                formatter: function (value) {
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
    var myChart = echarts.init(document.getElementById(div_id));
    myChart.clear();
    myChart.setOption(option);
    myChart.resize();
}


function set_image_wrap_height(id, len1, len2) {
    var height = len1 * len2 * 42 + 10;
    if (len1 * len2 < 13) {
        height = len1 * len2 * 48;
    }
    if (len1 * len2 == 6) {
        height = len1 * len2 * 55;
    }
    if (len1 * len2 == 4) {
        height = len1 * len2 * 60;
    }
    if (len1 * len2 < 4) {
        height = len1 * len2 * 75;
    }
    height = height + 'px';
    var element = document.getElementById(id);
    element.style.height = height;
}

