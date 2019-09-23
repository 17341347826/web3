/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //活动上传进度
            "/act_upload_progress": "act_upload_progress/act_upload_progress.js",
            //日常表现进度
            "/daily_perform_progress": "daily_perform_progress/daily_perform_progress.js",
            //成绩导入上传进度
            "/achieve_introduct_progress": "achieve_introduct_progress/achieve_introduct_progress.js",
            //民主评价进度
            "/d_e_progress": "d_e_progress/d_e_progress.js",
            //计划与实现进度
            "/plan_realization_progress": "plan_realization_progress/plan_realization_progress.js",
            //描述性评价进度
            "/description_e_progress": "description_e_progress/description_e_progress.js",
            //------------------------------
            //审核进度
            "/review_progress": "review_progress/review_progress.js",
            //结果生成进度
            "/result_gen_progress": "result_gen_progress/result_gen_progress.js",
            //用户活跃度
            "/user_activity": "user_activity/user_activity.js",
            //申诉复议
            "/reconsideration_appeals": "reconsideration_appeals/reconsideration_appeals.js",
            //目标与计划--学校
            "/goal_plan_school": "goal_plan_school/goal_plan_school.js",
            //日常表现--学校
            "/daily_perform_school": "daily_perform_school/daily_perform_school.js",
            //成绩导入--学校
            "/achieve_introduct_school": "achieve_introduct_school/achieve_introduct_school.js",
            //综合实践活动上传
            "/active_upload_school": "active_upload_school/active_upload_school.js",
            //总进度
            "/total_progress": "total_progress/total_progress.js",
            //用户活跃度-校级
            "/user_active_school": "user_active_school/user_active_school.js",
            //审核复议进度-校级
            "/review_progress_school": "review_progress_school/review_progress_school.js",
            //描述性评价-校级
            "/description_progress_school": "description_progress_school/description_progress_school.js",

            //--------------------------
            //活动上传
            "/upload-active": "upload-active/upload-active.js",
            //日常表现
            "/upload-daily": "upload-daily/upload-daily.js",
            //民主评议
            "/upload-democratic": "upload-democratic/upload-democratic.js",
            //计划与实现
            "/upload-plan": "upload-plan/upload-plan.js",
            //描述性评价
            "/upload-describe": "upload-describe/upload-describe.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluation_supervision");
        }

        return {
            init: init
        }
    });