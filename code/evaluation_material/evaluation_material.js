/**
 * 评价材料管理
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //教师评价-教师
            "/tel":"stu_evaluation/teacher_evaluation_list/teacher_evaluation_list.js",
            //教师评价-校领导
            "/teacher_evaluation":"stu_evaluation/teacher_evaluation/teacher_evaluation.js",
            //项目创建
            "/teacher_add_evaluation":"stu_evaluation/teacher_add_evaluation/teacher_add_evaluation.js",
            //根据评价项目-列表
            "/project_content_list":"stu_evaluation/project_content_list/project_content_list.js",
            //根据项目评价参考
            "/project_reference":"stu_evaluation/project_reference/project_reference.js",
            //根据评价项目-评价详情(直接打分)
            "/project_content_fill":"stu_evaluation/project_content_fill/project_content_fill.js",
            //根据评价项目-评价详情(选项打分)
            "/project_content_fill_radio":"stu_evaluation/project_content_fill_radio/project_content_fill_radio.js",
            //根据评价人-评价列表
            "/teacher_fill_list":"stu_evaluation/teacher_fill_list/teacher_fill_list.js",
            //根据评价人-评价详情
            "/teacher_fill_in":"stu_evaluation/teacher_fill_in/teacher_fill_in.js",
            //指标统计
            "/teacher_index_count":"stu_evaluation/teacher_index_count/teacher_index_count.js",
            //教师评价方案
            "/item_programme_management":"teacher_evaluation/item_programme_management/item_programme_management.js",
            //学生自评方案
            "/self_evaluation_scheme_stu":"teacher_evaluation/self_evaluation_scheme_stu/self_evaluation_scheme_stu.js",
            //创建教师评价方案
            "/add_programme":"teacher_evaluation/add_programme/add_programme.js",
            //教师评价方案详情
            "/school_detail":"teacher_evaluation/school_detail/school_detail.js",
            //维护方案内容
            "/content_maintenance":"teacher_evaluation/content_maintenance/content_maintenance.js",
            //添加方案内容
            "/add_content":"teacher_evaluation/add_content/add_content.js",
            //区领导 or 市级 查看方案列表
            "/city_management_create_scheme_list":"teacher_evaluation/city_management_create_scheme_list/city_management_create_scheme_list.js",
            //区领导进行方案审核
            "/programme_audit_list":"teacher_evaluation/programme_audit_list/programme_audit_list.js",
            //区领导进行方案审核(查看详情)
            "/programme_audit_detail":"teacher_evaluation/programme_audit_detail/programme_audit_detail.js",
            //区县 or 市上创建项目
            "/evaluation_project_create":"teacher_evaluation/evaluation_project_create/evaluation_project_create.js",
            //区县 or 市上创建方案
            "/city_management_create_scheme":"teacher_evaluation/city_management_create_scheme/city_management_create_scheme.js",
            //校领导项目审核
            "/check_list":"teacher_evaluation/check_list/check_list.js",
            //校领导项目详情
            "/check_detail":"teacher_evaluation/check_detail/check_detail.js",
            //市上 or 区县查看项目列表
            "/evaluation_project_view":"teacher_evaluation/evaluation_project_view/evaluation_project_view.js",
            //市上 or 区县查看项目详情
            "/evaluation_project_detail":"teacher_evaluation/evaluation_project_detail/evaluation_project_detail.js"

        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluation_material");
        }

        return {
            init: init
        }
    });