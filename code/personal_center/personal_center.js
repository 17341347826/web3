define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //=================个人资料==============================
            //账号安全
            "/account_security":"account_security/account_security.js",
            //修改密码
            "/update_password":"update_password/update_password.js",
            //修改绑定手机号
            "/update_phone":"update_phone/update_phone.js",
            //个人信息
            "/person_center":"person_info/person_info.js",
            //绑定邮箱
            "/bind_mailbox":"bind_mailbox/bind_mailbox.js",
            //用户名设置
            "/username_set":"username_set/username_set.js",
            //====================学生确认家长信息========================
            // 家长信息--子女确认家长
            "/parentInformation":"parentInformation/parentInformation.js",
            "/personal_information": "information/information.js",
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"personal_center");
        }
        return {
            init: init
        }
    });