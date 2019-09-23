/**
 * 个性桌面
 */
define(['jquery',
        C.CLF('avalon.js'), "layer",
        C.CM("individual_desktop_module", "html!"),
        C.CM("individual_desktop_module", "css!"),
        C.CM("home_chart", "css!"),
        C.CMF("router.js"),
        C.CMF("data_center.js")],
    function ($,avalon,layer,html,css,home_chart,x, data_center) {
        var pdetail = undefined;
        var vm = avalon.component('ms-desktop-module', {
            template: html,
            defaults: {
                //查询自定义菜单
                check_nav:api.api + "GrowthRecordBag/query_custom_menu",
                nav_list:[],
                desktop_detail:function () {
                    window.location = '#set_desktop';
                },
                cb: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        var dataUser = JSON.parse(data.data['user']);
                        var highest_level = Number(data.data.highest_level);
                        var user_type = data.data.user_type;//1教师 2学生 3家长 0管理
                        var yhlx = 0;
                        //highest_level 1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师 7个体
                        switch (highest_level) {
                            case 2://市州级
                                if(user_type == 1){
                                    yhlx = 7;
                                }else if(user_type == 0){
                                    yhlx = 8;
                                }
                                break;
                            case 3://区县级
                                if(user_type == 1){
                                    yhlx = 5;
                                }else if(user_type == 0){
                                    yhlx = 6;
                                }
                                break;
                            case 4://校级
                                if(user_type == 1){
                                    yhlx = 3;
                                }else if(user_type == 0){
                                    yhlx = 4;
                                }
                                break;
                            case 6://班主任或普通任课教师
                                if(dataUser.lead_class_list.length > 0){
                                    yhlx = 1;
                                }
                                break;
                            case 7://个体
                                yhlx = 2;
                                break;
                        };
                        ajax_post(self.check_nav,{yhlx:yhlx},self);
                    });
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    if(is_suc){
                        switch (cmd){
                            case this.check_nav:
                                if(data.data){
                                    var custom_menu = data.data.custom_menu;
                                    this.nav_list = JSON.parse(custom_menu);
                                }
                                break;
                        }

                    }else{
                        layer.msg(msg);
                    }
                },
                onReady: function () {
                    this.cb();
                },
                go_click:function (url) {
                    window.location = url;
                }
            }
        });
    });
