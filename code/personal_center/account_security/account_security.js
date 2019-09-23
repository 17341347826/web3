/**
 * Created by Administrator on 2018/7/6.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("personal_center","account_security/account_security",'css!'),
        C.Co("personal_center","account_security/account_security",'html!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"
    ],
    function(avalon,$,css,html, x, data_center, layer) {
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "account_security",
                //身份判断
                user_type:'',
                //手机号码是否存在
                phone:'',
                //邮箱是否存在
                email:'',
                //用户名是否设置:
                username_exist:'',
                cbs:function(){
                    var self = this;
                    data_center.uin(function(data){
                        var user = JSON.parse(data.data.user);
                        //身份：0：管理员；1：教师；2：学生；3：家长
                        self.user_type = data.data.user_type;
                        self.phone = user.phone;
                        var email = data.data.email;
                        if(email != undefined){
                            self.email = email;
                        }
                        self.username_exist = user.u_defn_name;
                    });
                },
                //手机号设置
                phone_up:function(num){
                    window.location = '#update_phone?num='+num;
                },
                //用户名设置
                username_set:function(){
                    window.location = '#username_set';
                },
                //密码修改
                pwd_up:function(){
                    window.location = '#update_password';
                },
                //邮箱绑定
                mailbox_set:function(num){
                    window.location = '#bind_mailbox?num='+num+'&email='+this.email;
                },
                //家长信息
                parent_insure:function(){
                    window.location = '#parentInformation';
                },
            });
            vm.cbs();
            return vm;
        }
        return {
            view: html,
            define: avalon_define
        }
    })