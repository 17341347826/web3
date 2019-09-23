/**
 * Created by uptang on 2017.04.26.
 */
require.config(glb_staus.map);
require([
        C.CLF("avalon.js"),
        C.CMF("login_header/login_header.js"),
        C.CMF("router.js"),
        C.CB("Growth/menu.js"),
        C.CMF("data_center.js"),
        C.Com("teacher_development"),
        "jquery"],
    function (avalon,login_header,x, menu,data_center,teacher_development,$) {
        var user_power_api = api.api + "base/baseUser/user_powers";

        data_center.uin(function (resp) {
            var user_type = resp.data.user_type;
            var user_info =JSON.parse(resp.data["user"]);
            var main = avalon.define({
                $id: "main",
                go_in_page:'',
                data: {
                    body: {
                        view: "",
                    },
                    menu:menu.menu(user_type),
                    user:user_info,
                },
                go_in_teacher:function () {
                    sessionStorage.setItem("system_name",'jspj');
                    this.go_in_page = 'jspj';
                    ajax_post(user_power_api, {product_code:'jspj'}, this);
                },
                go_in_index:function () {
                    sessionStorage.setItem("system_name",'xspj');
                    this.go_in_page = 'xspj';
                    //---------------------
                    if(sessionStorage.getItem('stu_guid')){
                        sessionStorage.removeItem('stu_guid');
                    }
                    sessionStorage.setItem('sel_stu_index',0);
                    ajax_post(user_power_api, {product_code:'xspj'}, this);
                    //------------------------
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case user_power_api:
                            sessionStorage.removeItem('menu');
                            var menus = data.data.powers;
                            sessionStorage.setItem("menu", JSON.stringify(menus));
                            this.data.menu = menu.menu(user_type);
                            if(this.go_in_page=='jspj'){
                                window.location = "http://pj.xtyun.net:8017/Growth/tpj.html";
                            }else if(this.go_in_page=='xspj'){
                                window.location = "http://pj.xtyun.net:8017/Growth/index.html";
                            }

                            break;
                    }
                }

            });
            main.$watch('onReady', function(){
                $("#wait").remove();
            })


            x.on("/", "home.js", main);

            teacher_development.init(main);
            x.start("/");
            avalon.scan(document.body)

        })

    }
);