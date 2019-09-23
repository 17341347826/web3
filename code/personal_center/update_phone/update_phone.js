/**
 * Created by Administrator on 2018/7/6.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("personal_center","update_phone/update_phone",'css!'),
        C.Co("personal_center","update_phone/update_phone",'html!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"
    ],
    function(avalon,$, css,html, x,data_center, layer) {
        // var HTTP_X = location.origin;
        //发送短信验证码--确认手机是否存在
        var api_ident_code=api.user+'ng/validmsg/send';
        //用户绑定手机号
        var api_bind_phone=api.user+"baseUser/bind_phone";
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "update_phone",
                //设置-1；2-修改
                type:'',
                //倒计时
                countdown:120,
                // 验证码状态:0-灰色;1-获取验证码；2-倒计时；3-重新发送
                ident_type:0,
                //判断获取验证码是否发送
                btn_type:false,
                //判断是否点击获取验证码这个按钮
                ident_one_check:false,
                //错误提示信息显示：0-无措，1-有错
                phone_type:0,
                prompt_type:0,
                //表单控件状态
                a1: false,
                a2: false,
                //请求参数
                extend:{
                    phone:'',
                    //验证码
                    validcode:'',
                },
                cbs:function(){
                    var self = this;
                    data_center.uin(function(data){

                    });
                },
                //            手机号
                phone_check: function() {
                    var self = this;
                    self.retMsg = '';
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#phone").val();
//                console.log(self.btn_type);
                    if (reg.test(_txt)) {
                        self.a1 = true;
                        //发送短信验证码
                        if(self.btn_type==true){
                            //is_exist:手机号是否绑定了账号，"1"-是（手机号必须已绑定）；"0"-否（手机号必须未绑定）
                            ajax_post(api_ident_code,{phone:self.extend.phone,is_exist:'0'},self);
                            self.ident_type=2;
                            self.idenfiy_two();
                        }
                        self.phone_type = 0;
                    } else {
                        self.a1 = false;
                        self.btn_type=false;
                        self.phone_type = 1;
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
                    if (reg.test(_txt)) {
                        self.ident_type=1;
                    }
                },
//            发送验证码
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
                    if ($.trim(_txt)!='' && self.ident_one_check==true) {
                        self.a2 = true;
                        self.prompt_type = 0;
                    } else {
                        self.a2 = false;
                        self.prompt_type = 1;
                    }
                },
                save_click:function () {
                    if(this.a1 == true && this.a2 == true){
                        ajax_post(api_bind_phone,this.extend.$model,this);
                        return;
                    }
                    if(this.a1 == false){//手机号
                        this.phone_type = 1
                    }else if(this.a2 == false){//验证码
                        this.prompt_type = 1;
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            //发送验证码
                            case api_ident_code:
                                if(status==200){
                                    this.phone_type = 0;
                                }else {
                                    toastr.error(msg);
                                    this.phone_type = 1;
                                }
                                break;
                            //用户绑定手机号
                            case api_bind_phone:
                                this.complete_bind_phone(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //用户绑定手机号
                complete_bind_phone:function (data) {
                    if(pmx.num == 1){
                        toastr.success("手机号设置成功");
                    }else if(pmx.num == 2){
                        toastr.success('手机号修改成功');
                    }
                    window.location = '#account_security';
                    // window.setTimeout(function(){
                    //    // window.location = HTTP_X + "/Growth/new_index.html";
                    //     window.location = '#account_security';
                    // },5000);
                }

            });
            vm.$watch('onReady', function() {
                vm.type = pmx.num;
                vm.cbs();
            })
        }
        return {
            view: html,
            define: avalon_define
        }
    })