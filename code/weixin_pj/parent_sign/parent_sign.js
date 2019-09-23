/**
 * Created by Administrator on 2018/9/27.
 */
define([C.CLF("avalon.js"),'jquery',
        C.Co2("weixin_pj", "parent_sign", "css!"),
        C.Co2("weixin_pj", "parent_sign", "html!"),
        C.CLF("rsa_public_key.js"),
        C.CLF("bin/jsencrypt.js"),"jquery-weui"
    ],
    function (avalon,jquery, css, html,key,jse,weui) {
        var bin_jsencrypt = jse;
        //        发送短信验证码
        var api_validmsg=api.user+ "ng/validmsg/send";
        var avalon_define = function () {
            // 注册
            var signUrl=api.user+"parent/regist";
            var vm = avalon.define({
                $id: "wx_sign",
                // 子女信息原本数据
                stu_info:[{
                    stu_name:"",
                    stu_num:""
                }],
                //注册数据
                signData:{
                    // userName:'',
                    parName:'',
                    inputPwd:'',
                    insurePwd:'',
                    phone:'',
                    stu:[],
                    //验证码
                    identfy:''
                },
                is_check: "",
                //倒计时
                countdown:120,
                // 验证码状态:0-灰色;1-获取验证码；2-倒计时；3-重新发送
                ident_type:0,
                //判断获取验证码是否发送
                btn_type:false,
                //错误提示信息
                msg: "",
                retMsg:'',
                //各个判断状态
                // a1:false,
                a2:false,
                a3:false,
                a4:false,
                a5:false,
                a6: false,
                //用户名判断
                // userName_check:function(){
                //     var self=this;
                //     self.msg = "";
                //     //字母、数字
                //     var reg = /^(([a-zA-Z0-9]*)|([a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+))$/;
                //     var _txt = $("#userName").val();
                //     if(_txt.length<=20 && reg.test(_txt) && $.trim(_txt)!=''){
                //         self.a1=true;
                //         // self.parName_check();
                //     }else {
                //         self.a1=false;
                //         self.msg = "请按照用户名要求输入";
                //     }
                // },

                //姓名判断
                parName_check:function(){
                    var self=this;
                    self.retMsg = '';
                    var reg=/^[\u4e00-\u9fa5]+$/;
                    var _txt = $("#parName").val();
                    if (reg.test(_txt) && $.trim(_txt)!='') {
                        self.a2=true;
                        self.msg = "";
                    } else {
                        self.a2=false;
                        self.msg = "姓名请输入中文";
                    }
                },
                // 子女
                //子女添加
                addKid_check:function(){
                    var stu={};
                    stu["stu_name"]="";
                    stu["stu_num"]="";
                    if(this.stu_info.length<4){
                        this.stu_info.push(stu);
                    }
                },
                // 子女删除
                delete_check:function(){
                    var a=this.stu_info.length;
                    //删除提示
                    if(a==1){
                        $.alert({
                            title: '提示',
                            text: '当前只有一个子女，不能进行删除',
                            onOK: function () {
                            }
                        });
                    }
                    if(a>1 && (this.stu_info[a-1].stu_name!='' || this.stu_info[a-1].stu_num!='')){
                        $.alert({
                            title: '提示',
                            text: '多子女信息已填写,想删除此信息需删除多子女填写的内容',
                            onOK: function () {
                            }
                        });
                    }
                    if(a>1 && this.stu_info[a-1].stu_name=='' && this.stu_info[a-1].stu_num==''){
                        //默认删除最后一条数据
                        this.stu_info.pop();
                    }
                },
                // 密码
                inputPwd_check:function (){
                    var self=this;
                    self.retMsg = '';
                    var  password=$("#inputPwd").val();
                    // var reg=/^[a-zA-Z0-9]{6,16}$/
                    var reg = /(?=^.*?\d)(?=^.*?[a-zA-Z])^[0-9a-zA-Z]{6,16}$/;
                    if (reg.test(password)) {
                        self.a3=true;
                        self.msg = "";
                    } else {
                        self.a3=false;
                        self.msg="6到16字母+数字组合";
                    }
                },
                //确认密码
                insurePwd_check:function (){
                    var self=this;
                    self.retMsg = '';
                    var pwd1=$("#inputPwd").val();
                    var pwd2=$("#insurePwd").val();
                    if(pwd2!=pwd1){
                        self.a4=false;
                        self.msg="密码须一致";
                    }else{
                        self.a4=true;
                        self.msg = "";
                    }
                },
                //手机号
                phone_check:function(){
                    var self=this;
                    self.retMsg = '';
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#phone").val();
                    if (reg.test(_txt)) {
                        self.a5=true;
                        //发送短信验证码
                        if(self.btn_type==true){
                            ajax_post(api_validmsg,{phone:self.signData.phone,is_exist:'0'},self);
                            self.ident_type=2;
                            self.idenfiy_two();
                        }
                        self.msg = "";
                    } else {
                        self.a5=false;
                        self.msg="请输入正确的手机号";
                    }
                },
                //手机改变验证码
                phone_ident:function(){
                    var self=this;
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#phone").val();
                    // 验证码
                    // if($.trim(_txt) != '') {
                    //     self.ident_type=1;
                    // }
                    if(reg.test(_txt)){
                        self.ident_type = 1;
                    }else{
                        self.ident_type = 0;
                    }
                },
//            发送验证码
                identOne:function(){
                    this.btn_type=true;
                    this.countdown=120;
                    this.phone_check();
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
                        // console.log(self.countdown);
                    },1000);
                },
                //重新发送
                identThree:function(){
                    this.countdown = 120;
                    this.btn_type=true;
                    this.phone_check();
                },
                //验证码验证
                identfy_check:function(){
                    var self=this;
                    self.retMsg = '';
                    var _txt=$('#identifying').val();
                    if ($.trim(_txt) != '') {
                        self.a6 = true;
                        self.msg = "";
                    } else {
                        self.a6 = false;
                        self.msg = "请输入正确验证码";
                    }
                },
                // 提交
                sign:function(){
                    var self=this;
                    self.msg='';
                    self.retMsg = '';
                    if (self.a2==true && self.a3==true
                        && self.a4==true && self.a5==true && self.a6==true) {
                        var publicKey = public_key;
                        var encrypt = new bin_jsencrypt.JSEncrypt(); // 实例化加密对象
                        encrypt.setPublicKey(publicKey); // 设置公钥
                        var get_password = encrypt.encrypt(self.signData.inputPwd);
                        ajax_post(signUrl,
                            {account:self.signData.phone,
                                name:self.signData.parName,
                                password:get_password,
                                phone:self.signData.phone,
                                stu:self.stu_info,
                                validcode:self.signData.identfy
                            }, self, self.is_check);
                    } else {
                        // if(self.a1==false){
                        //     self.msg = "请按照用户名要求输入";
                        // }else
                        if(self.a5==false){
                            self.msg="请输入正确的手机号";
                        }else if(self.a2==false){
                            self.msg = "姓名请输入中文";
                        }else if(self.a3==false){
                            self.msg="6到16字母+数字组合";
                            self.a4=false;
                        }else if(self.a4==false){
                            self.msg="密码须一致";
                        }else if(self.a6 == false){
                            self.msg = '请输入正确验证码';
                        }
                    }
                },
                //延迟操作
                late:function(data){
                    //暂时屏蔽子女确认流程
                    // $.alert({
                    //     title: '提示',
                    //     text: '注册完成，为信息安全须您子女用他（她）的账号进入系统，确认家长信息后，方可进入系统',
                    //     onOK: function () {
                    //         window.location = "pj.xtyun.net/Growth/wx_pj.html#login";
                    //     }
                    // });
                    var ts_msg = '';
                    //1-需要学生验证；0-不需要学生验证
                    var need_sure=data.data.need_sure;
                    if(need_sure == 1){
                        ts_msg = '注册成功，为信息安全须您子女用他（她）的账号进入系统，确认家长信息后，方可进入系统（登录账号为手机号码）';
                    }else if(need_sure == 0){
                        ts_msg = '注册成功，请登录（登录账号为手机号码）';
                    }
                    $.alert({
                        title: '提示',
                        text: ts_msg,
                        onOK: function () {
                            window.location = HTTP_X+"Growth/wx_pj.html#login";
                        }
                    });
                    // window.location = "http://pj.xtyun.net:8018/Growth/wx_pj.html#login";
                    // setTimeout('window.location = "http://pj.xtyun.net:8018/Growth/wx_pj.html#login";',8000);
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) {
                    switch (cmd) {
                        case signUrl:
                            if (status == 200) {
                                this.retMsg='';
                                this.late(data);
                                // window.setTimeout(this.late(),5000);
                            } else {
                                this.retMsg=data.message;
                            }
                            break;
                        // 短信验证码
                        case api_validmsg:
                            if(status==200){
//                            this.complete_get_validmsg(data);
                            }else {
                                this.retMsg = msg;
                            }
                            break;
                    }
                }
            });
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });