/**
 * Created by Administrator on 2018/6/7.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //================================同学互评（eval_param_set里面有创建方案）===============================
            //互评查询列表
            "/student_mutual_evaluation":"peer_review/student_mutual_evaluation/student_mutual_evaluation.js",
            //创建互评
            "/student_add_mutual_evaluation":"peer_review/student_add_mutual_evaluation/student_add_mutual_evaluation.js",
            //学生进行互评参数设置
            "/parameter_setting":"peer_review/parameter_setting/parameter_setting.js",
            //学生进行互评(列表)
            "/student_fill_in_mutual_list":"peer_review/student_fill_in_mutual_list/student_fill_in_mutual_list.js",
            //学生进行互评
            "/student_fill_in_mutual":"peer_review/student_fill_in_mutual/student_fill_in_mutual.js",


        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluate_students");
        }

        return {
            init: init
        }
    });