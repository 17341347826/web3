define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================成长记录袋=====================
            //学生目标录入
            "/goals_and_plans_student_fill": "goals_and_plans/goals_and_plans_student_fill/goals_and_plans_student_fill.js",
            //学生自我描述
            "/new_myself_comment":"self_description/new_myself_comment/new_myself_comment.js",
            //学生同学寄语(互评)
            "/new_stu_comment":"self_description/new_stu_comment/new_stu_comment.js",
            //教师实现录入
            "/goals_and_plans_teacher_fill": "goals_and_plans/goals_and_plans_teacher_fill/goals_and_plans_teacher_fill.js",
            //教师寄语描述
            "/new_teacher_comment": "self_description/new_teacher_comment/new_teacher_comment.js",
            //家长评语
            "/new_parent_comment": "self_description/new_parent_comment/new_parent_comment.js",
            //添加综合实践
            "/add_practice":"my_comprehensive_practice/add_practice/add_practice.js",
            //学生上传成就奖励录入
            "/add_achievement":"my_comprehensive_practice/add_achievement/add_achievement.js",
            //================================学生自评===============================
            //自评项目
            "/student_self_evaluation":"self_evaluation/student_self_evaluation/student_self_evaluation.js",
            //创建项目
            "/student_add_self_evaluation":"self_evaluation/student_add_self_evaluation/student_add_self_evaluation.js",
            //查看项目详情
            "/student_self_detail":"self_evaluation/student_self_detail/student_self_detail.js",
            //学生进行自评
            "/student_fill_in_self":"self_evaluation/student_fill_in_self/student_fill_in_self.js",
            //================================学生奖惩===============================
            //荣誉奖励
            "/honor_reward":"self_reward_punish/honor_reward/honor_reward.js",
            //违规违纪
            "/lrregularities_violation":"self_reward_punish/lrregularities_violation/lrregularities_violation.js",
            //================================学生综合实践===============================
            //综合实践查看
            "/compre_practice_see":"self_compre_practice/compre_practice_see/compre_practice_see.js",
            //新综合实践查看
            "/new_compre_practice_see":"self_compre_practice/new_compre_practice_see/new_compre_practice_see.js",
            //教师上传惩罚
            "/teacher_punishment":"teacher_punishment/teacher_punishment.js",
            //================================毕业报告===============================
            //毕业报告--学生自我描述
            "/by_self_comment":"by_self_comment/by_self_comment.js",
            //学生查看自己的学期评价结果
            "/my_term_results":"my_term_results/my_term_results.js",
            //学生查看自己的日常评价结果
            "/my_daily_results":"my_daily_results/my_daily_results.js",
            //============================学生互评项目列表=====================
            "/student_evaluation_list":"student_evaluation_list/student_evaluation_list.js",
            //============================学生自评项目列表=====================
            "/student_add_evaluation_list":"student_add_evaluation_list/student_add_evaluation_list.js",

        };

        function init(main) {
            x.on_by_config(on_by_config, main, "self_evaluation_management");
        }

        return {
            init: init
        }
    });