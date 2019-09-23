/**
 * Created by uptang on 2017/4/28.
 */

define(['jquery',
        C.CLF("avalon.js"),
        C.Co2("weixin_pj", "login", "css!"),
        C.Co2("weixin_pj", "login", "html!"),
        C.CLF("rsa_public_key.js"),
        C.CLF("bin/jsencrypt.js"), "jquery-weui"

    ],
    function ($, avalon, css, html, key, jspt, weui) {
        var bin_jsencrypt = jspt;
        var avalon_define = function (args) {
            //登录的接口
            var url_login = api.user + "baseUser/wx_account_login";
            //获取用户在线时长
            var api_get_online = api.user + 'baseUser/get_onlie_time';
            //获取用户open_id
            var api_get_open_id = api.api + "weixin/controller/get_openid";
            //通过open_id登录
            var api_auto = api.api + "base/baseUser/ng/wx_openid_login";
            var wx_login = avalon.define({
                $id: "wx_login",
                form: {
                    account: "",
                    openid: "",
                    password: ""
                },
                is_auto: true,
                is_show_model: false,
                show: "1",
                hideFooter: function () {
                    this.show = '2';
                },
                showFooter: function () {
                    this.show = '1';
                },
                init: function () {
                    //$.alert("jsBridge开始加载");
                    jsBridge.ready(function () {
                        //$.alert("jsBridge初始化完成", + jsBridge.inApp);
                        if (jsBridge.inApp) {
                            // is_app = true;
                            // is_wexin = true;
                            var ua = navigator.userAgent.toLowerCase();
                            if (ua.match(/MicroMessenger/i) != "micromessenger") {
                                is_wexin = false;
                            }
                            wx_login.form.password = localStorage.getItem("password");
                            wx_login.form.account = localStorage.getItem("account");
                            if (wx_login.form.password == null || wx_login.form.password == "null")
                                wx_login.form.password = "";
                            if (wx_login.form.account == null || wx_login.form.account == "null")
                                wx_login.form.account = "";

                            // 已经触发了登录。
                            var is_login = sessionStorage.getItem("is_login");
                            if (is_login == "1")
                                return;
                            sessionStorage.setItem("is_login", "1");
                            if (localStorage.getItem("is_auto") == "1") {
                                wx_login.login();
                            }
                        }

                    });
                    this.get_open_id();
                },
                get_open_id: function () {
                    // ==========测试=================
                    // var str = 'http://pj.xtyun.net/Growth/wx_pj.html?code=06172AN520w5QJ01ppQ52bjAN5272ANp&state=456#login';
                    // var start_index = str.lastIndexOf('code=');
                    // var end_index = str.lastIndexOf('&state');
                    // if(start_index!=-1&&end_index!=-1){
                    //     var code = str.substring(start_index+5,end_index);
                    //     ajax_post(api_get_open_id,{code:code},this,false);
                    // }

                    //==============正式打开===============

                    var url = window.location.search;
                    var start_index = url.lastIndexOf('code=');
                    var end_index = url.lastIndexOf('&state');
                    if (start_index != -1 && end_index != -1) {
                        $.showLoading();
                        var code = url.substring(start_index + 5, end_index);
                        ajax_post(api_get_open_id, {code: code}, this, false);
                    }


                },
                //自动登录点击
                checkChange: function () {
                    // this.is_auto = !this.is_auto;
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case api_get_open_id:
                            this.complate_open_id(data);
                            break;
                        case api_auto:
                            $.hideLoading();
                            this.on_login_complete(data, api_auto);
                            break;
                        case url_login:
                            $.hideLoading();
                            this.on_login_complete(data, url_login);
                            break;
                        //获取用户在线时间
                        case api_get_online:
                            this.complete_get_online(data);
                            break;
                    }

                },
                complate_open_id: function (data) {
                    if (data.status != 200 || data.data.openid == '') {
                        $.hideLoading();
                        return;
                    } else {
                        this.form.openid = data.data.openid;
                        ajax_post(api_auto, {openid: this.form.openid}, this, false)
                    }
                },
                on_login_complete: function (data, u) {
                    this.form.password = this.password_agent;
                    if (data.status != 200) {
                        if (u == api_auto) {
                            return
                        }
                        ;
                        $.alert(data.message);
                        return;
                    }
                    //获取用户在线时长
                    ajax_post(api_get_online, {}, this);
                    var response = data.data;
                    sessionStorage.setItem("auth", response["auth"]);
                    sessionStorage.setItem("token", response["token"]);
                    sessionStorage.setItem("user", response["user"]);
                    sessionStorage.setItem("user_type", response["user_type"]);
                    sessionStorage.setItem("highest_level", response["highest_level"]);
                    sessionStorage.setItem("login_remark", 'wei_xin');
                    var user = JSON.parse(response['user']);
                    //根据highest_level:1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    var highest_level = response.highest_level;
                    //根据user_type判断身份
                    var user_type = response.user_type;
                    if (user_type == 3) {//家长
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if (data.data.is_upd_pwd == 0) {
                            window.location.href = "#update_pwd";
                        } else {
                            window.location.href = "#parent_home";
                        }

                    } else if (highest_level == 6 && user.lead_class_list.length > 0) {//班主任
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if (data.data.is_upd_pwd == 0) {
                            window.location.href = "#update_pwd";
                        } else {
                            window.location.href = "#teacher_home";
                        }
                    } else if (user_type == 2) {//学生
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if (data.data.is_upd_pwd == 0) {
                            window.location.href = "#update_pwd";
                        } else {
                            // window.location.href = "#classmate_send_word";
                            window.location.href = "#student_home";
                        }
                    } else if (highest_level == 2) {//市
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if (data.data.is_upd_pwd == 0) {
                            window.location.href = "#update_pwd";
                        } else {
                            window.location.href = "#city_home";
                        }
                    } else if (highest_level == 3) {//区县
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if (data.data.is_upd_pwd == 0) {
                            window.location.href = "#update_pwd";
                        } else {
                            window.location.href = "#area_home";
                        }
                    } else if (highest_level == 4) {//校
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if (data.data.is_upd_pwd == 0) {
                            window.location.href = "#update_pwd";
                        } else {
                            window.location.href = "#school_home";
                        }
                    } else {
                        $.alert('未分配权限，请联系管理员')
                    }
                },
                complete_get_online: function (data) {
                    sessionStorage.setItem('online_time', data.data);
                },
                password_agent: '',
                login: function () {
                    if (!this.is_auto) {
                        this.form.openid = ''
                    }
                    localStorage.setItem("account", this.form.account);
                    localStorage.setItem("password", this.form.password);
                    localStorage.setItem("is_auto", this.is_auto == true ? "1" : "0");

                    var publicKey = public_key;
                    var encrypt = new bin_jsencrypt.JSEncrypt(); // 实例化加密对象
                    encrypt.setPublicKey(publicKey); // 设置公钥
                    this.password_agent = this.form.password;
                    this.form.password = encrypt.encrypt(this.form.password);
                    $.showLoading();
                    ajax_post(url_login, this.form.$model, this, false);
                }
            });

            require(["jquery-weui"], function (j) {
                require(['swiper', 'city_picker'], function (a, b) {
                    wx_login.init();
                    sessionStorage.removeItem('user_info');
                })
            });
            return wx_login;
        };
        return {
            view: html,
            define: avalon_define
        }
    });