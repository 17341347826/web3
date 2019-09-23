/**
 * 进度相关接口
 * Created by Weifeng Ma on 2018/5/24 0024.
 */
// level: 1 省 ?
// level:2 市
// level:3 区
// level:4 学校
// 查询体质测评成绩录入进度
// Task.tz_process_eva = make_interface("score/health_input_progress_list", {"__sync__": false}, false);
// 查询体质测评成绩录入进度-新
Task.tz_process_eva = make_interface("score/new_health_input_progress_list", {"__sync__": false}, false);
// 查询学业成绩录入进度
Task.cj_process_eva = make_interface("score/score_input_progress_list", {"__sync__": false}, false);
// 市级查看评价进度
Task.process_eva = make_interface("GrowthRecordBag/usagecount_findbycitygradelistcount", {"__sync__": false}, false);
//申请复议
Task.sqfy_process = make_interface("GrowthRecordBag/dissentCount", {"__sync__": false}, false);
// 日常表现录入进度
Task.rcbx_process = make_interface("GrowthRecordBag/everyday_input_progress", {"__sync__": false}, false);
// 活动上传进度
Task.hd_process = make_interface("GrowthRecordBag/realistic_input_progress", {"__sync__": false}, false);
// 结果进度
Task.jg_process = make_interface("GrowthRecordBag/get_statisti_progress", {"__sync__": false}, false)
//用户活跃度
Task.yfhy_process = make_interface("base/user_stat/sys_used_cnt", {"__sync__": false}, false)
//录入待审核进度
Task.lr_dsh_process = make_interface("GrowthRecordBag/input_audited_progress", {"__sync__": false}, false);
//评价状况监控->审核复议进度
Task.pj_shfy_process = make_interface("GrowthRecordBag/audit_reconsider_progress", {"__sync__": false}, false);


//  查询申请复议接口
function make_sqfy_process(level, match_1, match_2) {
    return function (args, cb) {
        var sems = args["semester"].split("|");
        delete  args["semester"];
        var sem_id = sems[0];
        var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:sem_id});
        var form = {
            __call__: on_date_recv,
            "departmentlevel_type": level,
            "district_name": "",
            "grade_id": "",
            "school_id": "",
            semester_id: sem_id
        };
        form = $.extend(form, args);
        sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
        function on_date_recv(url, args, data) {
            student_count = merge_table(student_count, match_1, data, match_2, "data", 0);
            calc_ext(student_count, [
                ["data.wcl", "{data.yclzl} /  {data.tcyyzl} * 100"]
            ])
            cb && cb(student_count);
        }

        D("sqfy_process.list", form);
    }
};

/**
 *
 * @param args
 city    市（强类型）    string
 district    区（强类型）    string
 fk_class_id    班级id（强类型）    string
 fk_grade_id    年级id（强类型）    string
 fk_school_id    学校id（强类型）    string
 province    省（强类型）    string
 semester:（下拉选择的值） string
 level : 1 省 2市 3区 4学校 5年级
 */
rule_cj_complete = [
    ["cj.num", " {cj.num} > {used_count} ?  {used_count} : {cj.num}"],
    ["tzcp.num", " {tzcp.num} > {used_count} ?  {used_count} : {tzcp.num}"],
    ["cj.wdr", "{used_count} - {cj.num}"],
    ["cj.wcl", "{cj.num} / {used_count} * 100"],
    ["tzcp.wdr", "{used_count} - {tzcp.num}"],
    ["tzcp.wcl", "{tzcp.num} / {used_count} * 100"],
    ["ys.num", " {ys.num} > {used_count} ?  {used_count} : {ys.num}"],
    ["ys.wdr", "{used_count} - {ys.num}"],
    ["ys.wcl", "{ys.num} / {used_count} * 100"],
    ["wcl", "( {cj.wcl} + {tzcp.wcl} + {ys.wcl} ) / 3"],
];
cloud.cj_process_eva = function (args, cb) {
    var level = args.level;
    var sems = args["semester"].split("|");
    delete  args["semester"];
    var sem_id = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
    var count = 1;
    var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:sem_id});

    function on_date_recv(url, args, data) {
        if(level == "3"){
            student_count = merge_table(student_count, ["district",  "grade_id"], data, ["district", "fk_grade_id"], args.kname, 0);
        }
        else if(level == "2"){
            student_count = merge_table(student_count, ["grade_id"], data, ["fk_grade_id"], args.kname, 0);
        }
        else{
            student_count = merge_table(student_count, ["school_id", "grade_id"], data, ["fk_school_id", "fk_grade_id"], args.kname, 0);
        }

        if (count == 3) {
            calc_ext(student_count, rule_cj_complete, true)
            cb && cb(student_count);
        }
        count++;
    }
    sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
    //学业成绩
    var form = {__call__: on_date_recv, kname: "cj", semester_id: sem_id};
    form = $.extend(form, args);
    D("cj_process_eva", form);
    //体质健康
    var form_tz = {__call__: on_date_recv, kname: "tzcp",  semester_id: sem_id};
    form_tz = $.extend(form_tz, args);
    D("tz_process_eva", form_tz);
    //艺术测评
    var form = {__call__: on_date_recv, kname: "ys", semester_id: sem_id};
    args.subject_id = '10000';
    form = $.extend(form, args);
    D("cj_process_eva", form);
};

/**
 *
 * @param   args
 city    市（强类型）    string
 district    区（强类型）    string
 fk_class_id    班级id（强类型）    string
 fk_grade_id    年级id（强类型）    string
 fk_school_id    学校id（强类型）    string
 province    省（强类型）    string
 semester:（下拉选择的值） string
 */
rule_cj_complete_class = [
    ["cj.num", " {cj.num} > {xssl} ?  {xssl} : {cj.num}"],
    ["tzcp.num", " {tzcp.num} > {xssl} ?  {xssl} : {tzcp.num}"],
    ["cj.wdr", "{xssl} - {cj.num}"],
    ["cj.wcl", "{cj.num} / {xssl} * 100"],
    ["tzcp.wdr", "{xssl} - {tzcp.num}"],
    ["tzcp.wcl", "{tzcp.num} / {xssl} * 100"],
    ["ys.num", " {ys.num} > {xssl} ?  {xssl} : {ys.num}"],
    ["ys.wdr", "{xssl} - {ys.num}"],
    ["ys.wcl", "{ys.num} / {xssl} * 100"],
    ["wcl", "( {cj.wcl} + {tzcp.wcl} + {ys.wcl} ) / 3"]
];
cloud.class_cj_process_eva = function (args, cb) {
    var sems = args["semester"].split("|");
    delete  args["semester"];
    var sem_id = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
    var count = 1;
    cloud.sem_class_list({fk_nj_id: args.fk_grade_id, fk_xq_id: Number(sem_id)}, function (url, arg, data) {
        var class_list = data.list;

        function on_date_recv(url, args, data) {
            class_list = merge_table(class_list, ["fk_bj_id"], data, ["fk_class_id"], args.kname, 0);
            if (count == 3) {
                calc_ext(class_list, rule_cj_complete_class)
                cb && cb(class_list);
            }
            count++;
        }
        //学业成绩
        var form = {__call__: on_date_recv, kname: "cj", semester_id: sem_id};
        form = $.extend(form, args);
        D("cj_process_eva", form);
        //体质健康
        var form_tz = {__call__: on_date_recv, kname: "tzcp",  semester_id: sem_id};
        form_tz = $.extend(form_tz, args);
        D("tz_process_eva", form_tz);
        //艺术测评
        var form = {__call__: on_date_recv, kname: "ys", semester_id: sem_id};
        args.subject_id = '10000';
        form = $.extend(form, args);
        D("cj_process_eva", form);

    });
};

function make_usagecount(rank, level, match_1, match_2, findtypes, rule_complete) {
    return function (pms, cb) {
        var semester_arr = pms.semester.split('|');
        var semid = semester_arr[0], start = semester_arr[1], end = semester_arr[2];
        delete pms.semester;
        var form = {
            schoolid: "",
            rank: rank,
            city: "",
            "end_semester": time_2_str(end),
            "start_semester": time_2_str(start),
            __call__: on_date_recv
        };
        form = $.extend(form, pms);
        var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:semid});
        var count = 1;
        sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
        function on_date_recv(url, args, data) {
            var kname = "findtype" + args.findtype;
            student_count = merge_table(student_count, match_1, data, match_2, kname, 0);
            if (count == findtypes.length) {
                calc_ext(student_count, rule_complete)

                cb && cb(student_count);
            }
            count += 1;
        }

        for (var i = 0; i < findtypes.length; i++) {
            var cur_fm = {"findtype": findtypes[i]}
            cur_fm = $.extend(cur_fm, form);
            D("process_eva", cur_fm);
        }
    }
}

// 评价总进度
// 关于评价进度的关联数据计算规则
rule_pj_complete = [
    ["findtype1.wp", "{used_count} - {findtype1.count}"],
    ["findtype1.wcl", "{findtype1.count} / {used_count} * 100"],
    ["findtype2.wp", "{used_count} - {findtype2.count}"],
    ["findtype2.wcl", "{findtype2.count} / {used_count} * 100"],
    ["findtype3.wp", "{used_count} - {findtype3.count}"],
    ["findtype3.wcl", "{findtype3.count} / {used_count} * 100"],
    ["wcl", "( {findtype1.wcl} + {findtype2.wcl} + {findtype3.wcl} ) / 3"]
];
// ->市级
// @param start
// @param enc
cloud.city_process_pj = make_usagecount(1, 2, ["grade_id"], ["gradeid"], ["1", "2", "3"], rule_pj_complete);
// ->区县级
// @param city
// @param start
// @param enc
cloud.area_process_pj = make_usagecount(2, 3, ["district", "grade_id"], ["district", "gradeid"], ["1", "2", "3"], rule_pj_complete);
// -> 校级
// ->区县级
// @param city
// @param start
// @param enc
// @param schoolid
cloud.school_process_pj = make_usagecount(3, 4, ["school_id", "grade_id"], ["schoolid","gradeid"], ["1", "2", "3"], rule_pj_complete);
// -> 校级
// ->区县级
// @param grade_id;
// @param semester
// @param schoolid
// Demo:cloud.class_process_pj({grade_id:38, school_id:2, semester:"7|2018-03-05|2018-07-23"}, function(data){console.info(data)})
rule_class_pj_complete = [
    ["wcl", "( {proc.hp_wcl} + {proc.jsp_wcl} + {proc.zp_wcl} ) / 3"]
];
Task.class_process_pj = make_interface("GrowthRecordBag/evaluate_entry_democratic_class", {__sync__: false});
cloud.class_process_pj = function (pms, cb) {
    var semester_arr = pms.semester.split('|');
    var semid = semester_arr[0], start = semester_arr[1], end = semester_arr[2];
    delete pms.semester;

    var class_count = [];

    function on_date_recv(url, args, data) {
        class_count = merge_table(class_count, ["fk_bj_id"], data, ["class_id"], "proc", 0);
        calc_ext(class_count, rule_class_pj_complete)

        cb && cb(class_count);
    };

    cloud.sem_class_list({fk_nj_id: Number(pms.grade_id), fk_xq_id: Number(semid)}, function (url, arg, data) {
        class_count = class_count.concat(data.list);
        var fm = {
            __call__: on_date_recv,
            school_id: "",
            class_id: "",
            grade_id: pms.grade_id,
            xqjssj: end,
            xqkssj: start
        };
        fm = $.extend(fm, pms);
        D("class_process_pj", fm, {});
    });

};

// 目标与计划进度
rule_mb_complete = [
    ["findtype4.wp", "{used_count} - {findtype4.count}"],
    ["findtype4.wcl", "{findtype4.count} / {used_count} * 100"],
    ["findtype5.wp", "{used_count} - {findtype5.count}"],
    ["findtype5.wcl", "{findtype5.count} / {used_count} * 100"],
    ["wcl", " ( {findtype4.wcl} + {findtype5.wcl} ) / 300"]
]
// ->市级
cloud.city_process_mb = make_usagecount(1, 2, ["grade_id"], ["gradeid"], ["4", "5"], rule_mb_complete);
// ->区县级
cloud.area_process_mb = make_usagecount(1, 3, ["grade_id"], ["gradeid"], ["4", "5"], rule_mb_complete);
// ->校级
cloud.school_process_mb = make_usagecount(3, 4, ["grade_id"], ["gradeid"], ["4", "5"], rule_mb_complete);
// 描述性评价
//  6:自我描述7:同学寄语8:家长寄 9 老师寄语
rule_ms_complete = [
    ["findtype6.wp", "{used_count} - {findtype6.count}"],
    ["findtype6.wcl", "{findtype6.count} / {used_count} * 100"],
    ["findtype7.wp", "{used_count} - {findtype7.count}"],
    ["findtype7.wcl", "{findtype7.count} / {used_count} * 100"],
    ["findtype8.wp", "{used_count} - {findtype8.count}"],
    ["findtype8.wcl", "{findtype8.count} / {used_count} * 100"],
    ["findtype9.wp", "{used_count} - {findtype9.count}"],
    ["findtype9.wcl", "{findtype9.count} / {used_count} * 100"],
    ["wcl", " ( {findtype6.wcl} + {findtype7.wcl}  + {findtype8.wcl}  + {findtype9.wcl} ) / 300"]
]
// ->市级
cloud.city_process_ms = make_usagecount(1, 2, ["grade_id"], ["gradeid"], ["6", "7", "8", "9"], rule_ms_complete);
// ->区县级
cloud.area_process_ms = make_usagecount(1, 3, ["district", "grade_id"], ["district", "gradeid"], ["6", "7", "8", "9"], rule_ms_complete);
// ->校级
cloud.school_process_ms = make_usagecount(3, 4, ["school_id", "grade_id"], ["schoolid", "gradeid"], ["6", "7", "8", "9"], rule_ms_complete);

/**
 *
 district_name    区县名字    string
 grade_id    年级id    string
 school_id    学校id    string
 semester:（下拉选择的值） string
 */
cloud.city_sqfy_process = make_sqfy_process(2, ["grade_id"], ["fk_grade_id"]);
cloud.area_sqfy_process = make_sqfy_process(3, ["grade_id", "district"], ["fk_grade_id", "district"]);
cloud.school_sqfy_process = make_sqfy_process(4, ["grade_id", "schoolname"], ["fk_grade_id", "schoolname"]);

/**
 *  日常表现录入记录
 district_name    区县名字    string
 grade_id    年级id    string
 fk_school_id    学校id    string
 semester:（下拉选择的值） string
 level: city->2 dist->3 school->4
 */
cloud.rcbx_process = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    var level = args.level;
    var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:sems_id});
    var fm = {
        __call__: function (url, args, data) {
            var vlev = level;
            var rule = [];
            if (data.hasOwnProperty("city_cnt")) {
                student_count = merge_table(student_count, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt",0);
                rule.push(["city_cnt.rj", "{city_cnt.total_input_num} / {used_count}"]);
                rule.push(["city_cnt.wsc", "{used_count} - {city_cnt.recorded_num}"]);
                rule.push(["city_cnt.sczb", "{city_cnt.recorded_num} / {used_count}"]);

            }
            if (data.hasOwnProperty(("district_cnt"))) {
                student_count = merge_table(student_count, ["district", "grade_id"], data.district_cnt, ["district_name","fk_grade_id"], "district_cnt");
                rule.push(["district_cnt.rj", "{district_cnt.total_input_num} / {used_count}"]);
                rule.push(["district_cnt.wsc", "{used_count} - {district_cnt.recorded_num}"]);
                rule.push(["district_cnt.sczb", "{district_cnt.recorded_num} / {used_count}"]);
            }
            if (data.hasOwnProperty("school_cnt")) {

                if(vlev == 3||vlev==2)
                    student_count = merge_table(student_count, ["grade_id"], data.school_cnt, ["fk_grade_id"], "school_cnt");
                else
                    student_count = merge_table(student_count, ["school_id", "grade_id"], data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt");

                rule.push(["school_cnt.rj", "{school_cnt.total_input_num} / {used_count}"]);
                rule.push(["school_cnt.wsc", "{used_count} - {school_cnt.recorded_num}"]);
                rule.push(["school_cnt.sczb", "{school_cnt.recorded_num} / {used_count}"]);
            }
            if (data.hasOwnProperty("school_class_cnt")) {
                student_count = merge_table(student_count, ["fk_class_id"], data.school_class_cnt, ["fk_class_id"], "school_class_cnt");
                rule.push(["school_class_cnt.rj", "{school_class_cnt.total_input_num} / {xssl}"]);
                rule.push(["school_class_cnt.wsc", "{xssl} - {school_class_cnt.recorded_num}"]);
                rule.push(["school_class_cnt.sczb", "{school_class_cnt.recorded_num} / {xssl}"]);

            }
            calc_ext(student_count, rule);
            sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
            cb && cb(student_count);
        }, fk_semester_id: Number(sems_id)
    };
    // fm = $.extend(fm, args);
    D("rcbx_process", fm);
};


cloud.school_rcbx_process = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    // var level = cloud.user_level()
    var level = args.level;
    delete args.level;
    //var student_count = cloud.student_count({level: level});
    var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:sems_id});
    var class_count = [];

    function on_date_recv(url, args, data) {
        var vlev = level;
        var rule = [], rule_class = [];
        if (data.hasOwnProperty("city_cnt")) {
            student_count = merge_table(student_count, ["fk_nj_id"], data.city_cnt, ["fk_grade_id"], "city_cnt");
            rule.push(["city_cnt.rj", "{city_cnt.total_input_num} / {used_count}"]);
            rule.push(["city_cnt.wsc", "{used_count} - {city_cnt.recorded_num}"]);
            rule.push(["city_cnt.sczb", "{city_cnt.recorded_num} / {used_count}"]);

        }
        if (data.hasOwnProperty(("district_cnt"))) {
            student_count = merge_table(student_count, ["fk_nj_id"], data.district_cnt, ["fk_grade_id"], "district_cnt");
            rule.push(["district_cnt.rj", "{district_cnt.total_input_num} / {used_count}"]);
            rule.push(["district_cnt.wsc", "{used_count} - {district_cnt.recorded_num}"]);
            rule.push(["district_cnt.sczb", "{district_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty("school_cnt")) {
            if(vlev == 3||vlev==2)
                student_count = merge_table(student_count, ["grade_id"], data.school_cnt, ["fk_grade_id"], "school_cnt");
            else
                student_count = merge_table(student_count, ["school_id", "grade_id"], data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt");

            rule.push(["school_cnt.rj", "{school_cnt.total_input_num} / {used_count}"]);
            rule.push(["school_cnt.wsc", "{used_count} - {school_cnt.recorded_num}"]);
            rule.push(["school_cnt.sczb", "{school_cnt.recorded_num} / {used_count}"]);

        }
        if (data.hasOwnProperty("school_class_cnt")) {
            class_count = merge_table(class_count, ["fk_bj_id"], data.school_class_cnt, ["fk_class_id"], "school_class_cnt", 0);
            rule_class.push(["school_class_cnt.rj", "{school_class_cnt.total_input_num} / {xssl}"]);
            rule_class.push(["school_class_cnt.wsc", "{xssl} - {school_class_cnt.recorded_num}"]);
            rule_class.push(["school_class_cnt.sczb", "{school_class_cnt.recorded_num} / {xssl}"]);
            calc_ext(class_count, rule_class);
        }
        calc_ext(student_count, rule);
        sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
        cb && cb(student_count, class_count);
    }

    var class_load_count = 0;
    args.grade_ids.forEach(function (v) {
        cloud.sem_class_list({fk_nj_id: v, fk_xq_id: Number(sems_id)}, function (url, arg, data) {
            class_load_count++;
            class_count = class_count.concat(data.list);
            if (class_load_count == args.grade_ids.length) {
                var fm = {__call__: on_date_recv, fk_semester_id: Number(sems_id)};
                // fm = $.extend(fm, args);
                D("rcbx_process", fm);
            }
        });
    })


};


/**
 *  活动上传记录
 *  @param args
 *   district_name    区县名字    string 默认不传为统计全部
 *   grade_ids    年级id 数组    array<number> 默认不传为统计全部
 *   fk_school_id    学校id    number 默认不传为统计全部
 *   semester 下拉选择学年学期的值 string
 *   level: city->2 dist->3 school->4
 */
cloud.class_hd_process = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    var class_count = [];
    var class_load_count = 0;

    var student_count = cloud.student_count_in_semester({dj: args.level, fk_xq_id:sems_id});
    delete args.level;

    function on_date_recv(url, args, data) {
        var rule = [], rule_class = [];
        if (data.hasOwnProperty("city_cnt")) {
            student_count = merge_table(student_count, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt");
            rule.push(["city_cnt.rj", "{city_cnt.total_input_num} / {used_count}"]);
            rule.push(["city_cnt.wsc", "{used_count} - {city_cnt.recorded_num}"]);
            rule.push(["city_cnt.sczb", "{city_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty(("district_cnt"))) {
            student_count = merge_table(student_count, ["district", "grade_id"], data.district_cnt, ["district_name", "fk_grade_id"], "district_cnt");
            rule.push(["district_cnt.rj", "{district_cnt.total_input_num} / {used_count}"]);
            rule.push(["district_cnt.wsc", "{used_count} - {district_cnt.recorded_num}"]);
            rule.push(["district_cnt.sczb", "{district_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty("school_cnt")) {
            student_count = merge_table(student_count, ["school_id", "grade_id"], data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt");
            rule.push(["school_cnt.rj", "{school_cnt.lx_num} / {used_count}"]);
            rule.push(["school_cnt.wsc", "{used_count} - {school_cnt.recorded_num}"]);
            rule.push(["school_cnt.sczb", "{school_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty("school_class_cnt")) {
            class_count = merge_table(class_count, ["fk_bj_id"], data.school_class_cnt, ["fk_class_id"], "school_class_cnt", 0);
            rule_class.push(["school_class_cnt.rj", "{school_class_cnt.lx_num} / {xssl}"]);
            rule_class.push(["school_class_cnt.wsc", "{xssl} - {school_class_cnt.recorded_num}"]);
            rule_class.push(["school_class_cnt.sczb", "{school_class_cnt.recorded_num} / {xssl}"]);
            calc_ext(class_count, rule_class);
        }
        calc_ext(student_count, rule);
        sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
        cb && cb(student_count, class_count);
    };

    args.grade_ids.forEach(function (v) {
        cloud.sem_class_list({fk_nj_id: v, fk_xq_id: Number(sems_id)}, function (url, arg, data) {
            class_load_count++;
            class_count = class_count.concat(data.list);
            if (class_load_count == args.grade_ids.length) {
                var fm = {__call__: on_date_recv, fk_semester_id: sems_id};
                // fm = $.extend(fm, args);
                D("hd_process", fm);
            }
        });
    })

}

/**
 *  活动上传记录
 *  @param args
 *   district_name    区县名字    string 默认不传为统计全部
 *   grade_ids    年级id 数组    array<number> 默认不传为统计全部
 *   fk_school_id    学校id    number 默认不传为统计全部
 *   semester 下拉选择学年学期的值 string
 *   level: city->2 dist->3 school->4
 */
cloud.hd_process = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    // var level = cloud.user_level();
    var level = args.level;
    delete args.level;
    var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:sems_id});
    function on_date_recv(url, args, data) {
        var rule = [];
        if (data.hasOwnProperty("city_cnt")) {
            student_count = merge_table(student_count, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt", 0);
            rule.push(["city_cnt.rj", "{city_cnt.total_input_num} / {used_count}"]);
            rule.push(["city_cnt.wsc", "{used_count} - {city_cnt.recorded_num}"]);
            rule.push(["city_cnt.sczb", "{city_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty(("district_cnt"))) {
            student_count = merge_table(student_count, ["district", "grade_id"], data.district_cnt, ["district_name", "fk_grade_id"], "district_cnt", 0);
            rule.push(["district_cnt.rj", "{district_cnt.total_input_num} / {used_count}"]);
            rule.push(["district_cnt.wsc", "{used_count} - {district_cnt.recorded_num}"]);
            rule.push(["district_cnt.sczb", "{district_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty("school_cnt")) {
            student_count = merge_table(student_count, ["school_id", "grade_id"], data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt", 0);
            rule.push(["school_cnt.rj", "{school_cnt.total_input_num} / {used_count}"]);
            rule.push(["school_cnt.wsc", "{used_count} - {school_cnt.recorded_num}"]);
            rule.push(["school_cnt.sczb", "{school_cnt.recorded_num} / {used_count}"]);
        }
        sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);
        calc_ext(student_count, rule);
        cb && cb(student_count);
    };

    var fm = {__call__: on_date_recv, fk_semester_id: sems_id};
    // fm = $.extend(fm, args);
    D("hd_process", fm);
}
const LEVEL = {
    CITY:2,
    AREA:3,
    SCHOOL:4,
    CLASS:5
}
cloud.hd_process1 = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    var level = args.level;
    delete args.level;
    var student_count_city,student_count_area,student_count_school;
    if(level.indexOf(LEVEL.CITY)!=-1){
        student_count_city = cloud.student_count_in_semester({dj: LEVEL.CITY, fk_xq_id:sems_id});
    }
    if(level.indexOf(LEVEL.AREA)!=-1){
        student_count_area = cloud.student_count_in_semester({dj: LEVEL.AREA, fk_xq_id:sems_id});
    }
    if(level.indexOf(LEVEL.SCHOOL)!=-1){
        student_count_school = cloud.student_count_in_semester({dj: LEVEL.SCHOOL, fk_xq_id:sems_id});
    }

    function on_date_recv(url, args, data) {
        if(!data) return
        var rule = [];
        if (data.hasOwnProperty("city_cnt")) {
            student_count_city = merge_table(student_count_city, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt", 0);
            rule.push(["city_cnt.rj", "{city_cnt.total_input_num} / {used_count}"]);
            rule.push(["city_cnt.wsc", "{used_count} - {city_cnt.recorded_num}"]);
            rule.push(["city_cnt.sczb", "{city_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty(("district_cnt"))) {
            student_count_area = merge_table(student_count_area, ["district", "grade_id"], data.district_cnt, ["district_name", "fk_grade_id"], "district_cnt", 0);
            rule.push(["district_cnt.rj", "{district_cnt.total_input_num} / {used_count}"]);
            rule.push(["district_cnt.wsc", "{used_count} - {district_cnt.recorded_num}"]);
            rule.push(["district_cnt.sczb", "{district_cnt.recorded_num} / {used_count}"]);
        }
        if (data.hasOwnProperty("school_cnt")) {
            student_count_school = merge_table(student_count_school, ["school_id", "grade_id"], data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt", 0);
            rule.push(["school_cnt.rj", "{school_cnt.total_input_num} / {used_count}"]);
            rule.push(["school_cnt.wsc", "{used_count} - {school_cnt.recorded_num}"]);
            rule.push(["school_cnt.sczb", "{school_cnt.recorded_num} / {used_count}"]);
        }
        if(student_count_city&& student_count_city.length>0){
            sort_by(student_count_city, ["+city", "+district", "+school_id", "+grade_name"]);
            calc_ext(student_count_city, rule);
        }
        if(student_count_area && student_count_area.length>0){
            sort_by(student_count_area, ["+city", "+district", "+school_id", "+grade_name"]);
            calc_ext(student_count_area, rule);
        }
        if(student_count_school && student_count_school.length>0){
            sort_by(student_count_school, ["+city", "+district", "+school_id", "+grade_name"]);
            calc_ext(student_count_school, rule);
        }
        var obj = {
            city:student_count_city,
            area:student_count_area,
            school:student_count_school
        }

        cb && cb(obj);
    };

    var fm = {__call__: on_date_recv, fk_semester_id: sems_id};
    // fm = $.extend(fm, args);
    D("hd_process", fm);
}


cloud.rcbx_process1 = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    var level = args.level;
    var student_count_city,student_count_area,student_count_school,student_count_class;
    if(level.indexOf(LEVEL.CITY)!=-1){
        student_count_city = cloud.student_count_in_semester({dj: LEVEL.CITY, fk_xq_id:sems_id});
    }
    if(level.indexOf(LEVEL.AREA)!=-1){
        student_count_area = cloud.student_count_in_semester({dj: LEVEL.AREA, fk_xq_id:sems_id});
    }
    if(level.indexOf(LEVEL.SCHOOL)!=-1){
        student_count_school = cloud.student_count_in_semester({dj: LEVEL.SCHOOL, fk_xq_id:sems_id});
    }
    if(level.indexOf(LEVEL.CLASS)!=-1){
        student_count_class = cloud.student_count_in_semester({dj: LEVEL.CLASS, fk_xq_id:sems_id});
    }

    var fm = {
        __call__: function (url, args, data) {
            var vlev = level;
            var rule = [];
            if(!data) return
            if (data.hasOwnProperty("city_cnt")) {
                student_count_city = merge_table(student_count_city, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt",0);
                rule.push(["city_cnt.rj", "{city_cnt.total_input_num} / {used_count}"]);
                rule.push(["city_cnt.wsc", "{used_count} - {city_cnt.recorded_num}"]);
                rule.push(["city_cnt.sczb", "{city_cnt.recorded_num} / {used_count}"]);

            }
            if (data.hasOwnProperty(("district_cnt"))) {
                student_count_area = merge_table(student_count_area, ["district", "grade_id"], data.district_cnt, ["district_name","fk_grade_id"], "district_cnt");
                rule.push(["district_cnt.rj", "{district_cnt.total_input_num} / {used_count}"]);
                rule.push(["district_cnt.wsc", "{used_count} - {district_cnt.recorded_num}"]);
                rule.push(["district_cnt.sczb", "{district_cnt.recorded_num} / {used_count}"]);
            }
            if (data.hasOwnProperty("school_cnt")) {

                if(vlev == 3||vlev==2)
                    student_count_school = merge_table(student_count_school, ["grade_id"], data.school_cnt, ["fk_grade_id"], "school_cnt");
                else
                    student_count_school = merge_table(student_count_school, ["school_id", "grade_id"], data.school_cnt, ["fk_school_id", "fk_grade_id"], "school_cnt");

                rule.push(["school_cnt.rj", "{school_cnt.total_input_num} / {used_count}"]);
                rule.push(["school_cnt.wsc", "{used_count} - {school_cnt.recorded_num}"]);
                rule.push(["school_cnt.sczb", "{school_cnt.recorded_num} / {used_count}"]);
            }
            if (data.hasOwnProperty("school_class_cnt")) {
                student_count_class = merge_table(student_count_class, ["fk_class_id"], data.school_class_cnt, ["fk_class_id"], "school_class_cnt");
                rule.push(["school_class_cnt.rj", "{school_class_cnt.total_input_num} / {xssl}"]);
                rule.push(["school_class_cnt.wsc", "{xssl} - {school_class_cnt.recorded_num}"]);
                rule.push(["school_class_cnt.sczb", "{school_class_cnt.recorded_num} / {xssl}"]);
            }
            if(student_count_city&& student_count_city.length>0){
                sort_by(student_count_city, ["+city", "+district", "+school_id", "+grade_name"]);
                calc_ext(student_count_city, rule);
            }
            if(student_count_area && student_count_area.length>0){
                sort_by(student_count_area, ["+city", "+district", "+school_id", "+grade_name"]);
                calc_ext(student_count_area, rule);
            }
            if(student_count_school && student_count_school.length>0){
                sort_by(student_count_school, ["+city", "+district", "+school_id", "+grade_name"]);
                calc_ext(student_count_school, rule);
            }
            if(student_count_class && student_count_class.length>0){
                sort_by(student_count_class, ["+city", "+district", "+school_id", "+grade_name"]);
                calc_ext(student_count_class, rule);
            }

            var obj = {
                city:student_count_city,
                area:student_count_area,
                school:student_count_school,
                class:student_count_class
            }
            cb && cb(obj);
        }, fk_semester_id: Number(sems_id)
    };
    // fm = $.extend(fm, args);
    D("rcbx_process", fm);
};
cloud.lr_dsh_process1 = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    var level = args.level;
    delete args.level;
    var param = {__call__: on_date_recv, fk_semester_id: Number(sems_id)};
    var student_count_city,student_count_area,student_count_school;
    if(level.indexOf(LEVEL.CITY)!=-1){
        student_count_city = cloud.student_count_in_semester({dj: LEVEL.CITY, fk_xq_id:sems_id});
        sort_by(student_count_city, ["+city", "+district", "+school_id", "+grade_name"]);
    }
    if(level.indexOf(LEVEL.AREA)!=-1){
        student_count_area = cloud.student_count_in_semester({dj: LEVEL.AREA, fk_xq_id:sems_id});
        sort_by(student_count_area, ["+city", "+district", "+school_id", "+grade_name"]);
    }
    if(level.indexOf(LEVEL.SCHOOL)!=-1){
        student_count_school = cloud.student_count_in_semester({dj: LEVEL.SCHOOL, fk_xq_id:sems_id});
        sort_by(student_count_school, ["+city", "+district", "+school_id", "+grade_name"]);
    }

    function on_date_recv(url, args, data) {
        if(!data) return
        if (data.hasOwnProperty("city_cnt")) {
            student_count_city = merge_table(student_count_city, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt",0);
        }
        if (data.hasOwnProperty(("district_cnt"))) {
            student_count_area = merge_table(student_count_area, ["district","grade_id"], data.district_cnt, ["district_name","fk_grade_id"], "district_cnt",0);
        }
        if (data.hasOwnProperty("school_cnt")) {
            student_count_school = merge_table(student_count_school, ["school_id","grade_id"], data.school_cnt, ["fk_school_id","fk_grade_id"], "school_cnt",0);
        }
        var obj = {
            city:student_count_city,
            area:student_count_area,
            school:student_count_school,
        }
        cb && cb(obj);
    }

    D("lr_dsh_process", param);
};
/**
 *  录入待审核
 *  @author melody
 *  @param args
 *   district_name    区县名字    string 默认不传为统计全部
 *   grade_ids    年级id 数组    array<number> 默认不传为统计全部
 *   fk_school_id    学校id    number 默认不传为统计全部
 *   semester 下拉选择学年学期的值 string
 level: city->2 dist->3 school->4
 */
cloud.lr_dsh_process = function (args, cb) {
    var sems_id = args.semester.split("|")[0];
    delete args.semester;
    var level = args.level;
    delete args.level;
    var param = {__call__: on_date_recv, fk_semester_id: Number(sems_id)};
    var student_count = cloud.student_count_in_semester({dj: level, fk_xq_id:sems_id});
    sort_by(student_count, ["+city", "+district", "+school_id", "+grade_name"]);

    function on_date_recv(url, args, data) {

        if (data.hasOwnProperty("city_cnt")) {
            student_count = merge_table(student_count, ["grade_id"], data.city_cnt, ["fk_grade_id"], "city_cnt",0);
        }
        if (data.hasOwnProperty(("district_cnt"))) {
            student_count = merge_table(student_count, ["district","grade_id"], data.district_cnt, ["district_name","fk_grade_id"], "district_cnt",0);
        }
        if (data.hasOwnProperty("school_cnt")) {
            student_count = merge_table(student_count, ["school_id","grade_id"], data.school_cnt, ["fk_school_id","fk_grade_id"], "school_cnt",0);
        }
        cb && cb(student_count);
    }

    D("lr_dsh_process", param);
};

rule_jq_complete = [
    ["wcl", "{effective_num} / {total_num} * 100"]
]

//  生成结果面页：结果进度
/*	1学习分组2区县分组3市分组
city	市	string	眉山市
district	区县	string	东坡区
grade_id	班级id	number
school_id	学校	number	2
* */
function make_jg_process(hierarchy, rule_complete) {
    return function (args, cb) {
        var sems = args["semester"].split("|");
        delete args["semester"];
        var semid = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
        var form = {
            __call__: on_date_recv,
            "hierarchy": hierarchy,
            "city": "",
            "district": "",
            "school_id": "",
            "fk_xq_id":semid
            // start_date: start,
            // end_date: end
        };
        form = $.extend(form, args);

        function on_date_recv(url, args, data) {
            calc_ext(data, rule_complete)
            cb && cb(data);
        }

        D("jg_process", form);
    }
};
cloud.city_jg_process = make_jg_process(3, rule_jq_complete);
cloud.area_jg_process = make_jg_process(2, rule_jq_complete);
cloud.school_jg_process = make_jg_process(1, rule_jq_complete);
// 活跃度
/**
 district    区县    string
 grade_id    年级id    number
 level    统计等级    number    【必填】2-市州级；3-区县级；4-校级；5-班级
 school    学校名称    string
 */
cloud.city_yfhy_process = make_api("yfhy_process", {level: 2});
cloud.area_yfhy_process = make_api("yfhy_process", {level: 3});
cloud.school_yfhy_process = make_api("yfhy_process", {level: 4});
cloud.class_yfhy_process = make_api("yfhy_process", {level: 5});
////评价状况监控->审核复议进度
cloud.pj_shfy_process = make_api("pj_shfy_process");
