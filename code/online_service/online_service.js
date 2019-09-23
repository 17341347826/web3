define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //在线客服用户端
            "/on_ser_user":"on_ser_user/on_ser_user.js",
            //在线客服服务端
            "/on_ser_service":"on_ser_service/on_ser_service.js"
        };
        function init(main) {
            x.on_by_config(on_by_config, main,"online_service");
        }
        return {
            init: init
        }
    });