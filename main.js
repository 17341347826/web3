/**
 * Created by uptang on 2017.04.26.
 */
require.config(glb_staus.map);
require([
        "jquery",
        C.CLF("avalon.js"),
        C.CMF("header/header.js"),
        //三级菜单
        C.CMF("tree_menu/tree_menu.js"),
        C.Com('all_index'),
        //学生--评价同学
        C.Com('evaluate_students'),
        //评价参数设置
        C.Com('eval_param_set'),
        //评价统计分析
        C.Com('eval_statistical_analysis'),
        //教师-评价材料管理
        C.Com('evaluation_material_management'),
        C.Com('evaluation_supervision'),
        C.Com('growth'),
        //成长激励卡
        C.Com('growth_incentive_card'),
        C.Com('daily_performance'),
        C.Com('personal_center'),
        C.Com('evaluation_result_management'),
        //评价数据分析
        C.Com('evaluation_analysis'),
        //自评管理
        C.Com('self_evaluation_management'),
        C.Com('sys_stat'),
        //学生评价结果
        C.Com('self_evaluation_results'),
        //审核复议管理
        C.Com('reconsider_manage'),
        //评价材料管理
        C.Com('evaluation_material'),
        //学业成绩
        C.Com('achievement'),
        //评价状况监控
        C.Com('evaluation_condition_monitor'),
        //问卷
        C.Com('questionnaire_investigation'),
        //日常评价统计
        C.Com('daily_evaluation_statistics'),
        //毕业统计分析
        C.Com('graduate_statistics_analysis'),
        //基础信息
        C.Com('user'),
        //超管操作
        C.Com('admin'),
        //综合实践管理系统
        C.Com('practice_management'),
        //特色评价结果
        C.Com('character_evaluation_result'),
        //等级划分
        C.Com('grading_audit'),
        //通知
        C.Com('notice'),
        C.CMF("router.js"),
        C.CB("Growth/menu.js"),
        C.CMF("data_center.js"),
        //体质测评套件
        C.Com('health'),
        //数据安全
        C.Com('data_security'),
        //招生录取
        C.Com('enrolment'),
        //诚信承诺
        C.Com('promise'),
        C.Com("online_service"),
        "layer"
    ],

    function ($, avalon, header, tree_menu, all_index, evaluate_students, e_p_set, eval_statistical_analysis, e_material_m, e_s, growth, growth_incentive_card, daily_performance,
              p_c, e_r_management, evaluation_analysis, self_evaluation_management, sys_stat, self_evaluation_results, reconsider_manage, evaluation_material,
              achievement, evaluation_condition_monitor, QI,
              DES, GSA, user, admin, practice_management, cer,grading_audit, notice, x, menu, data_center, health, data_security, enrolment, lpromise, online_service,ayer) {
        data_center.uin(function (resp) {
            var user_type = resp.data.user_type;
            var user_info = JSON.parse(resp.data["user"]);
            var ary_session = ["", "", "", "", "", ""];
            var main = avalon.define({
                $id: "main",
                data: {
                    page_index: -1,

                    body: {view: "", ctrl: null, url: ary_session[0]},
                    menu: menu.menu(user_type),
                    user: user_info,
                },
                is_show_menu: false
            });
            main.$watch('onReady', function () {
                $("#wait").remove();

            });
            x.on("/", "home_x.js", main);
            all_index.init(main);
            //学生---评价同学
            evaluate_students.init(main);
            e_p_set.init(main);
            //教师--评价材料管理
            e_material_m.init(main);
            //民主评价进度
            e_s.init(main);
            //评价统计分析
            eval_statistical_analysis.init(main);
            //成长
            growth.init(main);
            //成长激励卡
            growth_incentive_card.init(main);
            //个人中心
            p_c.init(main);
            //评价结果管理
            e_r_management.init(main);
            //评价数据分析
            evaluation_analysis.init(main);
            //自评管理
            self_evaluation_management.init(main);
            //问卷调查
            sys_stat.init(main);
            //评价结果-学生
            self_evaluation_results.init(main);
            //评价材料管理
            evaluation_material.init(main);
            daily_performance.init(main);
            //学业成绩
            achievement.init(main);
            reconsider_manage.init(main);
            evaluation_condition_monitor.init(main);
            QI.init(main);
            user.init(main);
            GSA.init(main);
            admin.init(main);
            practice_management.init(main);
            notice.init(main);
            health.init(main);
            //数据安全
            data_security.init(main);
            grading_audit.init(main);
            //特色评价结果
            cer.init(main);
            //招生录取
            enrolment.init(main);
            //诚信承诺
            lpromise.init(main);
            online_service.init(main);
            DES.init(main);
            x.start("/");
            avalon.scan(document.body)

        })

    }
);