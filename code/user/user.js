define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            // ============================角色权限============================
            //角色权限列表
            "/role_privileges_list": "role_privileges/role_privileges_list/role_privileges_list.js",
            //角色权限分配===导航不展示
            "/role_privileges_setting": "role_privileges/role_privileges_setting/role_privileges_setting.js",
            // ============================市级、区县管理员--用户管理============================
            //同级用户
            "/city_sibling_user": "cityUserControl/city_sibling_user/city_sibling_user.js",
            // ============================市级管理员============================
            //学校维护
            "/citySchoolControl": "cityUserControl/citySchoolControl/citySchoolControl.js",
            //班级维护
            "/cityClassControl": "schoolUserControl/classControl/classControlList.js",
            //区县维护
            "/areaUserControl": "cityUserControl/areaUserControl/areaUserControl.js",
            //学生信息维护
            "/cityStuInfoControl": "cityUserControl/cityStuInfoControl/cityStuInfoControl.js",
            //登录超时设置（只有市管理员能够设置）
            "/login_timeout_set": "login_timeout_set/login_timeout_set.js",
            // ============================区县管理员============================
            //学校管理-区县
            "/districtSchoolControl": "districtUserControl/districtSchoolControl/districtSchoolControl.js",
            //学校维护--区县身份-用户管理-学校用户
            "/districtSchoolUser": "districtUserControl/districtSchoolUser/districtSchoolUser.js",
            //学生信息
            "/districtStuInfo": "districtUserControl/districtStuInfo/districtStuInfo.js",
            // ============================学校管理员============================
            //学校管理班级列表
            "/classControlList": "schoolUserControl/classControl/classControlList.js",
            //学生信息维护
            "/stuInfoControl": "schoolUserControl/stuInfoControl/stuInfoControl.js",
            //教师信息维护
            "/teacherInfoControl": "schoolUserControl/teacherInfoControl/teacherInfoControl.js",
            //教师用户管理
            "/teacherUsersControl": "schoolUserControl/teacherUsersControl/teacherUsersControl.js",
            //教师用户管理
            "/stu_add_check": "schoolUserControl/stu_add_check/stu_add_check.js",
            // ============================班级管理员============================
            //家长用户管理
            "/patriarchUsersControl": "classUserControl/patriarchUsersControl/patriarchUsersControl.js",
            //学生用户管理----教师、校管理员
            "/stuUsersControl": "classUserControl/stuUsersControl/stuUsersControl.js",
            //教师任课管理
            "/teacherClassControl": "classUserControl/teacherClassControl/teacherClassControl.js",
            //    test
            "/test": "schoolUserControl/test/test.js",
            //    test stuInfoControl
            "/textStuInfoControl": "schoolUserControl/text/textStuInfoControl.js",
            //家长信息审核管理
            "/parentControl": "classUserControl/parentControl/parentControl.js",
            // 家长信息查看管理
            "/parentCheck": "classUserControl/parentCheck/parentCheck.js",

            // 公共demo\
            "/css_update_demo": "css_update_demo/css_update_demo.js",
            //评价任务管理列表
            "/evaluation_task_management_list": "evaluation_task_management_list/evaluation_task_management_list.js",
            //==============================班主任进行学生分组====================================
            "/group_of_class_teachers": "classUserControl/group_of_class_teachers/group_of_class_teachers.js",
            // 家长注册开关--管理员
            "/sign_switch": "sign_switch/sign_switch.js",
            //寄语分组
            "/stu_group":"stu_group/stu_group.js",
            //===================================个性桌面设置================
            "/set_desktop": "set_desktop/set_desktop.js",
            //================================社团开展=================================
            //社团列表
            "/club_activity_list":"club_activity_list/club_activity_list.js",
            //社团新增
            "/club_activity_add":"club_activity_add/club_activity_add.js",
            //统计社团--市
            "/city_club_number_list":"city_club_number_list/city_club_number_list.js",
            //统计社团--区县
            "/district_club_number_list":"district_club_number_list/district_club_number_list.js",
            //统计社团--学校
            "/school_club_number_list":"school_club_number_list/school_club_number_list.js",
            //社团详情
            "/leader_club_detail":"leader_club_detail/leader_club_detail.js",
            //教师审核学生签名
            "/teacher_autograph":"teacher_autograph/teacher_autograph.js",
            //==================================类型维护=========================================
            "/type_list":"type_manage/list.js",
            "/input_type":"type_manage/input.js",
            //个性特长设置
            "/special_personality":"special_personality/special_personality.js",
            //=================================日志管理================================
            "/log_management":"log_management/log_management.js",
            //================================市管理员设置科目=================================
            "/subject_setting":"subject_setting/subject_setting.js",
            //=================================部门管理================================
            // 部门管理列表--市、区、校管理员
            "/department_manage":"department_manage/department_manage.js",
            // 部门管理新增--市、区、校管理员
            "/department_add":"department_add/department_add.js",
            //=================================校领导和教师（社团负责人）================================
            // 社团成员列表---社团负责人查看
            "/club_member_list":"club_member_list/club_member_list.js",
            // 社团成员修改---社团负责人查看
            "/club_member_add":"club_member_add/club_member_add.js",
            // 社团通知---社团负责人创建
            "/club_notice":"club_notice/club_notice.js",
            // 创建社团通知---社团负责人创建
            "/club_notice_create":"club_notice_create/club_notice_create.js",
            // 社团招募信息---社团负责人创建
            "/recruit_infor_list":"recruit_infor_list/recruit_infor_list.js",
            // 创建社团招募信息---社团负责人创建
            "/recruit_infor_create":"recruit_infor_create/recruit_infor_create.js",
            //=================================运维管理（版本管理，版本发布）================================
            "/mocha_itom":"mocha_itom/mocha_itom.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "user");
        }

        return {
            init: init
        }
    });