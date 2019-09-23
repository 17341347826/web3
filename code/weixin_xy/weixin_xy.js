define(["jquery",
        C.CMF("router.js")
    ],
    function ($, x) {
        var on_by_config = {
            /* =================微信端学业质量监测与评价学生成绩查看===================== */
            //1.=====================登录=======================
            "/xywx_login": "login/login.js",
            //=====================菜单=======================
            "/xy_home": "xy_home/xy_home.js",
            //2.=================选择考试项目=====================
            "/choose_project": "choose_project/choose_project.js",
            //3.=================查看指定考试成绩==================
            "/score": "score/score.js",
            //4.=================查看错题集================
            "/wrong_set_all":"wrong_set_all/wrong_set_all.js",
            //=====================选择考试科目=======================
            "/choose_sub": "choose_sub/choose_sub.js",
            //成绩分析
            "/grade_analysis":"grade_analysis/grade_analysis.js",
            //项目查询
            "/projec_query":"projec_query/projec_query.js",
            //小题得分
            "/point_score":"point_score/point_score.js",
            //题目详情
            "/subject_detail":"subject_detail/subject_detail.js",
            //题目解析
            "/topic_analysis":"topic_analysis/topic_analysis.js",
            //错题集-科目列表
            "/subjects":"wrong_topic_book/subjects/subjects.js",
            //筛选
            "/screen":"wrong_topic_book/screen/screen.js",
            //单一科目查看
            "/singl_subject":"wrong_topic_book/singl_subject/singl_subject.js",
            //错题详情
            "/error_detail":"wrong_topic_book/error_detail/error_detail.js"

        };

        function init(main) {
            x.on_by_config(on_by_config, main, "weixin_xy");
        }

        return {
            init: init
        }
    });