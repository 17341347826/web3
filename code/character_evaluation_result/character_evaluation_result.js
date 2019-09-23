/**
 * Created by Kenton on 2018/6/6.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //内容设置（评价参数设置）
            "/content_set":"parameter_setting/content_set/content_set.js",
            //等级设置（评价参数设置）
            "/rank":"parameter_setting/rank/rank.js",
            //权重设置（评价参数设置）
            "/weight":"parameter_setting/weight/weight.js",
            //特色评价结果生成列表
            "/result_list":"result_generation/result_list/result_list.js",
            //创建特色评价结果
            "/create_result_generation":"result_generation/create_result_generation/create_result_generation.js",
            //评价结果查看
            "/result_check_list":"result_check/result_check_list/result_check_list.js",
            //特色评价报告
            "/character_evaluation_report":"result_check/character_evaluation_report/character_evaluation_report.js"

        };
        function init(main) {
            //特色评价结果
            x.on_by_config(on_by_config, main, "character_evaluation_result");
        }
        return {
            init: init
        }
    });