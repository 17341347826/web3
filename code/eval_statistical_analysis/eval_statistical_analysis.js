/**
 * Created by Administrator on 2018/6/25.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================日常表现统计=====================
            //日常表现积分统计--校管理员
            "/pers_situation_analysis": "daily_eval_statistics/stu_integral_statistics/pers_situation_analysis/pers_situation_analysis.js",
            //日常表现积分统计时间段学生查看详情--校管理员
            "/student_detail": "daily_eval_statistics/stu_integral_statistics/student_detail/student_detail.js",
            //指标积分统计--校管理员
            "/index_statistical_integral":"index_statistical_integral/index_statistical_integral.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "eval_statistical_analysis");
        }

        return {
            init: init
        }
    });