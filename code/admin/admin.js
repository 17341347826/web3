define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            // ====================超级管理员
            // ============================学校类别维护============================
            "/school_classes": "school_classes/school_classes.js",
            // ============================年级维护============================
            "/grade_management": "grade_management/grade_management.js",
            // ============================班级类别维护============================
            "/class_classes": "class_classes/class_classes.js",
            // ============================学年学期维护============================
            "/school_semester": "school_semester/school_semester.js",
            // ============================科目管理============================
            "/subjects_management": "subjects_management/subjects_management.js",
            //=============================用户统计=====================
            "/user_statistics":"user_statistics/user_statistics.js",
            // ============================考试类别维护============================
            "/test_classes": "test_classes/test_classes.js",
            // ============================用户管理============================
            "/users_management": "users_management/users_management.js"
        };
        function init(main) {
            x.on_by_config(on_by_config, main, "admin");
        }
        return {
            init: init
        }
    });