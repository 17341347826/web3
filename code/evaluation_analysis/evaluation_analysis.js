define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================成长记录袋=====================
            //评价数据分析-群体性分析
            "/co_analysis": "co_analysis/co_analysis.js",
            //区域数据分析
            "/region_analysis": "region_analysis/region_analysis.js",
            //学期-区域-维度要素分析
            "/region_analysis_wd": "region_analysis_wd/region_analysis_wd.js",
            //趋势分析-纵向分析
            "/evaluation_scale":"evaluation_scale/evaluation_scale.js",
            //对比分析-横向分析
            "/comparative_analysis":"comparative_analysis/comparative_analysis.js",
            // 对比分析-横向分析-按维度
            "/comparative_analysis_wd":"comparative_analysis_wd/comparative_analysis_wd.js",
            //纵向分析-个人列表
            "/evalution_person_list":"evalution_person_list/evalution_person_list.js",
            //横向分析-个人列表
            "/comparative_person_list":"comparative_person_list/comparative_person_list.js",
            //纵向分析-分析页面
            "/analysis":"analysis/analysis.js",
            // 学期-群体-按维度要素分析
            "/group_wd":"group_wd/group_wd.js",
            "/group_ys":"group_wd/group_wd.js",
            "/evaluation_scale_wd":"evaluation_scale_wd/evaluation_scale_wd.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluation_analysis");
        }

        return {
            init: init
        }
    });