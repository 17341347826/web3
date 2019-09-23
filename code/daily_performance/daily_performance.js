/**
 * Created by Kenton on 2018/6/6.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //==========================成长记录袋=====================
            //日常表现录入--教师、班干部
            "/dpe": "teacher/dpe/dpe.js",
            //教师审核+评价小组审核（各个身份都做了）
            "/teacher_review":"teacher/teacher_review/teacher_review.js",
            //教师审核+评价小组审核（各个身份都做了）----新的2019-6-27
            "/new_teacher_review":"teacher/new_teacher_review/new_teacher_review.js",
            //日常表现待审核
            "/dailyperform_group_review":"teacher/dailyperform_group_review/dailyperform_group_review.js",
            //日常表现查看
            "/daily_perform_see":"teacher/daily_perform_see/daily_perform_see.js",
            //日常表现查看(列表方式)
            "/daily_perform_see_list":"teacher/daily_perform_see_list/daily_perform_see_list.js",
            //学生-日常表现
            "/student_daily_perform_see":"student/student_daily_perform_see/student_daily_perform_see.js",
            
            //=============================公示========================
            //日常表现公示--教师、学生、家长
            "/daily_perform_pub":"publicity/daily_perform_pub/daily_perform_pub.js",
            //综合实践公示---教师、家长、学生
            "/compre_practice_pub":"publicity/compre_practice_pub/compre_practice_pub.js",
            //成就奖励公示---教师、家长、学生
            "/achievement_reward_pub":"publicity/achievement_reward_pub/achievement_reward_pub.js",
            //成长激励卡（标志性卡）公示---教师、家长、学生
            "/incentive_card_pub":"publicity/incentive_card_pub/incentive_card_pub.js",
            //学业成绩公示
            "/final_exam_public":"publicity/final_exam_public/final_exam_public.js",
            //艺术测评公示
            "/art_evaluation_public":"publicity/art_evaluation_public/art_evaluation_public.js",
            //体质测评公示
            "/ph_test_list":"publicity/ph_test_list/ph_test_list.js",
            //学期评价结果公示
            "/public_statistical_results":"publicity/public_statistical_results/public_statistical_results.js",
            //毕业评价结果公示
            "/graduation_report_dissent":"publicity/graduation_report_dissent/graduation_report_dissent.js",
            //学期评价结果二次公示
            "/two_publicity":"publicity/two_publicity/two_publicity.js",
            //公示汇总
            "/all_publicity":"publicity/all_publicity/all_publicity.js"

        };

        function init(main) {
            x.on_by_config(on_by_config, main, "daily_performance");
        }

        return {
            init: init
        }
    });