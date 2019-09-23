/**
 * 头部
 * Created by ma weifeng on 2017.04.26.
 */
define([
    C.CLF('avalon.js'),
        "amazeui",
    C.CM("login_header","html!"),
    C.CM("login_header","css!"),
    C.CMF("data_center.js")],
    function(avalon, amazeui,html, css, data_center) {
    var detail = avalon.component('ms-ele-login-header', {
        template: html,
        defaults: {
            url_index:"",//跳转登录页面地址

            //退出登录
            url_exit: "pj.xtyun.net/Growth/new_index.html",
            nick_name: "",
            user_type: 0,
            info_li:false,
            is_show:false,
            menu:[],
            current_up_pos:0,
            user:undefined,
            is_pop_status:false,
            on_mouse_enter:function (ips) {
                // console.info(ips.toString())
                this.current_up_pos = ips;
            },
            on_nav_click:function(ips){
                this.is_pop_status = !this.is_pop_status
            },
            on_nal_left_click:function (ips) {
                if( ips == this.current_up_pos){
                    this.is_pop_status = !this.is_pop_status
                }
                this.current_up_pos = ips;
            },
            icon_user_div_enter:function () {
                this.is_show=true;
            },
            icon_user_div_leave:function () {
                this.is_show=false;
            },
            user_update_password:function () {
                window.location="#update_password";
                this.is_show=false;
            },
            user_update_information:function () {
                window.location="#personal_information";
                this.is_show=true;
            },
            onReady: function() {
                var self = this;
                data_center.uin(function(data) {
                    var user_type = data.data.user_type;
                    if(user_type==2){
                        self.info_li=true;
                    }
                    var highest_level = data.data.highest_level;
                    switch(highest_level){                 
                        case "1":
                            self.nick_name = "省级领导";
                            break;
                        case "2":
                            self.nick_name = "市州级领导";
                            break;
                        case "3":
                            self.nick_name = "区县级领导";
                            break;
                        case "4":
                            self.nick_name = "学校领导";
                            break;
                        case "5":
                            self.nick_name = "年级领导";
                            break;
                        case "6":
                            self.nick_name = "教师";
                            break;
                        case "7":
                            self.nick_name = "学生";
                            break;
                        case "9":
                            self.nick_name = "班干部";
                            break;
                        case "10":
                            self.nick_name = "家长";
                            break;
                        case "11":
                            self.nick_name = "超级管理员";
                            break;
                        case "12":
                            self.nick_name = "省级管理员";
                            break;
                        case "13":
                            self.nick_name = "市州管理员";
                            break;
                        case "14":
                            self.nick_name = "区县管理员";
                            break;
                        case "15":
                            self.nick_name = "学校管理员";
                            break;
                    }
                })
            },
            user_center: function() {
                var token = window.sessionStorage.getItem("token");
                window.location = this.url_index+"?token=" + token;
            },
            quit: function() {
                var token = window.sessionStorage.getItem("token");
                window.location = this.url_exit+"?token=" + token;
                window.sessionStorage.clear("token");
            }
        }
    })
});
