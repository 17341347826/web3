/**
 * Created by Administrator on 2018/8/7.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("personal_center","bind_mailbox/bind_mailbox",'css!'),
        C.Co("personal_center","bind_mailbox/bind_mailbox",'html!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"
    ],
    function(avalon,$, css,html, x,data_center, layer) {
        //邮箱绑定
        var api_bind_mail = api.user+'baseUser/bind_email';
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "bind_mailbox",
                //邮箱状态：1-设置  2-修改
                type:'',
                //错误提示信息显示：0-无措，1-有错
                mail_type:0,
                //错误提示语句
                mail_msg:'',
                //请求参数
                extend:{
                    email:'',
                },
                cbs:function(){
                    var self = this;
                    data_center.uin(function(data){
                        self.type = pmx.num;
                        self.extend.email = pmx.email;
                    });
                },
                /*邮箱验证:
                * 网易163邮箱:@163.com
                * 网易126邮箱:@126.com
                * */
                mail_check: function() {
                    var self = this;
                    // var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); //正则表达式错
                    var reg = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
                    var obj = $('#mail').val(); //要验证的对象
                    if(obj === "" || !reg.test(obj)){ //输入不能为空 || 正则验证不通过，格式不对
                        self.mail_type = 1;
                        self.mail_msg = '邮箱地址不正确';
                    }else if(reg.test(obj)){
                        self.mail_msg = '邮箱地址正确';
                        self.mail_type = 0;
                        ajax_post(api_bind_mail,self.extend.$model,self);
                    }
                },
                //保存
                save_click:function () {
                    this.mail_check();
                    // if(this.mail_type == 0){
                    //     ajax_post(api_bind_mail,this.extend.$model,this);
                    // }else{
                    //     this.mail_type == 1;
                    // }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_bind_mail:
                                this.complete_bind_mail(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //用户绑定手机号
                complete_bind_mail:function (data) {
                    // toastr.success(data.message);
                    // setTimeout(function () {
                    //     window.location = '#account_security';
                    // }, 5000)
                    layer.alert(data.message, {
                        closeBtn: 0
                        ,anim: 4 //动画类型
                    }, function(){
                        layer.closeAll();
                        window.location = '#account_security';
                    });
                }

            });
            vm.$watch('onReady', function() {
                vm.cbs();
            })
        }
        return {
            view: html,
            define: avalon_define
        }
    })

