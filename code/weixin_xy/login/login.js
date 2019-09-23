define([
        C.CLF('avalon.js'),
        "jquery_weui",
        C.Co("weixin_xy", "login/login", "css!"),
        C.Co("weixin_xy", "login/login", "html!"),
        C.CMF("router.js")],
    function (avalon, weui, css, html, x) {
        var avalon_define = function () {
            var HTTP_X = location.origin+"/";
            var  prefix_base = HTTP_X;
            var getOpenidUrl = api.weixin + "controller/get_openid";//获取用户openidURL
            var loginUrl = api.xy + "front/useBase_login.action";//账号密码登录URL
            var openidLoginUrl = api.xy + "front/useBase_openid.action";//openid登录URL
            var login = avalon.define({
                $id: "login",
                data: {
                    account: "",
                    password: "",
                    openid: ""
                },
                show: "1",
                init: function () {
                    sessionStorage.setItem('login_remark','v_xy');
                    // ajaxPost(getOpenidUrl, {}, this);
                },
                login: function () {//账号密码登录
                    if (this.data.account != "" &&
                        this.data.password != "") {
                        var loginBtn=$("#login-btn");
                        /*var publicKey=public_key;
                         var encrypt = new JSEncrypt(); // 实例化加密对象
                         encrypt.setPublicKey(publicKey); // 设置公钥
                         var get_password=encrypt.encrypt(this.data.password);*/
                        loginBtn.text("登录中...").end().prop("disabled", true);
                        ajaxPost(loginUrl, {
                            account: this.data.account,
                            password: this.data.password,
                            openid: this.data.openid
                        }, this, this.is_check)
                    } else {
                        $.toast("请输入用户名和密码", "forbidden");
                    }
                },
                hideFooter:function () {
                    this.show='2';
                },
                showFooter:function () {
                    this.show='1';
                },
                login_openid: function () {//openid登录
                    ajaxPost(openidLoginUrl, {openid: this.data.openid}, this, this.is_check)
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case getOpenidUrl:
                            if (status == 200) {
                                this.data.openid = data.data.openid;
                                this.login_openid();
                            }
                            break;
                        case loginUrl:
                            if (status == 200) {
                                sessionStorage.setItem('guid',this.data.account);

                                // window.location = "#choose_project";
                                window.location="#xy_home";
                            } else {
                                var loginBtn=$("#login-btn");
                                loginBtn.text("登录").end().prop("disabled", false);
                                $.toast(msg, "forbidden");
                            }
                            break;
                        case openidLoginUrl:
                            if (status == 200) {
                                window.location = prefix_base+"#choose_project";
                            } else {
                                $.toast(msg, "forbidden");
                            }
                            break;
                    }

                }
            });
            login.init();
        };
        return {
            view: html,
            define: avalon_define
        }
    });