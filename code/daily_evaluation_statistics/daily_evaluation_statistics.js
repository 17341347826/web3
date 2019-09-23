/**
 * Created by Kenton on 2018/6/6.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================横向分析-日常评价=====================
            //日常评价统计分析-目标与计划-市区县
            "/daily_target":"daily_target/daily_target.js",
            //日常评价统计分析-综合实践-市区县
            "/daily_comprehensive_practice":"daily_comprehensive_practice/daily_comprehensive_practice.js",
            //日常评价统计分析-综合实践-维度
            "/daily_comprehensive_practice_wd":"daily_comprehensive_practice_wd/daily_comprehensive_practice_wd.js",
            "/daily_comprehensive_practice_ys":"daily_comprehensive_practice_wd/daily_comprehensive_practice_wd.js",
            //日常评价统计分析-个性特长-市区县
            "/daily_special":"daily_special/daily_special.js",
            //日常评价统计分析-获奖情况-市区县
            "/daily_award":"daily_award/daily_award.js",
            //日常评价统计分析-个性特长-学校端
            "/daily_special_school":"daily_special_school/daily_special_school.js" ,
            //日常评价统计分析-获奖情况-学校端
            "/daily_award_school":"daily_award_school/daily_award_school.js",
            //日常评价统计分析-综合实践-学校端
            "/daily_practice_school":"daily_practice_school/daily_practice_school.js",
            //日常评价统计分析-目标与计划-学校端
            "/daily_target_school":"daily_target_school/daily_target_school.js",



            //=================纵向分析-日常评价=============================================
            //目标与计划
            "/daily_portrait_target":"daily_portrait_target/daily_portrait_target.js",
            //日常表现与个性特长
            "/daily_portrait_special":"daily_portrait_special/daily_portrait_special.js",
            //综合实践活动
            "/daily_portrait_practice":"daily_portrait_practice/daily_portrait_practice.js",
            //获奖情况
            "/daily_portrait_award":"daily_portrait_award/daily_portrait_award.js",
            // 日常评价统计分析-纵向分析-维度要素
            "/daily_vertical_ana": "daily_vertical_ana/daily_vertical_ana.js",
            //===================区域性分析=========================================
            //目标与计划
            "/daily_region_target":"daily_region_target/daily_region_target.js",
            //综合实践
            "/daily_region_practice":"daily_region_practice/daily_region_practice.js",
            //个性特长
            "/daily_region_special":"daily_region_special/daily_region_special.js",
            //获奖情况
            "/daily_region_award":"daily_region_award/daily_region_award.js",
            // 日常评价统计分析-区域分析-维度要素
            "/daily_region_ana": "daily_region_ana/daily_region_ana.js",
            //======================群体性分析=========================================
            //目标与计划
            "/daily_group_target":"daily_group_target/daily_group_target.js",
            //综合实践活动
            "/daily_group_practice":"daily_group_practice/daily_group_practice.js",
            //个性特长
            "/daily_group_special":"daily_group_special/daily_group_special.js",
            //获奖情况
            "/daily_group_award":"daily_group_award/daily_group_award.js",

            //=========================================================================
            //日常评价统计分析 --群体---维度要素分析
            "/daily_group_wd":"daily_group_wd/daily_group_wd.js",
            "/daily_group_ys":"daily_group_wd/daily_group_wd.js",
            //归因分析
            "/attribution_relationship":"attribution_relationship/attribution_relationship.js"

        };
        function init(main) {
            x.on_by_config(on_by_config, main, "daily_evaluation_statistics");
        }
        return {
            init: init
        }
    });