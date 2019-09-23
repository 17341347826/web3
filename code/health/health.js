/**
 * Created by Ma Weifeng on 2017/8/2.
 */

define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {

            //==========================学生积分========================================
            //体质健康-----测评指标列表
            "/health_item_mana": "health_item_mana/health_item_mana.js",
            //体质健康-----测评指标创建
            "/health_item_new_index": "health_item_mana/new/new.js",
            //体质健康-----修改指标项
            "/health_item_edit": "health_item_mana/edit/edit.js",
            //体质健康项目--项目列表
            "/health_project_mana": "health_project_mana/health_project_mana.js",
            //体质健康-----测评指标创建
            "/health_project_new": "health_project_mana/new/new.js",
            //体质健康项目-修改
            "/health_project_edit": "health_project_mana/edit/edit.js",
            //体质健康-----方案列表
            "/health_solu_mana":"health_solu_mana/health_solu_mana.js",
            //体质健康-----方案创建
            "/health_solu_new":"health_solu_mana/new/new.js",
            //体质健康成绩录入
            "/teacher_physical_health_record":"teacher_physical_health_record/teacher_physical_health_record.js",
            //学生查看体质健康成绩
            "/student_physical_health_record":"student_physical_health_record/student_physical_health_record.js",
             //体质健康项目--审核列表-校领导
            "/health_project_check": "health_project_check/health_project_check.js",
             //体质健康项目--审核详情-校领导
            "/health_project_check_detail": "health_project_check/detail/detail.js",
            //体质测试列表
            "/ph_test_list":"public_health_test/ph_test_list/ph_test_list.js",
            //异议审核
            "/ph_check_list":"public_health_test/ph_check_list/ph_check_list.js",
            //异议核查界面
            "/ph_check_detail":"public_health_test/ph_check_detail/ph_check_detail.js",
            // 成绩议议详情
            "/score_dissent_detail":"final_exam_objection_detail/final_exam_objection_detail.js"

        };

        function init(main) {
            x.on_by_config(on_by_config, main, "health");
        }

        return {
            init: init
        }
    });