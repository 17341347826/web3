/**
 * 写实模块审核相关接口
 * Created by melody 2018/6/6 0858.
 */
// 遴选待审核
// 获取作品 待审核列表
Task.get_product_audit_list = make_interface("GrowthRecordBag/product_listTeacher", {"__sync__":false},  true );
// 获取品德 待审核列表
Task.get_morality_audit_list = make_interface("GrowthRecordBag/morality_listCheck", {"__sync__":false},  true );
// 获取成就奖励 待审核列表
Task.get_achievement_audit_list = make_interface("GrowthRecordBag/achievement_findByAchievements", {"__sync__":false},  true );
// 获取艺术活动 待审核列表
Task.get_artactivity_audit_list = make_interface("GrowthRecordBag/artactivity_findByTeaArtactivity", {"__sync__":false},  true );
// 获取社会实践 待审核列表
Task.get_practice_audit_list = make_interface("GrowthRecordBag/practice_list_check", {"__sync__":false},  true );
// 获取研究性学习 待审核列表
Task.get_study_audit_list = make_interface("GrowthRecordBag/study_list_check", {"__sync__":false},  true );
// 获取体质健康 待审核列表
Task.get_health_activity_audit_list = make_interface("GrowthRecordBag/healthActivity_findByTeaHealthActivity", {"__sync__":false},  true );
// 获取日常表现（录入）、成就奖励（录入）、综合实践（录入、遴选）待审核列表
Task.get_input_audit_list = make_interface("GrowthRecordBag/first_check_List", {"__sync__":false},  true );
// 获取日常表现（录入）待审核列表---评价小组
Task.get_daily_checke_leader = make_interface("everyday/get_list_checke_leader", {"__sync__":false},  true );
// 获取日常表现（录入）、成就奖励（录入）、综合实践（录入、遴选）审核不通过列表
Task.get_input_audit_no_pass_list = make_interface("GrowthRecordBag/no_pass_first_check_List", {"__sync__":false},  true );
// 审核作品
Task.audit_product = make_interface("GrowthRecordBag/product_checkProduct", {"__sync__":false},  false );
// 审核品德
Task.audit_morality = make_interface("GrowthRecordBag/morality_check", {"__sync__":false},  false );
// 审核成就奖励
Task.audit_achievement = make_interface("GrowthRecordBag/achievement_updateAchCheck", {"__sync__":false},  false );
// 审核艺术活动
Task.audit_artactivity = make_interface("GrowthRecordBag/artactivity_updateArtCheck", {"__sync__":false},  false );
// 审核社会实践
Task.audit_practice = make_interface("GrowthRecordBag/practice_check", {"__sync__":false},  false );
// 审核研究性学习
Task.audit_study = make_interface("GrowthRecordBag/study_check", {"__sync__":false},  false );
// 审核体质健康
Task.audit_health_activity = make_interface("GrowthRecordBag/healthActivity_updateHeaCheck", {"__sync__":false},  false );
// 审核日常表现
Task.audit_everyday = make_interface("everyday/checke_everyday", {"__sync__":false},  false );

// 异议待审核


/**
 * 获取作品 待审核列表
 * @author melody
 * @param args
     checker	审核人id	number	审核人id
     end_date	创建结束时间	string	yyyy-MM-dd
     frist_index	一级指标	string	一级指标
     member	成员	string	成员
     offset	查询偏移量	number	默认0
     product_type	作品类型	string	作品类型
     role	担任角色	string	担任角色
     rows	查询数据量	number	默认15
     second_index	二级指标	string	二级指标
     start_date	创建开始时间	string	yyyy-MM-dd
     status	状态	number	0草稿 1待审核 2审核通过 3审核不通过
     title	作品标题	string
     tutor	创建结束时间	string	指导老师
 */
cloud.get_product_audit_list = make_api("get_product_audit_list",{status:1});

/**
 * 获取品德 待审核列表
 * @author melody
 * @param args
     activity_type	活动类型	string
     end_time	创建结束时间	string
     offset	查询偏移量	number
     rows	查询数据量	number
     start_time	创建开始时间	string
     status	状态	number
     title	活动标题	string
 */
cloud.get_morality_audit_list = make_api("get_morality_audit_list",{status:1});

/**
 * 获取成就奖励 待审核列表
 * @author melody
 * @param args
     ach_end_dates	结束时间	string
     ach_start_dates	开始时间	string
     ach_state	状态(-1:删除1:待审核2:提交草稿3:未通过4:审核通过)	number
     ach_type	成就类型	string
     offset	查询起始条	number
     rows	查询数据量	number
 */
cloud.get_achievement_audit_list = make_api("get_achievement_audit_list",{ach_state:1});

/**
 * 获取艺术活动 待审核列表
 * @author melody
 * @param args
     art_end_date		string
     art_start_date		string
     art_state		number
     art_type		string
     offset		string
     rows		string
 */
cloud.get_artactivity_audit_list = make_api("get_artactivity_audit_list",{art_state:1});

/**
 * 获取社会实践 待审核列表
 * @author melody
 * @param args
     activity_type	类型	string
     create_time	创建结束时间	string
     offset	查询偏移量	number
     rows	查询数据量	number
     start_time	创建开始时间	string
     status	状态	number
     title	标题	string
 */
cloud.get_practice_audit_list = make_api("get_practice_audit_list",{status:1});

/**
 * 获取研究性学习 待审核列表
 * @author melody
 * @param args
     hea_activityType		string
     hea_endDate		string
     hea_startDate		string
     hea_state		number
     offset		number
     rows		number
 */
cloud.get_study_audit_list = make_api("get_study_audit_list",{status:1});

/**
 * 获取体质健康 待审核列表
 * @author melody
 * @param args
     hea_activityType		string
     hea_endDate		string
     hea_startDate		string
     hea_state		number
     offset		number
     rows		number
 */
cloud.get_health_activity_audit_list = make_api("get_health_activity_audit_list",{hea_state:1});

/**
 * 获取日常表现（录入）、成就奖励（录入）、综合实践（录入、遴选）待审核列表
 * @author melody
 * @param args
     fk_class_id	班级id （必传）	number
     offset	查询偏移量 (必传）	number
     rows	查询数据量(必传）	number
 */
cloud.get_input_audit_list = make_api("get_input_audit_list", {}, ready_photo, {from:"fk_xsyh_id", root:"list"});
/**
 * 获取日常表现（录入）待审核列表----评价小组（教师以上身份）
 * @author melody
 * @param args
 fk_class_id	班级id （必传）	number
 offset	查询偏移量 (必传）	number
 rows	查询数据量(必传）	number
 */
cloud.get_daily_checke_leader = make_api("get_daily_checke_leader", {}, ready_photo, {from:"guid", root:"list"});
/**
 * 获取日常表现（录入）、成就奖励（录入）、综合实践（录入、遴选）审核不通过列表
 * @author melody
 * @param args
     fk_class_id	班级id （必传）	number
     offset	查询偏移量 (必传）	number
     rows	查询数据量(必传）	number
 */
cloud.get_input_audit_no_pass_list = make_api("get_input_audit_no_pass_list", {}, ready_photo, {from:"fk_xsyh_id", root:"list"});

/**
 * 审核作品
 * @author melody
 * @param args
     id	记录id（必传） number
     frist_index	一级指标（必传）	string
     second_index	二级指标（必传）	string
     status	状态（必传）2-审核通过 3-审核不通过	number
     check_opinion	审核意见（状态为3 必传）	string
     score	得分（状态为2 必传）  number
 */
cloud.audit_product = make_api("audit_product");

/**
 * 审核品德
 * @author melody
 * @param args
     id	记录id（必传） number
     frist_index	一级指标（必传）	string
     second_index	二级指标（必传）	string
     status	状态（必传）2-审核通过 3-审核不通过	number
     check_opinion	审核意见（状态为3 必传）	string
     score	得分（状态为2 必传）  number
     sftc 是否特长（必传） number （0不是 1是）
 */
cloud.audit_morality = make_api("audit_morality");

/**
 * 审核成就奖励
 * @author melody
 * @param args
     id	记录id(必传) number
     ach_first_level_index	一级指标(必传)	string
     ach_two_level_index	二级指标(必传)	string
     ach_state	状态	(必传) 3-未通过 4-通过  number
     ach_not_passed	    未通过原因（状态为3 必传）	string
     score	得分 number
     sftc 是否特长（必传） number （0不是 1是）
 */
cloud.audit_achievement = make_api("audit_achievement");

/**
 * 审核艺术活动
 * @author melody
 * @param args
     id	记录id(必传) number
     art_first_level_index	一级指标(必传)	string
     art_two_level_index    二级指标(必传)		string
     art_state	状态	(必传) 3-未通过 4-通过 	number
     art_not_passed	    未通过原因（状态为3 必传）	string
     score	得分（状态为4 必传） number
     sftc 是否特长（必传） number （0不是 1是）
 */
cloud.audit_artactivity = make_api("audit_artactivity");

/**
 * 审核社会实践
 * @author melody
 * @param args
     id	记录id（必传） number
     frist_index	一级指标（必传）	string
     second_index	二级指标（必传）	string
     status	状态（必传）2-审核通过 3-审核不通过	number
     check_opinion	审核意见（状态为3 必传）	string
     score	得分（状态为2 必传）  number
     sftc 是否特长（必传） number （0不是 1是）
 */
cloud.audit_practice = make_api("audit_practice");

/**
 * 审核研究性学习
 * @author melody
 * @param args
     id	 记录id（必传）	number
     frist_index    一级指标（必传）	string
     second_index	二级指标（必传）	string
     status	状态（必传） 2-审核通过 3-审核不通过	string
     check_opinion	审核意见（状态为3 必传）	string
     score	得分（状态为2 必传）	 number
     sftc 是否特长（必传） number （0不是 1是）
 */
cloud.audit_study = make_api("audit_study");

/**
 * 审核体质健康
 * @author melody
 * @param args
     id	 记录id（必传）	number
     hea_first_level_index	一级指标（必传）	string
     hea_two_level_index 二级指标（必传） string
     hea_state	状态（必传） 3-未通过 4-审核通过	number
     hea_not_passed	 审核意见（状态为3 必传）string
     score	得分	（状态为4 必传） number
     sftc 是否特长（必传） number （0不是 1是）
 */
cloud.audit_health_activity = make_api("audit_health_activity");

/**
 * 审核日常表现
 * @author melody
 * @param args
     id	 记录id（必传）	number
     status	状态（必传）	number	 2审核不通过 3待确认
 */
cloud.audit_everyday = make_api("audit_everyday");


