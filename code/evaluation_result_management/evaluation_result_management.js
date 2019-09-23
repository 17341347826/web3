/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //日常表现评价记录
            "/daily_performance_evaluation": "daily_performance_evaluation/daily_performance_evaluation.js",
            //学期评价结果
            "/term_evaluation_results":"term_evaluation_results/term_evaluation_results.js",
            //毕业评价结果
            "/graduation_results":"graduation_results/graduation_results.js",
            //日常评价结果
            "/daily_evaluation_result":"daily_evaluation_result/daily_evaluation_result.js",
            //学期评价结果打印
            "/term_evalution_print":"term_evalution_print/term_evalution_print.js",
            //毕业评价结果打印
            "/graduation_result_print":"graduation_result_print/graduation_result_print.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluation_result_management");
        }

        return {
            init: init
        }
    });