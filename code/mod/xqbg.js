/**
 * 学期报告相关接口
 * Created by melody 2018/5/31 0900.
 */


// 获取学期报告项目
Task.get_xqbg_project = make_interface("Indexmaintain/find_project_by_state", {"__sync__":false},  false );
/**
 state 5已归档
 */
cloud.get_xqbg_project = make_api("get_xqbg_project");
//综合素质评价详情
Task.get_detail_score = make_interface("Indexmaintain/indexmaintain_getbonuspointproscore", {"__sync__":false},  false );
cloud.get_detail_score = make_api("get_detail_score");

//学生查看自己的学期评价结果
Task.my_term_result = make_interface("GrowthRecordBag/allList_findByAllList", {"__sync__":false},  false );
cloud.my_term_result = make_api("my_term_result");


//学生查看自己的日常评价结果
Task.my_daily_result = make_interface("GrowthRecordBag/daily_eval_result", {"__sync__":false},  false );
cloud.my_daily_result = make_api("my_daily_result");

//日常指标积分统计(按周次)
Task.daily_by_week = make_interface("everyday/index_integral_statisticsByZc", {"__sync__":false},  false );
cloud.daily_by_week = make_api("daily_by_week");
//日常指标积分统计(按月份)
Task.daily_by_month = make_interface("everyday/index_integral_statisticsByMonth", {"__sync__":false},  false );
cloud.daily_by_month = make_api("daily_by_month");
//日常指标积分统计(按时间段)
Task.daily_by_time = make_interface("everyday/index_integral_statisticsByTime", {"__sync__":false},  false );
cloud.daily_by_time = make_api("daily_by_time");
