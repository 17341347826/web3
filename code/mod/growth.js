/**
 * 成长档案相关接口
 * Created by melody 2018/5/29 1900.
 */
// 获取学生档案信息
Task.get_stu_info = make_interface("base/student/stu_info", {"__sync__": false}, false);
Task.get_stu_info_sync = make_interface("base/student/stu_info", {}, false);
// 获取学生用户信息
Task.get_stu_user_info = make_interface("base/baseUser/get_appoint_student_user.action", {"__sync__": false}, false);
// 获取个性名片列表
Task.get_per_card_list = make_interface("GrowthRecordBag/card_list", {"__sync__": false}, false);
// 获取目标与计划列表
Task.get_target_plan_list = make_interface("GrowthRecordBag/targetplan_findTargetplan", {"__sync__": false}, false);
// 获取成长记录列表（日常表现和个性特长表现/综合实践活动/获奖情况/成长记录/学期评价）
Task.get_growth_all_list = make_interface("GrowthRecordBag/allList_findByAllList", {"__sync__": false}, false);
// 获取学业成绩列表
Task.get_studies_score_list = make_interface("score/list_score_year", {"__sync__": false}, false);
Task.get_studies_score_list_v2 = make_interface("score/list_score_year_v2", {"__sync__": false}, false);
// 获取体质健康成绩列表
Task.get_health_score_list = make_interface("score/list_health_score_year", {"__sync__": false}, false);
// 获取艺术素质列表
Task.get_art_quality_list = make_interface("score/list_score_my", {"__sync__": false}, false);
// 获取毕业评价表头（一级指标）
Task.get_bybg_eval_thead = make_interface("Indexmaintain/bybg_get_all_index_name", {"__sync__": false}, false);
// 获取毕业评价列表
Task.get_bybg_eval_list_ex = make_interface("Indexmaintain/bybg_operation_by_count_result_view", {"__sync__": false}, false,
    {type: "pip", path: "list", content: ["index_name|split,", "index_value|split,", "index_id|split,"]});
Task.get_bybg_eval_list = make_interface("Indexmaintain/bybg_operation_by_count_result_view", {"__sync__": false}, false);

// 获取日常表现列表
Task.get_every_list = make_interface("everyday/get_list_everyday", {"__sync__": false, "const#id": 0}, false, {
    "content": ["attachment|json"],
    "type": "pip"
});
// 查询评价等级
Task.bgc_pjdj_set = make_interface("Indexmaintain/indexmaintain_findStuGradeInfo", {"__sync__": false}, false, {
    "type": "pip",
    "content": ["gradeNameOne|split,", "percentileOne|split,"]
});
// 学生查看为遴选的综合时间
Task.stu_zhsj_check = make_interface("GrowthRecordBag/student_list_up_data", {"__sync__": false}, false);
cloud.stu_zhsj_check = make_api("stu_zhsj_check");
// 学生查看自己的综合时间
Task.stu_zhsj = make_interface("GrowthRecordBag/student_list_data", {"__sync__": false}, false);
cloud.stu_zhsj = make_api("stu_zhsj");

cloud.bgc_pjdj_set = make_api("bgc_pjdj_set");
// 查询评价维度
Task.bgc_wd_set = make_interface("Indexmaintain/get_yjzb_title", {__sync__: false}, false);
/**
 * @param subjectId:评价项目ID
 * @type {Function}
 */
cloud.bgc_wd_set = make_api("bgc_wd_set");
// 查询老师、家长寄语
Task.bgc_jy_set = make_interface("everyday/get_remarl_by_student", {__sync__: false}, false);
/**
 * @param grade:年级
 * @param semester:学期ID
 * @param student_id:学生ID
 * @type {Function}
 */
cloud.bgc_jy_set = make_api("bgc_jy_set");
// 同学寄语
Task.bgc_txjy_set = make_interface("everyday/get_mutual_remarl_by_student", {__sync__: false}, false);
/**
 * @param grade:年级
 * @param semester:学期ID
 * @param party_id:学生ID
 * @type {Function}
 */
cloud.bgc_txjy_set = make_api("bgc_txjy_set");
// 品德发展
Task.bgc_pdfz_set = make_interface("GrowthRecordBag/morality_findByMoralityTypeCount", {__sync__: false}, false);
/**
 * @param end_time:学期结束时间
 * @param start_time:学期开始时间
 * @param owner: 学生guid
 * @type {Function}
 */
cloud.bgc_pdfz_set = make_api("bgc_pdfz_set");
// 品德发展活动列表
Task.bgc_pdfz_detail = make_interface("GrowthRecordBag/morality_findByMoralityList", {__sync__: false}, false);
/**
 * 品德发展详情
 * @param end_time:学期结束时间
 * @param start_time:学期开始时间
 * @param owner: 学生guid
 * @type {Function}
 */
cloud.bgc_pdfz_detail = make_api("bgc_pdfz_detail");
// 国标课程
Task.bgc_kc_set = make_interface("score/list_score_by_guid", {__sync__: false, subject_id: "1000"}, false);
/**
 * @param guid:学生GUID
 * @param semester_id:学期ID
 * @type {Function}
 */
cloud.bgc_kc_set = make_api("bgc_kc_set",{subject_id:"1000"});
// 体育锻炼情况
Task.bgc_ty_set = make_interface("score/excercise_query", {__sync__: false}, false);
/**
 * @param code:学籍号
 * @param phase:学期
 * @param year:学年
 * @type {Function}
 */
cloud.bgc_ty_set = make_api("bgc_ty_set");
// 研究性学习
Task.bgc_yj_set = make_interface("GrowthRecordBag/study_findStudyCurriculum", {__sync__: false});
/**
 * @param end_date:学期结束时间
 * @param start_date:学期开始时间
 * @param owner: 学生guid
 * @type {Function}
 */
cloud.bgc_yj_set = make_api("bgc_yj_set");
// 研究性学习详情
Task.bgc_yj_detail = make_interface("GrowthRecordBag/study_findStudyInfo", {__sync__: false});
/**
 * @param end_date:学期结束时间
 * @param start_date:学期开始时间
 * @param owner: 学生guid
 * @type {Function}
 */
cloud.bgc_yj_detail = make_api("bgc_yj_detail");
// 身心健康
Task.bgc_sxjk_set = make_interface("GrowthRecordBag/healthActivity_findHealthActivity", {__sync__: false}, false);
/**
 *
 * @param hea_endDate    : 结束时间    string
 *  @param hea_ownerid    : 学生ID    number
 *  @param hea_startDate    : 起始时间    string
 */
cloud.bgc_sxjk_set = make_api("bgc_sxjk_set");
// 身心健康详情
Task.bgc_sxjk_detail = make_interface("GrowthRecordBag/healthActivity_findHealthActivityInfo", {__sync__: false}, false);
/**
 * @param hea_endDate    : 结束时间    string
 *  @param hea_ownerid    : 学生ID    number
 *  @param hea_startDate    : 起始时间    string
 */
cloud.bgc_sxjk_detail = make_api("bgc_sxjk_detail");
// 艺术素养
Task.bgc_ys_set = make_interface("GrowthRecordBag/artactivity_findbyartactivity", {__sync__: false}, false);
/**
 *@param art_end_time    : 结束时间    string
 *@param art_ownerid    : 学生ID    number
 *@param art_start_time    :开始时间    string
 */
cloud.bgc_ys_set = make_api("bgc_ys_set");
// 艺术素养详情
Task.bgc_ys_detail = make_interface("GrowthRecordBag/artactivity_findbyartactivityInfo", {__sync__: false}, false);
/**
 *@param art_end_time    : 结束时间    string
 *@param art_ownerid    : 学生ID    number
 *@param art_start_time    :开始时间    string
 *@type {Function}
 */
cloud.bgc_ys_detail = make_api("bgc_ys_detail");
// 艺术测评
Task.bgc_yscp_set = make_interface("score/get_my_art", {__sync__: false}, false);
/**
 * @param join_start:开始时间
 * @param join_end:结束时间
 * @param guid:学生guid
 * @type {Function}
 */
cloud.bgc_yscp_set = make_api("bgc_yscp_set");
// 作品作业
Task.bgc_zpzy_set = make_interface("GrowthRecordBag/product_findByProductTypeCount", {__sync__: false}, false);
/**
 * @param:end_date    结束时间    string
 *    @param:owner    :guid    number
 *    @param:start_date    开始时间    string
 * @type {Function}
 */
cloud.bgc_zpzy_set = make_api("bgc_zpzy_set");
// 作品作业-详细集合
Task.bgc_zpzy_detail = make_interface("GrowthRecordBag/product_findByProductList", {__sync__: false}, false);
/**
 * @param:end_date    结束时间    string
 *    @param:owner    :guid    number
 *    @param:start_date    开始时间    string
 * @type {Function}
 */
cloud.bgc_zpzy_detail = make_api("bgc_zpzy_detail");
// 报告册社会实践
Task.bgc_shsj_set = make_interface("GrowthRecordBag/practice_findByPracticeTypeCount", {"__sync__": false}, false);
/**
 * end_date    结束时间    string
 *    owner    guid    number
 *    start_date    开始时间    string
 * @type {Function}
 */
cloud.bgc_shsj_set = make_api("bgc_shsj_set");
// 社会实践详情
Task.bgc_shsj_detail = make_interface("GrowthRecordBag/practice_findByPracticeList", {__sync__: false}, false);
/**
 * @param:end_date    结束时间    string
 *    @param:owner    guid    number
 *    @param:start_date    开始时间    string
 * @type {Function}
 */
cloud.bgc_shsj_detail = make_api("bgc_shsj_detail");
// 成就奖励
Task.bgc_cjjy_set = make_interface("GrowthRecordBag/achievement_findByAchievementTypeCount", {__sync__: false}, false);
/**
 *ach_end_dates    :开始时间    string
 *ach_ownerid    :guid    number
 *ach_start_dates:    结束时间    string
 * @type {Function}
 */
cloud.bgc_cjjy_set = make_api("bgc_cjjy_set");

/**
 * 获取学生档案信息
 * @author melody
 * @param args
 @param guid 学生guid(必传)    number
 */
cloud.get_stu_info = make_api("get_stu_info");
cloud.get_stu_info_code = make_api("get_stu_info_sync.student_code");

/**
 * 获取学生用户信息
 * @author melody
 * @param args
 guid 学生guid(必传)    number
 */
cloud.get_stu_user_info = make_api("get_stu_user_info");

/**
 * 获取个性名片列表
 * @author melody
 * @param args
 guid 学生guid(必传)    number
 */
cloud.get_per_card_list = make_api("get_per_card_list");

/**
 * 获取目标与计划列表
 * @author melody
 * @param args
 gradeID    年级id
 tar_ownerid    学生guid(必传) number
 tar_year 当前学生多少级<2016> number
 */
cloud.get_target_plan_list = make_api("get_target_plan_list");

/**
 * 获取学生的成长记录列表（日常表现和个性特长表现/综合实践活动/获奖情况/成长记录/学期评价）
 * @author melody
 fk_grade_id 年级id(类型为学期评价必传)    number
 fk_semester_id    学年学期id    number
 guid    学生guid(必传)    number
 listType 模块类型(必传)    number    3:获奖情况 4:综合实践活动 8:日常表现和个性特长 9:成长记录 10:学期评价
 workid    单位id(类型为学期评价必传)    number
 */
cloud.get_growth_all_list = make_api("get_growth_all_list");

function make_growth_all(args, cb) {
    var param = {__call__: on_date_recv};
    param = $.extend(param, args);
    var data = D("get_growth_all_list", param);

    function on_date_recv(url, args, data) {
        if (isNull(data)) return;
        if (args.listType == 3) {
            cb && cb(data.list);
        } //获奖情况
        var semester_list = cloud.grade_semester_mapping_list;
        if (args.listType == 4) { //综合实践活动
            var total_list = merge_table(semester_list, ["id"], data.total_list, ["fk_semester_id"], "zh_practice_list");
            cb && cb({total_list: total_list, detail_list: data.list});
        }
        if (args.listType == 8) { //日常表现和个性特长
            var list = merge_table(semester_list, ["id"], data, ["fk_semester_id"], "rcbx_gxtc_list");
            cb && cb(list);
        }
        if (args.listType == 9) { //成长记录
            var list = merge_table(semester_list, ["id"], data, ["fk_semester_id"], "remark_list");
            cb && cb(list);
        }
        if (args.listType == 10) { //学期评价

            cb && cb(data);

            // var thead = ["学期"];
            // //一级指标项 列表头遍历
            // for(var i = 0; i < data.evaluate_grade_list.length; i++){ thead.push(data.evaluate_grade_list[i].signname1); }
            // thead.push("学生日常评价加分");
            // thead.push("累计等分");
            // thead.push("评价等级");
            //
            // //将一级指标与学生日常评价加分/累计等分/评价等级 组装
            // var tbody = merge_table(semester_list, ["id"], data.evaluate_grade_list, ["semester_id"], "term_eval_list");
            // tbody = merge_table(tbody, ["semester_id"], data, ["semester_id"], "term_eval_list");
            // var table = {thead: thead,tbody: tbody};
            // cb && cb(table);
        }
    }

    return data;
}

/**
 * 成长档案：1、日常表现和个性特长(日常表现、个性特长和得分，全用)
 * 2、综合实践活动（只有得分用）
 * */
Task.get_myCount_analysis = make_interface("Indexmaintain/getMyCountAnalysis", {"__sync__": false}, false);
cloud.get_myCount_analysis = make_api("get_myCount_analysis");

/**
 * 获取学业成绩列表
 * @author melody
 fk_school_id    学校id    string
 guid    学生guid    number
 */
cloud.get_studies_score_list = make_api("get_studies_score_list");
cloud.get_studies_score_list_v2 = make_api("get_studies_score_list_v2");

function make_studies_score(args, cb) {
    var param = {__call__: on_date_recv};
    param = $.extend(param, args);

    D("get_studies_score_list", param);

    function on_date_recv(url, args, data) {
        var semester_list = cloud.grade_semester_mapping_list;
        var thead = ["学科"];
        //学期 列表头遍历
        for (var i = 0; i < semester_list.length; i++) {
            thead.push(semester_list[i].remark);
        }

        var tbody = [];
        for (var c_key in data.course_list) {
            var extend = [];
            for (var j = 0; j < data.score_list.length; j++) {
                for (var k = 0; k < semester_list.length; k++) {
                    if (data.score_list[j].semester_id = semester_list[k].id) {
                        var temp = data.score_list[i][c_key];
                        extend.push(temp);
                    }
                }
            }
            tbody.push(extend);
        }

        var table = {thead: thead, tbody: tbody};
        cb && cb(table);
    }
}

/**
 * 获取体质健康成绩列表
 * @author melody
 fk_school_id    学校id    string
 guid    学生guid    number
 */
cloud.get_health_score_list = make_api("get_health_score_list");

function make_health_score(args, cb) {
    var param = {__call__: on_date_recv};
    param = $.extend(param, args);
    D("get_health_score_list", param);

    function on_date_recv(url, args, data) {
        cb && cb(semester_list);
    }
}
//获取体质健康成绩列表新的-成长记录袋
Task.get_new_health_score_list = make_interface("score/list_new_health_score_year", {__sync__: false}, false);
cloud.get_new_health_score_list = make_api("get_new_health_score_list");

/**
 * 获取艺术素质列表
 * @author melody
 code    学籍号    string    可选
 due_in    单课详情    object    可选
 bjks    是否毕业考试    number    可选
 qmks    是否期末考试    number    可选
 school_id    学校ID    number    可选
 subject_id    课程ID    number    可选
 */
cloud.get_art_quality_list = make_api("get_art_quality_list");

/**
 * 市级用户获取该行政区域下的学生日常表现已归档列表
 * @type {Function}
 */
//cloud.city_get_everyday_list = make_api("get_every_list.list",{status:5, rows:15});
cloud.city_get_everyday_list = function (args, cb) {
    var form = {status: 5, rows: 15, offset: 0};
    if (args.hasOwnProperty("semester")) {
        var sem = args.semester.split("|")
        form.start_date = time_2_str(sem[1]);
        form.end_date = time_2_str(sem[2]);
        delete args.semester;
    }
    form = $.extend(form, args);
    D("get_every_list.list", form, cb);
};

// 筛选查询日常表现
Task.list_everyday = make_interface("everyday/list_everyday_by", {__sync__: false}, false, {
    "content": ["attachment|json"],
    "type": "pip"
});
/**
 *
 * @param: code    学籍号    string
 * @param: district    区县名称    string
 * @param:fk_grade_id    年级id    number
 * @param:fk_school_id    学校id    number
 * @param:fk_semester_id    学期id    number
 */
cloud.list_everyday = make_api("list_everyday.list", {rows: 15, offset: 0}, ready_photo, "guid");
cloud.list_everyday_x = make_api("list_everyday", {}, ready_photo, "guid");

/**
 * 按班级查看日常表现公示列表
 * @type {{url: *, params: *, cache: *, after: *}}
 */
Task.list_everyday_class_rc = make_interface("GrowthRecordBag/class_publicity_list_rc", {__sync__: false}, false);
cloud.list_everyday_class_rc = make_api("list_everyday_class_rc", {rows: 15, offset: 0});

/**
 * 按班级查看日常表现上传进度
 @param class_id    班级id
 @param grade_id    年级id
 @param semester_id    学期id
 */
Task.class_process_rc = make_interface("GrowthRecordBag/evaluate_entry_dailyPerformanceStu", {__sync__: false}, false);
cloud.class_process_rc = make_api("class_process_rc");
/**
 * 按班级查看日常表现上传进度详情，以学生为单位
 */
Task.class_process_detail_rc = make_interface("GrowthRecordBag/evaluate_entry_dailyPerformanceClass", {__sync__: false}, false);
cloud.class_process_detail_rc = make_api("class_process_detail_rc");
/**
 * 按班级查看日常表现上传进度详情，以学生为单位
 */
Task.class_rcbx_input_progress = make_interface("GrowthRecordBag/rcbx_input_progress", {__sync__: false}, false);
cloud.class_rcbx_input_progress = make_api("class_rcbx_input_progress");
/**
 * 学期民主评价记录进度
 *
 */
Task.class_process_class_mzpj = make_interface("GrowthRecordBag/evaluate_entry_democraticStu", {__sync__: false}, false);
cloud.class_process_class_mzpj = make_api("class_process_class_mzpj")
/**
 * 学期民评价进度详情-按班级
 */
Task.class_detail_class_mzpj = make_interface("GrowthRecordBag/evaluate_entry_detailStu", {__sync__: false}, false);
cloud.class_detail_class_mzpj = make_api("class_detail_class_mzpj");
/**
 * 目标与计划进度 - 按班级
 * @param: fk_class_id    班级id（必传）    number    @mock=32
 * @param: fk_grade_id    年级id（必传）    number    @mock=36
 * @param: fk_school_id    学校id（必传）    number
 * @param: fk_semester_id    学期id（必传）    number    @mock=2
 */
Task.class_process_mb = make_interface("GrowthRecordBag/targetplan_input_progress_and_detail", {__sync__: false}, false)
cloud.class_process_mb = make_api("class_process_mb")
/**
 * 描述性评价录入进度
 */
Task.class_process_ms = make_interface("GrowthRecordBag/desc_eval_input_progress_class", {__sync__: false}, false)
cloud.class_process_ms = make_api("class_process_ms")

/**
 * 获取毕业评价表头（一级指标）
 * @author melody
 grade_id    年级id
 school_id    学校id
 */
cloud.get_bybg_eval_thead = make_api("get_bybg_eval_thead");

/**
 * 获取毕业评价列表
 * @author melody
 class_id    班级id
 grade_id        number    年级id（必填）
 is_file    是否归档    number    1，已归档0，未归档
 is_publish    是否发布    number    1，已发布，0未发布
 publish_end_time    日期格式的字符串，需要的时候传
 rank        string    要筛选的评价等级A,B,C,D
 stu_num    学生学号    string
 */
cloud.get_bybg_eval_list = make_api("get_bybg_eval_list");
cloud.get_bybg_eval_list_ex = make_api("get_bybg_eval_list_ex");

// 保存毕业报告异议审核记录
/**
 content    内容    string
 file    文件路径信息    string
 synthesize_id
 * @type {{url: *, params: *, cache: *, after: *}}
 */
Task.fy_bybg_not_pass = make_interface("Indexmaintain/sh_add_dissent_audit", {__sync__: false}, false);
cloud.fy_bybg_not_pass = make_api("fy_bybg_pass");
// 毕业报告，无异议归档
/**
 id:报告ID
 * @type {{url: *, params: *, cache: *, after: *}}
 */
Task.fy_bybg_pass = make_interface("Indexmaintain/bypj_file", {__sync__: false}, false);
cloud.fy_bybg_pass = make_api("fy_bybg_pass");


//查询学期评价报告
Task.get_semeter_pj_project = make_interface("Indexmaintain/find_project_by_state", {"__sync__": true}, false);
/**
 * @param  ca_gradeid:年级id
 * @param  state:5
 * @param  ca_workid:单位idssss
 * @type {Function}
 */
cloud.get_semeter_pj_project = make_api("get_semeter_pj_project");

/**
 * 获取班级成绩列表
 * @param fk_grade_id
 @param fk_school_id
 @param phase
 @param semester_id
 @param subject_id
 @param fk_class_id
 */
Task.class_score = make_interface("score/list_score_v2", {"__sync__": false}, false);
cloud.class_score = function (args, cb) {
    var student_list = cloud.class_members({fk_class_id: args.fk_class_id});

    D("class_score", args, function (url, arg, data) {
        student_list = merge_table(student_list, ["guid"], data.list, ["guid"], "score");
        for (var x = 0; x < student_list.length; x++) {
            var has_score = false;
            for (var y = 0; y < data.columns.length; y++) {
                var alias = data.columns[y].alias;
                if (student_list[x].hasOwnProperty("score") && student_list[x]["score"].hasOwnProperty(alias) && student_list[x]["score"][alias] != undefined) {
                    has_score = true;
                }
                if (!student_list[x].hasOwnProperty("score") || student_list[x]["score"][data.columns[y].alias] == undefined) {
                    student_list[x]["score"][data.columns[y].alias] = {
                        "rate": "",
                        "score": "", "add": "",
                        "value": "",
                        "level": ""
                    }
                }
            }
            student_list[x].has_score = has_score;
        }
        cb && cb(student_list, data.columns, data.list);
    });
};

cloud.ori_class_score = make_api("class_score");


// 保存成绩
Task.save_score_xy = make_interface("score/save_or_update_score", {__sync__: false}, false);
/**
 * @param: phase: 学其
 * @param: code: 学籍号
 * @param: fk_class_id:班级ID
 * @param: fk_grade_id:年级ID
 * @param: fk_school_id:学校ID
 * @param: guid:学生GUID
 * @param: name :学生姓名
 * @param: sex: 学生性别
 * @param: *col_*:对应栏的成绩
 * @type {Function}
 */
cloud.save_score_xy = make_api("save_score_xy");
//学业成绩公示
Task.make_pub_xy = make_interface("score/score_make_pub", {__sync__: false}, false);
cloud.make_pub_xy = make_api("make_pub_xy");
//学业成绩撤销公示
Task.make_cancel_pub_xy = make_interface("score/cancel_score_make_pub", {__sync__: false}, false);
cloud.make_cancel_pub_xy = make_api("make_cancel_pub_xy");


/**
 * @param: semester_id: 学期id
 * @param: fk_class_id:班级ID
 */
// 体质测评 - 项目列表
Task.health_project_list = make_interface("score/health_project_list", {__sync__: false}, false);
/**
 * @param due_grade:适用年级
 * @type {Function}
 */
cloud.health_project_list = make_api("health_project_list.list", {
    end: "",
    start: "",
    name__icontains: "",
    phase: "",
    rows: "",
    offset: "",
    is_runing: false
});

// 体质测评 - 按项目查看成绩
Task.health_score_list = make_interface("score/health_project_score_list_v2", {__sync__: false}, false);
/**
 * @param: _id: 项目ID
 * @param:  fk_class_id 班级列表
 * @param:  fk_school_id:学校ID
 * @type {Function}
 */
//cloud.health_score_list = make_api("health_score_list");
cloud.health_score_list = function (args, cb) {
    var student_list = cloud.class_members({fk_class_id: args.fk_class_id});

    D("health_score_list", args, function (url, arg, data) {
        student_list = merge_table(student_list, ["code"], data.list, ["code"], "score", "");
        //console.info(student_list);
        for (var x = 0; x < student_list.length; x++) {
            var has_score = false;
            for (var y = 0; y < data.columns.length; y++) {
                var has_attr = student_list[x]["score"].hasOwnProperty(data.columns[y].alias);
                if (!has_attr && student_list[x].sex == data.columns[y].for_sex) {
                    student_list[x]["score"][data.columns[y].alias] = {
                        "rate": "",
                        "score": "", "add": "",
                        "value": "",
                        "level": ""
                    }
                }
                else if (has_attr && student_list[x].sex == data.columns[y].for_sex) {
                    has_score = true;
                }
            }
            //  有成绩
            student_list[x].has_score = has_score;
        }
        cb && cb(student_list, data.columns);
    });
};
cloud.ori_health_score_list = make_api("health_score_list");


// 体质测评 - 设置成绩
Task.save_score_tz = make_interface("score/health_score_set", {__sync__: false}, false);
cloud.save_score_tz = make_api("save_score_tz");

// 体质测评公示
Task.make_pub_tz = make_interface("score/health_make_pub", {__sync__: false}, false);
/**
 * @param:project:项目ID
 * @param: fk_class_id:班级ID
 * @type {Function}
 */
cloud.make_pub_tz = make_api("make_pub_tz");


/**
 * 新体质测评开始
 * */
//查询体制测评列表
Task.new_health_list = make_interface("score/list_new_health", {__sync__: false}, false);
cloud.new_health_list = make_api("new_health_list");
//保存编辑新体质测评
Task.edit_new_health = make_interface("score/edit_new_health", {__sync__: false}, false);
cloud.edit_new_health = make_api("edit_new_health");
//新体制测评公示
Task.public_new_health = make_interface("score/public_display_new_health", {__sync__: false}, false);
cloud.public_new_health = make_api("public_new_health");
//新体制测评撤销公示
Task.cancel_public_new_health = make_interface("score/cancel_public_display_new_health", {__sync__: false}, false);
cloud.cancel_public_new_health = make_api("cancel_public_new_health");
//体质测评成绩异议审核详情页面(单个学生)
Task.new_health_dissent_detail = make_interface("score/new_health_dissent_detail", {__sync__: false}, false);
cloud.new_health_dissent_detail = make_api("new_health_dissent_detail");
//体质测评成绩异议审核详情页面（多个）
Task.new_health_dissent_list = make_interface("score/new_health_dissent_list", {__sync__: false}, false);
cloud.new_health_dissent_list = make_api("new_health_dissent_list");
/**
 * 新体质测评结束
 * */
// 民主评议详情
Task.detail_mzpy = make_interface("Indexmaintain/find_democratic_eval_list", {__sync__: false}, false);
cloud.detail_mzpy = make_api("detail_mzpy");
// 日常评价详情
Task.detail_rcpj = make_interface("Indexmaintain/indexmaintain_daily_evaluation", {__sync__: false}, false, {
    type: "pip",
    content: ["fzqsqj|split","fzjsqj|split","zbmc|split", "zgfz|split"]
});
cloud.detail_rcpj = make_api("detail_rcpj");
//评价方案--个性特长
Task.detail_gxtc = make_interface("GrowthRecordBag/find_personality_set_list", {__sync__: false}, false);
cloud.detail_gxtc = make_api("detail_gxtc");
// 阶段性评价详情-主题 活动
Task.detail_zthd = make_interface("Indexmaintain/indexmaintain_thematic_activity", {__sync__: false}, false, {
    type: "pip",
    content: ["zbmc|split"]
});
cloud.detail_zthd = make_api("detail_zthd");
// 阶段性评价详情-标志性成果
Task.detail_bzxcg = make_interface("Indexmaintain/indexmaintain_landmark_achievements", {__sync__: false}, false, {
    type: "pip",
    content: ["zbmc|split"]
});
cloud.detail_bzxcg = make_api("detail_bzxcg");
// 综合实践异议审核 列表-班级
Task.zhsjyy_list = make_interface("GrowthRecordBag/zh_yy_sh_list", {__sync__: false}, false, {
    type: "pip",
    content: ["fjdz|json"]
});
cloud.zhsjyy_list = make_api("zhsjyy_list.list")
// 综合实践异议列表
/**
 * fk_class_id	班级id	string
    fk_school_id
 * @type {{url: *, params: *, cache: *, after: *}}
 */
//体质健康测评异议
Task.tzcpyy_list = make_interface("score/health_dissent_list_v2", {__sync__:false}, false);
cloud.tzcpyy_list = make_api("tzcpyy_list");

// 学业水平成绩
Task.xyspcj_list = make_interface("score/score_dissent_list_v2", {__sync__:false}, false)
cloud.xyspcj_list = make_api("xyspcj_list");

//  成长激励卡
Task.jlk_list = make_interface("everyday/bz_yy_sh_list", {__sync__:false}, false, {
    type: "pip",
    content: ["fjdz|json"]
});
cloud.jlk_list = make_api("jlk_list.list");


//异议复议： 艺术测评
Task.fy_yscp = make_interface("GrowthRecordBag/artactivity_artSecondCheck", {__sync__: false}, false);
/**
 * @param: art_checkContent        string    @mock=审核意见
 * @param: art_check_enclosure        string    @mock=审核附件
 * @param: art_state    5:异议无效，3：存在不实    number    @mock=状态
 * @param: id        number    @mock=id
 * @type {Function}
 */
cloud.fy_yscp = make_api("fy_yscp");
//异议复议：思想品德
Task.fy_sxpd = make_interface("GrowthRecordBag/morality_checkComment", {__sync__: false}, false);
/**
 * @param:check_opinion        string    @mock=审核意见
 * @param:id        number    @mock=1
 * @param:second_check_attachment        string    @mock=
 * @param:status        number    @mock=3 存在不实， 4：归档
 * @type {Function}
 */
cloud.fy_sxpd = make_api("fy_sxpd");
// 异议复议:社会实践
Task.fy_shsj = make_interface("GrowthRecordBag/practice_check_comment", {__sync__: false}, false);
/**
 * @param: check_opinion    审核意见    string    (必填)
 * @param: id        number    (必填)
 * @param: second_check_attachment    二级附件    string    (必填)
 * @param: status    状态    number    (必填)
 * @type {Function}
 */
cloud.fy_shsj = make_api("fy_shsj");
//异议复议：学业水平
/**
check_opinion	审核意见	string	@mock=
second_check_attachment	审核附件	string	@mock=
status	状态	string	-1删除0草稿 1待审核 2审核通过 3审核不通过4归档
 *
 *
 */
Task.fy_xysp = make_interface("GrowthRecordBag/study_check_comment", {__sync__: false}, false);
cloud.fy_xysp = make_api("fy_xysp");

//异议复议：身心健康
/**
 hea_checkContent        string    @mock=审核意见
 hea_check_enclosure        string    @mock=审核附件
 hea_state        number    @mock=状态
 id        number    @mock=id
 */
Task.fy_sxjk = make_interface("GrowthRecordBag/healthActivity_heaSecondCheck", {__sync__: false}, false);
cloud.fy_sxjk = make_api("fy_sxjk");

//异议复议：成就奖励
/**
 ach_checkContent    审核意见    string
 ach_check_enclosure    审核附件    number
 ach_state    审核状态    number    3:异议有效 5异议无效归档
 id        number
 */
Task.fy_cjjy = make_interface("GrowthRecordBag/achievement_achiSecondCheck", {__sync__: false}, false);
cloud.fy_cjjy = make_api("fy_cjjy");

// 异议复议：日常表现
/**
 check_opinion    审核意见    string
 id    主键    number    @mock=1
 status    状态    number    状态 -1删除 1待审核 2审核不通过 3待确认 4已确认(公示) 5归档
 */
Task.fy_rcbx = make_interface("everyday/checke_second", {__sync__: false}, false);
cloud.fy_rcbx = make_api("fy_rcbx");

// 标志卡异议审核
Task.fy_jlk = make_interface("everyday/checke_second_gain_card", {__sync__: false}, false)
cloud.fy_jlk = make_api("fy_jlk");

// 体质测评异议审核
Task.fy_tzcp = make_interface("score/health_dissent_check", {__sync__:false}, false);
cloud.fy_tzcp = make_api("fy_tzcp");



//复议审核-学期评价结果复议
/**
 *classId    班级    number
 gradeId    年级    number
 num    标识    number    0：全部，3：待审核，4：已审核
 schoolId    学校    number
 subjectId    项目    number
 * @type {{url: *, params: *, cache: *, after: *}}
 */
Task.fy_xqpj = make_interface("Indexmaintain/indexmaintain_shreleaseResult", {__sync__: false}, false, {
    type: "pip",
    content: ["percentileOne|split,"]
});
cloud.fy_xqpj = make_api("fy_xqpj", {num: 3});
Task.xq_sh_list = make_interface("Indexmaintain/page_semester_result", {__sync__: false}, false);
cloud.xq_sh_list = make_api("xq_sh_list");
// 复议审核-毕业评价结果复议
/**
 * @param
 */
Task.fy_bjbg = make_interface("Indexmaintain/query_graduation_evaluation_dissent", {__sync__: false}, false);
cloud.fy_bjbg = make_api("fy_bjbg");


/**
 * 阶段报告：提出的异议
 * @type {{url: *, params: *, cache: *, after: *}}
 */
Task.fy_jdbg = make_interface("Indexmaintain/indexmaintain_selObjection", {__sync__: false}, false);
cloud.fy_jdbg = make_api("fy_jdbg");



// 查询评价得分点（表头）
Task.pj_headers = make_interface("Indexmaintain/get_yjzb_title", {__sync__: false}, false);
cloud.pj_headers = make_api("pj_headers")

/**
 * 阶段报告:异议审核
 */
Task.add_audit = make_interface("Indexmaintain/indexmaintain_addAudit", {__sync__: false}, false);
cloud.add_audit = make_api("add_audit");


/*
* 成长激励卡获取异议列表
*   offset		number
    p_id	    获取标志卡记录id	number
    rows		number
*  @type {{url: *, params: *, cache: *, after: *}}
* */
Task.get_objection = make_interface("everyday/page_objection", {__sync__: false}, false);
cloud.get_objection = make_api("get_objection");

/*
* 模块类型
* */
Task.get_module_type = make_interface("GrowthRecordBag/page_list_type", {__sync__: false}, false);
cloud.get_module_type = make_api("get_module_type");
/*
* 综合实践管理
* 获取我可以参加的活动列表
* */
Task.my_ac_list = make_interface("GrowthRecordBag/page_can_use", {__sync__: false}, false);
cloud.my_ac_list = make_api("my_ac_list.list");
/*
 * 综合实践管理
 * 获取教师指导的活动列表
 * */
Task.my_te_list = make_interface("GrowthRecordBag/page_tutor_activity", {__sync__: false}, false);
cloud.my_te_list = make_api("my_te_list.list");

/*
fk_grade_id:年级ID
fk_semester_id: 学期ID
grade_name:年级名,
sta_type:统计类型 2,按维度, 3按要素
 */
Task.xqpj_hx_wd = make_interface("GrowthRecordBag/term_eval_dim_or_ele_horizontal_analysis", {__sync__:false}, false);
cloud.xqpj_hx_wd  = make_api("xqpj_hx_wd");


/*
学期评价，横向分析 - 按维度
fk_grade_id:年级ID
fk_semester_id: 学期ID
grade_name:年级名,
sta_type:统计类型 2,按维度, 3按要素
 */
Task.bypj_hx_wd = make_interface("GrowthRecordBag/graduation_eval_horizontal_analysis", {__sync__:false}, false);
cloud.bypj_hx_wd  = make_api("bypj_hx_wd", {sta_type:2})


/*

fk_grade_id:年级ID
fk_semester_id: 学期ID
grade_name:年级名,
module_type:模块类型  3 成就奖励 4 综合实践活动 8 日常表现与个性特长
sta_type:统计类型 2,按维度, 3按要素
 */
Task.rcpj_hx_wd = make_interface("GrowthRecordBag/daily_eval_dim_or_ele_horizontal_analysis", {__sync__:false}, false);
cloud.rcpj_hx_wd  = make_api("rcpj_hx_wd");



/**
 * 纵向分析 ，日常评价 - 维度要素分析
fk_grade_id	年级id（必传）	number
fk_school_id	学校id（必传）	number
grade_name	年级名称（必传）	string
module_type	模块类型（必传）	number	3 成就奖励 4 综合实践活动 8 日常表现与个性特长
sta_type	统计类型（必传）	number	2 按维度 ；3 按要素
 */

Task.rcpj_zx_list = make_interface("GrowthRecordBag/daily_eval_dim_or_ele_longitudinal_analysis", {__sync__:false}, false);
cloud.rcpj_zx_list  = make_api("rcpj_zx_list")


/**
 *
fk_grade_id	年级id（必传）	number
fk_semester_id	学期id（必传）	number
module_type	模块类型（必传）	number	3 成就奖励 4 综合实践活动 8 日常表现与个性特长
sta_mode	统计方式（必传）	number	3 群体男女 4 群体 走寄读 5 区域
sta_type	统计类型（必传）	number	2 按维度 ；3 按要素
 * @type {{url, params, cache, after}|*}
 */
Task.rcpj_qy_list = make_interface("GrowthRecordBag/daily_eval_dim_or_ele_area_analysis", {__sync__:false}, false);
cloud.rcpj_qy_list  = make_api("rcpj_qy_list", {sta_mode:5})

/*
fk_grade_id:年级ID
fk_semester_id: 学期ID
grade_name:年级名,
module_type:模块类型  3 成就奖励 4 综合实践活动 8 日常表现与个性特长
sta_type:统计类型 2,按维度, 3按要素
 */
Task.rcpj_hx_wd = make_interface("GrowthRecordBag/daily_eval_dim_or_ele_horizontal_analysis", {__sync__:false}, false);
cloud.rcpj_hx_wd  = make_api("rcpj_hx_wd");

/*

fk_grade_id:年级ID
fk_semester_id: 学期ID
sta_mode:群体类型    目前3群体，5区域
module_type:模块类型  3 成就奖励 4 综合实践活动 8 日常表现与个性特长
sta_type:统计类型 2,按维度, 3按要素
 */
Task.rcpj_qt_wd = make_interface("GrowthRecordBag/daily_eval_dim_or_ele_population_analysis", {__sync__:false}, false);
cloud.rcpj_qt_wd  = make_api("rcpj_qt_wd");

/*
学期评价-群体分析按维度要素
fk_grade_id:年级ID
fk_semester_id: 学期ID
sta_mode:群体类型    目前3群体，5区域
sta_type:统计类型 2,按维度, 3按要素
 */
Task.xqpj_qt_wd = make_interface("GrowthRecordBag/term_eval_dim_or_ele_population_analysis", {__sync__:false}, false);
cloud.xqpj_qt_wd  = make_api("xqpj_qt_wd");


/*
学期评价-群体分析按维度要素
fk_grade_id:年级ID
fk_semester_id: 学期ID
sta_mode:群体类型    目前3群体，5区域
sta_type:统计类型 2,按维度, 3按要素
 */
Task.xqpj_qy_wd = make_interface("GrowthRecordBag/term_eval_dim_or_ele_area_analysis", {__sync__:false}, false);
cloud.xqpj_qy_wd  = make_api("xqpj_qy_wd");


/*
学期评价-群体分析按维度要素
fk_grade_id:年级ID
fk_semester_id: 学期ID
sta_mode:群体类型    目前3群体，5区域
sta_type:统计类型 2,按维度, 3按要素
 */
Task.xqpj_zx_wd = make_interface("GrowthRecordBag/term_eval_dim_or_ele_longitudinal_analysis", {__sync__:false}, false);
cloud.xqpj_zx_wd  = make_api("xqpj_zx_wd");

/*
获取所有学期对应的年级
 */
Task.semester_grade_mapping = make_interface("base/semester/semester_grade_mapping", {__sync__:true}, false);
cloud.semester_grade_mapping  = make_api("semester_grade_mapping");