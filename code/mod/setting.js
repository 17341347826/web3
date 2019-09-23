/**
 * 配置相关
 * Created by maweifeng 2018/5/29 1332.
 */

// 任务开放->时间设置 ： 各模块时间设置
Task.setting_time_limit = make_interface("everyday/page_module_switch",{__sync__:false}, false);
cloud.setting_time_limit = make_api("setting_time_limit.list", {});
//修改
Task.update_time_limit = make_interface("everyday/save_module_switch",{__sync__:false}, false);
cloud.update_time_limit = make_api("update_time_limit", {});


//学期评价结果查询项目
Task.check_pro = make_interface("Indexmaintain/indexmaintain_findByCountAnalysis",{__sync__:false}, false);
cloud.check_pro = make_api("check_pro", {});

//学期评价结果参数设置
Task.add_count_analysis = make_interface("Indexmaintain/indexmaintain_addCountAnalysis",{__sync__:false}, false);
cloud.add_count_analysis = make_api("add_count_analysis", {});
//学期评价结果统计
Task.score_statistics = make_interface("score/semester_statis",{__sync__:false}, false);
cloud.score_statistics = make_api("score_statistics", {});
//学期评价结果统计采用哪个的
Task.edit_project_control = make_interface("score/edit_project_control",{__sync__:false}, false);
cloud.edit_project_control = make_api("edit_project_control", {});
//查询统计项目控制参数
Task.get_project_control = make_interface("score/get_project_control",{__sync__:false}, false);
cloud.get_project_control = make_api("get_project_control", {});