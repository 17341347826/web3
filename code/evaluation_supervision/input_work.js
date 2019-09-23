importScripts('/Growth/code/evaluation_supervision/e_s_public.js');
onmessage = function (event) {
    //录入情况（活动上传-市区县地址组合）
    if (event.data.type == 'address') {
        this.address_work(event.data)
        return
    }
    //录入情况（活动上传-图表数据组合）
    if (event.data.type == 'img_data') {
        this.deal_data_work(event.data)
        return;
    }
    //结果生成情况数据组合
    if (event.data.type = "result_progress_address") {
        this.result_progress(event.data)
        return;
    }
}

function address_work(data) {
    const result = ES.completion_rate(data.value)
    postMessage(result)
}

function deal_data_work(work_data) {
    const new_data = work_data.value;
    var data = new_data.data;
    var type = new_data.type;
    var legend_arr = [];
    var yAxis_arr = [];
    var data_length = data.length;
    var obj_legend = {}

    for (var i = data_length - 1; i > -1; i--) {
        var name = data[i].grade_name;
        if (type == 'school') {
            name = data[i].status;
        }
        if (legend_arr.indexOf(name) == -1) {
            legend_arr.unshift(name);
        }

        var y_name = '';
        var sczb = 0;
        if (type == 'district') {
            y_name = data[i].district;
            sczb = Number(data[i].district_cnt.sczb) * 100;
        } else {
            y_name = data[i].schoolname;
            sczb = Number(data[i].detail.school_cnt.sczb) * 100;
        }
        if (yAxis_arr.indexOf(y_name) == -1) {
            yAxis_arr.push(y_name);
        }
        if (!obj_legend[name]) {
            obj_legend[name] = [];
        }
        if (!sczb)
            sczb = 0;
        obj_legend[name].push(sczb.toFixed(2))
    }
    var series_arr = [];
    for (var k = 0; k < legend_arr.length; k++) {
        var obj_series = {
            name: legend_arr[k],
            type: 'bar',
            data: obj_legend[legend_arr[k]],
            barWidth: 20,
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
    postMessage(JSON.stringify(result))
}

function result_progress(result_data) {
    const new_data = result_data.value;

    if(new_data.type=='city'){
        var student_data = this.merge_table(new_data.data, ["grade_id"], new_data.arr, ["grade_id"], "city_cnt", 0);
        this.sort_by(student_data, ["+city", "+district", "+school_id", "+grade_name"]);
        postMessage(student_data)
        return
    }
    if(new_data.type=='area'){
        var student_area = merge_table(new_data.data, ["district", "grade_id"], new_data.arr, ["district", "grade_id"], "district_cnt", 0);
        var arr = get_complate_arr(student_area)
        var new_cnt = complate_data(student_area,['city','district','school_id','schoolname'],'grade_name',arr,0);
        sort_by(new_cnt, ["+city", "+district", "+school_id", "+status"]);
        postMessage(new_cnt)
    }
    if(new_data.type=='school'){
        var student_school = merge_table(new_data.data, ["school_id", "grade_id"], new_data.arr, ["school_id", "grade_id"], "school_cnt", 0);
        var arr = get_complate_arr(student_school)
        var new_cnt = complate_data(student_school, ['district', 'school_id', 'schoolname'], 'grade_name', arr, 0);
        sort_by(new_cnt, ["+district", "+school_id", "+status"]);
        postMessage({
            data:new_cnt,
            arr:arr
        })
    }

}
function get_complate_arr(student) {
    var arr = [];
    for (var i = 0; i < student.length; i++) {
        if (arr.indexOf(student[i].grade_name) == -1) {
            arr.push(student[i].grade_name)
        }
    }
    return arr
}
function merge_table(t1, t1_k, t2, t2_k, kname, def, match_value) {
    if (t2_k.length == 0 || t2 == null) {
        return t1;
    }
    for (var i = 0; i < t1.length; i++) {
        var tmp = {};
        if (
            // 默认值为数组
            Array.isArray(def) ||
            // 是对象
            (def && !def.hasOwnProperty("length") && !Array.isArray(def) && !Array.isNumeric(def))
        ) {
            tmp = extendObj(tmp, def);
        } else {
            for (var x in t2[0]) {
                tmp[x] = def;
            }
        }
        if (match_value != undefined) {
            if (t1[i].hasOwnProperty(kname)) {
                for (var vk in def) {
                    if (!t1[i][kname].hasOwnProperty(vk)) {
                        t1[i][kname][vk] = def[vk]
                    }
                }

            } else {
                t1[i][kname] = def;
            }

        } else {
            if (t1[i].hasOwnProperty(kname)) {
                for (var vk in tmp) {
                    if (!t1[i][kname].hasOwnProperty(vk)) {
                        t1[i][kname][vk] = tmp[vk]
                    }
                }

            } else {
                t1[i][kname] = tmp;
            }
        }

    }

    for (var i = 0; i < t2.length; i++) {
        for (var x = 0; x < t1.length; x++) {
            var is_match = true;
            for (var z = 0; z < t1_k.length; z++) {
                if (t1[x][t1_k[z]] != t2[i][t2_k[z]]) {
                    is_match = false;
                    break;
                }
            }
            if (is_match) {
                if (match_value != undefined) {
                    t1[x][kname] = match_value
                } else {
                    t1[x][kname] = t2[i];
                }
            }
        }
    }
    return t1;
}

function cloneObj(oldObj) {
    if (typeof (oldObj) != 'object') return oldObj;
    if (oldObj == null) return oldObj;
    var newObj = new Object();
    for (var i in oldObj)
        newObj[i] = cloneObj(oldObj[i]);
    return newObj;
};

function extendObj() { //扩展对象
    var args = arguments;
    if (args.length < 2) return;
    var temp = cloneObj(args[0]); //调用复制对象方法
    for (var n = 1; n < args.length; n++) {
        for (var i in args[n]) {
            temp[i] = args[n][i];
        }
    }
    return temp;
}

function sort_by(data, by) {
    function item_sort(a, b) {
        for (var x = 0; x < by.length; x++) {
            var opt = by[x][0];
            var cur_key = by[x].substr(1);

            var lv = detach_from_cache(a, cur_key.split("."));
            var rv = detach_from_cache(b, cur_key.split("."))

            if (lv > rv) {
                return opt == "+" ? 1 : -1;
            } else if (lv < rv) {
                return opt == "+" ? -1 : 1;
            } else {
                continue
            }
        }
        return 0;
    }

    data.sort(item_sort);
    return data;
}

function detach_from_cache(data, ary_mem) {
    if (data == undefined)
        return;
    if (data.hasOwnProperty(ary_mem[0])) {
        if (ary_mem.length == 1)
            return data[ary_mem[0]];
        return detach_from_cache(data[ary_mem[0]], ary_mem.slice(1));
    }
    return ""
}

function complate_data (data, key_arr,key2,arr,def) {
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

function abstract_obj(src, key) {
    if (src.hasOwnProperty("length")) {
        var ret = [];
        for (var x = 0; x < src.length; x++) {
            var vi = {};
            if(typeof key == 'object'){
                key.forEach(function(data){
                    vi = this.extendObj(vi, abstract_obj(src[x], data)[0]);
                })
            }else {
                vi[key] = src[x][key];
            }
            ret.push(vi);
        }
        return ret;

    }
    if(typeof key == "object"){
        var vi = {};
        key.forEach(function(data){
            vi = this.extendObj(vi, abstract_obj(src, data)[0]);
        })
        return [vi]
    }
    var obj = {}
    obj[key] = src[key];
    return [obj];
}

function unique_obj(ary, keys){
    var ret = []
    ary.forEach(function(data){
        if(find(ret,keys, data)<0){
            ret.push(data);
        }
    });

    return ret;
}
function find(ary, keys, value){
    for( var i = 0; i < ary.length; ++i){
        var is_equ = true;
        keys.forEach(function (data) {
            if( ary[i][data] != value[data] ){
                is_equ = false;
            }
        });
        if(is_equ)
            return i;
    }
    return -1;
}

