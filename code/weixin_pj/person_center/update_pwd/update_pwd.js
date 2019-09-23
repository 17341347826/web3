/**
 * Created by Administrator on 2018/8/3.
 */
define([C.CLF('avalon.js'),"jquery",C.CLF("rsa_public_key.js"),
        C.CLF("bin/jsencrypt.js"),
        C.Co('weixin_pj', 'person_center/update_pwd/update_pwd','html!'),
        C.Co('weixin_pj', 'person_center/update_pwd/update_pwd','css!'),
        C.CMF("router.js"),
         C.CMF("data_center.js"), "jquery-weui"
    ],
    function(avalon,$,rsa_public_key,bin_jsencrypt, html,css, x, data_center,weui) {
        //修改密码
        var api_update_password=api.api+"base/baseUser/updpwd";
        var avalon_define = function() {
            var vm = avalon.define({
                $id: "update_pwd",
                span_num:0,
                sure_new_pwd:"",
                old_pwd:"",
                new_pwd:"",
                msgNull:function () {
                    this.span_num=0;
                },
                save_click:function () {
                    var reg=/^\w{6,16}$/;
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
                        $.alert(msg);
                    }
                },
                complete_update_password:function (data) {
                    // $.alert("修改密码成功");
                    this.old_pwd='';
                    this.new_pwd='';
                    this.sure_new_pwd='';
                //    修改成功，页面跳转:
                     //0：管理员；1：教师；2：学生；3：家长
                    var user_type = sessionStorage.getItem("user_type");
                    //根据highest_level:1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                    var highest_level = sessionStorage.getItem("highest_level");
                    //用户基本信息
                    var user = JSON.parse(sessionStorage.getItem("user"));
                    if (user_type == 3) {//家长
                        window.location.href = "#parent_home";
                    } else if (user_type == 1 && user.lead_class_list.length > 0) {//班主任
                        window.location.href = "#teacher_home";
                    } else if (user_type == 2) {//学生
                        window.location.href = "#student_home";
                    }else if(highest_level == 2){//市
                        window.location.href = "#city_home";
                    }else if(highest_level == 3){//区县
                        window.location.href = "#area_home";
                    }else if(highest_level == 4) {//校
                        window.location.href = "#school_home";
                    }
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