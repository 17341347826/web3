/**
 * Created by Administrator on 2018/5/29.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //录取控制线
            "/control_line":"control_line/control_line.js",
            //考生志愿
            "/stu_volunteering":"stu_volunteering/stu_volunteering.js",
            //高中学校查看
            "/high_school_check":"high_school_check/high_school_check.js",
            //考生成绩
            "/stu_examine_score":'stu_examine_score/stu_examine_score.js',
            //学生列表
            "/growth_stu_list":'growth_stu_list/growth_stu_list.js',
            //录取单位查看
            "/check_stu_list":"check_stu_list/check_stu_list.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"enrolment");
        }
        return {
            init: init
        }
    });