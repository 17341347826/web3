/**
 * Created by Administrator on 2017/9/15 0015.
 */
/**
 * Created by uptang on 2017.04.26.
 */
require.config(glb_staus.map);
require([
        C.CLF("avalon.js"),
        C.Com("weixin_xy"),
        C.CMF("router.js"),
        C.CMF("data_center.js")
    ],

    function (avalon, weixin, x, data_center, $) {

        var main = avalon.define({
            $id: "main",
            data: {
                body: {
                    view: ""
                }
            }
        });

        x.on("/", "code/weixin_xy/login/login.js", main);
        weixin.init(main);
        x.start("/");
        avalon.scan(document.body);
    }
)
;