define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================成长记录袋=====================
            //学生成长档案-列表进入页面
            "/p_a_list": "portfolio_assessment/p_a_list/p_a_list.js",
            //学生成长档案
            "/file_details": "portfolio_assessment/file_details/file_details.js",
            //学期评价档案列表
            "/e_list":"portfolio_assessment/e_list/e_list.js",
            //学期评价档案
            "/evaluation_detail": "portfolio_assessment/evaluation_detail/evaluation_detail.js",
            //毕业评价档案列表
            "/g_list":"portfolio_assessment/g_list/g_list.js",
            //毕业评价档案
            "/graduation_file": "portfolio_assessment/graduation_file/graduation_file.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "growth");
        }

        return {
            init: init
        }
    });