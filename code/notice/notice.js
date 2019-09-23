define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //=================管理员用户发布通知==============================
            //通知列表
            "/notice_list": "notice_list/notice_list.js",
            //创建通知
            "/create_notice":"create_notice/create_notice.js",
            //详细信息
            "/notice_detail":"notice_detail/notice_detail.js",
            //创建版本更新通知(超管操作)
            "/add_version_update":"add_version_update/add_version_update.js",
            //消息中心
            "/message_center":"message_center/message_center.js",
            //常见问题
            "/common_problem":"common_problem/common_problem.js",
            //=================首页-通知==============================
            //通知点击更多列表
            "/notice_more": "notice_more/notice_more.js",
            //通知点击更多列表详情
            "/notice_more_detail": "notice_more_detail/notice_more_detail.js",
            //=================操作手册--各个身份都有==============================
            //操作手册
            "/operation_manual": "operation_manual/operation_manual.js",
        };
        function init(main) {
            x.on_by_config(on_by_config, main,"notice");
        }
        return {
            init: init
        }
    });