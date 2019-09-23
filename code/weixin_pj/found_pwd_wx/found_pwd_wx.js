/**
 * Created by Administrator on 2018/9/27.
 */
define([C.CLF("avalon.js"),'jquery',
        C.Co2("weixin_pj", "found_pwd_wx", "css!"),
        C.Co2("weixin_pj", "found_pwd_wx", "html!"),
        C.CLF("rsa_public_key.js"),
        C.CLF("bin/jsencrypt.js"),"jquery-weui"
    ],
    function (avalon,jquery, css, html,key,jse,weui) {
        var bin_jsencrypt = jse;
        //注册
        var updpwd_yzm = api.user + "ng/baseUser/updpwd_yzm";
        //发送短信验证码
        var api_validmsg = api.user +  "ng/validmsg/send";
        var HTTP_API = HTTP_X;


        //登录的接口
        var url_login = api.user + "baseUser/wx_account_login";
        //获取用户在线时长
        var api_get_online = api.user + 'baseUser/get_onlie_time';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "found_pwd_wx",
                //倒计时
                countdown:120,
                // 验证码状态:0-灰色;1-获取验证码；2-倒计时；3-重新发送
                ident_type:0,
                //判断获取验证码是否发送
                btn_type:false,
                //判断是否点击获取验证码这个按钮
                ident_one_check:false,
//            错误提示信息显示：0-无措，1-有错
                prom_pwd_type:0,
                insurePwd_type:0,
                phone_type:0,
                prompt_type:0,
//            手机号错误提示信息
                phone_msg:'',
                //五个表单控件状态：a1-手机号，a2-验证码，a3-登录密码，a4-确认密码
                a1: false,
                a2: false,
                a3: false,
                a4: false,
                signData: {
                    inputPwd: '',
                    insurePwd: '',
                    phone: '',
                    //验证码
                    identfy:''
                },
                //提示信息
                tips_msg:'',
                //登录
                login_req: {
                    account: "",
                    openid: "",
                    password: ""
                },
                is_auto:true,
                //初始化
                init:function(){
                    this.tips_msg = '';
                },
                //登录密码
                inputPwd_check: function() {
                    var self = this;
                    var password = $("#inputPwd").val();
//                 var reg = /(?=^.*?\d)(?=^.*?[a-zA-Z])^[0-9a-zA-Z]{6,16}$/;
                    var reg = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*`~()-+=]+$)(?![0-9\\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\\W_!@#$%^&*`~()-+=]{8,20}$/;
                    if (reg.test(password)) {
                        self.a3 = true;
                        self.tips_msg = '';
                    } else {
                        self.a3 = false;
                        self.tips_msg = ' 8-16位且包含大写、小写、数字、特殊字符至少3种';
                    }
                },
                //确认密码
                insurePwd_check: function() {
                    var self = this;
                    var pwd1 = $("#inputPwd").val();
                    var pwd2 = $("#insurePwd").val();
                    if (pwd2 != pwd1) {
                        self.a4 = false;
                        self.tips_msg = '两次密码不一致，请重新输入';
                    } else {
                        self.a4= true;
                        self.tips_msg = '';
                    }
                },
                //手机号
                phone_check: function() {
                    var self = this;
                    self.retMsg = '';
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#phone").val();
//                console.log(self.btn_type);
                    if (reg.test(_txt)) {
                        self.a1 = true;
                        self.tips_msg = '';
                        //发送短信验证码
                        if(self.btn_type==true){
                            ajax_post(api_validmsg,{phone:self.signData.phone,is_exist:'1'},self);
                            self.ident_type=2;
                            self.idenfiy_two();
                        }
                    } else {
                        self.a1 = false;
                        self.btn_type=false;
                        self.tips_msg = '手机号不正确';
                    }
                },
                //手机改变验证码
                phone_ident:function(){
                    var self=this;
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#phone").val();
                    // 验证码
//                if($.trim(_txt) != '') {
//                    self.ident_type=1;
//                }
                    if (reg.test(_txt)) {
                        self.ident_type = 1;
                    }else{
                        self.ident_type = 0;
                    }
                },
                // 发送验证码
                identOne:function(){
                    this.btn_type=true;
                    this.countdown=120;
                    this.phone_check();
                    //判断是否点击获取验证码
                    this.ident_one_check=true;
                },
                //验证码倒计时
                idenfiy_two:function(){
                    var self = this;
                    self.btn_type=false;
                    //定时器
                    var timer=setInterval(function(){
                        self.countdown--;
                        if(self.countdown==0){
                            clearInterval(timer);
                            self.ident_type=3;
                        }
//                    console.log(self.countdown);
                    },1000);
                },
                //重新发送
                identThree:function(){
                    this.countdown=120;
                    this.btn_type=true;
                    this.phone_check();
                },
                //验证码验证
                identfy_check:function(){
                    var self=this;
                    var _txt=$('#identifying').val();
                    if ($.trim(_txt)!='' && self.ident_one_check == true) {
                        self.a2 = true;
                        self.tips_msg = '';
                    } else {
                        self.a2 = false;
                    }
                },
                // 提交
                found_pwd: function() {
                    var self = this;
                    if (self.a1 == true && self.a2 == true && self.a3 == true && self.a4 == true) {
                        var publicKey = public_key;
                        var encrypt = new bin_jsencrypt.JSEncrypt(); // 实例化加密对象
                        encrypt.setPublicKey(publicKey); // 设置公钥
                        var get_password = encrypt.encrypt(self.signData.inputPwd);
                        ajax_post(updpwd_yzm, {
                            new_pwd:get_password,
                            phone: self.signData.phone,
                            validcode:self.signData.identfy
                        }, self, self.is_check);
                    } else {
                        if (self.a1 == false) {//手机号
                            self.tips_msg = '手机号不正确';
                        }else if (self.a2 == false) {//验证码
                            self.tips_msg = '验证码不正确';
                        } else if (self.a3 == false) {//登录密码
                            self.tips_msg = ' 8-16位且包含大写、小写、数字、特殊字符至少3种';
                        }else if(self.a4 == false){//确认密码
                            self.tips_msg = ' 两次密码不一致，请重新输入';
                        }
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        // 短信验证码
                        case api_validmsg:
                            if(status == 200){
                                this.tips_msg = '';
                            }else {
                                this.tips_msg = msg;
                            }
                            break;
                        //修改密码
                        case updpwd_yzm:
                            if(status != 200){
                                $.alert(msg);
                                return;
                            }
                            this.complete_get_update(data);
                            break;
                        case url_login:
                            $.hideLoading();
                            this.on_login_complete(data,url_login);
                            break;
                        //获取用户在线时间
                        case api_get_online:
                            this.complete_get_online(data);
                            break;
                    }
                },
                complete_get_update:function(data){
                    this.login_req.account = this.signData.phone;
                    this.login_req.password = this.signData.inputPwd;
                    this.login();
                },
                login: function () {
                    localStorage.setItem("account", this.login_req.account);
                    localStorage.setItem("password", this.login_req.password);
                    var publicKey = public_key;
                    var encrypt = new bin_jsencrypt.JSEncrypt(); // 实例化加密对象
                    encrypt.setPublicKey(publicKey); // 设置公钥
                    this.password_agent = this.login_req.password;
                    this.login_req.password = encrypt.encrypt(this.login_req.password);
                    $.showLoading();
                    ajax_post(url_login, this.login_req.$model, this, false)
                },
                on_login_complete: function (data,u) {
                    this.login_req.password = this.password_agent;
                    if (data.status != 200) {
                        $.alert(data.message);
                        return;
                    }
                    //获取用户在线时长
                    ajax_post(api_get_online,{},this);
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
                        if(data.data.is_upd_pwd==0){
                            window.location.href = "#update_pwd";
                        }else{
                            window.location.href = "#parent_home";
                        }

                    } else if (user_type == 1 && user.lead_class_list.length > 0) {//班主任
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if(data.data.is_upd_pwd==0){
                            window.location.href = "#update_pwd";
                        }else{
                            window.location.href = "#teacher_home";
                        }
                    } else if (user_type == 2) {//学生
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if(data.data.is_upd_pwd==0){
                            window.location.href = "#update_pwd";
                        }else{
                            // window.location.href = "#classmate_send_word";
                            window.location.href = "#student_home";
                        }
                    }else if(highest_level == 2){//市
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if(data.data.is_upd_pwd==0){
                            window.location.href = "#update_pwd";
                        }else{
                            window.location.href = "#city_home";
                        }
                    }else if(highest_level == 3){//区县
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if(data.data.is_upd_pwd==0){
                            window.location.href = "#update_pwd";
                        }else{
                            window.location.href = "#area_home";
                        }
                    }else if(highest_level == 4){//校
                        //是否已经修改过密码:	number	0-未修改过；1-已修改过
                        if(data.data.is_upd_pwd==0){
                            window.location.href = "#update_pwd";
                        }else{
                            window.location.href = "#school_home";
                        }
                    }else {
                        $.alert('未分配权限，请联系管理员')
                    }
                },
                complete_get_online:function(data){
                    sessionStorage.setItem('online_time',data.data);
                },
                timeChuo: function (h) {
                    var timestamp3 = h / 1000;
                    var newDate = new Date();
                    newDate.setTime(timestamp3 * 1000);
                    Date.prototype.format = function (format) {
                        var date = {
                            "M+": this.getMonth() + 1,
                            "d+": this.getDate(),
                            "h+": this.getHours(),
                            "m+": this.getMinutes(),
                            "s+": this.getSeconds(),
                            "q+": Math.floor((this.getMonth() + 3) / 3),
                            "S+": this.getMilliseconds()
                        };
                        if (/(y+)/i.test(format)) {
                            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(
                                4 - RegExp.$1.length));
                        }
                        for (var k in date) {
                            if (new RegExp("(" + k + ")").test(format)) {
                                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ?
                                    date[k] : ("00" + date[k]).substr(("" + date[k]).length)
                                );
                            }
                        }
                        return format;
                    }
                    var getTimeIs = newDate.format('yyyy-MM-dd');
                    return getTimeIs;
                },
            });
            // //        监听是否跳转到设置成功页面
            // vm.$watch("", function() {

            // });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });