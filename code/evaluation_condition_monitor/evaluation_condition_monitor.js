/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //=============================评价状况监控--录入进度========================
            //总进度
            "/ecm_total_progress":"entry_progress/ecm_total_progress/ecm_total_progress.js",
            //目标计划与实现
            "/ecm_target_plan":"entry_progress/ecm_target_plan/ecm_target_plan.js",
            //日常表现
            "/ecm_daily_perform":"entry_progress/ecm_daily_perform/ecm_daily_perform.js",
            //审核复议进度
            "/teacher_review_progress": "teacher_review_progress/teacher_review_progress.js",
            //成绩导入
            "/ecm_achievement_import":"entry_progress/ecm_achievement_import/ecm_achievement_import.js",
            //民主评价
            "/ecm_democratic_evaluation":"entry_progress/ecm_democratic_evaluation/ecm_democratic_evaluation.js",
            //描述性评价
            "/ecm_desc_assessment":"entry_progress/ecm_desc_assessment/ecm_desc_assessment.js",
            //班级用户活跃度
            "/class_user_activity":"class_user_activity/class_user_activity.js",
            //综合实践
            "/stu_practice":"entry_progress/stu_practice/stu_practice.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluation_condition_monitor");
        }

        return {
            init: init
        }
    });