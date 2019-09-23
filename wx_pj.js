/**
 * Created by uptang on 2017.04.26.
 */
require.config(glb_staus.map);
require([
        C.Com("weixin_pj"),
        C.CLF("avalon.js"),
        C.CMF("router.js"),
    ],
    function (wx, avalon,x) {

        var main = avalon.define({
            $id: "main",
            data: {
                body: {
                    view: "",
                },

            },
        });
        main.$watch('onReady', function(){

        })

        x.on("/", "code/weixin_pj/login/login.js", main);

        wx.init(main);
        x.start("/");
        avalon.scan(document.body)

   
});
