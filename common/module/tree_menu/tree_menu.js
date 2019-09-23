/**
 * Created by Administrator on 2018/5/24.
 */
/**
 * 头部
 * Created by ma weifeng on 2017.04.26.
 */
define([
        C.CLF('avalon.js'),
        "amazeui",
        C.CM("tree_menu", "html!"),
        C.CM("tree_menu", "css!"),
        C.CMF("data_center.js")
    ],
    function(avalon, amazeui, html, css, data_center) {
        var HTTP_X = location.origin;
        var detail = avalon.component('ms-three-menu', {
            template: html,
            defaults: {
                nick_name: "",
                //菜单
                menu: [],
                //登录者身份
                user_type: '',
                //一、二级菜单index
                one_tow_menu:'',
                //三级菜单
                three_menu:[],

                //页面跳转-选中菜单中页面之后
                // close_menu: function(title1, title2, func_code,index1,index2) {
                //     this.one_menu_index=index1+1;
                //     this.two_menu_index=index2+1;
                //     report(func_code);
                //     //title1一级菜单,title2,二级菜单，title3三级菜单
                //     var obj = {
                //         first_level_menu: title1,
                //         two_level_menu: title2,
                //     }
                //     data_center.set_key('menu_level', obj);
                // },
                onReady: function() {
                    var self = this;
                    data_center.uin(function(data) {
                        self.user_type = data.data.user_type;
                        // console.log(data_center.get_key('one_tow_menu'));
                        // console.log(self.menu);
                        var arr=data_center.get_key('one_tow_menu');
                        var index1=arr.one_menu_index;
                        var index2=arr.two_memu_index;
                        self.three_menu=self.menu[index1].elements[index2];
                        // console.log(self.three_menu);
                    });
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {

                        }
                    }
                },
            }
        })
    });