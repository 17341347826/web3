/**
 * Created by Administrator on 2018/8/15.
 */
define([C.CLF('avalon.js'),"jquery",
        C.Co("personal_center","username_set/username_set",'css!'),
        C.Co("personal_center","username_set/username_set",'html!'),
        C.CMF("router.js"),
        C.CMF("data_center.js"),
        "layer"
    ],
    function(avalon,$, css,html, x,data_center, layer) {
        //设置用户名
        var api_defn_username = api.user+'baseUser/upd_u_defn_name';
        var avalon_define = function(pmx) {
            var vm = avalon.define({
                $id: "username_set",
                //用户名错误提示
                username_msg:'',
                //用户名
                user_name:'',
                cbs:function(){
                    var self = this;
                    data_center.uin(function(data){

                    });
                },
                //用户名失去焦点
                username_blur:function(){
                    this.username_msg = '';
                    var txt = $('#username').val().trim();
                   if (txt == '') {
                      this.username_msg = '用户名不能为空';
                   }else if(txt.length<6 || txt.length>16){
                        this.username_msg = '用户名长度限制为6~16个字符';
                    }
                },
                //保存
                save_click:function () {
                    if(this.username_msg == '' && this.user_name != ''){
                        this.username_msg = '';
                            ajax_post(api_defn_username,{u_defn_name:this.user_name},this);
                    }else if(this.user_name == ''){
                        this.username_msg = '用户名不能为空';
                    }
                },
                on_request_complete: function(cmd, status, data, is_suc, msg) {
                    if (is_suc) {
                        switch (cmd) {
                            // 用户名设置
                            case api_defn_username:
                                this.complete_defn_username(data);
                                break;
                        }
                    } else {
                        toastr.error(msg);
                    }
                },
                //用户绑定手机号
                complete_defn_username:function (data) {
                    toastr.success("用户名设置成功！");
                    window.location = '#account_security';
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