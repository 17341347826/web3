/**
 * Created by Administrator on 2018/5/29.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==============================一、评价任务管控设置一套（评价参数设置-只有一个身份的管理员才能设置，他以下的身份能查看，他以上的身份查看都不能）========================
            //评价任务管控列表
            "/task_control_list":"e_task_control/task_control_list/task_control_list.js",
            //学生自评方案
            "/self_scheme":"e_task_control/self_scheme/self_scheme.js",
            //创建学生自评方案
            "/create_scheme":"e_task_control/create_scheme/create_scheme.js",
            //学生自评任务--管理员身份
            "/self_task":"e_task_control/self_task/self_task.js",
            //创建学生自评任务
            "/create_task":"e_task_control/create_task/create_task.js",
            //查看评价项目详情
            "/eval_check_details":"e_task_control/eval_check_details/eval_check_details.js",
            //方案详情查看
            "/programme_details":"e_task_control/programme_details/programme_details.js",
            //学期报告参数-指标权重设置
            "/index_weight_setting":"term_report_parameters/index_weight_setting/index_weight_setting.js",
            //学期报告参数-主体权重
            "/body_weight":"term_report_parameters/body_weight/body_weight.js",
            //学期报告参数-修改等级
            "/update_level":"term_report_parameters/update_level/update_level.js",
            //学期报告参数-查看等级
            "/level_check":"term_report_parameters/level_check/level_check.js",
            //学期报告参数-添加等级
            "/level_add":"term_report_parameters/level_add/level_add.js",
            //毕业报告参数-权重设置
            "/weight_set":"graduation_report_parameters/weight_set/weight_set.js",
            //毕业报告参数-等级设置
            "/graduation_level_check":"graduation_report_parameters/graduation_level_check/graduation_level_check.js",
            //毕业报告参数-等级设置修改
            "/graduation_level_update":"graduation_report_parameters/graduation_level_update/graduation_level_update.js",
            //目标与计划时间设置
            "/goals_plans_set":"e_task_control/goals_plans_set/goals_plans_set.js",
            //学生互评方案
            "/stu_mutual_scheme":"e_task_control/stu_mutual_scheme/stu_mutual_scheme.js",

            //==============================1、写实活动任务（综合实践任务）========================
            //写实活动任务开放时间设置-
            "/real_a_t_t_set":"e_task_control/real_a_t_t_set/real_a_t_t_set.js",
            //写实活动-类型设置
            "/real_a_type_set":"e_task_control/real_a_type_set/real_a_type_set.js",
            //写实活动-类型设置添加
            "/type_set_add":"e_task_control/type_set_add/type_set_add.js",
            //写实活动-上传数量设置
            "/real_a_upload_num_set":"e_task_control/real_a_upload_num_set/real_a_upload_num_set.js",
            //写实活动-获奖积分设置
            "/achieve_maintenance":"e_task_control/achieve_maintenance/achieve_maintenance.js",
            //等级设置
            "/set_level":"term_report_parameters/set_level/set_level.js",
            //指标权重设置
            "/quota_weight_set":"term_report_parameters/quota_weight_set/quota_weight_set.js",
            //主体权重设置
            "/main_weight":"term_report_parameters/main_weight/main_weight.js",
            //学期评价结果生成
            "/term_new_result":"term_new_result/term_new_result.js",
            //公示审核管控--市管理员可以设置，其他身份（除学生和家长外）都只能查看，不能编辑
            "/public_audit_control":"public_audit_control/public_audit_control.js",
            //==============================学期评价结果========================
            //参数权限控制（告诉后台用哪一个身份设置的参数设置那套）---市管理员
            "/params_authority_control":"params_authority_control/params_authority_control.js",
            //市管理员设置统计
            "/city_set":"city_set/city_set.js",
            //学期评价结果统计---市管理员、区管理员、校管理员
            "/term_statistics":"term_statistics/term_statistics.js",
            //学期评价结果统计线下测试用---市管理员、区管理员、校管理员
            "/term_statistics_local":"term_statistics_local/term_statistics_local.js",
            //发布公示页面
            "/leading_statistical_results":"leading_statistical_results/leading_statistical_results.js",

            //毕业报告统计---市管理员
            "/graduation_statistics":"graduation_statistics/graduation_statistics.js",
            //毕业报告结果查看---市管理员
            "/graduation_result_view":"graduation_result_view/graduation_result_view.js",

            //==============================一、评价任务管控查看一套开始（评价参数设置-只有一个身份的管理员才能设置，他以下的身份能查看，他以上的身份查看都不能，学生、家长没有使用状态和参数设置）========================
            //评价任务管控列表
            "/t_c_s_list":"task_control_see/t_c_s_list/t_c_s_list.js",
            //学生自评-评价方案（市、区县）
            "/c_c_scheme_list_see":"task_control_see/c_c_scheme_list_see/c_c_scheme_list_see.js",
            //学生自评-评价方案(校、教师评价方案)
            "/item_programme_management_see":"task_control_see/item_programme_management_see/item_programme_management_see.js",
            //学生自评-自评任务（校）
            "/student_self_evaluation_see":"task_control_see/student_self_evaluation_see/student_self_evaluation_see.js",
            //学生自评-评价任务（市上 or 区县查看项目列表）
            "/evaluation_project_view_see":"task_control_see/evaluation_project_view_see/evaluation_project_view_see.js",
            //学生互评-互评任务（校）
            "/student_mutual_evaluation_see":"task_control_see/student_mutual_evaluation_see/student_mutual_evaluation_see.js",
            //学生进行互评参数设置
            "/parameter_setting_see":"task_control_see/parameter_setting_see/parameter_setting_see.js",
            //教师评价-教师评任务（校）
            "/teacher_evaluation_see":"task_control_see/teacher_evaluation_see/teacher_evaluation_see.js",
            //体质健康项目--项目列表
            "/health_project_mana_see": "task_control_see/health_project_mana_see/health_project_mana_see.js",
            //体质健康-----方案列表
            "/health_solu_mana_see":"task_control_see/health_solu_mana_see/health_solu_mana_see.js",
            //体质健康---测评项目（测评指标列表）
            "/health_item_mana_see": "task_control_see/health_item_mana_see/health_item_mana_see.js",
            //写实活动-类型设置
            "/real_a_type_set_see":"task_control_see/real_a_type_set_see/real_a_type_set_see.js",
            //写实活动-上传数量设置
            "/real_a_upload_num_set_see":"task_control_see/real_a_upload_num_set_see/real_a_upload_num_set_see.js",
            //写实活动-获奖积分设置
            "/achieve_maintenance_see":"task_control_see/achieve_maintenance_see/achieve_maintenance_see.js",
            //写实活动-个性特长设置
            "/special_personality_see":"task_control_see/special_personality_see/special_personality_see.js",
            //==============================一、评价任务管控查看一套结束========================
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"eval_param_set");
        }
        return {
            init: init
        }
    });