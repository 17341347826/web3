/**
 * 审核复议
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //上传材料复议
            "/upload_material": "examine_review/upload_material/upload_material.js",
            //学期评价结果
            "/term_evaluation_result": "examine_review/term_evaluation_result/term_evaluation_result.js",
            //毕业评价结果
            "/graduation_evaluation_result": "examine_review/graduation_evaluation_result/graduation_evaluation_result.js",
            //----------------------------------------------------------------------------------
            //未遴选材料
            "/not_select_material": "arrange_selection/not_select_material/not_select_material.js",
            //新未遴选材料
            "/new_not_select_material": "arrange_selection/new_not_select_material/new_not_select_material.js",
            //已遴选材料
            "/selected_material":"arrange_selection/selected_material/selected_material.js",
            //已遴选材料
            "/new_selected_material":"arrange_selection/new_selected_material/new_selected_material.js",
            //上传材料复议-新的（由于体质健康测评需求变化）
            "/new_upload_material": "examine_review/new_upload_material/new_upload_material.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "reconsider_manage");
        }

        return {
            init: init
        }
    });