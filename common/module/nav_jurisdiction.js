//===============================一级菜单================================
//参数设置+用户管理(班主任+管理员)
var first_nav_administrators=[
    {address:"",name:"日常表现"},
    {address:"",name:"班级动态"},
    {address:"",name:"标志性卡"},
    {address:"",name:"民主评价"},
    {address:"",name:"成长记录袋"},
    {address:"",name:"参数设置"},
    {address:"",name:"用户管理"}
];
//班主任
var lend_teacher_first_nav=[
    {address:"",name:"日常表现"},
    {address:"",name:"班级动态"},
    {address:"",name:"标志性卡"},
    {address:"",name:"民主评价"},
    {address:"",name:"成长记录袋"},
    {address:"",name:"用户管理"}
];
//普通教师
var teacher_first_nav=[
    {address:"",name:"日常表现"},
    {address:"",name:"班级动态"},
    {address:"",name:"标志性卡"},
    {address:"",name:"民主评价"},
    {address:"",name:"成长记录袋"}
];
//家长+学生
var parent_student_first_nav=[
    {address:"",name:"日常表现"},
    {address:"",name:"班级动态"},
    {address:"",name:"标志性卡"},
    {address:"",name:"民主评价"},
    {address:"",name:"成长记录袋"}
];
//===============================成长记录袋==============================
//管理员
var growth_record_bag_administrators=[
    {address:"stu_growth_list",name:"学生成长"}
];
//班主任
var growth_record_bag_lend_teacher_arr=[
    {address:"stu_growth_list",name:"学生成长"},
    {address:"teacher_edit_art_evaluation",name:"成绩录入"},
    {address:"objection_list",name:"作品异议"},
    {address:"moral_dissent_list",name:"品德异议"},
    {address:"achieveObjectionList",name:"成就异议"},
    {address:"artactivityObjectionList",name:"艺术异议"},
    {address:"social_practice_student_objection_list",name:"实践异议"},
    {address:"healthActivityObjectionList",name:"健康异议"},
    {address:"teacherAudit",name:"作品审核"},
    {address:"moral_check_list",name:"品德审核"},
    {address:"achieveCheck",name:"成就审核"},
    {address:"artactivityCheck",name:"艺术审核"},
    {address:"social_practice_teacher_check_list",name:"实践审核"},
    {address:"healthActivityCheck",name:"健康审核"},
    {address:"teacher_physical_exercise",name:"体育记录"},
    {address:"teacher_school_based_curriculum",name:"校本课程"},
    {address:"study_check_list",name:"研究性学习审核"}
];
//普通教师
var growth_record_bag_teacher_arr=[
    {address:"stu_growth_list",name:"学生成长"},
    {address:"teacher_edit_art_evaluation",name:"成绩录入"},
    {address:"teacher_physical_exercise",name:"体育记录"},
    {address:"teacher_school_based_curriculum",name:"校本课程"}
];
//学生+家长
var growth_record_bag_student_arr=[
    {address:"card_list",name:"个性名片"},
    {address:"goals_and_plans_student",name:"目标计划"},
    {address:"moralDevelopment_list",name:"品德发展"},
    {address:"achieveSuccessList",name:"成就奖励"},
    {address:"social_practice_list",name:"社会实践"},
    {address:"artactivitySuccessList",name:"艺术素养"},
    {address:"healthActivitySuccessList",name:"身心健康"},
    {address:"works_list",name:"作品作业"},
    {address:"student_academic_level",name:"学业水平"}
];
//====================================日常表现==========================================
//班主任
var lend_teacher_daily=[
    {address:"my_add_list",name:"录入列表"},
    {address:"teacher_check_list",name:"进入审核"},
    {address:"student_performance_score",name:"表现查看"},
    {address:"daily_object_list",name:"异议审核"}
];
//普通教师
var teacher_daily=[
    {address:"student_performance_score",name:"表现查看"}
];
//班干部
var lend_student=[
    {address:"my_add_list",name:"录入列表"},
    {address:"my_daily_list",name:"表现查看"}
];
//学生+家长日常表现
var student_daily=[
    {address:"my_daily_list",name:"表现查看"}
];
//=================================民主评价========================================
//校领导
// var school_lend=[
//     {address:"check_list",name:"项目审核"}
// ];
//学生
var student_evaluation=[
    {address:"student_fill_in_self",name:"学生自评"},
    {address:"student_fill_in_mutual_list",name:"学生互评"}
];
//班主任
var lend_teacher=[
    {address:"teacher_fill_list",name:"评价列表"},
    {address:"check_list",name:"项目审核"}
];
//=====================================标志性卡======================================
var trademark_lend_teacher=[
    {address:'teacher_trademark_card',name:"标志性卡"},
    {address:'grant_trademark_card',name:"发卡"},
    {address:"teacher_term_comment",name:"评语列表"}
];
var student_trademark=[
    {address:"stu_oneself_card",name:"标志性卡"},
    {address:"stu_oneself_comment",name:"自评评语"},
    {address:"stu_mutual_comment",name:"互评评语"}
];
//=================================用户管理==============================
//市州管理 user_type == 0 && department_level==2
var city_administrators=[
    {address:"citySchoolControl",name:"学校维护"},
    {address:"classControlList",name:"班级维护"},
    {address:"cityStuInfoControl",name:"学生信息"},
    {address:"areaUserControl",name:"区县用户"}
];
//区县管理 user_type == 0 && department_level==3
var area_administrators=[
    {address:"districtStuInfo",name:"学生信息"},
    {address:"districtSchoolUser",name:"学校用户"}
];
//学校管理  user_type == 0 && department_level==4
var school_administrators=[
    {address:"classControlList",name:"班级维护"},
    {address:"stuInfoControl",name:"学生信息"},
    {address:"teacherInfoControl",name:"教师信息"},
    {address:"teacherUsersControl",name:"教师用户"}
];
//班级管理 user_type == 1 && lead_class_list.length != 0
var class_administrators=[
    {address:"",name:"家长用户"},
    {address:"stuUsersControl",name:"学生用户"},
    {address:"teacherClassControl",name:"教师任课"}
];
//====================================参数管理========================================
var parameter_management=[
    {address:"daily_performance_parameter_management",name:"日常表现"},
    {address:"item_programme_management",name:"民主评价"},
    {address:"student_self_evaluation",name:"学生自评"},
    {address:"student_mutual_evaluation",name:"学生互评"},
    {address:"teacher_evaluation",name:"教师评价"},
    {address:"parent_evaluation",name:"家长评价"},
    {address:"indexList",name:"指标查看"},
    {address:"index_audit_list",name:"指标审核"},
    {address:"trademark_card",name:"标志性卡"}
];