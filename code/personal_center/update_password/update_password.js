define([C.CLF('avalon.js'),"jquery",C.CLF("rsa_public_key.js"),
        C.CLF("bin/jsencrypt.js"),
        C.Co("personal_center","update_password/update_password",'css!'),
        C.Co("personal_center","update_password/update_password",'html!'),
        C.CMF("router.js"),
        "layer"
    ],
    function(avalon,$,rsa_public_key,bin_jsencrypt, css,html, x, layer) {
        //修改密码
        var api_update_password=api.api+"base/baseUser/updpwd";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "update_password",
                span_num:0,
                sure_new_pwd:"",
                old_pwd:"",
                new_pwd:"",
                msgNull:function () {
                    this.span_num=0;
                },
                save_click:function () {
                    // var reg = /(?=^.*?\d)(?=^.*?[a-zA-Z])^[0-9a-zA-Z]{6,16}$/;
                    var reg = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\\W_!@#$%^&*`~()-+=]+$)(?![0-9\\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\\W_!@#$%^&*`~()-+=]{8,20}$/;
                    if(reg.test(this.new_pwd)){
                        if(this.new_pwd!=this.sure_new_pwd){
                            this.span_num=2;
                        } else{
                            this.span_num=0;
                            var publicKey=public_key;
                            var encrypt = new bin_jsencrypt.JSEncrypt(); // 实例化加密对象
                            encrypt.setPublicKey(publicKey); // 设置公钥
                            if(this.new_pwd==this.old_pwd){
                                this.span_num=3;
                            }else {
                                var get_new_pwd=encrypt.encrypt(this.new_pwd);
                                var get_old_pwd=encrypt.encrypt(this.old_pwd);
                                ajax_post(api_update_password,{new_pwd:get_new_pwd,old_pwd:get_old_pwd},this);
                            }
                        }
                    }else{
                        this.span_num=1;
                    }

                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            case api_update_password:
                                this.complete_update_password(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                complete_update_password:function (data) {
                    toastr.success("修改密码成功");
                    window.history.go(-1);
                }

            });
            vm.$watch('onReady', function() {

            })
        }
        return {
            view: html,
            define: avalon_define
        }
    })