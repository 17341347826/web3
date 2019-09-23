/**
 * Created by Administrator on 2018/6/8.
 */
define(["jquery",
        C.CLF('avalon.js'),
        'layer',
        C.Co('weixin_pj', 'person_center/give_feedback/give_feedback','html!'),
        C.Co('weixin_pj', 'person_center/give_feedback/give_feedback','css!'),
        C.CMF("data_center.js"),'jquery-weui','swiper'
    ],
    function ($,avalon,layer, html,css, data_center,weui,swiper) {
        //意见反馈保存
        var api_feedback_save = api.api + 'GrowthRecordBag/wx_feed_back_save';
        var avalon_define = function () {
            var vm = avalon.define({
                $id: "give_feedback",
                //请求参数
                extend:{
                    //意见
                    yj:'',
                    //电话号码
                    dhhm:'',
                },
                //状态
                a1:false,
                a2:false,
                //提示信息
                msg:'',
                init:function(){

                },
                //文本校验
                text_check:function(){
                    var self = this;
                    var _txt = $('#opinion').val();
                    if(_txt.length<10 || _txt.length>200){
                        self.msg = '请输入10-200的文字';
                        self.a1 = false;
                    }else{
                        self.msg = '';
                        self.a1 = true;
                    }
                },
                //电话校验
                phone_check:function(){
                    var self = this;
                    var reg = /^((1(3|4|5|6|7|8|9)\d{9}))$/;
                    var _txt = $("#phone").val();
                    if (reg.test(_txt)) {
                        self.msg = "";
                        self.a2 = true;
                    } else {
                        self.msg = "请输入正确的手机号";
                        self.a2 = false;
                    }
                },
                //提交
                submit:function(){
                    // this.text_check();
                    // this.phone_check();
                    if(this.a1 && this.a2){
                        ajax_post(api_feedback_save,this.extend.$model,this);
                    }else if(this.a1 == false){
                        this.msg = '请输入10-200的文字';
                    }else if(this.a2 == false){
                        this.msg = "请输入正确的手机号";
                    }
                },
                //    页面切换
                menu_change:function(){
                    window.location = '#hot_issues';
                },
                on_request_complete: function (cmd, status, data, is_suc, msg) { /**/
                    if (is_suc) {
                        switch (cmd) {
                            case api_feedback_save:
                                this.complete_feedback_save(data);
                                break;

                        }
                    } else {
                        $.alert(msg)
                    }
                },
                complete_feedback_save:function(data){
                    $.alert( "提交成功，感谢您的反馈！");
                    this.extend.dhhm = '';
                    this.extend.yj = '';
                },
            });
            vm.$watch('onReady', function () {

            });
            vm.init();
            return vm;
        };
        return {
            view: html,
            define: avalon_define
        }
    });