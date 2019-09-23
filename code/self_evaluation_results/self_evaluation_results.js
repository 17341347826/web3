/**
 * Created by Administrator on 2018/6/15.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================毕业评价结果=====================
            //毕业评价结果-学生
            "/by_evaluation_results": "by_evaluation_results/by_evaluation_results.js",

        };

        function init(main) {
            x.on_by_config(on_by_config, main, "self_evaluation_results");
        }

        return {
            init: init
        }
    });