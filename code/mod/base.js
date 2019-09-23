/**
 *
 * Created by Weifeng Ma on 2018/5/24 0024.
 */

/**
 *  工厂函数：生成一个数据接口
 * @param url : 数据源
 * @param params: 访问数据源的参数，该参数可以依赖另一个数据源
 * @param cache 是否进行缓存，会根据请求参数缓存数据
 * @param after  获取到数据后，数据的处理流程，可以管道+修饰器，也可以是一个函数
 * @returns {{url: *, params: *, cache: *, after: *}}
 */


/**
 * 增强版JOIN函数，支持传入函数
 * @param ary 源数组
 * @param separator 分隔符
 * @param fun 数据提取函数
 * @returns {string}
 */
function join_ex(ary, separator, fun) {
    var ret = "";
    for (var x = 0; x < ary.length; x++) {
        if (ret != "")
            ret += ","
        ret += fun(ary[x], x);
    }
    return ret;
};


function concat(ary_list) {
    var ret = [];

    ary_list.forEach(function (data) {
        ret = ret.concat(data)
    });
    return ret;
}

/*
仅支持stirng,Number,
* */
function unique(ary) {
    var ret = []

    ary.forEach(function (data) {
        if (ret.indexOf(data) < 0) {
            ret.push(data);
        }
    });

    return ret;
}

function group_by(ary, by) {
    var tmp = sort_by(ary, ["+" + by])

    var ret = [], line = [];
    var last = null;
    tmp.forEach(function (data) {
        if (last != null && data[by] != last[by]) {
            ret.push(deep_copy(line));
            line = []
        }
        last = data;
        line.push(data)
    });

    return ret;
}


function find(ary, keys, value) {
    for (var i = 0; i < ary.length; ++i) {
        var is_equ = true;
        keys.forEach(function (data) {
            if (ary[i][data] != value[data]) {
                is_equ = false;
            }
        });
        if (is_equ)
            return i;
    }
    return -1;
}

function unique_obj(ary, keys) {
    var ret = []

    ary.forEach(function (data) {
        if (find(ret, keys, data) < 0) {
            ret.push(data);
        }
    });

    return ret;
}

function padding(src, match_key, match_list, dft) {
    var ret = new Array(match_list.length).fill(JSON.parse(JSON.stringify(dft)));

    src.forEach(function (data, index) {
        var idx = match_list.indexOf(data[match_key]);
        if (idx < 0) {

            console.assert("match exception");
        }
        ret[idx] = data;
    });

    return ret;
}

/**
 * 数组对齐和补白 参照数组对象
 * @param src
 * @param key
 * @param match_key
 * @param match_list
 * @param dft
 * @returns {*}
 */
function padding_obj_obj(src, key, match_key, match_list, dft) {
    var ret = new Array(match_list.length).fill(JSON.parse(JSON.stringify(dft)));
    ret.forEach(function (data, index) {
        ret[index] = JSON.parse(JSON.stringify(dft));
    });
    src.forEach(function (data) {
        var idx = -1;
        for (var i = 0; i < match_list.length; i++) {
            if (data[key] == match_list[i][match_key]) {
                idx = i;
                break;
            }
        }
        if (idx < 0) {
            console.assert("match exception");
        }
        ret[idx] = data;
    });

    return ret;
}

function padding_f(src, match_list, key, match_key) {
    src.forEach(function (data, index) {
        if (data && match_list[index]) {
            data[key] = match_list[index][match_key];

        }
    })
    return src;
}

function make_interface(url, params, cache, after) {
    return {url: api.api + url, params: params, cache: cache, after: after}
}

var blob_2_b64 = function (blob, callback) {
    var f = new FileReader();
    f.onload = function (e) {
        callback(e.target.result);
    }
    f.readAsDataURL(blob);
};

/**
 * 性能测试工具，计算代码运行时间
 * @type {(timerName?: string) => void}
 */
ts = console.time
te = console.timeEnd


/**
 * 传入guid生成图片的网址
 * @param img_data
 * @returns {string}
 */
function url_img(img_data) {
    var token = sessionStorage.getItem("token");

    return HTTP_X + "api/file/get?token=" + token + "&img=" + img_data;
}

function deep_copy(destination, source) {
    var stype = typeof (source);
    if (stype == "string" || stype == "number")
        return source

    if (destination == undefined)
        if (source != undefined && source.hasOwnProperty("length"))
            destination = []
        else
            destination = {}
    for (var property in source) {
        if (typeof (source[property]) == "object") {
            if (source[property] != null && source[property] != undefined && source[property].hasOwnProperty("length"))
                destination[property] = deep_copy([], source[property])
            else
                destination[property] = deep_copy({}, source[property])
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
}

/**
 *  将字符串转换为unicode字符串
 * @param str
 * @returns {string}
 */
function unicode(str) {
    var ret = "";
    for (var i = 0; i < str.length; i++) {
        ret += str.charCodeAt(i).toString(16);
    }
    return ret;
}

/**
 * 生成一个统计Array<Object>中，满 足Object<key>=value的统计函数
 * @returns {Function}
 */
function make_count() {
    /**
     * @param data:源数据
     * @param key:关键字
     * @param value:统计的值
     */
    return function (data, key, value) {
        var ret = 0;
        for (var x = 0; x < data.length; x++) {
            if (data[x][key] == value) {
                ret += 1;
            }
        }
        return ret;
    }
}

/**
 * 统计Array<Object>中，满 足Object<key>=value的数
 * @param data 源数据
 * @param key 关键字
 * @param value 值
 * @returns {number}
 */
function count(data, key, value) {
    var ret = 0;
    for (var x = 0; x < data.length; x++) {
        if (data[x][key] == value) {
            ret += 1;
        }
    }
    return ret == 0 ? 1 : ret;
}

function act_count(data, key, value) {
    var ret = 0;
    for (var x = 0; x < data.length; x++) {
        if (data[x][key] == value) {
            ret += 1;
        }
    }
    return ret;
}

/**
 * 生成一个过滤器，通过闭传参
 * @param filter_by
 * @returns {Function}
 */
function make_filter(filter_by) {
    return function (data) {
        var ret = [];
        for (var x = 0; x < data.length; x++) {
            if (filter_by(data[x])) {
                ret.push(data[x]);
            }
        }
        return ret;
    }
}


/**
 * 基础过滤器, 返回Array<Object>中，满 足Object<key>=value的子数组
 * @param data
 * @param col_name
 * @param value
 * @param user_type(用户类型：这个参数主要针对教师具有班主任特性，优先显示班主任班级)
 * @returns {Array}
 */
function base_filter(data, col_name, value, user_type) {
    var ret = [];
    for (var x = 0; x < data.length; x++) {
        if (data[x][col_name] == value) {
            if (user_type == 6) {//记录班主任班级的序号
                data[x].lead_index = x;
            }
            ret.push(data[x]);
        }
    }
    return ret;
}

/**
 *  统计Array<Object>中，满 足Objects<keys>=values的数据量
 * @param data
 * @param keys：Array<String>关键字数组
 * @param values:Array<String>值数组
 * @returns {number}
 */

function filter_count(data, keys, values) {
    var ret = 0;
    for (var x = 0; x < data.length; x++) {
        var is_match = true;
        for (var kx = 0; kx < keys.length; kx++) {
            if (data[x][keys[kx]] != values[kx] && values[kx] != "") {
                is_match = false;
                break;
            }

        }
        if (is_match) ret += 1;
    }
    return ret;
}

/**
 *  object数组排序算法
 * @param data 数据源
 * @param by 排序依据 如["+id", "-name"]表示，以id升序排列，以name降序排列
 * @param is_desc 是否降序
 */
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

function filter_undefined(value, fixed, is_str) {
    if (!value || value == 'undefined' || value == 'NaN')
        value = 0;
    if (value && is_str) {
        value = value.split('%')[0];
    }
    if (fixed) {
        value = Number(value).toFixed(fixed);
    }


    return value;
}

/**
 *  生成一个接口，供外部调用
 * @param api_name 接口名
 * @param then， 数据拦截器
 * @param params，接口附带的常量参数
 * @returns {Function}
 */
function make_api(api_name, bind_pms, then, params) {
    return function (pms, apply) {
        if (pms != undefined && bind_pms != undefined)
            pms = $.extend(pms, bind_pms);
        if (then != undefined) {
            if (bind_pms != undefined) {
                pms = $.extend(pms, bind_pms);
            }

            var ret = D(api_name, pms, apply, then, params);
            if (ret)
                return then(ret, params)
            return ret;
        }
        return D(api_name, pms, apply)
    };
}


/**
 *    向table中根据公式插入数据项
 *  * @param data 源数据
 *  * @param rule[
 *     ["findtype1.wp", "{used_count} - {findtype1.count}"],
 *     ["findtype1.wcl","@findtype1.count/@used_count"],
 *     [“wcl","({findtype1.wcl} + {findtyp2.wcl} + {findtype3.wcl}) / 300"]
 * ]
 */
function calc_ext(data, rule, no_minus, fixed) {
    // 附加数据
    var opts = [];
    for (var i = 0; i < rule.length; i++) {
        var cmds = rule[i][1].split(" ");
        var sub_opt = [];
        for (var x = 0; x < cmds.length; x++) {
            if (cmds[x][0] == "{") {
                sub_opt.push([cmds[x], cmds[x].substr(1, cmds[x].length - 2).split(".")]);
            }
        }
        opts.push(sub_opt);
    }
    for (var x = 0; x < data.length; x++) {
        for (var i = 0; i < opts.length; i++) {
            var sub_opt = opts[i];
            var cmd = rule[i][1];
            var new_key = rule[i][0];
            for (var z = 0; z < sub_opt.length; z++) {
                var name = sub_opt[z][0];
                var value = detach_from_cache(data[x], sub_opt[z][1]);
                if (value == "") value = 0;
                cmd = cmd.replace(name, value);
            }
//            console.info(cmd);

            var ret = eval(cmd);
            if (isNaN(ret) || ret == Infinity || (no_minus == true && ret < 0))
                ret = 0;

            // if(ret + 1 - 1 != ret )
            //     ret = 0;
            // if (ret.toFixed(0) != ret)
            //     ret = ret.toFixed()
            if (fixed != undefined)
                ret = ret.toFixed(fixed)
            attach(data[x], new_key.split("."), ret);
        }
    }
}


function remart_2_no(remark) {
    if (remark[0] == "七") return 7;
    if (remark[0] == "八") return 8;
    if (remark[0] == "九") return 9;
    return -1;
}

/**
 *   linux时间戳转换成字符串时间
 * @param h
 */
function time_2_str(h) {
    var timestamp3 = h / 1000;
    var newDate = new Date();
    newDate.setTime(timestamp3 * 1000);
    Date.prototype.format = function (format) {
        var date = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S+": this.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                    date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    }
    var getTimeIs = newDate.format('yyyy-MM-dd');
    return getTimeIs;
}
function time_2_str2(h) {
    var timestamp3 = h / 1000;
    var newDate = new Date();
    newDate.setTime(timestamp3 * 1000);
    Date.prototype.format = function (format) {
        var date = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S+": this.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in date) {
            if (new RegExp("(" + k + ")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                    date[k] : ("00" + date[k]).substr(("" + date[k]).length));
            }
        }
        return format;
    }
    var getTimeIs = newDate.format('yyyy-MM-dd hh:mm:ss');
    return getTimeIs;
}

/**
 *  同步请求【适用于简单常量级请求】
 *      注：不能用于请求数据量大，响应时间长的源
 * @param cmd 网址
 * @param data参数
 * @returns {Response}
 */
function base_ajax_post_sync(cmd, data, is_cache) {
    var pms = JSON.stringify(data);
    var kname = unicode(cmd + pms);
    if (cache.hasOwnProperty(kname)) {
        return cache[kname];
    }
    var resp = jQuery.ajax({
        method: "POST",
        url: cmd,
        dataType: "json",
        contentType: "application/json",
        data: pms,
        async: false,
        beforeSend: function (xhr) {
            var token = window.sessionStorage.getItem("token");
            if (token != undefined && token != "")
                xhr.setRequestHeader('Token', token);
        }
    });
    if (is_cache) {
        cache[kname] = resp;
    }
    return resp;
}

/**
 *  本地缓存块
 * @type {{}}
 */
var cache = {photos: {}};
/*
 *  解决级链请求
 *  配置说明:
 *   参数一： 表示数据源地址
 *   参数二： 发送请求附加的参数
 *             注意:以__*__具有特殊意义
 *             如__sync__:表示指定数据获取方式，true（默认）：表示同步获取， false,表示异步获取
 *    参数三： 是否对请求返回结果进行缓存，在实际开发中，请求时间短，常量级的请求，可以使用缓存，比如基础数据。
 *    参数四： 表示结果处理流程，提供了两种处理流程。
 *              1. type = "pip" ,表示以管道方式处理，管道为一数组,保存在content中
 *                 如：content: ["user|json", "user.guid|json"],表是先将返回结果集中的user键值，进行json解析，再对解析后的user中的guid进行json解析
 *              2. type = "func", 表示以回调函数方式处理，当数据请求完闭， 将以数据为参数，调用回调函数，在回函数中，进行自定义处理，比如何并多项数据等。*
 * */
var Task = {
    // 用户基础信息
    user: make_interface("base/baseUser/sessionuser.action", {}, true, {
        "content": ["user|json", "user.teach_grade|split,"],
        "type": "pip"
    }),
    //高中学校区县列表
    heigh_school_area: make_interface("GrowthRecordBag/district_group_student", {}, true),
    //高中学校年级列表
    heigh_school_grade: make_interface("GrowthRecordBag/grade_group_student", {}, true),
    // 一批学生的头像
    users_photo: make_interface("base/student/stu_photos", {}, true, {
        type: "pip",
        path: "list",
        content: ["photo|json"]
    }),
    // 获取学生个人信息
    student_info: make_interface("base/baseUser/get_appoint_student_user.action", {"cache#guid": "user.user.guid"}, true, {
        "content": ["photo|json"], "type": "pip"
    }),
    // 用户区域列表
    area_list: make_interface("base/school/arealist.action", {"cache#city": "user.user.city"}, true),
    // 用户学校列表
    school_grade_list: make_interface("base/school/sub_school_grade_list", {
        "cache#department_id": "user.user.fk_school_id",
        "const#grade_id": 0
    }, true),
    // 所有学校列表
    school_list: make_interface("base/school/schoolList.action", {
        "cache#province": "user.user.province",
        "cache#city": "user.user.city"
    }, true),
    //获取区县id
    user_district_id: make_interface("base/school/get_higher_id", {}, true),
    // 用户年级列表
    grade_list: make_interface("base/class/school_class.action", {"cache#school_id": "user.user.fk_school_id"}, true),
    // 年级学期列表
    grade_semester_list: make_interface("base/semester/grade_opt_semester", {}, false),
    //根据年级和学校获取班级列表(fk_grade_id)
    find_class_simple: make_interface("base/class/findClassSimple.action", {"cache#fk_school_id": "user.user.fk_school_id"}, false),

    // 用户班级列表
    class_list: make_interface("base/baseUser/studentlist.action",
        {
            "cache#city": "user.user.city",
            "cache#district": "user.user.district",
            "cache#fk_class_id": "user.user.fk_class_id",
            "cache#fk_grade_id": "user.user.fk_grade_id",
            "cache#fk_school_id": "user.user.fk_school_id"
        }, true),
    //班级列表
    class_all_list: make_interface("base/class/findClassInfo.action", {}, true),
    // 用户学生列表
    student_list: make_interface("base/student/student_users", {}, true),
    // 用户学年学期(所有)列表
    semester_all_list: make_interface("base/semester/used_list.action", {}, true),//status:1
    //当前学年学期
    semester_current: make_interface("base/semester/current_semester.action", {"__sync__": false}, true),
    // 用户年级(所有)列表
    grade_all_list: make_interface("base/grade/findGrades.action", {"const#status": 1}, true),//status:1
    grade_list_graduation: make_interface("base/grade/graduate_list", {}, true),//status:1
    // 市学生总数
    student_count: make_interface("base/user_stat/get_stu_cnt", {}, false),
    // 市某学期总数
    student_count_in_semester: make_interface("base/user_stat/get_dept_stu_cnt", {}, false),
    // 年级学期映射列表
    grade_semester_mapping_list: make_interface("base/semester/grade_semester_mapping", {}, false),
    // 通过班级ID，获取一个班的学生列表
    class_members: make_interface("base/student/class_used_stu", {}, false),
    // 获取指定学期，年级的班级列表
    sem_class_list: make_interface("base/user_stat/get_class_stu_cnt", {__sync__: false}, false),
    // 获取我的上级单位
    my_superior: make_interface("base/school/get_high_ids", {"cache#department_id": "user.user.fk_school_id"}, true, {
        "content": ["ids_str|split,"], "type": "pip"
    }),
    //
    superior: make_interface("base/school/get_high_ids", {}, true, {
        "content": ["ids_str|split,"], "type": "pip"
    }),
    //获取指定学校年级集合
    school_to_grade: make_interface("base/grade/school_grade", {"cache#school_id": "user.user.fk_school_id"}, false),
    //获取指定学校下所有教师集合
    school_to_teacher: make_interface("base/teacher/chooseteacher.action", {"cache#fk_school_id": "user.user.fk_school_id"}, false),
    //获取服务器当前时间
    get_current_time: make_interface("base/baseUser/current_time", {}, false),
    //获取本级及以上单位信息
    get_dept_high_info: make_interface("base/school/get_dept_level_info", {"cache#department_id": "user.user.fk_school_id"}, false),
};

function array_2_data_source(ary, max_cnt, data_from, title_from) {
    var ret = [];


    var sub_line = [];
    var ci = 0;
    ary.forEach(function (data) {
        if (sub_line.length == 0 && title_from) {
            sub_line.push(data[title_from]);
        }

        var value = detach_from_cache(data, data_from.split("."))

        sub_line.push(value);

        if ((ci + 1) % max_cnt == 0) {
            ret.push(deep_copy(sub_line));
            sub_line = [];
        }

        ci += 1;
    });

    if (sub_line.length != 0) {
        ret.push(sub_line);
    }

    return ret;

}

function complate_data(data, key_arr, key2, arr, def) {
    var data_list = abstract_obj(data, key_arr);
    var uni_data = unique_obj(data_list, key_arr);
    var fl = [];
    uni_data.forEach(function (data) {
        for (var i = 0; i < arr.length; i++) {
            var obj = JSON.parse(JSON.stringify(data));
            obj.status = arr[i];
            fl.push(obj)
        }
    })
    var nk1 = key_arr.concat();
    var nk2 = key_arr.concat();
    nk1.push('status');
    nk2.push(key2)
    return merge_table(fl, nk1, data, nk2, 'detail', def);
}

/**
 * 通过t1_k 与 t2_k 合并t1与t2
 * @param t1
 * @param t1_k
 * @param t2
 * @param t2_2

 */

//merge_table(t1, t1_k, t2, t2_k, kname, {cityname:"", sub_list:[]}, match_value);
function merge_table(t1, t1_k, t2, t2_k, kname, def, match_value) {
    if (t2_k.length == 0 || t2 == null) {
        return t1;
    }
    var ret = [];
    for (var i = 0; i < t1.length; i++) {
        var tmp = {};
        if (
            // 默认值为数组
            $.isArray(def) ||
            // 是对象
            (def && !def.hasOwnProperty("length") && !$.isArray(def) && !$.isNumeric(def))
        ) {
            tmp = $.extend(tmp, def);
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
};

/**
 * 从object中抽离出感兴趣的项
 * @param src 源
 * @param arg_list 感兴趣的项列表
 * @returns {{}}
 */
function pms_only(src, arg_list) {
    var ret = {}
    for (var i in arg_list) {
        var v = "";
        if (arg_list.hasOwnProperty(i)) {
            v = arg_list[v];
        }
        ret[i] = v;
    }
    ;
    return ret;
}

/**
 *  通过”键路径“ 从object中抽取数据
 * @param data
 * @param ary_mem
 * @returns {*}
 */
function detach_from_cache(data, ary_mem) {
    // console.log(ary_mem[0]);
    if (data == undefined)
        return;
    if (data.hasOwnProperty(ary_mem[0])) {
        if (ary_mem.length == 1)
            return data[ary_mem[0]];
        return detach_from_cache(data[ary_mem[0]], ary_mem.slice(1));
    }
    return ""
}

function value(value, path, dft) {
    var v = detach_from_cache(value, path.split("."))
    if (v == "") {
        return dft;
    }
    return v;
}

/**
 *  通过"键路径” 向 object 中插入数据
 * @param data
 * @param ary_men 键路径，为一数组
 * @param new_data
 */
function attach(data, ary_men, new_data) {
    if (!data.hasOwnProperty(ary_men[0]))
        data[ary_men[0]] = {}
    if (ary_men.length == 1) {
        data[ary_men[0]] = new_data;
    } else {
        attach(data[ary_men[0]], ary_men.splice(1), new_data);
    }
}


/**
 *  核心函数：带“溯源”特性的，数据获取请求，会先检测cache
 * @param what
 * @param args
 * @param apply
 */
function trace(what, args, func_cb, then, them_pms) {
    //  用于请求源
    var url = Task[what[0]].url;
    // 请求源，附加的参数
    var pms = Task[what[0]].params;
    var after = Task[what[0]].after;
    var is_cache = Task[what[0]].cache;

    // 提取同步或异步请求配置
    var form = {};
    var is_sync = true;
    var call = undefined;
    if (pms.hasOwnProperty("__sync__")) {
        is_sync = pms["__sync__"];
        call = pms["__call__"]
    }
    var cb = undefined;
    if (args && args.hasOwnProperty("__call__")) {
        cb = args.__call__;
    }

    // 生成关联参数
    // 如果关联参数依赖于其它源，则继续请求
    for (var i in pms) {
        var chunk = i.split("#"), link;
        if (chunk == "cache")
            link = pms[i].split(".")
        else
            link = [pms[i]]
        if (chunk[0] == "cache") {
            var data = D(link[0], {});
            cache[link[0]] = data;
            var v = detach_from_cache(cache, link);
            form[chunk[1]] = v;
        } else if (chunk[0] == "const")
            form[chunk[1]] = link[0]
    }
    // 附加参数
    //if (apply == what[0] || apply == "all" || apply == undefined ||typeof(apply) == "function")
    if (args != undefined) form = $.extend(form, args);
    if (typeof (func_cb) == "function") {
        cb = func_cb
    }

    if (is_sync) {
        // 同步请求数据源
        var response = base_ajax_post_sync(url, form, is_cache);
        if (response.status == 200) {
            var ret = response.responseJSON.data;
            if (after != undefined) {
                if (after.type == "pip") {

                    var vret = undefined;
                    if (after.path)
                        vret = detach_from_cache(ret, after.path.split("."));
                    else
                        vret = ret;

                    for (var x = 0; x < after.content.length; x++) {
                        var vk = after.content[x].split("|");
                        var links = vk[0].split(".");
                        if (vret.hasOwnProperty("length")) {
                            var v_len = vret.length;
                            for (var zx = 0; zx < v_len; zx++) {
                                var vk_data = detach_from_cache(vret[zx], links);
                                if (vk[1] == "json" && typeof (vk_data) == "string") {
                                    if (vk_data == "") vk_data = "{}"
                                    try {
                                        vk_data = JSON.parse(vk_data);
                                    } catch (e) {
                                    }
                                    ;
                                    attach(vret[zx], links, vk_data, pms);
                                } else if (vk[1].substr(0, 5) == "split" && typeof (vk_data) == "string") {
                                    var spt = vk[1][5];
                                    if (spt == undefined) spt = '|';
                                    vk_data = vk_data.split(spt);
                                    attach(vret[zx], links, vk_data, pms);
                                }
                            }
                        } else {
                            var vk_data = detach_from_cache(ret, links);
                            if (vk[1] == "json" && typeof (vk_data) == "string") {
                                try {
                                    vk_data = JSON.parse(vk_data);
                                } catch (e) {
                                }
                                ;
                                attach(vret, links, vk_data, pms);
                            } else if (vk[1].substr(0, 5) == "split" && typeof (vk_data) == "string") {
                                var spt = vk[1][5];
                                if (spt == undefined) spt = '|';
                                vk_data = vk_data.split(spt);
                                attach(vret, links, vk_data, pms);
                            }
                        }
                    }

                } else if (after.type == "func") {
                    ret = after.content(ret);
                }
            }
            // if (is_cache)
            // {
            //     var kname = what;
            //     // var ps = JSON.stringify(form);
            //     // kname += unicode(ps);
            //     cache[kname] = ret;
            //     console.info(ps);
            // }
            return ret;
        } else {
        }
    } else {
        // console.info("what:", what);
        // console.info("url:", url);
        // console.trace()
        // 异步响应机制
        ajax_post(url, form, {
            on_request_complete: function (cmd, status, data, is_suc, msg) {
                var ret = data.data;
                if (ret == null) return cb(url, args, ret, is_suc, msg);
                if (what.length > 1)
                    ret = detach_from_cache(ret, what.slice(1))
                if (after != undefined) {
                    if (after.type == "pip") {

                        var vret = undefined;
                        if (after.path)
                            vret = detach_from_cache(ret, after.path.split("."));
                        else
                            vret = ret;

                        for (var x = 0; x < after.content.length; x++) {
                            var vk = after.content[x].split("|");
                            var links = vk[0].split(".");
                            if (vret.hasOwnProperty("length")) {
                                var v_len = vret.length;
                                for (var zx = 0; zx < v_len; zx++) {
                                    var vk_data = detach_from_cache(vret[zx], links);
                                    if (vk[1] == "json" && typeof (vk_data) == "string") {
                                        try {
                                            vk_data = JSON.parse(vk_data);
                                        } catch (e) {
                                        }
                                        ;
                                        attach(vret[zx], links, vk_data, pms);
                                    } else if (vk[1].substr(0, 5) == "split" && typeof (vk_data) == "string") {
                                        var spt = vk[1][5];
                                        if (spt == undefined) spt = '|';
                                        vk_data = vk_data.split(spt);
                                        attach(vret[zx], links, vk_data, pms);
                                    }
                                }
                            } else {
                                var vk_data = detach_from_cache(ret, links);
                                if (vk[1] == "json" && typeof (vk_data) == "string") {
                                    if (vk_data == "") {
                                        vk_data = "[]"
                                    }
                                    try {
                                        vk_data = JSON.parse(vk_data);
                                    } catch (e) {
                                    }
                                    ;
                                    attach(vret, links, vk_data, pms);
                                } else if (vk[1].substr(0, 5) == "split" && typeof (vk_data) == "string") {
                                    var spt = vk[1][5];
                                    if (spt == undefined) spt = '|';
                                    vk_data = vk_data.split(spt);
                                    attach(vret, links, vk_data, pms);
                                }
                            }
                        }

                    } else if (after.type == "func") {
                        ret = after.content(ret);
                    }
                }

                if (then != undefined) ret = then(ret, them_pms);

                cb && cb(url, args, ret, is_suc, msg);
            }
        });
    }
}

/**
 * 获取数据
 * @param what 指定数据名
 * @param msg 获取参数
 * @param apply 参数使用范围，all所有的请求均会附带参数
 * @returns {*}
 * @constructor
 */
var D = function (what, msg, apply, then, them_pms) {
    var links = what.split(".");
    // if (cache.hasOwnProperty(links[0])) {
    // if(false)
    //     return detach_from_cache(cache, links);
    // }
    // else {
    if (Task.hasOwnProperty(links[0])) {
        ret = trace(links, msg, apply, then, them_pms);
        if (links.length == 1) {
            if (Task[links[0]].cache)
                return deep_copy(undefined, ret);
            return ret;
        } else {
            if (Task[links[0]].cache)
                return deep_copy(undefined, detach_from_cache(ret, links.slice(1)));
            return detach_from_cache(ret, links.slice(1));
        }

    } else {
        console.trace(false, "未指定的任务");
    }
    // }
};

/**
 * 工具函数， 转响为select需要的数据
 * @param src 源数据
 * @param rule 转换规则，为一对象，{name:"select名来源", value:["select值来源多个用“|"分割]}
 * @returns {*}
 */
function any_2_select(src, rule) {
    if (src.hasOwnProperty("length")) {
        var ret = [];
        for (var x = 0; x < src.length; x++) {
            ret.push(any_2_select(src[x], rule));
        }
        return ret;

    } else {
        var value = "";
        for (var i in rule.value) {
            if (value != "") {
                value += "|"
            }
            value += src[rule.value[i]];
        }
        return {name: src[rule.name], value: value}
    }
};

/**
 * 从Array<Object>中抽取Array<Key>
 * @param src
 * @param key
 * @returns {*}
 */
function abstract(src, key) {
    if (src.hasOwnProperty("length")) {
        var ret = [];
        for (var x = 0; x < src.length; x++) {
            if (src[x]) {
                ret.push(src[x][key]);
            }
        }
        return ret;

    }
    return [src[key]];
}

function abstract_obj(src, key) {

    if (src.hasOwnProperty("length")) {
        var ret = [];
        for (var x = 0; x < src.length; x++) {
            var vi = {};
            if (typeof key == 'object') {
                key.forEach(function (data) {
                    vi = $.extend(vi, abstract_obj(src[x], data)[0]);
                })
            } else {
                vi[key] = src[x][key];
            }
            ret.push(vi);
        }
        return ret;

    }
    if (typeof key == "object") {
        var vi = {};
        key.forEach(function (data) {
            vi = $.extend(vi, abstract_obj(src, data)[0]);
        })
        return [vi]
    }
    var obj = {}
    obj[key] = src[key];
    return [obj];
}

//去除arr1中与arr2相同的值，仅限于对象数组
function arry_differ_part(arr1, arr2, key_arr) {
    var arr1_length = arr1.length;
    var arr2_length = arr2.length;
    for (var i = 0; i < arr1_length; i++) {
        var fir_obj = arr1[i];
        for (var j = 0; j < arr2_length; j++) {
            var sec_obj = arr2[j];
            var is_all_same = true;
            for (var k in key_arr) {
                if (fir_obj[key_arr[k]] != sec_obj[key_arr[k]]) {
                    is_all_same = false;
                    break;
                }
            }
            if (is_all_same) {
                arr1.splice(i, 1);
                return arry_differ_part(arr1, arr2, key_arr);
            }
        }

    }
    return arr1;
}

/**
 * 给数据准备照片信息
 * @param src
 * @param rule
 */
function ready_photo(src, rule) {
    var sub, vrule;
    if (typeof (rule) == "object") {
        vrule = rule.from;
        sub = detach_from_cache(src, rule.root.split(","));
    } else {
        sub = src;
        vrule = rule;
    }

    if (sub.hasOwnProperty("length") && sub.length == 0)
        return src;
    var guids = abstract(sub, vrule);
    var fm = []

    for (var x = 0; x < guids.length; x++) {
        if (!cache.photos.hasOwnProperty(guids[x]) && fm.indexOf(guids[x]) < 0) {
            fm.push(Number(guids[x]))
        }
    }
    if (!fm.length) return src;
    var imgs = cloud.ready_photo({guids: fm});
    if (typeof (imgs) != "object" || !imgs.hasOwnProperty("length"))
        return src;

    imgs.forEach(function (v) {
        cache.photos["P" + v.guid.toString()] = v.photo;
    });
    return src;
}

var cloud = {
    // 下属部门
    sub_depart: make_api("sub_depart"),
    //用户
    user_user: make_api("user.user"),
    //家长用户子女信息
    parent_stu: make_api("user.user.student"),
    // 用户类型
    user_type: make_api("user.user_type"),
    // 用户行政级别
    user_level: make_api("user.highest_level"),
    // 用户年级ID
    user_grade_id: make_api("user.user.fk_grade_id"),
    // 用户班级ID
    user_class_id: make_api("user.user.fk_class_id"),
    // 区县列表
    area_list: make_api("area_list.list"),
    //学校
    school_grade_list: make_api("school_list.list"),

    //年级
    grade_list: make_api("grade_list"),
    school_list: make_api("school_list.list"),
    sel_school_list: make_api("school_list.list", {}, any_2_select, {name: "schoolname", value: ["id", "district"]}),
    //
    student_list: make_api("student_list"),
    // 获取区县列表，返回select形式数据
    sel_area_list: make_api("area_list.list", {}, any_2_select, {name: "district", value: ["id"]}),
    // 学年学期
    semester_all_list: make_api("semester_all_list", {}, any_2_select, {
        name: "semester_name",
        value: ["id", "start_date", "end_date"]
    }),
    //学年学期列表
    semester_list: make_api("semester_all_list"),
    //当前学年学期
    semester_current: make_api('semester_current'),
    // 学生总数
    student_count: make_api("student_count.list"),
    student_count_in_semester: make_api("student_count_in_semester.list"),
    // 年级列表
    grade_all_list: make_api("grade_all_list", {}, any_2_select, {
        "name": "grade_name",
        "value": ["id"]
    }),
    grade_list_graduation: make_api("grade_list_graduation", {}, any_2_select, {
        "name": "grade_name",
        "value": ["id"]
    }),
    grade_all_list_ori: make_api("grade_all_list"),
    // 年级列表
    grade_all_list_remark: make_api("grade_all_list", {}, any_2_select, {
        "name": "grade_name",
        "value": ["id", 'remark']
    }),
    //班级
    find_class_simple: make_api("find_class_simple"),
    // 年级学期映射列表
    grade_semester_mapping_list: make_api("grade_semester_mapping_list.list"),
    // 学生头像
    user_photo: function (guid) {
        var str_guid = guid;
        if (typeof (guid) != "string") {
            str_guid = guid.guid;
        }
        var photo = cache.photos["P" + str_guid.toString()];
        if (photo == undefined || photo == "")
            return "5c99f445131fe1001f7ef5c4"
        if (photo.hasOwnProperty("guid"))
            return photo.guid
        if (typeof (photo) == "string" && photo != "")
            return photo;
        return "5c99f445131fe1001f7ef5c4"
    },
    ready_photo: make_api("users_photo.list"),
    //学生信息
    user_info: make_api("student_info"),
    //高中学校区县列表
    heigh_school_area: make_api("heigh_school_area"),
    //高中学校年级列表
    heigh_school_grade: make_api("heigh_school_grade"),


    student_code_by_guid: make_api("student_info.guid"),
    class_all_list: make_api("class_all_list.list", {}, any_2_select, {
        "name": "class_name",
        "value": ["id"]
    }),
    class_list: make_api("class_all_list.list"),
    //  学校年级班级列表
    sel_school_grade_class_list: make_api("grade_list", {}, any_2_select, {
        "name": "grade_name",
        "value": ["grade_id"],
    }),
    school_grade_class_list: make_api("grade_list"),
    // 年级学期列表
    //{"grade_id":37}
    grade_semester_list: make_api("grade_semester_list.list"),
    // 获取班级成员列表
    class_members: make_api("class_members.list"),
    // 用户所在城市
    user_city: make_api("user.user.city"),
    // 用户所在省份
    user_province: make_api("user.user.province"),
    // 用户所在区县
    user_district: make_api("user.user.district"),
    // 用户所在学校ID
    user_school_id: make_api("user.user.fk_school_id"),
    // 用户所在学校
    user_school: make_api("user.user.school_name"),
    // 用户部门ID
    user_depart_id: make_api("user.user.fk_school_id"),
    // 获取当前用户的guid
    user_guid: make_api("user.user.guid"),
    // 获取我教的班级列表
    teach_class_list: make_api("user.user.teach_class_list"),
    // 获取我领导的年级
    teach_grade: make_api("user.user.teach_grade"),
    // 班主任班级集合
    lead_class_list: make_api("user.user.lead_class_list"),
    // 获取我的上级单位
    user_superior: make_api("my_superior.ids_str"),
    // 获取指定单位的上级
    user_superior_by_departid: make_api("superior.ids_str"),
    // 学校用户的区县ID
    school_user_distict_id: make_api("user_district_id"),
    is_teacher: function () {
        var user_level = cloud.user_level();
        return user_level == "6"
    },
    is_grade_leader: function () {
        return cloud.user_level() == "5"
    },
    is_school_leader: function () {
        return cloud.user_level() == "4";
    },
    is_district_leader: function () {
        return cloud.user_level() == "3";
    },
    is_city_leader: function () {
        return cloud.user_level() == "2";
    },
    is_school_user: function () {
        var user_level = cloud.user_level();
        return user_level == "4" || user_level == "6" || user_level == "5";
    },
    is_student: function () {
        return cloud.user_level() == "7";
    },
    // 自动根据身份返回权限内的可操作列表
    auto_grade_list: function (args) {
        var user_level = cloud.user_level();
        var user_type = cloud.user_type();
        if (user_type == 3) {
            var id = cloud.user_user().student.fk_school_id;
            var grade_list = cloud.school_grade_class_list({school_id: id});
        } else {
            var grade_list = cloud.school_grade_class_list();
        }
        var valid_grade_list = [];
        // 教师
        switch (user_level) {
            case "2":
            case "3": {
                valid_grade_list = cloud.grade_all_list_ori();
            }
                break;
            case "5": {
                // 年级领导
                var leader_grade = cloud.teach_grade();
                for (var x = 0; x < grade_list.length; x++) {
                    if (leader_grade.indexOf(grade_list[x].value) >= 0) {
                        valid_grade_list.push(grade_list[x]);
                    }
                }
            }
                break;
            case "6": {
                /**
                 * 为了默认的第一个班级是班主任班级：用unshift
                 * 班主任班级两种情况：
                 * 1、不同年级
                 * 2、同一年级
                 * */
                valid_grade_list = cloud.teach_class_list();

                if (typeof (valid_grade_list) != "object" || !valid_grade_list.hasOwnProperty("length")) valid_grade_list = [];

                var lead_list = cloud.lead_class_list();
                if (typeof (lead_list) != "object" || !lead_list.hasOwnProperty("length")) lead_list = [];
                lead_list.forEach(function (data) {
                    var ret = base_filter(valid_grade_list, "grade_id", data.grade_id, 6);
                    if (ret.length != 0) {
                        var lead_index = ret[0].lead_index;
                        var lead_info = valid_grade_list.splice(lead_index, 1);
                        valid_grade_list.unshift(lead_info[0]);
                        data.class_list.forEach(function (cls) {
                            var cls_ret = base_filter(ret[0].class_list, "class_id", cls.class_id, 6);
                            if (cls_ret.length != 0) {
                                // ret[0].class_list.push(cls);
                                var lead_class = cls_ret[0].lead_index;
                                var lead_class_info = ret[0].class_list.splice(lead_class, 1);
                                ret[0].class_list.unshift(lead_class_info[0]);
                            } else {
                                ret[0].class_list.unshift(cls);
                            }
                        })
                    } else {
                        // valid_grade_list.push(data);
                        valid_grade_list.unshift(data);
                    }
                })
                merge_table(valid_grade_list, ["grade_id"], grade_list, ["grade_id"], "detail");
                valid_grade_list.forEach(function (data) {
                    data.id = data.grade_id;
                });
            }
                break;
            case "7": {
                if (user_type == 3) {
                    var grade_list = cloud.grade_list({school_id: id});
                    var grade_id = cloud.user_user().student.fk_grade_id;
                } else {
                    var grade_list = cloud.grade_list();
                    var grade_id = cloud.user_grade_id();
                }
                valid_grade_list = base_filter(grade_list, "grade_id", grade_id, 7);
            }
                break;
            default: {
                valid_grade_list = grade_list;
                // 返回值统一
                grade_list.forEach(function (data) {
                    data.id = data.grade_id;
                });
            }

        }


        return valid_grade_list;
    },
    // 获取指定学期，年级的班级列表
    sem_class_list: make_api("sem_class_list"),
    //获取指定学校下的年级集合
    school_to_grade: make_api("school_to_grade.list", {}, any_2_select, {
        "name": "grade_name",
        "value": ["id"]
    }),
    //获取指定学校下教师集合
    school_to_teacher: make_api("school_to_teacher"),
    //获取服务器时间
    get_current_time: make_api("get_current_time"),
    //获取上级级当前级信息
    get_dept_high_info: make_api('get_dept_high_info'),
};

function change_remark(x) {
    if (x == "七年级") {
        return 7;
    } else if (x == "八年级") {
        return 8;
    } else {
        return 9;
    }
}
