define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //创建卷子
            "/add_papers":"add_papers/add_papers.js",
            //查询卷子列表
            "/papers_list":"papers_list/papers_list.js",
            //查看卷子
            "/check_roll":"check_roll/check_roll.js",
            //发布卷子
            "/release_paper":"release_paper/release_paper.js",
            //可填写的卷子列表
            "/answer_paper_list":"answer_paper_list/answer_paper_list.js",
            //答卷
            "/answer_page":"answer_page/answer_page.js",
            //添加
            "/add_topic":"add_topic/add_topic.js",
            "/add_simple_question":"add_simple_question/add_simple_question.js",
            // 多选题添加
            "/add_multiple_question":"add_multiple_question/add_multiple_question.js",
            //单项填空题添加
            "/add_single_filling":"add_single_filling/add_single_filling.js",
            //多项填空题添加
            "/add_multiple_filling":"add_multiple_filling/add_multiple_filling.js",
            //统计列表页面
            "/statistical_list":"statistical_list/statistical_list.js",
            //统计问卷
            "/statistical_questionnaire":"statistical_questionnaire/statistical_questionnaire.js"


        };
        function init(main) {
            x.on_by_config(on_by_config, main,"questionnaire_investigation");
        }
        return {
            init: init
        }
    });