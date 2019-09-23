/**
 * Created by Kenton on 2018/6/6.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================毕业统计分析=====================
            //区域性分析-毕业统计分析
            "/regional_analysis_graduate":"regional_analysis_graduate/regional_analysis_graduate.js",
            //群体分析-毕业统计分析
            "/group_analysis_graduate":"group_analysis_graduate/group_analysis_graduate.js",
            //横向分析-毕业统计分析
            "/horizontal_analysis_graduate":"horizontal_analysis_graduate/horizontal_analysis_graduate.js",
            //横向分析-毕业统计分析-按維度
            "/horizontal_analysis_graduate_wd":"horizontal_analysis_graduate_wd/horizontal_analysis_graduate_wd.js",
            //横向分析-毕业统计分析-按要素
            "/horizontal_analysis_graduate_ys":"horizontal_analysis_graduate_ys/horizontal_analysis_graduate_ys.js",
            //纵向分析-毕业统计分析(市，区县)
            "/vertical_analysis_graduate":"vertical_analysis_graduate/vertical_analysis_graduate.js",
            //纵向分析-毕业统计分析（学校）
            "/vertical_graduate_school":"vertical_graduate_school/vertical_graduate_school.js",
            //纵向分析-指标维度分析-毕业评价分析-评价维度
            "/portrait_analysis_graduate":"portrait_analysis_graduate/portrait_analysis_graduate.js",
            //区域分析-指标维度分析-毕业评价分析-评价维度
            "/region_index_graduate_d":"region_index_graduate_d/region_index_graduate_d.js",
            //群体分析-指标维度分析-毕业评价分析-评价维度
            "/group_index_graduate_d":"group_index_graduate_d/group_index_graduate_d.js",
        };
        function init(main) {
            x.on_by_config(on_by_config, main, "graduate_statistics_analysis");
        }
        return {
            init: init
        }
    });