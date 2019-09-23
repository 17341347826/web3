/**
 * Created by Administrator on 2018/1/29.
 */
define(["jquery", C.CLF('avalon.js'), 'layer',
        C.Co("sys_stat", "list/city/city", "html!"),
        C.CMF("router.js"), C.CMF("data_center.js"), C.CM('page_title'),C.CM("table"),
        C.CM("three_menu_module")
    ],
    function($, avalon, layer, html, x, data_center, page_title,table,three_menu_module) {
        //查询
        var api_get_info = api.api + "base/user_stat/sys_used_cnt";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "sys_city",
                //身份判断
                highest_level: "",
                data: {
                    district: "",
                    grade_id: "",
                    level: 2, //2-市州；3-区县；4-校
                    school: ""
                },
                dataList: [],
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var cArr = [];
                        var tUserData = JSON.parse(data.data["user"]);
                        self.highest_level = data.data.highest_level;
                        ajax_post(api_get_info, self.data, self);
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_info:
                                this.complete_get_info(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_get_info: function(data) {
                    this.dataList = data.data.list;
                }
            });
            vm.$watch('onReady', function() {
                this.cb();
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });