/**
 * Created by uptang on 2017/7/7.
 */
define(["jquery", C.CMF("router.js")],
    function($, x) {
        var on_by_config = {
            // 查询指标
            '/demo':"demo/demo.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "sys_stat");
        }
        return {
            init: init
        }
    })