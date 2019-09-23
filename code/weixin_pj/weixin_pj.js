define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {            
            //微信登录
            "/login": "login/login.js",
            //教师首页
            "/teacher_home":"teacher_home/teacher_home.js",
            //学生首页
            "/student_home":"student_home/student_home.js",
            //家长注册
            "/parent_sign":"parent_sign/parent_sign.js",
            //忘记密码
            "/found_pwd_wx":"found_pwd_wx/found_pwd_wx.js",
            //申请试用
            "/give_trial":"give_trial/give_trial.js",
            //教师目标与实现情况
            "/teacher_find_target":"teacher_find_target/teacher_find_target.js",
            //教师修改实现情况
            "/teacher_find_target_edit":"teacher_find_target_edit/teacher_find_target_edit.js",
            //教师学期评语
            "/teacher_term_comment":"teacher_term_comment/teacher_term_comment.js",
            //教师学期评语编辑
            "/teacher_term_comment_edit":"teacher_term_comment_edit/teacher_term_comment_edit.js",
            //教师毕业评语
            "/teacher_graduation_comment":"teacher_graduation_comment/teacher_graduation_comment.js",
            //教师毕业评语编辑
            "/teacher_graduation_comment_edit":"teacher_graduation_comment_edit/teacher_graduation_comment_edit.js",
            //教师民主评价列表
            "/teacher_evaluation":"teacher_evaluation/teacher_evaluation.js",
            "/teacher_pro_list":"teacher_pro_list/teacher_pro_list.js",
            "/teacher_fill_list_wx":"teacher_fill_list_wx/teacher_fill_list_wx.js",
            "/teacher_content_list":"teacher_content_list/teacher_content_list.js",
            "/teacher_content_fill":"teacher_content_fill/teacher_content_fill.js",
            "/project_wx_radio":"project_wx_radio/project_wx_radio.js",
            //教师查看综合实践
            "/teacher_practice_see":"teacher_practice_see/teacher_practice_see.js",
            // 微信总进度
            "/progress_wx_total": "progress_wx_total/progress_wx_total.js",
            // 微信目标与计划
            "/progress_wx_target" :"progress_wx_target/progress_wx_target.js",
            // 微信评分
            "/progress_wx_pf": "/progress_wx_pf/progress_wx_pf.js",
            // 微信评语
            "/progress_wx_py": "/progress_wx_py/progress_wx_py.js",
            // 微信审核进度
            "/progress_wx_sh": "/progress_wx_sh/progress_wx_sh.js",
             //教师查看学生日常表现
            "/stu_per_score":"stu_per_score/stu_per_score.js",
            //教师评价菜单
            "/teacher_menu":"teacher_menu/teacher_menu.js",

            //日常表现录入
            //教师查看学生奖惩
            "/teacher_see_punishment":"teacher_see_punishment/teacher_see_punishment.js",
            //教师日常表现录入
            "/input_information":"input_information/input_information.js",
            //教师查看学生日常表现详情
            "/stu_score_detail":"stu_score_detail/stu_score_detail.js",
            //学期评价公示提异议-教师端
            "/term_dissent":"term_dissent/term_dissent.js",
            //学生毕业公示提异议 - 教师端
            "/graduation_dissent":"graduation_dissent/graduation_dissent.js",

            //=====================================公示页面===========================================
            //学期评价公示-教师端
            "/term_publicity":"term_publicity/term_publicity.js",
            //学生毕业评价公示 - 教师端
            "/graduation_publicity":"graduation_publicity/graduation_publicity.js",
            //日常表现
            "/daily_perform_pub":"publicity/daily_perform_pub/daily_perform_pub.js",

            //=====================================学生登录===========================================
            //学生评价菜单
            "/stu_menu":"stu_menu/stu_menu.js",
            //学生目标与计划查看
            "/plan_wx_student":"plan_wx_student/plan_wx_student.js",
            //学生目标与计划填写
            "/plan_wx_student_edit":"plan_wx_student_edit/plan_wx_student_edit.js",
            //日常表现记录详情（日常表现查看）
            "/daily_performance_check":"stu_daily_performance/daily_performance_check/daily_performance_check.js",
            //日常表现统计
            "/daily_performance_statistics":"stu_daily_performance/daily_performance_statistics/daily_performance_statistics.js",
            //日常表现亮点与不足
            "/daily_performance_gb":"stu_daily_performance/daily_performance_gb/daily_performance_gb.js",
            //添加材料(综合实践+成就奖励)
            "/add_wx_material":"add_wx_material/add_wx_material.js",
            //我记录的材料
            "/stu_record_material":"stu_compre_practice/stu_record_material/stu_record_material.js",
            //我记录的材料修改
            "/update_wx_practice":"stu_compre_practice/update_wx_practice/update_wx_practice.js",
            //未遴选的材料
            "/stu_no_selected_material":"stu_compre_practice/stu_no_selected_material/stu_no_selected_material.js",
            //已遴选的材料
            "/stu_selected_material":"stu_compre_practice/stu_selected_material/stu_selected_material.js",
            //成就奖励
            "/stu_honor_reward":"stu_reward_punish/stu_honor_reward/stu_honor_reward.js",
            //惩戒处罚
            "/stu_irregularities_violation":"stu_reward_punish/stu_irregularities_violation/stu_irregularities_violation.js",
            //学生自评列表
            "/evaluate_wx_self":"evaluate_wx_self/evaluate_wx_self.js",
            //学生进行自评
            "/student_wx_self":"student_wx_self/student_wx_self.js",
            //评价同学-评分-学生端
            "/stu_score":"stu_score/stu_score.js",
            //评价同学-评分-学生列表
            "/stu_score_list":"stu_score_list/stu_score_list.js",
            //评价同学-评分-编辑/评价
            "/stu_score_edit":"stu_score_edit/stu_score_edit.js",
            //同学寄语-学生端
            "/classmate_send_word":"classmate_send_word/classmate_send_word.js",
            //评价/修改同学寄语-学生端
            "/modify_classmate_word":"modify_classmate_word/modify_classmate_word.js",
            //学期自评-學生端
            "/stu_term_evaluation":"stu_term_evaluation/stu_term_evaluation.js",
            //评价/修改学生学期自评
            "/modify_stu_term_ev":"modify_stu_term_ev/modify_stu_term_ev.js",
            //学生毕业评价自评
            "/stu_graduation_evaluation":"stu_graduation_evaluation/stu_graduation_evaluation.js",
            //学生毕业评价修改
            "/modify_stu_graduation_ev":"modify_stu_graduation_ev/modify_stu_graduation_ev.js",
            //成长分析
            "/kid_analysis":"parent_login/kid_analysis/kid_analysis.js",
            //成长激励卡
            "/kid_incentive_card":"parent_login/kid_incentive_card/kid_incentive_card.js",
            //=====================================个人中心===========================================
            //修改密码
            "/update_pwd":"person_center/update_pwd/update_pwd.js",
            //绑定手机号
            "/binding_phone":"person_center/binding_phone/binding_phone.js",
            //个人信息
            "/person_info":"person_center/person_info/person_info.js",
            "/t_app":"change_html/change_html.js",
            //关于兴唐
            "/about_uptang":"person_center/about_uptang/about_uptang.js",
            //热点问题
            "/hot_issues":"person_center/hot_issues/hot_issues.js",
            //意见反馈：张震反馈后台接口暂时屏蔽
            "/give_feedback":"person_center/give_feedback/give_feedback.js",
            //学生个人资料
            "/stu_person_data":"person_center/stu_person_data/stu_person_data.js",
            //=====================================家长登录===========================================
            //家长首页
            "/parent_home":"parent_login/parent_home/parent_home.js",
            //家长菜单
            "/parent_menu":"parent_login/parent_menu/parent_menu.js",
            //家长寄语-旧的，暂时没有用了
            "/parent_msg":"parent_login/parent_msg/parent_msg.js",
            //家长寄语--新的
            "/new_parent_msg":"parent_login/new_parent_msg/new_parent_msg.js",
            //家长寄语新的-填写评语
            "/parent_msg_fill":"parent_login/parent_msg_fill/parent_msg_fill.js",
            //日常表现
            "/daily_record_see":"parent_login/daily_record_see/daily_record_see.js",
            //家长查询子女成就奖励
            "/kid_honor_reward":"parent_login/kid_honor_reward/kid_honor_reward.js",
            //家长查询学期评语
            "/term_parent_comment":"parent_login/term_parent_comment/term_parent_comment.js",
            //家长查询学期评价结果-公示
            "/kid_term_pub":"parent_login/kid_term_pub/kid_term_pub.js",
            //家长查询学期评价结果
            "/kid_term_results":"parent_login/kid_term_results/kid_term_results.js",
            //家长查询毕业评价结果
            "/kid_graduate_results":"parent_login/kid_graduate_results/kid_graduate_results.js",
            //学生综合素质发展纵向分析-学生和家长目前可以查看
            "/stu_portrait_analysis":"parent_login/stu_portrait_analysis/stu_portrait_analysis.js",
            //====================================市级身份登录===========================================
            //市首页
            "/city_home":"city_district_login/city_home/city_home.js",
            //市菜单
            "/city_menu":"city_district_login/city_menu/city_menu.js",
            //市结果生成进度（区县）
            "/city_result_progess":"city_district_login/city_result_progess/city_result_progess.js",
            //市用户活跃度（区县）
            "/city_user_activity":"city_district_login/city_user_activity/city_user_activity.js",
            //市学期评价结果（区县）
            "/city_term_eval_results":"city_district_login/city_term_eval_results/city_term_eval_results.js",
            //市毕业评价结果（区县）
            "/city_gra-eval-results":"city_district_login/city_gra-eval-results/city_gra-eval-results.js",
            //新增维度:市管理员增加行政指标，区县、学校增加特色指标
            "/add_first_index":"city_district_login/add_first_index/add_first_index.js",
            //新增要素:市管理员增加行政指标，区县、学校增加特色指标
            "/a_a_element":"city_district_login/a_a_element/a_a_element.js",
            //新增表现:市管理员增加行政指标，区县、学校增加特色指标
            "/a-k-perform":"city_district_login/a-k-perform/a-k-perform.js",
            //评价方案-市、区、校
            "/evaluation_scheme":"city_district_login/evaluation_scheme/evaluation_scheme.js",
            //====================================区县级身份登录===========================================
            //区县首页
            "/area_home":"district_login/area_home/area_home.js",
            //区县菜单
            "/area_menu":"district_login/area_menu/area_menu.js",
            //====================================校级身份登录===========================================
            //校首页
            "/school_home":"school_login/school_home/school_home.js",
            //校菜单
            "/school_menu":"school_login/school_menu/school_menu.js",
            //审核复议进度
            "/school_review_progress":"school_login/school_review_progress/school_review_progress.js",
            //用户活跃度
            "/school_user_activity":"school_login/school_user_activity/school_user_activity.js",
            //====================================三个档案袋===========================================
            //成长档案袋列表
            "/growth_archives_list":"archives/growth_archives_list/growth_archives_list.js",
            //成长档案袋
            "/growth_archives":"archives/growth_archives/growth_archives.js",
            //学期档案袋列表
            "/term_archives_list":"archives/term_archives_list/term_archives_list.js",
            //学期档案袋
            "/page_term_archives":"archives/term_archives/term_archives.js",
            //毕业档案袋列表
            "/graduate_archives_list":"archives/graduate_archives_list/graduate_archives_list.js",
            //毕业档案袋
            "/graduate_archives":"archives/graduate_archives/graduate_archives.js",
            "/show_video":"stu_compre_practice/show_video/show_video.js"

        };
       
        function init(main) {
            x.on_by_config(on_by_config, main, "weixin_pj");
        }

        return {
            init: init
        }
    });