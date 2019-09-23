/**
 * Created by Administrator on 2018/6/20.
 */
define([
        "jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('user', 'login_timeout_set/login_timeout_set', 'html!'),
        C.Co('user', 'login_timeout_set/login_timeout_set', 'css!'),
        C.CMF("data_center.js")
    ],
    function ($,avalon, layer,html, css, data_center) {
        //获取用户在线时长
        var api_get_online = api.user + 'baseUser/get_onlie_time';
        //设置用户在线时长
        var api_save_onlie = api.user + 'baseUser/save_onlie_time';
        var avalon_define = function (pmx) {
            var vm = avalon.define({
                $id: "login_timeout_set",
                //登陆者等级
                ident_level:"",
                //登陆者类别
                ident_type:'',
                //在线时长
                online_time:'',
                //提示信息
                msg:'',
                init: function () {
                   // user_type='1' 时才有值。1：省级；2：市州级；3：区县级；4：校级；5：年级；6：班主任或普通任课教师
                   this.ident_level = cloud.user_level();
                   //0：管理员；1：教师；2：学生；3：家长
                   this.ident_type = cloud.user_type();
                    ajax_post(api_get_online,{},this);
                },
                time_focus:function(){
                    var t = this.online_time;
                    if(t%1 != 0){
                        this.msg = '请输入正整数';
                    }
                },
                //保存
                save_time:function(){
                    //只有市管理员能够设置
                    if(this.ident_type != 0 || this.ident_level != 2){
                        layer.alert('登录安全超时只有市管理员能够设置', {
                            closeBtn: 0
                            ,anim: 4 //动画类型
                        });
                        return;
                    }
                    if(this.msg == '' && this.online_time>0){
                        var time = this.online_time*60;
                        ajax_post(api_save_onlie,{online_time:time},this);
                    }
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_get_online:
                                this.complete_get_online(data);
                                break;
                            case api_save_onlie:
                                this.complete_save_online(data);
                                break;
                        }
                    } else {
                        toastr.error(msg)
                    }
                },
                complete_get_online:function(data){
                    this.online_time = (data.data)/60;
                },
                complete_save_online:function(data){
                    toastr.success('设置成功！');
                },
            });
            vm.$watch('onReady', function () {
                this.init();

            });
            // vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });
