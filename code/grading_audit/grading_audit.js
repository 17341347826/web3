/**
 * Created by Administrator on 2018/5/29.
 */
define(["jquery", C.CMF("router.js")],
    function ($, x) {
        var on_by_config = {
            //等级划分审核列表
            "/grading_audit_list":"grading_audit_list/grading_audit_list.js",
            //等级划分审核-修改-查看
            "/grading_audit_audit":"grading_audit_audit/grading_audit_audit.js"
        };

        function init(main) {
            x.on_by_config(on_by_config, main,"grading_audit");
        }
        return {
            init: init
        }
    });