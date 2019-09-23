/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            // =========================================学业成绩=================================
            // 学习成绩+艺术测评成绩
            '/school_achievement':'school_achievement/school_achievement.js',
            // 新学习成绩+新艺术测评成绩
            '/new_school_achievement':'new_school_achievement/new_school_achievement.js',
            //学业成绩录入
            '/sch_ach_entering':'sch_ach_entering/sch_ach_entering.js',
            // 体质测评成绩 - 查看
            '/school_health':'school_health/school_health.js',
            // 体质测评成绩 - 录入
            "/school_health_edit": "school_health_edit/school_health_edit.js",
            //体质测评免测依据上传
            "/free_test_based":"free_test_based/free_test_based.js",
            //体质测评免测查看反馈情况
            "/free_test_exemption":"free_test_exemption/free_test_exemption.js",
            //============================校级录入成绩====================================
            "/subject_score":"subject_score/subject_score.js",
            //============================新体质健康新需求流程====================================
            // 体质测评成绩 - 查看（校管理员,教师）
            '/new_school_health':'new_school_health/new_school_health.js',
            // 体质测评成绩 - 录入（校管理员）
            '/new_school_health_edit':'new_school_health_edit/new_school_health_edit.js',
            // 体质测评免测依据上传 - 录入（教师）
            "/new_free_test_based": "new_free_test_based/new_free_test_based.js",
            //体质测评免测查看反馈情况-教师查看审核不通过的
            "/new_free_test_exemption": "new_free_test_exemption/new_free_test_exemption.js",
            //体质测评免测审核列表-校领导
            "/test_free_audit": "test_free_audit/test_free_audit.js",
            //体质测评免测审核详情-校领导
            "/free_test_audit_detail": "free_test_audit_detail/free_test_audit_detail.js",
            //体质测评公示
            "/new_ph_test_list": "new_ph_test_list/new_ph_test_list.js",
            //体质测评公示异议核查(之前的在health模块)
            "/new_ph_check_detail": "new_ph_check_detail/new_ph_check_detail.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"achievement");
        }
        return {
            init: init
        }
    });