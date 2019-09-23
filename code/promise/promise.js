define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //诚信承诺设置
            "/promise_set":"promise_set/promise_set.js",
            //诚信承诺查看列表
            "/promise_list":"promise_list/promise_list.js",
            //诚信承诺详情查看
            "/promise_detail":"promise_detail/promise_detail.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main, "promise");
        }

        return {
            init: init
        }
    });