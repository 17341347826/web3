/**
 * Created by uptang on 2017.04.26.
 */
require.config(glb_staus.map);
require([
        C.CLF("avalon.js"),
        C.CMF("header/header.js"),
        C.CMF("router.js"),
        C.CB("Growth/menu.js"),
        C.CMF("data_center.js"),
        "jquery"],
    function (avalon,header,x, menu,data_center,teacher_development,personal_center,$) {
        data_center.uin(function (resp) {
            var user_type = resp.data.user_type;
            var user_info =JSON.parse(resp.data["user"]);
            var main = avalon.define({
                $id: "main",
                data: {
                    body: {
                        view: "",
                    },
                    menu:menu.menu(user_type),
                    user:user_info,
                }


            });
            main.$watch('onReady', function(){
                $("#wait").remove();
            })


            x.on("/", "teacher_home.js", main);
            x.start("/");
            avalon.scan(document.body)

        })

    }
);