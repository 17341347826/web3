/**
 * 数据分析相关
 * Created by Weifeng Ma on 2018/5/24 0024.
 */
// level: 1 省 ?
// level:2 市
// level:3 区
// level:4 学校
// 区域性分析 -活动评价上传数
Task.qy_analysis_hd = make_interface("GrowthRecordBag/regional_analysis_by_hd", {"__sync__":false}, false );
// 区域性分析 - 综合素质评价
Task.qy_analysis_zhpj = make_interface("GrowthRecordBag/regional_analysis_by_pj", {"__sync__":false}, false );
// 群体性分析 — 寄宿、走读学生比较
Task.qt_analysis_zd = make_interface("GrowthRecordBag/group_analysis_by_zsqk", {"__sync__":false}, false );
// 群体性分析—男、女学生比较
Task.qt_analysis_sex = make_interface("GrowthRecordBag/group_analysis_by_sex", {"__sync__":false}, false );

/**
 * 区域性分析 -活动评价上传数
 * semester 学期 (必传)
 * gradeId 年级id
 */
cloud.qy_analysis_hd = function(args,cb){
    var sems = args["semester"].split("|");
    delete  args["semester"];
    var sem_id = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
    function on_date_recv(url, args, data) {
        calc_ext(data.list, [["wcl","{bfb}"]])
        cb && cb(data.list); 
    }
    var form = {__call__: on_date_recv, semesterId:sem_id};
    form = $.extend(form, args);
    D("qy_analysis_hd", form);
}
/**
 * 区域性分析 - 综合素质评价
 * semester 学期 (必传)
 * gradeId 年级id
 */
cloud.qy_analysis_zhpj = function(args,cb){
    var sems = args["semester"].split("|");
    delete  args["semester"];
    var sem_id = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
    function on_date_recv(url, args, data) {
        calc_ext(data.list, [["wcl","{bfb}"]])
        cb && cb(data.list);    
    }
    var form = {__call__: on_date_recv, semesterId:sem_id};
    form = $.extend(form, args);
    D("qy_analysis_zhpj", form);
}
/**
 * 群体性分析 — 寄宿、走读学生比较
 * semester 学期 (必传)
 * gradeId 年级id
 */
cloud.qt_analysis_zd = function(args,cb){
    var sems = args["semester"].split("|");
    delete  args["semester"];
    var sem_id = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
    function on_date_recv(url, args, data) {
        calc_ext(data.list, [["wcl","{bfb}"]])
        cb && cb(data.list);  
    }
    var form = {__call__: on_date_recv, semesterId:sem_id};
    form = $.extend(form, args);
    D("qt_analysis_zd", form);
}

/**
 * 群体性分析—男、女学生比较
 * semester 学期 (必传)
 * gradeId 年级id
 */
cloud.qt_analysis_sex = function(args,cb){
    var sems = args["semester"].split("|");
    delete  args["semester"];
    var sem_id = sems[0], start = time_2_str(sems[1]), end = time_2_str(sems[2]);
    function on_date_recv(url, args, data) {
        calc_ext(data.list, [["wcl","{bfb}"]])
        cb && cb(data.list);    
    }
    var form = {__call__: on_date_recv,semesterId:sem_id};
    form = $.extend(form, args);
    D("qt_analysis_sex", form);
}