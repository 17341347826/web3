/**
 * Created by Administrator on 2018/6/15.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================成长激励卡=====================
            //成长激励卡公示页面地址：daily_performance-publicity-incentive_card_pub
            //成长激励卡多种状态查看--教师
            "/incentive_card_type_see": "incentive_card_type_see/incentive_card_type_see.js",
            //成长激励卡录入--教师
            "/incentive_card_grant": "incentive_card_grant/incentive_card_grant.js",
            //成长激励卡修改--教师
            "/signCard_echo": "signCard_echo/signCard_echo.js",
            //成长激励卡列表--教师
            "/incentive_card_list": "incentive_card_list/incentive_card_list.js",
            //成长激励卡列表查看--教师
            "/incentive_card_see_list": "incentive_card_see_list/incentive_card_see_list.js",
            //成长激励卡详情查看--教师  事实依据查看
            "/incentive_card_detail": "incentive_card_detail/incentive_card_detail.js",
            //教师成长激励卡---异议审核(上传复议材料里面，不用写了，冯大说的)
            "/signCard_Objection": "signCard_Objection/signCard_Objection.js",
            //教师成长激励卡---异议详情、异议收集、审核意见
            // "/signCard_Objection_check": "signCard_Objection_check/signCard_Objection_check.js",
            //===============================校管理员设置标志性卡========================
            //成长激励卡初始设置--校管理员
            "/school_card_setting": "school_card_setting/school_card_setting.js",
            //成长激励卡标志性卡--校管理员
            "/school_iconic_card": "school_iconic_card/school_iconic_card.js",
            // 成长激励卡编辑
            "/trademark_card_edit": "trademark_card_edit/trademark_card_edit.js",
            //成长激励卡结果查看--校管理员、校领导
            "/school_card_result": "school_card_result/school_card_result.js",
            //===============================学生标志性卡========================
            // 学生=====成长激励卡查看
            "/stu_oneself_card": "stu_oneself_card/stu_oneself_card.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "growth_incentive_card");
        }

        return {
            init: init
        }
    });