/**
 * 毕业评价档案详情相关接口
 * Created by melody 2018/5/31 0900.
 */

// 获取成长记录列表(综合素质评价、获奖情况、综合实践活动)，调用 cloud.get_growth_all_list

// 获取毕业统计结果（毕业综合素质评价）
Task.get_bybg_count_result_list = make_interface("Indexmaintain/bybg_operation_by_count_result_view", {"__sync__":false},  false );
// 获取个性特长表现情况记载列表
Task.get_gxtc_rec_list = make_interface("GrowthRecordBag/query_personality_by_stunum", {"__sync__":false},  false );
// 获取评语（学生、教师）列表
Task.get_remark_list = make_interface("Indexmaintain/query_bybg_remark", {"__sync__":false},  false );
// 获取报告册签名信息
Task.get_sign_info = make_interface("Indexmaintain/indexmaintain_query_sign", {"__sync__":false},  false );
// 获取签名图片（签名结果），来源于承诺书签字图片
Task.get_sign_img_info = make_interface("GrowthRecordBag/query_sign_byguid", {"__sync__":false},  false );
//添加签字--毕业报告
Task.bybg_add_sign = make_interface("Indexmaintain/indexmaintain_add_sign", {"__sync__":false},  false );
//修改签字--只要签名里面有一个身份签了名，后面的人就调修改签字
Task.bybg_update_sign = make_interface("Indexmaintain/indexmaintain_update_sign", {"__sync__":false},  false );

/**
 * 获取毕业统计结果（毕业综合素质评价）
 * @author melody
 * @param args
     class_id	班级id
     grade_id		number	年级id（必填）
     is_file	是否归档	number	1，已归档0，未归档
     is_publish	是否发布	number	1，已发布，0未发布
     publish_end_time	日期格式的字符串，需要的时候传
     rank		string	要筛选的评价等级A,B,C,D
     stu_num	学生学号	string
 */
cloud.get_bybg_count_result_list = make_api("get_bybg_count_result_list");

/**
 * 获取个性特长表现情况记载列表
 * @author melody
 * @param args
    stu_num	学生学号	string
 */
cloud.get_gxtc_rec_list = make_api("get_gxtc_rec_list");

/**
 * 获取评语（学生、教师）列表
 * @author melody
 * @param args
     class_id 班级id（教师查询）	number
     stu_id	  学生id（学生查询）	number
     stu_num  学生学号（学生查询）string
 */
cloud.get_remark_list = make_api("get_remark_list");

/**
 * 获取报告册签名信息
 * @author melody
 * @param args
     class_id	班级id number
     grade_id	年级id（必传）	number
     school_id	学校id	number
     stu_id     学生id（必传）	number
     stu_num	学生学号（必传）	string
 */
cloud.get_sign_info = make_api("get_sign_info");

/**
 * 获取签名图片（签名结果），来源于承诺书签字图片
 * @author melody
 * @param args
     class_id		number	查询班级签字，传入class_id。 查询个人签字不传
     is_adopt_audit	是否通过审核		1，通过2，不通过
 */
cloud.get_sign_img_info = make_api("get_sign_img_info");

/**
 * 毕业报告添加签字
 * @author melody
 * @param args
 class_id:'',	        //班级id	number
 class_sign_code:'',	    //班级签字code	string
 class_sign_img:'',	    //班级签字img	string
 class_sign_time:'',     //班级签字时间   date
 grade_id:'',	        //年级id	number
 school_id:'',	        //学校id	number
 school_sign_code:'',	//学校签字code	string
 school_sign_img:'',	    //学校签字img	string
 school_sign_time:'',    //学校签字时间   date
 stu_id:'',	            //学生id	number
 stu_name:'',	        //学生姓名	string
 stu_num:'',	            //学生学号	string
 stu_sign_code:'',	    //学生签字code	string
 stu_sign_img:'',	    //学生签字img	string
 stu_sign_time:'',       //学生签字时间  date
 */
cloud.bybg_add_sign = make_api('bybg_add_sign');

/**
 * 毕业报告修改签字--只要签名里面有一个身份签了名，后面的人就调修改签字
 * @author melody
 * @param args
 class_id:'',	        //班级id	number
 class_sign_code:'',	    //班级签字code	string
 class_sign_img:'',	    //班级签字img	string
 class_sign_time:'',     //班级签字时间   date
 grade_id:'',	        //年级id	number
 school_id:'',	        //学校id	number
 school_sign_code:'',	//学校签字code	string
 school_sign_img:'',	    //学校签字img	string
 school_sign_time:'',    //学校签字时间   date
 stu_id:'',	            //学生id	number
 stu_name:'',	        //学生姓名	string
 stu_num:'',	            //学生学号	string
 stu_sign_code:'',	    //学生签字code	string
 stu_sign_img:'',	    //学生签字img	string
 stu_sign_time:'',       //学生签字时间  date
 */
cloud.bybg_update_sign = make_api('bybg_update_sign');