define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            "/management_list":"management_list/management_list.js",
            //创建活动
            "/create_practice":"create_practice/create_practice.js",
            //我的活动列表(学生)
            "/my_list":"my_list/my_list.js",
            //添加材料
            "/add_pra_ma":"add_pra_ma/add_pra_ma.js",
            //活动统计（市、区、校）
            "/activity_statistics":"activity_statistics/activity_statistics.js",
            //报名情况
            "/sign_result":"sign_result/sign_result.js",
            //报名详情
            "/print_info":"print_info/print_info.js",
            //教师查看指导的活动列表
            "/teacher_list":"teacher_list/teacher_list.js",
            //教师填写评价
            "/teacher_list_com":"teacher_list_com/teacher_list_com.js"
        };
        function init(main) {
            x.on_by_config(on_by_config, main,"practice_management");
        }
        return {
            init: init
        }
    });