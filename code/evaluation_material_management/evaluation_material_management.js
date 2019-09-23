/**
 * Created by Administrator on 2018/6/8.
 */
/**
 * Created by Administrator on 2018/5/24.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //================================综合实践===============================
            //查看学生上传材料
            "/stu_upload_material":"compre_practice/stu_upload_material/stu_upload_material.js",
            //查看学生遴选材料
            "/stu_selection_material":"compre_practice/stu_selection_material/stu_selection_material.js",
            //查看学生上传材料（列表形式）
            "/upload_list":"compre_practice/upload_list/upload_list.js",
            //学生上传材料列表进入详情
            "/upload_simple_detail":"compre_practice/upload_simple_detail/upload_simple_detail.js",
            //================================学生奖惩===============================
            //荣誉奖励--教师
            "/t_honor_reward":"teacher_reward_punish/t_honor_reward/t_honor_reward.js",
            //违规违纪--教师
            "/t_lrregularities_violation":"teacher_reward_punish/t_lrregularities_violation/t_lrregularities_violation.js",
            //校管理员惩戒处罚列表
            "/school_punish_list":"school_punish_list/school_punish_list.js",
            //校管理员惩戒处罚详情
            "/school_punish_detail":"school_punish_detail/school_punish_detail.js",
            //================================毕业报告===============================
            //毕业报告--教师寄语
            "/graduation_teacher_comments":"graduation_teacher_comments/graduation_teacher_comments.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "evaluation_material_management");
        }

        return {
            init: init
        }
    });