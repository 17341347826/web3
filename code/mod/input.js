/**
 * 录入（综合实践活动、奖惩、日常表现）相关接口
 * Created by melody 2018/6/8 1119.
 */

// 添加或修改品德
Task.add_or_modify_morality = make_interface("GrowthRecordBag/morality_saveOrUpdate", {"__sync__":false},  false );
// 添加身心健康活动
Task.add_health_activity = make_interface("GrowthRecordBag/healthActivity_addHealthActivity", {"__sync__":false},  false );
// 修改身心健康活动
Task.modify_health_activity = make_interface("GrowthRecordBag/healthActivity_updateHealthActivity", {"__sync__":false},  false );
// 添加或修改研究性学习
Task.add_or_modify_study = make_interface("GrowthRecordBag/study_save_or_update", {"__sync__":false},  false );
// 添加艺术活动
Task.add_artactivity = make_interface("GrowthRecordBag/artactivity_addArtactivity", {"__sync__":false},  false );
// 修改艺术活动
Task.modify_artactivity = make_interface("GrowthRecordBag/artactivity_updateArtactivity", {"__sync__":false},  false );
// 添加或修改社会实践
Task.add_or_modify_practice = make_interface("GrowthRecordBag/practice_save_or_update", {"__sync__":false},  false );
// 添加成就奖励
Task.add_achievement = make_interface("GrowthRecordBag/achievement_addAchievement", {"__sync__":false},  false );
// 修改成就奖励
Task.modify_achievement = make_interface("GrowthRecordBag/achievement_updateAchievement", {"__sync__":false},  false );
// 添加处罚
Task.add_punish = make_interface("GrowthRecordBag/punish_addpunish", {"__sync__":false},  false );
// 修改处罚
Task.modify_punish = make_interface("GrowthRecordBag/punish_updatepunish", {"__sync__":false},  false );
// 添加或修改日常表现
Task.add_or_modify_everyday = make_interface("everyday/save_or_update_everyday", {"__sync__":false},  false );
//品德详情
Task.get_morality_detial = make_interface("GrowthRecordBag/morality_detail", {"__sync__":false},  false );
cloud.get_morality_detial = make_api("get_morality_detial");
//学业详情
Task.get_study_detial = make_interface("GrowthRecordBag/study_detail", {"__sync__":false},  false );
cloud.get_study_detial = make_api("get_study_detial");
//艺术活动详情
Task.get_art_detial = make_interface("GrowthRecordBag/artactivity_findByStuArtactivityID", {"__sync__":false},  false );
cloud.get_art_detial = make_api("get_art_detial");
//社会实践详情
Task.get_social_detial = make_interface("GrowthRecordBag/practice_detail", {"__sync__":false},  false );
cloud.get_social_detial = make_api("get_social_detial");
//身心健康实践详情
Task.get_health_detial = make_interface("GrowthRecordBag/healthActivity_findByStuHealthActivityID", {"__sync__":false},  false );
cloud.get_health_detial = make_api("get_health_detial");
//删除品德
Task.del_pd = make_interface("GrowthRecordBag/morality_delete", {"__sync__":false},  false );
cloud.del_pd = make_api("del_pd");
//删除社会实践
Task.del_shsj = make_interface("GrowthRecordBag/practice_delete", {"__sync__":false},  false );
cloud.del_shsj = make_api("del_shsj");
//删除学业水平
Task.del_sysp = make_interface("GrowthRecordBag/study_delete", {"__sync__":false},  false );
cloud.del_sysp = make_api("del_sysp");
//删除艺术活动
Task.del_yshd = make_interface("GrowthRecordBag/artactivity_deleteArtactivity", {"__sync__":false},  false );
cloud.del_yshd = make_api("del_yshd");
//删除身心健康
Task.del_sxjk = make_interface("GrowthRecordBag/healthActivity_deleteHealthActivity", {"__sync__":false},  false );
cloud.del_sxjk = make_api("del_sxjk");
/**
 * 添加或修改品德
 * @author melody
 * @param args
     activity_describe	活动描述	string
     activity_type	活动类型	string
     attachment	附件（必传）	string	json字符串数组
     end_time	活动结束时间（必传）	string
     feel	活动感想（必传）	string
     hour_consume	总时长	number	0.0
     id	记录id（modify 必传） number
     member	参与人员	string
     process	活动过程	string
     reap	获得成果	string
     site	活动地点	string
     start_time	活动开始时间（必传）	string
     title	活动名称（必传）	string
     isTypical 是否典型 number （-0不是 1是） 是特长 也是典型
     sftc 是否特长（必传） number （-0不是 1是）
     status 状态（必传） number  （-0草稿 1删除 1待审核 2审核通过 3审核不通过 4归档）
     **  是特长   ——>   待审核
         不是特长 ——>   草稿   ——> 遴选  ——> 待审核  ——> 审核不通过  ——> 草稿
 */
cloud.add_or_modify_morality = make_api("add_or_modify_morality");

/**
 * 添加或修改身心健康活动
 * @author melody
 * @param args
     hea_achievements	活动开始时间	string
     hea_activityDescribe 活动描述	string
     hea_activityFeel	活动感想（必传）	string
     hea_activityName	活动名称（必传）	string
     hea_activityPlace	活动地点	string
     hea_activityProcess 活动过程 string
     hea_activityType	活动类型	string
     hea_enclosure	附件（必传）	string
     hea_endDate 活动结束时间（必传）	string
     hea_member	参与成员	string
     hea_startDate	活动开始时间（必传）	string
     id	记录id（modify 必传） number
     hea_state	状态（必传） number (-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档)
     isTypical  是否典型 number （-0不是 1是） 是特长 也是典型
     sftc 是否特长（必传） number （-0不是 1是）
     **  是特长   ——>   待审核
         不是特长 ——>   草稿   ——> 遴选  ——> 待审核  ——> 审核不通过  ——> 草稿
 */
cloud.add_or_modify_health_activity = function (args,cb) {
    if(args.id){
        D("modify_health_activity", args,cb);
    }else {
        D("add_health_activity", args, cb);
    }
};

/**
 * 添加或修改研究性学习
 * @author melody
 * @param args
     attachment	附件（必传）	string
     course_name	课题名称（必传）	string
     course_type	课题类型（必传）	string
     duty	承担任务（必传）	string
     end_date	课题结束时间（必传）	string
     feel	收获感想（必传）	string
     hour_consume	耗用时长（必传）	string
     member	参与成员（必传）	string
     process	开展过程（必传）	string
     result	收获结果	（必传）string
     role	担任角色（必传）	string
     site	地点（必传）	string
     start_date	课题开始时间（必传）	string
     theme	研究主题（必传）	string
     tutor	指导老师（必传）	string
     id	记录id（modify 必传） number
     status	状态（必传）	string （-0草稿 1删除 1待审核 2审核通过 3审核不通过 4归档）
     isTypical  是否典型 number （-0不是 1是） 是特长 也是典型
     sftc 是否特长（必传） number （-0不是 1是）
     **  是特长   ——>   待审核
         不是特长 ——>   草稿   ——> 遴选  ——> 待审核  ——> 审核不通过  ——> 草稿
 */
cloud.add_or_modify_study = make_api("add_or_modify_study");

/**
 * 添加或修改艺术活动
 * @author melody
 * @param args
     art_achievements	取得成果	string
     art_describe	活动描述	string
     art_enclosure	附件（必传）	string
     art_end_date 结束时间（必传）	string
     art_feel	活动感想（必传）	string
     art_member	参与成员	string
     art_name	艺术名称	（必传）string
     art_place	艺术地点	string
     art_process	活动过程	string
     art_start_date	开始时间（必传）	string
     art_type 	艺术类型	string
     id	记录id（modify 必传） number
     art_state	状态（必传） 	number (-1:删除 1:待审核2:提交草稿3:未通过4:审核通过5:归档)
     isTypical  是否典型 number （-0不是 1是） 是特长 也是典型
     sftc 是否特长（必传） number （-0不是 1是）
     **  是特长   ——>   待审核
         不是特长 ——>   草稿   ——> 遴选  ——> 待审核  ——> 审核不通过  ——> 草稿
 */
cloud.add_or_modify_artactivity = function (args, cb) {
    if(args.id){
        D("modify_artactivity", args, cb);
    }else {
        D("add_artactivity", args, cb);
    }
};

/**
 * 添加或修改社会实践
 * @author melody
 * @param args
     activity_describe	描述	 string
     activity_type	类型（必传）	string
     attachment	附件（必传）	string
     end_date	结束时间（必传）	string
     feel	感想（必传）	string
     hour_consume	活动时长（必传）	number	0.0
     member	成员（必传）	string
     process	活动过程	string
     reap	成果（必传）	string
     site	地点（必传）	string
     start_date	开始时间（必传）	string
     title	标题（必传）	string
     id	记录id（modify 必传） number
     status	状态	 number  （-0草稿 1待审核 2审核通过 3审核不通过 4归档）
     isTypical  是否典型 number （-0不是 1是） 是特长 也是典型
     sftc 是否特长（必传） number （-0不是 1是）
     **  是特长   ——>   待审核
         不是特长 ——>   草稿   ——> 遴选  ——> 待审核  ——> 审核不通过  ——> 草稿
 */
cloud.add_or_modify_practice = make_api("add_or_modify_practice");

/**
 * 添加或修改成就奖励
 * @author melody
 * @param args
     ach_date	成就获得时间（必传）	string
     ach_enclosure	附件（必传）	string
     ach_feel	获得成就感想（必传）	string
     ach_first_level_index	一级指标	string
     ach_level	成就级别	string
     ach_name	成就名称（必传）	string
     ach_not_passed	未通过原因	string
     ach_rank	成就等级	string
     ach_state	状态(-1:删除1:待审核2:提交草稿3:未通过4:审核通过)	number
     ach_two_level_index	二级指标	string
     ach_type	成就类型	string
     id	记录id（modify 必传） number
     isTypical  是否典型 number （-0不是 1是） 是特长 也是典型
     sftc 是否特长（必传） number （-0不是 1是）
 */
cloud.add_or_modify_achievement = function (args) {
    if(args.id){
        D("modify_achievement", args);
    }else {
        D("add_achievement", args);
    }
};

/**
 * 添加或修改处罚
 * @author melody
 * @param args
     basis	事实依据	string
     classid	班级id	number
     classname	班级名称	string
     gradeid	年级id	number
     gradename	年级名称(初多少级)	string
     punish_cause	处罚缘由	string
     punish_name	处罚名称	string
     punish_time	处罚时间	string
     punish_type	处罚类型(1:警告2:严重警告3:记过4记大过)	number
     punished_person	被处罚人	string
     punished_person_id	被处罚人id	number
     punished_person_num	被处罚人学籍号	string
     id	记录id（modify 必传） number
 */
cloud.add_or_modify_punish = function (args) {
    if(args.id){
        D("modify_punish", args);
    }else {
        D("add_punish", args);
    }
};


/**
 * 添加或修改日常表现
 * @author melody
 * @param args
     attachment	附件	string
     class_name	班级名称	string
     description	描述	string
     everyday_date	日常表现时间	string
     fk_class_id	班级id	number
     fk_grade_id	年级id	number
     fk_school_id	学校id	number
     frist_index	一级指标	string	指标描述
     frist_index_id	一级指标id	number
     grade_name	年级名称	string
     id	记录id（modify 必传） number
     item	评价项	string	评价项的描述字符串
     item_id	评价项id	number
     mark_type	得分类型	number	1加分2减分
     school_name	学校名称	string
     score	分数	number	>0 , <100
     second_index	二级指标	string	指标的描述
     second_index_id	二级指标id	number
     student_list	学生集合	array<object>
     code	学生学籍号	string
     guid	学生的guid	number
     name	学生的姓名	string
 */
cloud.add_or_modify_everyday = make_api("add_or_modify_everyday");